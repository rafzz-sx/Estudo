import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * DELETE /api/usuarios/me/notificacoes/[id]
 * Apaga uma notificação do próprio usuário — ele precisa poder esvaziar a
 * caixa depois de ler.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    // O filtro por user_id garante que ninguém apague notificação alheia.
    const { error } = await supabase
      .from('notificacoes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/usuarios/me/notificacoes/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao apagar notificação' },
      { status: 500 }
    );
  }
}
