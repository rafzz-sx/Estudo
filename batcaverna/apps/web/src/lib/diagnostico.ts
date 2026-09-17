import type { SupabaseClient } from '@supabase/supabase-js';
import { lerTudo } from './contagens';

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
  /** Existe texto de teoria para este assunto? O radar leva o aluno até ele. */
  teoria_id: string | null;
  teoria_titulo: string | null;
}

export interface RespostaDiagnostico {
  questao_id: string;
  correta: boolean | null;
  respondido_em: string;
  assunto_id: string | null;
}

interface CatalogoAssuntosConcurso {
  totalPorAssunto: Map<string, number>;
  nomes: Map<
    string,
    { nome: string; materia_id: string | null; materia: string; emoji: string | null }
  >;
  teoriaPorTema: Map<string, { id: string; titulo: string }>;
  maxQuestoes: number;
}

/** Cache em memória do catálogo de cada concurso (30 min). */
const CACHE_CATALOGO_MS = 30 * 60 * 1000;
const cacheCatalogo = new Map<
  string,
  { dados: CatalogoAssuntosConcurso; validoAte: number }
>();
const promessasCatalogo = new Map<string, Promise<CatalogoAssuntosConcurso>>();

export function limparCacheDiagnostico(concursoId?: string) {
  if (concursoId) {
    cacheCatalogo.delete(concursoId);
    promessasCatalogo.delete(concursoId);
  } else {
    cacheCatalogo.clear();
    promessasCatalogo.clear();
  }
}

/**
 * Busca o histórico de respostas do usuário em query única, ordenada por respondido_em DESC.
 * Serve como fonte comum para radarDeFraqueza, evolucaoSemanal e errosEmAberto.
 */
export async function obterHistoricoRespostas(
  supabase: SupabaseClient,
  userId: string,
  concursoId?: string | null
): Promise<RespostaDiagnostico[]> {
  const dados = await lerTudo<{
    questao_id: string;
    correta: boolean | null;
    respondido_em: string;
    questoes: { assunto_id: string | null } | { assunto_id: string | null }[] | null;
  }>(() => {
    if (concursoId) {
      return supabase
        .from('user_questao_respostas')
        .select('questao_id, correta, respondido_em, questoes!inner (assunto_id)')
        .eq('user_id', userId)
        .eq('questoes.concurso_id', concursoId)
        .order('respondido_em', { ascending: false });
    }

    return supabase
      .from('user_questao_respostas')
      .select('questao_id, correta, respondido_em, questoes (assunto_id)')
      .eq('user_id', userId)
      .order('respondido_em', { ascending: false });
  });

  return (dados ?? []).map((r) => {
    const qAssunto = Array.isArray(r.questoes)
      ? r.questoes[0]?.assunto_id
      : r.questoes?.assunto_id;

    return {
      questao_id: r.questao_id,
      correta: r.correta,
      respondido_em: r.respondido_em,
      assunto_id: qAssunto ?? null,
    };
  });
}

/**
 * Carrega a estrutura de assuntos, questões e teorias do concurso.
 * Como estes dados são estáticos e dependem apenas do concurso (não do usuário),
 * são cacheados e deduplicados em memória por 30 minutos.
 */
export async function obterCatalogoConcurso(
  supabase: SupabaseClient,
  concursoId: string
): Promise<CatalogoAssuntosConcurso> {
  const agora = Date.now();
  const guardado = cacheCatalogo.get(concursoId);
  if (guardado && guardado.validoAte > agora) {
    return guardado.dados;
  }

  const emAndamento = promessasCatalogo.get(concursoId);
  if (emAndamento) {
    return emAndamento;
  }

  const promessa = (async () => {
    try {
      // 1. Contagem de questões por assunto no concurso
      const questoes = await lerTudo<{ id: string; assunto_id: string | null }>(() =>
        supabase
          .from('questoes')
          .select('id, assunto_id')
          .eq('concurso_id', concursoId)
      );

      const totalPorAssunto = new Map<string, number>();
      for (const q of questoes) {
        if (!q.assunto_id) continue;
        totalPorAssunto.set(q.assunto_id, (totalPorAssunto.get(q.assunto_id) ?? 0) + 1);
      }

      if (totalPorAssunto.size === 0) {
        return {
          totalPorAssunto,
          nomes: new Map(),
          teoriaPorTema: new Map(),
          maxQuestoes: 0,
        };
      }

      // 2. Metadados de assuntos e matérias em lotes paralelos
      const ids = [...totalPorAssunto.keys()];
      const nomes = new Map<
        string,
        { nome: string; materia_id: string | null; materia: string; emoji: string | null }
      >();

      const lotesAssuntos: string[][] = [];
      for (let i = 0; i < ids.length; i += 200) {
        lotesAssuntos.push(ids.slice(i, i + 200));
      }

      const resultadosAssuntos = await Promise.all(
        lotesAssuntos.map((lote) =>
          supabase
            .from('assuntos')
            .select('id, nome, materia_id, materias (nome, icone_emoji)')
            .in('id', lote)
        )
      );

      interface LinhaAssuntoComMateria {
        id: string;
        nome: string;
        materia_id: string | null;
        materias: { nome: string; icone_emoji: string | null } | { nome: string; icone_emoji: string | null }[] | null;
      }

      for (const res of resultadosAssuntos) {
        const registros = (res.data ?? []) as unknown as LinhaAssuntoComMateria[];
        for (const a of registros) {
          const m = Array.isArray(a.materias) ? a.materias[0] : a.materias;
          nomes.set(a.id, {
            nome: a.nome,
            materia_id: a.materia_id,
            materia: m?.nome ?? 'Geral',
            emoji: m?.icone_emoji ?? null,
          });
        }
      }

      // 3. Teoria disponível em lotes paralelos
      const nomesDeAssunto = [...new Set([...nomes.values()].map((n) => n.nome))];
      const teoriaPorTema = new Map<string, { id: string; titulo: string }>();

      const lotesTeoria: string[][] = [];
      for (let i = 0; i < nomesDeAssunto.length; i += 200) {
        lotesTeoria.push(nomesDeAssunto.slice(i, i + 200));
      }

      const resultadosTeoria = await Promise.all(
        lotesTeoria.map((lote) =>
          supabase
            .from('teoria_conteudo')
            .select('id, tema, titulo')
            .in('tema', lote)
        )
      );

      for (const res of resultadosTeoria) {
        for (const t of res.data ?? []) {
          if (!teoriaPorTema.has(t.tema)) {
            teoriaPorTema.set(t.tema, { id: t.id, titulo: t.titulo });
          }
        }
      }

      const maxQuestoes = Math.max(...totalPorAssunto.values());

      const dados: CatalogoAssuntosConcurso = {
        totalPorAssunto,
        nomes,
        teoriaPorTema,
        maxQuestoes,
      };

      cacheCatalogo.set(concursoId, {
        dados,
        validoAte: Date.now() + CACHE_CATALOGO_MS,
      });

      return dados;
    } finally {
      promessasCatalogo.delete(concursoId);
    }
  })();

  promessasCatalogo.set(concursoId, promessa);
  return promessa;
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
  concursoId: string,
  historico?: RespostaDiagnostico[]
): Promise<AssuntoDiagnostico[]> {
  // ─── 1. Quanto cada assunto cai neste concurso (catálogo cacheado) ─
  const catalogo = await obterCatalogoConcurso(supabase, concursoId);
  const { totalPorAssunto, nomes, teoriaPorTema, maxQuestoes } = catalogo;

  if (totalPorAssunto.size === 0) return [];

  // ─── 2. Desempenho do aluno, por assunto ─────────────────
  const respostas =
    historico ?? (await obterHistoricoRespostas(supabase, userId, concursoId));

  const desempenho = new Map<string, { total: number; acertos: number }>();
  for (const r of respostas) {
    const id = r.assunto_id;
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

  // ─── 3. Prioridade ───────────────────────────────────────
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
    const peso = maxQuestoes > 0 ? Math.sqrt(quantas / maxQuestoes) : 0;

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
      teoria_id: teoriaPorTema.get(info.nome)?.id ?? null,
      teoria_titulo: teoriaPorTema.get(info.nome)?.titulo ?? null,
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
  concursoId?: string | null,
  historico?: RespostaDiagnostico[]
): Promise<PontoEvolucao[]> {
  const desde = new Date();
  desde.setDate(desde.getDate() - semanas * 7);
  const desdeISO = desde.toISOString();

  let respostasFiltradas: { correta: boolean | null; respondido_em: string }[];

  if (historico) {
    respostasFiltradas = historico.filter(
      (r) => r.respondido_em && r.respondido_em >= desdeISO
    );
  } else {
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
          .gte('respondido_em', desdeISO);

        return concursoId ? q.eq('questoes.concurso_id', concursoId) : q;
      }
    );
    respostasFiltradas = respostas;
  }

  const porSemana = new Map<string, { total: number; acertos: number }>();
  for (const r of respostasFiltradas) {
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
  concursoId?: string | null,
  historico?: RespostaDiagnostico[]
): Promise<ErrosEmAberto> {
  let respostas: { questao_id: string; correta: boolean | null; respondido_em: string }[];

  if (historico) {
    respostas = historico;
  } else {
    respostas = await lerTudo<{
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
  }

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

/**
 * Executa o diagnóstico completo de um aluno em um concurso fazendo
 * APENAS UMA busca ao histórico de respostas (user_questao_respostas),
 * eliminando a redundância de buscar toda a base três vezes.
 */
export async function carregarDiagnosticoCompleto(
  supabase: SupabaseClient,
  userId: string,
  concursoId: string,
  semanas = 12
) {
  // 1. Puxa o histórico de respostas uma única vez
  const historico = await obterHistoricoRespostas(supabase, userId, concursoId);

  // 2. Executa as três agregações em paralelo reutilizando o histórico em memória
  const [erros, radar, evolucao] = await Promise.all([
    errosEmAberto(supabase, userId, concursoId, historico),
    radarDeFraqueza(supabase, userId, concursoId, historico),
    evolucaoSemanal(supabase, userId, semanas, concursoId, historico),
  ]);

  return {
    erros,
    radar,
    evolucao,
  };
}
