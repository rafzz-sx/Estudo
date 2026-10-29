import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';
import { errosEmAberto } from '@/lib/diagnostico';
import { distribuicaoDaProva, repartirVagas } from '@/lib/distribuicao-prova';
import {
  obterFormatoConcurso,
  type FormatoConcursoReal,
} from '@/lib/formatos-concursos';
import {
  selecionarQuestoesBalanceadas,
  type ModoDificuldade,
  type ProporcaoDificuldade,
  type VagasDificuldade,
} from '@/lib/balanceamento-simulado';

/**
 * POST /api/simulados/start
 *
 * Gera um simulado cronometrado oficial ou personalizado com balanceamento
 * real de matérias e dificuldades.
 *
 * O gabarito e as explicações NUNCA saem daqui — o aluno realiza a prova sob
 * condições reais e só acessa o resultado detalhado após a entrega.
 */

const PRESETS: Record<string, { questoes: number; minutos: number }> = {
  rapido: { questoes: 10, minutos: 20 },
  materia: { questoes: 20, minutos: 40 },
  completo: { questoes: 45, minutos: 150 },
  personalizado: { questoes: 20, minutos: 45 },
  erros: { questoes: 20, minutos: 50 },
  oficial: { questoes: 50, minutos: 240 },
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

    const supabase = createServerSupabaseClient();

    // ─── 1. Resolve o Concurso ────────────────────────────────
    let concursoId: string | null = body?.concurso_id ?? null;
    let concursoSigla: string = String(body?.concurso ?? '').trim().toUpperCase();

    if (!concursoId && concursoSigla) {
      const { data } = await supabase
        .from('concursos')
        .select('id, sigla, nome')
        .ilike('sigla', concursoSigla)
        .maybeSingle();

      if (data) {
        concursoId = data.id;
        concursoSigla = data.sigla;
      }
    } else if (concursoId && !concursoSigla) {
      const { data } = await supabase
        .from('concursos')
        .select('sigla')
        .eq('id', concursoId)
        .maybeSingle();

      if (data) concursoSigla = data.sigla;
    }

    if (!concursoId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Escolha um concurso para o simulado — a prova é montada no formato real da banca.',
        },
        { status: 400 }
      );
    }

    // ─── 2. Formato Real e Quantidade / Tempo ────────────────
    const variacaoId = body?.variacao_id ? String(body.variacao_id) : null;
    const formatoOficial: FormatoConcursoReal = obterFormatoConcurso(
      concursoSigla,
      variacaoId
    );

    const quantidadeDesejada =
      tipo === 'oficial'
        ? formatoOficial.questoes
        : Math.min(180, Math.max(5, Number(body?.total_questoes) || preset.questoes));

    const duracaoMinutos =
      tipo === 'oficial'
        ? formatoOficial.minutos
        : Math.max(5, Number(body?.duracao_minutos) || preset.minutos);

    // ─── 3. Modo de Dificuldade ──────────────────────────────
    const modoDificuldade: ModoDificuldade = [
      'balanceado',
      'facil',
      'medio',
      'dificil',
      'custom',
    ].includes(body?.dificuldade_modo)
      ? body.dificuldade_modo
      : 'balanceado';

    const customProporcao: Partial<ProporcaoDificuldade> | undefined =
      body?.dificuldade_proporcao && typeof body.dificuldade_proporcao === 'object'
        ? {
            facil: Number(body.dificuldade_proporcao.facil) || 0,
            medio: Number(body.dificuldade_proporcao.medio) || 0,
            dificil: Number(body.dificuldade_proporcao.dificil) || 0,
          }
        : undefined;

    // ─── 4. Filtros Adicionais ───────────────────────────────
    const materiaId = uuidOuNulo(body?.materia_id);
    const anoNum = Number(body?.ano);
    const ano =
      Number.isInteger(anoNum) && anoNum > 1990 && anoNum < 2100 ? anoNum : null;

    // ─── 5. Modo "Erros em Aberto" ───────────────────────────
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

    // ─── 6. Verificação de Estoque Disponível ─────────────────
    const filtrarContagem = (q: any) => {
      let r = q.eq('concurso_id', concursoId).eq('ativa', true);
      if (materiaId) r = r.eq('materia_id', materiaId);
      if (ano) r = r.eq('ano', ano);
      return r;
    };

    const { count: totalDisponivel } = idsErrados
      ? { count: idsErrados.length }
      : await filtrarContagem(
          supabase.from('questoes').select('id', { count: 'exact', head: true })
        );

    if (!totalDisponivel || totalDisponivel < 5) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Ainda não há questões suficientes cadastradas para montar este simulado.',
        },
        { status: 400 }
      );
    }

    // Se o banco tiver menos questões que o formato ideal (ex: banca nova no sistema),
    // capamos suavemente no total disponível em vez de travar.
    const quantidadeFinal = Math.min(quantidadeDesejada, totalDisponivel);

    // ─── 7. Seleção de Questões com Matéria e Dificuldade ─────
    let ids: string[] = [];
    let distribuicaoMateriasUsada: { materia: string; questoes: number }[] | null = null;
    let distribuicaoDificuldadeUsada: VagasDificuldade = {
      facil: 0,
      medio: 0,
      dificil: 0,
    };

    if (tipo === 'erros' && idsErrados) {
      // No modo erros, sorteamos do pool de erros do próprio aluno
      ids = [...idsErrados]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(quantidadeFinal, idsErrados.length));
    } else if (tipo === 'oficial' && !materiaId && !ano) {
      // Modo oficial: repartição fatiada por matéria conforme edital/banco
      const fatias = await distribuicaoDaProva(supabase, concursoId);
      const vagasPorMateria = repartirVagas(quantidadeFinal, fatias);

      if (vagasPorMateria.size > 0) {
        const resultadoSelecao = await selecionarQuestoesBalanceadas(supabase, {
          concursoId,
          quantidadeTotal: quantidadeFinal,
          modoDificuldade,
          customProporcao,
          vagasPorMateria,
          ano,
        });

        ids = resultadoSelecao.ids;
        distribuicaoDificuldadeUsada = resultadoSelecao.distribuicaoDificuldade;

        const nomePorId = new Map(fatias.map((f) => [f.materia_id, f.nome]));
        distribuicaoMateriasUsada = [...vagasPorMateria.entries()]
          .map(([mid, n]) => ({ materia: nomePorId.get(mid) ?? 'Outros', questoes: n }))
          .sort((a, b) => b.questoes - a.questoes);
      }
    }

    // Fallback ou outros modos (rápido, completo, por matéria, personalizado)
    if (ids.length === 0 && !idsErrados) {
      const resultadoSelecao = await selecionarQuestoesBalanceadas(supabase, {
        concursoId,
        quantidadeTotal: quantidadeFinal,
        modoDificuldade,
        customProporcao,
        materiaId,
        ano,
      });

      ids = resultadoSelecao.ids;
      distribuicaoDificuldadeUsada = resultadoSelecao.distribuicaoDificuldade;
    }

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Não foi possível selecionar questões com os parâmetros escolhidos.',
        },
        { status: 400 }
      );
    }

    // ─── 8. Cria o Registro do Simulado ──────────────────────
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

    // ─── 9. Busca as Questões SEM Gabarito ────────────────────
    const { data: questoes } = await supabase
      .from('questoes')
      .select(
        `id, texto_base, enunciado, alternativas, ano, banca, dificuldade,
         figura_descricao, figura_svg, numero_original,
         concursos (sigla, emoji), materias (nome, icone_emoji), assuntos (nome)`
      )
      .in('id', ids);

    // Preserva a ordem aleatória definida pelo algoritmo
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
        distribuicao: distribuicaoMateriasUsada,
        distribuicao_dificuldade: distribuicaoDificuldadeUsada,
        formato_info: {
          sigla: formatoOficial.sigla,
          nome: formatoOficial.nome,
          descricao: formatoOficial.descricao,
          detalhesEdital: formatoOficial.detalhesEdital,
          temRedacaoNaProvaReal: formatoOficial.temRedacaoNaProvaReal,
          redacaoDescartada: formatoOficial.temRedacaoNaProvaReal,
          adaptadoEstoque: totalDisponivel < quantidadeDesejada,
        },
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
