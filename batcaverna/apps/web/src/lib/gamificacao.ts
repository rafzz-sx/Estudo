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
export async function sortearFrase(
  supabase: SupabaseClient,
  categoria: 'erro' | 'acerto' | 'combo_quebrado' | 'retorno'
): Promise<string | null> {
  const { data } = await supabase
    .from('frases_motivacionais')
    .select('texto')
    .eq('categoria', categoria)
    .eq('ativa', true);

  if (!data || data.length === 0) return null;
  return data[Math.floor(Math.random() * data.length)].texto;
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

/**
 * Concede as badges cujo critério o usuário acabou de atingir.
 * Devolve as recém-conquistadas para a tela poder comemorar.
 */
export async function conferirBadges(
  supabase: SupabaseClient,
  userId: string,
  estado: EstadoUsuario
): Promise<{ nome: string; icone: string; cor_hex: string }[]> {
  const { data: badges } = await supabase
    .from('badges')
    .select('id, nome, icone, cor_hex, criterio_tipo, criterio_valor')
    .not('criterio_tipo', 'is', null)
    .neq('criterio_tipo', 'manual');

  if (!badges?.length) return [];

  const { data: jaTem } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const conquistadas = new Set((jaTem ?? []).map((b) => b.badge_id));

  const novas = badges.filter((b) => {
    if (conquistadas.has(b.id)) return false;
    const campo = CAMPO_POR_CRITERIO[b.criterio_tipo as string];
    if (!campo || b.criterio_valor == null) return false;
    return (estado[campo] ?? 0) >= b.criterio_valor;
  });

  if (!novas.length) return [];

  await supabase.from('user_badges').insert(
    novas.map((b) => ({ user_id: userId, badge_id: b.id }))
  );

  await supabase.from('notificacoes').insert(
    novas.map((b) => ({
      user_id: userId,
      // O enum `notificacao_tipo` define 'badge_conquistado' no masculino.
      // Com 'badge_conquistada' o Postgres rejeitava o INSERT inteiro e o
      // aluno nunca era avisado da insígnia nova.
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
}

/**
 * Corrige a resposta e persiste TODO o estado de gamificação.
 * Esta função é a única autorizada a mexer em XP, combo e contadores.
 */
export async function registrarResposta(
  supabase: SupabaseClient,
  userId: string,
  questao: QuestaoParaCorrecao,
  respostaDada: string,
  tempoGastoSegundos: number
): Promise<ResultadoResposta> {
  // Questão anulada pela banca conta como acerto para todo mundo: foi a
  // prova que falhou, não o aluno. Não pode quebrar combo nem sujar a
  // estatística de quem "errou" uma questão que não valia.
  const anulada = questao.anulada === true;

  const correta =
    anulada ||
    questao.resposta_correta.trim().toUpperCase() ===
      respostaDada.trim().toUpperCase();

  const { data: user } = await supabase
    .from('users')
    .select(
      `xp_total, nivel_atual, combo_atual, maior_combo_pessoal, streak_dias,
       maior_streak, ultimo_dia_estudado, total_questoes_respondidas,
       total_acertos, tempo_estudo_total_segundos,
       escudos_streak, escudo_recarregado_em, escudos_usados_total`
    )
    .eq('id', userId)
    .single();

  // A questão já estava na fila de revisão ANTES desta resposta?
  // Precisa ser consultado agora, porque `atualizarRevisao` (lá embaixo)
  // reescreve o agendamento e depois já não dá para saber.
  const { data: filaAntes } = await supabase
    .from('revisoes_agendadas')
    .select('id')
    .eq('user_id', userId)
    .eq('questao_id', questao.id)
    .eq('ativa', true)
    .maybeSingle();

  const eraRevisao = !!filaAntes;

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

  // 1. Histórico da resposta
  await supabase.from('user_questao_respostas').insert({
    user_id: userId,
    questao_id: questao.id,
    resposta_dada: respostaDada.trim().toUpperCase().slice(0, 2),
    correta,
    tempo_gasto_segundos: Math.max(0, Math.min(tempoGastoSegundos, 3600)),
    combo_no_momento: novoCombo,
  });

  // 2. Estado do usuário — aqui é onde o XP passa a existir de verdade
  await supabase
    .from('users')
    .update({
      xp_total: xpDepois,
      nivel_atual: nivelDepois.nivel,
      combo_atual: novoCombo,
      combo_atualizado_em: new Date().toISOString(),
      maior_combo_pessoal: maiorCombo,
      streak_dias: streak,
      // O recorde histórico se compara com ele mesmo, não com a sequência
      // corrente. Comparando com `streak_dias` (que acabou de ser
      // recalculado), quem tinha recorde de 40 dias e furou a corrente via o
      // recorde ser reescrito para 1 na resposta seguinte.
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

  // 3. Estatística por matéria (alimenta "o que mais estuda")
  if (questao.materia_id) {
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
  }

  // 4. Índice de acerto da própria questão — serve para recalibrar a
  //    dificuldade declarada pela banca com o desempenho real dos alunos.
  //    É estatística agregada: se falhar, não invalida a resposta do aluno.
  try {
    const { data: q } = await supabase
      .from('questoes')
      .select('vezes_respondida, vezes_acertada')
      .eq('id', questao.id)
      .single();

    await supabase
      .from('questoes')
      .update({
        vezes_respondida: (q?.vezes_respondida ?? 0) + 1,
        vezes_acertada: (q?.vezes_acertada ?? 0) + (correta ? 1 : 0),
      })
      .eq('id', questao.id);
  } catch {
    // silencioso de propósito
  }

  // 5. Repetição espaçada — agenda o retorno desta questão
  let revisao = null;
  try {
    revisao = await atualizarRevisao(supabase, userId, questao.id, correta);
  } catch (e) {
    // A revisão é um complemento: se falhar, a resposta continua válida.
    console.warn('Falha ao agendar revisão espaçada:', e);
  }

  // 6. Badges e frase
  const badgesNovas = await conferirBadges(supabase, userId, {
    xp_total: xpDepois,
    total_questoes_respondidas: totalRespondidas,
    maior_combo_pessoal: maiorCombo,
    streak_dias: streak,
    tempo_estudo_total_segundos: user?.tempo_estudo_total_segundos ?? 0,
  });

  let frase: string | null = null;
  if (!correta) {
    // Quebrar um combo alto merece uma mensagem diferente de errar do zero.
    frase = await sortearFrase(
      supabase,
      comboAnterior >= 5 ? 'combo_quebrado' : 'erro'
    );
    if (!frase) frase = await sortearFrase(supabase, 'erro');
  } else if (novoCombo > 0 && novoCombo % 10 === 0) {
    frase = await sortearFrase(supabase, 'acerto');
  }

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
