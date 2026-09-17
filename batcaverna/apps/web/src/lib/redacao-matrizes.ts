/**
 * Matrizes oficiais de correção e autoavaliação de redação da BatCaverna.
 *
 * Suporta:
 * 1. ENEM (5 competências, foco em proposta de intervenção)
 * 2. Concursos Militares: ESA, EEAR, EsPCEx, CN, EPCAr, EFOMM (conclusão por síntese, rigor gramatical, título, sem intervenção)
 * 3. Cebraspe / Policiais: PF, PRF, PCDF, Tribunais (padrão de resposta por tópicos técnicos)
 */

export type MatrizId = 'enem' | 'militar' | 'cebraspe';

export interface NivelCriterio {
  pontos: number; // 0, 40, 80, 120, 160, 200 (mantém compatibilidade com banco de dados)
  pontosExibicao?: string; // Como o aluno visualiza (ex: "8.0 / 10" ou "20 / 20")
  descricao: string;
}

export interface CriterioMatriz {
  numero: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  resumo: string;
  pergunta: string;
  pesoBanca?: string; // Ex: "Vale 20 pontos na ESA"
  niveis: NivelCriterio[];
}

export interface MatrizCorrecao {
  id: MatrizId;
  nome: string;
  sigla: string;
  descricao: string;
  bancas: string[];
  pontuacaoTotal: number;
  escalaExibicao: '1000' | '100' | '10';
  divisorExibicao: number; // 1 para ENEM (1000), 10 para Militar (100), 100 para Cebraspe (10.0)
  limiteLinhas: {
    min: number;
    max: number;
    zeroAbaixo?: number;
    zeroAcima?: number;
  };
  palavrasRecomendadas: {
    min: number;
    max: number;
  };
  exigePropostaIntervencao: boolean;
  exigeTitulo: boolean;
  tituloInfo: string;
  alertaBanca: string;
  criterios: CriterioMatriz[];
}

export const MATRIZES: Record<MatrizId, MatrizCorrecao> = {
  enem: {
    id: 'enem',
    nome: 'Matriz ENEM',
    sigla: 'ENEM',
    descricao: 'Dissertativo-argumentativo com 5 competências e proposta de intervenção social.',
    bancas: ['ENEM', 'Vestibulares Tradicionais'],
    pontuacaoTotal: 1000,
    escalaExibicao: '1000',
    divisorExibicao: 1,
    limiteLinhas: { min: 7, max: 30, zeroAbaixo: 7, zeroAcima: 30 },
    palavrasRecomendadas: { min: 250, max: 400 },
    exigePropostaIntervencao: true,
    exigeTitulo: false,
    tituloInfo: 'Título é opcional no ENEM. Não ganha pontos por colocar e perde linha se errar.',
    alertaBanca: 'A Competência 5 exige proposta de intervenção com 5 elementos: agente, ação, meio/modo, efeito e detalhamento.',
    criterios: [
      {
        numero: 1,
        titulo: 'C1 — Domínio da escrita formal',
        resumo: 'Demonstrar domínio da modalidade escrita formal da língua portuguesa.',
        pergunta: 'Quantos desvios de ortografia, concordância, regência, crase e pontuação o seu texto tem?',
        niveis: [
          { pontos: 0, descricao: 'Desconhecimento da modalidade escrita formal.' },
          { pontos: 40, descricao: 'Domínio precário, com desvios gramaticais graves e frequentes.' },
          { pontos: 80, descricao: 'Domínio insuficiente, com muitos desvios de convenções da escrita.' },
          { pontos: 120, descricao: 'Domínio mediano, com alguns desvios gramaticais.' },
          { pontos: 160, descricao: 'Bom domínio, com poucos desvios gramaticais e de pontuação.' },
          { pontos: 200, descricao: 'Excelente domínio, no máximo uma falha eventual de precisão vocabular.' },
        ],
      },
      {
        numero: 2,
        titulo: 'C2 — Compreender a proposta e repertório',
        resumo: 'Compreender a proposta, aplicar conceitos de várias áreas e desenvolver o tema em prosa dissertativa.',
        pergunta: 'Você abordou o tema completo (sem tangenciar) e usou repertório sociocultural legitimado e produtivo?',
        niveis: [
          { pontos: 0, descricao: 'Fuga ao tema ou formato não dissertativo (nota zero).' },
          { pontos: 40, descricao: 'Tangencia o tema ou mistura traços narrativos.' },
          { pontos: 80, descricao: 'Abordagem superficial com repertório restrito aos textos motivadores.' },
          { pontos: 120, descricao: 'Estrutura completa com introdução, D1, D2 e conclusão, mas repertório fraco ou decorado.' },
          { pontos: 160, descricao: 'Aborda de forma completa com repertório legitimado e pertinente ao tema.' },
          { pontos: 200, descricao: 'Argumentação consistente com repertório legitimado, pertinente E produtivo.' },
        ],
      },
      {
        numero: 3,
        titulo: 'C3 — Selecionar e organizar argumentos',
        resumo: 'Selecionar, relacionar, organizar e interpretar informações e argumentos em defesa de um ponto de vista.',
        pergunta: 'Existe uma tese clara na introdução e os argumentos nos parágrafos sustentam o ponto de vista sem contradição?',
        niveis: [
          { pontos: 0, descricao: 'Ideias sem nexo, sem defesa de ponto de vista.' },
          { pontos: 40, descricao: 'Argumentos incoerentes ou muito frágeis.' },
          { pontos: 80, descricao: 'Preso aos argumentos prontos da coletânea.' },
          { pontos: 120, descricao: 'Ideias organizadas de forma básica, porém pouco desenvolvidas.' },
          { pontos: 160, descricao: 'Argumentos bem articulados e com bom projeto de texto.' },
          { pontos: 200, descricao: 'Projeto de texto estratégico, argumentação densa e autoral.' },
        ],
      },
      {
        numero: 4,
        titulo: 'C4 — Coesão e articulação textual',
        resumo: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.',
        pergunta: 'Você usou conectivos diversificados inter e intraparágrafos sem repetições excessivas?',
        niveis: [
          { pontos: 0, descricao: 'Frases isoladas sem conectivos de articulação.' },
          { pontos: 40, descricao: 'Articulação muito precária entre períodos.' },
          { pontos: 80, descricao: 'Muitas inadequações e repetição dos mesmos conectivos.' },
          { pontos: 120, descricao: 'Articulação mediana, repertório limitado de conjunções.' },
          { pontos: 160, descricao: 'Boa coesão com raras inadequações e conectivos variados.' },
          { pontos: 200, descricao: 'Excelente concatenação de ideias, repertório expressivo de recursos coesivos.' },
        ],
      },
      {
        numero: 5,
        titulo: 'C5 — Proposta de intervenção social',
        resumo: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.',
        pergunta: 'Sua proposta contém os 5 elementos (Agente, Ação, Modo/Meio, Efeito e Detalhamento)?',
        niveis: [
          { pontos: 0, descricao: 'Sem proposta, fuga da intervenção ou desrespeito aos direitos humanos.' },
          { pontos: 40, descricao: 'Proposta genérica/vaga (ex: "o governo precisa conscientizar").' },
          { pontos: 80, descricao: 'Apresenta 2 elementos válidos articulados ao tema.' },
          { pontos: 120, descricao: 'Apresenta 3 elementos válidos articulados ao tema.' },
          { pontos: 160, descricao: 'Apresenta 4 dos 5 elementos completos.' },
          { pontos: 200, descricao: 'Apresenta os 5 elementos completos com detalhamento claro de um deles.' },
        ],
      },
    ],
  },

  militar: {
    id: 'militar',
    nome: 'Matriz Concursos Militares',
    sigla: 'Militar (ESA / EEAR / EsPCEx / CN / EPCAr)',
    descricao: 'Dissertação formal clássica: tese firme, argumentação objetiva, conclusão por síntese e título obrigatório.',
    bancas: ['ESA', 'EEAR', 'EsPCEx', 'Colégio Naval', 'EPCAr', 'EFOMM', 'AFA', 'IME', 'ITA'],
    pontuacaoTotal: 100,
    escalaExibicao: '100',
    divisorExibicao: 10, // 1000 / 10 = 100 pontos
    limiteLinhas: { min: 20, max: 30, zeroAbaixo: 17, zeroAcima: 38 },
    palavrasRecomendadas: { min: 230, max: 380 },
    exigePropostaIntervencao: false,
    exigeTitulo: true,
    tituloInfo: 'Título é OBRIGATÓRIO na maioria das bancas militares (ESA/EEAR/EsPCEx). Centralize na Linha 1 sem pular linha.',
    alertaBanca: 'NÃO faça proposta de intervenção com agente/ação no modelo ENEM! Conclua por SÍNTESE ou DEDUÇÃO reafirmando a tese.',
    criterios: [
      {
        numero: 1,
        titulo: 'Critério 1 — Tema e Fidelidade à Proposta',
        resumo: 'Abordagem integral do tema proposto, sem fuga ou tangenciamento, mantendo o foco analítico.',
        pergunta: 'Você discutiu exatamente o núcleo temático do edital/prova sem fugir para devaneios?',
        pesoBanca: 'Vale até 20 pontos',
        niveis: [
          { pontos: 0, descricao: 'Fuga total ao tema (anulação imediata da redação).' },
          { pontos: 40, descricao: 'Tangencia o tema ou adota tom panfletário/poético incompatível.' },
          { pontos: 80, descricao: 'Aborda o tema com argumentos superficiais e senso comum.' },
          { pontos: 120, descricao: 'Aborda o tema satisfatoriamente, embora falte maturidade temática.' },
          { pontos: 160, descricao: 'Boa profundidade temática com recorte preciso do tema.' },
          { pontos: 200, descricao: 'Domínio temático completo, análise madura e consistente.' },
        ],
      },
      {
        numero: 2,
        titulo: 'Critério 2 — Estrutura Dissertativa e Título',
        resumo: 'Presença de título centralizado, introdução com tese, desenvolvimento em 2 parágrafos e conclusão.',
        pergunta: 'O texto tem título obrigatório na linha 1 e estrutura clássica equilibrada em 4 parágrafos?',
        pesoBanca: 'Vale até 20 pontos',
        niveis: [
          { pontos: 0, descricao: 'Texto sem estrutura de dissertação ou em parágrafo único.' },
          { pontos: 40, descricao: 'Estrutura fragmentada, sem título ou com parágrafos de uma linha.' },
          { pontos: 80, descricao: 'Estrutura presente, mas parágrafos muito desiguais em tamanho e densidade.' },
          { pontos: 120, descricao: 'Estrutura correta com título, tese e conclusão razoavelmente equilibrados.' },
          { pontos: 160, descricao: 'Excelente equilíbrio formal (4 parágrafos proporcionais e título perfeito).' },
          { pontos: 200, descricao: 'Arquitetura textual impecável: título cirúrgico e simetria estrutural perfeita.' },
        ],
      },
      {
        numero: 3,
        titulo: 'Critério 3 — Consistência Argumentativa e Autoria',
        resumo: 'Argumentos fundamentados em fatos históricos, leis, dados ou filósofos, sustentando a tese.',
        pergunta: 'Seus argumentos têm autoridade e você evitou senso comum, achismos e clichês vazios?',
        pesoBanca: 'Vale até 20 pontos',
        niveis: [
          { pontos: 0, descricao: 'Afirmações sem qualquer fundamentação ou contraditórias.' },
          { pontos: 40, descricao: 'Baseado exclusivamente em achismos ("eu acho", "no meu ver").' },
          { pontos: 80, descricao: 'Argumentação frágil com clichês e provérbios populares.' },
          { pontos: 120, descricao: 'Bons argumentos, mas pouco aprofundados ou exemplificados.' },
          { pontos: 160, descricao: 'Argumentos sólidos com dados históricos, geopolíticos ou filosóficos consistentes.' },
          { pontos: 200, descricao: 'Argumentação densa, autoral, com rigor lógico e alto repertório cultural.' },
        ],
      },
      {
        numero: 4,
        titulo: 'Critério 4 — Coesão e Encadeamento Lógico',
        resumo: 'Emprego correto de conectivos formais (portanto, outrossim, dessarte, não obstante) e progressão.',
        pergunta: 'As frases e parágrafos estão conectados logicamente, sem truncamento nem repetição frouxa?',
        pesoBanca: 'Vale até 20 pontos',
        niveis: [
          { pontos: 0, descricao: 'Inexistência de conectivos; texto truncado e sem sequência lógica.' },
          { pontos: 40, descricao: 'Muitos problemas de coesão, conectivos com sentido invertido.' },
          { pontos: 80, descricao: 'Coesão mecânica com uso repetitivo de "além disso" e "porém".' },
          { pontos: 120, descricao: 'Boa progressão temática com pequenas falhas no encadeamento de ideias.' },
          { pontos: 160, descricao: 'Vocabulário coesivo rico e variado, ligando perfeitamente as teses.' },
          { pontos: 200, descricao: 'Fluidez textual exemplar; o leitor é guiado suavemente do início ao fim.' },
        ],
      },
      {
        numero: 5,
        titulo: 'Critério 5 — Correção Gramatical e Rigor Vernáculo',
        resumo: 'Ortografia, pontuação, concordância verbal/nominal, regência, crase e translineação correta.',
        pergunta: 'Quantos desvios gramaticais você cometeu? (Na banca militar, cada erro desconta nota pesada).',
        pesoBanca: 'Vale até 20 pontos',
        niveis: [
          { pontos: 0, descricao: 'Mais de 10 desvios graves de concordância, regência ou ortografia.' },
          { pontos: 40, descricao: 'Entre 7 e 9 erros gramaticais/pontuação.' },
          { pontos: 80, descricao: 'Entre 4 e 6 erros gramaticais/pontuação.' },
          { pontos: 120, descricao: 'Entre 2 e 3 desvios leves de pontuação ou acentuação.' },
          { pontos: 160, descricao: 'Apenas 1 desvio leve no texto inteiro.' },
          { pontos: 200, descricao: 'Texto gramaticalmente perfeito: zero erros de ortografia, crase e sintaxe.' },
        ],
      },
    ],
  },

  cebraspe: {
    id: 'cebraspe',
    nome: 'Matriz Cebraspe / Carreiras Policiais',
    sigla: 'Cebraspe (PF / PRF / PCDF / Depen)',
    descricao: 'Redação técnica baseada nos tópicos do edital. Resposta direta a cada subitem com clareza objetiva.',
    bancas: ['Cebraspe', 'Polícia Federal', 'PRF', 'PCDF', 'Depen', 'Tribunais'],
    pontuacaoTotal: 100,
    escalaExibicao: '100',
    divisorExibicao: 10,
    limiteLinhas: { min: 20, max: 30, zeroAbaixo: 20, zeroAcima: 30 },
    palavrasRecomendadas: { min: 250, max: 420 },
    exigePropostaIntervencao: false,
    exigeTitulo: false,
    tituloInfo: 'NÃO coloque título no Cebraspe. Ocupa linha útil e não pontua, a menos que o edital mande explicitamente.',
    alertaBanca: 'No Cebraspe, cada parágrafo de desenvolvimento deve responder explicitamente a um dos tópicos do espelho!',
    criterios: [
      {
        numero: 1,
        titulo: 'Critério 1 — Apresentação e Estrutura Textual',
        resumo: 'Legibilidade, respeito às margens, parágrafos nítidos e estrutura formal do texto dissertativo.',
        pergunta: 'O texto tem letra legível, respeita margens sem ultrapassar e tem parágrafos bem delimitados?',
        niveis: [
          { pontos: 0, descricao: 'Texto ilegível ou desorganizado, sem recuo de parágrafo.' },
          { pontos: 40, descricao: 'Várias rasuras graves e desrespeito às margens direita e esquerda.' },
          { pontos: 80, descricao: 'Apresentação mediana com pequenas imperfeições de margem ou translineação.' },
          { pontos: 120, descricao: 'Boa apresentação, margens respeitadas e recuos regulares.' },
          { pontos: 160, descricao: 'Excelente legibilidade e estética da folha de respostas.' },
          { pontos: 200, descricao: 'Apresentação perfeita: caligrafia límpida, margens impecáveis.' },
        ],
      },
      {
        numero: 2,
        titulo: 'Critério 2 — Desenvolvimento do Tópico 1',
        resumo: 'Resposta completa, técnica e aprofundada ao primeiro subitem proposto pela banca examinadora.',
        pergunta: 'Você respondeu diretamente ao primeiro quesito da prova com embasamento jurídico/técnico?',
        niveis: [
          { pontos: 0, descricao: 'Não abordou o Tópico 1 ou tangenciou completamente.' },
          { pontos: 40, descricao: 'Abordou o tópico apenas superficialmente, sem termos técnicos.' },
          { pontos: 80, descricao: 'Respondeu parcialmente com fundamentação jurídica/técnica mediana.' },
          { pontos: 120, descricao: 'Respondeu de forma satisfatória aos pontos essenciais do tópico.' },
          { pontos: 160, descricao: 'Resposta aprofundada com legislação, doutrina ou jurisprudência.' },
          { pontos: 200, descricao: 'Nota máxima no espelho: resposta exaustiva, precisa e técnica.' },
        ],
      },
      {
        numero: 3,
        titulo: 'Critério 3 — Desenvolvimento do Tópico 2',
        resumo: 'Resposta completa e fundamentada ao segundo subitem do comando de redação.',
        pergunta: 'Você cobriu todos os desdobramentos exigidos no Tópico 2 com precisão conceitual?',
        niveis: [
          { pontos: 0, descricao: 'Não abordou o Tópico 2.' },
          { pontos: 40, descricao: 'Abordagem vaga ou confusa dos conceitos do tema.' },
          { pontos: 80, descricao: 'Respondeu ao quesito mas cometeu imprecisões conceituais.' },
          { pontos: 120, descricao: 'Cobriu satisfatoriamente a expectativa da banca.' },
          { pontos: 160, descricao: 'Demonstrou domínio substancial com fundamentação teórica sólida.' },
          { pontos: 200, descricao: 'Resposta exemplar e irretocável para o padrão de resposta da banca.' },
        ],
      },
      {
        numero: 4,
        titulo: 'Critério 4 — Desenvolvimento do Tópico 3 / Conclusão Técnica',
        resumo: 'Resposta ao terceiro quesito ou fechamento técnico-institucional articulado à atuação do órgão.',
        pergunta: 'O desfecho do texto fechou o raciocínio técnico sem clichês ou devaneios abstratos?',
        niveis: [
          { pontos: 0, descricao: 'Não respondeu ao terceiro tópico ou deixou o texto sem conclusão.' },
          { pontos: 40, descricao: 'Respondeu com fragilidade e frases soltas.' },
          { pontos: 80, descricao: 'Resposta aceitável com pouca densidade técnica.' },
          { pontos: 120, descricao: 'Boa resposta ao quesito com conclusão coerente.' },
          { pontos: 160, descricao: 'Excelente conclusão técnica articulada ao papel constitucional do órgão.' },
          { pontos: 200, descricao: 'Fechamento de alta densidade técnica alinhado ao espelho definitivo.' },
        ],
      },
      {
        numero: 5,
        titulo: 'Critério 5 — Aspectos Microestruturais e Gramaticais',
        resumo: 'Correção gramatical: grafia, acentuação, propriedade vocabular, concordância e regência.',
        pergunta: 'Qual foi o índice de desvios gramaticais por linha do seu texto?',
        niveis: [
          { pontos: 0, descricao: 'Muitos desvios gramaticais (queda expressiva na nota final pelo fator Cebraspe).' },
          { pontos: 40, descricao: 'Erros frequentes de concordância ou regência nominal/verbal.' },
          { pontos: 80, descricao: 'Alguns erros de pontuação e vírgula separando sujeito de predicado.' },
          { pontos: 120, descricao: 'Poucos desvios pontuais em relação ao número total de linhas.' },
          { pontos: 160, descricao: 'Excelente rigor gramatical, linguagem formal polida.' },
          { pontos: 200, descricao: 'Zero desvios gramaticais: nota integral nos aspectos microestruturais.' },
        ],
      },
    ],
  },
};

/**
 * Retorna a matriz de correção apropriada.
 * Se id for inválido ou não informado, retorna 'enem' por padrão.
 */
export function obterMatriz(matrizId?: string | null): MatrizCorrecao {
  if (matrizId && matrizId in MATRIZES) {
    return MATRIZES[matrizId as MatrizId];
  }
  return MATRIZES.enem;
}

/**
 * Formata a pontuação total da redação conforme a escala da banca (ex: 860 no ENEM vs 86.0 na Militar/Cebraspe).
 */
export function formatarNotaBanca(notaTotalBruta: number, matrizId?: string | null): string {
  const matriz = obterMatriz(matrizId);
  const valor = Math.round(notaTotalBruta / matriz.divisorExibicao);
  if (matriz.escalaExibicao === '1000') {
    return `${valor} / 1000`;
  }
  if (matriz.escalaExibicao === '100') {
    return `${valor} / 100`;
  }
  return `${(valor / 10).toFixed(1)} / 10`;
}
