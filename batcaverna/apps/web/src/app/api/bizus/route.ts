import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/bizus
 *
 * Filtros: concurso (sigla), materia (nome), materia_id, assunto_id,
 *          impacto (alto|util|avancado), busca, favoritos=1
 *
 * Os cards de concurso linkam para cá com `?concurso=EEAR`, então o filtro
 * por sigla precisa existir — antes só havia filtro por UUID de matéria.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();
    const user = await getAuthUserFromRequest(req);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('per_page') || '30'))
    );

    // ─── Resolve matéria por nome ou pelo concurso ───────────
    let materiaIds: string[] | null = null;

    const materiaId = searchParams.get('materia_id');
    const materiaNome = searchParams.get('materia');
    const concursoSigla = searchParams.get('concurso');

    if (materiaId) {
      materiaIds = [materiaId];
    } else if (materiaNome && materiaNome.toLowerCase() !== 'todas') {
      const { data } = await supabase
        .from('materias')
        .select('id')
        .ilike('nome', materiaNome)
        .maybeSingle();
      materiaIds = data ? [data.id] : [];
    } else if (concursoSigla && concursoSigla.toLowerCase() !== 'todos') {
      const { data: concurso } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', concursoSigla)
        .maybeSingle();

      if (concurso) {
        const { data: vinculos } = await supabase
          .from('concurso_materias')
          .select('materia_id')
          .eq('concurso_id', concurso.id);
        materiaIds = (vinculos ?? []).map((v) => v.materia_id);
      } else {
        materiaIds = [];
      }
    }

    if (materiaIds && materiaIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { items: [], total: 0, page, per_page: perPage, total_pages: 0 },
      });
    }

    // ─── Favoritos do usuário ────────────────────────────────
    let favoritos: string[] = [];
    if (user) {
      const { data } = await supabase
        .from('favoritos')
        .select('item_id')
        .eq('user_id', user.id)
        .eq('tipo', 'bizu');
      favoritos = (data ?? []).map((f) => f.item_id);
    }

    if (searchParams.get('favoritos') === '1') {
      if (!favoritos.length) {
        return NextResponse.json({
          success: true,
          data: { items: [], total: 0, page, per_page: perPage, total_pages: 0 },
        });
      }
    }

    // ─── Consulta ────────────────────────────────────────────
    let query = supabase
      .from('bizus')
      .select(
        `id, titulo, conteudo, nivel_impacto, exemplo_pratico, criado_em,
         assuntos!inner (id, nome, materia_id,
           materias!inner (id, nome, icone_emoji))`,
        { count: 'exact' }
      );

    if (materiaIds) query = query.in('assuntos.materia_id', materiaIds);

    const assuntoId = searchParams.get('assunto_id');
    if (assuntoId) query = query.eq('assunto_id', assuntoId);

    const impacto = searchParams.get('impacto');
    if (impacto && impacto !== 'todos') query = query.eq('nivel_impacto', impacto);

    if (searchParams.get('favoritos') === '1') {
      query = query.in('id', favoritos);
    }

    const busca = searchParams.get('busca');
    if (busca && busca.trim().length >= 3) {
      const termo = `%${busca.trim()}%`;
      query = query.or(`titulo.ilike.${termo},conteudo.ilike.${termo}`);
    }

    const offset = (page - 1) * perPage;
    const { data, count, error } = await query
      // "alto" impacto primeiro: é o que o aluno deve ler antes da prova.
      .order('nivel_impacto')
      .order('criado_em', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        items: (data ?? []).map((b) => ({
          ...b,
          favoritado: favoritos.includes(b.id),
        })),
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
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
