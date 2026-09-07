/**
 * Taxonomia canônica de assuntos — ARQUIVO GERADO.
 *
 * GERADO POR scripts/gerar_taxonomia_ts.py A PARTIR DE scripts/taxonomia.py.
 * NÃO EDITE À MÃO: a fonte é o Python, e a paridade entre os dois é conferida
 * por scripts/checar_paridade_taxonomia.py sobre as 177 questões do banco.
 *
 * ─── O que este arquivo resolve ─────────────────────────────────────────
 *
 * Os .txt das provas usam rótulo livre para o assunto. Sem canonizar, 3.247
 * questões geravam 2.452 assuntos distintos — 88% deles com UMA questão só.
 * "Geometria Plana" aparecia com 23 questões quando tinha 104, e isso
 * quebrava em silêncio o card "Assuntos que caem", a ordenação da trilha, a
 * revisão espaçada, o caderno de erros e o plano de estudo. Nada dava erro.
 * Tudo mentia.
 *
 * O pipeline Python já canonizava. O importador do painel admin NÃO — ele
 * gravava o rótulo cru, então importar pela tela refragmentava a taxonomia
 * que a migration 011 tinha acabado de unificar.
 *
 * ─── Como funciona ──────────────────────────────────────────────────────
 *
 * Para cada matéria há uma lista ORDENADA de [canônico, termos]. O primeiro
 * que casar vence — por isso a ordem vai do específico para o geral.
 *
 * Os termos são PREFIXOS de propósito: "interpretac" cobre
 * "interpretação/interpretativo", "text" cobre "texto/textual". Por isso o
 * casamento não exige palavra inteira. Mas exige INÍCIO DE PALAVRA: sem
 * isso, "organica" casa dentro de "inorganica" e "etica" dentro de
 * "estetica" — foi esse o defeito que arquivou 14 questões de química
 * inorgânica como Química Orgânica e deixou "Funções Inorgânicas" com zero.
 */


type Entrada = readonly [string, readonly string[]];

export const TAXONOMIA: Record<string, readonly Entrada[]> = {
  "Matemática": [
    ["Geometria Analítica", ["geometria analitica", "circunferencia no plano cartesiano", "equacao da reta", "coordenadas cartesianas", "distancia entre pontos"]],
    ["Geometria Espacial", ["geometria espacial", "solidos", "prisma", "piramide", "cilindro", "cone", "esfera", "poliedro", "volume", "tronco de"]],
    ["Geometria Plana", ["geometria plana", "figuras planas", "area de figura", "triangulo", "quadrilatero", "circunferencia", "poligono", "semelhanca", "teorema de tales", "relacoes metricas", "pitagoras", "angulos", "geometria"]],
    ["Trigonometria", ["trigonometri", "seno", "cosseno", "tangente", "arcos e angulos", "lei dos senos", "lei dos cossenos", "ciclo trigonometrico"]],
    ["Análise Combinatória", ["analise combinatoria", "combinatoria", "permutacao", "arranjo", "combinacao", "principio fundamental da contagem", "binomio de newton", "fatorial"]],
    ["Probabilidade", ["probabilidade"]],
    ["Estatística", ["estatistica", "media aritmetica", "media ponderada", "mediana", "moda", "desvio padrao", "variancia", "amplitude"]],
    ["Análise de Gráficos e Tabelas", ["grafico", "tabela", "leitura de dados", "interpretacao de dados", "analise de dados", "leitura de instrumento", "tomada de decisao"]],
    ["Matemática Financeira", ["matematica financeira", "juros", "montante", "desconto", "capital", "amortizacao"]],
    ["Porcentagem", ["porcentagem", "percentual", "aumento e desconto"]],
    ["Razão, Proporção e Regra de Três", ["razao", "proporcao", "regra de tres", "grandezas proporcionais", "escala", "proporcional", "divisao proporcional", "vazao", "produtividade"]],
    ["Progressões", ["progressao", "pa e pg", "sequencia numerica", "termo geral"]],
    ["Sequências e Recorrências", ["sequencia", "recorrencia", "padrao numerico"]],
    ["Logaritmos e Exponenciais", ["logaritmo", "exponencial"]],
    ["Função Quadrática", ["funcao quadratica", "funcao do 2", "parabola", "trinomio"]],
    ["Função Afim", ["funcao afim", "funcao do 1", "funcao linear"]],
    ["Funções", ["funcao", "dominio e imagem", "funcao composta", "funcao inversa", "otimizacao", "modelagem matematica", "maximo e minimo"]],
    ["Equações e Inequações", ["equacao", "inequacao", "sistema de equacoes", "equacoes irracionais", "equacoes diofantinas"]],
    ["Matrizes, Determinantes e Sistemas", ["matriz", "determinante", "sistema linear", "escalonamento", "regra de cramer"]],
    ["Polinômios", ["polinomio", "raizes de polinomio", "divisao de polinomios"]],
    ["Números Complexos", ["numeros complexos", "complexo", "argand", "forma polar"]],
    ["Teoria dos Números", ["teoria dos numeros", "divisibilidade", "mdc", "mmc", "numeros primos", "aritmetica residual", "congruencia", "criterios de divisibilidade", "sistema de numeracao", "base binaria", "valor posicional"]],
    ["Conjuntos Numéricos", ["conjunto", "numeros racionais", "numeros reais", "numeros inteiros", "dizima", "fracao", "intervalo"]],
    ["Potenciação e Radiciação", ["potenciacao", "radiciacao", "radical", "expoente", "notacao cientifica", "raiz quadrada"]],
    ["Grandezas e Medidas", ["grandezas", "unidades de medida", "conversao de unidades", "perimetro"]],
    ["Cálculo Diferencial e Integral", ["derivada", "integral", "limite", "calculo diferencial"]],
    ["Raciocínio Lógico", ["raciocinio logico", "logica", "proposicao"]],
    ["Álgebra", ["algebra", "produto notavel", "fatoracao", "expressao algebrica"]],
    ["Aritmética", ["aritmetica", "operacoes basicas", "problemas aritmeticos"]],
  ],
  "Português": [
    ["Figuras de Linguagem", ["figura de linguagem", "figuras de linguagem", "metafora", "metonimia", "ironia", "hiperbole", "antitese", "estilistica", "recursos estilisticos"]],
    ["Funções da Linguagem", ["funcao da linguagem", "funcoes da linguagem", "funcao fatica", "funcao conativa", "funcao poetica", "funcao referencial"]],
    ["Gêneros e Tipologia Textual", ["genero textual", "generos textuais", "tipologia", "tipo textual", "estrutura textual", "cibercultura", "intertextual", "paratexto"]],
    ["Variação Linguística", ["variacao linguistica", "variedade linguistica", "norma culta", "regionalismo", "gíria", "historia da lingua", "preconceito linguistico"]],
    ["Coesão e Coerência", ["coesao", "coerencia", "conectivo", "referenciacao", "progressao textual"]],
    ["Análise do Discurso e Argumentação", ["analise do discurso", "argumentac", "persuas", "recursos argumentativos", "intencionalidade"]],
    ["Concordância", ["concordancia"]],
    ["Regência", ["regencia"]],
    ["Crase", ["crase"]],
    ["Colocação Pronominal", ["colocacao pronominal", "colocacao pronomial", "proclise", "enclise", "mesoclise"]],
    ["Pontuação", ["pontuacao", "virgula", "ponto e virgula", "dois pontos"]],
    ["Acentuação Gráfica", ["acentuacao", "acento"]],
    ["Ortografia", ["ortografia", "grafia", "emprego de palavras"]],
    ["Sintaxe", ["sintaxe", "analise sintatica", "periodo composto", "oracao", "termos da oracao", "sujeito e predicado", "subordinada", "coordenada", "aposto", "vocativo"]],
    ["Morfologia", ["morfologia", "classes de palavras", "substantivo", "adjetivo", "pronome", "preposicao", "conjuncao", "numeral", "interjeicao", "morfofonetica", "formacao de palavras"]],
    ["Verbos", ["verbo", "tempos verbais", "modos verbais", "vozes verbais"]],
    ["Semântica", ["semantica", "sinonimia", "antonimia", "polissemia", "conotacao", "denotacao", "vocabulario", "lexico", "expressoes"]],
    ["Literatura", ["literatura", "analise literaria", "poesia", "modernismo", "romantismo", "realismo"]],
    ["Interpretação de Texto", ["interpretacao", "compreensao", "leitura", "texto", "inferencia", "tema central", "ideia principal"]],
  ],
  "Física": [
    ["Eletromagnetismo", ["eletromagnetismo", "inducao eletromagnetica", "campo magnetico", "forca magnetica", "lei de lenz", "lei de faraday", "magnetismo"]],
    ["Eletrodinâmica", ["eletrodinamica", "circuito", "corrente eletrica", "resistor", "lei de ohm", "potencia eletrica", "capacitor", "eletricidade"]],
    ["Eletrostática", ["eletrostatica", "carga eletrica", "campo eletrico", "lei de coulomb", "potencial eletrico"]],
    ["Ondulatória", ["ondulatoria", "onda", "efeito doppler", "interferencia", "acustica", "som", "ressonancia", "frequencia"]],
    ["Óptica", ["optica", "espelho", "lente", "refracao", "reflexao", "luz"]],
    ["Movimento Harmônico Simples", ["movimento harmonico", "mhs", "pendulo", "oscilacao", "mola"]],
    ["Termodinâmica", ["termodinamica", "maquina termica", "carnot", "entropia", "gases ideais", "transformacao gasosa"]],
    ["Termologia e Calorimetria", ["termologia", "termometr", "calorimetria", "calor", "temperatura", "dilatacao", "transmissao de calor", "isolamento termico", "escala termometrica"]],
    ["Hidrostática", ["hidrostatica", "empuxo", "arquimedes", "pressao", "densidade", "pascal", "fluido"]],
    ["Trabalho, Energia e Potência", ["trabalho e energia", "energia mecanica", "potencia", "energia cinetica", "energia potencial", "conservacao de energia", "rendimento"]],
    ["Impulso e Quantidade de Movimento", ["impulso", "quantidade de movimento", "momento linear", "colisao"]],
    ["Gravitação", ["gravitacao", "kepler", "orbita", "satelite"]],
    ["Estática", ["estatica", "equilibrio", "torque", "momento de uma forca", "alavanca"]],
    ["Dinâmica", ["dinamica", "leis de newton", "forca", "atrito", "plano inclinado", "movimento circular"]],
    ["Cinemática", ["cinematica", "mru", "mruv", "velocidade", "aceleracao", "lancamento", "queda livre", "movimento uniforme"]],
    ["Física Moderna", ["fisica moderna", "relatividade", "quantica", "fotoeletrico", "nuclear", "radioatividade", "atomo de bohr"]],
    ["Mecânica", ["mecanica"]],
  ],
  "Química": [
    ["Química Orgânica", ["organica", "hidrocarboneto", "isomeria", "funcoes organicas", "polimero", "cadeia carbonica", "reacoes organicas"]],
    ["Eletroquímica", ["eletroquimica", "pilha", "eletrolise", "oxirreducao", "nox"]],
    ["Equilíbrio Químico", ["equilibrio quimico", "constante de equilibrio", "le chatelier", "kps", "hidrolise"]],
    ["Cinética Química", ["cinetica", "velocidade da reacao", "catalisador"]],
    ["Termoquímica", ["termoquimica", "entalpia", "hess", "calor de reacao"]],
    ["Estequiometria", ["estequiometria", "calculo estequiometrico", "mol", "massa molar", "rendimento da reacao"]],
    ["Soluções", ["solucao", "concentracao", "molaridade", "diluicao", "titulacao", "solubilidade"]],
    ["Ácidos, Bases e pH", ["acido", "base", "ph", "poh", "indicador", "neutralizacao"]],
    ["Funções Inorgânicas", ["funcoes inorganicas", "sal", "oxido", "inorganica"]],
    ["Ligações Químicas", ["ligacao quimica", "ligacoes quimicas", "covalente", "ionica", "metalica", "geometria molecular", "polaridade", "forcas intermoleculares"]],
    ["Atomística e Tabela Periódica", ["atomistica", "tabela periodica", "atomo", "atomic", "estrutura atomica", "distribuicao eletronica", "propriedades periodicas", "modelo atomico", "isotopo"]],
    ["Separação de Misturas", ["separacao de mistura", "mistura", "destilacao", "filtracao", "decantacao", "substancia pura"]],
    ["Reações Químicas", ["reacao quimica", "balanceamento", "tipos de reacao"]],
    ["Gases", ["gas", "gases", "lei dos gases"]],
    ["Radioatividade", ["radioatividade", "decaimento", "meia-vida", "radiacao"]],
    ["Química Ambiental", ["quimica ambiental", "poluicao", "chuva acida", "efeito estufa", "tratamento de agua"]],
  ],
  "Biologia": [
    ["Genética", ["genetica", "mendel", "heranca", "dna", "rna", "cromossomo", "mutacao", "biotecnologia", "cariotipo"]],
    ["Evolução", ["evolucao", "darwin", "lamarck", "selecao natural", "especiacao", "filogenia"]],
    ["Ecologia", ["ecologia", "ecossistema", "cadeia alimentar", "bioma", "ciclo biogeoquimico", "sucessao ecologica", "poluicao", "biodiversidade", "relacoes ecologicas"]],
    ["Citologia", ["citologia", "celula", "membrana", "organela", "mitose", "meiose", "divisao celular", "nucleo"]],
    ["Bioquímica", ["bioquimica", "proteina", "enzima", "carboidrato", "lipidio", "acido nucleico", "metabolismo", "fotossintese", "respiracao celular"]],
    ["Fisiologia Humana", ["fisiologia", "sistema digestorio", "sistema circulatorio", "sistema nervoso", "sistema respiratorio", "sistema endocrino", "sistema excretor", "hormonio", "imunologia", "sangue"]],
    ["Microbiologia e Doenças", ["microbiologia", "virus", "bacteria", "protozoario", "fungo", "doenca", "parasit", "vacina", "epidemia"]],
    ["Botânica", ["botanica", "planta", "vegetal", "angiosperma", "gimnosperma", "briofita", "pteridofita"]],
    ["Zoologia", ["zoologia", "animal", "artropode", "vertebrado", "invertebrado", "cordado", "molusco"]],
    ["Embriologia e Histologia", ["embriologia", "histologia", "tecido", "gastrula", "reproducao"]],
    ["Origem da Vida e Seres Vivos", ["origem da vida", "seres vivos", "classificacao dos seres", "taxonomia", "reinos"]],
  ],
  "História": [
    ["História Militar do Brasil", ["historia militar", "forcas armadas", "exercito brasileiro", "marinha do brasil", "forca aerea", "guerra do paraguai", "duque de caxias", "feb", "tamandare"]],
    ["Brasil Colônia", ["brasil colonia", "colonial", "capitanias", "bandeirantes", "ciclo do ouro", "escravidao colonial", "descobrimento", "invasoes holandesas"]],
    ["Brasil Império", ["brasil imperio", "imperio", "independencia", "regencia", "dom pedro", "primeiro reinado", "segundo reinado", "abolicao"]],
    ["Brasil República", ["republica", "vargas", "estado novo", "ditadura militar", "redemocratizacao", "republica velha", "coronelismo", "constituicao de 1988", "getulio"]],
    ["Guerras Mundiais", ["primeira guerra", "segunda guerra", "guerra mundial", "nazismo", "fascismo", "holocausto", "totalitarismo"]],
    ["Guerra Fria", ["guerra fria", "bipolar", "urss", "muro de berlim", "socialismo real"]],
    ["Idade Antiga", ["idade antiga", "antiguidade", "roma", "grecia", "egito", "mesopotamia", "civilizacao antiga"]],
    ["Idade Média", ["idade media", "medieval", "feudalismo", "cruzadas", "igreja medieval"]],
    ["Idade Moderna", ["idade moderna", "renascimento", "reforma", "absolutismo", "mercantilismo", "grandes navegacoes", "iluminismo", "revolucao francesa", "revolucao industrial"]],
    ["História Contemporânea", ["contemporanea", "seculo xx", "globalizacao", "descolonizacao", "revolucao russa"]],
    ["História do Brasil", ["historia do brasil", "brasil"]],
  ],
  "Geografia": [
    ["Geopolítica", ["geopolitica", "conflito", "blocos economicos", "onu", "otan", "fronteira", "territorio", "guerra", "amazonia azul", "mar territorial", "zona economica exclusiva", "plataforma continental", "aguas jurisdicionais", "soberania maritima"]],
    ["Globalização e Economia", ["globalizacao", "economia mundial", "comercio internacional", "capitalismo", "divisao internacional do trabalho"]],
    ["População e Demografia", ["populacao", "demografia", "migracao", "piramide etaria", "censo", "envelhecimento"]],
    ["Urbanização", ["urbanizacao", "urbana", "cidade", "metropole", "rede urbana", "favela", "mobilidade urbana"]],
    ["Agropecuária e Espaço Rural", ["agropecuaria", "agricultura", "agronegocio", "espaco rural", "reforma agraria", "pecuaria"]],
    ["Indústria", ["industria", "industrializacao", "tecnopolo"]],
    ["Energia e Recursos", ["energia", "petroleo", "hidreletrica", "matriz energetica", "recursos naturais", "mineracao"]],
    ["Questões Ambientais", ["ambiental", "desmatamento", "aquecimento global", "sustentabilidade", "impacto ambiental", "poluicao"]],
    ["Climatologia", ["clima", "climatologia", "massa de ar", "el nino", "atmosfera"]],
    ["Hidrografia", ["hidrografia", "bacia hidrografica", "rio", "oceano", "agua"]],
    ["Geomorfologia e Relevo", ["relevo", "geomorfologia", "solo", "erosao", "placa tectonica", "geologia"]],
    ["Biomas e Vegetação", ["bioma", "vegetacao", "amazonia", "cerrado", "caatinga", "mata atlantica", "pantanal"]],
    ["Cartografia", ["cartografia", "mapa", "escala", "projecao", "coordenada geografica", "fuso horario"]],
  ],
  "Inglês": [
    ["Verb Tenses", ["verb tense", "tempos verbais", "present perfect", "simple past", "future", "past perfect", "continuous"]],
    ["Modal Verbs", ["modal"]],
    ["Conditionals", ["conditional", "condicional", "if clause"]],
    ["Passive Voice", ["passive", "voz passiva"]],
    ["Reported Speech", ["reported speech", "discurso indireto"]],
    ["Phrasal Verbs", ["phrasal"]],
    ["Prepositions", ["preposition", "preposic"]],
    ["Conjunctions and Connectors", ["conjunction", "connector", "conectivo", "linking word", "marcadores discursivos", "discourse marker"]],
    ["Pronouns", ["pronoun", "pronome"]],
    ["Comparatives and Superlatives", ["comparative", "superlative", "comparativo"]],
    ["Articles and Determiners", ["article", "artigo", "determiner", "quantifier"]],
    ["Adjectives and Adverbs", ["adjective", "adverb", "adjetivo", "adverbio"]],
    ["Word Formation", ["word formation", "affix", "prefix", "suffix", "formacao de palavras"]],
    ["Vocabulary", ["vocabulary", "vocabulario", "lexico", "false friend", "idiom", "expressao idiomatica", "sinonimo"]],
    ["Reading Comprehension", ["reading", "interpretac", "compreensao", "text", "inference", "main idea", "analise"]],
    ["Gramática e Estrutura da Frase", ["gramatica", "grammar", "sentence structure", "parts of speech", "estrutura da frase", "plural dos substantivos", "referencia pronominal", "concordancia"]],
  ],
  "Literatura": [
    ["Modernismo", ["modernismo", "semana de 22", "geracao de 30", "oswald", "mario de andrade", "drummond", "clarice", "guimaraes rosa"]],
    ["Romantismo", ["romantismo", "jose de alencar", "castro alves", "goncalves dias", "alvares de azevedo"]],
    ["Realismo e Naturalismo", ["realismo", "naturalismo", "machado de assis", "aluisio azevedo"]],
    ["Parnasianismo e Simbolismo", ["parnasianismo", "simbolismo", "olavo bilac", "cruz e sousa"]],
    ["Barroco e Arcadismo", ["barroco", "arcadismo", "gregorio de matos", "tomas antonio gonzaga"]],
    ["Trovadorismo, Humanismo e Classicismo", ["trovadorismo", "humanismo", "classicismo", "camoes", "quinhentismo"]],
    ["Literatura Contemporânea", ["contemporanea", "pos-modern", "literatura atual"]],
    ["Gêneros e Análise Literária", ["genero literario", "analise poetica", "poesia", "prosa", "figuras", "verso", "soneto", "narrativa", "metalinguagem", "intertextual"]],
  ],
  "Filosofia": [
    ["Ética e Moral", ["etica", "moral", "virtude", "bem e mal", "liberdade"]],
    ["Filosofia Política", ["politica", "contrato social", "estado", "poder", "democracia", "hobbes", "locke", "rousseau", "maquiavel"]],
    ["Teoria do Conhecimento", ["conhecimento", "epistemologia", "verdade", "razao", "empirismo", "racionalismo", "ceticismo", "kant"]],
    ["Lógica", ["logica", "silogismo", "argumento", "falacia"]],
    ["Filosofia Antiga", ["antiga", "socrates", "platao", "aristoteles", "pre-socratico", "estoicismo", "epicurismo"]],
    ["Filosofia Medieval", ["medieval", "agostinho", "tomas de aquino", "patristica", "escolastica"]],
    ["Filosofia Moderna", ["moderna", "descartes", "espinosa", "hume", "iluminismo"]],
    ["Filosofia Contemporânea", ["contemporanea", "nietzsche", "sartre", "existencialismo", "frankfurt", "foucault", "marx"]],
    ["Estética", ["estetica", "arte e filosofia", "belo"]],
  ],
  "Sociologia": [
    ["Teóricos Clássicos", ["durkheim", "weber", "marx", "comte", "classicos", "fato social", "acao social", "materialismo"]],
    ["Trabalho e Sociedade", ["trabalho", "emprego", "desemprego", "sindicato", "taylorismo", "fordismo", "toyotismo", "precarizacao"]],
    ["Desigualdade e Estratificação", ["desigualdade", "estratificacao", "classe social", "pobreza", "exclusao", "mobilidade social"]],
    ["Cidadania e Direitos", ["cidadania", "direitos", "direitos humanos", "constituicao"]],
    ["Movimentos Sociais", ["movimento social", "militancia", "protesto", "feminismo", "movimento negro", "lgbt"]],
    ["Cultura e Identidade", ["cultura", "identidade", "etnocentrismo", "diversidade", "industria cultural", "cultura de massa"]],
    ["Estado e Poder", ["estado", "poder", "burocracia", "politica", "democracia"]],
    ["Violência e Segurança", ["violencia", "seguranca publica", "criminalidade"]],
    ["Globalização", ["globalizacao", "capitalismo", "neoliberalismo"]],
  ],
  "Artes": [
    ["Movimentos Artísticos", ["movimento", "vanguarda", "impressionismo", "cubismo", "surrealismo", "expressionismo", "renascimento", "barroco", "modernismo"]],
    ["Artes Visuais", ["artes visuais", "pintura", "escultura", "desenho", "fotografia", "grafite", "quadro"]],
    ["Música", ["musica", "ritmo", "melodia", "instrumento", "canc", "samba", "mpb"]],
    ["Teatro e Dança", ["teatro", "danca", "performance", "cena", "corpo"]],
    ["Arte Contemporânea", ["contemporanea", "instalacao", "arte digital"]],
    ["Patrimônio e Cultura Popular", ["patrimonio", "cultura popular", "folclore", "artesanato", "indigena", "afro"]],
    ["Cinema e Audiovisual", ["cinema", "filme", "audiovisual"]],
  ],
  "Educação Física": [
    ["Fisiologia do Exercício", ["fisiologia", "aerobio", "anaerobio", "frequencia cardiaca", "vo2", "musculo", "treinamento"]],
    ["Saúde e Qualidade de Vida", ["saude", "qualidade de vida", "sedentarismo", "obesidade", "nutricao", "alimentacao"]],
    ["Esportes Coletivos", ["futebol", "volei", "basquete", "handebol", "coletivo"]],
    ["Esportes Individuais", ["atletismo", "natacao", "ginastica", "lutas", "individual", "corrida"]],
    ["História e Sociologia do Esporte", ["historia do esporte", "olimpiada", "jogos olimpicos", "esporte e sociedade", "doping"]],
    ["Jogos, Lazer e Cultura Corporal", ["jogo", "lazer", "brincadeira", "cultura corporal", "recreacao"]],
    ["Esporte e Prática Esportiva", ["esporte", "esportiva", "modalidade"]],
  ],
  "Atualidades": [
    ["Política Nacional", ["politica nacional", "brasil", "eleicao", "governo"]],
    ["Geopolítica Internacional", ["internacional", "guerra", "conflito", "mundo"]],
    ["Meio Ambiente e Clima", ["ambiente", "clima", "cop", "sustentabilidade"]],
    ["Ciência e Tecnologia", ["tecnologia", "ciencia", "inteligencia artificial", "espaco"]],
    ["Economia", ["economia", "inflacao", "juros", "mercado"]],
  ],
};

/** Matérias guarda-chuva do ENEM: herdam as listas das matérias-base. */
export const HERANCA: Record<string, readonly string[]> = {
  "Ciências da Natureza": ["Física", "Química", "Biologia"],
  "Ciências Humanas": ["História", "Geografia", "Filosofia", "Sociologia"],
  "Linguagens": ["Português", "Literatura", "Inglês", "Artes", "Educação Física"],
  "Matemática e suas Tecnologias": ["Matemática"],
  "Redação": ["Português"],
};

/**
 * Reduz o plural português ao singular, de forma grosseira e SIMÉTRICA.
 *
 * O ponto não é acertar gramática: é que o mesmo texto vire a mesma coisa
 * dos dois lados da comparação. Sem isto, o termo "inequação" não casa com
 * o rótulo "Inequações" e dezenas de assuntos escapam por causa de um "s".
 *
 * Espelho de `_singular` em scripts/taxonomia.py.
 */
function singular(palavra: string): string {
  if (palavra.length <= 4) return palavra;
  const trocas: readonly (readonly [string, string])[] = [
    ['oes', 'ao'], ['aes', 'ao'], ['ais', 'al'], ['eis', 'el'],
    ['ois', 'ol'], ['zes', 'z'], ['res', 'r'], ['ses', 's'],
    ['ns', 'm'], ['is', 'il'],
  ];
  for (const [fim, troca] of trocas) {
    if (palavra.endsWith(fim)) return palavra.slice(0, -fim.length) + troca;
  }
  return palavra.endsWith('s') ? palavra.slice(0, -1) : palavra;
}

/** Espelho de `_norm`: minúscula, sem acento, espaço único, singular. */
function norm(texto: string): string {
  const t = (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return '';
  return t.split(' ').map(singular).join(' ');
}

/**
 * O termo precisa começar no INÍCIO DE UMA PALAVRA do rótulo.
 *
 * Não pode exigir palavra inteira — os termos são prefixos de propósito.
 * Não pode aceitar substring crua — substring crua casa no meio da palavra,
 * e palavras se contêm: "organica" dentro de "inorganica", "etica" dentro
 * de "estetica", "sintaxe" dentro de "morfossintaxe".
 *
 * Espelho de `_casa` em scripts/taxonomia.py.
 */
function casa(termo: string, alvo: string): boolean {
  if (!termo) return false;
  let de = alvo.indexOf(termo);
  while (de !== -1) {
    const anterior = de > 0 ? alvo[de - 1] : '';
    if (!/[0-9a-z]/.test(anterior)) return true;
    de = alvo.indexOf(termo, de + 1);
  }
  return false;
}

/** " e " entra como separador: "Equações Lineares e Área" tem dois assuntos. */
const SEPARADORES = /\s*(?:[/;·—–|]|\s-\s|\(|,|\se\s)\s*/;

/**
 * Corta o rótulo no primeiro separador e limpa. É o que transforma
 * "Geometria Plana (Triângulo Equilátero e Radiciação)" em "Geometria Plana"
 * mesmo quando nenhum termo do dicionário casou.
 *
 * Espelho de `reduzir` em scripts/taxonomia.py.
 */
export function reduzir(assunto: string): string {
  let base = (assunto ?? '').split(SEPARADORES)[0] ?? '';
  base = base.replace(/\)/g, '').replace(/^[ .\-—]+|[ .\-—]+$/g, '');
  base = base.replace(/\s+/g, ' ');
  if (!base) return 'Geral';

  const miudas = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'a', 'o', 'no', 'na']);
  return base
    .split(' ')
    .map((p, i) => {
      if (i && miudas.has(p.toLowerCase())) return p;
      // Espelha `str.isupper()` do Python: precisa ter letra, e toda letra
      // tem que ser maiúscula. `p === p.toUpperCase()` sozinho diria "sim"
      // para "123" e para "-", que não têm letra nenhuma.
      if (p !== p.toLowerCase() && p === p.toUpperCase()) return p;
      // Espelha `str.capitalize()`: primeira em maiúscula, RESTO EM MINÚSCULA.
      // Sem o toLowerCase, "Pré-Socrática" ficava "Pré-Socrática" no TS e
      // "Pré-socrática" no Python — dois assuntos diferentes para o mesmo
      // rótulo, dependendo de por onde a prova entrasse.
      return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
    })
    .join(' ');
}

function listasDaMateria(materia: string): readonly Entrada[] {
  const propria = TAXONOMIA[materia];
  if (propria) return propria;

  const combinada: Entrada[] = [];
  for (const origem of HERANCA[materia] ?? []) {
    combinada.push(...(TAXONOMIA[origem] ?? []));
  }
  return combinada;
}

/**
 * Devolve o assunto canônico e se ele casou no dicionário.
 *
 * `casouNoDicionario = false` significa que caiu na redução por regra — o
 * número desses é a métrica de cobertura da taxonomia. Preferimos um assunto
 * solto e honesto a forçá-lo num balde errado.
 *
 * Espelho de `canonizar` em scripts/taxonomia.py, conferido sobre o banco
 * real por scripts/checar_paridade_taxonomia.py.
 */
export function canonizarAssunto(
  materia: string | null,
  assunto: string | null
): { assunto: string; casouNoDicionario: boolean } {
  const bruto = (assunto ?? '').trim();
  if (!bruto) return { assunto: 'Geral', casouNoDicionario: false };

  const alvo = norm(bruto);

  for (const [canonico, termos] of listasDaMateria(materia ?? '')) {
    for (const termo of termos) {
      if (casa(norm(termo), alvo)) {
        return { assunto: canonico, casouNoDicionario: true };
      }
    }
  }

  return { assunto: reduzir(bruto), casouNoDicionario: false };
}
