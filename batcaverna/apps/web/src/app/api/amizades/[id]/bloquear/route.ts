import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// PUT /api/amizades/[id]/bloquear — Bloquear amizade / usuário
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // Verificar que a amizade envolve o usuário logado
    const { data: amizade, error: fetchErr } = await supabase
      .from('amizades')
      .select('*')
      .eq('id', id)
      .or(`user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user.id}`)
      .single();

    if (fetchErr || !amizade) {
      return NextResponse.json({ success: false, error: 'Amizade não encontrada' }, { status: 404 });
    }

    const { error: updateErr } = await supabase
      .from('amizades')
      .update({ status: 'bloqueada', respondido_em: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) throw updateErr;

    return NextResponse.json({
      success: true,
      message: 'Usuário bloqueado com sucesso.',
    });
  } catch (error) {
    console.error('PUT /api/amizades/[id]/bloquear error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao bloquear usuário' }, { status: 500 });
  }
}

// DELETE /api/amizades/[id]/bloquear — Desfazer amizade
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('amizades')
      .delete()
      .eq('id', id)
      .or(`user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user.id}`);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Amizade desfeita.' });
  } catch (error) {
    console.error('DELETE /api/amizades/[id]/bloquear error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao desfazer amizade' }, { status: 500 });
  }
}
