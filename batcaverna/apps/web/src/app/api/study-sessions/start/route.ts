import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

const LIMITE_MAXIMO_SESSAO_SEGUNDOS = 8 * 3600; // 8 horas = 28.800 segundos

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  let token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    token = req.cookies.get('bat_access_token')?.value;
  }
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/study-sessions/start — Iniciar sessão de estudo automática (limite 8h)
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dispositivo = body.dispositivo || 'web';

    const supabase = createServerSupabaseClient();

    // Verificar se já existe sessão ativa
    const { data: existingSession } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('finalizada_em', null)
      .order('iniciada_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      // Se a sessão existente já atingiu ou ultrapassou 8 horas, finalizá-la
      if ((existingSession.duracao_segundos || 0) >= LIMITE_MAXIMO_SESSAO_SEGUNDOS) {
        await supabase
          .from('study_sessions')
          .update({ finalizada_em: new Date().toISOString() })
          .eq('id', existingSession.id);
      } else {
        return NextResponse.json({
          success: true,
          data: {
            session_id: existingSession.id,
            duracao_segundos: existingSession.duracao_segundos || 0,
            multiplicador: existingSession.multiplicador_continuidade_atual || 1.0,
            xp_ganho_na_sessao: existingSession.xp_ganho_na_sessao || 0,
            tempo_restante_8h_segundos: Math.max(0, LIMITE_MAXIMO_SESSAO_SEGUNDOS - (existingSession.duracao_segundos || 0)),
            limite_8h_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
          },
          message: 'Sessão de estudo ativa recuperada!',
        });
      }
    }

    // Criar nova sessão com limite de 8h
    const { data: newSession, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        dispositivo_origem: dispositivo,
        duracao_segundos: 0,
        blocos_continuos_completados: 0,
        multiplicador_continuidade_atual: 1.0,
        xp_ganho_na_sessao: 0,
        iniciada_em: new Date().toISOString(),
        ultima_atividade_em: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        session_id: newSession.id,
        duracao_segundos: 0,
        multiplicador: 1.0,
        xp_ganho_na_sessao: 0,
        tempo_restante_8h_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
        limite_8h_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
      },
      message: 'Sessão automática de estudo iniciada (limite 8h)!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/study-sessions/start error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao iniciar sessão' }, { status: 500 });
  }
}
