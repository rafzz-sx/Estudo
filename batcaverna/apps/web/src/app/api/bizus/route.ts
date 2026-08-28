import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/bizus?materia_id=X&assunto_id=Y&impacto=alto&page=1&per_page=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const materia_id = searchParams.get('materia_id');
    const assunto_id = searchParams.get('assunto_id');
    const impacto = searchParams.get('impacto');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('bizus')
      .select(`
        *,
        assuntos!inner (id, nome, materia_id,
          materias!inner (id, nome)
        )
      `, { count: 'exact' });

    if (assunto_id) query = query.eq('assunto_id', assunto_id);
    if (materia_id) query = query.eq('assuntos.materia_id', materia_id);
    if (impacto && impacto !== 'todos') query = query.eq('nivel_impacto', impacto);

    const offset = (page - 1) * per_page;
    query = query.range(offset, offset + per_page - 1).order('criado_em', { ascending: false });

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        items: data,
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    });
  } catch (error) {
    console.error('GET /api/bizus error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar bizus' },
      { status: 500 }
    );
  }
}
