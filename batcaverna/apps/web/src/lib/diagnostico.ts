import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Diagnóstico de estudo — o motor por trás do "o que eu estudo agora".
 *
 * A plataforma sempre teve os dois números necessários para responder isso e
 * nunca os cruzou:
 *
 *   • quanto o aluno erra em cada assunto  (user_questao_respostas)
 *   • quanto cada assunto cai na prova      (contagem de questões oficiais)
 *
 * Separados, nenhum dos dois orienta. "Você acerta 40% em Números Complexos"
 * não diz nada se Números Complexos caiu 6 vezes em 10 anos. "Geometria Plana
 * tem 134 questões" não diz nada se o aluno já acerta 90% dela.
 *
 * Cruzados, respondem a única pergunta que importa numa véspera:
 * **onde a próxima hora de estudo rende mais ponto na prova.**
 *
 * ─── Sobre a suavização ──────────────────────────────────────────────────
 * Um aluno que respondeu 1 questão de Trigonometria e errou tem taxa 0%.
 * Sem tratamento, esse assunto vai para o topo do radar acima de um em que
 * ele errou 12 de 30 — o que é ruim, porque uma amostra de 1 não é sinal, é
 * ruído. A taxa entra suavizada contra a média do próprio aluno, com peso
 * `K_SUAVIZACAO`: quanto menos respostas, mais o assunto é puxado para a
 * média, e menos ele consegue liderar o ranking sozinho.
 */

/** Quantas "respostas fantasma" na média o assunto carrega. Ver acima. */
const K_SUAVIZACAO = 4;

/** Abaixo disso o assunto é "pouco testado" e a tela avisa. */
const MINIMO_CONFIAVEL = 5;

export type SituacaoAssunto =
  | 'critico'      // erra muito e cai muito
  | 'atencao'      // erra, mas cai menos — ou cai muito e erra pouco
  | 'dominado'     // acerta bem
  | 'nao_testado'; // nunca respondeu

export interface AssuntoDiagnostico {
  assunto_id: string;
  assunto: string;
  materia_id: string | null;
  materia: string;
  materia_emoji: string | null;
  /** Questões deste assunto no concurso — o "quanto cai". */
  questoes_no_concurso: number;
  respondidas: number;
  acertos: number;
  /** Taxa crua, para exibir. 0–100. */
  taxa: number;
  /** Taxa suavizada, usada no cálculo. 0–1. */
  taxa_ajustada: number;
  /** 0–100. Quanto maior, mais a próxima hora rende aqui. */
  prioridade: number;
  situacao: SituacaoAssunto;
  confiavel: boolean;
}

interface LinhaResposta {
  correta: boolean | null;
  questoes: { assunto_id: string | null } | null;
}

/** Lê tudo em fatias: o PostgREST corta em 1.000 linhas por requisição. */
async function lerTudo<T>(montar: () => any, maximo = 60_000): Promise<T[]> {
  const PAGINA = 1000;
  const acc: T[] = [];
  for (let i = 0; i < maximo; i += PAGINA) {
    const { data, error } = await montar().range(i, i + PAGINA - 1);
    if (error) throw error;
    if (!data?.length) break;
    acc.push(...(data as T[]));
    if (data.length < PAGINA) break;
  }
  return acc;
}

/**
 * Monta o radar de fraqueza do aluno num concurso.
 *
 * Devolve TODOS os assuntos do concurso, inclusive os que ele nunca tocou —
 * um assunto que cai muito e que o aluno nunca abriu é tão urgente quanto um
 * que ele erra, e é justamente o que ele não descobre sozinho.
 */
export async function radarDeFraqueza(
  supabase: SupabaseClient,
  userId: string,
  concursoId: string
): Promise<AssuntoDiagnostico[]> {
  // ─── 1. Quanto cada assunto cai neste concurso ───────────
  const questoes = await lerTudo<{ id: string; assunto_id: string | null }>(() =>
    supabase
      .from('questoes')
      .select('id, assunto_id')
      .eq('concurso_id', concursoId)
      .eq('ativa', true)
  );

  const totalPorAssunto = new Map<string, number>();
  for (const q of questoes) {
    if (!q.assunto_id) continue;
    totalPorAssunto.set(q.assunto_id, (totalPorAssunto.get(q.assunto_id) ?? 0) + 1);
  }

  if (totalPorAssunto.size === 0) return [];

  // ─── 2. Desempenho do aluno, por assunto ─────────────────
  // O filtro por concurso vem do JOIN com `questoes`: responder Geometria
  // Plana numa prova do ENEM não deveria contar como preparo para a EEAR
  // no radar da EEAR — as bancas cobram o mesmo assunto em profundidades
  // diferentes.
  const respostas = await lerTudo<LinhaResposta>(() =>
    supabase
      .from('user_questao_respostas')
      .select('correta, questoes!inner (assunto_id)')
      .eq('user_id', userId)
      .eq('questoes.concurso_id', concursoId)
  );

  const desempenho = new Map<string, { total: number; acertos: number }>();
  for (const r of respostas) {
    const id = r.questoes?.assunto_id;
    if (!id) continue;
    const atual = desempenho.get(id) ?? { total: 0, acertos: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    desempenho.set(id, atual);
  }

  // Média do próprio aluno. É contra ela que a suavização puxa — comparar
  // com 50% fixo seria injusto tanto com quem vai muito bem quanto com quem
  // está começando.
  const totalGeral = [...desempenho.values()].reduce((a, d) => a + d.total, 0);
  const acertosGeral = [...desempenho.values()].reduce((a, d) => a + d.acertos, 0);
  const mediaAluno = totalGeral > 0 ? acertosGeral / totalGeral : 0.5;

  // ─── 3. Nomes ────────────────────────────────────────────
  const ids = [...totalPorAssunto.keys()];
  const nomes = new Map<
    string,
    { nome: string; materia_id: string | null; materia: string; emoji: string | null }
  >();

  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await supabase
      .from('assuntos')
      .select('id, nome, materia_id, materias (nome, icone_emoji)')
      .in('id', ids.slice(i, i + 200));

    for (const a of data ?? []) {
      const m = (a as any).materias;
      nomes.set(a.id, {
        nome: a.nome,
        materia_id: a.materia_id,
        materia: m?.nome ?? 'Geral',
        emoji: m?.icone_emoji ?? null,
      });
    }
  }

  // ─── 4. Prioridade ───────────────────────────────────────
  const maxQuestoes = Math.max(...totalPorAssunto.values());

  const linhas: AssuntoDiagnostico[] = [];

  for (const [assuntoId, quantas] of totalPorAssunto) {
    const info = nomes.get(assuntoId);
    if (!info) continue;

    const d = desempenho.get(assuntoId) ?? { total: 0, acertos: 0 };
    const taxa = d.total > 0 ? d.acertos / d.total : 0;

    // Suavizada: (acertos + K·média) / (respondidas + K)
    const taxaAjustada =
      (d.acertos + K_SUAVIZACAO * mediaAluno) / (d.total + K_SUAVIZACAO);

    // Peso da frequência com raiz quadrada: sem ela, um assunto de 134
    // questões esmagaria um de 30 mesmo com o aluno indo bem no primeiro e
    // mal no segundo. A raiz achata a escala sem apagar a diferença.
    const peso = Math.sqrt(quantas / maxQuestoes);

    const prioridade = Math.round(peso * (1 - taxaAjustada) * 100);

    let situacao: SituacaoAssunto;
    if (d.total === 0) situacao = 'nao_testado';
    else if (taxaAjustada < 0.5) situacao = 'critico';
    else if (taxaAjustada < 0.75) situacao = 'atencao';
    else situacao = 'dominado';

    linhas.push({
      assunto_id: assuntoId,
      assunto: info.nome,
      materia_id: info.materia_id,
      materia: info.materia,
      materia_emoji: info.emoji,
      questoes_no_concurso: quantas,
      respondidas: d.total,
      acertos: d.acertos,
      taxa: Math.round(taxa * 100),
      taxa_ajustada: Number(taxaAjustada.toFixed(3)),
      prioridade,
      situacao,
      confiavel: d.total >= MINIMO_CONFIAVEL,
    });
  }

  return linhas.sort((a, b) => b.prioridade - a.prioridade);
}

// ─── Evolução ────────────────────────────────────────────────

export interface PontoEvolucao {
  semana: string; // 'YYYY-MM-DD' da segunda-feira
  respondidas: number;
  acertos: number;
  taxa: number;
}

/** Segunda-feira da semana de uma data ISO, em 'YYYY-MM-DD'. */
function segundaDaSemana(iso: string): string {
  const d = new Date(iso);
  const dia = d.getUTCDay(); // 0 = domingo
  const recuo = dia === 0 ? 6 : dia - 1;
  d.setUTCDate(d.getUTCDate() - recuo);
  return d.toISOString().slice(0, 10);
}

/**
 * Acerto por semana, nas últimas N semanas.
 *
 * É o gráfico que sustenta um ano de preparação: "sua taxa saiu de 42% para
 * 61% em três meses" faz o aluno continuar num dia ruim. O placar de hoje,
 * sozinho, não faz.
 */
export async function evolucaoSemanal(
  supabase: SupabaseClient,
  userId: string,
  semanas = 12,
  concursoId?: string | null
): Promise<PontoEvolucao[]> {
  const desde = new Date();
  desde.setDate(desde.getDate() - semanas * 7);

  const respostas = await lerTudo<{ correta: boolean | null; respondido_em: string }>(
    () => {
      const q = supabase
        .from('user_questao_respostas')
        .select(
          concursoId
            ? 'correta, respondido_em, questoes!inner (concurso_id)'
            : 'correta, respondido_em'
        )
        .eq('user_id', userId)
        .gte('respondido_em', desde.toISOString());

      return concursoId ? q.eq('questoes.concurso_id', concursoId) : q;
    }
  );

  const porSemana = new Map<string, { total: number; acertos: number }>();
  for (const r of respostas) {
    if (!r.respondido_em) continue;
    const chave = segundaDaSemana(r.respondido_em);
    const atual = porSemana.get(chave) ?? { total: 0, acertos: 0 };
    atual.total += 1;
    if (r.correta) atual.acertos += 1;
    porSemana.set(chave, atual);
  }

  return [...porSemana.entries()]
    .map(([semana, d]) => ({
      semana,
      respondidas: d.total,
      acertos: d.acertos,
      taxa: d.total > 0 ? Math.round((d.acertos / d.total) * 100) : 0,
    }))
    .sort((a, b) => a.semana.localeCompare(b.semana));
}

// ─── Erros em aberto ─────────────────────────────────────────

export interface ErrosEmAberto {
  /** Questões cuja ÚLTIMA resposta continua errada e que não foram marcadas como resolvidas. */
  ids: string[];
  total: number;
}

/**
 * Questões que ainda derrubam o aluno.
 *
 * A regra é a mesma de /api/caderno-erros e mora aqui para as duas telas não
 * divergirem: vale a ÚLTIMA resposta. Uma questão errada em janeiro e
 * acertada em março já foi aprendida e não deve voltar para a fila.
 *
 * Não existe tabela `caderno_erros`: a lista é derivada de
 * `user_questao_respostas` cruzada com `user_questao_notas.resolvida`.
 */
export async function errosEmAberto(
  supabase: SupabaseClient,
  userId: string,
  concursoId?: string | null
): Promise<ErrosEmAberto> {
  const respostas = await lerTudo<{
    questao_id: string;
    correta: boolean | null;
    respondido_em: string;
  }>(() => {
    const q = supabase
      .from('user_questao_respostas')
      .select(
        concursoId
          ? 'questao_id, correta, respondido_em, questoes!inner (concurso_id)'
          : 'questao_id, correta, respondido_em'
      )
      .eq('user_id', userId)
      .order('respondido_em', { ascending: false });

    return concursoId ? q.eq('questoes.concurso_id', concursoId) : q;
  });

  // A lista vem em ordem decrescente: o primeiro registro de cada questão é
  // a resposta mais recente.
  const ultima = new Map<string, boolean>();
  for (const r of respostas) {
    if (!ultima.has(r.questao_id)) ultima.set(r.questao_id, !!r.correta);
  }

  const erradas = [...ultima.entries()].filter(([, ok]) => !ok).map(([id]) => id);
  if (!erradas.length) return { ids: [], total: 0 };

  const { data: notas } = await supabase
    .from('user_questao_notas')
    .select('questao_id, resolvida')
    .eq('user_id', userId)
    .eq('resolvida', true);

  const resolvidas = new Set((notas ?? []).map((n) => n.questao_id));
  const abertos = erradas.filter((id) => !resolvidas.has(id));

  return { ids: abertos, total: abertos.length };
}
