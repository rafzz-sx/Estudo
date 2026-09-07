import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';
import { avaliarStreak } from '@/lib/gamificacao';

/**
 * POST /api/teoria/[id]/concluir
 * Marca um conteúdo teórico como estudado e concede XP — mas só na primeira
 * vez, para não virar um botão de farmar XP.
 */
const XP_POR_LEITURA = 25;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: jaLido } = await supabase
      .from('user_teoria_progresso')
      .select('concluido')
      .eq('user_id', user.id)
      .eq('teoria_id', id)
      .maybeSingle();

    const primeiraVez = !jaLido?.concluido;

    await supabase.from('user_teoria_progresso').upsert(
      {
        user_id: user.id,
        teoria_id: id,
        concluido: true,
        visto_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,teoria_id' }
    );

    if (!primeiraVez) {
      return NextResponse.json({
        success: true,
        data: { xp_ganho: 0, ja_concluido: true },
      });
    }

    const { data: dados } = await supabase
      .from('users')
      .select('xp_total, streak_dias, maior_streak, ultimo_dia_estudado, escudos_streak, escudo_recarregado_em, escudos_usados_total')
      .eq('id', user.id)
      .single();

    const xpAntes = dados?.xp_total ?? 0;
    const xpDepois = xpAntes + XP_POR_LEITURA;
    const nivelAntes = calcularNivel(xpAntes);
    const nivel = calcularNivel(xpDepois);

    // Ler teoria é estudar: conta para a corrente de dias como responder
    // questão e como o cronômetro. Antes só a leitura ficava de fora, e
    // quem passava o dia estudando teoria perdia o streak.
    const hoje = new Date().toISOString().slice(0, 10);
    const resStreak = avaliarStreak({
      ultimoDiaEstudado: dados?.ultimo_dia_estudado ?? null,
      hoje,
      streakAtual: dados?.streak_dias ?? 0,
      escudos: dados?.escudos_streak,
      recarregadoEm: dados?.escudo_recarregado_em,
    });
    const streak = resStreak.streak;

    await supabase
      .from('users')
      .update({
        xp_total: xpDepois,
        nivel_atual: nivel.nivel,
        streak_dias: streak,
        maior_streak: Math.max(dados?.maior_streak ?? 0, streak),
        escudos_streak: resStreak.escudos,
        escudo_recarregado_em: resStreak.recarregado_em,
        escudos_usados_total:
          (dados?.escudos_usados_total ?? 0) + (resStreak.usou_escudo ? 1 : 0),
        ultimo_dia_estudado: hoje,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      data: {
        xp_ganho: XP_POR_LEITURA,
        xp_total: xpDepois,
        nivel,
        subiu_nivel: nivel.nivel > nivelAntes.nivel,
        streak_dias: streak,
      },
    });
  } catch (error) {
    console.error('POST /api/teoria/[id]/concluir error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar leitura' },
      { status: 500 }
    );
  }
}
