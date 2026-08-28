import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/questoes?concurso_id=X&materia_id=Y&assunto_id=Z&dificuldade=W&ano=2023&page=1&per_page=10
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const concurso_id = searchParams.get('concurso_id');
    const materia_id = searchParams.get('materia_id');
    const assunto_id = searchParams.get('assunto_id');
    const dificuldade = searchParams.get('dificuldade');
    const ano = searchParams.get('ano');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '10');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('questoes')
      .select(`
        id,
        concurso_id,
        materia_id,
        assunto_id,
        enunciado,
        alternativas,
        resposta_correta,
        explicacao,
        ano,
        banca,
        dificuldade,
        bizu_relacionado_id,
        concursos (id, sigla, nome),
        materias (id, nome),
        assuntos (id, nome)
      `, { count: 'exact' });

    if (concurso_id) query = query.eq('concurso_id', concurso_id);
    if (materia_id) query = query.eq('materia_id', materia_id);
    if (assunto_id) query = query.eq('assunto_id', assunto_id);
    if (dificuldade && dificuldade !== 'todas') query = query.eq('dificuldade', dificuldade.toLowerCase());
    if (ano) query = query.eq('ano', parseInt(ano));

    const offset = (page - 1) * per_page;
    query = query.range(offset, offset + per_page - 1).order('ano', { ascending: false, nullsFirst: false });

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        items: data || [],
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    });
  } catch (error) {
    console.error('GET /api/questoes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar questões' },
      { status: 500 }
    );
  }
}
