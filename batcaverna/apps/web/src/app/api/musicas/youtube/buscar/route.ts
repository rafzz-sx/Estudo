import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { pesquisarNoYouTube } from '@/lib/youtube';

/**
 * GET /api/musicas/youtube/buscar?q=termo
 * Pesquisa faixas e trilhas sonoras no YouTube diretamente com miniatura e duração.
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

    const resultados = await pesquisarNoYouTube(termo, 10);

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
