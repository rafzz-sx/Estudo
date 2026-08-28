import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/concursos — Lista todos os concursos
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('concursos')
      .select('*')
      .order('sigla');

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/concursos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar concursos' },
      { status: 500 }
    );
  }
}
