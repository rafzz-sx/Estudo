import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/concursos/[sigla]/assuntos
 *
 * Todos os assuntos que já caíram no concurso, agrupados por matéria e
 * ordenados por frequência.
 *
 * A lista sai das PROVAS OFICIAIS já importadas, não de uma transcrição do
 * conteúdo programático. A diferença importa: o edital lista o que *pode*
 * cair e trata tudo como igual; a prova mostra o que *cai* e quanto. Um
 * aluno que sabe que Geometria Plana apareceu 79 vezes e Números Complexos
 * 4 sabe onde investir a próxima hora.
 *
 * Quando o aluno está logado, cada assunto também traz o desempenho dele
 * ali — é o que transforma a lista em plano de estudo.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sigla: string }> }
) {
  try {
    const { sigla } = await params;
    const supabase = createServerSupabaseClient();

    const { data: concurso } = await supabase
      .from('concursos')
      .select('id, sigla, nome, emoji, cor_tema, edital_url, edital_ano, etapas')
      .ilike('sigla', sigla)
      .maybeSingle();

    if (!concurso) {
      return NextResponse.json(
        { success: false, error: 'Concurso não encontrado' },
        { status: 404 }
      );
    }

    const { data: linhas, error } = await supabase
      .from('concurso_assuntos_cobrados')
      .select(
        `materia_id, materia, materia_emoji, assunto_id, assunto,
         total_questoes, primeiro_ano, ultimo_ano, anos_distintos,
         respostas, acertos`
      )
      .eq('concurso_id', concurso.id);

    if (error) throw error;

    // ─── Desempenho do próprio aluno por assunto ────────────
    const user = await getAuthUserFromRequest(req);
    const meuDesempenho = new Map<string, { total: number; acertos: number }>();

    if (user) {
      // Só as respostas deste concurso: o mesmo assunto pode existir em
      // vários, e misturar daria um número que não quer dizer nada.
      const { data: respostas } = await supabase
        .from('user_questao_respostas')
        .select('correta, questoes!inner(assunto_id, concurso_id)')
        .eq('user_id', user.id)
        .eq('questoes.concurso_id', concurso.id)
        .limit(5000);

      for (const r of respostas ?? []) {
        const q = r.questoes as unknown as { assunto_id: string | null };
        if (!q?.assunto_id) continue;
        const atual = meuDesempenho.get(q.assunto_id) ?? { total: 0, acertos: 0 };
        atual.total += 1;
        if (r.correta) atual.acertos += 1;
        meuDesempenho.set(q.assunto_id, atual);
      }
    }

    // ─── Agrupa por matéria ─────────────────────────────────
    interface AssuntoSaida {
      id: string | null;
      nome: string;
      total_questoes: number;
      primeiro_ano: number | null;
      ultimo_ano: number | null;
      anos_distintos: number;
      taxa_comunidade: number | null;
      meu_total: number;
      meus_acertos: number;
      minha_taxa: number | null;
    }

    const porMateria = new Map<
      string,
      {
        id: string | null;
        nome: string;
        emoji: string | null;
        total_questoes: number;
        assuntos: AssuntoSaida[];
      }
    >();

    for (const l of linhas ?? []) {
      const chave = l.materia ?? 'Sem matéria';
      const grupo =
        porMateria.get(chave) ??
        {
          id: l.materia_id,
          nome: chave,
          emoji: l.materia_emoji,
          total_questoes: 0,
          assuntos: [] as AssuntoSaida[],
        };

      const meu = l.assunto_id ? meuDesempenho.get(l.assunto_id) : undefined;

      grupo.total_questoes += l.total_questoes;
      grupo.assuntos.push({
        id: l.assunto_id,
        nome: l.assunto,
        total_questoes: l.total_questoes,
        primeiro_ano: l.primeiro_ano,
        ultimo_ano: l.ultimo_ano,
        anos_distintos: l.anos_distintos,
        taxa_comunidade:
          l.respostas > 0 ? Math.round((l.acertos / l.respostas) * 100) : null,
        meu_total: meu?.total ?? 0,
        meus_acertos: meu?.acertos ?? 0,
        minha_taxa: meu?.total
          ? Math.round((meu.acertos / meu.total) * 100)
          : null,
      });

      porMateria.set(chave, grupo);
    }

    const materias = [...porMateria.values()]
      .map((m) => ({
        ...m,
        assuntos: m.assuntos.sort(
          (a, b) => b.total_questoes - a.total_questoes
        ),
      }))
      .sort((a, b) => b.total_questoes - a.total_questoes);

    const totalQuestoes = materias.reduce((s, m) => s + m.total_questoes, 0);
    const totalAssuntos = materias.reduce((s, m) => s + m.assuntos.length, 0);

    return NextResponse.json({
      success: true,
      data: {
        concurso,
        materias,
        resumo: {
          total_questoes: totalQuestoes,
          total_assuntos: totalAssuntos,
          total_materias: materias.length,
          logado: !!user,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/concursos/[sigla]/assuntos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar os assuntos.' },
      { status: 500 }
    );
  }
}
