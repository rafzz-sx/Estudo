import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * DELETE /api/musicas/[id] — remove uma música importada pelo próprio aluno.
 * Alunos só podem remover músicas que eles mesmos adicionaram (user_id = user.id).
 * Administradores podem remover qualquer música.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();

    // Busca a música
    const { data: musica, error: errBusca } = await supabase
      .from('musicas')
      .select('id, user_id, titulo')
      .eq('id', id)
      .maybeSingle();

    if (errBusca || !musica) {
      return NextResponse.json({ success: false, error: 'Música não encontrada' }, { status: 404 });
    }

    // Validação de permissão: só o dono da faixa ou admin pode apagar
    if (user.role !== 'admin' && musica.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Você só pode remover músicas adicionadas por você.' },
        { status: 403 }
      );
    }

    // Remove referências em playlists antes de apagar a música
    await supabase.from('playlist_itens').delete().eq('musica_id', id);
    await supabase.from('user_musicas_favoritas').delete().eq('musica_id', id);

    const { error: errDelete } = await supabase.from('musicas').delete().eq('id', id);
    if (errDelete) throw errDelete;

    return NextResponse.json({
      success: true,
      message: `Música "${musica.titulo}" removida do seu acervo.`,
    });
  } catch (error) {
    console.error('DELETE /api/musicas/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao remover música' },
      { status: 500 }
    );
  }
}

