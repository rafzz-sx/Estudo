import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/questoes
 *
 * Filtros (todos opcionais e combináveis):
 *   concurso      sigla, ex.: EEAR   (os cards de concurso linkam por sigla)
 *   concurso_id   UUID
 *   materia       nome, ex.: Matemática
 *   materia_id    UUID
 *   assunto       nome
 *   assunto_id    UUID
 *   area          natureza | humanas | linguagens | matematica  (ENEM)
 *   ano           2025
 *   dificuldade   facil | medio | dificil
 *   busca         texto livre no enunciado
 *   nao_respondidas=1   esconde o que o usuário já respondeu
 *   ordem         recentes | antigas | aleatoria
 *   page, per_page
 *
 * O gabarito só é devolvido a quem já respondeu a questão — quem está
 * resolvendo recebe a questão sem `resposta_correta`/`explicacao`, senão
 * bastaria abrir o DevTools para colar.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('per_page') || '10'))
    );

    // ─── Resolve siglas/nomes para UUID ──────────────────────
    let concursoId = searchParams.get('concurso_id');
    const concursoSigla = searchParams.get('concurso');
    if (!concursoId && concursoSigla && concursoSigla.toLowerCase() !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', concursoSigla)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({
          success: true,
          data: { items: [], total: 0, page, per_page: perPage, total_pages: 0 },
        });
      }
      concursoId = data.id;
    }

    let materiaId = searchParams.get('materia_id');
    const materiaNome = searchParams.get('materia');
    if (!materiaId && materiaNome && materiaNome.toLowerCase() !== 'todas') {
      const { data } = await supabase
        .from('materias')
        .select('id')
        .ilike('nome', materiaNome)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({
          success: true,
          data: { items: [], total: 0, page, per_page: perPage, total_pages: 0 },
        });
      }
      materiaId = data.id;
    }

    // ─── Monta a consulta ────────────────────────────────────
    let query = supabase
      .from('questoes')
      .select(
        `
        id, concurso_id, materia_id, assunto_id,
        texto_base, enunciado, alternativas,
        ano, banca, dificuldade, dia_prova, numero_ordem, numero_original,
        area_conhecimento, figura_descricao, figura_svg, precisa_resolucao, anulada,
        vezes_respondida, vezes_acertada,
        concursos (id, sigla, nome, emoji, cor_tema),
        materias  (id, nome, icone_emoji),
        assuntos  (id, nome)
      `,
        { count: 'exact' }
      )
      .eq('ativa', true);

    if (concursoId) query = query.eq('concurso_id', concursoId);
    if (materiaId) query = query.eq('materia_id', materiaId);

    const assuntoId = searchParams.get('assunto_id');
    if (assuntoId) query = query.eq('assunto_id', assuntoId);

    const area = searchParams.get('area');
    if (area && area !== 'todas') query = query.eq('area_conhecimento', area);

    const ano = searchParams.get('ano');
    if (ano && ano !== 'todos') query = query.eq('ano', parseInt(ano));

    const dificuldade = searchParams.get('dificuldade');
    if (dificuldade && dificuldade !== 'todas') {
      query = query.eq('dificuldade', dificuldade.toLowerCase());
    }

    const busca = searchParams.get('busca');
    if (busca && busca.trim().length >= 3) {
      query = query.ilike('enunciado', `%${busca.trim()}%`);
    }

    // ─── Esconde o que o usuário já respondeu ────────────────
    const user = await getAuthUserFromRequest(req);
    if (user && searchParams.get('nao_respondidas') === '1') {
      // Um `NOT IN` com milhares de UUIDs vira uma URL gigantesca e o
      // PostgREST rejeita. Pegamos as mais recentes, que é o que importa
      // para não repetir questão logo em seguida.
      const LIMITE_EXCLUSAO = 800;

      const { data: respondidas } = await supabase
        .from('user_questao_respostas')
        .select('questao_id')
        .eq('user_id', user.id)
        .order('respondido_em', { ascending: false })
        .limit(LIMITE_EXCLUSAO);

      const ids = [...new Set((respondidas ?? []).map((r) => r.questao_id))];
      if (ids.length) query = query.not('id', 'in', `(${ids.join(',')})`);
    }

    // ─── Ordenação ───────────────────────────────────────────
    const ordem = searchParams.get('ordem') || 'recentes';
    if (ordem === 'antigas') {
      query = query
        .order('ano', { ascending: true, nullsFirst: false })
        .order('numero_ordem', { ascending: true });
    } else {
      query = query
        .order('ano', { ascending: false, nullsFirst: false })
        .order('numero_ordem', { ascending: true });
    }

    const offset = (page - 1) * perPage;
    const { data, count, error } = await query.range(offset, offset + perPage - 1);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        items: data ?? [],
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
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
