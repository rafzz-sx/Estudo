import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';

/**
 * GET /api/teoria/[id] — corpo completo de um conteúdo teórico.
 *
 * Exige login: a teoria escrita é o conteúdo da plataforma, e esta rota
 * devolvia o texto inteiro para qualquer requisição anônima. Bastava
 * percorrer os IDs para copiar o material todo.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Sem esta conferência, um id inválido faz o PostgREST responder 22P02 e
    // a tela mostra "erro interno" em vez de "conteúdo não encontrado".
    const teoriaId = uuidOuNulo(id);
    if (!teoriaId) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo não encontrado' },
        { status: 404 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('teoria_conteudo')
      .select('id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min')
      .eq('id', teoriaId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/teoria/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar o conteúdo' },
      { status: 500 }
    );
  }
}
