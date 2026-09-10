import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Repetição espaçada.
 *
 * A curva do esquecimento diz que reencontrar a informação pouco antes de
 * esquecê-la é o que a fixa. Por isso a questão errada não volta amanhã e
 * some: ela volta em 1, depois 3, 7 e 21 dias — e só sai do ciclo quando a
 * pessoa acerta nas quatro passadas.
 *
 * Errar durante uma revisão devolve a questão à etapa 0. É proposital:
 * se você errou de novo, não aprendeu ainda.
 */

/** Dias até a próxima revisão, por etapa. */
export const INTERVALOS_DIAS = [1, 3, 7, 21] as const;

export const ETAPA_FINAL = INTERVALOS_DIAS.length - 1;

function emDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/**
 * Chamado toda vez que o aluno responde uma questão.
 *
 * - Errou → entra (ou volta) para a fila, etapa 0, revisão amanhã.
 * - Acertou uma questão que estava agendada para hoje ou antes → avança
 *   de etapa; ao passar da última, sai do ciclo como "aprendida".
 * - Acertou uma questão que não estava vencida → nada muda. Acertar duas
 *   vezes no mesmo dia não deveria pular etapas.
 */
export async function atualizarRevisao(
  supabase: SupabaseClient,
  userId: string,
  questaoId: string,
  acertou: boolean,
  dadosAtual?: {
    id: string;
    etapa: number | null;
    agendada_para: string;
    total_erros: number | null;
    total_revisoes: number | null;
    ativa: boolean;
  } | null
): Promise<{
  agendada_para: string | null;
  etapa: number | null;
  aprendida: boolean;
  entrou_na_fila: boolean;
} | null> {
  const hoje = new Date().toISOString().slice(0, 10);

  let atual = dadosAtual;
  if (atual === undefined) {
    const { data } = await supabase
      .from('revisoes_agendadas')
      .select('id, etapa, agendada_para, total_erros, total_revisoes, ativa')
      .eq('user_id', userId)
      .eq('questao_id', questaoId)
      .maybeSingle();
    atual = data;
  }

  // ─── Errou ───────────────────────────────────────────────
  if (!acertou) {
    const proxima = emDias(INTERVALOS_DIAS[0]);

    if (atual) {
      await supabase
        .from('revisoes_agendadas')
        .update({
          etapa: 0,
          agendada_para: proxima,
          total_erros: (atual.total_erros ?? 0) + 1,
          total_revisoes: (atual.total_revisoes ?? 0) + 1,
          ultima_revisao: new Date().toISOString(),
          ativa: true,
          aprendida_em: null,
        })
        .eq('id', atual.id);

      return {
        agendada_para: proxima,
        etapa: 0,
        aprendida: false,
        entrou_na_fila: !atual.ativa,
      };
    }

    await supabase.from('revisoes_agendadas').insert({
      user_id: userId,
      questao_id: questaoId,
      etapa: 0,
      agendada_para: proxima,
      total_erros: 1,
    });

    return {
      agendada_para: proxima,
      etapa: 0,
      aprendida: false,
      entrou_na_fila: true,
    };
  }

  // ─── Acertou ─────────────────────────────────────────────
  if (!atual || !atual.ativa) return null;

  // Só conta como revisão se a questão estava mesmo vencida.
  if (atual.agendada_para > hoje) return null;

  const proximaEtapa = (atual.etapa ?? 0) + 1;

  if (proximaEtapa > ETAPA_FINAL) {
    await supabase
      .from('revisoes_agendadas')
      .update({
        ativa: false,
        etapa: ETAPA_FINAL,
        total_revisoes: (atual.total_revisoes ?? 0) + 1,
        ultima_revisao: new Date().toISOString(),
        aprendida_em: new Date().toISOString(),
      })
      .eq('id', atual.id);

    return {
      agendada_para: null,
      etapa: ETAPA_FINAL,
      aprendida: true,
      entrou_na_fila: false,
    };
  }

  const proxima = emDias(INTERVALOS_DIAS[proximaEtapa]);

  await supabase
    .from('revisoes_agendadas')
    .update({
      etapa: proximaEtapa,
      agendada_para: proxima,
      total_revisoes: (atual.total_revisoes ?? 0) + 1,
      ultima_revisao: new Date().toISOString(),
    })
    .eq('id', atual.id);

  return {
    agendada_para: proxima,
    etapa: proximaEtapa,
    aprendida: false,
    entrou_na_fila: false,
  };
}

/** Quantas questões estão vencidas para revisar hoje. */
export async function contarRevisoesPendentes(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const hoje = new Date().toISOString().slice(0, 10);

  const { count } = await supabase
    .from('revisoes_agendadas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('ativa', true)
    .lte('agendada_para', hoje);

  return count ?? 0;
}

/** Texto amigável para a próxima revisão. */
export function descreverAgendamento(
  agendadaPara: string | null,
  aprendida: boolean
): string | null {
  if (aprendida) return 'Você fechou o ciclo de revisões desta questão. 🎓';
  if (!agendadaPara) return null;

  const alvo = new Date(`${agendadaPara}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dias = Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);

  if (dias <= 0) return 'Esta questão volta para você ainda hoje.';
  if (dias === 1) return 'Esta questão volta para você amanhã.';
  return `Esta questão volta para você em ${dias} dias.`;
}
