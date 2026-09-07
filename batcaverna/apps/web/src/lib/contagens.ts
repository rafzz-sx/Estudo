import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Contagens de questões.
 *
 * O PostgREST (camada REST do Supabase) limita o retorno a 1.000 linhas por
 * padrão. Contar questões puxando as linhas e usando `.length` funcionava
 * enquanto o banco tinha duas questões de exemplo — com 3.260, passaria a
 * mentir, mostrando "1.000" em todo lugar.
 *
 * Aqui contamos sempre com `count: 'exact', head: true`, que devolve só o
 * número, sem trafegar linha nenhuma. É mais correto e mais rápido.
 */

/**
 * Lê uma tabela inteira em fatias, contornando o teto de 1.000 linhas por
 * requisição do PostgREST.
 *
 * `montar` devolve a consulta JÁ com o `.select()` aplicado — no supabase-js
 * os filtros (`.eq`, `.gte`) só existem depois do select.
 *
 * Use em consultas que precisam de TODAS as linhas de uma tabela que cresce
 * com o uso (users, study_sessions, user_questao_respostas...). Para listas
 * paginadas na tela, `.range()` direto é o certo.
 */
export async function lerTudo<T>(
  montar: () => any,
  maximo = 100_000
): Promise<T[]> {
  const PAGINA = 1000;
  const acumulado: T[] = [];

  for (let inicio = 0; inicio < maximo; inicio += PAGINA) {
    const { data, error } = await montar().range(inicio, inicio + PAGINA - 1);

    if (error) throw error;
    if (!data?.length) break;

    acumulado.push(...(data as T[]));
    if (data.length < PAGINA) break;
  }

  return acumulado;
}

export interface FiltroContagem {
  concurso_id?: string | null;
  materia_id?: string | null;
  ano?: number | null;
  area_conhecimento?: string | null;
}

/** Conta questões ativas que casam com o filtro. */
export async function contarQuestoes(
  supabase: SupabaseClient,
  filtro: FiltroContagem = {}
): Promise<number> {
  let query = supabase
    .from('questoes')
    .select('id', { count: 'exact', head: true })
    .eq('ativa', true);

  if (filtro.concurso_id) query = query.eq('concurso_id', filtro.concurso_id);
  if (filtro.materia_id) query = query.eq('materia_id', filtro.materia_id);
  if (filtro.ano) query = query.eq('ano', filtro.ano);
  if (filtro.area_conhecimento) {
    query = query.eq('area_conhecimento', filtro.area_conhecimento);
  }

  const { count } = await query;
  return count ?? 0;
}

/**
 * Conta em paralelo para uma lista de ids.
 * Devolve { [id]: total }.
 */
export async function contarPorId(
  supabase: SupabaseClient,
  campo: 'concurso_id' | 'materia_id',
  ids: string[],
  extra: FiltroContagem = {}
): Promise<Record<string, number>> {
  if (!ids.length) return {};

  const resultados = await Promise.all(
    ids.map(async (id) => {
      const total = await contarQuestoes(supabase, { ...extra, [campo]: id });
      return [id, total] as const;
    })
  );

  return Object.fromEntries(resultados);
}

/**
 * Anos distintos com questões de um concurso.
 *
 * Não dá para fazer DISTINCT pelo PostgREST sem uma view, então lemos só a
 * coluna `ano` — uma coluna de inteiros é leve mesmo em alguns milhares de
 * linhas, e paginamos para não esbarrar no teto de 1.000.
 */
export async function anosDisponiveis(
  supabase: SupabaseClient,
  concursoId?: string | null
): Promise<number[]> {
  const anos = new Set<number>();
  const PAGINA = 1000;

  for (let inicio = 0; inicio < 30000; inicio += PAGINA) {
    let query = supabase
      .from('questoes')
      .select('ano')
      .eq('ativa', true)
      .not('ano', 'is', null)
      .range(inicio, inicio + PAGINA - 1);

    if (concursoId) query = query.eq('concurso_id', concursoId);

    const { data } = await query;
    if (!data?.length) break;

    for (const linha of data) {
      if (linha.ano) anos.add(linha.ano);
    }

    if (data.length < PAGINA) break;
  }

  return [...anos].sort((a, b) => b - a);
}
