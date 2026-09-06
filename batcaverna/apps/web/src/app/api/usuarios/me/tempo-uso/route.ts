import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * Tempo de uso acumulado da plataforma e convite de feedback.
 *
 * O tempo é TOTAL, não contínuo: soma sessões curtas ao longo de dias. O
 * convite aparece ao cruzar 1h e depois 3h, e respeita quem pediu para
 * adiar ou nunca mais ver.
 */
const MARCOS_HORAS = [1, 3, 10, 25];

/** GET — quanto tempo já foi usado e se é hora de pedir feedback. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data } = await supabase
      .from('user_tempo_uso')
      .select('segundos_totais, ultimo_marco_horas, nunca_mais, adiado_ate')
      .eq('user_id', user.id)
      .maybeSingle();

    const segundos = data?.segundos_totais ?? 0;
    const horas = segundos / 3600;
    const ultimoMarco = data?.ultimo_marco_horas ?? 0;

    const adiado =
      data?.adiado_ate && new Date(data.adiado_ate) > new Date();

    // O próximo marco ainda não celebrado que já foi ultrapassado.
    const marcoPendente = MARCOS_HORAS.find(
      (h) => horas >= h && h > ultimoMarco
    );

    return NextResponse.json({
      success: true,
      data: {
        segundos_totais: segundos,
        horas: Number(horas.toFixed(2)),
        pedir_feedback:
          !!marcoPendente && !data?.nunca_mais && !adiado,
        marco_horas: marcoPendente ?? null,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/tempo-uso error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao consultar tempo de uso' },
      { status: 500 }
    );
  }
}

/** POST — soma um intervalo de uso (heartbeat da própria interface). */
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
    // Teto de 5 minutos por chamada: impede que uma aba esquecida (ou um
    // cliente adulterado) injete horas de uma vez.
    const incremento = Math.max(0, Math.min(300, Number(body?.segundos) || 0));

    const supabase = createServerSupabaseClient();

    const { data: atual } = await supabase
      .from('user_tempo_uso')
      .select('segundos_totais')
      .eq('user_id', user.id)
      .maybeSingle();

    const total = (atual?.segundos_totais ?? 0) + incremento;

    await supabase.from('user_tempo_uso').upsert(
      {
        user_id: user.id,
        segundos_totais: total,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    return NextResponse.json({
      success: true,
      data: { segundos_totais: total },
    });
  } catch (error) {
    console.error('POST /api/usuarios/me/tempo-uso error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar tempo' },
      { status: 500 }
    );
  }
}
