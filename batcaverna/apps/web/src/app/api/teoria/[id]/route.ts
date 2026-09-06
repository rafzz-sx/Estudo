import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

/** GET /api/teoria/[id] — corpo completo de um conteúdo teórico. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('teoria_conteudo')
      .select('id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min')
      .eq('id', id)
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
