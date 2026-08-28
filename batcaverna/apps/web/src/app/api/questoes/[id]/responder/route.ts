import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';
import { calcularBonusCombo } from '@batcaverna/utils';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/questoes/[id]/responder
// Body: { resposta_dada: string, tempo_gasto_segundos: number, combo_atual: number }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questaoId } = await params;
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { resposta_dada, tempo_gasto_segundos = 0, combo_atual = 0 } = body;

    if (!resposta_dada) {
      return NextResponse.json({ success: false, error: 'Resposta não fornecida' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Buscar questão
    const { data: questao, error: qErr } = await supabase
      .from('questoes')
      .select('id, resposta_correta, explicacao, bizu_relacionado_id, dificuldade')
      .eq('id', questaoId)
      .single();

    if (qErr || !questao) {
      return NextResponse.json({ success: false, error: 'Questão não encontrada' }, { status: 404 });
    }

    const correta = questao.resposta_correta.trim().toUpperCase() === resposta_dada.trim().toUpperCase();
    const novoCombo = correta ? combo_atual + 1 : 0;

    // Base XP por questão correta: Fácil (10 XP), Médio (15 XP), Difícil (25 XP)
    const baseXP = questao.dificuldade === 'facil' ? 10 : questao.dificuldade === 'medio' ? 15 : 25;
    const comboMultiplier = calcularBonusCombo(novoCombo);
    const xpGanho = correta ? Math.round(baseXP * comboMultiplier) : 2; // 2 XP de consolação por tentar

    // 2. Registrar resposta
    await supabase.from('user_questao_respostas').insert({
      user_id: userId,
      questao_id: questaoId,
      resposta_dada: resposta_dada.toUpperCase(),
      correta,
      tempo_gasto_segundos,
      combo_no_momento: novoCombo,
    });

    // 3. Atualizar dados do usuário
    const { data: user } = await supabase
      .from('users')
      .select('xp_total, maior_combo_pessoal')
      .eq('id', userId)
      .single();

    if (user) {
      const maiorCombo = Math.max(user.maior_combo_pessoal || 0, novoCombo);
      const novoXp = (user.xp_total || 0) + xpGanho;

      await supabase
        .from('users')
        .update({
          xp_total: novoXp,
          maior_combo_pessoal: maiorCombo,
          ultimo_dia_estudado: new Date().toISOString().split('T')[0],
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        correta,
        resposta_correta: questao.resposta_correta,
        explicacao: questao.explicacao,
        bizu_relacionado_id: questao.bizu_relacionado_id,
        xp_ganho: xpGanho,
        novo_combo: novoCombo,
        multiplicador: comboMultiplier,
      },
    });
  } catch (error) {
    console.error('POST /api/questoes/[id]/responder error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao processar resposta' }, { status: 500 });
  }
}
