/**
 * Como escrever a redação — o conteúdo de ensino.
 *
 * `redacao.ts` tem a RÉGUA (como você é corrigido). Este arquivo tem o
 * MÉTODO (como se escreve para atender a régua). São coisas diferentes e por
 * isso moram separadas: a rubrica muda quando o INEP muda; o método, não.
 *
 * Fica em código, e não no banco, pelo mesmo motivo da rubrica: não é
 * conteúdo que o admin cadastra por concurso, é a definição do exercício.
 *
 * ─── Sobre os repertórios ───────────────────────────────────────────────────
 * Todo repertório aqui é REAL e verificável: obra, autor, lei, dado ou
 * documento que existe. Não há citação inventada — repertório falso é o erro
 * mais caro que um aluno pode cometer, porque o corretor conhece a obra.
 *
 * Cada um traz `comoUsar`: repertório sem articulação com o tema não pontua.
 * A competência 2 exige repertório "pertinente e PRODUTIVO" — produtivo quer
 * dizer que ele sustenta o argumento, não que ele enfeita a frase.
 */

// ═══════════════════════════════════════════════════════════════
// 1. ANATOMIA
// ═══════════════════════════════════════════════════════════════

export interface ParteDaRedacao {
  chave: 'introducao' | 'd1' | 'd2' | 'conclusao';
  titulo: string;
  linhasSugeridas: string;
  /** O que esta parte precisa entregar, em uma frase. */
  objetivo: string;
  /** Os movimentos, na ordem. É o esqueleto do parágrafo. */
  passos: { nome: string; explicacao: string }[];
  /** Moldes de abertura. São andaimes, não frases prontas para copiar. */
  aberturas: string[];
  erros: string[];
  exemplo: { tema: string; texto: string };
}

export const ANATOMIA: ParteDaRedacao[] = [
  {
    chave: 'introducao',
    titulo: 'Introdução',
    linhasSugeridas: '4 a 6 linhas',
    objetivo:
      'Apresentar o tema com um repertório legitimado e terminar com a TESE — o que você vai defender.',
    passos: [
      {
        nome: '1. Repertório de abertura',
        explicacao:
          'Uma obra, um pensador, uma lei, um dado. Serve para mostrar domínio (C2) e para dar autoridade ao que vem depois. Precisa se ligar ao tema — não pode ser enfeite.',
      },
      {
        nome: '2. Ponte para o Brasil de hoje',
        explicacao:
          'Traga o repertório para o problema concreto. É aqui que a maioria falha: cita Bauman e nunca explica o que Bauman tem a ver com o tema.',
      },
      {
        nome: '3. Tese',
        explicacao:
          'A frase mais importante da redação. Diga o que você defende E anuncie os dois argumentos que virão. Sem tese explícita, a C3 não passa de 120.',
      },
    ],
    aberturas: [
      'Na obra [X], o autor [Y] argumenta que [ideia]. Fora da ficção, contudo, o Brasil…',
      'A Constituição Federal de 1988 assegura, em seu artigo [n], que [direito]. Na prática, entretanto,…',
      'Segundo o sociólogo [X], [conceito]. Essa lógica ajuda a entender por que, no Brasil,…',
      'Ao longo do século XX, [processo histórico]. Herdeira desse percurso, a sociedade brasileira…',
      'Dados do [instituto] revelam que [número]. O dado, longe de ser mero registro, escancara…',
    ],
    erros: [
      'Começar com "Nos dias atuais", "Desde os primórdios" ou "Segundo o dicionário": não é repertório, é preenchimento.',
      'Citar o repertório e nunca explicá-lo — o corretor não completa o raciocínio por você.',
      'Terminar sem tese: o parágrafo vira resumo do tema em vez de anúncio do que você defende.',
      'Fazer pergunta retórica: não é proibido, mas gasta linha e não constrói argumento.',
    ],
    exemplo: {
      tema: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
      texto:
        'Em "O Povo Brasileiro", o antropólogo Darcy Ribeiro descreve a formação nacional como resultado do encontro — quase sempre violento — entre matrizes indígenas, africanas e europeias. Passados mais de trinta anos da obra, a violência mudou de forma, mas não desapareceu: comunidades quilombolas e povos indígenas seguem tendo seus territórios e saberes tratados como obstáculo, e não como patrimônio. Esse quadro se sustenta por dois pilares — a fragilidade na demarcação de terras e a invisibilidade dessas culturas na formação escolar.',
    },
  },
  {
    chave: 'd1',
    titulo: 'Desenvolvimento 1',
    linhasSugeridas: '7 a 9 linhas',
    objetivo:
      'Provar o PRIMEIRO argumento anunciado na tese, com repertório novo e articulação clara.',
    passos: [
      {
        nome: '1. Tópico frasal',
        explicacao:
          'A primeira frase diz exatamente qual é o argumento deste parágrafo. Se o corretor não souber do que trata o parágrafo na primeira linha, a C3 cai.',
      },
      {
        nome: '2. Repertório de sustentação',
        explicacao:
          'DIFERENTE do usado na introdução. Um repertório por parágrafo é suficiente; dois mal explicados valem menos que um bem articulado.',
      },
      {
        nome: '3. Desenvolvimento com causa e efeito',
        explicacao:
          'Explique o mecanismo: por que isso acontece e o que isso provoca. É onde mora a "argumentação consistente" que a C2 exige para os 200.',
      },
      {
        nome: '4. Fechamento',
        explicacao:
          'Uma frase que amarra o parágrafo à tese. Sem ela, o parágrafo parece solto.',
      },
    ],
    aberturas: [
      'Em primeiro lugar, é preciso destacar que…',
      'Sob esse viés, cabe analisar que…',
      'A princípio, convém ressaltar que…',
      'Nesse sentido, o primeiro entrave reside em…',
      'Diante desse cenário, evidencia-se que…',
    ],
    erros: [
      'Dois argumentos no mesmo parágrafo: cada um perde profundidade e a C3 penaliza.',
      'Repetir o repertório da introdução — o corretor percebe e conta como repertório único.',
      'Ficar no senso comum ("a educação é a base de tudo") sem mecanismo explicativo.',
      'Trocar argumento por opinião pessoal em primeira pessoa: o texto é dissertativo, não relato.',
    ],
    exemplo: {
      tema: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
      texto:
        'Em primeiro lugar, a morosidade na demarcação de terras converte um direito constitucional em promessa. O artigo 231 da Constituição de 1988 reconhece aos indígenas os direitos originários sobre as terras que ocupam tradicionalmente, e o artigo 68 do ADCT garante a titulação das terras quilombolas; ainda assim, centenas de processos se arrastam por décadas nos órgãos responsáveis. A consequência é direta: sem título, a comunidade não acessa crédito, não consegue defender-se juridicamente da invasão e passa a viver sob ameaça permanente. Assim, a valorização dessas populações esbarra num obstáculo anterior à cultura — a própria garantia de existir no território.',
    },
  },
  {
    chave: 'd2',
    titulo: 'Desenvolvimento 2',
    linhasSugeridas: '7 a 9 linhas',
    objetivo:
      'Provar o SEGUNDO argumento, por um ângulo diferente do primeiro — não uma variação dele.',
    passos: [
      {
        nome: '1. Conectivo de adição + tópico frasal',
        explicacao:
          'Abra ligando ao parágrafo anterior. É aqui que a C4 é mais visível: sem conectivo, os parágrafos apenas se sucedem.',
      },
      {
        nome: '2. Mude o eixo',
        explicacao:
          'Se o D1 foi jurídico, faça o D2 cultural ou educacional. Dois argumentos do mesmo eixo parecem um argumento repetido.',
      },
      {
        nome: '3. Repertório + mecanismo',
        explicacao: 'Mesmo padrão do D1, com fonte nova.',
      },
      {
        nome: '4. Fechamento que prepara a conclusão',
        explicacao:
          'A última frase do D2 é a ponte para a proposta de intervenção. Bem feita, a conclusão escreve-se quase sozinha.',
      },
    ],
    aberturas: [
      'Além disso, convém observar que…',
      'Ademais, outro fator determinante é…',
      'Somado a isso, destaca-se que…',
      'Outrossim, é imprescindível considerar que…',
      'Paralelamente, verifica-se que…',
    ],
    erros: [
      'Repetir "Além disso" se já usou na introdução ou no D1 — repetição de conectivo é o desvio de C4 mais comum.',
      'Fazer do D2 uma paráfrase do D1: o corretor lê como um argumento só.',
      'Deixar o parágrafo sem ligação com a tese anunciada.',
    ],
    exemplo: {
      tema: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
      texto:
        'Somado a isso, a escola brasileira ainda ensina esses povos no passado. Embora a Lei 11.645/2008 torne obrigatório o ensino de história e cultura indígena e afro-brasileira na educação básica, a aplicação é desigual e frequentemente reduzida a datas comemorativas. O efeito é o que o sociólogo Pierre Bourdieu chamaria de violência simbólica: ao apresentar essas culturas como resquício, e não como presente vivo, a formação escolar naturaliza a ideia de que elas não têm lugar no Brasil contemporâneo. Forma-se, então, um ciclo — a invisibilidade na sala de aula alimenta a indiferença social que trava a demarcação discutida acima.',
    },
  },
  {
    chave: 'conclusao',
    titulo: 'Conclusão',
    linhasSugeridas: '5 a 7 linhas',
    objetivo:
      'Retomar a tese e apresentar a PROPOSTA DE INTERVENÇÃO com os cinco elementos — é a competência mais fácil de pontuar e a que mais gente perde.',
    passos: [
      {
        nome: '1. Retomada',
        explicacao:
          'Uma frase que relembra a tese. Não repita palavra por palavra: reformule.',
      },
      {
        nome: '2. Proposta com os 5 elementos',
        explicacao:
          'AGENTE (quem) + AÇÃO (o quê) + MEIO (como) + FINALIDADE (para quê) + DETALHAMENTO (um detalhe de qualquer um deles). Faltando um, a C5 cai de 200 para 160.',
      },
      {
        nome: '3. Fecho',
        explicacao:
          'Uma frase curta de efeito. Opcional — se faltar linha, corte esta, nunca o detalhamento.',
      },
    ],
    aberturas: [
      'Portanto, medidas são necessárias para…',
      'Diante do exposto, urge que…',
      'Depreende-se, portanto, que…',
      'Em suma, é imperativo que…',
      'Logo, para reverter esse quadro,…',
    ],
    erros: [
      'Proposta genérica ("o governo deve investir mais"): sem meio e sem finalidade, não passa de 120.',
      'Esquecer o detalhamento — é o que separa 160 de 200, e custa uma oração.',
      'Propor algo que fere direitos humanos: ZERA a competência 5 inteira.',
      'Trazer argumento novo na conclusão: o lugar de argumentar já passou.',
      'Terminar com "cabe à sociedade refletir": não é proposta, é abandono do problema.',
    ],
    exemplo: {
      tema: 'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
      texto:
        'Depreende-se, portanto, que a valorização dos povos tradicionais depende tanto da garantia territorial quanto do reconhecimento cultural. Cabe ao Ministério dos Povos Indígenas, em articulação com o Ministério da Educação (AGENTE), ampliar a formação continuada de professores da educação básica (AÇÃO), por meio de programas construídos junto às próprias lideranças comunitárias e financiados pelo Fundo Nacional de Desenvolvimento da Educação (MEIO), a fim de que essas culturas sejam ensinadas como parte viva do Brasil contemporâneo (FINALIDADE) — e não apenas em datas comemorativas, como ainda ocorre na maioria das escolas (DETALHAMENTO). Só assim o país deixará de tratar sua própria origem como obstáculo.',
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// 2. CONECTIVOS
// ═══════════════════════════════════════════════════════════════

export interface GrupoConectivos {
  funcao: string;
  /** Onde este grupo mais rende. */
  onde: string;
  termos: string[];
  /** Armadilha típica deste grupo. */
  cuidado?: string;
}

export const CONECTIVOS: GrupoConectivos[] = [
  {
    funcao: 'Iniciar e situar',
    onde: 'Introdução',
    termos: [
      'Ao longo da história',
      'No cenário brasileiro contemporâneo',
      'Nesse contexto',
      'Sob essa ótica',
      'Diante disso',
      'É inegável que',
      'Nota-se que',
    ],
    cuidado:
      '"Nos dias atuais" e "Desde os primórdios" gastam linha e não dizem nada. Evite os dois.',
  },
  {
    funcao: 'Adição',
    onde: 'Abertura do D2, e dentro dos parágrafos',
    termos: [
      'Além disso',
      'Ademais',
      'Outrossim',
      'Somado a isso',
      'Paralelamente',
      'Do mesmo modo',
      'Igualmente',
      'Não só… mas também',
    ],
    cuidado:
      'Repetir "Além disso" em dois parágrafos é o desvio de C4 mais comum de todos. Escolha um por parágrafo e não volte a ele.',
  },
  {
    funcao: 'Oposição e contraste',
    onde: 'Sempre que houver uma ressalva ou um contraponto',
    termos: [
      'Entretanto',
      'Todavia',
      'Contudo',
      'No entanto',
      'Em contrapartida',
      'Por outro lado',
      'Não obstante',
      'Ainda que',
      'Conquanto',
    ],
    cuidado:
      '"Não obstante" é ADVERSATIVO (= apesar disso), não aditivo. Muita gente usa como sinônimo de "além disso" e o corretor conta como inadequação.',
  },
  {
    funcao: 'Causa',
    onde: 'Explicar o mecanismo, no meio dos desenvolvimentos',
    termos: [
      'Visto que',
      'Uma vez que',
      'Porquanto',
      'Dado que',
      'Em virtude de',
      'Haja vista',
      'Já que',
    ],
    cuidado:
      '"Haja vista" não flexiona: é "haja vista os dados", nunca "hajam vista".',
  },
  {
    funcao: 'Consequência',
    onde: 'Fechamento de parágrafo e conclusão',
    termos: [
      'Por conseguinte',
      'Dessa forma',
      'Desse modo',
      'Logo',
      'De modo que',
      'Assim',
      'Como resultado',
    ],
  },
  {
    funcao: 'Exemplificação e comprovação',
    onde: 'Ao introduzir o repertório',
    termos: [
      'A título de exemplo',
      'Isso é evidenciado por',
      'Prova disso é',
      'Como demonstra',
      'Segundo dados de',
      'Conforme aponta',
    ],
    cuidado:
      'Depois de "a título de exemplo", vem exemplo mesmo — não outra afirmação genérica.',
  },
  {
    funcao: 'Ênfase',
    onde: 'Para destacar o ponto central do parágrafo',
    termos: [
      'Sobretudo',
      'Principalmente',
      'Notadamente',
      'Em especial',
      'Vale ressaltar',
      'Cabe destacar',
    ],
  },
  {
    funcao: 'Conclusão',
    onde: 'Primeira frase do último parágrafo',
    termos: [
      'Portanto',
      'Diante do exposto',
      'Depreende-se que',
      'Em suma',
      'Dessarte',
      'Por fim',
      'Conclui-se que',
    ],
    cuidado:
      'Se usou "portanto" para fechar o D2, use outro na conclusão. Repetição a três parágrafos de distância ainda é repetição.',
  },
];

// ═══════════════════════════════════════════════════════════════
// 3. REPERTÓRIOS
// ═══════════════════════════════════════════════════════════════

export interface Repertorio {
  fonte: string;
  autor?: string;
  /** A ideia em uma frase — o que ele afirma. */
  ideia: string;
  /** Como articular com um tema. É isto que transforma citação em argumento. */
  comoUsar: string;
  /** Temas em que costuma render. */
  serve: string[];
}

export interface ContextoRepertorio {
  chave: string;
  titulo: string;
  emoji: string;
  descricao: string;
  itens: Repertorio[];
}

export const REPERTORIOS: ContextoRepertorio[] = [
  {
    chave: 'filosofia',
    titulo: 'Filosofia',
    emoji: '🏛️',
    descricao:
      'Rende quando o tema envolve ética, liberdade, poder ou o dever do Estado.',
    itens: [
      {
        fonte: 'Modernidade Líquida',
        autor: 'Zygmunt Bauman',
        ideia:
          'Nas sociedades contemporâneas, laços, instituições e certezas se dissolvem antes de se consolidarem.',
        comoUsar:
          'Bom para temas de relações sociais, consumo, tecnologia e descartabilidade — inclusive de pessoas. Explique O QUE se liquefaz no seu tema; citar "modernidade líquida" sem dizer o que derrete é o uso mais batido e mais vazio que existe.',
        serve: ['Redes sociais', 'Consumo', 'Trabalho', 'Relações humanas'],
      },
      {
        fonte: 'Eichmann em Jerusalém',
        autor: 'Hannah Arendt',
        ideia:
          'O mal pode ser praticado por gente comum que apenas cumpre ordens e deixa de pensar — a "banalidade do mal".',
        comoUsar:
          'Use quando a omissão coletiva sustenta o problema: preconceito naturalizado, violência tolerada, indiferença institucional.',
        serve: ['Violência', 'Preconceito', 'Omissão do Estado', 'Direitos humanos'],
      },
      {
        fonte: 'Do Contrato Social',
        autor: 'Jean-Jacques Rousseau',
        ideia:
          'O Estado nasce de um pacto em que os indivíduos cedem parte da liberdade em troca de proteção e do bem comum.',
        comoUsar:
          'Excelente para argumentar que o Estado FALHA no que se comprometeu. Frase-chave: "quando o Estado não garante [X], rompe-se o contrato social que o legitima".',
        serve: ['Segurança', 'Saúde', 'Educação', 'Direitos negados'],
      },
      {
        fonte: 'Vigiar e Punir',
        autor: 'Michel Foucault',
        ideia:
          'O poder moderno controla menos pela força e mais pela vigilância e pela norma que cada um internaliza.',
        comoUsar:
          'Forte em temas de dados, algoritmos, corpo e padrões de comportamento. Mostre QUEM vigia e o que se espera que o vigiado faça sozinho.',
        serve: ['Privacidade', 'Tecnologia', 'Padrões de beleza', 'Sistema prisional'],
      },
      {
        fonte: 'Fundamentação da Metafísica dos Costumes',
        autor: 'Immanuel Kant',
        ideia:
          'A pessoa é um fim em si mesma e nunca um meio — e uma ação só é moral se puder ser universalizada.',
        comoUsar:
          'Use quando alguém é tratado como instrumento: exploração do trabalho, mercantilização de corpos, uso de dados pessoais.',
        serve: ['Trabalho', 'Dignidade', 'Dados pessoais', 'Exploração'],
      },
    ],
  },
  {
    chave: 'sociologia',
    titulo: 'Sociologia e Antropologia',
    emoji: '👥',
    descricao:
      'A base mais segura para temas brasileiros: explicam por que o problema se repete.',
    itens: [
      {
        fonte: 'O Povo Brasileiro',
        autor: 'Darcy Ribeiro',
        ideia:
          'A formação do Brasil combinou matrizes indígena, africana e europeia num processo marcado por violência e desigualdade estruturais.',
        comoUsar:
          'Praticamente universal em temas de desigualdade, raça, território e cultura. Diga qual matriz foi apagada no seu tema.',
        serve: ['Desigualdade', 'Racismo', 'Povos tradicionais', 'Cultura'],
      },
      {
        fonte: 'Raízes do Brasil',
        autor: 'Sérgio Buarque de Holanda',
        ideia:
          'O "homem cordial" mistura o público e o privado: as relações pessoais se sobrepõem às regras impessoais.',
        comoUsar:
          'Ótimo para corrupção, privilégio, favorecimento e fragilidade institucional. Mostre onde o pessoal invade o público no seu tema.',
        serve: ['Corrupção', 'Instituições', 'Privilégio', 'Cidadania'],
      },
      {
        fonte: 'A Distinção / conceito de capital cultural',
        autor: 'Pierre Bourdieu',
        ideia:
          'A escola reproduz desigualdades ao tratar como mérito um repertório que só alguns herdam de casa.',
        comoUsar:
          'O melhor repertório para educação e acesso. Também serve para "violência simbólica": quando a cultura dominante desqualifica outra sem usar força.',
        serve: ['Educação', 'Acesso à cultura', 'Desigualdade', 'Meritocracia'],
      },
      {
        fonte: 'Por uma Outra Globalização',
        autor: 'Milton Santos',
        ideia:
          'A globalização tal como é vivida — "globalização perversa" — aprofunda desigualdades em vez de reduzi-las.',
        comoUsar:
          'Use para acesso desigual a tecnologia, saúde, mercado ou informação. Milton Santos é geógrafo brasileiro: pontua alto por ser repertório nacional e legitimado.',
        serve: ['Tecnologia', 'Desigualdade regional', 'Economia', 'Cidades'],
      },
      {
        fonte: 'As Regras do Método Sociológico',
        autor: 'Émile Durkheim',
        ideia:
          'O fato social é exterior ao indivíduo, coercitivo e geral — o problema não é escolha pessoal, é estrutura.',
        comoUsar:
          'Serve para tirar o problema do campo da culpa individual. Frase-chave: "trata-se de um fato social, e não de falha de caráter".',
        serve: ['Qualquer tema estrutural', 'Saúde mental', 'Violência', 'Trabalho'],
      },
      {
        fonte: 'Carnavais, Malandros e Heróis',
        autor: 'Roberto DaMatta',
        ideia:
          'No Brasil convivem a lógica da lei ("indivíduo") e a das relações pessoais ("pessoa"), e a segunda costuma vencer.',
        comoUsar:
          'Bom para o "jeitinho", desigualdade no acesso à justiça e privilégios informais.',
        serve: ['Justiça', 'Privilégio', 'Cultura brasileira'],
      },
    ],
  },
  {
    chave: 'legislacao',
    titulo: 'Legislação e documentos',
    emoji: '⚖️',
    descricao:
      'O repertório mais seguro que existe: é verificável, não se discute e mostra domínio da C2.',
    itens: [
      {
        fonte: 'Constituição Federal de 1988, art. 5º',
        ideia: 'Todos são iguais perante a lei, sem distinção de qualquer natureza.',
        comoUsar:
          'A estrutura que sempre funciona: "a Constituição assegura X; a realidade, contudo, mostra Y". A distância entre a norma e o fato É o argumento.',
        serve: ['Igualdade', 'Discriminação', 'Direitos'],
      },
      {
        fonte: 'Constituição Federal de 1988, art. 6º',
        ideia:
          'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança e a previdência.',
        comoUsar:
          'Use quando o tema envolve um direito social negado. Cite o direito específico, não o artigo inteiro.',
        serve: ['Saúde', 'Moradia', 'Trabalho', 'Transporte', 'Educação'],
      },
      {
        fonte: 'Constituição Federal de 1988, art. 205',
        ideia:
          'A educação é direito de todos e dever do Estado e da família, visando ao pleno desenvolvimento da pessoa e ao preparo para a cidadania.',
        comoUsar:
          'Repare no "e da família": permite propor intervenção com mais de um agente sem sair da lei.',
        serve: ['Educação', 'Cidadania', 'Formação'],
      },
      {
        fonte: 'Lei 11.645/2008',
        ideia:
          'Torna obrigatório o ensino de história e cultura afro-brasileira e indígena na educação básica.',
        comoUsar:
          'Muito forte porque a lei existe e a aplicação falha — o argumento passa a ser de EFETIVAÇÃO, não de criação de norma nova.',
        serve: ['Racismo', 'Povos tradicionais', 'Educação', 'Cultura'],
      },
      {
        fonte: 'Lei Maria da Penha (Lei 11.340/2006)',
        ideia:
          'Cria mecanismos para coibir a violência doméstica e familiar contra a mulher.',
        comoUsar:
          'Combine com dados de subnotificação: existe a lei, existe o crime, falta acesso e acolhimento.',
        serve: ['Violência contra a mulher', 'Gênero', 'Justiça'],
      },
      {
        fonte: 'Estatuto da Criança e do Adolescente (Lei 8.069/1990)',
        ideia:
          'Assegura proteção integral e prioridade absoluta a crianças e adolescentes.',
        comoUsar:
          '"Prioridade absoluta" é expressão da própria lei — use as palavras dela para cobrar a prática.',
        serve: ['Infância', 'Educação', 'Trabalho infantil', 'Saúde mental'],
      },
      {
        fonte: 'Agenda 2030 da ONU (Objetivos de Desenvolvimento Sustentável)',
        ideia:
          '17 objetivos assumidos pelos países-membros, entre eles educação de qualidade, igualdade de gênero e redução das desigualdades.',
        comoUsar:
          'Cite o ODS específico (ex.: ODS 4, educação de qualidade). Serve muito bem na proposta de intervenção, como parâmetro internacional.',
        serve: ['Praticamente todos os temas sociais'],
      },
      {
        fonte: 'Declaração Universal dos Direitos Humanos (1948)',
        ideia:
          'Estabelece direitos inalienáveis a todos os seres humanos, sem distinção.',
        comoUsar:
          'Útil na conclusão. Atenção: a C5 ZERA se a proposta ferir direitos humanos — citá-los ajuda a manter a proposta dentro do limite.',
        serve: ['Dignidade', 'Minorias', 'Violência'],
      },
    ],
  },
  {
    chave: 'literatura',
    titulo: 'Literatura brasileira',
    emoji: '📚',
    descricao:
      'Pontua alto por ser repertório nacional e legitimado — e é o menos usado pela concorrência.',
    itens: [
      {
        fonte: 'Quarto de Despejo',
        autor: 'Carolina Maria de Jesus',
        ideia:
          'Diário de uma catadora na favela do Canindé: a fome e a exclusão narradas por quem as viveu.',
        comoUsar:
          'Insubstituível em fome, moradia, invisibilidade social e desigualdade. A frase "o Brasil é uma casa: a sala de visita é o Copacabana, o quarto de despejo é a favela" é da própria autora.',
        serve: ['Fome', 'Moradia', 'Desigualdade', 'Invisibilidade'],
      },
      {
        fonte: 'Vidas Secas',
        autor: 'Graciliano Ramos',
        ideia:
          'A família de Fabiano migra fugindo da seca; a linguagem escassa espelha a privação material.',
        comoUsar:
          'Ótimo para seca, migração interna, trabalho precário e para o vínculo entre pobreza e falta de acesso à palavra.',
        serve: ['Migração', 'Pobreza', 'Educação', 'Meio ambiente'],
      },
      {
        fonte: 'Geografia da Fome',
        autor: 'Josué de Castro',
        ideia:
          'A fome não é fenômeno natural nem escassez de alimentos: é produto de decisões políticas e econômicas.',
        comoUsar:
          'Transforma "falta comida" em "há decisão política". É exatamente o tipo de deslocamento que a C3 recompensa.',
        serve: ['Fome', 'Desigualdade', 'Política pública'],
      },
      {
        fonte: 'O Cortiço',
        autor: 'Aluísio Azevedo',
        ideia:
          'O ambiente determina o comportamento; a exploração da moradia coletiva enriquece o proprietário e degrada o morador.',
        comoUsar:
          'Bom para moradia, especulação imobiliária e condições urbanas.',
        serve: ['Moradia', 'Cidades', 'Exploração'],
      },
      {
        fonte: 'Memórias Póstumas de Brás Cubas',
        autor: 'Machado de Assis',
        ideia:
          'A elite brasileira narrada por dentro, com ironia: o privilégio se justifica sozinho.',
        comoUsar:
          'Use com cuidado — só rende se você articular a ironia machadiana com o tema, não como enfeite de nome ilustre.',
        serve: ['Privilégio', 'Desigualdade', 'Hipocrisia social'],
      },
    ],
  },
  {
    chave: 'cinema',
    titulo: 'Cinema e documentário',
    emoji: '🎬',
    descricao:
      'Funciona bem quando a imagem sintetiza o problema. Prefira obra brasileira.',
    itens: [
      {
        fonte: 'Ilha das Flores (1989)',
        autor: 'Jorge Furtado',
        ideia:
          'Curta que segue um tomate até um lixão e conclui que o ser humano ali está abaixo dos porcos na fila da comida.',
        comoUsar:
          'Devastador em fome, desigualdade e dignidade. Curto (13 min) e amplamente conhecido pelos corretores.',
        serve: ['Fome', 'Desigualdade', 'Consumo', 'Dignidade'],
      },
      {
        fonte: 'Cidade de Deus (2002)',
        autor: 'Fernando Meirelles e Kátia Lund',
        ideia:
          'A violência urbana como consequência do abandono estatal ao longo de gerações.',
        comoUsar:
          'Evite o clichê "mostra a violência". Diga o que a obra revela sobre a AUSÊNCIA que produz a violência.',
        serve: ['Violência', 'Periferia', 'Estado ausente'],
      },
      {
        fonte: 'Central do Brasil (1998)',
        autor: 'Walter Salles',
        ideia:
          'Uma escrevente de cartas na estação revela um país em que muita gente não escreve a própria história.',
        comoUsar:
          'Excelente para analfabetismo funcional, acesso à educação e migração.',
        serve: ['Educação', 'Migração', 'Analfabetismo'],
      },
      {
        fonte: 'O Dilema das Redes (2020)',
        autor: 'Jeff Orlowski',
        ideia:
          'Ex-executivos do Vale do Silício explicam como as plataformas são desenhadas para capturar atenção.',
        comoUsar:
          'Bom para tecnologia, saúde mental e desinformação. Combine com Foucault ou Zuboff para dar densidade.',
        serve: ['Tecnologia', 'Saúde mental', 'Desinformação', 'Privacidade'],
      },
    ],
  },
  {
    chave: 'dados',
    titulo: 'Dados e instituições',
    emoji: '📊',
    descricao:
      'O tipo de repertório que mais convence — desde que você não invente o número.',
    itens: [
      {
        fonte: 'IBGE',
        ideia:
          'Instituto oficial de estatística: PNAD Contínua, Censo, indicadores de trabalho, renda, moradia e raça.',
        comoUsar:
          'SE NÃO LEMBRAR O NÚMERO EXATO, NÃO INVENTE. Escreva "dados do IBGE apontam que a maioria de X…" ou "levantamentos do IBGE evidenciam a concentração de Y". Número errado o corretor percebe; número ausente, não.',
        serve: ['Todos os temas sociais e econômicos'],
      },
      {
        fonte: 'IPEA',
        ideia:
          'Instituto de Pesquisa Econômica Aplicada: estudos sobre políticas públicas, violência e desigualdade.',
        comoUsar:
          'Ideal quando você quer mostrar que existe diagnóstico oficial e ainda assim falta política.',
        serve: ['Violência', 'Política pública', 'Desigualdade'],
      },
      {
        fonte: 'Organização Mundial da Saúde (OMS)',
        ideia:
          'Referência internacional em saúde física e mental.',
        comoUsar:
          'Use para saúde mental, dependência digital, vacinação. Evite atribuir números específicos de memória.',
        serve: ['Saúde', 'Saúde mental', 'Vacinação'],
      },
      {
        fonte: 'UNESCO',
        ideia:
          'Agência da ONU para educação, ciência e cultura; produz parâmetros de acesso e patrimônio.',
        comoUsar:
          'Boa para educação e patrimônio cultural, especialmente na proposta de intervenção.',
        serve: ['Educação', 'Cultura', 'Patrimônio'],
      },
      {
        fonte: 'Fórum Brasileiro de Segurança Pública',
        ideia:
          'Anuário com estatísticas de criminalidade e violência no Brasil.',
        comoUsar:
          'Fonte nacional e específica — soa muito mais preparado que "pesquisas mostram".',
        serve: ['Violência', 'Segurança', 'Gênero'],
      },
    ],
  },
  {
    chave: 'tecnologia',
    titulo: 'Tecnologia e contemporaneidade',
    emoji: '🌐',
    descricao: 'Para temas de internet, dados, trabalho digital e informação.',
    itens: [
      {
        fonte: 'A Era do Capitalismo de Vigilância',
        autor: 'Shoshana Zuboff',
        ideia:
          'O comportamento humano virou matéria-prima: as plataformas lucram prevendo e induzindo o que faremos.',
        comoUsar:
          'O repertório mais preciso para dados pessoais e manipulação. Muito acima do genérico "redes sociais viciam".',
        serve: ['Privacidade', 'Dados', 'Manipulação', 'Consumo'],
      },
      {
        fonte: 'Sociedade em Rede',
        autor: 'Manuel Castells',
        ideia:
          'A informação organiza o poder contemporâneo; quem está fora da rede fica fora da decisão.',
        comoUsar:
          'Excelente para exclusão digital: o argumento deixa de ser "falta internet" e passa a ser "falta cidadania".',
        serve: ['Exclusão digital', 'Democracia', 'Educação'],
      },
      {
        fonte: '21 Lições para o Século 21',
        autor: 'Yuval Noah Harari',
        ideia:
          'Num excesso de informação, o recurso escasso passa a ser a clareza e a atenção.',
        comoUsar:
          'Bom para desinformação e saúde mental. Cuidado: virou repertório muito comum — só use se articular bem.',
        serve: ['Desinformação', 'Atenção', 'Tecnologia'],
      },
      {
        fonte: 'Lei Geral de Proteção de Dados (Lei 13.709/2018)',
        ideia:
          'Regula o tratamento de dados pessoais e assegura ao titular o controle sobre as próprias informações.',
        comoUsar:
          'Repertório nacional, jurídico e atual — combinação forte. Ideal para citar a norma no D e cobrar fiscalização na conclusão.',
        serve: ['Privacidade', 'Dados', 'Tecnologia'],
      },
    ],
  },
  {
    chave: 'historia',
    titulo: 'História do Brasil',
    emoji: '🏰',
    descricao: 'Mostra que o problema tem origem — e origem explica persistência.',
    itens: [
      {
        fonte: 'Lei Áurea (1888) e a ausência de política de integração',
        ideia:
          'A abolição libertou sem oferecer terra, trabalho formal, educação ou reparação.',
        comoUsar:
          'O melhor ponto de partida histórico para desigualdade racial. O argumento é a OMISSÃO que veio depois da lei, não a lei.',
        serve: ['Racismo', 'Desigualdade', 'Trabalho', 'Moradia'],
      },
      {
        fonte: 'Constituinte de 1988 e a "Constituição Cidadã"',
        ideia:
          'Após a ditadura, o país escreveu a carta mais garantista de sua história.',
        comoUsar:
          'Use como marco: "trinta e cinco anos depois da Constituição Cidadã, o direito a X segue sendo…".',
        serve: ['Direitos', 'Cidadania', 'Democracia'],
      },
      {
        fonte: 'Estado Novo e o DIP (1937-1945)',
        ideia:
          'O Departamento de Imprensa e Propaganda censurava e produzia a versão oficial dos fatos.',
        comoUsar:
          'Ótimo contraponto histórico em temas de desinformação e liberdade de imprensa.',
        serve: ['Desinformação', 'Imprensa', 'Democracia'],
      },
      {
        fonte: 'Movimento sanitarista e a criação do SUS',
        ideia:
          'A saúde pública universal brasileira nasceu de mobilização social, não de concessão.',
        comoUsar:
          'Serve para mostrar que política pública ampla é possível no Brasil — bom para embasar a proposta de intervenção.',
        serve: ['Saúde', 'Política pública', 'Mobilização'],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// 4. O QUE ZERA E O QUE CUSTA CARO
// ═══════════════════════════════════════════════════════════════

export interface Armadilha {
  gravidade: 'zera' | 'caro' | 'atencao';
  titulo: string;
  explicacao: string;
}

export const ARMADILHAS: Armadilha[] = [
  {
    gravidade: 'zera',
    titulo: 'Fugir do tema',
    explicacao:
      'Escrever sobre o assunto geral em vez do recorte exato da proposta. "Educação" não é o tema; "desafios para a formação educacional de surdos" é. Zera a redação inteira.',
  },
  {
    gravidade: 'zera',
    titulo: 'Não ser dissertativo-argumentativo',
    explicacao:
      'Narrar uma história, escrever poema, fazer carta ou lista. A estrutura é obrigatória.',
  },
  {
    gravidade: 'zera',
    titulo: 'Ferir direitos humanos na proposta',
    explicacao:
      'Propor pena de morte, castigo físico, esterilização, exclusão de grupo. Zera a competência 5 inteira — 200 pontos.',
  },
  {
    gravidade: 'zera',
    titulo: 'Menos de 7 linhas',
    explicacao: 'Texto insuficiente é anulado.',
  },
  {
    gravidade: 'caro',
    titulo: 'Proposta sem os cinco elementos',
    explicacao:
      'Faltando um — quase sempre o detalhamento — a C5 cai de 200 para 160. É o ponto mais barato de recuperar em toda a redação.',
  },
  {
    gravidade: 'caro',
    titulo: 'Repetir o mesmo conectivo',
    explicacao:
      '"Além disso" duas vezes é o desvio de C4 mais comum. Vale a pena listar os conectivos usados ao revisar.',
  },
  {
    gravidade: 'caro',
    titulo: 'Repertório citado e não explicado',
    explicacao:
      'Nome de autor solto não pontua. A C2 exige repertório PRODUTIVO: ele precisa sustentar o argumento, não apenas aparecer.',
  },
  {
    gravidade: 'caro',
    titulo: 'Tese ausente ou escondida',
    explicacao:
      'Sem uma frase que diga o que você defende, a C3 não passa de 120 por mais bem escrito que o texto seja.',
  },
  {
    gravidade: 'atencao',
    titulo: 'Primeira pessoa',
    explicacao:
      '"Eu acho" enfraquece o texto. Prefira a terceira pessoa ou a primeira do plural em momentos pontuais.',
  },
  {
    gravidade: 'atencao',
    titulo: 'Inventar dado ou citação',
    explicacao:
      'Número errado atribuído a instituição real é pior que nenhum número. Se não lembra, cite a instituição sem o valor.',
  },
  {
    gravidade: 'atencao',
    titulo: 'Passar de 30 linhas',
    explicacao: 'O que passa da folha não é lido — e a conclusão costuma ser o que fica de fora.',
  },
];

// ═══════════════════════════════════════════════════════════════
// 5. OS CINCO ELEMENTOS DA PROPOSTA
// ═══════════════════════════════════════════════════════════════

export interface ElementoProposta {
  nome: string;
  pergunta: string;
  exemplos: string[];
}

export const ELEMENTOS_PROPOSTA: ElementoProposta[] = [
  {
    nome: 'Agente',
    pergunta: 'Quem vai executar?',
    exemplos: [
      'o Ministério da Educação',
      'o Poder Legislativo',
      'as secretarias estaduais de saúde',
      'a mídia, em parceria com organizações da sociedade civil',
      'as instituições de ensino básico',
    ],
  },
  {
    nome: 'Ação',
    pergunta: 'O que exatamente será feito?',
    exemplos: [
      'ampliar a formação continuada de professores',
      'criar campanhas educativas permanentes',
      'fiscalizar o cumprimento da lei',
      'implementar programas de acolhimento',
      'destinar verba específica',
    ],
  },
  {
    nome: 'Meio / modo',
    pergunta: 'Como isso será feito?',
    exemplos: [
      'por meio de parcerias com universidades públicas',
      'mediante verba do Fundo Nacional de Desenvolvimento da Educação',
      'via inserção obrigatória no currículo',
      'por intermédio de campanhas em rádio, TV e redes sociais',
    ],
  },
  {
    nome: 'Finalidade',
    pergunta: 'Para quê? Qual efeito se espera?',
    exemplos: [
      'a fim de que o direito assegurado em lei se torne prática',
      'com o objetivo de romper o ciclo de invisibilidade',
      'para que a próxima geração cresça sem naturalizar o problema',
    ],
  },
  {
    nome: 'Detalhamento',
    pergunta: 'Um detalhe a mais sobre qualquer um dos quatro acima.',
    exemplos: [
      '— e não apenas em datas comemorativas, como ocorre hoje',
      'priorizando os municípios com os piores índices',
      'com avaliação anual dos resultados divulgada publicamente',
      'a exemplo do que já ocorre em [política existente]',
    ],
  },
];
