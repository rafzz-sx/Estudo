import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/** Confere que a playlist existe E pertence a quem está chamando. */
async function minhaPlaylist(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  playlistId: string,
  userId: string
) {
  const { data } = await supabase
    .from('playlists')
    .select('id')
    .eq('id', playlistId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

/** POST /api/playlists/[id] — adiciona ou remove uma faixa. */
export async function POST(
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
    if (!(await minhaPlaylist(supabase, id, user.id))) {
      return NextResponse.json(
        { success: false, error: 'Playlist não encontrada' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const musicaId = String(body?.musica_id ?? '');
    const acao = body?.acao === 'remover' ? 'remover' : 'adicionar';

    if (!musicaId) {
      return NextResponse.json(
        { success: false, error: 'Informe a música.' },
        { status: 400 }
      );
    }

    if (acao === 'remover') {
      await supabase
        .from('playlist_itens')
        .delete()
        .eq('playlist_id', id)
        .eq('musica_id', musicaId);
      return NextResponse.json({ success: true, data: { removida: true } });
    }

    const { count } = await supabase
      .from('playlist_itens')
      .select('musica_id', { count: 'exact', head: true })
      .eq('playlist_id', id);

    await supabase
      .from('playlist_itens')
      .upsert(
        { playlist_id: id, musica_id: musicaId, ordem: count ?? 0 },
        { onConflict: 'playlist_id,musica_id' }
      );

    return NextResponse.json({ success: true, data: { adicionada: true } });
  } catch (error) {
    console.error('POST /api/playlists/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar playlist' },
      { status: 500 }
    );
  }
}

/** DELETE /api/playlists/[id] — apaga a playlist. */
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
    if (!(await minhaPlaylist(supabase, id, user.id))) {
      return NextResponse.json(
        { success: false, error: 'Playlist não encontrada' },
        { status: 404 }
      );
    }

    await supabase.from('playlists').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/playlists/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao apagar playlist' },
      { status: 500 }
    );
  }
}
