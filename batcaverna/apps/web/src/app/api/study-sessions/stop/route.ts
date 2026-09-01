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

// POST /api/study-sessions/stop — Finalizar sessão de estudo ativa
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    const { data: session } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('finalizada_em', null)
      .order('iniciada_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ success: true, message: 'Nenhuma sessão ativa para finalizar.' });
    }

    await supabase
      .from('study_sessions')
      .update({ finalizada_em: new Date().toISOString() })
      .eq('id', session.id);

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.id,
        duracao_total_segundos: session.duracao_segundos,
        xp_ganho_total: session.xp_ganho_na_sessao,
      },
      message: 'Sessão finalizada com sucesso!',
    });
  } catch (error) {
    console.error('POST /api/study-sessions/stop error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao finalizar sessão' }, { status: 500 });
  }
}
