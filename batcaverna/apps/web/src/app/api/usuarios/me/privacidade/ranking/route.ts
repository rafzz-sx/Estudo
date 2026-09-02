import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/usuarios/me/privacidade/ranking
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('user_privacy_settings')
      .select('ocultar_do_ranking')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: { ocultar_do_ranking: data?.ocultar_do_ranking ?? false },
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/privacidade/ranking error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar privacidade' }, { status: 500 });
  }
}

// PUT /api/usuarios/me/privacidade/ranking — Atualizar toggle de privacidade no ranking
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { ocultar_do_ranking } = await req.json();

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('user_privacy_settings')
      .upsert(
        { user_id: user.id, ocultar_do_ranking: !!ocultar_do_ranking },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { ocultar_do_ranking: !!ocultar_do_ranking },
    });
  } catch (error) {
    console.error('PUT /api/usuarios/me/privacidade/ranking error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar privacidade' }, { status: 500 });
  }
}
