import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

// ─── Extrair user_id do token ────────────────────────────────
async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/study-sessions/start — Iniciar sessão de estudo
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
      .select('id')
      .eq('user_id', userId)
      .is('finalizada_em', null)
      .single();

    if (existingSession) {
      return NextResponse.json({
        success: true,
        data: { session_id: existingSession.id },
        message: 'Sessão já ativa.',
      });
    }

    // Criar nova sessão
    const { data: newSession, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        dispositivo_origem: dispositivo,
        duracao_segundos: 0,
        blocos_continuos_completados: 0,
        multiplicador_continuidade_atual: 1.0,
        xp_ganho_na_sessao: 0,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { session_id: newSession.id },
      message: 'Sessão de estudo iniciada!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/study-sessions/start error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao iniciar sessão' }, { status: 500 });
  }
}
