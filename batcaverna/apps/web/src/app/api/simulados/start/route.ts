import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';

/**
 * POST /api/simulados/start
 *
 * Body:
 *   concurso_id | concurso (sigla)   — obrigatório (a tabela exige o vínculo)
 *   tipo        rapido | completo | materia | personalizado
 *   total_questoes, duracao_minutos, materia_id, ano
 *
 * Correções em relação à versão anterior:
 *   • O sorteio buscava só as 100 primeiras linhas e embaralhava — com 3 mil
 *     questões, o mesmo punhado caía sempre. Agora sorteia por deslocamento
 *     aleatório sobre a contagem real.
 *   • `concurso_id` é NOT NULL no schema; mandar null quebrava o "todos".
 *   • O gabarito nunca sai daqui: só a rota de finalizar tem acesso a ele.
 */

const PRESETS: Record<string, { questoes: number; minutos: number }> = {
  rapido: { questoes: 10, minutos: 20 },
  materia: { questoes: 20, minutos: 40 },
  completo: { questoes: 45, minutos: 150 },
  personalizado: { questoes: 20, minutos: 45 },
};

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tipo: string = PRESETS[body?.tipo] ? body.tipo : 'personalizado';
    const preset = PRESETS[tipo];

    const quantidade = Math.min(
      100,
      Math.max(5, Number(body?.total_questoes) || preset.questoes)
    );
    const duracaoMinutos =
      Math.max(5, Number(body?.duracao_minutos) || preset.minutos);

    const supabase = createServerSupabaseClient();

    // ─── Resolve o concurso ──────────────────────────────────
    let concursoId: string | null = body?.concurso_id ?? null;
    if (!concursoId && body?.concurso) {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', String(body.concurso))
        .maybeSingle();
      concursoId = data?.id ?? null;
    }

    if (!concursoId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Escolha um concurso para o simulado — a prova é montada no formato da banca.',
        },
        { status: 400 }
      );
    }

    // ─── Sorteio sobre o pool inteiro ────────────────────────
    // Validados antes de virar filtro: `materia_id` chega do cliente e um
    // texto solto no lugar de um UUID faz o PostgREST estourar 22P02.
    const materiaId = uuidOuNulo(body?.materia_id);
    const anoNum = Number(body?.ano);
    const ano = Number.isInteger(anoNum) && anoNum > 1990 && anoNum < 2100
      ? anoNum
      : null;

    const filtrar = (q: any) => {
      let r = q.eq('concurso_id', concursoId).eq('ativa', true);
      if (materiaId) r = r.eq('materia_id', materiaId);
      if (ano) r = r.eq('ano', ano);
      return r;
    };

    const { count } = await filtrar(
      supabase.from('questoes').select('id', { count: 'exact', head: true })
    );

    if (!count || count < 5) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Ainda não há questões suficientes cadastradas para montar este simulado.',
        },
        { status: 400 }
      );
    }

    // Puxa uma janela aleatória maior que o necessário e embaralha dentro
    // dela: dá variedade real sem carregar as milhares de linhas.
    const janela = Math.min(count, quantidade * 5);
    const offsetMax = Math.max(0, count - janela);
    const offset = Math.floor(Math.random() * (offsetMax + 1));

    const { data: pool } = await filtrar(
      supabase.from('questoes').select('id')
    ).range(offset, offset + janela - 1);

    const ids = (pool ?? [])
      .map((q) => q.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(quantidade, pool?.length ?? 0));

    // ─── Cria o simulado ─────────────────────────────────────
    const { data: simulado, error: sErr } = await supabase
      .from('simulados')
      .insert({
        user_id: user.id,
        concurso_id: concursoId,
        materia_id: materiaId,
        tipo,
        questoes_ids: ids,
        total_questoes: ids.length,
        duracao_minutos: duracaoMinutos,
        iniciado_em: new Date().toISOString(),
      })
      .select('id, total_questoes, duracao_minutos, iniciado_em, tipo')
      .single();

    if (sErr) throw sErr;

    // ─── Questões SEM gabarito ───────────────────────────────
    const { data: questoes } = await supabase
      .from('questoes')
      .select(
        `id, texto_base, enunciado, alternativas, ano, banca, dificuldade,
         figura_descricao, figura_svg, numero_original,
         concursos (sigla, emoji), materias (nome, icone_emoji), assuntos (nome)`
      )
      .in('id', ids);

    // Preserva a ordem sorteada (o .in() volta na ordem do banco).
    const porId = new Map((questoes ?? []).map((q) => [q.id, q]));
    const ordenadas = ids.map((id) => porId.get(id)).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        simulado_id: simulado.id,
        tipo: simulado.tipo,
        total_questoes: simulado.total_questoes,
        duracao_minutos: simulado.duracao_minutos,
        iniciado_em: simulado.iniciado_em,
        questoes: ordenadas,
      },
    });
  } catch (error) {
    console.error('POST /api/simulados/start error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar simulado' },
      { status: 500 }
    );
  }
}
