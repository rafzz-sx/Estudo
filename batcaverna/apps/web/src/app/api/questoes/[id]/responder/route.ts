import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { registrarResposta } from '@/lib/gamificacao';

/**
 * POST /api/questoes/[id]/responder
 * Body: { resposta_dada: "B", tempo_gasto_segundos?: number }
 *
 * O combo NÃO vem mais do cliente. Ele é lido e gravado no banco, senão
 * bastava recarregar a página para zerar (ou forjar) a sequência.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questaoId } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const respostaDada: string | undefined = body?.resposta_dada;
    const tempoGasto: number = Number(body?.tempo_gasto_segundos) || 0;

    if (!respostaDada || !/^[A-Ea-e]$/.test(respostaDada.trim())) {
      return NextResponse.json(
        { success: false, error: 'Resposta inválida' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ─── BUSCA PARALELA (1 único round-trip) ─────────────────────────────
    // Carrega a questão, o estado do usuário e o agendamento de revisão
    // simultaneamente, cortando 3 consultas sequenciais em 1 só.
    const [qRes, uRes, revRes] = await Promise.all([
      supabase
        .from('questoes')
        .select(
          `id, resposta_correta, anulada, explicacao, explicacao_alternativas,
           resolucao_passos, figura_descricao, figura_svg, precisa_resolucao,
           dificuldade, materia_id, concurso_id, bizu_relacionado_id,
           vezes_respondida, vezes_acertada`
        )
        .eq('id', questaoId)
        .single(),
      supabase
        .from('users')
        .select(
          `xp_total, nivel_atual, combo_atual, maior_combo_pessoal, streak_dias,
           maior_streak, ultimo_dia_estudado, total_questoes_respondidas,
           total_acertos, tempo_estudo_total_segundos,
           escudos_streak, escudo_recarregado_em, escudos_usados_total`
        )
        .eq('id', user.id)
        .single(),
      supabase
        .from('revisoes_agendadas')
        .select('id, etapa, agendada_para, total_erros, total_revisoes, ativa')
        .eq('user_id', user.id)
        .eq('questao_id', questaoId)
        .maybeSingle(),
    ]);

    const questao = qRes.data;
    if (qRes.error || !questao) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada' },
        { status: 404 }
      );
    }

    const resultado = await registrarResposta(
      supabase,
      user.id,
      questao,
      respostaDada,
      tempoGasto,
      {
        dadosUsuario: uRes.data,
        dadosRevisao: revRes.data,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...resultado,
        anulada: questao.anulada === true,
        bizu_relacionado_id: questao.bizu_relacionado_id,
      },
    });
  } catch (error) {
    console.error('POST /api/questoes/[id]/responder error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar resposta' },
      { status: 500 }
    );
  }
}
