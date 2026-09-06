import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/admin/questoes/pendentes
 *
 * A fila de questões que chegaram sem gabarito comentado.
 *
 * 540 das 3.247 questões importadas vêm de provas cujo .txt não trazia a
 * seção de explicação (ENEM 2024 e 2025 inteiros, EPCAR 2022, ESA 2024).
 * O aluno vê a letra certa e não entende o porquê — que é exatamente o que
 * a plataforma promete resolver.
 *
 * Esta rota ordena a fila por DEMANDA REAL: a questão que mais gente errou
 * aparece primeiro. Escrever a resolução dela rende mais que escrever a de
 * uma questão que ninguém abriu.
 *
 * Query: ?concurso=EEAR&materia=Matemática&page=1&per_page=20&ordem=erradas
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito ao administrador.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('per_page') ?? '20', 10))
    );
    const concurso = searchParams.get('concurso');
    const materia = searchParams.get('materia');
    const ordem = searchParams.get('ordem') ?? 'erradas';

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('questoes')
      .select(
        `id, enunciado, texto_base, alternativas, resposta_correta, explicacao,
         resolucao_passos, resolucao_status, precisa_resolucao, figura_descricao,
         figura_svg, ano, dia_prova, numero_original, dificuldade, anulada,
         vezes_respondida, vezes_acertada,
         concursos ( sigla, nome ),
         materias ( nome, icone_emoji ),
         assuntos ( nome )`,
        { count: 'exact' }
      )
      .eq('ativa', true)
      .or('resolucao_status.eq.pendente,explicacao.is.null');

    if (concurso && concurso !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', concurso)
        .maybeSingle();
      if (data) query = query.eq('concurso_id', data.id);
    }

    if (materia && materia !== 'todas') {
      const { data } = await supabase
        .from('materias')
        .select('id')
        .ilike('nome', materia)
        .maybeSingle();
      if (data) query = query.eq('materia_id', data.id);
    }

    // "erradas": prioriza o que mais derruba aluno. É a fila que rende.
    if (ordem === 'erradas') {
      query = query
        .order('vezes_respondida', { ascending: false })
        .order('vezes_acertada', { ascending: true });
    } else {
      query = query.order('ano', { ascending: false });
    }

    const inicio = (page - 1) * perPage;
    const { data, error, count } = await query.range(
      inicio,
      inicio + perPage - 1
    );

    if (error) throw error;

    // `count: 'exact'` acima já devolve o total real da consulta, sem o
    // teto de 1.000 linhas do PostgREST. Serve para a barra de progresso.
    const totalPendentes = count ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        items: data ?? [],
        total: totalPendentes,
        page,
        per_page: perPage,
        total_pages: Math.ceil((totalPendentes ?? 0) / perPage),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/questoes/pendentes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar a fila de resolução.' },
      { status: 500 }
    );
  }
}
