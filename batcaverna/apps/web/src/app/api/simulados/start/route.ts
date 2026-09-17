import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';
import { errosEmAberto } from '@/lib/diagnostico';
import { distribuicaoDaProva, repartirVagas } from '@/lib/distribuicao-prova';

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
  // Refazer o que já errou. Mais tempo por questão de propósito: aqui o
  // objetivo não é treinar velocidade, é o assunto finalmente grudar.
  erros: { questoes: 20, minutos: 50 },
  // Prova no formato da banca: quantidade e duração vêm do próprio concurso.
  oficial: { questoes: 45, minutos: 180 },
};

/**
 * Formato real de cada prova.
 *
 * Um simulado de 45 questões genéricas não treina a prova da EEAR: são 60
 * questões em 4 horas, com peso diferente por matéria. Treinar no formato
 * errado ensina um ritmo que não serve no dia.
 *
 * Os números abaixo são os do formato consolidado de cada banca. Quando o
 * concurso não está aqui, o modo "oficial" cai no preset genérico — melhor
 * que inventar um formato.
 */
const FORMATO_OFICIAL: Record<string, { questoes: number; minutos: number }> = {
  EEAR: { questoes: 60, minutos: 240 },
  ESA: { questoes: 50, minutos: 240 },
  EPCAR: { questoes: 60, minutos: 240 },
  CN: { questoes: 60, minutos: 240 },
  EFOMM: { questoes: 40, minutos: 240 },
  EAM: { questoes: 50, minutos: 240 },
  ESPCEX: { questoes: 60, minutos: 240 },
  ENEM: { questoes: 45, minutos: 270 },
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

    // No modo "oficial" quem manda é o formato da banca, não o que o
    // cliente pediu: o valor do treino está justamente em ser o formato real.
    const formato =
      tipo === 'oficial'
        ? FORMATO_OFICIAL[String(body?.concurso ?? '').toUpperCase()] ?? preset
        : null;

    const quantidade = formato
      ? formato.questoes
      : Math.min(100, Math.max(5, Number(body?.total_questoes) || preset.questoes));

    const duracaoMinutos = formato
      ? formato.minutos
      : Math.max(5, Number(body?.duracao_minutos) || preset.minutos);

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

    // ─── Modo "erros": o pool é o que o aluno já errou ───────
    // Não sorteia sobre o banco: sorteia sobre a lista de questões cuja
    // ÚLTIMA resposta continua errada. A regra mora em `diagnostico.ts`,
    // a mesma de /caderno e do painel — três telas, uma definição.
    let idsErrados: string[] | null = null;
    if (tipo === 'erros') {
      const erros = await errosEmAberto(supabase, user.id, concursoId);
      if (erros.total < 5) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Você ainda não tem erros suficientes para montar este treino. Resolva mais questões primeiro.',
          },
          { status: 400 }
        );
      }
      idsErrados = erros.ids;
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

    const { count } = idsErrados
      ? { count: idsErrados.length }
      : await filtrar(
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

    // ─── Formato da banca: reparte por matéria ───────────────
    //
    // "Formato da banca" acertava a QUANTIDADE e a DURAÇÃO e sorteava
    // uniformemente do concurso inteiro. Nenhuma banca distribui
    // uniformemente: a EEAR cobra Matemática e Física em proporções
    // específicas, e um sorteio uniforme entrega uma prova que não se parece
    // com a prova. O aluno treinava para uma distribuição que não existe.
    //
    // Só vale para 'oficial' sem recorte: escolher uma matéria ou um ano é o
    // aluno dizendo que NÃO quer o formato da banca.
    let ids: string[] = [];
    let distribuicaoUsada: { materia: string; questoes: number }[] | null = null;

    if (tipo === 'oficial' && !idsErrados && !materiaId && !ano) {
      const fatias = await distribuicaoDaProva(supabase, concursoId);
      const vagas = repartirVagas(quantidade, fatias);

      if (vagas.size > 0) {
        const porMateria = await Promise.all(
          [...vagas.entries()].map(async ([mid, quantas]) => {
            const { data } = await supabase
              .from('questoes')
              .select('id')
              .eq('concurso_id', concursoId)
              .eq('ativa', true)
              .eq('materia_id', mid)
              .limit(Math.min(quantas * 6, 400));

            return (data ?? [])
              .map((q) => q.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, quantas);
          })
        );

        ids = porMateria.flat().sort(() => Math.random() - 0.5);

        const nomePorId = new Map(fatias.map((f) => [f.materia_id, f.nome]));
        distribuicaoUsada = [...vagas.entries()]
          .map(([mid, n]) => ({ materia: nomePorId.get(mid) ?? 'Outros', questoes: n }))
          .sort((a, b) => b.questoes - a.questoes);
      }
    }

    // ─── Sorteio simples (todos os outros modos) ─────────────
    // Puxa uma janela aleatória maior que o necessário e embaralha dentro
    // dela: dá variedade real sem carregar as milhares de linhas.
    if (ids.length === 0) {
      const janela = Math.min(count, quantidade * 5);
      const offsetMax = Math.max(0, count - janela);
      const offset = Math.floor(Math.random() * (offsetMax + 1));

      const pool = idsErrados
        ? idsErrados.map((id) => ({ id }))
        : (
            await filtrar(supabase.from('questoes').select('id')).range(
              offset,
              offset + janela - 1
            )
          ).data ?? [];

      ids = pool
        .map((q: any) => q.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(quantidade, pool.length));
    }

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
        // Quantas questões de cada matéria a prova recebeu, quando ela foi
        // montada no formato da banca. A tela mostra isso antes de começar:
        // saber que caem 24 de Matemática e 6 de Inglês faz parte de treinar
        // no formato certo. `null` nos outros modos.
        distribuicao: distribuicaoUsada,
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
