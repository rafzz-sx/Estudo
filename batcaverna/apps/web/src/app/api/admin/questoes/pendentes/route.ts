import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/admin/questoes/pendentes
 *
 * As duas filas de trabalho sobre questões, na mesma rota porque a
 * maquinaria é a mesma — paginação, filtro por concurso e matéria, e a
 * ordenação por demanda real.
 *
 * ─── filtro=resolucao (padrão) ────────────────────────────────────────
 * Questões que chegaram sem gabarito comentado. 540 das 3.247 importadas
 * vêm de provas cujo .txt não trazia a seção de explicação (ENEM 2024 e
 * 2025 inteiros, EPCAR 2022, ESA 2024). O aluno vê a letra certa e não
 * entende o porquê — que é exatamente o que a plataforma promete resolver.
 *
 * ─── filtro=figura ────────────────────────────────────────────────────
 * Questões que dependem de um desenho e só têm a DESCRIÇÃO dele em texto.
 * São 347: 107 de Matemática, 85 de Física. O extrator do PDF não trazia
 * a imagem, então escreveu "[IMAGEM: um triângulo ABC com circunferência
 * inscrita de centro O...]" e a plataforma desenha isso num quadro branco.
 * Dá para resolver várias assim, mas em geometria o desenho costuma SER o
 * problema — ler a descrição e reconstruir a figura de cabeça é uma prova
 * diferente da que o aluno vai fazer.
 *
 * O caminho de exibição já existia inteiro: a coluna `figura_svg` (004), o
 * `QuadroFigura` que a renderiza, as cinco telas que a passam e o editor no
 * painel. O que faltava era a fila — todas as 347 têm explicação, então
 * NENHUMA aparecia no filtro de resolução. O editor existia e era
 * inalcançável justamente para as questões que precisam dele.
 *
 * Em ambas, a ordem `erradas` põe na frente o que mais derruba aluno:
 * desenhar a figura de uma questão que ninguém abriu não rende nada.
 *
 * Query: ?filtro=figura&concurso=EEAR&materia=Matemática&page=1&ordem=erradas
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
    const filtro = searchParams.get('filtro') === 'figura' ? 'figura' : 'resolucao';

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
      .eq('ativa', true);

    if (filtro === 'figura') {
      // Depende de desenho e ainda não tem um: a descrição existe, o SVG não.
      // `neq('figura_descricao', '')` porque a coluna aceita string vazia e
      // uma descrição em branco não é uma figura pendente, é ruído.
      query = query
        .not('figura_descricao', 'is', null)
        .neq('figura_descricao', '')
        .is('figura_svg', null);
    } else {
      query = query.or('resolucao_status.eq.pendente,explicacao.is.null');
    }

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
        // A tela precisa saber qual fila veio: as duas usam a mesma rota e
        // o mesmo editor, mas o texto e a contagem falam de coisas
        // diferentes — resolução que falta escrever, figura que falta desenhar.
        filtro,
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
