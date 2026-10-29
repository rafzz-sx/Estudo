/**
 * Motor de Cálculo da TRI (Teoria de Resposta ao Item) para o ENEM.
 *
 * O ENEM não utiliza pontuação linear (número simples de acertos).
 * A nota é calibrada pela TRI com base em 3 parâmetros principais:
 *   - Parâmetro a: Discriminação do item
 *   - Parâmetro b: Nível de dificuldade (Fácil, Médio, Difícil)
 *   - Parâmetro c: Acerto casual (probabilidade de chute ~ 20%)
 *
 * ⚠️ COERÊNCIA PEDAGÓGICA (Escala Guttman):
 * O algoritmo avalia a consistência do candidato. Quem acerta questões difíceis
 * mas erra questões fáceis é penalizado (o algoritmo interpreta como chute).
 * Quem acerta consistentemente as fáceis e médias recebe a valorização máxima
 * dos seus acertos.
 */

export interface ItemTRI {
  questaoId: string;
  materiaNome: string | null;
  dificuldade: string;
  correta: boolean;
}

export interface AreaTRIResultado {
  codigo: 'MT' | 'CN' | 'LC' | 'CH';
  nome: string;
  emoji: string;
  totalQuestoes: number;
  acertos: number;
  notaTRI: number;
  coerencia: 'alta' | 'media' | 'baixa';
  coerenciaPercentual: number;
  explicacaoCoerencia: string;
}

export interface ResultadoTRI {
  notaGeral: number;
  coerenciaGeral: 'alta' | 'media' | 'baixa';
  coerenciaGeralPercentual: number;
  explicacaoGeral: string;
  areas: AreaTRIResultado[];
}

interface ParametrosArea {
  nome: string;
  emoji: string;
  minimo: number;
  maximo: number;
  expoente: number;
}

const PARAMETROS_AREAS: Record<'MT' | 'CN' | 'LC' | 'CH', ParametrosArea> = {
  MT: {
    nome: 'Matemática e suas Tecnologias',
    emoji: '📐',
    minimo: 320,
    maximo: 985,
    expoente: 1.15,
  },
  CN: {
    nome: 'Ciências da Natureza e suas Tecnologias',
    emoji: '🔬',
    minimo: 310,
    maximo: 875,
    expoente: 1.12,
  },
  LC: {
    nome: 'Linguagens, Códigos e suas Tecnologias',
    emoji: '🗣️',
    minimo: 325,
    maximo: 825,
    expoente: 1.08,
  },
  CH: {
    nome: 'Ciências Humanas e suas Tecnologias',
    emoji: '🏛️',
    minimo: 315,
    maximo: 855,
    expoente: 1.10,
  },
};

/**
 * Mapeia o nome da matéria para uma das 4 áreas do ENEM.
 */
export function mapearMateriaParaAreaEnem(materiaNome?: string | null): 'MT' | 'CN' | 'LC' | 'CH' {
  const norm = String(materiaNome || '').toLowerCase().trim();

  if (/matem[aá]tica/i.test(norm)) return 'MT';

  if (/f[ií]sica|qu[ií]mica|biologia|natureza/i.test(norm)) return 'CN';

  if (/portugu[eê]s|literatura|ingl[eê]s|espanhol|artes?|educa[cç][aã]o f[ií]sica|linguagen/i.test(norm)) {
    return 'LC';
  }

  // História, Geografia, Filosofia, Sociologia, Atualidades, Humanas
  return 'CH';
}

/**
 * Calcula a nota TRI estimada para um simulado do ENEM com base no padrão
 * de respostas e coerência pedagógica.
 */
export function calcularTRIEnem(itens: ItemTRI[]): ResultadoTRI | null {
  if (!itens || itens.length === 0) return null;

  // Agrupa questões por área
  const grupos: Record<'MT' | 'CN' | 'LC' | 'CH', ItemTRI[]> = {
    MT: [],
    CN: [],
    LC: [],
    CH: [],
  };

  for (const item of itens) {
    const area = mapearMateriaParaAreaEnem(item.materiaNome);
    grupos[area].push(item);
  }

  const resultadosAreas: AreaTRIResultado[] = [];

  for (const [codigoStr, lista] of Object.entries(grupos) as [
    'MT' | 'CN' | 'LC' | 'CH',
    ItemTRI[]
  ][]) {
    if (lista.length === 0) continue;

    const params = PARAMETROS_AREAS[codigoStr];
    const total = lista.length;
    const acertos = lista.filter((q) => q.correta).length;

    if (total === 0) continue;

    // Se errou tudo: nota piso da área
    if (acertos === 0) {
      resultadosAreas.push({
        codigo: codigoStr,
        nome: params.nome,
        emoji: params.emoji,
        totalQuestoes: total,
        acertos: 0,
        notaTRI: params.minimo,
        coerencia: 'baixa',
        coerenciaPercentual: 50,
        explicacaoCoerencia: 'Sem acertos na área. Nota calibrada na base mínima da TRI.',
      });
      continue;
    }

    // Se acertou tudo: nota teto da área
    if (acertos === total) {
      resultadosAreas.push({
        codigo: codigoStr,
        nome: params.nome,
        emoji: params.emoji,
        totalQuestoes: total,
        acertos: total,
        notaTRI: params.maximo,
        coerencia: 'alta',
        coerenciaPercentual: 100,
        explicacaoCoerencia: 'Gabarito perfeito na área! Nota máxima da TRI alcançada.',
      });
      continue;
    }

    // Distribuição de acertos por dificuldade
    const faceis = lista.filter((q) => q.dificuldade === 'facil');
    const medias = lista.filter((q) => q.dificuldade === 'medio' || !q.dificuldade);
    const dificeis = lista.filter((q) => q.dificuldade === 'dificil');

    const acFacil = faceis.filter((q) => q.correta).length;
    const acMedio = medias.filter((q) => q.correta).length;
    const acDificil = dificeis.filter((q) => q.correta).length;

    const taxaFacil = faceis.length > 0 ? acFacil / faceis.length : 1;
    const taxaMedio = medias.length > 0 ? acMedio / medias.length : 0.5;
    const taxaDificil = dificeis.length > 0 ? acDificil / dificeis.length : 0.2;

    // Índice de Coerência (Guttman index):
    // Espera-se que taxaFacil >= taxaMedio >= taxaDificil.
    // Incoerência ocorre quando taxaDificil > taxaFacil (chute provável).
    let penalidadeChute = 0;
    if (taxaDificil > taxaFacil) {
      penalidadeChute += (taxaDificil - taxaFacil) * 0.25;
    }
    if (taxaMedio > taxaFacil) {
      penalidadeChute += (taxaMedio - taxaFacil) * 0.15;
    }

    // Bônus de coerência quando as fáceis foram dominadas
    let bonusCoerencia = 0;
    if (taxaFacil >= 0.8 && taxaMedio >= 0.5) {
      bonusCoerencia = 0.05;
    }

    const coerenciaFator = Math.max(0.65, Math.min(1.0, 1.0 - penalidadeChute + bonusCoerencia));
    const coerenciaPct = Math.round(coerenciaFator * 100);

    // Curva logística base do ENEM
    const fracaoAcerto = acertos / total;
    const amplitude = params.maximo - params.minimo;
    const notaBase = params.minimo + amplitude * Math.pow(fracaoAcerto, params.expoente);

    // Aplicação da coerência pedagógica
    // Se coerência é alta (~1.0), mantém ou eleva; se baixa (< 0.75), desconta pontuação
    const notaAjustada = Math.round(
      notaBase * (0.85 + 0.15 * (coerenciaFator / 1.0))
    );

    const notaFinal = Math.max(params.minimo, Math.min(params.maximo, notaAjustada));

    let nivelCoerencia: 'alta' | 'media' | 'baixa' = 'media';
    let explicacao = '';

    if (coerenciaPct >= 85) {
      nivelCoerencia = 'alta';
      explicacao =
        'Excelente coerência pedagógica! Você garantiu as questões fáceis e intermediárias antes das difíceis, maximizando a valorização dos seus acertos.';
    } else if (coerenciaPct >= 72) {
      nivelCoerencia = 'media';
      explicacao =
        'Coerência intermediária. Alguns erros em questões fáceis reduziram levemente o potencial máximo dos seus acertos nas questões difíceis.';
    } else {
      nivelCoerencia = 'baixa';
      explicacao =
        'Atenção ao padrão de respostas (alerta de chute): você errou questões fáceis e acertou difíceis. Na TRI do ENEM, acertos em questões complexas sem base sólida nas fáceis são interpretados como acertos casuais e recebem pontuação menor.';
    }

    resultadosAreas.push({
      codigo: codigoStr,
      nome: params.nome,
      emoji: params.emoji,
      totalQuestoes: total,
      acertos,
      notaTRI: notaFinal,
      coerencia: nivelCoerencia,
      coerenciaPercentual: coerenciaPct,
      explicacaoCoerencia: explicacao,
    });
  }

  if (resultadosAreas.length === 0) return null;

  // Nota Geral = Média simples das áreas presentes no simulado
  const somaNotas = resultadosAreas.reduce((acc, a) => acc + a.notaTRI, 0);
  const notaGeral = Math.round(somaNotas / resultadosAreas.length);

  const somaCoerencia = resultadosAreas.reduce((acc, a) => acc + a.coerenciaPercentual, 0);
  const mediaCoerencia = Math.round(somaCoerencia / resultadosAreas.length);

  const coerenciaGeral: 'alta' | 'media' | 'baixa' =
    mediaCoerencia >= 85 ? 'alta' : mediaCoerencia >= 72 ? 'media' : 'baixa';

  const explicacaoGeral =
    coerenciaGeral === 'alta'
      ? 'Sua nota TRI foi valorizada pela alta coerência pedagógica em todo o exame.'
      : coerenciaGeral === 'media'
      ? 'Padrão estável com pequenas oscilações de coerência entre fáceis e difíceis.'
      : 'Penalização detectada por inconsistência (erros em fáceis com acertos em difíceis).';

  return {
    notaGeral,
    coerenciaGeral,
    coerenciaGeralPercentual: mediaCoerencia,
    explicacaoGeral,
    areas: resultadosAreas,
  };
}

