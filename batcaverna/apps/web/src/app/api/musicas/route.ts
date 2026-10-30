import { NextRequest, NextResponse } from 'next/server';
import { limparTermoBusca } from '@/lib/seguranca';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { extrairVideoIdYouTube } from '@/stores/player-store';

/**
 * GET /api/musicas?busca=lofi&favoritas=1&origem=todas|minhas|batcaverna
 * Busca músicas com isolamento por usuário:
 * - O aluno só vê as músicas oficiais da BatCaverna (user_id IS NULL)
 * - E as suas próprias músicas importadas (user_id = user.id)
 * - NUNCA vê músicas importadas por outros alunos.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();
    const user = await getAuthUserFromRequest(req);

    const busca = limparTermoBusca(searchParams.get('busca'));
    const soFavoritas = searchParams.get('favoritas') === '1';
    const origem = searchParams.get('origem') || 'todas';

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
        'id, titulo, artista, album, capa_url, audio_url, duracao_segundos, cor_primaria, cor_secundaria, genero, fonte, fonte_id, user_id'
      )
      .eq('ativa', true);

    // Isolamento de privacidade por usuário (quando user_id existe)
    if (user) {
      if (origem === 'minhas') {
        query = query.eq('user_id', user.id);
      } else if (origem === 'batcaverna') {
        query = query.is('user_id', null);
      } else {
        // 'todas': faixas públicas da plataforma + faixas particulares deste aluno
        query = query.or(`user_id.is.null,user_id.eq.${user.id}`);
      }
    } else {
      query = query.is('user_id', null);
    }

    if (soFavoritas) query = query.in('id', favoritasIds);

    if (busca.length >= 2) {
      const termo = `%${busca}%`;
      query = query.or(
        `titulo.ilike.${termo},artista.ilike.${termo},album.ilike.${termo}`
      );
    }

    let { data, error } = await query.order('titulo').limit(150);

    // Fallback: se a coluna user_id ainda não foi criada no banco
    if (error && error.code === '42703') {
      let queryFallback = supabase
        .from('musicas')
        .select(
          'id, titulo, artista, album, capa_url, audio_url, duracao_segundos, cor_primaria, cor_secundaria, genero, fonte, fonte_id'
        )
        .eq('ativa', true);

      if (soFavoritas) queryFallback = queryFallback.in('id', favoritasIds);
      if (busca.length >= 2) {
        const termo = `%${busca}%`;
        queryFallback = queryFallback.or(
          `titulo.ilike.${termo},artista.ilike.${termo},album.ilike.${termo}`
        );
      }
      const retry = await queryFallback.order('titulo').limit(150);
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data ?? []).map((m: any) => ({
        ...m,
        favorita: favoritasIds.includes(m.id),
        ehMinha: user ? m.user_id === user.id : false,
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
 * POST /api/musicas — adiciona uma faixa pessoal do aluno ao acervo.
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
    let { titulo, artista, album, capa_url, audio_url, duracao_segundos, genero, fonte, fonte_id } = body;

    if (!titulo || !audio_url) {
      return NextResponse.json(
        { success: false, error: 'Título e URL do áudio são obrigatórios.' },
        { status: 400 }
      );
    }

    let urlStr = String(audio_url).trim();

    // Detecção inteligente de YouTube se o usuário colou um link do YouTube
    const ytIdDetectado = extrairVideoIdYouTube(urlStr);
    if (ytIdDetectado) {
      fonte = 'youtube';
      fonte_id = ytIdDetectado;
      urlStr = `https://www.youtube.com/watch?v=${ytIdDetectado}`;
      if (!capa_url) {
        capa_url = `https://i.ytimg.com/vi/${ytIdDetectado}/hqdefault.jpg`;
      }
    } else {
      let url: URL;
      try {
        url = new URL(urlStr);
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
      urlStr = url.toString();
    }

    const supabase = createServerSupabaseClient();

    const insertData: any = {
      user_id: user.id, // Músicas importadas pertencem exclusivamente a este usuário
      titulo: String(titulo).slice(0, 200),
      artista: artista ? String(artista).slice(0, 200) : null,
      album: album ? String(album).slice(0, 200) : null,
      capa_url: capa_url || null,
      audio_url: urlStr,
      duracao_segundos: Number(duracao_segundos) || 0,
      genero: genero ? String(genero).slice(0, 60) : null,
      fonte: fonte ? String(fonte).slice(0, 24) : 'url',
      fonte_id: fonte_id ? String(fonte_id).slice(0, 120) : null,
    };

    let { data, error } = await supabase.from('musicas').insert(insertData).select().single();

    // Fallback caso a coluna user_id ainda não exista
    if (error && error.code === '42703') {
      delete insertData.user_id;
      const retry = await supabase.from('musicas').insert(insertData).select().single();
      data = retry.data;
      error = retry.error;
    }

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
