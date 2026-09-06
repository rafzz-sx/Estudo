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

    const { data: questao, error: qErr } = await supabase
      .from('questoes')
      .select(
        `id, resposta_correta, anulada, explicacao, explicacao_alternativas,
         resolucao_passos, figura_descricao, figura_svg, precisa_resolucao,
         dificuldade, materia_id, concurso_id, bizu_relacionado_id`
      )
      .eq('id', questaoId)
      .single();

    if (qErr || !questao) {
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
      tempoGasto
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
