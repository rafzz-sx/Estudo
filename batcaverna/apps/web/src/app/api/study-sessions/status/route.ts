import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

const LIMITE_MAXIMO_SESSAO_SEGUNDOS = 8 * 3600; // 8 horas = 28.800s

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  let token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    token = req.cookies.get('bat_access_token')?.value;
  }
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// GET /api/study-sessions/status — Obter status da sessão ativa e tempo total acumulado
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // 1. Buscar sessão ativa
    const { data: activeSession } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('finalizada_em', null)
      .order('iniciada_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    // 2. Tempo de hoje (sessões iniciadas hoje)
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const { data: todaySessions } = await supabase
      .from('study_sessions')
      .select('duracao_segundos')
      .eq('user_id', userId)
      .gte('iniciada_em', inicioDoDia.toISOString());

    const tempoEstudoHoje = (todaySessions || []).reduce((acc, s) => acc + (s.duracao_segundos || 0), 0);

    // 3. Tempo total histórico
    const { data: allSessions } = await supabase
      .from('study_sessions')
      .select('duracao_segundos')
      .eq('user_id', userId);

    const tempoEstudoTotal = (allSessions || []).reduce((acc, s) => acc + (s.duracao_segundos || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        sessao_ativa: activeSession ? {
          id: activeSession.id,
          duracao_segundos: activeSession.duracao_segundos || 0,
          multiplicador: activeSession.multiplicador_continuidade_atual || 1.0,
          xp_ganho_na_sessao: activeSession.xp_ganho_na_sessao || 0,
          tempo_restante_8h_segundos: Math.max(0, LIMITE_MAXIMO_SESSAO_SEGUNDOS - (activeSession.duracao_segundos || 0)),
          iniciada_em: activeSession.iniciada_em,
        } : null,
        tempo_estudo_hoje_segundos: tempoEstudoHoje,
        tempo_estudo_total_segundos: tempoEstudoTotal,
        limite_maximo_sessao_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
      },
    });
  } catch (error) {
    console.error('GET /api/study-sessions/status error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao consultar status' }, { status: 500 });
  }
}
