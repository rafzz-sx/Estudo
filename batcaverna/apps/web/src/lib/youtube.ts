/**
 * Helper de integração e busca de áudio e vídeo no YouTube para a BatCaverna.
 */

export interface YouTubeSearchResult {
  id: string;
  videoId: string;
  titulo: string;
  artista: string;
  duracao_segundos: number;
  duracao_formatada: string;
  capa_url: string;
  audio_url: string;
}

function parseDuracaoParaSegundos(texto: string): number {
  if (!texto) return 0;
  const partes = texto.split(':').map((p) => parseInt(p, 10));
  if (partes.some(isNaN)) return 0;
  if (partes.length === 3) {
    return partes[0] * 3600 + partes[1] * 60 + partes[2];
  }
  if (partes.length === 2) {
    return partes[0] * 60 + partes[1];
  }
  return partes[0] || 0;
}

/**
 * Busca no YouTube por termo e retorna os resultados com metadados.
 */
export async function pesquisarNoYouTube(termo: string, limite = 10): Promise<YouTubeSearchResult[]> {
  const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`;
  const response = await fetch(ytUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  if (!response.ok) return [];

  const html = await response.text();
  const match =
    html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
    html.match(/ytInitialData\s*=\s*({[\s\S]+?});/);

  if (!match) return [];

  try {
    const data = JSON.parse(match[1]);
    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
        ?.contents || [];

    const resultados: YouTubeSearchResult[] = [];

    for (const sec of sections) {
      const contents = sec?.itemSectionRenderer?.contents || [];
      for (const item of contents) {
        const v = item?.videoRenderer;
        if (v && v.videoId) {
          const duracaoTexto = v.lengthText?.simpleText || '';
          const duracaoSegundos = parseDuracaoParaSegundos(duracaoTexto);

          const thumbs = v.thumbnail?.thumbnails || [];
          const bestThumb =
            thumbs.length > 0 ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

          resultados.push({
            id: `yt_${v.videoId}`,
            videoId: v.videoId,
            titulo: v.title?.runs?.[0]?.text || 'Sem título',
            artista: v.ownerText?.runs?.[0]?.text || 'YouTube',
            duracao_segundos: duracaoSegundos,
            duracao_formatada: duracaoTexto || 'Áudio',
            capa_url: bestThumb,
            audio_url: `https://www.youtube.com/watch?v=${v.videoId}`,
          });

          if (resultados.length >= limite) break;
        }
      }
      if (resultados.length >= limite) break;
    }

    return resultados;
  } catch (err) {
    console.warn('Erro ao parsear dados do YouTube:', err);
    return [];
  }
}

/**
 * Busca o primeiro vídeo correspondente no YouTube para uma música (usado no importador Spotify).
 */
export async function buscarPrimeiroVideoYouTube(titulo: string, artista?: string): Promise<YouTubeSearchResult | null> {
  const busca = `${titulo} ${artista || ''} audio`.trim();
  const resultados = await pesquisarNoYouTube(busca, 1);
  return resultados[0] || null;
}

