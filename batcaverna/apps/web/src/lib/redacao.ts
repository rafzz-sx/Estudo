/**
 * A rubrica oficial das 5 competências da redação do ENEM.
 *
 * Os descritores abaixo são a régua pública usada na correção: cada
 * competência vale de 0 a 200, em degraus de 40, e a soma dá 1.000.
 *
 * Vive em código, não no banco, porque é fixa: não é conteúdo que o admin
 * cadastra, é a definição do exercício. Se o INEP mudar a rubrica, muda aqui.
 *
 * ─── Por que autoavaliação, e não correção automática ───────────────────────
 * Corrigir redação exige leitor humano treinado. Um número gerado por regra
 * de três — contar conectivos, medir tamanho de parágrafo — seria pior que
 * número nenhum, porque o aluno passaria a estudar para o alvo errado.
 *
 * O que funciona sem corretor é a autoavaliação GUIADA: escrever, esperar, e
 * depois reler com o descritor oficial na frente, competência por
 * competência. O exercício de julgar o próprio texto contra a régua é o que
 * ensina a enxergar o que falta — e é exatamente o que o aluno sozinho não
 * faz, porque não conhece a régua.
 */

export interface NivelCompetencia {
  /** Pontuação deste nível: 0, 40, 80, 120, 160 ou 200. */
  pontos: number;
  /** O que caracteriza este nível, na linguagem da rubrica. */
  descricao: string;
}

export interface Competencia {
  numero: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  /** O que a competência mede, em uma frase. */
  resumo: string;
  /** A pergunta que o aluno deve responder ao se avaliar. */
  pergunta: string;
  niveis: NivelCompetencia[];
}

export const COMPETENCIAS: Competencia[] = [
  {
    numero: 1,
    titulo: 'Domínio da escrita formal',
    resumo:
      'Demonstrar domínio da modalidade escrita formal da língua portuguesa.',
    pergunta:
      'Quantos desvios de ortografia, concordância, regência, pontuação e registro o seu texto tem?',
    niveis: [
      { pontos: 0, descricao: 'Desconhecimento da modalidade escrita formal.' },
      { pontos: 40, descricao: 'Domínio precário, com desvios gramaticais e de convenções da escrita muito frequentes e diversificados.' },
      { pontos: 80, descricao: 'Domínio insuficiente, com muitos desvios gramaticais e de convenções da escrita.' },
      { pontos: 120, descricao: 'Domínio mediano, com alguns desvios gramaticais e de convenções da escrita.' },
      { pontos: 160, descricao: 'Bom domínio, com poucos desvios gramaticais e de convenções da escrita.' },
      { pontos: 200, descricao: 'Excelente domínio, com no máximo uma falha eventual de seleção lexical.' },
    ],
  },
  {
    numero: 2,
    titulo: 'Compreender o tema e o tipo textual',
    resumo:
      'Compreender a proposta e aplicar conceitos de várias áreas para desenvolver o tema, em texto dissertativo-argumentativo em prosa.',
    pergunta:
      'Você respondeu exatamente ao tema proposto — sem tangenciar — e o texto é dissertativo-argumentativo, com os três elementos (introdução, desenvolvimento e conclusão)?',
    niveis: [
      { pontos: 0, descricao: 'Fuga ao tema, ou não atendimento ao tipo dissertativo-argumentativo. A redação recebe nota zero total.' },
      { pontos: 40, descricao: 'Tangencia o tema, ou mistura os tipos textuais com predomínio de traços dissertativo-argumentativos.' },
      { pontos: 80, descricao: 'Aborda o tema com abordagem superficial e domínio insuficiente do texto dissertativo-argumentativo; repertório baseado nos textos motivadores.' },
      { pontos: 120, descricao: 'Aborda o tema de forma completa, com os três elementos da estrutura, e repertório sociocultural não legitimado ou não pertinente.' },
      { pontos: 160, descricao: 'Aborda o tema de forma completa, com repertório sociocultural legitimado e pertinente, ainda que pouco produtivo.' },
      { pontos: 200, descricao: 'Desenvolve o tema por meio de argumentação consistente, com repertório sociocultural legitimado, pertinente e produtivo.' },
    ],
  },
  {
    numero: 3,
    titulo: 'Selecionar e organizar argumentos',
    resumo:
      'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos em defesa de um ponto de vista.',
    pergunta:
      'Existe uma tese clara desde a introdução, e cada parágrafo desenvolve um argumento que a sustenta — sem contradição e sem repetir o mesmo argumento?',
    niveis: [
      { pontos: 0, descricao: 'Informações, fatos e opiniões não relacionados ao tema, sem defesa de ponto de vista.' },
      { pontos: 40, descricao: 'Informações pouco relacionadas ao tema ou incoerentes, com frágil defesa de ponto de vista.' },
      { pontos: 80, descricao: 'Informações limitadas aos argumentos dos textos motivadores, em defesa pouco consistente do ponto de vista.' },
      { pontos: 120, descricao: 'Informações relacionadas ao tema, mas pouco articuladas ou pouco desenvolvidas, em defesa de um ponto de vista.' },
      { pontos: 160, descricao: 'Informações e argumentos relacionados ao tema, de forma organizada, com indícios de autoria, em defesa de um ponto de vista.' },
      { pontos: 200, descricao: 'Informações e argumentos consistentes e organizados, configurando autoria, em defesa de um ponto de vista.' },
    ],
  },
  {
    numero: 4,
    titulo: 'Coesão e articulação',
    resumo:
      'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.',
    pergunta:
      'Os parágrafos e as frases estão ligados por conectivos adequados, ou os períodos apenas se sucedem soltos? Você repetiu o mesmo conectivo várias vezes?',
    niveis: [
      { pontos: 0, descricao: 'Não articula as informações.' },
      { pontos: 40, descricao: 'Articula as partes do texto de forma precária.' },
      { pontos: 80, descricao: 'Articula as partes do texto de forma insuficiente, com muitas inadequações, e repertório limitado de conectivos.' },
      { pontos: 120, descricao: 'Articula as partes do texto de forma mediana, com inadequações, e repertório pouco diversificado de conectivos.' },
      { pontos: 160, descricao: 'Articula as partes do texto com poucas inadequações e repertório diversificado de conectivos.' },
      { pontos: 200, descricao: 'Articula bem as partes do texto e apresenta repertório diversificado de recursos coesivos.' },
    ],
  },
  {
    numero: 5,
    titulo: 'Proposta de intervenção',
    resumo:
      'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.',
    pergunta:
      'Sua proposta tem os cinco elementos — agente, ação, meio, finalidade e detalhamento — e respeita os direitos humanos?',
    niveis: [
      { pontos: 0, descricao: 'Não apresenta proposta de intervenção, ou a proposta não se relaciona ao tema. Proposta que viola os direitos humanos zera a competência.' },
      { pontos: 40, descricao: 'Proposta de intervenção vaga, precária ou relacionada apenas ao assunto.' },
      { pontos: 80, descricao: 'Proposta de intervenção insuficientemente relacionada ao tema e pouco articulada à discussão.' },
      { pontos: 120, descricao: 'Proposta de intervenção relacionada ao tema, mas não articulada à discussão desenvolvida no texto.' },
      { pontos: 160, descricao: 'Proposta bem relacionada ao tema e articulada à discussão, faltando um dos cinco elementos.' },
      { pontos: 200, descricao: 'Proposta muito bem relacionada ao tema e articulada à discussão, com todos os cinco elementos.' },
    ],
  },
];

/** Nota máxima: 5 competências × 200. */
export const NOTA_MAXIMA = 1000;

/** Degraus válidos em cada competência. */
export const DEGRAUS = [0, 40, 80, 120, 160, 200] as const;

/**
 * Extensão de referência da redação do ENEM.
 *
 * O limite oficial é de 30 linhas na folha; o mínimo para não ser anulada é
 * 7. Em palavras, um texto que preenche bem essas 30 linhas costuma ficar
 * entre 250 e 400. Estes números orientam — não são regra de correção.
 */
export const EXTENSAO = {
  linhasMaximas: 30,
  linhasMinimas: 7,
  palavrasIdealMin: 250,
  palavrasIdealMax: 400,
};

/** Conta palavras do jeito que um corretor contaria. */
export function contarPalavras(texto: string): number {
  return texto.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estima quantas linhas o texto ocuparia na folha oficial.
 *
 * A folha do ENEM tem cerca de 12 palavras por linha em letra de tamanho
 * comum. É estimativa, e a tela diz isso: o que vale é a folha real.
 */
export function estimarLinhas(texto: string): number {
  return Math.ceil(contarPalavras(texto) / 12);
}

/** Um degrau válido, ou `null`. Usado para validar o que chega do cliente. */
export function degrauValido(v: unknown): number | null {
  const n = Number(v);
  return (DEGRAUS as readonly number[]).includes(n) ? n : null;
}
