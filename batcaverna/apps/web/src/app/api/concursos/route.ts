import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { contarPorId } from '@/lib/contagens';

/**
 * GET /api/concursos — catálogo com contagem real de questões.
 *
 * A página de concursos antes usava uma lista fixa no código. Agora vem do
 * banco, então cadastrar um concurso novo não exige mexer no front.
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: concursos, error } = await supabase
      .from('concursos')
      .select(
        `id, nome, sigla, descricao, nivel_ensino, forca, emoji, cor_tema,
         tem_taf, orgao, escolaridade, frase_curta_card, imagem_fundo_url,
         edital_ano, ordem_exibicao`
      )
      .order('ordem_exibicao', { ascending: true })
      .order('sigla', { ascending: true });

    if (error) throw error;

    const contagem = await contarPorId(
      supabase,
      'concurso_id',
      (concursos ?? []).map((c) => c.id)
    );

    return NextResponse.json({
      success: true,
      data: (concursos ?? []).map((c) => ({
        ...c,
        total_questoes: contagem[c.id] ?? 0,
      })),
    });
  } catch (error) {
    console.error('GET /api/concursos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar concursos' },
      { status: 500 }
    );
  }
}
