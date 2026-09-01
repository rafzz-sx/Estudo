import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  let token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    token = req.cookies.get('bat_access_token')?.value;
  }
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/study-sessions/heartbeat — Heartbeat periódico com Bônus de Continuidade e XP
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // Buscar sessão ativa
    const { data: session, error: sessErr } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('finalizada_em', null)
      .order('iniciada_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessErr || !session) {
      return NextResponse.json({ success: false, error: 'Nenhuma sessão ativa' }, { status: 404 });
    }

    const agora = new Date();
    const ultimaAtividade = new Date(session.ultima_atividade_em || session.iniciada_em);
    let diffSegundos = Math.max(0, Math.floor((agora.getTime() - ultimaAtividade.getTime()) / 1000));

    // Se houve mais de 5 min (300s) sem heartbeat, limitar o intervalo normal
    if (diffSegundos > 300) {
      diffSegundos = 30;
    }

    // Nova duração acumulada
    const novaDuracao = (session.duracao_segundos || 0) + diffSegundos;

    // Calcular blocos de 15min contínuos (900s)
    const blocos15Min = Math.floor(novaDuracao / 900);
    const novosBlocos = Math.max(0, blocos15Min - (session.blocos_continuos_completados || 0));

    // ═══ BÔNUS DE CONTINUIDADE: +10% a cada 15min, até +50% (1.5x) ═══
    const multiplicador = Math.min(1 + blocos15Min * 0.1, 1.5);

    // ═══ XP: 1 XP por minuto de estudo x multiplicador ═══
    const xpGanhoNesteIntervalo = Math.max(0, Math.round((diffSegundos / 60) * multiplicador));
    const novoXpSessao = (session.xp_ganho_na_sessao || 0) + xpGanhoNesteIntervalo;

    const updatePayload: Record<string, any> = {
      ultima_atividade_em: agora.toISOString(),
      duracao_segundos: novaDuracao,
      blocos_continuos_completados: blocos15Min,
      multiplicador_continuidade_atual: multiplicador,
      xp_ganho_na_sessao: novoXpSessao,
    };

    // Atualizar sessão no Supabase
    await supabase
      .from('study_sessions')
      .update(updatePayload)
      .eq('id', session.id);

    // Atualizar XP total do usuário e streak
    if (xpGanhoNesteIntervalo > 0) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('xp_total')
          .eq('id', userId)
          .single();

        const xpAtual = userData?.xp_total || 0;
        await supabase
          .from('users')
          .update({
            xp_total: xpAtual + xpGanhoNesteIntervalo,
            ultimo_dia_estudado: agora.toISOString().split('T')[0],
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Aviso ao atualizar XP do usuário:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.id,
        duracao_segundos: novaDuracao,
        xp_ganho_intervalo: xpGanhoNesteIntervalo,
        xp_ganho_total_sessao: novoXpSessao,
        multiplicador,
        blocos_completados: blocos15Min,
        novos_blocos: novosBlocos,
      },
    });
  } catch (error) {
    console.error('POST /api/study-sessions/heartbeat error:', error);
    return NextResponse.json({ success: false, error: 'Erro no heartbeat' }, { status: 500 });
  }
}
