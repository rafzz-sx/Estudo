import type { SupabaseClient } from '@supabase/supabase-js';
import {
  distribuicaoDaProva,
  REFERENCIA_APROVACAO,
  type FatiaMateria,
} from '@/lib/distribuicao-prova';

/**
 * "Quanto falta para a nota de corte" — e ONDE estão os pontos que faltam.
 *
 * A plataforma já tinha as três peças e não cruzava nenhuma:
 *   • quanto o aluno acerta em cada matéria     (user_materia_stats)
 *   • quanto cada matéria pesa na prova          (distribuicao-prova.ts)
 *   • qual é o alvo                              (REFERENCIA_APROVACAO)
 *
 * Cruzando, estatística vira plano: em vez de "você acerta 61%", dá para
 * dizer "no seu ritmo você tira 61; o corte histórico é 68; os 7 pontos que
 * faltam estão quase todos em Matemática e Física".
 *
 * A projeção é uma média PONDERADA PELO PESO DA PROVA, não a taxa de acerto
 * geral. A diferença é grande e é o ponto do cálculo: acertar 90% de Inglês
 * (que vale 10% da prova) e 40% de Matemática (que vale 40%) dá uma taxa
 * geral simpática e uma nota reprovada.
 */

/**
 * Suavização: quantas "respostas fantasma" na média cada matéria carrega.
 *
 * Sem isso, quem respondeu 2 questões de Química e acertou as 2 apareceria
 * com 100% — e a projeção viraria ficção. Mesma constante e mesmo motivo do
 * radar de fraqueza em `diagnostico.ts`.
 */
const K_SUAVIZACAO = 8;

/** Abaixo disto a matéria é "pouco testada" e a tela avisa. */
const AMOSTRA_MINIMA = 10;

export interface LacunaMateria {
  materia_id: string;
  materia: string;
  emoji: string | null;
  /** Fração da prova que esta matéria ocupa, de 0 a 100. */
  peso_percentual: number;
  taxa_acerto: number;
  respondidas: number;
  /** Pontos da prova que estão sendo perdidos aqui, de 0 a 100. */
  pontos_perdidos: number;
  amostra_fraca: boolean;
}

export interface Projecao {
  /** Nota projetada, de 0 a 100. */
  nota_projetada: number;
  /** Alvo histórico do concurso, de 0 a 100. */
  referencia: number;
  ressalva_referencia: string;
  /** Positivo = falta; zero ou negativo = já está na faixa. */
  faltam: number;
  atingiu: boolean;
  /** Onde os pontos estão sendo perdidos, do maior para o menor. */
  lacunas: LacunaMateria[];
  /** Quantas questões o aluno respondeu deste concurso. */
  base_respostas: number;
  /**
   * `true` quando a base é pequena demais para a projeção significar algo.
   * A tela mostra o número, mas avisa — e é melhor avisar do que esconder:
   * ver a conta desde cedo é o que faz o aluno querer aumentá-la.
   */
  base_fraca: boolean;
  origem_pesos: FatiaMateria['origem'];
}

interface LinhaStats {
  materia_id: string;
  questoes_respondidas: number | null;
  acertos: number | null;
}

/**
 * Projeta a nota do aluno neste concurso.
 *
 * Devolve `null` quando não dá para projetar honestamente: concurso sem
 * questões cadastradas, ou sem referência de corte conhecida.
 */
export async function projetarNota(
  supabase: SupabaseClient,
  userId: string,
  concursoId: string,
  sigla: string
): Promise<Projecao | null> {
  const referencia = REFERENCIA_APROVACAO[sigla.toUpperCase()];
  if (!referencia) return null;

  const fatias = await distribuicaoDaProva(supabase, concursoId);
  if (fatias.length === 0) return null;

  // ─── Desempenho por matéria, neste concurso ──────────────
  const { data: stats } = await supabase
    .from('user_materia_stats')
    .select('materia_id, questoes_respondidas, acertos')
    .eq('user_id', userId)
    .eq('concurso_id', concursoId);

  const porMateria = new Map<string, { total: number; acertos: number }>();
  let totalGeral = 0;
  let acertosGeral = 0;

  for (const s of (stats ?? []) as LinhaStats[]) {
    const total = s.questoes_respondidas ?? 0;
    const acertos = s.acertos ?? 0;
    if (total <= 0) continue;
    porMateria.set(s.materia_id, { total, acertos });
    totalGeral += total;
    acertosGeral += acertos;
  }

  // A média do próprio aluno é o palpite para o que ele ainda não testou —
  // melhor que 0 (que o daria como reprovado sem ter tentado) e melhor que
  // 50 fixo (que ignoraria quem ele é).
  const mediaAluno = totalGeral > 0 ? acertosGeral / totalGeral : 0.5;

  const lacunas: LacunaMateria[] = [];
  let notaProjetada = 0;

  for (const f of fatias) {
    const d = porMateria.get(f.materia_id) ?? { total: 0, acertos: 0 };

    // Suavizada: (acertos + K·média) / (respondidas + K)
    const taxa = (d.acertos + K_SUAVIZACAO * mediaAluno) / (d.total + K_SUAVIZACAO);

    notaProjetada += f.peso * taxa * 100;

    lacunas.push({
      materia_id: f.materia_id,
      materia: f.nome,
      emoji: f.emoji,
      peso_percentual: Number((f.peso * 100).toFixed(1)),
      taxa_acerto: Number((taxa * 100).toFixed(1)),
      respondidas: d.total,
      pontos_perdidos: Number((f.peso * (1 - taxa) * 100).toFixed(1)),
      amostra_fraca: d.total < AMOSTRA_MINIMA,
    });
  }

  const nota = Number(notaProjetada.toFixed(1));
  const faltam = Number((referencia.percentual - nota).toFixed(1));

  return {
    nota_projetada: nota,
    referencia: referencia.percentual,
    ressalva_referencia: referencia.nota,
    faltam: Math.max(0, faltam),
    atingiu: faltam <= 0,
    lacunas: lacunas
      .filter((l) => l.pontos_perdidos > 0)
      .sort((a, b) => b.pontos_perdidos - a.pontos_perdidos),
    base_respostas: totalGeral,
    base_fraca: totalGeral < 30,
    origem_pesos: fatias[0].origem,
  };
}
