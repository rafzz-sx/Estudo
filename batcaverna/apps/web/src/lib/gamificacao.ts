import type { SupabaseClient } from '@supabase/supabase-js';
import {
  calcularNivel,
  calcularBonusCombo,
  PATAMARES_COMBO,
  patamarDoCombo,
  type PatamarCombo,
} from '@batcaverna/utils';
import { atualizarRevisao } from './revisao-espacada';

/**
 * Gamificação — fonte única da verdade, no servidor.
 *
 * Antes, o combo vivia num `useState` da página de questões e o XP era
 * somado apenas no store do navegador. Bastava trocar de página para o
 * combo zerar, e o `AppShell` sobrescrevia o XP local com o valor do banco
 * (que nunca tinha sido atualizado). Resultado: 12 acertos seguidos
 * viravam nada.
 *
 * Agora nada disso é calculado no cliente: a página manda a resposta, o
 * servidor decide e devolve o estado real para a tela exibir.
 */

// ─── Patamares de combo ──────────────────────────────────────
// A lista vive em @batcaverna/utils (fonte única, compartilhada com o
// cliente). Reexportada aqui para quem já importava deste módulo.
export { PATAMARES_COMBO, patamarDoCombo };
export type { PatamarCombo };

// ─── XP ──────────────────────────────────────────────────────
const XP_BASE: Record<string, number> = { facil: 10, medio: 15, dificil: 25 };
const XP_CONSOLACAO = 2;

/**
 * Acertar uma questão que já derrubou você vale 60% a mais.
 *
 * Antes, o XP premiava só volume e combo — então o incentivo era responder
 * muita questão fácil, rápido, e nunca voltar no que doeu. É exatamente o
 * contrário do que aprova.
 *
 * Rever o erro é a ação de maior rendimento da plataforma e a que o aluno
 * menos faz sozinho, porque dói mais. O XP passa a pagar por isso.
 */
const MULT_REVISAO = 1.6;

export function calcularXpResposta(
  acertou: boolean,
  dificuldade: string | null,
  novoCombo: number,
  eraRevisao = false
): number {
  if (!acertou) return XP_CONSOLACAO;
  const base = XP_BASE[dificuldade ?? 'medio'] ?? 15;
  const bruto = base * calcularBonusCombo(novoCombo);
  return Math.round(eraRevisao ? bruto * MULT_REVISAO : bruto);
}

// ─── Streak ──────────────────────────────────────────────────
function diasDeDiferenca(de: string, ate: string): number {
  const d1 = new Date(`${de}T00:00:00Z`).getTime();
  const d2 = new Date(`${ate}T00:00:00Z`).getTime();
  return Math.round((d2 - d1) / 86_400_000);
}

export interface EstadoEscudo {
  ultimoDiaEstudado: string | null;
  hoje: string;
  streakAtual: number;
  escudos?: number | null;
  recarregadoEm?: string | null;
}

export interface ResultadoStreak {
  streak: number;
  escudos: number;
  recarregado_em: string;
  /** true quando o escudo acabou de salvar a sequência. A tela comemora. */
  usou_escudo: boolean;
  /** true quando o escudo foi reposto agora. */
  recarregou: boolean;
}

/** A cada quantos dias o escudo volta. */
const DIAS_PARA_RECARGA = 7;

/**
 * Sequência de dias, com escudo.
 *
 * Antes, um dia perdido zerava tudo. Para um adolescente com escola, prova de
 * colégio e família, isso não gera disciplina: gera abandono. A pessoa perde
 * 40 dias por causa de um domingo e não volta, porque o número que a prendia
 * virou 1.
 *
 * O escudo cobre UM dia falho, recarrega sozinho a cada semana e funciona sem
 * a pessoa precisar saber que existe. Duas coisas ele deliberadamente NÃO faz:
 *
 *   • não cobre dois dias seguidos — a corrente precisa significar algo;
 *   • não acumula. Guardar escudos viraria um recurso a administrar, e a
 *     última coisa de que quem estuda para concurso precisa é de mais uma
 *     mecânica para gerenciar.
 */
export function avaliarStreak(estado: EstadoEscudo): ResultadoStreak {
  const { ultimoDiaEstudado, hoje, streakAtual } = estado;

  // ─── Recarga ─────────────────────────────────────────────
  let escudos = estado.escudos ?? 1;
  let recarregadoEm = estado.recarregadoEm ?? hoje;
  let recarregou = false;

  if (diasDeDiferenca(recarregadoEm, hoje) >= DIAS_PARA_RECARGA) {
    if (escudos < 1) {
      escudos = 1;
      recarregou = true;
    }
    recarregadoEm = hoje;
  }

  const semMudanca = (streak: number): ResultadoStreak => ({
    streak,
    escudos,
    recarregado_em: recarregadoEm,
    usou_escudo: false,
    recarregou,
  });

  if (!ultimoDiaEstudado) return semMudanca(1);

  const diff = diasDeDiferenca(ultimoDiaEstudado, hoje);

  if (diff <= 0) return semMudanca(Math.max(streakAtual, 1)); // já estudou hoje
  if (diff === 1) return semMudanca(streakAtual + 1); // dia seguinte

  // Faltou exatamente um dia e há escudo: a corrente segue, contando o dia
  // coberto. Gastar o escudo aqui é o ponto — ele existe para este caso.
  if (diff === 2 && escudos >= 1 && streakAtual >= 2) {
    return {
      streak: streakAtual + 1,
      escudos: escudos - 1,
      recarregado_em: recarregadoEm,
      usou_escudo: true,
      recarregou,
    };
  }

  return semMudanca(1); // furou demais
}

// ─── Frases motivacionais ────────────────────────────────────
/**
 * As 103 frases mudam quando alguém roda um seed novo — não durante o dia.
 * Buscar todas as da categoria a CADA questão respondida (o caminho mais
 * quente da plataforma) era uma consulta a mais por resposta, sempre com o
 * mesmo resultado. Ficam guardadas por 10 minutos no processo.
 *
 * O cache é por instância serverless: várias instâncias significam várias
 * cópias, o que não é problema — o conteúdo é idêntico e só de leitura.
 */
const CACHE_FRASES_MS = 10 * 60 * 1000;
const cacheFrases = new Map<string, { textos: string[]; validoAte: number }>();

export async function sortearFrase(
  supabase: SupabaseClient,
  categoria: 'erro' | 'acerto' | 'combo_quebrado' | 'retorno'
): Promise<string | null> {
  const agora = Date.now();
  const guardado = cacheFrases.get(categoria);

  let textos: string[];

  if (guardado && guardado.validoAte > agora) {
    textos = guardado.textos;
  } else {
    const { data } = await supabase
      .from('frases_motivacionais')
      .select('texto')
      .eq('categoria', categoria)
      .eq('ativa', true);

    textos = (data ?? []).map((f) => f.texto).filter(Boolean);

    // Só guarda o que veio de verdade: um erro passageiro de rede não pode
    // deixar a categoria muda por dez minutos.
    if (textos.length > 0) {
      cacheFrases.set(categoria, { textos, validoAte: agora + CACHE_FRASES_MS });
    }
  }

  if (textos.length === 0) return null;
  return textos[Math.floor(Math.random() * textos.length)];
}

// ─── Badges ──────────────────────────────────────────────────
interface EstadoUsuario {
  xp_total: number;
  total_questoes_respondidas: number;
  maior_combo_pessoal: number;
  streak_dias: number;
  /** O escudo salvou a sequência agora? A tela comemora quando sim. */
  usou_escudo: boolean;
  escudos_restantes: number;
  /** Esta questão veio da fila de revisão — o XP dela vale 60% a mais. */
  era_revisao: boolean;
  tempo_estudo_total_segundos: number;
}

const CAMPO_POR_CRITERIO: Record<string, keyof EstadoUsuario> = {
  xp: 'xp_total',
  questoes: 'total_questoes_respondidas',
  combo: 'maior_combo_pessoal',
  streak: 'streak_dias',
  tempo: 'tempo_estudo_total_segundos',
};

interface BadgeCacheItem {
  id: string;
  nome: string;
  icone: string;
  cor_hex: string;
  criterio_tipo: string;
  criterio_valor: number;
}
const CACHE_BADGES_MS = 10 * 60 * 1000;
let cacheBadges: { items: BadgeCacheItem[]; validoAte: number } | null = null;

/**
 * Concede as badges cujo critério o usuário acabou de atingir.
 * Devolve as recém-conquistadas para a tela poder comemorar.
 */
export async function conferirBadges(
  supabase: SupabaseClient,
  userId: string,
  estado: EstadoUsuario
): Promise<{ nome: string; icone: string; cor_hex: string }[]> {
  const agora = Date.now();
  let badges: BadgeCacheItem[];

  if (cacheBadges && cacheBadges.validoAte > agora) {
    badges = cacheBadges.items;
  } else {
    const { data } = await supabase
      .from('badges')
      .select('id, nome, icone, cor_hex, criterio_tipo, criterio_valor')
      .not('criterio_tipo', 'is', null)
      .neq('criterio_tipo', 'manual');

    badges = (data ?? []) as BadgeCacheItem[];
    if (badges.length > 0) {
      cacheBadges = { items: badges, validoAte: agora + CACHE_BADGES_MS };
    }
  }

  if (!badges?.length) return [];

  // Checagem rápida em memória: se o usuário não atingiu a pontuação de NENHUM badge,
  // nem precisa consultar user_badges no banco. Reduz 1 query a cada questão!
  const atingiramCriterio = badges.filter((b) => {
    const campo = CAMPO_POR_CRITERIO[b.criterio_tipo as string];
    if (!campo || b.criterio_valor == null) return false;
    return Number(estado[campo] ?? 0) >= b.criterio_valor;
  });

  if (!atingiramCriterio.length) return [];

  const { data: jaTem } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const conquistadas = new Set((jaTem ?? []).map((b) => b.badge_id));

  const novas = atingiramCriterio.filter((b) => !conquistadas.has(b.id));

  if (!novas.length) return [];

  await supabase.from('user_badges').insert(
    novas.map((b) => ({ user_id: userId, badge_id: b.id }))
  );

  await supabase.from('notificacoes').insert(
    novas.map((b) => ({
      user_id: userId,
      tipo: 'badge_conquistado',
      titulo: `Nova insígnia: ${b.nome}`,
      mensagem: `Você desbloqueou "${b.nome}". Ela já pode ser exibida no seu mini-perfil.`,
      dados_extra: { badge_id: b.id, icone: b.icone },
    }))
  );

  return novas.map((b) => ({
    nome: b.nome,
    icone: b.icone ?? '🏅',
    cor_hex: b.cor_hex ?? '#F5C518',
  }));
}

// ─── Registro de resposta ────────────────────────────────────
export interface ResultadoResposta {
  correta: boolean;
  resposta_correta: string;
  explicacao: string | null;
  explicacao_alternativas: unknown;
  resolucao_passos: unknown;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  // Repetição espaçada: quando esta questão volta para o aluno
  revisao: {
    agendada_para: string | null;
    etapa: number | null;
    aprendida: boolean;
    entrou_na_fila: boolean;
  } | null;
  xp_ganho: number;
  xp_total: number;
  novo_combo: number;
  combo_anterior: number;
  patamar: PatamarCombo | null;
  patamar_novo: boolean;
  maior_combo_pessoal: number;
  streak_dias: number;
  /** O escudo salvou a sequência agora? A tela comemora quando sim. */
  usou_escudo: boolean;
  escudos_restantes: number;
  /** Esta questão veio da fila de revisão — o XP dela vale 60% a mais. */
  era_revisao: boolean;
  nivel: ReturnType<typeof calcularNivel>;
  subiu_nivel: boolean;
  frase_motivacional: string | null;
  badges_novas: { nome: string; icone: string; cor_hex: string }[];
  total_respondidas: number;
  total_acertos: number;
}

interface QuestaoParaCorrecao {
  id: string;
  resposta_correta: string;
  /** Questão anulada pela banca: não pode contar como erro do aluno. */
  anulada?: boolean | null;
  explicacao: string | null;
  explicacao_alternativas?: unknown;
  resolucao_passos: unknown;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean | null;
  dificuldade: string | null;
  materia_id: string | null;
  concurso_id: string | null;
  bizu_relacionado_id?: string | null;
  vezes_respondida?: number | null;
  vezes_acertada?: number | null;
}

export interface DadosOtimizados {
  dadosUsuario?: any;
  dadosRevisao?: any;
}

/**
 * Corrige a resposta e persiste TODO o estado de gamificação.
 * Esta função é a única autorizada a mexer em XP, combo e contadores.
 * Executa todas as operações de banco em paralelo para resposta instantânea.
 */
export async function registrarResposta(
  supabase: SupabaseClient,
  userId: string,
  questao: QuestaoParaCorrecao,
  respostaDada: string,
  tempoGastoSegundos: number,
  otimizados?: DadosOtimizados
): Promise<ResultadoResposta> {
  const anulada = questao.anulada === true;

  const correta =
    anulada ||
    questao.resposta_correta.trim().toUpperCase() ===
      respostaDada.trim().toUpperCase();

  // Reutiliza perfil se fornecido pela rota otimizada, ou consulta
  let user = otimizados?.dadosUsuario;
  if (!user) {
    const { data } = await supabase
      .from('users')
      .select(
        `xp_total, nivel_atual, combo_atual, maior_combo_pessoal, streak_dias,
         maior_streak, ultimo_dia_estudado, total_questoes_respondidas,
         total_acertos, tempo_estudo_total_segundos,
         escudos_streak, escudo_recarregado_em, escudos_usados_total`
      )
      .eq('id', userId)
      .single();
    user = data;
  }

  // Reutiliza agendamento se fornecido pela rota otimizada, ou consulta
  let filaAntes = otimizados?.dadosRevisao;
  if (filaAntes === undefined) {
    const { data } = await supabase
      .from('revisoes_agendadas')
      .select('id, etapa, agendada_para, total_erros, total_revisoes, ativa')
      .eq('user_id', userId)
      .eq('questao_id', questao.id)
      .maybeSingle();
    filaAntes = data;
  }

  const eraRevisao = !!filaAntes && filaAntes.ativa === true;

  const comboAnterior = user?.combo_atual ?? 0;
  const novoCombo = correta ? comboAnterior + 1 : 0;
  const xpGanho = calcularXpResposta(
    correta,
    questao.dificuldade,
    novoCombo,
    eraRevisao
  );

  const xpAntes = user?.xp_total ?? 0;
  const xpDepois = xpAntes + xpGanho;
  const nivelAntes = calcularNivel(xpAntes);
  const nivelDepois = calcularNivel(xpDepois);

  const hoje = new Date().toISOString().slice(0, 10);
  const resStreak = avaliarStreak({
    ultimoDiaEstudado: user?.ultimo_dia_estudado ?? null,
    hoje,
    streakAtual: user?.streak_dias ?? 0,
    escudos: user?.escudos_streak,
    recarregadoEm: user?.escudo_recarregado_em,
  });
  const streak = resStreak.streak;

  const maiorCombo = Math.max(user?.maior_combo_pessoal ?? 0, novoCombo);
  const totalRespondidas = (user?.total_questoes_respondidas ?? 0) + 1;
  const totalAcertos = (user?.total_acertos ?? 0) + (correta ? 1 : 0);

  // ─── EXECUÇÃO EM PARALELO DE TODAS AS GRAVAÇÕES ─────────────────────────────
  // Em vez de 10 chamadas sequenciais que travavam a tela por segundos,
  // todas as gravações disparam simultaneamente via Promise.all!

  // 1. Histórico da resposta
  const pHistorico = supabase.from('user_questao_respostas').insert({
    user_id: userId,
    questao_id: questao.id,
    resposta_dada: respostaDada.trim().toUpperCase().slice(0, 2),
    correta,
    tempo_gasto_segundos: Math.max(0, Math.min(tempoGastoSegundos, 3600)),
    combo_no_momento: novoCombo,
  });

  // 2. Estado do usuário
  const pUser = supabase
    .from('users')
    .update({
      xp_total: xpDepois,
      nivel_atual: nivelDepois.nivel,
      combo_atual: novoCombo,
      combo_atualizado_em: new Date().toISOString(),
      maior_combo_pessoal: maiorCombo,
      streak_dias: streak,
      maior_streak: Math.max(user?.maior_streak ?? 0, streak),
      escudos_streak: resStreak.escudos,
      escudo_recarregado_em: resStreak.recarregado_em,
      escudos_usados_total:
        (user?.escudos_usados_total ?? 0) + (resStreak.usou_escudo ? 1 : 0),
      ultimo_dia_estudado: hoje,
      total_questoes_respondidas: totalRespondidas,
      total_acertos: totalAcertos,
    })
    .eq('id', userId);

  // 3. Estatística por matéria (executa em paralelo sem travar o resto)
  const pMateriaStats = (async () => {
    if (!questao.materia_id) return;
    try {
      const { data: stat } = await supabase
        .from('user_materia_stats')
        .select('questoes_respondidas, acertos, tempo_segundos')
        .eq('user_id', userId)
        .eq('materia_id', questao.materia_id)
        .eq('concurso_id', questao.concurso_id)
        .maybeSingle();

      await supabase.from('user_materia_stats').upsert(
        {
          user_id: userId,
          materia_id: questao.materia_id,
          concurso_id: questao.concurso_id,
          questoes_respondidas: (stat?.questoes_respondidas ?? 0) + 1,
          acertos: (stat?.acertos ?? 0) + (correta ? 1 : 0),
          tempo_segundos: (stat?.tempo_segundos ?? 0) + tempoGastoSegundos,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'user_id,materia_id,concurso_id' }
      );
    } catch {
      // Silencioso
    }
  })();

  // 4. Contador de acertos da questão
  const pQuestao = (async () => {
    try {
      const vezesResp = (questao.vezes_respondida ?? 0) + 1;
      const vezesAcert = (questao.vezes_acertada ?? 0) + (correta ? 1 : 0);
      await supabase
        .from('questoes')
        .update({
          vezes_respondida: vezesResp,
          vezes_acertada: vezesAcert,
        })
        .eq('id', questao.id);
    } catch {
      // Silencioso
    }
  })();

  // 5. Repetição espaçada (reaproveitando dados da consulta inicial)
  const pRevisao = atualizarRevisao(
    supabase,
    userId,
    questao.id,
    correta,
    filaAntes ?? null
  );

  // 6. Badges (com cache em memória e checagem rápida)
  const pBadges = conferirBadges(supabase, userId, {
    xp_total: xpDepois,
    total_questoes_respondidas: totalRespondidas,
    maior_combo_pessoal: maiorCombo,
    streak_dias: streak,
    tempo_estudo_total_segundos: user?.tempo_estudo_total_segundos ?? 0,
    usou_escudo: resStreak.usou_escudo,
    escudos_restantes: resStreak.escudos,
    era_revisao: eraRevisao,
  });

  // 7. Frase motivacional
  const pFrase = (async () => {
    if (!correta) {
      const f = await sortearFrase(
        supabase,
        comboAnterior >= 5 ? 'combo_quebrado' : 'erro'
      );
      return f || (await sortearFrase(supabase, 'erro'));
    } else if (novoCombo > 0 && novoCombo % 10 === 0) {
      return await sortearFrase(supabase, 'acerto');
    }
    return null;
  })();

  // Aguarda todos os updates em paralelo
  const [, , , , revisao, badgesNovas, frase] = await Promise.all([
    pHistorico,
    pUser,
    pMateriaStats,
    pQuestao,
    pRevisao,
    pBadges,
    pFrase,
  ]);

  const patamarAtual = patamarDoCombo(novoCombo);
  const patamarAntigo = patamarDoCombo(comboAnterior);

  return {
    correta,
    resposta_correta: questao.resposta_correta,
    explicacao: questao.explicacao,
    explicacao_alternativas: questao.explicacao_alternativas ?? null,
    resolucao_passos: questao.resolucao_passos,
    figura_descricao: questao.figura_descricao,
    figura_svg: questao.figura_svg,
    precisa_resolucao: questao.precisa_resolucao ?? false,
    revisao,
    xp_ganho: xpGanho,
    xp_total: xpDepois,
    novo_combo: novoCombo,
    combo_anterior: comboAnterior,
    patamar: patamarAtual,
    patamar_novo:
      !!patamarAtual && patamarAtual.rotulo !== patamarAntigo?.rotulo,
    maior_combo_pessoal: maiorCombo,
    streak_dias: streak,
    usou_escudo: resStreak.usou_escudo,
    escudos_restantes: resStreak.escudos,
    era_revisao: eraRevisao,
    nivel: nivelDepois,
    subiu_nivel: nivelDepois.nivel > nivelAntes.nivel,
    frase_motivacional: frase,
    badges_novas: badgesNovas,
    total_respondidas: totalRespondidas,
    total_acertos: totalAcertos,
  };
}
