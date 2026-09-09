import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  return getAuthUserFromRequest(req);
}

// DELETE /api/amizades/[id] — Desfazer amizade
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // Conferir se a amizade existe e envolve o usuário logado
    const { data: amizade, error: fetchErr } = await supabase
      .from('amizades')
      .select('id, user_id_solicitante, user_id_destinatario')
      .eq('id', id)
      .or(`user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user.id}`)
      .maybeSingle();

    if (fetchErr || !amizade) {
      return NextResponse.json({ success: false, error: 'Amizade não encontrada' }, { status: 404 });
    }

    // Exclui a amizade (com ON DELETE SET NULL em conversas.amizade_id, o histórico do chat é preservado)
    const { error: delErr } = await supabase
      .from('amizades')
      .delete()
      .eq('id', id);

    if (delErr) throw delErr;

    return NextResponse.json({
      success: true,
      message: 'Amizade desfeita com sucesso.',
    });
  } catch (error) {
    console.error('DELETE /api/amizades/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao desfazer amizade' }, { status: 500 });
  }
}
