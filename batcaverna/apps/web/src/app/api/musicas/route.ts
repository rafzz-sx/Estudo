import { NextRequest, NextResponse } from 'next/server';
import { limparTermoBusca } from '@/lib/seguranca';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/musicas?busca=lofi&favoritas=1
 * Busca no acervo da plataforma por título, artista ou álbum.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();
    const user = await getAuthUserFromRequest(req);

    // Sanitizado: virgula, parentese e ponto sao metacaracteres do
    // filtro do PostgREST e permitiriam sair da condicao pretendida.
    const busca = limparTermoBusca(searchParams.get('busca'));
    const soFavoritas = searchParams.get('favoritas') === '1';

    let favoritasIds: string[] = [];
    if (user) {
      const { data } = await supabase
        .from('user_musicas_favoritas')
        .select('musica_id')
        .eq('user_id', user.id);
      favoritasIds = (data ?? []).map((f) => f.musica_id);
    }

    if (soFavoritas && favoritasIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabase
      .from('musicas')
      .select(
        'id, titulo, artista, album, capa_url, audio_url, duracao_segundos, cor_primaria, cor_secundaria, genero'
      )
      .eq('ativa', true);

    if (soFavoritas) query = query.in('id', favoritasIds);

    if (busca.length >= 2) {
      // Busca no título OU no artista OU no álbum.
      const termo = `%${busca}%`;
      query = query.or(
        `titulo.ilike.${termo},artista.ilike.${termo},album.ilike.${termo}`
      );
    }

    const { data, error } = await query.order('titulo').limit(100);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((m) => ({
        ...m,
        favorita: favoritasIds.includes(m.id),
      })),
    });
  } catch (error) {
    console.error('GET /api/musicas error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar músicas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/musicas — adiciona uma faixa ao acervo por URL direta.
 *
 * A plataforma não distribui catálogo licenciado: quem adiciona é o
 * administrador (ou o próprio aluno, com um link de áudio ao qual ele tem
 * direito de acesso).
 */
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
    const { titulo, artista, album, capa_url, audio_url, duracao_segundos, genero } = body;

    if (!titulo || !audio_url) {
      return NextResponse.json(
        { success: false, error: 'Título e URL do áudio são obrigatórios.' },
        { status: 400 }
      );
    }

    // Só aceita http(s): evita javascript:, data: e file:.
    let url: URL;
    try {
      url = new URL(String(audio_url));
    } catch {
      return NextResponse.json(
        { success: false, error: 'URL do áudio inválida.' },
        { status: 400 }
      );
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      return NextResponse.json(
        { success: false, error: 'A URL do áudio precisa ser http ou https.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('musicas')
      .insert({
        titulo: String(titulo).slice(0, 200),
        artista: artista ? String(artista).slice(0, 200) : null,
        album: album ? String(album).slice(0, 200) : null,
        capa_url: capa_url || null,
        audio_url: url.toString(),
        duracao_segundos: Number(duracao_segundos) || 0,
        genero: genero ? String(genero).slice(0, 60) : null,
        fonte: 'url',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('POST /api/musicas error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao adicionar música' },
      { status: 500 }
    );
  }
}
