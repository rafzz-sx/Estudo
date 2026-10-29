import type { SupabaseClient } from '@supabase/supabase-js';

export type ModoDificuldade =
  | 'balanceado'
  | 'facil'
  | 'medio'
  | 'dificil'
  | 'custom';

export interface ProporcaoDificuldade {
  facil: number;
  medio: number;
  dificil: number;
}

export interface EstoqueDificuldade {
  facil: number;
  medio: number;
  dificil: number;
}

export interface VagasDificuldade {
  facil: number;
  medio: number;
  dificil: number;
}

/**
 * Proporção padrão recomendada para simulado real de concurso.
 * 30% Fácil (aquecimento e pontuação base), 50% Médio (nível padrão de corte),
 * 20% Difícil (critério de desempate e alta concorrência).
 */
export const PROPORCAO_PADRAO_REAL: ProporcaoDificuldade = {
  facil: 30,
  medio: 50,
  dificil: 20,
};

/**
 * Calcula a quantidade exata de vagas para cada nível de dificuldade.
 *
 * ⚠️ REGRA DE OURO DO MODO BALANCEADO:
 * No modo balanceado, o sistema NUNCA coloca somente fáceis, somente médias
 * ou somente difíceis (quando o banco possui as questões cadastradas).
 * Para total >= 3, cada faixa recebe no mínimo 1 vaga.
 */
export function calcularVagasDificuldade(
  total: number,
  modo: ModoDificuldade = 'balanceado',
  custom?: Partial<ProporcaoDificuldade>,
  estoque?: EstoqueDificuldade
): VagasDificuldade {
  if (total <= 0) {
    return { facil: 0, medio: 0, dificil: 0 };
  }

  // ─── 1. Determina as porcentagens nominais ───────────────
  let pFacil = 30;
  let pMedio = 50;
  let pDificil = 20;

  if (modo === 'facil') {
    pFacil = 75;
    pMedio = 20;
    pDificil = 5;
  } else if (modo === 'medio') {
    pFacil = 15;
    pMedio = 75;
    pDificil = 10;
  } else if (modo === 'dificil') {
    pFacil = 10;
    pMedio = 25;
    pDificil = 65;
  } else if (modo === 'custom' && custom) {
    const cf = Math.max(0, Number(custom.facil) || 0);
    const cm = Math.max(0, Number(custom.medio) || 0);
    const cd = Math.max(0, Number(custom.dificil) || 0);
    const soma = cf + cm + cd;
    if (soma > 0) {
      pFacil = (cf / soma) * 100;
      pMedio = (cm / soma) * 100;
      pDificil = (cd / soma) * 100;
    }
  }

  // ─── 2. Distribuição inicial proporcional ───────────────
  let vFacil = Math.round((pFacil / 100) * total);
  let vDificil = Math.round((pDificil / 100) * total);
  let vMedio = total - vFacil - vDificil;

  // ─── 3. Invariante Antimonopólio (Modo Balanceado) ──────
  // Se o modo é balanceado e total >= 3, assegura que NENHUMA faixa fique com zero
  // e NENHUMA faixa receba 100% das vagas.
  if (modo === 'balanceado' && total >= 3) {
    if (vFacil <= 0) vFacil = 1;
    if (vDificil <= 0) vDificil = 1;
    if (vMedio <= 0) vMedio = 1;

    // Reajusta para a soma fechar exatamente no total
    let delta = total - (vFacil + vMedio + vDificil);
    while (delta !== 0) {
      if (delta > 0) {
        // Falta vaga: incrementa Médio primeiro
        vMedio++;
        delta--;
      } else {
        // Sobrou vaga: decrementa da maior fatia que tenha > 1
        if (vMedio > 1 && vMedio >= vFacil && vMedio >= vDificil) {
          vMedio--;
        } else if (vFacil > 1 && vFacil >= vDificil) {
          vFacil--;
        } else if (vDificil > 1) {
          vDificil--;
        } else {
          vMedio--;
        }
        delta++;
      }
    }
  }

  // ─── 4. Respeito ao Estoque do Banco com Redistribuição Suave ───
  if (estoque) {
    const est = {
      facil: Math.max(0, estoque.facil),
      medio: Math.max(0, estoque.medio),
      dificil: Math.max(0, estoque.dificil),
    };

    let capFacil = Math.min(vFacil, est.facil);
    let capMedio = Math.min(vMedio, est.medio);
    let capDificil = Math.min(vDificil, est.dificil);

    let sobra = total - (capFacil + capMedio + capDificil);

    // Redistribui as sobras para as categorias que ainda têm estoque disponível
    let iteracoes = 0;
    while (sobra > 0 && iteracoes < 20) {
      iteracoes++;
      let acomodou = false;

      // Prioridade de redistribuição: Médio -> Fácil -> Difícil
      if (capMedio < est.medio && sobra > 0) {
        const cabem = Math.min(sobra, est.medio - capMedio);
        capMedio += cabem;
        sobra -= cabem;
        acomodou = true;
      }
      if (capFacil < est.facil && sobra > 0) {
        const cabem = Math.min(sobra, est.facil - capFacil);
        capFacil += cabem;
        sobra -= cabem;
        acomodou = true;
      }
      if (capDificil < est.dificil && sobra > 0) {
        const cabem = Math.min(sobra, est.dificil - capDificil);
        capDificil += cabem;
        sobra -= cabem;
        acomodou = true;
      }

      if (!acomodou) break; // O banco de todas acabou
    }

    vFacil = capFacil;
    vMedio = capMedio;
    vDificil = capDificil;
  }

  return {
    facil: vFacil,
    medio: vMedio,
    dificil: vDificil,
  };
}

/**
 * Seleciona IDs de questões respeitando concomitantemente:
 * 1. A proporção de matérias (quando fornecida)
 * 2. O balanceamento de dificuldade configurado (garantindo diversidade)
 */
export interface OpcoesSelecaoQuestoes {
  concursoId: string;
  quantidadeTotal: number;
  modoDificuldade: ModoDificuldade;
  customProporcao?: Partial<ProporcaoDificuldade>;
  vagasPorMateria?: Map<string, number> | null;
  materiaId?: string | null;
  ano?: number | null;
  idsExcluir?: Set<string>;
  diaProvaNumero?: number | null;
}

export interface ResultadoSelecaoQuestoes {
  ids: string[];
  distribuicaoDificuldade: VagasDificuldade;
  totalIneditas: number;
  totalRepetidas: number;
}

/**
 * Seleciona IDs de questões respeitando concomitantemente:
 * 1. A proporção de matérias (quando fornecida)
 * 2. O balanceamento de dificuldade configurado (garantindo diversidade)
 * 3. A preferência por questões inéditas (quando solicitado)
 * 4. A filtragem por dia da prova (quando aplicável)
 */
export async function selecionarQuestoesBalanceadas(
  supabase: SupabaseClient,
  opcoes: OpcoesSelecaoQuestoes
): Promise<ResultadoSelecaoQuestoes> {
  const {
    concursoId,
    quantidadeTotal,
    modoDificuldade,
    customProporcao,
    vagasPorMateria,
    materiaId,
    ano,
    idsExcluir,
    diaProvaNumero,
  } = opcoes;

  const priorizarIneditas = (
    lista: { id: string; dificuldade?: string | null }[]
  ): string[] => {
    if (!idsExcluir || idsExcluir.size === 0) {
      return embaralhar(lista.map((q) => q.id));
    }
    const ineditas = lista.filter((q) => !idsExcluir.has(q.id)).map((q) => q.id);
    const repetidas = lista.filter((q) => idsExcluir.has(q.id)).map((q) => q.id);
    return [...embaralhar(ineditas), ...embaralhar(repetidas)];
  };

  // ─── CASO A: Simulado Multidisciplinar (Vagas por Matéria) ───
  if (vagasPorMateria && vagasPorMateria.size > 0 && !materiaId) {
    const idsFinais: string[] = [];
    const contagemTotalDificuldade: VagasDificuldade = {
      facil: 0,
      medio: 0,
      dificil: 0,
    };

    // Para cada matéria, sortear mantendo a calibragem de dificuldade
    for (const [mid, qtdMateria] of vagasPorMateria.entries()) {
      if (qtdMateria <= 0) continue;

      let qQuery = supabase
        .from('questoes')
        .select('id, dificuldade, dia_prova')
        .eq('concurso_id', concursoId)
        .eq('ativa', true)
        .eq('materia_id', mid);

      if (ano) qQuery = qQuery.eq('ano', ano);

      const { data: questoesMateria } = await qQuery.limit(Math.max(qtdMateria * 8, 400));
      const todasBrutas = questoesMateria ?? [];

      // Se foi especificado o dia da prova (ex: ENEM Dia 2), prioriza questões daquele dia
      let todas = todasBrutas;
      if (diaProvaNumero != null) {
        const doDia = todasBrutas.filter((q) => q.dia_prova === diaProvaNumero);
        if (doDia.length >= qtdMateria) {
          todas = doDia;
        }
      }

      const faceis = todas.filter((q) => q.dificuldade === 'facil');
      const medias = todas.filter((q) => q.dificuldade === 'medio' || !q.dificuldade);
      const dificeis = todas.filter((q) => q.dificuldade === 'dificil');

      const estoqueMateria: EstoqueDificuldade = {
        facil: faceis.length,
        medio: medias.length,
        dificil: dificeis.length,
      };

      const vagasMatDiff = calcularVagasDificuldade(
        qtdMateria,
        modoDificuldade,
        customProporcao,
        estoqueMateria
      );

      // Priorizar inéditas em cada faixa de dificuldade antes de repetir
      const selFacil = priorizarIneditas(faceis).slice(0, vagasMatDiff.facil);
      const selMedio = priorizarIneditas(medias).slice(0, vagasMatDiff.medio);
      const selDificil = priorizarIneditas(dificeis).slice(0, vagasMatDiff.dificil);

      idsFinais.push(...selFacil, ...selMedio, ...selDificil);

      contagemTotalDificuldade.facil += selFacil.length;
      contagemTotalDificuldade.medio += selMedio.length;
      contagemTotalDificuldade.dificil += selDificil.length;
    }

    const totalIneditas = idsExcluir
      ? idsFinais.filter((id) => !idsExcluir.has(id)).length
      : idsFinais.length;

    return {
      ids: embaralhar(idsFinais),
      distribuicaoDificuldade: contagemTotalDificuldade,
      totalIneditas,
      totalRepetidas: idsFinais.length - totalIneditas,
    };
  }

  // ─── CASO B: Pool Geral ou Matéria Única ──────────────────────
  let query = supabase
    .from('questoes')
    .select('id, dificuldade, dia_prova')
    .eq('concurso_id', concursoId)
    .eq('ativa', true);

  if (materiaId) query = query.eq('materia_id', materiaId);
  if (ano) query = query.eq('ano', ano);

  const { data: todasQuestoes } = await query.limit(Math.max(quantidadeTotal * 8, 1000));
  const poolBruto = todasQuestoes ?? [];

  let pool = poolBruto;
  if (diaProvaNumero != null) {
    const doDia = poolBruto.filter((q) => q.dia_prova === diaProvaNumero);
    if (doDia.length >= quantidadeTotal) {
      pool = doDia;
    }
  }

  const faceis = pool.filter((q) => q.dificuldade === 'facil');
  const medias = pool.filter((q) => q.dificuldade === 'medio' || !q.dificuldade);
  const dificeis = pool.filter((q) => q.dificuldade === 'dificil');

  const estoque: EstoqueDificuldade = {
    facil: faceis.length,
    medio: medias.length,
    dificil: dificeis.length,
  };

  const vagas = calcularVagasDificuldade(
    quantidadeTotal,
    modoDificuldade,
    customProporcao,
    estoque
  );

  const selFacil = priorizarIneditas(faceis).slice(0, vagas.facil);
  const selMedio = priorizarIneditas(medias).slice(0, vagas.medio);
  const selDificil = priorizarIneditas(dificeis).slice(0, vagas.dificil);

  const idsFinais = embaralhar([...selFacil, ...selMedio, ...selDificil]);
  const totalIneditas = idsExcluir
    ? idsFinais.filter((id) => !idsExcluir.has(id)).length
    : idsFinais.length;

  return {
    ids: idsFinais,
    distribuicaoDificuldade: {
      facil: selFacil.length,
      medio: selMedio.length,
      dificil: selDificil.length,
    },
    totalIneditas,
    totalRepetidas: idsFinais.length - totalIneditas,
  };
}

function embaralhar<T>(array: T[]): T[] {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

