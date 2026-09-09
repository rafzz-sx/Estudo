import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { uuidOuNulo } from '@/lib/seguranca';

// GET /api/concursos/[sigla]/materias — Matérias de um concurso com seus assuntos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sigla: string }> }
) {
  try {
    const { sigla } = await params;
    const supabase = createServerSupabaseClient();

    let concursoId = uuidOuNulo(sigla);
    if (!concursoId) {
      // Se não for UUID direto, busca pelo sigla (case-insensitive)
      const { data: conc } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', sigla)
        .maybeSingle();

      concursoId = conc?.id ?? null;
    }

    if (!concursoId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data, error } = await supabase
      .from('concurso_materias')
      .select(`
        peso_na_prova,
        materias (
          id, nome, descricao, icone_emoji,
          assuntos (id, nome, ordem, resumo_teorico)
        )
      `)
      .eq('concurso_id', concursoId)
      .order('materias(nome)');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/concursos/[sigla]/materias error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar matérias' },
      { status: 500 }
    );
  }
}
