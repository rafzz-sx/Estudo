import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/concursos/[id]/materias — Matérias de um concurso com seus assuntos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('concurso_materias')
      .select(`
        peso_na_prova,
        materias (
          id, nome, descricao, icone_emoji,
          assuntos (id, nome, ordem, resumo_teorico)
        )
      `)
      .eq('concurso_id', id)
      .order('materias(nome)');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/concursos/[id]/materias error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar matérias' },
      { status: 500 }
    );
  }
}
