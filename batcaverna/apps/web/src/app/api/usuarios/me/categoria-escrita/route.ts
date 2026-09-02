import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/usuarios/me/categoria-escrita
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('user_categoria_escrita')
      .select('texto')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: data?.texto || null,
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/categoria-escrita error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar categoria' }, { status: 500 });
  }
}

// PUT /api/usuarios/me/categoria-escrita — Salvar categoria personalizada
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { categoria } = await req.json();

    const supabase = createServerSupabaseClient();

    // Upsert
    const { error } = await supabase
      .from('user_categoria_escrita')
      .upsert(
        { user_id: user.id, texto: categoria || null },
        { onConflict: 'user_id' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true, data: { categoria } });
  } catch (error) {
    console.error('PUT /api/usuarios/me/categoria-escrita error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar categoria' }, { status: 500 });
  }
}
