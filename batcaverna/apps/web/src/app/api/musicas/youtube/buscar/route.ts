import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';

interface YouTubeItem {
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
 * GET /api/musicas/youtube/buscar?q=termo
 * Pesquisa faixas e trilhas sonoras no YouTube diretamente.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const termo = searchParams.get('q')?.trim();

    if (!termo || termo.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Digite pelo menos 2 caracteres para buscar.' },
        { status: 400 }
      );
    }

    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(termo)}`;
    const response = await fetch(ytUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 300 }, // Cache de 5 minutos por termo
    });

    if (!response.ok) {
      throw new Error(`YouTube HTTP ${response.status}`);
    }

    const html = await response.text();
    const match =
      html.match(/var ytInitialData = ({[\s\S]*?});<\/script>/) ||
      html.match(/ytInitialData\s*=\s*({[\s\S]+?});/);

    if (!match) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Nenhum resultado encontrado no momento.',
      });
    }

    const data = JSON.parse(match[1]);
    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
        ?.contents || [];

    const resultados: YouTubeItem[] = [];

    for (const sec of sections) {
      const contents = sec?.itemSectionRenderer?.contents || [];
      for (const item of contents) {
        const v = item?.videoRenderer;
        if (v && v.videoId) {
          const duracaoTexto = v.lengthText?.simpleText || '';
          const duracaoSegundos = parseDuracaoParaSegundos(duracaoTexto);

          // Pega a melhor resolução da miniatura
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

          if (resultados.length >= 8) break;
        }
      }
      if (resultados.length >= 8) break;
    }

    return NextResponse.json({
      success: true,
      data: resultados,
    });
  } catch (error: any) {
    console.error('Erro ao buscar no YouTube:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar no YouTube. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
