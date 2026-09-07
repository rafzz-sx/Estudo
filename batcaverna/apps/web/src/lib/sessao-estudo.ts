import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Ciclo de vida da sessão de estudo — fonte única.
 *
 * Antes, a regra das 8 horas existia SÓ em `/api/study-sessions/start`, e o
 * encerramento não existia em lugar nenhum: `stopSession()` estava no store e
 * nenhum componente o chamava, então `finalizada_em` nunca era preenchido.
 *
 * A consequência era encadeada. `/status` devolve a sessão ativa mais recente;
 * o store, ao encontrar uma, retorna cedo e nunca chama `/start` — que era o
 * único lugar com a regra de virada. Resultado: **uma única linha em
 * `study_sessions` por usuário, para sempre**, e com ela três defeitos:
 *
 *   1. "tempo de estudo hoje" somava sessões com `iniciada_em` de hoje. Da
 *      segunda visita em diante nenhuma sessão era de hoje: sempre 0.
 *   2. `duracao_segundos` acumulava entre dias, então o limite de 8 h virava
 *      um teto de vida — e nem esse era aplicado.
 *   3. `blocos_continuos_completados` cresce com o acumulado, então depois de
 *      ~2h15 somadas ao longo da vida o multiplicador de continuidade ficava
 *      preso em 1,5× para sempre, para todo mundo. O prêmio por sessão longa
 *      virava bônus permanente.
 *
 * Agora as três rotas (`start`, `status`, `heartbeat`) usam
 * `buscarSessaoAtiva`, que encerra a sessão vencida antes de devolvê-la.
 */

/** Teto de uma sessão: 8 horas. */
export const LIMITE_MAXIMO_SESSAO_SEGUNDOS = 8 * 3600;

/**
 * Folga do teto anti-fraude, em segundos.
 *
 * O cliente manda o cronômetro da tela a cada 30 s. O servidor confere contra
 * o tempo que o relógio dele andou desde a última gravação; a folga cobre
 * latência de rede e diferença de relógio entre as duas máquinas.
 */
export const TOLERANCIA_RELOGIO_SEGUNDOS = 20;

/** O dia (UTC) de um instante. Mesma convenção do streak em `gamificacao.ts`. */
function diaDe(iso: string | Date): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export interface SessaoEstudo {
  id: string;
  iniciada_em: string;
  ultima_atividade_em: string | null;
  duracao_segundos: number | null;
  finalizada_em: string | null;
  blocos_continuos_completados: number | null;
  multiplicador_continuidade_atual: number | null;
  xp_ganho_na_sessao: number | null;
  [k: string]: unknown;
}

/**
 * A sessão já deveria ter sido encerrada?
 *
 * Duas condições: passou das 8 h, ou começou em outro dia. A segunda é o que
 * faz "tempo de estudo hoje" voltar a significar alguma coisa.
 */
export function sessaoVencida(
  sessao: Pick<SessaoEstudo, 'iniciada_em' | 'duracao_segundos'>,
  agora: Date = new Date()
): boolean {
  if ((sessao.duracao_segundos ?? 0) >= LIMITE_MAXIMO_SESSAO_SEGUNDOS) return true;
  return diaDe(sessao.iniciada_em) !== diaDe(agora);
}

/**
 * Devolve a sessão ativa do usuário, encerrando-a antes se estiver vencida.
 *
 * Devolver `null` significa "não há sessão aberta" — quem chamou decide se
 * cria uma nova (`/start`) ou apenas informa que não há (`/status`).
 */
export async function buscarSessaoAtiva(
  supabase: SupabaseClient,
  userId: string,
  agora: Date = new Date()
): Promise<SessaoEstudo | null> {
  const { data: sessao } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('finalizada_em', null)
    .order('iniciada_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sessao) return null;

  if (sessaoVencida(sessao, agora)) {
    await supabase
      .from('study_sessions')
      .update({ finalizada_em: agora.toISOString() })
      .eq('id', sessao.id);
    return null;
  }

  return sessao as SessaoEstudo;
}

/**
 * Quantos segundos podem ser aceitos como duração desta sessão agora.
 *
 * O `heartbeat` gravava `body.duracao_segundos` sem teto nenhum. Uma
 * requisição com `duracao_segundos: 99999999` virava ~2.500.000 de XP gravados
 * direto em `users.xp_total` — o nível máximo pede 25.000 — e o topo dos dois
 * rankings. O ramo alternativo (cálculo no servidor) já tinha a trava certa;
 * o ramo do cliente passava por cima dela.
 *
 * O limite verdadeiro é físico: entre dois heartbeats não pode ter passado
 * mais tempo do que o relógio andou desde a última gravação. É o que esta
 * função devolve — e ela nunca deixa a duração encolher, senão um cliente
 * atrasado apagaria tempo já creditado.
 */
export function tetoDaDuracao(
  sessao: Pick<SessaoEstudo, 'iniciada_em' | 'ultima_atividade_em' | 'duracao_segundos'>,
  agora: Date = new Date()
): number {
  const gravado = sessao.duracao_segundos ?? 0;
  const referencia = new Date(sessao.ultima_atividade_em || sessao.iniciada_em).getTime();
  const desdeUltima = Math.max(0, Math.floor((agora.getTime() - referencia) / 1000));

  const teto = gravado + desdeUltima + TOLERANCIA_RELOGIO_SEGUNDOS;
  return Math.min(teto, LIMITE_MAXIMO_SESSAO_SEGUNDOS);
}

/**
 * A duração que deve ser gravada, dada a que o cliente afirma.
 *
 * Aceita o cronômetro da tela quando ele é plausível — é mais preciso que a
 * conta do servidor, porque só conta com a aba visível — e o corta no teto
 * físico quando não é.
 */
export function duracaoAceita(
  sessao: Pick<SessaoEstudo, 'iniciada_em' | 'ultima_atividade_em' | 'duracao_segundos'>,
  informada: unknown,
  agora: Date = new Date()
): number {
  const gravado = sessao.duracao_segundos ?? 0;
  const teto = tetoDaDuracao(sessao, agora);

  if (typeof informada === 'number' && Number.isFinite(informada) && informada >= gravado) {
    return Math.max(gravado, Math.min(Math.floor(informada), teto));
  }

  // Sem valor utilizável do cliente: conta pelo relógio do servidor, com a
  // mesma trava de 5 min que já existia (aba fechada não vira estudo).
  const referencia = new Date(sessao.ultima_atividade_em || sessao.iniciada_em).getTime();
  let decorrido = Math.max(0, Math.floor((agora.getTime() - referencia) / 1000));
  if (decorrido > 300) decorrido = 30;

  return Math.max(gravado, Math.min(gravado + decorrido, teto));
}
