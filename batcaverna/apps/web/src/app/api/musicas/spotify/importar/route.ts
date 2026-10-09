import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * Extrai o ID da playlist a partir de URLs do Spotify como:
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
 * - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
 */
function extrairPlaylistId(url: string): string | null {
  if (!url) return null;
  const matchWeb = url.match(/playlist\/([a-zA-Z0-9]+)/);
  if (matchWeb) return matchWeb[1];
  const matchUri = url.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (matchUri) return matchUri[1];
  return null;
}

interface FaixaSpotify {
  titulo: string;
  artista: string;
  duracao_segundos: number;
  preview_url?: string | null;
  capa_url?: string | null;
}

/**
 * POST /api/musicas/spotify/importar
 * Importa faixas de uma playlist pública do Spotify e cria uma playlist na BatCaverna.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawUrl = String(body?.url ?? '').trim();

    const playlistId = extrairPlaylistId(rawUrl);
    if (!playlistId) {
      return NextResponse.json(
        { success: false, error: 'Link de playlist do Spotify inválido. Exemplo: https://open.spotify.com/playlist/...' },
        { status: 400 }
      );
    }

    // 1. Obter metadados e faixas da playlist pública do Spotify via página embed
    const embedRes = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!embedRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Não foi possível acessar a playlist do Spotify. Verifique se o link é público.' },
        { status: 400 }
      );
    }

    const embedHtml = await embedRes.text();
    let nomePlaylist = 'Minha Playlist do Spotify';
    let capaPlaylist: string | null = null;
    const faixas: FaixaSpotify[] = [];

    // Tentar ler dados do __NEXT_DATA__
    const nextDataMatch = embedHtml.match(
      /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/
    );

    if (nextDataMatch) {
      try {
        const parsed = JSON.parse(nextDataMatch[1]);
        const entity = parsed?.props?.pageProps?.state?.data?.entity;
        if (entity?.name) nomePlaylist = entity.name;
        if (entity?.images?.[0]?.url) capaPlaylist = entity.images[0].url;

        const trackList = entity?.trackList || [];
        for (const t of trackList) {
          const tit = t?.title?.trim();
          const art = t?.subtitle?.trim() || 'Artista';
          if (tit) {
            faixas.push({
              titulo: tit,
              artista: art,
              duracao_segundos: Math.round((t?.duration || 0) / 1000),
              preview_url: t?.audioPreview?.url || null,
              capa_url: capaPlaylist,
            });
          }
        }
      } catch (err) {
        console.warn('Erro ao parsear __NEXT_DATA__ do Spotify:', err);
      }
    }

    // Fallback: tentar regex caso o formato JSON tenha mudado
    if (faixas.length === 0) {
      const matchTracks = [
        ...embedHtml.matchAll(/"name":"([^"]+)","artists":\[{"name":"([^"]+)"/g),
      ];
      for (const m of matchTracks) {
        faixas.push({
          titulo: m[1],
          artista: m[2],
          duracao_segundos: 180,
          capa_url: null,
        });
        if (faixas.length >= 30) break;
      }
    }

    if (faixas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma música identificada nesta playlist. Certifique-se de que a playlist tem faixas visíveis e é pública.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 2. Criar a playlist no banco para o usuário
    const nomeFinal = nomePlaylist.length > 70 ? `${nomePlaylist.slice(0, 67)}...` : nomePlaylist;
    const { data: novaPlaylist, error: erroPlaylist } = await supabase
      .from('playlists')
      .insert({
        user_id: user.id,
        nome: nomeFinal,
        descricao: `Importada do Spotify (${faixas.length} faixas)`,
        capa_url: capaPlaylist,
      })
      .select()
      .single();

    if (erroPlaylist || !novaPlaylist) {
      throw erroPlaylist || new Error('Falha ao criar playlist');
    }

    // 3. Cadastrar as faixas em `musicas` e associar em `playlist_itens`
    let faixasAdicionadas = 0;
    const faixasProcessadas = faixas.slice(0, 30); // Limita em 30 faixas por importação para não sobrecarregar

    for (let i = 0; i < faixasProcessadas.length; i++) {
      const f = faixasProcessadas[i];
      try {
        // Áudio: se o Spotify fornecer preview MP3, usa o preview oficial; senão gera o link de busca no YouTube
        const audioUrl = f.preview_url || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${f.titulo} ${f.artista}`)}`;

        const { data: musicaSalva, error: errMusica } = await supabase
          .from('musicas')
          .insert({
            titulo: f.titulo.slice(0, 200),
            artista: f.artista.slice(0, 200),
            capa_url: f.capa_url || null,
            audio_url: audioUrl,
            duracao_segundos: f.duracao_segundos || 180,
            fonte: 'spotify',
            fonte_id: playlistId,
          })
          .select()
          .single();

        if (musicaSalva) {
          await supabase.from('playlist_itens').insert({
            playlist_id: novaPlaylist.id,
            musica_id: musicaSalva.id,
            ordem: i,
          });
          faixasAdicionadas++;
        }
      } catch (itemErr) {
        console.warn('Erro ao inserir faixa do Spotify:', itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        playlist_id: novaPlaylist.id,
        nome: novaPlaylist.nome,
        total_faixas: faixasAdicionadas,
      },
      message: `Playlist "${novaPlaylist.nome}" importada com sucesso com ${faixasAdicionadas} faixas!`,
    });
  } catch (error: any) {
    console.error('Erro na rota de importação do Spotify:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao importar playlist do Spotify.' },
      { status: 500 }
    );
  }
}
