import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// PUT /api/usuarios/me/notificacoes/[id]/marcar-lida — Marca notificação individual como lida
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('PUT /api/usuarios/me/notificacoes/[id]/marcar-lida error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao marcar notificação' }, { status: 500 });
  }
}
