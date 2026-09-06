import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/estatisticas-publicas
 *
 * Números do acervo para a landing page. Pública de propósito: quem ainda
 * não tem conta precisa ver o tamanho real do banco antes de se cadastrar.
 * Não expõe nenhum dado de usuário.
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { count: totalQuestoes } = await supabase
      .from('questoes')
      .select('id', { count: 'exact', head: true })
      .eq('ativa', true);

    const { count: totalConcursos } = await supabase
      .from('concursos')
      .select('id', { count: 'exact', head: true });

    const { count: totalMaterias } = await supabase
      .from('materias')
      .select('id', { count: 'exact', head: true });

    const { data: anos } = await supabase
      .from('questoes')
      .select('ano')
      .eq('ativa', true)
      .not('ano', 'is', null)
      .limit(20000);

    const anosDistintos = new Set((anos ?? []).map((q) => q.ano)).size;

    return NextResponse.json({
      success: true,
      data: {
        total_questoes: totalQuestoes ?? 0,
        total_concursos: totalConcursos ?? 0,
        total_materias: totalMaterias ?? 0,
        anos_cobertos: anosDistintos,
      },
    });
  } catch (error) {
    console.error('GET /api/estatisticas-publicas error:', error);
    // A home não pode quebrar por causa disso: devolve zeros.
    return NextResponse.json({
      success: true,
      data: {
        total_questoes: 0,
        total_concursos: 0,
        total_materias: 0,
        anos_cobertos: 0,
      },
    });
  }
}
