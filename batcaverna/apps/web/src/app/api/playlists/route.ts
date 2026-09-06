import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/** GET /api/playlists — playlists do usuário, com as faixas de cada uma. */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: playlists } = await supabase
      .from('playlists')
      .select('id, nome, descricao, capa_url, criada_em')
      .eq('user_id', user.id)
      .order('criada_em', { ascending: false });

    if (!playlists?.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: itens } = await supabase
      .from('playlist_itens')
      .select(
        `playlist_id, ordem,
         musicas (id, titulo, artista, album, capa_url, audio_url,
                  duracao_segundos, cor_primaria, cor_secundaria)`
      )
      .in(
        'playlist_id',
        playlists.map((p) => p.id)
      )
      .order('ordem');

    const porPlaylist = new Map<string, any[]>();
    for (const item of itens ?? []) {
      const lista = porPlaylist.get(item.playlist_id) ?? [];
      if (item.musicas) lista.push(item.musicas);
      porPlaylist.set(item.playlist_id, lista);
    }

    return NextResponse.json({
      success: true,
      data: playlists.map((p) => ({
        ...p,
        musicas: porPlaylist.get(p.id) ?? [],
      })),
    });
  } catch (error) {
    console.error('GET /api/playlists error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar playlists' },
      { status: 500 }
    );
  }
}

/** POST /api/playlists — cria uma playlist. */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const nome = String(body?.nome ?? '').trim();

    if (nome.length < 2 || nome.length > 80) {
      return NextResponse.json(
        { success: false, error: 'O nome da playlist deve ter entre 2 e 80 caracteres.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        nome,
        descricao: body?.descricao ? String(body.descricao).slice(0, 200) : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: { ...data, musicas: [] } });
  } catch (error) {
    console.error('POST /api/playlists error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar playlist' },
      { status: 500 }
    );
  }
}
