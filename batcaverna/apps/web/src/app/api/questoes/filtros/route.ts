import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { anosDisponiveis, contarPorId, contarQuestoes } from '@/lib/contagens';

const EMOJIS_CONCURSO: Record<string, string> = {
  EEAR: '✈️',
  ESA: '⭐',
  EAM: '⚓',
  CN: '🚢',
  EPCAR: '🛩️',
  ESPCEX: '🎖️',
  EFOMM: '🌊',
  IME: '🔬',
  ENEM: '📚',
};

const CORES_CONCURSO: Record<string, string> = {
  EEAR: '#0284c7',
  ESA: '#16a34a',
  EAM: '#2563eb',
  CN: '#0d9488',
  EPCAR: '#3b82f6',
  ESPCEX: '#b45309',
  EFOMM: '#0891b2',
  IME: '#dc2626',
  ENEM: '#eab308',
};

/**
 * GET /api/questoes/filtros?concurso=EEAR
 *
 * Devolve só as opções que realmente têm questões cadastradas, para os
 * filtros da tela nunca oferecerem uma combinação que retorna vazio.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();
    const sigla = searchParams.get('concurso');

    const { data: concursos, error: concErr } = await supabase
      .from('concursos')
      .select('id, sigla, nome, forca');

    if (concErr) {
      console.warn('Aviso ao buscar concursos em filtros:', concErr.message);
    }

    const lista = concursos ?? [];

    const concursoId =
      sigla && sigla.toLowerCase() !== 'todos'
        ? lista.find((c) => c.sigla.toLowerCase() === sigla.toLowerCase())?.id ??
          null
        : null;

    // ─── Contagens ───────────────────────────────────────────
    const totalPorConcurso = await contarPorId(
      supabase,
      'concurso_id',
      lista.map((c) => c.id)
    );

    // Matérias vinculadas ao concurso (ou todas, se nenhum foi escolhido)
    let materiaIds: string[];
    if (concursoId) {
      const { data: vinculos } = await supabase
        .from('concurso_materias')
        .select('materia_id')
        .eq('concurso_id', concursoId);
      materiaIds = (vinculos ?? []).map((v: any) => v.materia_id);
    } else {
      const { data: todas } = await supabase.from('materias').select('id');
      materiaIds = (todas ?? []).map((m: any) => m.id);
    }

    const contagemMateria = await contarPorId(
      supabase,
      'materia_id',
      materiaIds,
      concursoId ? { concurso_id: concursoId } : {}
    );

    const { data: materias } = materiaIds.length
      ? await supabase
          .from('materias')
          .select('id, nome, icone_emoji')
          .in('id', materiaIds)
          .order('nome')
      : { data: [] as { id: string; nome: string; icone_emoji: string | null }[] };

    const anos = await anosDisponiveis(supabase, concursoId);
    const total = await contarQuestoes(
      supabase,
      concursoId ? { concurso_id: concursoId } : {}
    );

    return NextResponse.json({
      success: true,
      data: {
        concursos: lista.map((c: any) => {
          const s = (c.sigla || '').toUpperCase();
          return {
            id: c.id,
            sigla: c.sigla,
            nome: c.nome,
            forca: c.forca,
            emoji: c.emoji ?? EMOJIS_CONCURSO[s] ?? '🎯',
            cor_tema: c.cor_tema ?? CORES_CONCURSO[s] ?? '#F5C518',
            total_questoes: totalPorConcurso[c.id] ?? 0,
          };
        }),
        // Matérias disponíveis com contagem
        materias: (materias ?? [])
          .map((m: any) => ({
            ...m,
            total_questoes: contagemMateria[m.id] ?? 0,
          }))
          .filter((m: any) => m.total_questoes > 0 || !concursoId),
        anos,
        total,
      },
    });
  } catch (error) {
    console.error('GET /api/questoes/filtros error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar filtros' },
      { status: 500 }
    );
  }
}
