import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/caderno-erros
 *
 * As questões que a pessoa errou, agrupadas por assunto — a tela onde a
 * aprovação é realmente construída.
 *
 * Uma questão só sai do caderno quando a pessoa acerta ela depois (ou marca
 * manualmente como resolvida). Errar e nunca mais voltar é o padrão que
 * este espaço existe para quebrar.
 *
 * Filtros: concurso, materia, resolvidas=1|0, agrupar=assunto|materia
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();

    // ─── Última resposta de cada questão ─────────────────────
    // Precisamos saber se o ÚLTIMO chute continua errado; uma questão
    // errada em janeiro e acertada em março já foi aprendida.
    const respostas: {
      questao_id: string;
      correta: boolean;
      respondido_em: string;
    }[] = [];

    const PAGINA = 1000;
    for (let inicio = 0; inicio < 20000; inicio += PAGINA) {
      const { data } = await supabase
        .from('user_questao_respostas')
        .select('questao_id, correta, respondido_em')
        .eq('user_id', user.id)
        .order('respondido_em', { ascending: false })
        .range(inicio, inicio + PAGINA - 1);

      if (!data?.length) break;
      respostas.push(...data);
      if (data.length < PAGINA) break;
    }

    const ultima = new Map<string, { correta: boolean; em: string; erros: number }>();
    for (const r of respostas) {
      const atual = ultima.get(r.questao_id);
      if (!atual) {
        // A lista veio em ordem decrescente: o primeiro é o mais recente.
        ultima.set(r.questao_id, {
          correta: r.correta,
          em: r.respondido_em,
          erros: r.correta ? 0 : 1,
        });
      } else if (!r.correta) {
        atual.erros += 1;
      }
    }

    const idsErradas = [...ultima.entries()]
      .filter(([, v]) => !v.correta)
      .map(([id]) => id);

    if (!idsErradas.length) {
      return NextResponse.json({
        success: true,
        data: { grupos: [], total: 0, resolvidas: 0, taxa_recuperacao: 0 },
      });
    }

    // ─── Anotações e status ──────────────────────────────────
    const { data: notas } = await supabase
      .from('user_questao_notas')
      .select('questao_id, anotacao, resolvida')
      .eq('user_id', user.id);

    const notaPorId = new Map((notas ?? []).map((n) => [n.questao_id, n]));

    const mostrarResolvidas = searchParams.get('resolvidas') === '1';
    const visiveis = idsErradas.filter((id) => {
      const resolvida = notaPorId.get(id)?.resolvida ?? false;
      return mostrarResolvidas ? resolvida : !resolvida;
    });

    if (!visiveis.length) {
      return NextResponse.json({
        success: true,
        data: {
          grupos: [],
          total: 0,
          resolvidas: idsErradas.length - visiveis.length,
          taxa_recuperacao: 0,
        },
      });
    }

    // ─── Questões ────────────────────────────────────────────
    const questoes: any[] = [];
    for (let i = 0; i < visiveis.length; i += 200) {
      const { data } = await supabase
        .from('questoes')
        .select(
          `id, texto_base, enunciado, alternativas, resposta_correta, explicacao,
           explicacao_alternativas, resolucao_passos, figura_descricao,
           figura_svg, ano, dificuldade, precisa_resolucao,
           concursos (sigla, emoji, cor_tema),
           materias (id, nome, icone_emoji),
           assuntos (id, nome)`
        )
        .in('id', visiveis.slice(i, i + 200));
      if (data) questoes.push(...data);
    }

    // ─── Filtros ─────────────────────────────────────────────
    const filtroConcurso = searchParams.get('concurso');
    const filtroMateria = searchParams.get('materia');

    const filtradas = questoes.filter((q) => {
      if (
        filtroConcurso &&
        filtroConcurso !== 'todos' &&
        q.concursos?.sigla?.toLowerCase() !== filtroConcurso.toLowerCase()
      ) {
        return false;
      }
      if (
        filtroMateria &&
        filtroMateria !== 'todas' &&
        q.materias?.nome?.toLowerCase() !== filtroMateria.toLowerCase()
      ) {
        return false;
      }
      return true;
    });

    // ─── Agrupamento ─────────────────────────────────────────
    const agruparPor = searchParams.get('agrupar') === 'materia' ? 'materia' : 'assunto';

    const grupos = new Map<
      string,
      { chave: string; materia: string; emoji: string; questoes: any[] }
    >();

    for (const q of filtradas) {
      const chave =
        agruparPor === 'materia'
          ? q.materias?.nome ?? 'Sem matéria'
          : q.assuntos?.nome ?? 'Sem assunto';

      const grupo = grupos.get(chave) ?? {
        chave,
        materia: q.materias?.nome ?? '—',
        emoji: q.materias?.icone_emoji ?? '📚',
        questoes: [],
      };

      grupo.questoes.push({
        ...q,
        erros: ultima.get(q.id)?.erros ?? 1,
        errada_em: ultima.get(q.id)?.em ?? null,
        anotacao: notaPorId.get(q.id)?.anotacao ?? null,
        resolvida: notaPorId.get(q.id)?.resolvida ?? false,
      });

      grupos.set(chave, grupo);
    }

    const lista = [...grupos.values()].sort(
      (a, b) => b.questoes.length - a.questoes.length
    );

    // Taxa de recuperação: das que errou algum dia, quantas já acertou depois
    const totalJaErradas = [...ultima.values()].filter((v) => v.erros > 0).length;
    const recuperadas = totalJaErradas - idsErradas.length;

    return NextResponse.json({
      success: true,
      data: {
        grupos: lista,
        total: filtradas.length,
        resolvidas: idsErradas.length - visiveis.length,
        recuperadas,
        taxa_recuperacao: totalJaErradas
          ? Number(((recuperadas / totalJaErradas) * 100).toFixed(1))
          : 0,
      },
    });
  } catch (error) {
    console.error('GET /api/caderno-erros error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar o caderno de erros' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/caderno-erros
 * Body: { questao_id, anotacao?, resolvida? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const questaoId = String(body?.questao_id ?? '');
    if (!questaoId) {
      return NextResponse.json(
        { success: false, error: 'Informe a questão.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const patch: Record<string, unknown> = {
      user_id: user.id,
      questao_id: questaoId,
      atualizado_em: new Date().toISOString(),
    };

    if (body.anotacao !== undefined) {
      patch.anotacao = String(body.anotacao).slice(0, 4000) || null;
    }
    if (body.resolvida !== undefined) {
      patch.resolvida = !!body.resolvida;
      patch.resolvida_em = body.resolvida ? new Date().toISOString() : null;
    }

    await supabase
      .from('user_questao_notas')
      .upsert(patch, { onConflict: 'user_id,questao_id' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/caderno-erros error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar a anotação' },
      { status: 500 }
    );
  }
}
