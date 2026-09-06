-- ============================================================================
-- BatCaverna — Seed do Banco de Questões: ENEM
-- Gerado automaticamente por scripts/gerar_seed_sql.py — NÃO EDITE À MÃO.
-- Questões neste arquivo: 400   |   Lote 3 de 5
--
-- Pré-requisitos: migrations 000 e 004 já aplicadas.
-- Idempotente: rodar de novo não duplica (ON CONFLICT em hash_conteudo).
-- ============================================================================

BEGIN;

CREATE TEMP TABLE stg_questoes (
  concurso_sigla    TEXT,
  materia_nome      TEXT,
  assunto_nome      TEXT,
  ano               INTEGER,
  dia_prova         TEXT,
  banca             TEXT,
  numero_ordem      INTEGER,
  numero_original   TEXT,
  area_conhecimento TEXT,
  dificuldade       TEXT,
  texto_base        TEXT,
  enunciado         TEXT,
  alternativas      JSONB,
  resposta_correta  TEXT,
  explicacao        TEXT,
  figura_descricao  TEXT,
  resolucao_passos  JSONB,
  resolucao_status  TEXT,
  precisa_resolucao BOOLEAN,
  anulada           BOOLEAN,
  hash_conteudo     TEXT,
  arquivo_origem    TEXT
) ON COMMIT DROP;

INSERT INTO stg_questoes VALUES
('ENEM', 'Português', 'Ritmo acelerado e estratégias argumentativas', 2021, '1º dia', 'INEP', 16, '16', 'linguagens', 'medio', 'Devagar, devagarinho
Desacelerar é preciso. Acelerar não é preciso. Afobados e voltados para o próprio umbigo, operamos, automatizados, falas robóticas e silêncios glaciais. Ilustra bem esse estado de espírito a música Sinal fechado (1969), de Paulinho da Viola. Trata-se da história de dois sujeitos que se encontram inesperadamente em um sinal de trânsito. A conversa entre ambos, porém, se deu rápida e rasteira. Logo, os personagens se despedem, com a promessa de se verem em outra oportunidade. Percebe-se um registro de comunicação vazia e superficial, cuja tônica foi o contato ligeiro e superficial construído pelos interlocutores: "Olá, como vai? / Eu vou indo, e você, tudo bem? / Tudo bem, eu vou indo correndo, / pegar meu lugar no futuro. E você? / Tudo bem, eu vou indo em busca de um sono / tranquilo, quem sabe? / Quanto tempo... / Pois é, quanto tempo... / Me perdoe a pressa / é a alma dos nossos negócios... / Oh! Não tem de quê. / Eu também só ando a cem".
O culto à velocidade, no contexto apresentado, se coloca como fruto de um imediatismo processual que celebra o alcance dos fins sem dimensionar a qualidade dos meios necessários para atingir determinado propósito. Tal conjuntura favorece a lei do menor esforço (a comodidade) e prejudica a lei do maior esforço (a dignidade).
Como modelo alternativo à cultura fast, temos o movimento slow life, cujo propósito, resumidamente, é conscientizar as pessoas de que a pressa é inimiga da perfeição e do prazer, buscando assim reeducar seus sentidos para desfrutar melhor os sabores da vida.
SILVA, M. F. L. Boletim UFMG, n. 1.749, set. 2011 (adaptado).', 'Nesse artigo de opinião, a apresentação da letra da canção Sinal fechado é uma estratégia argumentativa que visa sensibilizar o leitor porque', '[{"letra": "A", "texto": "adverte sobre os riscos que o ritmo acelerado da vida oferece."}, {"letra": "B", "texto": "exemplifica o fato criticado no texto com uma situação concreta."}, {"letra": "C", "texto": "contrapõe situações de aceleração e de serenidade na vida das pessoas."}, {"letra": "D", "texto": "questiona o clichê sobre a rapidez e a aceleração da vida moderna."}, {"letra": "E", "texto": "apresenta soluções para a cultura da correria que as pessoas vivenciam hoje."}]', 'B', 'A inclusão da letra da canção funciona como estratégia argumentativa por ilustrar de maneira concreta e sensível a comunicação superficial criticada pelo autor.', NULL, NULL, 'resumida', FALSE, FALSE, 'a876d3201705c1151204a03202a36296ba76d002a75d3126b640a1c2629c9e64', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Racismo e mitos de democracia racial', 2021, '1º dia', 'INEP', 17, '17', 'linguagens', 'dificil', 'A história do futebol brasileiro contém, ao longo de um século, registros de episódios racistas. Eis o paradoxo: se, de um lado, a atividade futebolística era depreciada aos olhos da "boa sociedade" como profissão destinada aos pobres, negros e marginais, de outro, achava-se investida do poder de representar e projetar a nação em escala mundial. A Copa do Mundo no Brasil, em 1950, viria a se constituir, nesse sentido, em uma rara oportunidade. Contudo, na decisão contra o Uruguai sobreveio o inesperado revés. As crônicas esportivas elegiam o goleiro Barbosa e o defensor Bigode como bodes expiatórios, "descarregando nas costas" dos jogadores os "prejuízos" da derrota. Uma chibata moral, eis a sentença proferida no tribunal dos brancos. Nos anos 1970, por não atender às expectativas normativas suscitadas pelo estereótipo do "bom negro", Paulo César Lima foi classificado como "jogador-problema". Ele esboçava a revolta da chibata no futebol brasileiro. Enquanto Barbosa e Bigode, sem alternativa, suportaram o linchamento moral na derrota de 1950, Paulo César contra-atacava os que pretendiam condená-lo pelo insucesso de 1974. O jogador assumia as cores e as causas defendidas pela esquadra dos pretos em todas as esferas da vida social. "Sinto na pele esse racismo subjacente", revelou à imprensa francesa: "Isto é, ninguém ousa pronunciar a palavra ''racismo''. Mas posso garantir que ele existe, mesmo na Seleção Brasileira". Sua ousadia consistiu em pronunciar a palavra interdita no espaço simbólico do discurso oficial para reafirmar o mito da democracia racial.
Disponível em: https://observatorioracialfutebol.com.br. Acesso em: 22 jun. 2019 (adaptado).', 'O texto atribui o enfraquecimento do mito da democracia racial no futebol à', '[{"letra": "A", "texto": "responsabilização de jogadores negros pela derrota na final da Copa de 1950."}, {"letra": "B", "texto": "projeção mundial da nação por um esporte antes destinado aos pobres."}, {"letra": "C", "texto": "depreciação de um esporte associado à marginalidade."}, {"letra": "D", "texto": "interdição da palavra \"racismo\" no contexto esportivo."}, {"letra": "E", "texto": "atitude contestadora de um \"jogador-problema\"."}]', 'E', 'O enfraquecimento do mito da democracia racial decorre da postura corajosa e contestadora de jogadores como Paulo César Lima ao denunciarem publicamente o racismo.', NULL, NULL, 'resumida', FALSE, FALSE, 'a83c7dd9030fd15912b1e54f1d66b5b660b4831ef3f172661b23d64ad4e0ee79', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Romantismo e representação idealizada do corpo', 2021, '1º dia', 'INEP', 18, '18', 'linguagens', 'medio', '[DESCRIÇÃO DA IMAGEM: Reprodução da pintura "Moema" de Victor Meirelles, mostrando a índia morta estendida na praia, com figuras de portugueses ao fundo.]
MEIRELLES, V. Moema. Óleo sobre tela, 129 cm x 190 cm. Masp, São Paulo, 1866. Disponível em: www.masp.art.br. Acesso em: 13 ago. 2012 (adaptado).', 'Nessa obra, que retrata uma cena de Caramuru, célebre poema épico brasileiro, a filiação à estética romântica manifesta-se na', '[{"letra": "A", "texto": "exaltação do retrato fiel da beleza feminina."}, {"letra": "B", "texto": "tematização da fragilidade humana diante da morte."}, {"letra": "C", "texto": "ressignificação de obras do cânone literário nacional."}, {"letra": "D", "texto": "representação dramática e idealizada do corpo da índia."}, {"letra": "E", "texto": "oposição entre a condição humana e a natureza primitiva."}]', 'D', 'A representação pictórica da índia Moema filia-se ao Romantismo por apresentar uma estetização altamente dramática, sentimental e idealizada do corpo indígena.', 'Reprodução da pintura "Moema" de Victor Meirelles, mostrando a índia morta estendida na praia, com figuras de portugueses ao fundo.', NULL, 'resumida', FALSE, FALSE, 'aa07538b2e291dc9a7c281ca47018ccc79d6cf42dcdda971edcd014d244c00a0', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Transformações nas experiências lúdicas infantis', 2021, '1º dia', 'INEP', 19, '19', 'linguagens', 'facil', 'Coincidindo com o Dia Internacional dos Direitos da Infância, foram apresentados diversos trabalhos que mostram as mudanças que afetam a vida das crianças. Um desses estudos compara o que sonham e brincam as crianças hoje em relação às dos anos 1990. E o que se descobriu é que as crianças têm agora menos lazer e estão mais sobrecarregadas por deveres e atividades extracurriculares do que as de 25 anos atrás. As crianças de hoje não só dedicam menos tempo para brincar, como também, quando brincam, a maioria não o faz com outras crianças no parque, na rua ou na praça, mas em casa e muitas vezes sozinhas. E já não brincam tanto com brinquedos, mas com aparelhos eletrônicos, entre os quais predomina o jogo individual com a máquina.
OLIVA, M. P. O direito das crianças ao lazer... e a crescer sem carências. El País, 20 nov. 2015 (adaptado).', 'O texto indica que as transformações nas experiências lúdicas na infância', '[{"letra": "A", "texto": "fomentaram as relações sociais entre as crianças."}, {"letra": "B", "texto": "tornaram o lazer uma prática difundida entre as crianças."}, {"letra": "C", "texto": "incentivaram a criação de novos espaços para se divertir."}, {"letra": "D", "texto": "promoveram uma vivência corporal menos ativa."}, {"letra": "E", "texto": "contribuíram para o aumento do tempo dedicado para brincar."}]', 'D', 'O texto aponta que o foco em jogos eletrônicos individuais e brincadeiras caseiras reduziu a atividade física e a vivência corporal ativa das crianças.', NULL, NULL, 'resumida', FALSE, FALSE, 'ceefc08ec922ae56ffe155a0f87c555544bc883e796de45cc6aefc7bca24323b', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Dança contemporânea e mídias digitais', 2021, '1º dia', 'INEP', 20, '20', 'linguagens', 'medio', '[DESCRIÇÃO DA IMAGEM: Composição fotográfica em mosaico mostrando sequências de miniaturas de bailarinos geradas por computação gráfica em telas e molduras digitais.]
Que tal transformar a internet em palco para a dança? O coreógrafo e bailarino Didier Mulleras se destaca como um dos criadores que descobriram a dança de outro ponto de vista. Mini@tures é uma experiência emblemática entre movimento, computador, internet e vídeo. Com os recursos da computação gráfica, a dança das miniaturas pode caber na palma da mão. Pelo fato de usar a internet como palco, o processo de criação das miniaturas de dança levou em consideração os limites de tempo de download e o tamanho de arquivo, para que um número maior de "espectadores" pudesse assistir. A graça das miniaturas está justamente na contaminação entre mídias: corpo/dança/computação gráfica/internet.
De fato, é a rede que faz a maior diferença nesse grupo. Mini@tures explora uma nova dimensão que descobre o espaço-tempo da web e conquista um novo território para a dança contemporânea. A qualquer hora, dança on-line.
SPANGHERO, M. A dança dos encéfalos acesos. São Paulo: Itaú Cultural, 2003 (adaptado).', 'Considerado o primeiro projeto de dança contemporânea concebido para a rede, esse trabalho é apresentado como inovador por', '[{"letra": "A", "texto": "adotar uma perspectiva conceitual como contraposição à tradição de grandes espetáculos."}, {"letra": "B", "texto": "criar novas formas de financiamento ao utilizar a internet para divulgação das apresentações."}, {"letra": "C", "texto": "privilegiar movimentos gerados por computação gráfica, com a substituição do palco pela tela."}, {"letra": "D", "texto": "produzir uma arte multimodal, com o intuito de ampliar as possibilidades de expressão estética."}, {"letra": "E", "texto": "redefinir a extensão e o propósito do espetáculo para adaptá-lo ao perfil de diferentes usuários."}]', 'D', 'O projeto é inovador por realizar a fusão multimodal entre corpo, dança, computação gráfica e internet, expandindo as fronteiras da expressão artística.', 'Composição fotográfica em mosaico mostrando sequências de miniaturas de bailarinos geradas por computação gráfica em telas e molduras digitais.', NULL, 'resumida', FALSE, FALSE, '9fe59e2694814d299f1db0a13ea6e6c19094fc30962e070daae924ab5b0565c7', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Ciclo hidrológico e reservatórios de água doce', 2021, '1º dia', 'INEP', 21, '21', 'linguagens', 'dificil', 'TEXTO I
O mito da estiagem em São Paulo
Os estoques de água doce são inesgotáveis, na medida em que são alimentados principalmente pelos oceanos, infinitos via evaporação e precipitação, ou seja, pelo ciclo hidrológico, que depende de forças físicas as quais o homem nunca poderá interromper. Enquanto existirem, o ciclo funcionará e os estoques de água doce nos continentes serão repostos indefinidamente.
Obviamente que a água não se distribui equitativamente pelo planeta. Há regiões com muita água, normalmente na zona tropical, na qual a evaporação é maior, e regiões áridas, onde, por razões específicas da dinâmica climática, as taxas de evaporação são maiores do que a precipitação, gerando déficit de reposição de estoques de água doce.
Disponível em: www.cartanaescola.com.br. Acesso em: 17 jan. 2015 (adaptado).
TEXTO II
O processo de sedimentação no fundo do lago de um reservatório é um processo lento. Os sedimentos vão formando argila, que é uma rocha impermeável. Então, a água daquele lago não vai alimentar os aquíferos. Mesmo tendo muita quantidade de água superficial, ela não consegue penetrar no solo para alimentar os aquíferos. Se não for usada no consumo, ela vai simplesmente evaporar e vai cair em outro lugar, levada pelas correntes aéreas. Isso é outro motivo pelo qual os aquíferos não conseguem recuperar seu nível, porque não recebem água.
Disponível em: www.jornalopcao.com.br. Acesso em: 17 jan. 2015 (adaptado).', 'Os textos I e II abordam a situação dos reservatórios de água doce do planeta. Entretanto, a divergência entre eles está na ideia de que é possível', '[{"letra": "A", "texto": "manter os estoques de água doce."}, {"letra": "B", "texto": "utilizar a água superficial para o consumo."}, {"letra": "C", "texto": "repor os estoques de água doce em regiões áridas."}, {"letra": "D", "texto": "reduzir as taxas de precipitação e evaporação da água."}, {"letra": "E", "texto": "equalizar a distribuição de água doce nas diferentes regiões."}]', 'A', 'A divergência central reside na premissa da manutenção dos estoques: o Texto I os vê como inesgotáveis via ciclo hidrológico, enquanto o Texto II aponta severos impedimentos na recarga de aquíferos.', NULL, NULL, 'resumida', FALSE, FALSE, '3a3a21eaeab105e6b32d75b16c0ab92fc340e353684c30de4834d900bbe8d8ec', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Variação pronominal e diversidade linguística', 2021, '1º dia', 'INEP', 22, '22', 'linguagens', 'medio', 'Os linguistas têm notado a expansão do tratamento informal. "Tenho 78 anos e devia ser tratado por senhor, mas meus alunos mais jovens me tratam por você", diz o professor Ataliba Castilho, aparentemente sem se incomodar com a informalidade, inconcebível em seus tempos de estudante.
O você, porém, não reinará sozinho. O tu predomina em Porto Alegre e convive com o você no Rio de Janeiro e em Recife, enquanto você é o tratamento predominante em São Paulo, Curitiba, Belo Horizonte e Salvador. O tu já era mais próximo e menos formal que você nas quase 500 cartas do acervo on-line de uma instituição universitária, quase todas de poetas, políticos e outras personalidades do final do século XIX e início do XX.
Disponível em: http://revistapesquisa.fapesp.br. Acesso em: 21 abr. 2015 (adaptado).', 'No texto, constata-se que os usos de pronomes variaram ao longo do tempo e que atualmente têm empregos diversos pelas regiões do Brasil. Esse processo revela que', '[{"letra": "A", "texto": "a escolha de \"você\" ou de \"tu\" está condicionada à idade da pessoa que usa o pronome."}, {"letra": "B", "texto": "a possibilidade de se usar tanto \"tu\" quanto \"você\" caracteriza a diversidade da língua."}, {"letra": "C", "texto": "o pronome \"tu\" tem sido empregado em situações informais por todo o país."}, {"letra": "D", "texto": "a ocorrência simultânea de \"tu\" e de \"você\" evidencia a inexistência da distinção entre níveis de formalidade."}, {"letra": "E", "texto": "o emprego de \"você\" em documentos escritos demonstra que a língua tende a se manter inalterada."}]', 'B', 'A coexistência e a variação regional no uso de pronomes como "tu" e "você" refletem e evidenciam a rica diversidade e o dinamismo da língua portuguesa no Brasil.', NULL, NULL, 'resumida', FALSE, FALSE, '316a8b538ffebd59371646337213d8495b256f5ff38e1ca8d60b9724d0cea780', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Hibridismo cultural e manifestações artísticas', 2021, '1º dia', 'INEP', 23, '23', 'linguagens', 'medio', 'O solo A morte do cisne, criado em 1905 pelo russo Mikhail Fokine a partir da música do compositor francês Camille Saint-Saëns, retrata o último voo de um cisne antes de morrer. Na versão original, uma bailarina com figurino impecavelmente branco e na ponta dos pés interpreta toda a agonia da ave se debatendo até desfalecer.
Em 2012, John Lennon da Silva, de 20 anos, morador do bairro de São Mateus, na Zona Leste de São Paulo, elaborou um novo jeito de dançar a coreografia imortalizada pela bailarina Anna Pavlova. No lugar de um colã e das sapatilhas, vestiu calça jeans, camiseta e tênis. Em vez de balé, trouxe o estilo popping da street dance. Sua apresentação inovadora de A morte do cisne, que foi ao ar no programa Se ela dança, eu danço, virou hit no YouTube.
Disponível em: www.correiobraziliense.com.br. Acesso em: 18 jun. 2019 (adaptado).', 'A forma original de John Lennon da Silva reinterpretar a coreografia de A morte do cisne demonstra que', '[{"letra": "A", "texto": "a composição da coreografia foi influenciada pela escolha do figurino."}, {"letra": "B", "texto": "a criação artística é beneficiada pelo encontro de modelos oriundos de diferentes realidades socioculturais."}, {"letra": "C", "texto": "a variação entre os modos de dançar uma mesma música evidencia a hierarquia que marca manifestações artísticas."}, {"letra": "D", "texto": "a formação erudita, à qual o dançarino não teve acesso, resulta em artistas que só conhecem a estética da arte popular."}, {"letra": "E", "texto": "a interpretação, por homens, de coreografias originalmente concebidas para mulheres exige uma adaptação complexa."}]', 'B', 'A releitura de um balé clássico através de técnicas urbanas comprova que a criação artística se beneficia do encontro inovador entre diferentes realidades socioculturais.', NULL, NULL, 'resumida', FALSE, FALSE, 'a744d1cac069b322562c8e31c5a539e86e951b79915a9d413aa0d9c91402744c', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Violência institucional e sistema prisional', 2021, '1º dia', 'INEP', 24, '24', 'linguagens', 'dificil', 'Seus primeiros anos de detento foram difíceis; aos poucos entendeu como o sistema funciona. Apanhou dezenas de vezes, teve o crânio esmagado, o maxilar deslocado, braços e pernas quebrados; por fim, um dia ficou lesionado da perna quando foi jogado da laje de um pavilhão. Nem todas as vezes ele soube por que apanhou, muito menos da última, quando foi deixado para morrer, mas sobreviveu. Seu corpo, moído no inferno, aguarda o fim dos seus dias. Já não questiona mais. Obedece. Cumpre as ordens. Baixa a cabeça e se retira. Apanha, às vezes com motivo, às vezes sem. Por onde passaram, derramaram seu sangue. Seu rastro pode ser seguido. Intriga ter sobrevivido durante tantos anos. Pouquíssimos chegaram à terceira idade encarcerados.
MAIA, A. P. Assim na terra como embaixo da terra. Rio de Janeiro: Record, 2017.', 'A narrativa concentra sua força expressiva no manejo de recursos formais e numa representação ficcional que', '[{"letra": "A", "texto": "perpetuam visões do senso comum."}, {"letra": "B", "texto": "trazem à tona atitudes de um estado de exceção."}, {"letra": "C", "texto": "promovam a interlocução com grupos silenciados."}, {"letra": "D", "texto": "inspiram o sentimento de justiça por meio da empatia."}, {"letra": "E", "texto": "recorrem ao absurdo como forma de traduzir a realidade."}]', 'B', 'A narrativa de ficção concentra sua força na representação crua da violência sistêmica, retratando atitudes extremas típicas de um verdadeiro estado de exceção carcerário.', NULL, NULL, 'resumida', FALSE, FALSE, 'fe95eb3a039245278874a2461dbe58463a3e33f01888974685d40c3a4f20c28c', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Discurso intimidador e relações de poder', 2021, '1º dia', 'INEP', 25, '25', 'linguagens', 'medio', 'O senhor pensa que só porque o deixaram morar neste país pode logo ir fazendo o que quer? Nunca ouviu falar num troço chamado autoridades constituídas? Não sabe que tem de conhecer as leis do país? Não sabe que existe uma coisa chamada Exército Brasileiro, que o senhor tem de respeitar? Que negócio é esse? [...] Eu ensino o senhor a cumprir a lei, ali no duro: "dura lex"! Seus filhos são uns moleques e outra vez que eu souber que andaram incomodando o General, vai tudo em cana. Morou? Sei como tratar gringos feito o senhor. [...] Foi então que a mulher do vizinho do General interveio: Era tudo que o senhor tinha a dizer a meu marido? O delegado apenas olhou-a, espantado com o atrevimento. Pois então fique sabendo que eu também sei tratar tipos como o senhor. Meu marido não é gringo nem meus filhos são moleques. Se por acaso importunaram o General, ele que viesse falar comigo, pois o senhor também está nos importunando. E fique sabendo que sou brasileira, sou prima de um Major do Exército, sobrinha de um Coronel, e filha de um General! Morou? Estarrecido, o delegado só teve força para engolir em seco e balbuciar humildemente: - Da ativa, minha senhora?.
SABINO, F. A mulher do vizinho. In: Os melhores contos. Rio de Janeiro: Record, 1986.', 'A representação do discurso intimidador engendrada no fragmento é responsável por', '[{"letra": "A", "texto": "ironizar atitudes e ideias xenofóbicas."}, {"letra": "B", "texto": "conferir à narrativa um tom anedótico."}, {"letra": "C", "texto": "dissimular o ponto de vista do narrador."}, {"letra": "D", "texto": "acentuar a hostilidade das personagens."}, {"letra": "E", "texto": "exaltar relações de poder estereotipadas."}]', 'D', 'A representação do discurso intimidador e prepotente da autoridade — que rapidamente se desmancha — serve para acentuar a hostilidade comportamental das personagens.', NULL, NULL, 'resumida', FALSE, FALSE, '11319ba480d638e555eb16c76251aa7a31561dd21f6e3241146541d3449e0732', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Coesão textual e retomada de informações', 2021, '1º dia', 'INEP', 26, '26', 'linguagens', 'dificil', 'Os velhos papéis, quando não são consumidos pelo fogo, às vezes acordam de seu sono para contar notícias do passado.
É assim que se descobre algo novo de um nome antigo, sobre o qual já se julgava saber tudo, como Machado de Assis.
Por exemplo, você provavelmente não sabe que o autor carioca, morto em 1908, escreveu uma letra do hino nacional em 1867 - e não poderia saber mesmo, porque os versos seguiam inéditos. Até hoje.
Essa letra acaba de ser descoberta, em um jornal antigo de Florianópolis, pelo pesquisador independente Felipe Rissato.
"Das florestas em que habito/ Solto um canto varonil:/ Em honra e glória de Pedro/ O gigante do Brasil", diz o começo do hino, composto de sete estrofes em redondilhas maiores, ou seja, versos de sete sílabas poéticas. O trecho também é o refrão da música.
O Pedro mencionado é o imperador Dom Pedro II. O bruxo do Cosme Velho compôs a letra para o aniversário de 42 anos do monarca, em 2 de dezembro daquele ano - o hino seria apresentado naquele dia no teatro da cidade de Desterro, antigo nome de Florianópolis.
Disponível em: www.revistaprosaversoearte.com. Acesso em: 4 dez. 2018 (adaptado).', 'Considerando-se as operações de retomada de informações na estruturação do texto, há interdependência entre as expressões', '[{"letra": "A", "texto": "\"Os velhos papéis\" e \"É assim\"."}, {"letra": "B", "texto": "\"algo novo\" e \"sobre o qual\"."}, {"letra": "C", "texto": "\"um nome antigo\" e \"Por exemplo\"."}, {"letra": "D", "texto": "\"O gigante do Brasil\" e \"O Pedro mencionado\"."}, {"letra": "E", "texto": "\"o imperador Dom Pedro II\" e \"O bruxo do Cosme Velho\"."}]', 'D', 'Há interdependência coesiva direta e correta entre a designação "O gigante do Brasil" e a explicação subsequente "O Pedro mencionado".', NULL, NULL, 'resumida', FALSE, FALSE, '59c7a75dcebaafef60ed7f3283fce99f68a0fa6e3f8807c47f402deff310273d', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Estética brasiliense e mobiliário modernista', 2021, '1º dia', 'INEP', 27, '27', 'linguagens', 'medio', '[DESCRIÇÃO DA IMAGEM: Fotografia de cadeiras e poltronas modernistas desenhadas por Sérgio Rodrigues ao lado de uma parede com rascunhos de projeto.]
RODRIGUES, S. Acervo pessoal.
A revolução estética brasiliense empurrou os designers de móveis dos anos 1950 e início dos 1960 para o novo. Induzidos a abandonar o gosto rebuscado pelo colonial, a trocar Ouro Preto por Brasília, eles criaram um mobiliário contemporâneo que ainda hoje vemos nas lojas e nas salas de espera de consultórios e escritórios. Colada no uso de madeiras nobres, como o jacarandá e a peroba, e em materiais de revestimento como o couro e a palhinha, desenvolveu-se uma tendência feita de linhas retas e curvas suaves, nos moldes da capital no Cerrado.
CHAVES, D. Disponível em: www.veja.abril.com.br. Acesso em: 29 jul. 2010.', 'Na reportagem sobre os 50 anos de Brasília, de Débora Chaves, com a reprodução fotográfica de cadeiras e poltronas de Sérgio Rodrigues, verifica-se que os elementos da estética brasiliense', '[{"letra": "A", "texto": "aparecem definidos nas linhas retas dos objetos."}, {"letra": "B", "texto": "expressam o desenho rebuscado por meio das linhas."}, {"letra": "C", "texto": "mostram a expressão assimétrica das linhas curvas suaves."}, {"letra": "D", "texto": "apontam a unidade de matéria-prima utilizada em sua fabricação."}, {"letra": "E", "texto": "surgem na simplificação das informações visuais de cada composição."}]', 'A', 'A reportagem e o mobiliário modernista expõem que a estética brasiliense manifesta-se essencialmente na adoção de linhas retas, puras e funcionais.', 'Fotografia de cadeiras e poltronas modernistas desenhadas por Sérgio Rodrigues ao lado de uma parede com rascunhos de projeto.', NULL, 'resumida', FALSE, FALSE, '4b8062fd315677dce022296d76ed91fb86cbae69f1f97530a3d92de991350cb6', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Redes sociais e novos padrões de design', 2021, '1º dia', 'INEP', 28, '28', 'linguagens', 'medio', 'Thumbs Up
Ponto positivo para o Facebook, que vai dar uma ajeitada na casa para, quem sabe, não ser mais conhecido como o espaço da treta. Durante a F8, sua conferência anual, a empresa anunciou a maior mudança de design do serviço em 5 anos. Agora, o polêmico feed de notícias deixa de ser o protagonista, e o queridinho da rede social se torna o segmento de Grupos (é o Orkut fazendo escola?). Segundo Mark Zuckerberg, mais de 1 bilhão de usuários mensais entram nessa aba do aplicativo, e 400 mil deles já estão integrados em grupos de "assuntos significativos". O objetivo agora é aumentar o tráfego, oferecendo mais sugestões e ferramentas especiais para quem gerencia essas comunidades. Além disso, o Marketplace, que já tem mais de 800 milhões de usuários, vai ganhar mais atenção e integração. Com isso, parece que há um novo padrão se montando na rede social: sai o feed, entra a segmentação, que pode ser uma boa porta para monetização nos próximos anos. No mesmo evento, Zuckerberg também disse que o futuro do Facebook é a privacidade, mas não deu muitos detalhes de como vai proteger seus clientes daqui para frente. Evitar que vazamentos de dados dos usuários aconteçam é um bom começo.
#FicaaDica
Disponível em: https://thebrief.us16.list-manage.com. Acesso em: 3 maio 2019 (adaptado).', 'O texto relata que uma rede social virtual realizará sua maior mudança de design dos últimos anos. Esse fato revela que as tecnologias de informação e comunicação', '[{"letra": "A", "texto": "buscam oferecer mais privacidade."}, {"letra": "B", "texto": "assimilam os comportamentos dos usuários."}, {"letra": "C", "texto": "promovem maior interação em ambientes virtuais."}, {"letra": "D", "texto": "oferecem mais facilidades para obter cada vez mais lucro."}, {"letra": "E", "texto": "evoluem para ficar mais parecidas umas com as outras."}]', 'B', 'A alteração no design do Facebook priorizando grupos e interações sociais demonstra como as tecnologias assimilam dinamicamente os comportamentos dos usuários.', NULL, NULL, 'resumida', FALSE, FALSE, '8808c05c84beaa9efa120fee3e8ec26987104c37db23c070a3ca2821b44388ac', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Postura crítica frente à informação midiática', 2021, '1º dia', 'INEP', 29, '29', 'linguagens', 'medio', 'Reaprender a ler notícias
Não dá mais para ler um jornal, revista ou assistir a um telejornal da mesma forma que fazíamos até o surgimento da rede mundial de computadores. O Observatório da Imprensa antecipou isso lá nos idos de 1996 quando cunhou o slogan "Você nunca mais vai ler jornal do mesmo jeito". De fato, hoje já não basta mais ler o que está escrito ou falado para estar bem informado. É preciso conhecer as entrelinhas e saber que não há objetividade e nem isenção absolutas, porque cada ser humano vê o mundo de uma forma diferente. Ter um pé atrás passou a ser a regra básica número um de quem passa os olhos por uma primeira página, capa de revista ou chamadas de um noticiário na TV.
Há uma diferença importante entre desconfiar de tudo e procurar ver o maior número possível de lados de um mesmo fato, dado ou evento. Apenas desconfiar não resolve porque se trata de uma atitude passiva. É claro, tudo começa com a dúvida, mas a partir dela é necessário ser proativo, ou seja, investigar, estudar, procurar os elementos ocultos que sempre existem numa notícia. No começo é um esforço solitário que pode se tornar coletivo à medida que mais pessoas descobrem sua vulnerabilidade informativa.
Disponível em: www.observatoriodaimprensa.com.br. Acesso em: 30 set. 2015 (adaptado).', 'No texto, os argumentos apresentados permitem inferir que o objetivo do autor é convencer os leitores a', '[{"letra": "A", "texto": "buscarem fontes de informação comprometidas com a verdade."}, {"letra": "B", "texto": "privilegiarem notícias veiculadas em jornais de grande circulação."}, {"letra": "C", "texto": "adotarem uma postura crítica em relação às informações recebidas."}, {"letra": "D", "texto": "questionarem a prática jornalística anterior ao surgimento da internet."}, {"letra": "E", "texto": "valorizarem reportagens redigidas com imparcialidade diante dos fatos."}]', 'C', 'Os argumentos do autor visam conscientizar e convencer o leitor a abandonar a passividade e assumir uma postura investigativa e crítica perante as notícias.', NULL, NULL, 'resumida', FALSE, FALSE, '4455de9d839ab5284ef789c97775d63bd3dd1ee480d07760e1ba4da5d6aa894a', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Purismo linguístico e norma-padrão', 2021, '1º dia', 'INEP', 30, '30', 'linguagens', 'medio', 'Não que Pelino fosse químico, longe disso; mas era sábio, era gramático. Ninguém escrevia em Tubiacanga que não levasse bordoada do Capitão Pelino, e mesmo quando se falava em algum homem notável lá no Rio, ele não deixava de dizer: "Não há dúvida! O homem tem talento, mas escreve: ''um outro'', ''de resto''..." E contraía os lábios como se tivesse engolido alguma cousa amarga.
Toda a vila de Tubiacanga acostumou-se a respeitar o solene Pelino, que corrigia e emendava as maiores glórias nacionais. Um sábio...
Ao entardecer, depois de ler um pouco o Sotero, o Candido de Figueiredo ou o Castro Lopes, e de ter passado mais uma vez a tintura nos cabelos, o velho mestre-escola saía vagarosamente de casa, muito abotoado no seu paletó de brim mineiro, e encaminhava-se para a botica do Bastos a dar dous dedos de prosa. Conversar é um modo de dizer, porque era Pelino avaro de palavras, limitando-se tão-somente a ouvir. Quando, porém, dos lábios de alguém escapava a menor incorreção de linguagem, intervinha e emendava. "Eu asseguro, dizia o agente do Correio, que..." Por aí, o mestre-escola intervinha com mansuetude evangélica: "Não diga ''asseguro'', Senhor Bernardes; em português é garanto".
E a conversa continuava depois da emenda, para ser de novo interrompida por uma outra. Por essas e outras, houve muitos palestradores que se afastaram, mas Pelino, indiferente, seguro dos seus deveres, continuava o seu apostolado de vernaculismo.
BARRETO, L. A Nova Califórnia. Disponível em: www.dominiopublico.gov.br. Acesso em: 24 jul. 2019.', 'Do ponto de vista linguístico, a defesa da norma-padrão pelo personagem caracteriza-se por', '[{"letra": "A", "texto": "contestar o ensino de regras em detrimento do conteúdo das informações."}, {"letra": "B", "texto": "resgatar valores patrióticos relacionados às tradições da língua portuguesa."}, {"letra": "C", "texto": "adotar uma perspectiva complacente em relação aos desvios gramaticais."}, {"letra": "D", "texto": "invalidar os usos da língua pautados pelos preceitos da gramática normativa."}, {"letra": "E", "texto": "desconsiderar diferentes níveis de formalidade nas situações de comunicação."}]', 'E', 'O purismo radical do personagem Pelino evidencia uma postura linguística que desconsidera a variação diafásica e os diferentes níveis de formalidade na comunicação.', NULL, NULL, 'resumida', FALSE, FALSE, '57f383d33991ec67abbf23d9bd31386ad47d353a7db24870e48f330cdb0ec11c', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Democratização do esporte e inovações técnicas', 2021, '1º dia', 'INEP', 31, '31', 'linguagens', 'medio', 'O skate apareceu como forma de vivência no lazer em períodos de baixa nas ondas e ficou conhecido como "surfinho". No início foram utilizados eixos e rodinhas de patins pregados numa madeira qualquer, para sua composição, sendo as rodas de borracha ou ferro.
O grande marco na história do skate ocorreu em 1974, quando o engenheiro químico chamado Frank Nasworthy descobriu o uretano, material mais flexível, que oferecia mais aderência às rodas. A dependência dos skatistas em relação a esse novo material igualmente alavancou o surgimento de novas manobras e possibilitou a um maior número de pessoas inexperientes começar a prática dessa modalidade. O resultado foi a criação de campeonatos, marcas, fábricas e lojas especializadas.
ARMBRUST, I.; LAURO, F. A. A. O skate e suas possibilidades educacionais. Motriz, jul.-set. 2010 (adaptado).', 'De acordo com o texto, diversos fatores ao longo do tempo contribuíram para a democratização do skate.', '[{"letra": "A", "texto": "evidenciaram as demandas comerciais dos skatistas."}, {"letra": "B", "texto": "definiram a carreira de skatista profissional."}, {"letra": "C", "texto": "permitiram que a prática social do skate substituísse o surfe."}, {"letra": "D", "texto": "indicaram a autonomia dos praticantes de skate."}, {"letra": "E", "texto": "(Falta alternativa E no texto original ou tratava-se de questão objetiva padrão ENEM - completando com base no PDF)."}]', 'A', 'O desenvolvimento de materiais flexíveis como o uretano atendeu diretamente às demandas mercadológicas, comerciais e técnicas dos praticantes de skate.', NULL, NULL, 'resumida', FALSE, FALSE, '429f1ce10c38ae1fc6e16f514f5d5d1d4b0fa512711f035b74ac0461a5f0648c', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Função emotiva e subjetividade na crônica', 2021, '1º dia', 'INEP', 32, '32', 'linguagens', 'medio', 'Rio de Janeiro
Estojo escolar
Noite dessas, ciscando num desses canais a cabo, vi uns caras oferecendo maravilhas eletrônicas, bastava telefonar e eu receberia um notebook capaz de me ajudar a fabricar um navio, uma estação espacial.
[...] Como pretendo viajar esses dias, habilitei-me a comprar aquilo que os caras anunciavam como o top do top em matéria de computador portátil.
No sábado, recebi um embrulho complicado que necessitava de um manual de instruções para ser aberto.
[...] De repente, como vem acontecendo nos últimos tempos, houve um corte na memória e vi diante de mim o meu primeiro estojo escolar. Tinha 5 anos e ia para o jardim de infância.
Era uma caixinha comprida, envernizada, com uma tampa que corria nas bordas do corpo principal. Dentro, arrumados em divisões, havia lápis coloridos, um apontador, uma lapiseira cromada, uma régua de 20 cm e uma borracha para apagar meus erros.
[...] Da caixinha vinha um cheiro gostoso, cheiro que nunca esqueci e que me tonteava de prazer. [...]
O notebook que agora abro é negro e, em matéria de cheiro, é abominável. Cheira vilmente a telefone celular, a cabine de avião, a aparelho de ultrassonografia onde outro dia uma moça veio ver como sou por dentro. Acho que piorei de estojo e de vida.
CONY, C. H. Crônicas para ler na escola. São Paulo: Objetiva, 2009 (adaptado).', 'No texto, há marcas da função da linguagem que nele predomina. Essas marcas são responsáveis por colocar em foco o(a)', '[{"letra": "A", "texto": "mensagem, elevando-a à categoria de objeto estético do mundo das artes."}, {"letra": "B", "texto": "código, transformando a linguagem utilizada no texto na própria temática abordada."}, {"letra": "C", "texto": "contexto, fazendo das informações presentes no texto seu aspecto essencial."}, {"letra": "D", "texto": "enunciador, buscando expressar sua atitude em relação ao conteúdo do enunciado."}, {"letra": "E", "texto": "interlocutor, considerando-o responsável pelo direcionamento dado à narrativa pelo enunciador."}]', 'D', 'As marcas textuais da crônica evidenciam a predominância da função emotiva ou expressiva, focada na transmissão da subjetividade e atitude do enunciador.', NULL, NULL, 'resumida', TRUE, FALSE, '918423e8741f84d3341942a62001c3acad0159357eb28276d7383629096cb21e', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Estrutura de prefácio em quadrinhos', 2021, '1º dia', 'INEP', 33, '33', 'linguagens', 'medio', '[DESCRIÇÃO DA IMAGEM: Histórias em quadrinhos em várias vinhetas ilustrando etapas de produção de um livro: pesquisa, seleção de informações, roteiro, desenho a tinta, edição digital, colorização e finalização com duas pessoas lendo.]
LEMOS, A. Artistas brasileiras. Belo Horizonte: Miguilim, 2018.', 'O que assegura o reconhecimento desse texto em quadrinhos como prefácio é o(a)', '[{"letra": "A", "texto": "função de apresentação do livro."}, {"letra": "B", "texto": "apelo emocional apoiado nas imagens."}, {"letra": "C", "texto": "descrição do processo criativo da autora."}, {"letra": "D", "texto": "referência à mescla dos trabalhos manual e digital."}, {"letra": "E", "texto": "uso de elementos gráficos voltados para o público-alvo."}]', 'A', 'O texto em quadrinhos cumpre exatamente a função estrutural de prefácio ao detalhar visual e textualmente as etapas de elaboração e produção do livro.', 'Histórias em quadrinhos em várias vinhetas ilustrando etapas de produção de um livro: pesquisa, seleção de informações, roteiro, desenho a tinta, edição digital, colorização e finalização com duas pessoas lendo.', NULL, 'resumida', TRUE, FALSE, 'df70b2406819a3027b0650e6358675678e60d20c4b9bfa8659319e3f9395cb14', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Infografia e impactos do uso de celulares', 2021, '1º dia', 'INEP', 34, '34', 'linguagens', 'facil', '[DESCRIÇÃO DA IMAGEM: Infográfico intitulado "Os riscos para crianças do uso do celular antes de dormir", mostrando os hormônios afetados (melatonina, leptina, cortisol) e orientações sobre o que fazer.]
Disponível em: https://g1.globo.com. Acesso em: 18 jun. 2019 (adaptado).', 'No texto, os recursos verbais e não verbais empregados têm por objetivo', '[{"letra": "A", "texto": "divulgar informações científicas sobre o uso indiscriminado de aparelhos celulares."}, {"letra": "B", "texto": "influenciar o leitor a mudar atitudes e hábitos considerados prejudiciais às crianças."}, {"letra": "C", "texto": "relacionar o uso da tecnologia aos efeitos decorrentes da falta de exercícios físicos."}, {"letra": "D", "texto": "indicar medidas eficazes para desestimular a utilização de telefones pelo público infantil."}, {"letra": "E", "texto": "sugerir aos pais e responsáveis a substituição de dispositivos móveis por atividades lúdicas."}]', 'B', 'O infográfico utiliza recursos verbais e visuais para conscientizar e influenciar leitores a modificarem hábitos prejudiciais ligados ao uso de telas antes de dormir.', 'Infográfico intitulado "Os riscos para crianças do uso do celular antes de dormir", mostrando os hormônios afetados (melatonina, leptina, cortisol) e orientações sobre o que fazer.', NULL, 'resumida', FALSE, FALSE, '5bbb4271161fdf1937f7e0a61dcb0d73232f491f40a3ca30bcac340a3c13a1be', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Condição feminina no século XIX', 2021, '1º dia', 'INEP', 35, '35', 'linguagens', 'dificil', 'Singular ocorrência
Há ocorrências bem singulares. Está vendo aquela dama que vai entrando na igreja da Cruz? Parou agora no adro para dar uma esmola.
De preto?
Justamente; lá vai entrando; entrou.
Não ponha mais na carta. Esse olhar está dizendo que a dama é uma recordação de outro tempo, e não há de ser muito tempo, a julgar pelo corpo: é moça de truz.
Deve ter quarenta e seis anos.
Ah! conservada. Vamos lá; deixe de olhar para o chão e conte-me tudo. Está viúva, naturalmente?
Não.
Bem; o marido ainda vive. É velho?
Não é casada.
Solteira?
Assim, assim. Deve chamar-se hoje D. Maria de tal. Em 1860 florescia com o nome familiar de Marocas. Não era costureira, nem proprietária, nem mestra de meninas; vá excluindo as profissões e chegará lá. Morava na Rua do Sacramento. Já então era esbelta, e, seguramente, mais linda do que hoje; modos sérios, linguagem limpa.
ASSIS, M. Machado de Assis: seus 30 melhores contos. Rio de Janeiro: Aguilar, 1961.', 'No diálogo, descortinam-se aspectos da condição da mulher em meados do século XIX. O ponto de vista dos personagens manifesta conceitos segundo os quais a mulher', '[{"letra": "A", "texto": "encontra um modo de dignificar-se na prática da caridade."}, {"letra": "B", "texto": "preserva a aparência jovem conforme seu estilo de vida."}, {"letra": "C", "texto": "condiciona seu bem-estar à estabilidade do casamento."}, {"letra": "D", "texto": "tem sua identidade e seu lugar referendados pelo homem."}, {"letra": "E", "texto": "renuncia à sua participação no mercado de trabalho."}]', 'D', 'O diálogo machadiano retrata uma sociedade decimonónica em que o status, a posição social e a identidade da mulher eram definidos em função do homem.', NULL, NULL, 'resumida', TRUE, FALSE, '55f634949743a95c5b7f46b87ea599c089e1fb05ef58b32604e3a5935ac5e5c0', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Reposicionamento estético e reciclagem artística', 2021, '1º dia', 'INEP', 36, '36', 'linguagens', 'medio', 'TEXTO I
[DESCRIÇÃO DA IMAGEM: Fotografia de máscara artística criada por Romuald Hazoumé ("Nanawax") utilizando galões plásticos descartados e pedaços de tecido.]
HAZOUMÉ, R. Nanawax. Plástico e tecido. Galerie Gagosian, 2009. Disponível em: www.actuart.org. Acesso em: 19 jun. 2019.
TEXTO II
As máscaras não foram feitas para serem usadas; elas se concentram apenas nas possibilidades antropomórficas dos recipientes plásticos descartados e, ao mesmo tempo, chamam a atenção para a quantidade de lixo que se acumula em quase todas as cidades ou aldeias africanas.
FARTHING, S. Tudo sobre arte. Rio de Janeiro: Sextante, 2011 (adaptado).', 'Romuald Hazoumé costuma dizer que sua obra apenas manda de volta ao oeste o refugo de uma sociedade de consumo cada vez mais invasiva. A obra desse artista africano que vive no Benin denota o(a)', '[{"letra": "A", "texto": "empobrecimento do valor artístico pela combinação de diferentes matérias-primas."}, {"letra": "B", "texto": "reposicionamento estético de objetos por meio da mudança de função."}, {"letra": "C", "texto": "convite aos espectadores para interagir e completar obras inacabadas."}, {"letra": "D", "texto": "militância com temas da ecologia que marcam o continente africano."}, {"letra": "E", "texto": "realidade precária de suas condições de produção artística."}]', 'B', 'A transformação de recipientes plásticos descartados em máscaras de forte apelo estético traduz o reposicionamento criativo de objetos pela mudança de função.', 'Fotografia de máscara artística criada por Romuald Hazoumé ("Nanawax") utilizando galões plásticos descartados e pedaços de tecido.', NULL, 'resumida', TRUE, FALSE, 'def59c7aa46c70f8fdfb4652683581786f095f1bbf3965c5800edbcf41970bdc', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Ironia e conformismo social', 2021, '1º dia', 'INEP', 37, '37', 'linguagens', 'medio', 'Comportamento geral
Você deve estampar sempre um ar de alegria
E dizer: tudo tem melhorado
Você deve rezar pelo bem do patrão
E esquecer que está desempregado
Você merece
Você merece
Tudo vai bem, tudo legal
Cerveja, samba, e amanhã, seu Zé
Se acabarem com teu carnaval
Você deve aprender a baixar a cabeça
E dizer sempre: muito obrigado
São palavras que ainda te deixam dizer
Por ser homem bem disciplinado
Deve pois só fazer pelo bem da nação
Tudo aquilo que for ordenado
Pra ganhar um fuscão no juízo final
E diploma de bem-comportado
GONZAGUINHA. Luiz Gonzaga Jr. Rio de Janeiro: Odeon, 1973 (fragmento).', 'Pela análise do tema e dos procedimentos argumentativos utilizados na letra da canção composta por Gonzaguinha na década de 1970, infere-se o objetivo de', '[{"letra": "A", "texto": "ironizar a incorporação de ideias e atitudes conformistas."}, {"letra": "B", "texto": "convencer o público sobre a importância dos deveres cívicos."}, {"letra": "C", "texto": "relacionar o discurso religioso à resolução de problemas sociais."}, {"letra": "D", "texto": "questionar o valor atribuído pela população às festas populares."}, {"letra": "E", "texto": "defender uma postura coletiva indiferente aos valores dominantes."}]', 'A', 'A letra da canção de Gonzaguinha emprega fina ironia para denunciar e criticar o conformismo, a submissão e a passividade exigidas pelo sistema autoritário.', NULL, NULL, 'resumida', FALSE, FALSE, '5d77c49a97c1b8f6a99a0a68920c287cdfe0a8f181cc7f3b8bf53f7e63a63093', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Lirismo e angústia da distância amorosa', 2021, '1º dia', 'INEP', 38, '38', 'linguagens', 'medio', 'Se for possível, manda-me dizer:
É lua cheia. A casa está vazia
Manda-me dizer, e o paraíso
Há de ficar mais perto, e mais recente
Me há de parecer teu rosto incerto.
Manda-me buscar se tens o dia
Tão longo como a noite. Se é verdade
Quão sem mim só vês monotonia.
E se te lembras do brilho das marés
De alguns peixes rosados
Numas águas
E dos meus pés molhados, manda-me dizer:
É lua nova
E revestida de luz te volto a ver.
HILST, H. Júbilo, memória, noviciado da paixão. São Paulo: Cia. das Letras, 2018.', 'Falando ao outro, o eu lírico revela-se vocalizando um desejo que remete ao', '[{"letra": "A", "texto": "ascetismo quanto à possibilidade do reencontro."}, {"letra": "B", "texto": "tédio provocado pela distância física do ser amado."}, {"letra": "C", "texto": "sonho de autorrealização desenhado pela memória."}, {"letra": "D", "texto": "julgamento implícito das atitudes de quem se afasta."}, {"letra": "E", "texto": "questionamento sobre o significado do amor ausente."}]', 'E', 'O eu lírico vocaliza na poesia um profundo anseio permeado pelo questionamento acerca da ausência física e do significado do amor distante.', NULL, NULL, 'resumida', FALSE, FALSE, 'd8313829dfb75af9de572c4b3bfeb6f908a967e0597ccf22e977b270878acb7e', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Marcas informais e variações na letra de samba', 2021, '1º dia', 'INEP', 39, '39', 'linguagens', 'facil', 'Falso moralista
Você condena o que a moçada anda fazendo
e não aceita o teatro de revista
arte moderna pra você não vale nada
e até vedete você diz não ser artista
Você se julga um tanto bom e até perfeito
Por qualquer coisa deita logo falação
Mas eu conheço bem o seu defeito
e não vou fazer segredo não
Você é visto toda sexta no Joá
e não é só no Carnaval que vai pros bailes se acabar
Fim de semana você deixa a companheira
e no bar com os amigos bebe bem a noite inteira
Segunda-feira chega na repartição
pede dispensa para ir ao oculista
e vai curar sua ressaca simplesmente
Você não passa de um falso moralista
NELSON SARGENTO. Sonho de um sambista. São Paulo: Eldorado, 1979.', 'As letras de samba normalmente se caracterizam por apresentarem marcas informais do uso da língua. Nessa letra de Nelson Sargento, são exemplos dessas marcas', '[{"letra": "A", "texto": "\"falação\" e \"pros bailes\"."}, {"letra": "B", "texto": "\"você\" e \"teatro de revista\"."}, {"letra": "C", "texto": "\"perfeito\" e \"Carnaval\"."}, {"letra": "D", "texto": "\"bebe bem\" e \"oculista\"."}, {"letra": "E", "texto": "\"curar\" e \"falso moralista\"."}]', 'A', 'A presença de marcas informais e coloquiais na letra de samba manifesta-se claramente em termos como "falação" e "pros".', NULL, NULL, 'resumida', FALSE, FALSE, '447e8b189fdbbd2cdb8faaa4aafcd3871439670b99feb009409828bf33c3f5f1', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Sinestesia e expressão poética das cores', 2021, '1º dia', 'INEP', 40, '40', 'linguagens', 'dificil', 'Introdução a Alda
O pavão vermelho
Ora, a alegria, este pavão vermelho,
está morando em meu quintal agora.
Vem pousar como um sol em meu joelho
quando é estridente em meu quintal a aurora.
Clarim de lacre, este pavão vermelho
sobrepuja os pavões que estão lá fora.
É uma festa de púrpura. E o assemelho
a uma chama do lábaro da aurora.
É o próprio doge a se mirar no espelho.
E a cor vermelha chega a ser sonora
neste pavão pomposo e de chavelho.
Pavões lilases possuí outrora.
Depois que amei este pavão vermelho,
os meus outros pavões foram-se embora.
COSTA, S. Poesia completa: Sosigenes Costa. Salvador: Conselho Estadual de Cultura, 2001.', 'Na construção do soneto, as cores representam um recurso poético que configura uma imagem com a qual o eu lírico', '[{"letra": "A", "texto": "revela a intenção de isolar-se em seu espaço."}, {"letra": "B", "texto": "simboliza a beleza e o esplendor da natureza."}, {"letra": "C", "texto": "experimenta a fusão de percepções sensoriais."}, {"letra": "D", "texto": "metaforiza a conquista de sua plena realização."}, {"letra": "E", "texto": "expressa uma visão de mundo mística e espiritualizada."}]', 'C', 'A construção poética explora o recurso da sinestesia ao associar percepções visuais (cores) a sensações auditivas ("vermelha chega a ser sonora").', NULL, NULL, 'resumida', FALSE, FALSE, 'b09fb6f7e66e6fccc238b3506f8b559be75fd3876b019727b2c0467d35bd9ce6', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Imersão lírica e saúde mental', 2021, '1º dia', 'INEP', 41, '41', 'linguagens', 'medio', 'Dizem que ninguém mais a ama. Dizem que foi uma boa pessoa. Sua filha de doze anos não a visita nunca e talvez raramente se lembre dela. Puseram-na numa cidade triste de uniformes azuis e jalecos brancos, de onde não pôde mais sair. Lá, todos gritam-lhe irritados, mal se aproxima, ou lhe batem, como se faz com sacos de areia para treinar os músculos.
Sei que para todos ela já não é, e ninguém lhe daria uma maçã cheirosa, bem vermelha. Mas não é verdade que alguém não a possa mais amar. Eu amo-a. Amo-a quando a vejo por trás das grades de um palácio, onde se refugiou princesa, chegada pelos caminhos da dor. Quando fora do reino sente o mundo de mil lanças, e selvagem prepara-se, posta no olhar. Amo-a quando criança brinca na areia sem medo. Uns pés descalços, uma mulher sem intenções. Cercada de mundo, às vezes sofrendo-o ainda.
CANÇADO, M. L. O sofredor do ver. Belo Horizonte: Autêntica, 2015.', 'Ao descrever uma mulher internada em um hospital psiquiátrico, o narrador compõe um quadro que expressa sua percepção', '[{"letra": "A", "texto": "irônica quanto aos efeitos do abandono familiar."}, {"letra": "B", "texto": "resignada em face dos métodos terapêuticos em vigor."}, {"letra": "C", "texto": "alimentada pela imersão lírica no espaço da segregação."}, {"letra": "D", "texto": "inspirada pelo universo pouco conhecido da mente humana."}, {"letra": "E", "texto": "demarcada por uma linguagem alinhada à busca da lucidez."}]', 'C', 'O narrador descreve a situação de isolamento psiquiátrico nutrindo sua narrativa com uma intensa imersão lírica e afetiva no interior da segregação.', NULL, NULL, 'resumida', FALSE, FALSE, 'a4b1dcfd7e3c237549021f3b091eb6190b9c87dd3b814c319537f324b8f6e3ea', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Pop Art e erotização do corpo feminino', 2021, '1º dia', 'INEP', 42, '42', 'linguagens', 'medio', '[DESCRIÇÃO DA IMAGEM: Reprodução da obra "Garota com bola" (Girl with Ball, 1961) de Roy Lichtenstein, pintura pop art em estilo de história em quadrinhos mostrando uma mulher erguendo uma bola de praia.]
LICHTENSTEIN, R. Garota com bola. Óleo sobre tela, 153 cm x 91,9 cm. Museu de Arte Moderna de Nova York, 1961. Disponível em: www.moma.org. Acesso em: 4 dez. 2018.', 'A obra, da década de 1960, pertencente ao movimento artístico Pop Art, explora a beleza e a sensualidade do corpo feminino em uma situação de divertimento. Historicamente, a sociedade inventou e continua reinventando o corpo como objeto de intervenções sociais, buscando atender aos valores e costumes de cada época. Na reprodução desses preceitos, a erotização do corpo feminino tem sido constituída pela', '[{"letra": "A", "texto": "realização de exercícios físicos sistemáticos e excessivos."}, {"letra": "B", "texto": "utilização de medicamentos e produtos estéticos."}, {"letra": "C", "texto": "educação do gesto, da vontade e do comportamento."}, {"letra": "D", "texto": "construção de espaços para vivência de práticas corporais."}, {"letra": "E", "texto": "promoção de novas experiências de movimento humano no lazer."}]', 'C', 'A obra reflete a crítica histórica de que a erotização e a construção social do corpo feminino atendem aos padrões culturais impostos pela educação do gesto e do comportamento.', 'Reprodução da obra "Garota com bola" (Girl with Ball, 1961) de Roy Lichtenstein, pintura pop art em estilo de história em quadrinhos mostrando uma mulher erguendo uma bola de praia.', NULL, 'resumida', FALSE, FALSE, '1e5b39bccbe9fb977b5bfb8de4cafd1f9135a21e619ec892d1c972e5186af7e0', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Violência colonial e resistência afetiva', 2021, '1º dia', 'INEP', 43, '43', 'linguagens', 'dificil', '[DESCRIÇÃO DA IMAGEM: Sequência de quadrinhos em preto e branco do livro "Cumbe" de Marcelo D''Salete, retratando personagens negros em cenário colonial, com cenas de fuga, castigos físicos e cicatrizes nas costas.]
D''SALETE, M. Cumbe. São Paulo: Veneta, 2018, p. 10-11 (adaptado).', 'A sequência dos quadrinhos conjuga lirismo e violência ao', '[{"letra": "A", "texto": "sugerir a impossibilidade de manutenção dos afetos."}, {"letra": "B", "texto": "revelar os corpos marcados pela brutalidade colonial."}, {"letra": "C", "texto": "representar o abatimento diante da desumanidade vivida."}, {"letra": "D", "texto": "acentuar a resistência identitária dos povos escravizados."}, {"letra": "E", "texto": "expor os sujeitos alijados de sua ancestralidade pelo exílio."}]', 'B', 'Os quadrinhos combinam sensibilidade poética e crueza gráfica para expor os corpos marcados pelas marcas físicas da brutalidade do sistema escravista.', 'Sequência de quadrinhos em preto e branco do livro "Cumbe" de Marcelo D''Salete, retratando personagens negros em cenário colonial, com cenas de fuga, castigos físicos e cicatrizes nas costas.', NULL, 'resumida', FALSE, FALSE, 'eefa777cc8ed4c01d6e5ccd5c07b8fa8beffde4a71f52f0117c07ccd19579eff', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Divisão de informações sem imprensa e credulidade', 2021, '1º dia', 'INEP', 44, '44', 'linguagens', 'medio', 'Naquele tempo, Itaguaí, que, como as demais vilas, arraiais e povoações da colônia, não dispunha de imprensa, tinha dois modos de divulgar uma notícia; ou por meio de cartazes manuscritos e pregados na porta da Câmara, e da matriz; ou por meio de matraca.
Eis em que consistia este segundo uso. Contratava-se um homem, por um ou mais dias, para andar as ruas do povoado, com uma matraca na mão. De quando em quando tocava a matraca, reunia-se gente, e ele anunciava o que lhe incumbiam, um remédio para sezões, umas terras lavradias, um soneto, um donativo eclesiástico, a melhor tesoura da vila, o mais belo discurso do ano, etc.
O sistema tinha inconvenientes para a paz pública; mas era conservado pela grande energia de divulgação que possuía. Por exemplo, um dos vereadores desfrutava a reputação de perfeito educador de cobras e macacos, e aliás nunca domesticara um só desses bichos; mas tinha o cuidado de fazer trabalhar a matraca todos os meses. E dizem as crônicas que algumas pessoas afirmavam ter visto cascavéis dançando no peito do vereador; afirmação perfeitamente falsa, mas só devida à absoluta confiança no sistema. Verdade, verdade, nem todas as instituições do antigo regimen mereciam o desprezo do nosso século.
ASSIS, M. O alienista. Disponível em: www.dominiopublico.gov.br. Acesso em: 2 jun. 2019 (adaptado).', 'O fragmento faz uma referência irônica a formas de divulgação e circulação de informações em uma localidade sem imprensa. Ao destacar a confiança da população no sistema da matraca, o narrador associa esse recurso à disseminação de', '[{"letra": "A", "texto": "campanhas políticas."}, {"letra": "B", "texto": "anúncios publicitários."}, {"letra": "C", "texto": "notícias de apelo popular."}, {"letra": "D", "texto": "informações não fidedignas."}, {"letra": "E", "texto": "serviços de utilidade pública."}]', 'D', 'O narrador ironiza o sistema de circulação de notícias locais ao destacar a extrema credulidade da população em boatos e informações falsas.', NULL, NULL, 'resumida', FALSE, FALSE, '9b1e108f3ad400a9af7a6837278d5b1920794b85a4025a78dadbfd976b7e320e', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Português', 'Relevância estética e histórica do choro brasileiro', 2021, '1º dia', 'INEP', 45, '45', 'linguagens', 'medio', 'No ano em que o maior clarinetista que o Brasil conheceu, Abel Ferreira, faria 100 anos, o choro dá mostras de vivacidade. É quase um paradoxo que essa riquíssima manifestação da genuína alma brasileira seja forte o suficiente para driblar a falta de incentivos oficiais, a insensibilidade dos meios de comunicação e a amnésia generalizada. "Ele trazia a alma brasileira derramada em sua sonoridade ímpar." Artur da Távola, seguramente seu maior admirador, foi quem melhor o definiu: "alma sertaneja, toque mozarteano". O acervo do músico autodidata nascido na mineira Coromandel, autor de 50 músicas, entre as quais Chorando baixinho (1942), que o consagrou, amigo e parceiro de Pixinguinha, com quem gravou Ingênuo (1958), permanece com os herdeiros à espera de compilação adequada. O Museu da Imagem e do Som do Rio de Janeiro tem a guarda do sax e do clarinete, doados em 1995.
Na avaliação de Leonor Bianchi, editora da Revista do Choro, "a música instrumental fica apartada do que é popular porque não vai à sala de concerto. O público em geral tem interesse em samba, pagode e axé". Ela atribui essa situação à falta de conhecimento e à pouca divulgação do gênero nas escolas.
FERRAZ, A. Disponível em: www.cartacapital.com.br. Acesso em: 22 abr. 2015 (adaptado).', 'Considerando-se o contexto, o gênero e o público-alvo, os argumentos trazidos pela autora do texto buscam', '[{"letra": "A", "texto": "atribuir o desconhecimento da obra de Abel Ferreira ao ensino de música nas escolas."}, {"letra": "B", "texto": "reivindicar mais investimentos estatais para a preservação do acervo musical nacional."}, {"letra": "C", "texto": "destacar a relevância histórica e a riqueza estética do choro no cenário musical brasileiro."}, {"letra": "D", "texto": "apresentar ao leitor dados biográficos pouco conhecidos sobre a trajetória de Abel Ferreira."}, {"letra": "E", "texto": "constatar a impopularidade do choro diante da preferência do público por músicas populares."}]', 'C', 'Os argumentos da autora articulam-se para valorizar a imensa riqueza estética, a importância histórica e o legado cultural do choro no cenário musical brasileiro.', NULL, NULL, 'resumida', FALSE, FALSE, '80be6ac7ff64a60fa5dd0fed6315a5e9749a76bad5c4a0102f3c868a92b8828f', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Relações de trabalho e saúde pós-expediente', 2021, '1º dia', 'INEP', 46, '46', NULL, 'facil', 'Seu turno de trabalho acabou, você já está em casa e é hora do jantar da família. Mas, em vez de relaxar, você começa a pensar na possibilidade de ter recebido alguma mensagem importante no e-mail profissional ou no grupo de WhatsApp da empresa. Imediatamente, você fica distante. Momentos depois, com alguns toques na tela do celular, você está de volta ao ambiente de trabalho. O jantar e a família ficaram em segundo plano.
A simples vontade de checar mensagens do trabalho pós-expediente prejudica sua saúde e a de sua família. Disponível em: www.bbc.com. Acesso em: 4 dez. 2018.', 'O texto indica práticas nas relações cotidianas do trabalho que causam para o indivíduo a', '[{"letra": "A", "texto": "proteção da vida privada."}, {"letra": "B", "texto": "ampliação de atividades extras."}, {"letra": "C", "texto": "elevação de etapas burocráticas."}, {"letra": "D", "texto": "diversificação do lazer recreativo."}, {"letra": "E", "texto": "desobrigação de afazeres domésticos."}]', 'B', 'O hábito de monitorar mensagens profissionais fora do horário de expediente estende as obrigações para o descanso, gerando ampliação de atividades extras e estresse.', NULL, NULL, 'resumida', FALSE, FALSE, 'd3025143bc3dabe227de6798cfa0359dfd46cd66ac38806958ffef6c7c094861', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Acumulação de riqueza e ideologia do mérito', 2021, '1º dia', 'INEP', 47, '47', NULL, 'dificil', 'Quando a taxa de remuneração do capital excede substancialmente a taxa de crescimento da economia, pela lógica, a riqueza herdada aumenta mais rápido do que a renda e a produção. Então, basta aos herdeiros poupar uma parte limitada da renda de seu capital para que ele cresça mais rápido do que a economia como um todo. Sob essas condições, é quase inevitável que a riqueza herdada supere a riqueza constituída durante uma vida de trabalho, e que a concentração do capital atinja níveis muito altos.
PIKETTY, T. O capital no século XXI. Rio de Janeiro: Intrínseca, 2014 (adaptado).', 'Considerando os princípios que legitimam as democracias liberais, a lógica econômica descrita no texto enfraquece o(a)', '[{"letra": "A", "texto": "ideologia do mérito."}, {"letra": "B", "texto": "direito de nascimento."}, {"letra": "C", "texto": "eficácia da legislação."}, {"letra": "D", "texto": "ganho das financeiras."}, {"letra": "E", "texto": "eficiência dos mercados."}]', 'A', 'A constatação de que a riqueza herdada cresce mais do que o trabalho produtivo desestabiliza diretamente os fundamentos da ideologia do mérito nas democracias liberais.', NULL, NULL, 'resumida', FALSE, FALSE, '8bdf59a46d627c1beb5b09368efe8e25a9e72a308438ee80f3feaa90bba2817f', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Melhoramento genético e adaptação ambiental', 2021, '1º dia', 'INEP', 48, '48', NULL, 'medio', 'Atualmente, o Programa de Melhoramento "Uvas do Brasil" utiliza métodos clássicos de melhoramento, como seleção massal, seleção clonal e hibridações. Ações de ajuste de manejo de seleções avançadas vêm sendo desenvolvidas paralelamente ao Programa de Melhoramento, no sentido de viabilização desses materiais. Ao longo dos seus 40 anos, uma grande equipe técnica trabalhou para executar projetos de pesquisa para atender às necessidades e às demandas de diferentes atores da vitivinicultura nacional, incluindo produtores de uvas de mesa para exportação do semiárido nordestino, viticultores interessados em produzir sucos em regiões tropicais ou pequenos produtores familiares da região da Serra Gaúcha, interessados em melhorar a qualidade do vinho artesanal que produzem.
Programa de Melhoramento Genético "Uvas do Brasil". Disponível em: www.embrapa.br. Acesso em: 24 nov. 2018 (adaptado).', 'Para melhorar a produção agrícola nas regiões mencionadas, as técnicas referidas no texto buscaram adaptar o cultivo aos(às)', '[{"letra": "A", "texto": "espécies nativas ameaçadas."}, {"letra": "B", "texto": "cadeias econômicas autônomas."}, {"letra": "C", "texto": "estruturas fundiárias tradicionais."}, {"letra": "D", "texto": "elementos ambientais singulares."}, {"letra": "E", "texto": "mercados consumidores internos."}]', 'D', 'As técnicas de melhoramento genético agrícola buscam ajustar o cultivo às particularidades e aos elementos ambientais singulares de cada região produtora.', NULL, NULL, 'resumida', FALSE, FALSE, 'f1b41a288968a5b9e4a48f4609606df1af2524160bb8b90b99b67177df9b82cb', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Políticas de conservação de bens culturais', 2021, '1º dia', 'INEP', 49, '49', NULL, 'dificil', 'TEXTO I
Portadoras de mensagem espiritual do passado, as obras monumentais de cada povo perduram no presente como o testemunho vivo de suas tradições seculares. A humanidade, cada vez mais consciente da unidade dos valores humanos, as considera um bem comum e, perante as gerações futuras, se reconhece solidariamente responsável por preservá-las, impondo a si mesma o dever de transmiti-las na plenitude de sua autenticidade.
Carta de Veneza, 31 de maio de 1964. Disponível em: www.iphan.gov.br. Acesso em: 7 out. 2019.
TEXTO II
Os sistemas tradicionais de proteção se mostram cada vez menos eficientes diante do processo acelerado de urbanização e transformação de nossa sociedade. A legislação de proteção peca por considerar o monumento, até certo ponto, desvinculado da realidade socioeconômica. O tombamento, ao decretar a imutabilidade do monumento, provoca a redução de seu valor venal e o abandono, o que é uma causa, ainda que lenta, de destruição inevitável.
TELLES, L. S. Manual do patrimônio histórico. Porto Alegre, Caxias do Sul: Escola Superior de Teologia São Lourenço de Brindes, 1977 (adaptado).', 'Escritos em temporalidade histórica aproximada, os textos se distanciam ao apresentarem pontos de vista diferentes sobre a(s)', '[{"letra": "A", "texto": "ampliação do comércio de imagens sacras."}, {"letra": "B", "texto": "substituição de materiais de valor artístico."}, {"letra": "C", "texto": "políticas de conservação de bens culturais."}, {"letra": "D", "texto": "defesa da privatização de sítios arqueológicos."}, {"letra": "E", "texto": "medidas de salvaguarda de peças museológicas."}]', 'C', 'Enquanto a Carta de Veneza defende a salvaguarda integral e espiritual do monumento, o segundo texto aponta as limitações econômicas das leis de tombamento, contrapondo pontos de vista sobre políticas de conservação.', NULL, NULL, 'resumida', FALSE, FALSE, '695dc4601cfb3d52db050a6b8613f9aca17c6083073a4855fc41135813d6628e', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Divisão internacional do trabalho e lixo eletrônico', 2021, '1º dia', 'INEP', 50, '50', NULL, 'medio', 'TEXTO I
Em 2016, foram gerados 44,7 milhões de toneladas de resíduos eletrônicos, um aumento de 8% na comparação com 2014. Especialistas previram um crescimento de mais 17%, para 52,2 milhões de toneladas, até 2021.
Disponível em: https://nacoesunidas.org. Acesso em: 12 out. 2019 (adaptado).
TEXTO II
Há ainda quem exporte deliberadamente lixo eletrônico para o Gana. É mais caro reciclar devidamente os resíduos no mundo industrializado, onde até existem os recursos e a tecnologia. Um negócio muito mais lucrativo é vender o lixo eletrônico a negociantes locais, que o importam alegando tratar-se de material usado. Os negociantes depois vendem o lixo aos jovens no mercado, ou noutro lado, que o desmantelam e extraem os fios de cobre. Estes são derretidos em lareiras ao ar livre, poluindo o ar e, muitas vezes, intoxicando diretamente os próprios jovens.
KALEDZI, I., SOUZA, G. Disponível em: www.dw.com. Acesso em: 12 out. 2019 (adaptado).', 'No contexto das discussões ambientais, as práticas descritas nos textos refletem um padrão de relações derivado do(a)', '[{"letra": "A", "texto": "exercício pleno da cidadania."}, {"letra": "B", "texto": "divisão internacional do trabalho."}, {"letra": "C", "texto": "gestão empresarial do toyotismo."}, {"letra": "D", "texto": "concepção sustentável da economia."}, {"letra": "E", "texto": "protecionismo alfandegário dos Estados."}]', 'B', NULL, NULL, NULL, 'pendente', FALSE, FALSE, '0f38f36e1b5d006c8863188ea89c867c11d04cee60aed6f7e1ff209fd68f5e32', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Segurança hídrica e acesso equitativo aos recursos', 2021, '1º dia', 'INEP', 51, '51', NULL, 'medio', 'Preços justos e autorizações de uso da água devem garantir de forma adequada que a retirada de água, bem como o retorno de efluentes, mantenham operações eficientes e ambientalmente sustentáveis, de maneira que sejam adaptáveis às peculiaridades e necessidades da indústria e da irrigação em larga escala, bem como às atividades da agricultura em pequena escala e de subsistência.
UNESCO. Relatório Mundial das Nações Unidas sobre Desenvolvimento dos Recursos Hídricos. Água para um mundo sustentável. Unesco, 2015.', 'Considerando o debate sobre segurança hídrica, a proposta apresentada no texto está pautada no(a)', '[{"letra": "A", "texto": "distribuição equitativa do abastecimento."}, {"letra": "B", "texto": "monitoramento do fornecimento urbano."}, {"letra": "C", "texto": "racionamento da capacidade fluvial."}, {"letra": "D", "texto": "revitalização gradativa de solos."}, {"letra": "E", "texto": "geração de produtos recicláveis."}]', 'A', 'A proposta de segurança hídrica baseada em critérios sustentáveis e justos fundamenta-se na garantia do acesso equitativo à água para as diferentes escalas de uso.', NULL, NULL, 'resumida', FALSE, FALSE, 'ac30026a2e76b8f8da49d033e1bf46c2051a7160de32afe97a9bafb93e591270', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Diplomacia e proibição do tráfico de escravizados', 2021, '1º dia', 'INEP', 52, '52', NULL, 'medio', 'Durante os anos de 1854-55, o governo brasileiro por meio de sua representação diplomática em Londres e os livre-cambistas ingleses nas colunas do Daily News e na Câmara dos Comuns aumentaram a pressão pela revogação da Lei Aberdeen. O governo britânico, entretanto, ainda receava que, sem um tratado anglo-brasileiro satisfatório para substituí-la, não haveria nada que impedisse os brasileiros de um dia voltarem aos seus velhos hábitos.
BETHELL, L. A abolição do comércio brasileiro de escravos. Brasília: Senado Federal, 2002 (adaptado).', 'As tensões diplomáticas expressas no texto indicam o interesse britânico em', '[{"letra": "A", "texto": "estabelecer jurisdição conciliadora."}, {"letra": "B", "texto": "compartilhar negócios marítimos."}, {"letra": "C", "texto": "fomentar políticas higienistas."}, {"letra": "D", "texto": "manter a proibição comercial."}, {"letra": "E", "texto": "promover o negócio familiar."}]', 'D', 'As pressões diplomáticas britânicas visavam assegurar a continuidade da abolição e manter a proibição severa do comércio atlântico de escravizados.', NULL, NULL, 'resumida', FALSE, FALSE, '7a85890e567bad1c321bb73761dff7fa994e816adb05ef579a012f914ea7679b', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Práticas místicas e patrimônio cultural regional', 2021, '1º dia', 'INEP', 53, '53', NULL, 'facil', 'Famoso por ser o encantador de viúvas da cidade de Cabaceiras, na Paraíba, Zé de Sila é um contador de histórias parecido com o personagem Chicó, do Auto da Compadecida. Ele defende veementemente que a oração da avó sustentava mais a chuva. "Quando era pequeno e chovia por aqui, ajudava minha avó colocando os pratos emborcados no terreiro para diminuir o vento. Ela fazia isso e rezava para a chuva durar mais", diz Zé de Sila.
GALDINO, V.; BARBOSA, R. C. Artistas por um dia? João Pessoa: Editora Universitária, 2009.', 'Ao destacar expressões e vivências populares do cotidiano, o texto mobiliza os seguintes aspectos da diversidade regional:', '[{"letra": "A", "texto": "Alianças afetivas conectadas ao ritual matrimonial."}, {"letra": "B", "texto": "Práticas místicas associadas ao patrimônio cultural."}, {"letra": "C", "texto": "Manifestações teatrais atreladas ao imaginário político."}, {"letra": "D", "texto": "Narrativas fílmicas relacionadas às intempéries climáticas."}, {"letra": "E", "texto": "Argumentações literárias interligadas às catástrofes ambientais."}]', 'B', 'O uso de crenças, orações e simpatias populares para influenciar eventos da natureza traduz práticas místicas profundamente arraigadas no patrimônio cultural regional.', NULL, NULL, 'resumida', FALSE, FALSE, 'e2efdc5dfbb00045b6f558389fe9c0af224a3870150c5d62550f3ee2989d6aa3', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Reestruturação produtiva e precarização laboral', 2021, '1º dia', 'INEP', 54, '54', NULL, 'medio', 'O uso de novas tecnologias envolve a assimilação de uma cultura empresarial na qual haja a integração entre as propostas de modernização tecnológica e a racionalização. Nem sempre o uso de novas tecnologias é apenas um processo técnico na medida em que pressupõe uma nova orientação no controle do capital, no processo produtivo e na qualificação da mão de obra. Dos diversos efeitos que derivaram dessa orientação, a terceirização, a precarização e a flexibilização aparecem com constância como características do paradigma flexível, em substituição ao modelo taylorista-fordista.
HEREDIA, V. Novas tecnologias nos processos de trabalho: efeitos da reestruturação produtiva. Scripta Nova, n. 170, ago., 2004 (adaptado).', 'O uso de novas tecnologias relacionado ao controle empresarial é criticado no texto em razão da', '[{"letra": "A", "texto": "operacionalização da tarefa laboral."}, {"letra": "B", "texto": "capacitação de profissionais liberais."}, {"letra": "C", "texto": "fragilização das relações de trabalho."}, {"letra": "D", "texto": "hierarquização dos cargos executivos."}, {"letra": "E", "texto": "aplicação dos conhecimentos da ciência."}]', 'C', 'O texto critica a reestruturação tecnológica subordinada ao controle do capital, resultando na precarização, flexibilização e fragilização acentuada das relações de trabalho.', NULL, NULL, 'resumida', FALSE, FALSE, 'ed80d40c4368bf91505ff2728781efe0ee975b2f2db9042bb15cd3b4275ac463', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Condição de transitoriedade e refugiados', 2021, '1º dia', 'INEP', 55, '55', NULL, 'dificil', 'A categoria de refugiado carrega em si as noções de transitoriedade, provisoriedade e temporalidade. Os refugiados situam-se entre o país de origem e o país de destino. Ao transitarem entre os dois universos, ocupam posição marginal, tanto em termos identitários — assentada na falta de pertencimento pleno enquanto membros da comunidade receptora e nos vínculos introjetados por códigos partilhados com a comunidade de origem — quanto em termos jurídicos, ao deixarem de exercitar, ao menos em caráter temporário, o status de cidadãos no país de origem e portar o status de refugiados no país receptor.
MOREIRA, J. B. Refugiados no Brasil: reflexões acerca do processo de integração local. REMHU, n. 43, jul.-dez. 2014 (adaptado).', 'A condição de transitoriedade dos refugiados no Brasil, conforme abordada no texto, é provocada pela associação entre', '[{"letra": "A", "texto": "ascensão social e burocracia estatal."}, {"letra": "B", "texto": "miscigenação étnica e limites fronteiriços."}, {"letra": "C", "texto": "desqualificação profissional e ação policial."}, {"letra": "D", "texto": "instabilidade financeira e crises econômicas."}, {"letra": "E", "texto": "desenraizamento cultural e insegurança legal."}]', 'E', 'A condição de transitoriedade e marginalidade social dos refugiados resulta do duplo impacto do desenraizamento cultural somado à insegurança jurídica no país de acolhimento.', NULL, NULL, 'resumida', FALSE, FALSE, '62d3ccc2cf85969f232972014d011834fd9bdf7746703f8c8bd13c5592ad83a3', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Mulheres na ciência e estratificação social', 2021, '1º dia', 'INEP', 56, '56', NULL, 'medio', 'Mulheres naturalistas raramente figuraram na corrida por conhecer terras exóticas. No século XIX, mulheres como Lady Charlotte Canning eventualmente coletavam espécimes botânicos, mas quase sempre no papel de esposas coloniais, viajando para locais onde seus maridos as levavam e não em busca de seus próprios projetos científicos.
SOMBRIO, M. M. O. Em busca pelo campo: mulheres em expedições científicas no Brasil em meados do século XX. Cadernos Pagu, n. 48, 2016.', 'No contexto do século XIX, a relação das mulheres com o campo científico, descrita no texto, é representativa da', '[{"letra": "A", "texto": "afirmação da igualdade de gênero."}, {"letra": "B", "texto": "transformação dos espaços de lazer."}, {"letra": "C", "texto": "superação do pensamento patriarcal."}, {"letra": "D", "texto": "incorporação das estratificações sociais."}, {"letra": "E", "texto": "substituição das atividades domésticas."}]', 'D', 'A restrição das mulheres cientistas no século XIX a papéis secundários de acompanhantes reflete a plena incorporação das rígidas estratificações sociais e patriarcais.', NULL, NULL, 'resumida', FALSE, FALSE, 'bb1325f7dcfe1ff50a96923391a5ae64d1fd36120446c58ab408c2f65a738d6b', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Sociedade industrial e necessidades criadas', 2021, '1º dia', 'INEP', 57, '57', NULL, 'medio', 'Nos setores mais altamente desenvolvidos da sociedade contemporânea, o transplante de necessidades sociais para individuais é de tal modo eficaz que a diferença entre elas parece puramente teórica. As criaturas se reconhecem em suas mercadorias; encontram sua alma em seu automóvel, casa em patamares, utensílios de cozinha.
MARCUSE, H. A ideologia da sociedade industrial: o homem unidimensional. Rio de Janeiro: Zahar, 1979.', 'O texto indica que, no capitalismo, a satisfação dos desejos pessoais é influenciada por', '[{"letra": "A", "texto": "políticas estatais de divulgação."}, {"letra": "B", "texto": "incentivos controlados de consumo."}, {"letra": "C", "texto": "prescrições coletivas de organização."}, {"letra": "D", "texto": "mecanismos subjetivos de identificação."}, {"letra": "E", "texto": "repressões racionalizadas do narcisismo."}]', 'D', 'O texto aponta que na sociedade industrial capitalista os desejos e necessidades individuais são moldados por mecanismos subjetivos de identificação com o consumo.', NULL, NULL, 'resumida', FALSE, FALSE, '1585729f4bacb8d0c7c022013a0a035c2246b3bb3e7acd78cbddf1a022c6055c', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Transformação da paisagem geográfica urbana', 2021, '1º dia', 'INEP', 58, '58', NULL, 'medio', 'A vida das pessoas se modifica com a mesma rapidez com que se reproduz a cidade. O lugar da festa, do encontro quase desaparecem; o número de brincadeiras infantis nas ruas diminui — as crianças quase não são vistas; os pedaços da cidade são vendidos, no mercado, como mercadorias; árvores são destruídas, praças transformadas em concreto. Por outro lado, os habitantes parecem perder na cidade suas próprias referências. A imagem de uma grande cidade hoje é tão mutante que se assemelha à de um grande guindaste, aliás, a presença maciça destes, das britadeiras, das betoneiras nos dão o limite do processo de transformação diária ao qual está submetida a cidade.
CARLOS, A. F. A. A cidade. São Paulo: Contexto, 2011 (adaptado).', 'No contexto das grandes cidades brasileiras, a situação apresentada no texto vem ocorrendo como consequência da', '[{"letra": "A", "texto": "manutenção dos modos de convívio social."}, {"letra": "B", "texto": "preservação da essência do espaço público."}, {"letra": "C", "texto": "ampliação das normas de controle ambiental."}, {"letra": "D", "texto": "flexibilização das regras de participação política."}, {"letra": "E", "texto": "alteração da organização da paisagem geográfica."}]', 'E', 'A substituição de áreas verdes e espaços públicos por concreto e construções traduz de forma direta a acelerada alteração da organização da paisagem geográfica urbana.', NULL, NULL, 'resumida', FALSE, FALSE, '6b5dc2e1ab643a97316d87f20cce973b37ec6c969616d2f40dc3d8c8e81b945f', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Saberes tradicionais e experiência perceptiva', 2021, '1º dia', 'INEP', 59, '59', NULL, 'facil', 'No semiárido brasileiro, o sertanejo desenvolveu uma acuidade detalhada para a observação dos fenômenos, ao longo dos tempos, presenciados na natureza, em especial para a previsão do tempo e do clima, utilizando como referência a posição dos astros, constelação e nuvens. Conforme os sertanejos, a estação vai ser chuvosa quando a primeira lua cheia de janeiro "sair vermelha, por detrás de uma barra de nuvens", mas "se surgir prateada, é sinal de seca".
MAIA, D.; MAIA, A. C. A utilização dos ditos populares e da observação do tempo para a climatologia escolar no ensino fundamental II. GeoTextos, n. 1, jul., 2010 (adaptado).', 'O texto expõe a produção de um conhecimento que se constitui pela', '[{"letra": "A", "texto": "técnica científica."}, {"letra": "B", "texto": "experiência perceptiva."}, {"letra": "C", "texto": "negação das tradições."}, {"letra": "D", "texto": "padronização das culturas."}, {"letra": "E", "texto": "uniformização das informações."}]', 'B', 'O conhecimento tradicional do sertanejo sobre o clima é construído por meio da observação minuciosa e empírica dos elementos naturais (experiência perceptiva).', NULL, NULL, 'resumida', FALSE, FALSE, 'b90624097e0fc28017bfe3fa3209734e3b0b7d21cde148128b1ddfbc25e04c2f', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Passividade social e crítica cultural', 2021, '1º dia', 'INEP', 60, '60', NULL, 'medio', 'Vocês que fazem parte dessa massa
Que passa nos projetos do futuro
É duro tanto ter que caminhar
E dar muito mais do que receber
Ê, ô, ô, vida de gado
Povo marcado
Ê, povo feliz!
ZÉ RAMALHO. A peleja do diabo com o dono do céu. Rio de Janeiro: Sony, 1979 (fragmento).', 'Qual comportamento coletivo é criticado no trecho da letra da canção lançada em 1979?', '[{"letra": "A", "texto": "Militância política."}, {"letra": "B", "texto": "Passividade social."}, {"letra": "C", "texto": "Altruísmo religioso."}, {"letra": "D", "texto": "Autocontrole moral."}, {"letra": "E", "texto": "Inconformismo eleitoral."}]', 'B', 'A letra da canção de Zé Ramalho emprega forte ironia para criticar a submissão acrítica, a alienação e a passividade social da população ("vida de gado").', NULL, NULL, 'resumida', FALSE, FALSE, 'e9999600909c79ba7f9fa1af702e35178ace2032ffb3d1e5702e42a6c1566738', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Reconfiguração urbana e competitividade global', 2021, '1º dia', 'INEP', 61, '61', NULL, 'medio', 'Desde 2009, a área portuária carioca vem sofrendo grandes transformações realizadas no escopo da operação urbana consorciada conhecida como Porto Maravilha. Parte importante na tentativa de tornar o Rio de Janeiro um polo de serviços internacional, a "revitalização" urbana deveria deixar para trás uma paisagem geográfica que ainda recordava a cidade do início do século passado para abrir espaço, em seu lugar, à instalação de modernas torres comerciais, espaços de consumo e lazer inéditos e cerca de cem mil novos moradores, uma nova configuração socioespacial capaz de alçar a área portuária do Rio de Janeiro ao patamar dos waterfronts de Baltimore, Barcelona e Buenos Aires.
LACERDA, L.; WERNECK, M.; RIBEIRO, B. Cortiços de hoje na cidade do amanhã. E-metropolis, n. 30, set. 2017.', 'As intervenções urbanas descritas derivam de um processo socioespacial que busca a', '[{"letra": "A", "texto": "intensificação da participação na competitividade global."}, {"letra": "B", "texto": "contenção da especulação no mercado imobiliário."}, {"letra": "C", "texto": "democratização da habitação popular."}, {"letra": "D", "texto": "valorização das funções tradicionais."}, {"letra": "E", "texto": "priorização da gestão participativa."}]', 'A', 'As intervenções urbanas de requalificação no porto carioca visam modernizar o espaço para atrair capitais internacionais e elevar a competitividade global da cidade.', NULL, NULL, 'resumida', FALSE, FALSE, '8594416b9500e0c6e3fc242635ac15047bd7fd19f3b17c3068ce8729cbdf40aa', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Indústria nacional e subordinação tecnológica', 2021, '1º dia', 'INEP', 62, '62', NULL, 'dificil', 'Constatou-se uma ínfima inserção da indústria brasileira nas novas tecnologias ancoradas na microeletrônica, capazes de acarretar elevação da produtividade nacional de forma sustentada. Os motores do crescimento nacional, há décadas, são os grupos relacionados a commodities agroindustriais e à indústria representativa do antigo padrão fordista de produção, esta última também limitada pela baixa potencialidade futura de desencadear inovações tecnológicas capazes de proporcionar elevação sustentada da produtividade.
AREND, M. A industrialização do Brasil ante a nova divisão internacional do trabalho. Disponível em: www.ipea.gov.br. Acesso em: 16 jul. 2015 (adaptado).', 'Um efeito desse cenário para a sociedade brasileira tem sido o(a)', '[{"letra": "A", "texto": "barateamento da cesta básica."}, {"letra": "B", "texto": "retorno à estatização econômica."}, {"letra": "C", "texto": "ampliação do poder de consumo."}, {"letra": "D", "texto": "subordinação aos fluxos globais."}, {"letra": "E", "texto": "incentivo à política de modernização."}]', 'D', 'A baixa inserção tecnológica e a dependência de produtos primários inserem a economia brasileira em uma posição de subordinação perante os fluxos e redes globais.', NULL, NULL, 'resumida', FALSE, FALSE, 'fd59ca40bd0cade974cbca7cf7ccc6ee7315d41c263f601cb6ac80c5f7892b0a', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Atividade mineradora e rompimento de vínculos locais', 2021, '1º dia', 'INEP', 63, '63', NULL, 'medio', 'As atividades mineradoras têm criado conflitos com extrativistas, quilombolas, pequenos agricultores, ribeirinhos, pescadores artesanais e povos indígenas. Em geral, estes sujeitos têm encontrado grande dificuldade de reproduzir suas dinâmicas territoriais depois da instalação da atividade mineradora, nem sempre com reconhecimento do impacto ao seu território pelo Estado e pela empresa, ficando sem qualquer tipo de compensação econômica. Em outros casos, nem a compensação econômica tem sido capaz de evitar o esgarçamento das relações sociais destes grupos que sofrem com a reconstrução abrupta das suas identidades e de suas dinâmicas territoriais.
PALHETA, J. M. et al. Conflitos pelo uso do território na Amazônia mineral. Mercator, n. 16, 2017.', 'O texto apresenta uma relação entre atividade econômica e organização social marcada pelo(a)', '[{"letra": "A", "texto": "escassez de incentivo cultural."}, {"letra": "B", "texto": "rompimento de vínculos locais."}, {"letra": "C", "texto": "carência de investimento financeiro."}, {"letra": "D", "texto": "estabelecimento de práticas agroecológicas."}, {"letra": "E", "texto": "enriquecimento das comunidades autóctones."}]', 'B', 'A implantação de grandes projetos minerais em áreas tradicionais acarreta conflitos territoriais e o consequente rompimento drástico de vínculos locais e comunitários.', NULL, NULL, 'resumida', FALSE, FALSE, 'a66c13ca9c9385fe9a856f65fb0f2f7ac7cd2e8aeb8ea3d6539fef873092f2d0', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Hierarquias sociais e caracterização de minorias', 2021, '1º dia', 'INEP', 64, '64', NULL, 'dificil', 'Por maioria, nós não entendemos uma quantidade relativa maior, mas a determinação de um estado ou de um padrão em relação ao qual tanto as quantidades maiores quanto as menores serão ditas minoritárias. Maioria supõe um estado de dominação. É nesse sentido que as mulheres, as crianças e também os animais são minoritários.
DELEUZE, G.; GUATTARI, F. Mil platôs. São Paulo: Editora 34, 2012 (adaptado).', 'No texto, a caracterização de uma minoria decorre da existência de', '[{"letra": "A", "texto": "ameaças de extinção social."}, {"letra": "B", "texto": "políticas de incentivos estatais."}, {"letra": "C", "texto": "relações de natureza arbitrária."}, {"letra": "D", "texto": "valorações de conexões simétricas."}, {"letra": "E", "texto": "hierarquizações de origem biológica."}]', 'C', 'Conforme Deleuze e Guattari, a condição minoritária é definida por estruturas de dominação e assimetrias de poder decorrentes de relações de natureza arbitrária.', NULL, NULL, 'resumida', FALSE, FALSE, 'c8625ae62970beb6ef96e5dd015c3d077d6ac2dadcf5f860aa144dd6674a9f9a', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Luta de classes e oposição de interesses', 2021, '1º dia', 'INEP', 65, '65', NULL, 'medio', 'Ao mesmo tempo, graças às amplas possibilidades que tive de observar a classe média, vossa adversária, rapidamente concluí que vós tendes razão, inteira razão, em não esperar dela qualquer ajuda. Seus interesses são diametralmente opostos aos vossos, mesmo que ela procure incessantemente afirmar o contrário e vos queira persuadir que sente a maior simpatia por vossa sorte. Mas seus atos desmentem suas palavras.
ENGELS, F. A situação da classe trabalhadora na Inglaterra. São Paulo: Boitempo, 2010.', 'No texto, o autor apresenta delineamentos éticos que correspondem ao(s)', '[{"letra": "A", "texto": "conceito de luta de classes."}, {"letra": "B", "texto": "alicerce da ideia de mais-valia."}, {"letra": "C", "texto": "fundamentos do método científico."}, {"letra": "D", "texto": "paradigmas do processo indagativo."}, {"letra": "E", "texto": "domínios do fetichismo da mercadoria."}]', 'A', 'O trecho da obra de Engels evidencia a irreconciliabilidade de interesses entre burguesia e proletariado, fundamentando o conceito basilar de luta de classes.', NULL, NULL, 'resumida', FALSE, FALSE, 'c03ebe972e80a5672f6458a8bc6abb7150ab11167b55fc85b4fdd4a31925acf9', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Perfil carcerário e inclusão social', 2021, '1º dia', 'INEP', 66, '66', NULL, 'medio', 'Houve crescimento de 74% da população brasileira encarcerada entre 2005 e 2012. As análises possibilitaram identificar o perfil da população que está nas prisões do país: homens, jovens (abaixo de 29 anos), negros, com ensino fundamental incompleto, acusados de crimes patrimoniais e, no caso dos presos adultos, condenados e cumprindo regime fechado e, majoritariamente, com penas de quatro até oito anos.
BRASIL. Mapa do encarceramento: os jovens do Brasil. Brasília: Presidência da República, 2015.', 'Nesse contexto, as políticas públicas para minimizar a problemática descrita devem privilegiar a', '[{"letra": "A", "texto": "flexibilização do Código Civil."}, {"letra": "B", "texto": "promoção da inclusão social."}, {"letra": "C", "texto": "redução da maioridade penal."}, {"letra": "D", "texto": "contenção da corrupção política."}, {"letra": "E", "texto": "expansão do período de reclusão."}]', 'B', 'Diante do perfil socioeconômico vulnerável da população prisional, as políticas públicas corretivas devem fundamentar-se prioritariamente na inclusão social e estrutural.', NULL, NULL, 'resumida', FALSE, FALSE, 'c507f0724f8dd51ff8dc1342427836dedc7c6e6fb41ed90248e5566b4ea92d55', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Catástrofes urbanas e renovação das práticas sociais', 2021, '1º dia', 'INEP', 67, '67', NULL, 'dificil', 'Nem guerras, nem revoltas. Os incêndios eram o mais frequente tormento da vida urbana no Regnum Italicum. Entre 880 e 1080, as cidades estiveram constantemente entregues ao apetite das chamas. A certa altura, a documentação parece vencer pela insistência do vocabulário, levando até o leitor mais crítico a cogitar que os medievais tinham razão ao tratar aqueles acontecimentos como castigos que antecediam o julgamento final. Como um quinto cavaleiro apocalíptico, o incêndio agia ao feitio da peste ou da fome: vagando mundo afora, retornava de tempos em tempos e expurgava justos e pecadores num tormento derradeiro, como insistiam os textos do século X. O impacto acarretado sobre as relações sociais era imediato e prolongava-se para além da destruição material. As medidas proclamadas pelas autoridades faziam mais do que reparar os danos e reconstruir a paisagem: elas convertiam a devastação em uma ocasião para alterar e expandir não só a topografia urbana, mas as práticas sociais até então vigentes.
RUST, L. D. Uma calamidade insaciável. Rev. Bras. Hist., n. 72, maio-ago., 2016 (adaptado).', 'De acordo com o texto, a catástrofe descrita impactava as sociedades medievais por proporcionar a', '[{"letra": "A", "texto": "correção dos métodos preventivos e das regras sanitárias."}, {"letra": "B", "texto": "revelação do descaso público e das degradações ambientais."}, {"letra": "C", "texto": "renovação e expansão das estruturas topográficas e das práticas sociais."}, {"letra": "D", "texto": "consolidação das normas eclesiásticas contra a corrupção laica."}, {"letra": "E", "texto": "estagnação econômica decorrente da destruição de fortificações."}]', 'C', 'As catástrofes urbanas medievais funcionavam como oportunidades estruturais para renovar, alterar a topografia e reorganizar as práticas sociais vigentes.', NULL, NULL, 'resumida', FALSE, FALSE, 'c4b2c192900f66970570091218d127f603b299d98c065584b6cc5d10d60972a9', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Protagonismo indígena e novas tecnologias', 2021, '1º dia', 'INEP', 68, '68', NULL, 'medio', 'O protagonismo indígena vem optando por uma estratégia de "des-invisibilização", valendo-se da dinâmica das novas tecnologias. Em outubro de 2012, após receberem uma liminar lhes negando o direito a permanecer em suas terras, os Guarani de Pyelito Kue divulgaram uma carta na qual se dispunham a morrer, mas não a sair de suas terras. Esse fato foi amplamente divulgado, gerando uma grande mobilização na internet, que levou milhares de pessoas a escolherem seu lado, divulgando a hashtag "#somostodosGuarani-Kaiowá" ou acrescentando o sobrenome Guarani-Kaiowá a seus nomes nos perfis das principais redes sociais.
CAPIBERIBE, A.; BONILLA, O. A ocupação do Congresso: contra o que lutam os índios? Estudos Avançados, n. 83, 2015 (adaptado).', 'A estratégia comunicativa adotada pelos indígenas, no contexto em pauta, teve por efeito', '[{"letra": "A", "texto": "enfraquecer as formas de militância política."}, {"letra": "B", "texto": "abalar a identidade de povos tradicionais."}, {"letra": "C", "texto": "inserir as comunidades no mercado global."}, {"letra": "D", "texto": "distanciar os grupos de culturas locais."}, {"letra": "E", "texto": "angariar o apoio de segmentos étnicos externos."}]', 'E', 'O uso estratégico das tecnologias digitais pelos povos indígenas teve por efeito imediato alavancar a solidariedade e angariar o apoio de segmentos externos.', NULL, NULL, 'resumida', FALSE, FALSE, 'd21b42824edb704a1cad912e173fccbb5edcd770aa6dd1afff4cab2804e6af1a', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Estado Novo e levantamento de dados territoriais', 2021, '1º dia', 'INEP', 69, '69', NULL, 'medio', 'O governo Vargas, principalmente durante o Estado Novo (1937-1945), pretendeu construir um Estado capaz de criar uma nova sociedade. Uma dimensão-chave desse projeto tinha no território seu foco principal. Não por acaso, foram criadas então instituições encarregadas de fornecer dados confiáveis para a ação do governo, como o Conselho Nacional de Geografia, o Conselho Nacional de Cartografia, o Conselho Nacional de Estatística e o Instituto Brasileiro de Geografia e Estatística (IBGE), este de 1938.
LIPPI, L. A conquista do Oeste. Disponível em: http://cpdoc.fgv.br. Acesso em: 7 nov. 2014 (adaptado).', 'A criação dessas instituições pelo governo Vargas representava uma estratégia política de', '[{"letra": "A", "texto": "levantar informações para a preservação da paisagem dos sertões."}, {"letra": "B", "texto": "transformação do imaginário popular e das crenças religiosas."}, {"letra": "C", "texto": "controlar o crescimento exponencial da população brasileira."}, {"letra": "D", "texto": "obter conhecimento científico das diversidades regionais."}, {"letra": "E", "texto": "propor a criação de novas unidades da federação."}]', 'D', 'A criação de órgãos estatísticos e geográficos pelo Estado Novo integrava a estratégia política de obtenção de dados científicos sobre a realidade e diversidade territorial do país.', NULL, NULL, 'resumida', FALSE, FALSE, '1036475a9ea3424f5c4a40b9d2660719255b58c3f02694e76f7edc6ad134b281', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Saberes tradicionais e conservação ambiental', 2021, '1º dia', 'INEP', 70, '70', NULL, 'facil', 'Foram esses cientistas Xavante que esclareceram os mistérios da germinação de cada uma das sementes. Eles tinham o conhecimento para quebrar a dormência. O fogo era fundamental para muitas; para outras, o caminho para despertar passava pelo sistema digestivo dos animais silvestres. "Essa planta nasce depois que fazemos a caçada com fogo", diziam eles, esta outra quando a anta caga a semente, aquela precisa ser comida pelo lobo". Aliando os conhecimentos dos cientistas da aldeia e da cidade, essa área do Cerrado foi recuperada totalmente.
PAPPIANI, A. Tecnologias indígenas: esplendor e captura. Disponível em: https://outraspalavras.net. Acesso em: 10 out. 2019 (adaptado).', 'No texto, a relação socioespacial dos indígenas evidencia a importância do(a)', '[{"letra": "A", "texto": "prática agrícola para a logística nacional."}, {"letra": "B", "texto": "cultivo de hortaliças para o consumo urbano."}, {"letra": "C", "texto": "saber tradicional para a conservação ambiental."}, {"letra": "D", "texto": "criação de gado para o aprimoramento genético."}, {"letra": "E", "texto": "reflorestamento comercial para a produção orgânica."}]', 'C', 'A articulação entre os conhecimentos científicos e o saber tradicional indígena comprova a relevância e a eficácia do saber tradicional para a conservação ambiental.', NULL, NULL, 'resumida', FALSE, FALSE, '38cfe9d45b614ad9fa1527e5c53823de3cec4a5a990e2f6f27ee4ac9c3a73315', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Ciclo sedimentar e processos geomorfológicos', 2021, '1º dia', 'INEP', 71, '71', NULL, 'facil', 'Desde os primórdios da formação da crosta terrestre até os dias de hoje, as rochas formadas vêm sendo continuamente destruídas. Os produtos resultantes da destruição das rochas são transportados pela água, vento e gelo a toda superfície terrestre, acionados pelo calor e pela gravidade. Cessada a energia transportadora, são depositados nas regiões mais baixas da crosta, podendo formar pacotes rochosos.
LEINZ, V. Geologia geral. São Paulo: Editora Nacional, 1989.', 'As transformações na superfície terrestre, conforme descritas no texto, compõem o seguinte processo geomorfológico:', '[{"letra": "A", "texto": "Ciclo sedimentar."}, {"letra": "B", "texto": "Instabilidade sísmica."}, {"letra": "C", "texto": "Intemperismo biológico."}, {"letra": "D", "texto": "Derramamento basáltico."}, {"letra": "E", "texto": "Compactação superficial."}]', 'A', 'O processo contínuo de intemperismo, transporte por agentes externos e deposição de sedimentos nas áreas mais baixas caracteriza o ciclo sedimentar.', NULL, NULL, 'resumida', FALSE, FALSE, 'e81c7f08185523ced3a4db3e50ebcbf30c5596af87871467085e1ffdc822c9a8', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Gestão urbana participativa e associações de bairro', 2021, '1º dia', 'INEP', 72, '72', NULL, 'medio', 'A participação social no planejamento e na gestão urbanos ganhou impulso a partir do Estatuto da Cidade (Lei n. 10.257/2001), que estabeleceu condições para elaboração de planos diretores participativos, instrumentos esses indutores da expansão urbana e do ordenamento territorial que, a princípio, devem buscar representar os interesses dos diversos segmentos da sociedade. No entanto, é notório o limite à representação dos interesses das camadas sociais menos favorecidas nesse processo. Este rumo deve ser corrigido e deve-se continuar buscando mecanismos de inclusão dos interesses de toda a sociedade.
Caderno Objetivos de Desenvolvimento Sustentável ODS n. 11: tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis. Brasília: Ipea, 2019.', 'Qual medida promove a participação social descrita no texto?', '[{"letra": "A", "texto": "Redução dos impostos municipais."}, {"letra": "B", "texto": "Privatização dos espaços públicos."}, {"letra": "C", "texto": "Adensamento das áreas de comércio."}, {"letra": "D", "texto": "Valorização dos condomínios fechados."}, {"letra": "E", "texto": "Fortalecimento das associações de bairro."}]', 'E', 'A gestão democrática e a efetiva participação social no planejamento urbano são fortalecidas pela atuação mobilizadora das associações de bairro.', NULL, NULL, 'resumida', FALSE, FALSE, '10b3d4eda21a0e0132e5bdc27565428796b99b22e403c57b7237694bc52106ae', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Crise política e reação popular na morte de Vargas', 2021, '1º dia', 'INEP', 73, '73', NULL, 'medio', 'Quando Getúlio Vargas se suicidou, em agosto de 1954, o país parecia à beira do caos. Acuado por uma grave crise política, o velho líder preferiu uma bala no peito à humilhação de aceitar uma nova deposição, como a que sofrera em outubro de 1945. Entretanto, ao contrário do que imaginavam os inimigos, ao ruído do estampido não se seguiu o silêncio que cerca a derrota.
REIS FILHO, D. A. O Estado à sombra de Vargas. Revista Nossa História, n. 7, maio 2004.', 'O evento analisado no texto teve como repercussão imediata na política nacional a', '[{"letra": "A", "texto": "reação popular."}, {"letra": "B", "texto": "intervenção militar."}, {"letra": "C", "texto": "abertura democrática."}, {"letra": "D", "texto": "campanha anticomunista."}, {"letra": "E", "texto": "radicalização oposicionista."}]', 'A', 'O suicídio de Getúlio Vargas provocou imensa comoção nacional, gerando como repercussão política imediata uma forte e expressiva reação popular.', NULL, NULL, 'resumida', FALSE, FALSE, '0a7330b2461b5944f3a12a0c6ba8fe66c6f9dd1e5ab86f2a735c2b78bb7a94a8', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Supressão de identidades e repressão cultural', 2021, '1º dia', 'INEP', 74, '74', NULL, 'dificil', 'Eu, Dom João, pela graça de Deus, faço saber a V. Mercê que me aprouve banir para essa cidade vários ciganos homens, mulheres e crianças devido ao seu escandaloso procedimento neste reino. Tiveram ordem de seguir em diversos navios destinados a esse porto, e, tendo eu proibido, por lei recente, o uso da sua língua habitual, ordeno a V. Mercê que cumpra essa lei sob ameaça de penalidades, não permitindo que ensinem dita língua a seus filhos, de maneira que daqui por diante o seu uso desapareça.
TEIXEIRA, R. C. História dos ciganos no Brasil. Recife: Núcleo de Estudos Ciganos, 2008.', 'A ordem emanada da Coroa portuguesa para sua colônia americana, em 1718, apresentava um tratamento da identidade cultural pautado em', '[{"letra": "A", "texto": "converter grupos infiéis à religião oficial."}, {"letra": "B", "texto": "suprimir formas divergentes de interação social."}, {"letra": "C", "texto": "evitar envolvimento estrangeiro na economia local."}, {"letra": "D", "texto": "reprimir indivíduos engajados em revoltas nativistas."}, {"letra": "E", "texto": "controlar manifestações artísticas de comunidades autóctones."}]', 'B', 'A ordem régia determinando o banimento de ciganos e a proibição absoluta de sua língua nativa configurava uma política de supressão de formas divergentes de interação.', NULL, NULL, 'resumida', FALSE, FALSE, 'e4482285ba1651aa64cfc3814f57a0aa85026de94cf6ee2b99b2f1f6a6a0f66f', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Medicina colonial e conjugação de saberes empíricos', 2021, '1º dia', 'INEP', 75, '75', NULL, 'medio', 'De um lado, ancorados pela prática médica europeia, por outro, pela terapêutica indígena, com seu amplo uso da flora nativa, os jesuítas foram os reais iniciadores do exercício de uma medicina híbrida que se tornou marca do Brasil colonial. Alguns religiosos vinham de Portugal já versados nas artes de curar, mas a maioria aprendeu na prática diária as funções que deveriam ser atribuídas a um físico, cirurgião, barbeiro ou boticário.
GURGEL, C. Doenças e curas: o Brasil nos primeiros séculos. São Paulo: Contexto, 2010 (adaptado).', 'Conforme o texto, o que caracteriza a construção da prática medicinal descrita é a', '[{"letra": "A", "texto": "adoção de rituais místicos."}, {"letra": "B", "texto": "rejeição dos dogmas cristãos."}, {"letra": "C", "texto": "superação da tradição popular."}, {"letra": "D", "texto": "imposição da farmacologia nativa."}, {"letra": "E", "texto": "conjugação de saberes empíricos."}]', 'E', 'A prática médica do Brasil colonial distinguiu-se pela criação de uma medicina híbrida fundamentada na conjugação de saberes empíricos europeus e indígenas.', NULL, NULL, 'resumida', FALSE, FALSE, 'e6bdab007a934e5f1491071b978cee1fb2c3d22ea2dae90ac32173e22010f184', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Espiritualidade franciscana e língua vulgar', 2021, '1º dia', 'INEP', 76, '76', NULL, 'dificil', 'Desde o século XII que a cristandade ocidental era agitada pelo desafio lançado pela cultura profana — a dos romances de cavalaria, mas também a cultura folclórica dos camponeses e igualmente a dos citadinos, de caráter mais jurídico — à cultura eclesiástica, cujo veículo era o latim. Francisco de Assis veio alterar a situação, propondo aos seus ouvintes uma mensagem acessível a todos e, simultaneamente, enobrecendo a língua vulgar através do seu uso na religião.
VAUCHEZ, A. A espiritualidade da Idade Média Ocidental, séc. VIII-XIII. Lisboa: Estampa, 1995.', 'O comportamento desse religioso demonstra uma preocupação com as características assumidas pela Igreja e com as desigualdades sociais compartilhada no seu tempo pelos(as)', '[{"letra": "A", "texto": "senhores feudais."}, {"letra": "B", "texto": "movimentos heréticos."}, {"letra": "C", "texto": "integrantes das Cruzadas."}, {"letra": "D", "texto": "corporações de ofícios."}, {"letra": "E", "texto": "universidades medievais."}]', 'B', 'A proposta de Francisco de Assis de difundir uma mensagem acessível na língua vulgar aproximava-se das reivindicações igualitárias dos movimentos heréticos medievais.', NULL, NULL, 'resumida', FALSE, FALSE, '4fd7e26b3db90e222205d2fc2212bec5ac67b3f440cf871ad309aa66495408fa', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Instituições de ensino e formação de identidades', 2021, '1º dia', 'INEP', 77, '77', NULL, 'dificil', 'Por que o Brasil continuou um só enquanto a América espanhola se dividiu em vários países?
Para o historiador brasileiro José Murilo de Carvalho, no Brasil, parte da sociedade era muito mais coesa ideologicamente do que a espanhola. Carvalho argumenta que isso se deveu à tradição burocrática portuguesa. "Portugal nunca permitiu a criação de universidades em sua colônia". Por outro lado, na América espanhola, entre 1772 e 1872, 150 mil estudantes se formaram em universidades locais. Para o historiador mexicano Alfredo Ávila Rueda, as universidades na América espanhola eram, em sua maioria, reacionárias. Nesse sentido, o historiador mexicano diz acreditar que a livre circulação de impressos (jornais, livros e panfletos) na América espanhola, que não era permitida na América portuguesa (a proibição só foi revertida em 1808), teve função muito mais importante na construção de regionalismos do que propriamente as universidades.
BARRUCHO, L. Disponível em: www.bbc.com. Acesso em: 8 set. 2019 (adaptado).', 'Os pontos de vista dos historiadores referidos no texto são divergentes em relação ao', '[{"letra": "A", "texto": "papel desempenhado pelas instituições de ensino na criação das múltiplas identidades."}, {"letra": "B", "texto": "controle exercido pelos grupos de imprensa na centralização das esferas administrativas."}, {"letra": "C", "texto": "abandono sofrido pelas comunidades de docentes na concepção de coletividades políticas."}, {"letra": "D", "texto": "lugar ocupado pelas associações de acadêmicos no fortalecimento das agremiações estudantis."}, {"letra": "E", "texto": "protagonismo assumido pelos meios de comunicação no desenvolvimento das nações alfabetizadas."}]', 'A', 'Os historiadores divergem essencialmente a respeito do papel desempenhado pelas instituições de ensino superior e pela circulação de impressos na formação de identidades.', NULL, NULL, 'resumida', FALSE, FALSE, 'daeef7d5d561e4f8566b8bd7f6bc30cd2944dcfa3864a5b0daf05bc0fdc3c0c3', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Pluralidade de demandas sociais na Revolução Inglesa', 2021, '1º dia', 'INEP', 78, '78', NULL, 'dificil', 'TEXTO I
Macaulay enfatizou o glorioso acontecimento representado pela luta do Parlamento contra Carlos I em prol da liberdade política e religiosa do povo inglês; significou o primeiro confronto entre a liberdade e a tirania real, primeiro combate em favor do Iluminismo e do Liberalismo.
ARRUDA, J. J. A. Perspectivas da Revolução Inglesa. Rev. Bras. Hist., n. 7, 1984 (adaptado).
TEXTO II
A Revolução Inglesa, como todas as revoluções, foi causada pela ruptura da velha sociedade, e não pelos desejos da velha burguesia. Na década de 1640, camponeses se revoltaram contra os cercamentos, tecelões contra a miséria resultante da depressão e os crentes contra o Anticristo a fim de instalar o reino de Cristo na Terra.
HILL, C. Uma revolução burguesa? Rev. Bras. Hist., n. 7, 1984 (adaptado).', 'A concepção da Revolução Inglesa apresentada no Texto II diferencia-se da do Texto I ao destacar a existência de', '[{"letra": "A", "texto": "pluralidade das demandas sociais."}, {"letra": "B", "texto": "homogeneidade das lutas religiosas."}, {"letra": "C", "texto": "unicidade das abordagens históricas."}, {"letra": "D", "texto": "superficialidade dos interesses políticos."}, {"letra": "E", "texto": "superioridade dos aspectos econômicos."}]', 'A', 'Enquanto o Texto I foca no conflito político liberal elitista, o Texto II enfatiza a ampla diversidade e pluralidade de demandas sociais populares na revolução.', NULL, NULL, 'resumida', FALSE, FALSE, '3958117bc7becb985740d7c81f5180a98146f4e3b2d577b049479ffb0fc3f4dd', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Territorialização industrial e enclaves operários', 2021, '1º dia', 'INEP', 79, '79', NULL, 'dificil', 'As grandes empresas seriam, certamente, representação de um exercício de poder, ante o grau de autonomia de ação de que dispõem. O que se pretende salientar é a ideia de enclave: plantas industriais que estabelecem relações escassas com o entorno, mas exercem grande influência na economia extralocal.
DAVIDOVICH, F. Estado do Rio de Janeiro: o urbano metropolitano. Hipóteses e questões. GeoUERJ, n. 21, 2010.', 'Que tipo de ação tomada por empresas reflete a forma de territorialização da produção industrial apresentada no texto?', '[{"letra": "A", "texto": "Criação de vilas operárias."}, {"letra": "B", "texto": "Promoção de eventos comunitários."}, {"letra": "C", "texto": "Recuperação de áreas degradadas."}, {"letra": "D", "texto": "Incorporação de saberes tradicionais."}, {"letra": "E", "texto": "Importação de mão de obra qualificada."}]', 'A', 'O conceito de enclave industrial, que estabelece poucas trocas diretas com o entorno, manifesta-se tipicamente na implantação histórica de vilas operárias isoladas.', NULL, NULL, 'resumida', FALSE, FALSE, '8323c507ce2a860cfe1d84e328dbf1390b873a9633147d320a49783124a07f15', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Transição social e descompassos institucionais', 2021, '1º dia', 'INEP', 80, '80', NULL, 'dificil', 'Numa sociedade em transição, a marcha da mudança, em diferentes graus, está impressa em todos os aspectos da ordem social, especialmente no jogo político, que nessas sociedades sempre apresenta padrões característicos de ambivalência, cujas raízes sociais se encontram na coexistência de dois padrões de estrutura social: o padrão tradicional, em declínio, e o novo, emergente, em expansão. Em tais situações, é possível encontrar, simultaneamente, apoio para uma orientação política ou para outra que seja exatamente o seu oposto. O padrão ambivalente do processo político, nas sociedades em desenvolvimento, é o que explica um dos seus traços mais salientes, e que consiste na tendência ao adiamento das grandes decisões. Resulta daí que a inércia política ou a convulsão política podem se suceder uma à outra em períodos surpreendentemente curtos.
PINTO, L. A. C. Sociologia e desenvolvimento. Rio de Janeiro: Civilização Brasileira, 1975 (adaptado).', 'De acordo com a perspectiva apresentada, central no pensamento social brasileiro dos anos 1950-1960, o desenvolvimento do país foi marcado por', '[{"letra": "A", "texto": "radicalidade nas agendas de reforma das elites dirigentes."}, {"letra": "B", "texto": "anomalias na execução dos planos econômicos ortodoxos."}, {"letra": "C", "texto": "descompassos na construção de quadros institucionais modernos."}, {"letra": "D", "texto": "ilegitimidade na atuação dos movimentos de representação classista."}, {"letra": "E", "texto": "vagarosidade na dinâmica de aperfeiçoamento dos programas partidários."}]', 'C', 'O pensamento social brasileiro dos anos 1950-1960 apontava que a modernização do país era travada por profundos descompassos institucionais e estruturais.', NULL, NULL, 'resumida', FALSE, FALSE, 'd69e35b40a5d7496353eda3d009ac66727b58d52de13eb09d9c4b5fe94da8b84', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Escola Nova e acesso igualitário baseado no mérito', 2021, '1º dia', 'INEP', 81, '81', NULL, 'medio', 'Manifesto dos Pioneiros da Educação Nova (1932)
A Educação Nova, alargando a sua finalidade para além dos limites das classes, assume, com uma feição mais humana, a sua verdadeira função social, preparando-se para formar "a hierarquia democrática" pela "hierarquia das capacidades", recrutadas em todos os grupos sociais, a que se abrem as mesmas oportunidades de educação. Ela tem, por objeto, organizar e desenvolver os meios de ação durável com o fim de "dirigir os desenvolvimentos natural e integral do ser humano em cada uma das etapas de seu crescimento", de acordo com uma certa concepção do mundo.
Disponível em: www.histedbr.fe.unicamp.br. Acesso em: 7 out. 2015.', 'Os autores do manifesto citado procuravam contrapor-se ao caráter oligárquico da sociedade brasileira. Nesse sentido, o trecho propõe uma relação necessária entre', '[{"letra": "A", "texto": "ensino técnico e mercado de trabalho."}, {"letra": "B", "texto": "acesso à escola e valorização do mérito."}, {"letra": "C", "texto": "ampliação de vagas e formação de gestores."}, {"letra": "D", "texto": "disponibilidade de financiamento e pesquisa avançada."}, {"letra": "E", "texto": "remuneração de professores e extinção do analfabetismo."}]', 'B', 'O Manifesto dos Pioneiros da Educação Nova defendia a superação do caráter oligárquico através de um sistema escolar público fundamentado no mérito e na igualdade de oportunidades.', NULL, NULL, 'resumida', FALSE, FALSE, 'e51f1ed0916e38f9eb21200555508d3ceaef4a920a1c2c9f28ae473ac2d8dcea', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Método dialético e investigação filosófica', 2021, '1º dia', 'INEP', 82, '82', NULL, 'facil', 'Sócrates: "Quem não sabe o que uma coisa é, como poderia saber de que tipo de coisa ela é? Ou te parece ser possível alguém que não conhece absolutamente quem é Mênon, esse alguém saber se ele é belo, se é rico e ainda se é nobre? Parece-te ser isso possível? Assim, Mênon, que coisa afirmas ser a virtude?".
PLATÃO. Mênon. Rio de Janeiro: PUC-Rio; São Paulo: Loyola, 2001 (adaptado).', 'A atitude apresentada na interlocução do filósofo com Mênon é um exemplo da utilização do(a)', '[{"letra": "A", "texto": "escrita epistolar."}, {"letra": "B", "texto": "método dialético."}, {"letra": "C", "texto": "linguagem trágica."}, {"letra": "D", "texto": "explicação fisicalista."}, {"letra": "E", "texto": "suspensão judicativa."}]', 'B', 'A técnica socrática baseada na investigação conceitual por meio de questionamentos metódicos exemplifica o uso clássico do método dialético.', NULL, NULL, 'resumida', FALSE, FALSE, '56a2dce57ab25a37a3d124d255a5dac78abc787799151ce262561b9f61932506', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Pedagogia dos costumes e artefatos culturais', 2021, '1º dia', 'INEP', 83, '83', NULL, 'medio', 'No seio de diversos povos africanos, nomeadamente no antigo Reino do Congo, existem testemunhos gráficos de que a escrita tomava várias formas. Exemplo disso são as tampas de panela esculpidas em baixo-relevo do povo Woyo (região de Cabinda), com cenas e provérbios do cotidiano, desenhos na terra ou areia, imagens gravadas ou inscritas nos bastões de chefe ou em pedras sagradas, mas, sobretudo, movimentos do corpo humano inscritos num gestual familiar. Entre os Woyo existia o costume de os pais oferecerem aos filhos testos ou tampas de panelas entalhados, transmitindo uma espécie de recado, com signos codificados que traduziam orientações para conseguir uma boa relação conjugal, ter sensatez na escolha do cônjuge e estar alerta para as dificuldades do casamento.
RODRIGUES, M. R. A. M.; TAVARES, A. C. P. Singularidades museológicas de uma tábua com esculturas em diálogo: do alambamento ao casamento em Cabinda (Angola). Anais do Museu Paulista, n. 2, maio-ago., 2017 (adaptado).', 'Para o povo Woyo, os artefatos culturais mencionados no texto cumprem a função de uma', '[{"letra": "A", "texto": "pedagogia dos costumes sociais."}, {"letra": "B", "texto": "imposição das formas de comunicação."}, {"letra": "C", "texto": "desvalorização dos comportamentos da juventude."}, {"letra": "D", "texto": "destituição dos valores do matrimônio."}, {"letra": "E", "texto": "etnografia das celebrações religiosas."}]', 'A', 'Os artefatos culturais e códigos visuais do povo Woyo transmitiam orientações morais e comportamentais, exercendo uma clara função de pedagogia dos costumes.', NULL, NULL, 'resumida', TRUE, FALSE, 'd97ec85567c073a4addbde0599799fca191570a65d482a0b60ff2f3032806c80', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Rituais tradicionais e coesão social', 2021, '1º dia', 'INEP', 84, '84', NULL, 'medio', 'O torém dependia de organização familiar, sendo brincado por pessoas com vínculos de parentesco e afinidade que viviam no local. Era visto como uma brincadeira, um entretenimento feito para os próprios participantes e seus conhecidos. O tempo do caju era o pretexto para sua realização, sendo chamadas várias pessoas da região a fim de tomar mocororó, bebida fermentada do caju.
VALLE, C. G. O. Torém/Toré: tradições e invenção no quadro de multiplicidade étnica do Ceará contemporâneo. In: GRÜNEWALD, R. A. (Org.). Toré: regime encantado dos índios do Nordeste. Recife: Fundaj-Massangana, 2005.', 'O ritual mencionado no texto atribui à manifestação cultural de grupos indígenas do Nordeste brasileiro a função de', '[{"letra": "A", "texto": "celebrar a história oficial."}, {"letra": "B", "texto": "estimular a coesão social."}, {"letra": "C", "texto": "superar a atividade artesanal."}, {"letra": "D", "texto": "manipular a memória individual."}, {"letra": "E", "texto": "modernizar o comércio tradicional."}]', 'B', 'O ritual festivo tradicional cumpria a função primordial de estreitar laços comunitários e estimular a coesão social entre os participantes.', NULL, NULL, 'resumida', TRUE, FALSE, '9aa2729d552d6dfdd1a002b49744a062c5110f1eaf027ea876962d11982c71a7', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Formas de resistência e contratação de escravizados', 2021, '1º dia', 'INEP', 85, '85', NULL, 'medio', 'Escravo fugido
No dia 8 de Outubro do anno proximo passado fugio da fazenda do Bom Retiro, propriedade do dr. Francisco Antonio de Araújo, o escravo José, pardo claro, de 22 annos de idade, estatura regular, cheio de corpo, com a falta de um dente na frente do lado superior, cabellos avermelhados, orelha roxa, falla macia, e andar vagaroso. Intitula-se forro, e quando fugio a primeira vez esteve contratado como camarada em uma fazenda em Capivary.
Quem o aprehender e entregar ao seu senhor no Amparo, ou o recolher a cadéa em qualquer parte será bem gratificado, e protesta-se com todo o rigor da lei contra quem o acoutar.
Escravo fugido. Jornal Correio Paulistano, 13 de abril de 1879. Disponível em: http://bndigital.bn.gov.br. Acesso em: 2 ago. 2019 (adaptado).', 'No anúncio publicado na segunda metade do século XIX, qual a estratégia de resistência escrava apresentada?', '[{"letra": "A", "texto": "Criação de relações de trabalho."}, {"letra": "B", "texto": "Fundação de territórios quilombolas."}, {"letra": "C", "texto": "Suavização da aplicação de normas."}, {"letra": "D", "texto": "Regularização das funções remuneradas."}, {"letra": "E", "texto": "Constituição de economia de subsistência."}]', 'A', 'O anúncio revela que o escravo fugido atuava de maneira autônoma contratando-se como trabalhador livre, evidenciando estratégias de inserção nas relações de trabalho.', NULL, NULL, 'resumida', FALSE, FALSE, '8f2ef1ed32040c377efdc58de1619748b280bd6a9b955063485ee1e57259b61a', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Metafísica e unidade essencial do conhecimento', 2021, '1º dia', 'INEP', 86, '86', NULL, 'dificil', 'A filosofia é como uma árvore, cujas raízes são a metafísica; o tronco, a física, e os ramos que saem do tronco são todas as outras ciências, que se reduzem a três principais: a medicina, a mecânica e a moral, entendendo por moral a mais elevada e a mais perfeita porque pressupõe um saber integral das outras ciências, e é o último grau da sabedoria.
DESCARTES, R. Princípios da filosofia. Lisboa: Edições 70, 1997 (adaptado).', 'Essa construção alegórica de Descartes, acerca da condição epistemológica da filosofia, tem como objetivo', '[{"letra": "A", "texto": "sustentar a unidade essencial do conhecimento."}, {"letra": "B", "texto": "refutar o elemento fundamental das crenças."}, {"letra": "C", "texto": "impulsionar o pensamento especulativo."}, {"letra": "D", "texto": "recepcionar o método experimental."}, {"letra": "E", "texto": "incentivar a suspensão dos juízos."}]', 'A', 'A alegoria da árvore do conhecimento de Descartes ilustra a interconexão hierárquica das ciências com o objetivo de sustentar a unidade essencial do saber.', NULL, NULL, 'resumida', FALSE, FALSE, '04c5b97f418b653846a66aed7c101e393fc7867a000703e751b9cd32b1557d3e', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Amor fati e crítica à tradição cristã', 2021, '1º dia', 'INEP', 87, '87', NULL, 'dificil', 'Minha fórmula para o que há de grande no indivíduo é amor fati: nada desejar além daquilo que é, nem diante de si, nem atrás de si, nem nos séculos dos séculos. Não se contentar em suportar o inelutável, e ainda menos dissimulá-lo, mas amá-lo.
NIETZSCHE apud FERRY, L. Aprender a viver: filosofia para os novos tempos. Rio de Janeiro: Objetiva, 2010 (adaptado).', 'Essa fórmula indicada por Nietzsche consiste em uma crítica à tradição cristã que', '[{"letra": "A", "texto": "combate as práticas sociais de cunho afetivo."}, {"letra": "B", "texto": "impede o avanço científico no contexto moderno."}, {"letra": "C", "texto": "associa os cultos pagãos à sacralização da natureza."}, {"letra": "D", "texto": "condena os modelos filosóficos da Antiguidade Clássica."}, {"letra": "E", "texto": "consagra a realização humana ao campo transcendental."}]', 'E', 'O conceito de *amor fati* (amar a imanência da vida) formulado por Nietzsche contrapõe-se à tradição cristã que projeta o sentido da existência para o plano transcendental.', NULL, NULL, 'resumida', FALSE, FALSE, 'c07e58c15de01ae0ce43a249a445711b3ab082e8058d995d7b2a238b209ca731', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Ascetismo medieval e desvalorização corpórea', 2021, '1º dia', 'INEP', 88, '88', NULL, 'medio', 'É preciso usar de violência e rebater varonilmente os apetites dos sentidos sem atender ao que a carne quer ou não quer, mas trabalhando por sujeitá-la ao espírito, ainda que se revolte. Cumpre castigá-la e curvá-la à sujeição, a tal ponto que esteja disposta para tudo, sabendo contentar-se com pouco e deleitar-se com a simplicidade, sem resmungar por qualquer incômodo.
KEMPIS, T. Imitação de Cristo. Petrópolis: Vozes, 2015.', 'Qual característica do ascetismo medieval é destacada no texto?', '[{"letra": "A", "texto": "Exaltação do ritualismo litúrgico."}, {"letra": "B", "texto": "Afirmação do pensamento racional."}, {"letra": "C", "texto": "Desqualificação da atividade laboral."}, {"letra": "D", "texto": "Condenação da alimentação impura."}, {"letra": "E", "texto": "Desvalorização da materialidade corpórea."}]', 'E', 'O texto ascético medieval enfatiza a necessidade de subjugar e castigar os desejos da carne, traduzindo a absoluta desvalorização da materialidade corpórea.', NULL, NULL, 'resumida', FALSE, FALSE, 'aea18ac48a5f5004f5cb5832226755466f3a697a40e11a0cc42262938b207f09', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Movimento de translação e projeção de sombras', 2021, '1º dia', 'INEP', 89, '89', NULL, 'dificil', '[DESCRIÇÃO DA IMAGEM: Esquema do movimento de translação da Terra ao redor do Sol, mostrando os equinócios (21 de março e 23 de setembro) e solstícios (21 de junho e 21 de dezembro).]
Disponível em: www.cdcc.usp.br. Acesso em: 27 jul. 2010 (adaptado).', 'Considerando as informações apresentadas, o prédio do Congresso Nacional, em Brasília, no dia 21 de junho, às 12 horas, projetará sua sombra para a direção', '[{"letra": "A", "texto": "norte."}, {"letra": "B", "texto": "sul."}, {"letra": "C", "texto": "leste."}, {"letra": "D", "texto": "oeste."}, {"letra": "E", "texto": "nordeste."}]', 'B', 'Em 21 de junho (solstício de inverno no Hemisfério Sul), os raios solares incidem verticalmente sobre o Trópico de Câncer. Em Brasília, os raios solares chegam inclinados vindo do norte, projetando sombras para o sul.', 'Esquema do movimento de translação da Terra ao redor do Sol, mostrando os equinócios (21 de março e 23 de setembro) e solstícios (21 de junho e 21 de dezembro).', NULL, 'resumida', FALSE, FALSE, '91e2edb28a2ba7094c7391d763dd7fba11dbc3057e00d325f003cf04b5427d23', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências Humanas', 'Cotidiano urbano e hierarquias sociais na escravidão', 2021, '1º dia', 'INEP', 90, '90', NULL, 'medio', 'TEXTO I
[DESCRIÇÃO DA IMAGEM: Gravura histórica mostrando negros escravizados carregando barris de dejetos ("tigres") sobre a cabeça nas ruas do Rio de Janeiro no século XIX.]
EIGENHEER, E. M. Lixo: a limpeza urbana através dos tempos. Porto Alegre: Gráfica Palloti, 2009.
TEXTO II
A repugnante tarefa de carregar lixo e os dejetos da casa para as praças e praias era geralmente destinada ao único escravo da família ou ao de menor status ou valor. Todas as noites, depois das dez horas, os escravos conhecidos popularmente como "tigres" levavam tubos ou barris de excremento e lixo sobre a cabeça pelas ruas do Rio.
KARASCH, M. C. A vida dos escravos no Rio de Janeiro, 1808-1850. Rio de Janeiro: Cia. das Letras, 2000.', 'A ação representada na imagem e descrita no texto evidencia uma prática do cotidiano nas cidades no Brasil nos séculos XVIII e XIX caracterizada pela', '[{"letra": "A", "texto": "valorização do trabalho braçal."}, {"letra": "B", "texto": "reiteração das hierarquias sociais."}, {"letra": "C", "texto": "sacralização das atividades laborais."}, {"letra": "D", "texto": "superação das exclusões econômicas."}, {"letra": "E", "texto": "ressignificação das heranças religiosas."}]', 'B', 'A atribuição da tarefa degradante de remoção de dejetos exclusivamente a escravizados ("tigres") evidenciava e reiterava as rígidas hierarquias sociais da sociedade escravista.', 'Gravura histórica mostrando negros escravizados carregando barris de dejetos ("tigres") sobre a cabeça nas ruas do Rio de Janeiro no século XIX.', NULL, 'resumida', FALSE, FALSE, 'fd664506a98743490d741e0fb7a7dc1bad175c060f3e1edc7f02cbc022834280', 'ENEM_2021-DIA1.txt'),
('ENEM', 'Ciências da Natureza', 'Química Geral e Inorgânica', 2021, '2º dia', 'INEP', 1, '91', NULL, 'medio', 'No cultivo por hidroponia, são utilizadas soluções nutritivas contendo macronutrientes e micronutrientes essenciais. Além dos nutrientes, o pH é um parâmetro de extrema importância, uma vez que ele afeta a preparação da solução nutritiva e a absorção dos nutrientes pelas plantas. Para o cultivo de alface, valores de pH entre 5,5 e 6,5 são ideais para o seu desenvolvimento. As correções de pH são feitas pela adição de compostos ácidos ou básicos, mas não devem introduzir elementos nocivos às plantas. Na tabela, são apresentados alguns dados da composição da solução nutritiva de referência para esse cultivo. Também é apresentada a composição de uma solução preparada por um produtor de cultivo hidropônico.
[Tabela omitida por brevidade textual no banco estruturado]
LENZI, E.; FAVERO, L. O. B.; LUCHESE, E. B. Introdução à química da água: ciência, vida e sobrevivência. Rio de Janeiro: LTC, 2012 (adaptado).', 'Para correção do pH da solução nutritiva preparada, esse produtor pode empregar uma solução de', '[{"letra": "A", "texto": "ácido fosfórico, H3PO4"}, {"letra": "B", "texto": "sulfato de cálcio, CaSO4."}, {"letra": "C", "texto": "óxido de alumínio, Al2O3."}, {"letra": "D", "texto": "cloreto de ferro(II), FeCl2."}, {"letra": "E", "texto": "hidróxido de potássio, KOH."}]', 'A', 'Como o pH da solução preparada está muito ácido (4,3) em relação à referência (5,5 a 6,5), deve-se adicionar um composto básico ou ácido que ajuste adequadamente os nutrientes sem introduzir elementos nocivos. O ácido fosfórico fornece fosfato e íons H+.', NULL, NULL, 'resumida', FALSE, FALSE, '84604c5c2bbc0ff6b02b4964e2db7328117b782bc4019b94451054f7871ccede', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Álgebra e Sequências', 2021, '2º dia', 'INEP', 1, '136', 'matematica', 'medio', 'Um segmento de reta está dividido em duas partes na proporção áurea... Essa constante de proporcionalidade é comumente representada pela letra grega \varphi, e seu valor é dado pela solução positiva da equação \varphi^2 = \varphi + 1. Assim como a potência \varphi^2, as potências superiores de \varphi podem ser expressas da forma a\varphi + b em que a e b são inteiros positivos.', 'A potência \varphi^7, escrita na forma a\varphi + b (a e b são inteiros positivos), é', '[{"letra": "A", "texto": "5\\varphi + 3"}, {"letra": "B", "texto": "8\\varphi + 5"}, {"letra": "C", "texto": "11\\varphi + 7"}, {"letra": "D", "texto": "13\\varphi + 8"}, {"letra": "E", "texto": "21\\varphi + 13"}]', 'D', 'Utilizando sucessivamente a relação \varphi^2 = \varphi + 1, calcula-se \varphi^3 = 2\varphi+1, até chegar em \varphi^7 = 13\varphi + 8.', NULL, NULL, 'resumida', TRUE, FALSE, '62351108f6fd49c754f51f973acff124bf0b615a260bfc9b18a88a136f3461a3', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Ondas e Acústica', 2021, '2º dia', 'INEP', 2, '92', NULL, 'medio', 'O sino dos ventos é composto por várias barras metálicas de mesmo material e espessura, mas de comprimentos diferentes, conforme a figura.', 'Considere f1 e v1, respectivamente, como a frequência fundamental e a velocidade de propagação do som emitido pela barra de menor comprimento, e f2 e v2 são essas mesmas grandezas para o som emitido pela barra de maior comprimento. As relações entre as frequências fundamentais e entre as velocidades de propagação são, respectivamente,', '[{"letra": "A", "texto": "f1 < f2 e v1 < v2"}, {"letra": "B", "texto": "f1 < f2 e v1 = v2"}, {"letra": "C", "texto": "f1 < f2 e v1 > v2"}, {"letra": "D", "texto": "f1 > f2 e v1 = v2"}, {"letra": "E", "texto": "f1 > f2 e v1 > v2"}]', 'D', 'A velocidade do som em barras do mesmo material depende apenas das propriedades do meio, logo v1 = v2. A frequência é inversamente proporcional ao comprimento da barra, logo f1 > f2 para a barra menor.', NULL, NULL, 'resumida', TRUE, FALSE, '2339ceb4955f2574c6a8e96da37e006d81c6dbf3ab5eb31b6320469eae1d3aa1', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial', 2021, '2º dia', 'INEP', 2, '137', 'matematica', 'dificil', 'O Atomium, representado na imagem, é um dos principais pontos turísticos de Bruxelas. Trata-se de uma estrutura metálica construída no formato de um cubo, apoiada por um dos vértices sobre uma base paralela ao plano do solo, e a diagonal do cubo contendo esse vértice é ortogonal ao plano da base. Centradas nos vértices e no centro foram construídas esferas conectadas por tubos.
Disponível em: http://trupedatrip.com. Acesso em: 25 out. 2019.', 'Considere um visitante que se deslocou pelo interior do Atomium sempre em linha reta e seguindo o menor trajeto entre dois vértices, passando por todas as arestas e todas as diagonais do cubo. A projeção ortogonal sobre o plano do solo do trajeto percorrido por esse visitante é representada por', '[{"letra": "A", "texto": "[Figura A]"}, {"letra": "B", "texto": "[Figura B]"}, {"letra": "C", "texto": "[Figura C]"}, {"letra": "D", "texto": "[Figura D]"}, {"letra": "E", "texto": "[Figura E]"}]', 'E', 'Pela projeção ortogonal do percurso tridimensional do cubo apoiado por um vértice sobre a base, obtém-se um alinhamento simétrico hexagonal com diagonais (Figura E).', NULL, NULL, 'resumida', TRUE, FALSE, '655ab743c607ac42311799de21d3bdc04d5b26fa88101fc4f59da9d698bc0741', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Evolução e Biologia Evolutiva', 2021, '2º dia', 'INEP', 3, '93', NULL, 'medio', 'O polvo mimético apresenta padrões cromáticos e comportamentos muito curiosos. Frequentemente, muda a orientação de seus tentáculos, assemelhando-se a alguns animais. As imagens 1, 3 e 5 apresentam polvos mimetizando, respectivamente, um peixe-linguado (2), um peixe-leão (4) e uma serpente-marinha (6).
NORMAN, M. D.; FINN, J.; TREGENZA, T. Dynamic mimicry in an Indo-Malayan octopus. In: Proceedings of the Royal Society B: Biological Sciences, n. 268, out. 2001. Disponível em: www.researchgate.net. Acesso em: 15 mar. 2014 (adaptado).', 'Do ponto de vista evolutivo, a capacidade apresentada se estabeleceu porque os polvos', '[{"letra": "A", "texto": "originaram-se do mesmo ancestral que esses animais."}, {"letra": "B", "texto": "passaram por mutações similares a esses organismos."}, {"letra": "C", "texto": "observaram esses animais em seus nichos ecológicos."}, {"letra": "D", "texto": "resultaram de convergência adaptativa com essas espécies."}, {"letra": "E", "texto": "sobreviveram às pressões seletivas com esses comportamentos."}]', 'E', 'A capacidade de mimetismo resultou da seleção natural, onde indivíduos que exibiam comportamentos e colorações protetivas sobreviveram às pressões seletivas do ambiente.', NULL, NULL, 'resumida', FALSE, FALSE, '2e3de2e879b833e913431d9fabfad56b4b9a23bacad78a45ce6ac188fe334b01', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Análise Combinatória', 2021, '2º dia', 'INEP', 3, '138', 'matematica', 'dificil', 'A Copa do Brasil teve, até a edição de 2018, 15 times diferentes como campeões... A CBF pretende colocar um painel com 6 linhas e 5 placas por linha, com restrições regionais para gaúchos, cariocas, mineiros e paulistas nas quatro primeiras linhas, e sem restrições nas duas últimas.
Disponível em: http://campeoesdofutebol.com.br. Acesso em: 1 nov. 2018 (adaptado).', 'Qual expressão determina a quantidade de painéis diferentes que a CBF poderá montar?', '[{"letra": "A", "texto": "\\frac{7!}{5!} \\cdot \\frac{5!}{3!} \\cdot \\frac{7!}{6!} \\cdot \\frac{9!}{3! \\cdot 3!} \\cdot 10!"}, {"letra": "B", "texto": "\\frac{7!}{5!\\cdot 5!} \\cdot \\frac{7!}{5!\\cdot 2!} \\cdot \\frac{9!}{5!\\cdot 4!}"}, {"letra": "C", "texto": "30!"}, {"letra": "D", "texto": "7! \\cdot 5! \\cdot 7! \\cdot 9! \\cdot 10!"}, {"letra": "E", "texto": "\\frac{9!}{3!} \\cdot 5! \\cdot \\frac{7!}{2!} \\cdot \\frac{9!}{4!} \\cdot 10!"}]', 'E', 'O número de painéis é determinado pelo produto das permutações/combinações possíveis para preencher as placas de cada linha restrita e livre.', NULL, NULL, 'resumida', TRUE, FALSE, '743c6e14fa2e44580e689b550389799ed19839cc17a9a96830e7e4baf8d668be', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Cinemática e Dinâmica', 2021, '2º dia', 'INEP', 4, '94', NULL, 'dificil', 'A figura foi extraída de um antigo jogo para computadores, chamado Bang! Bang! Em determinado momento de uma partida, o competidor B deve disparar, ele sabe que a bala disparada anteriormente, com θ = 53°, passou tangenciando o ponto P. No jogo, g é igual a 10 m/s². Considere sen 53° = 0,8, cos 53° = 0,6 e desprezível a ação de forças dissipativas.
Disponível em: http://mebdownloads.butzke.net.br. Acesso em: 18 abr. 2015 (adaptado).', 'Com base nas distâncias dadas e mantendo o último ângulo de disparo, qual deveria ser, aproximadamente, o menor valor de |\vec{\nu_{0}}| que permitiria ao disparo efetuado pelo canhão B atingir o canhão A?', '[{"letra": "A", "texto": "30 m/s."}, {"letra": "B", "texto": "35 m/s."}, {"letra": "C", "texto": "40 m/s."}, {"letra": "D", "texto": "45 m/s."}, {"letra": "E", "texto": "50 m/s."}]', 'C', 'Aplicação das equações do lançamento oblíquo (alcance e altura máxima) passando pelo ponto P, resultando em velocidade inicial de aproximadamente 40 m/s.', NULL, NULL, 'resumida', TRUE, FALSE, '14f7cf3b26f19d8ad738e1c904d5693029d8894b2abdcc201b2cb8a7acf29e8a', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 4, '139', 'matematica', 'facil', 'Uma rede de hamburgueria tem três franquias em cidades distintas. O gerente sugeriu colocar à venda cinco novos tipos de lanche. O tipo que apresentasse a maior média por franquia seria incluído definitivamente no cardápio (Tabela com vendas dos lanches I a V nas franquias I, II e III).', 'Com base nessas informações, a gerência decidiu incluir no cardápio o lanche de tipo', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'E', 'Calculando a média de vendas de cada lanche nas três franquias, o Lanche V apresenta a maior média aritmética (426,6), sendo o escolhido.', NULL, NULL, 'resumida', TRUE, FALSE, 'a4f1fcec43891e03f0d4a2cf856f3521fc1de22138e72ba606aad44d28f80141', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Radioatividade e Soluções (Meia-vida)', 2021, '2º dia', 'INEP', 5, '95', NULL, 'medio', 'Os pesticidas organoclorados foram amplamente empregados na agricultura, contudo, em razão das suas elevadas toxicidades e persistências no meio ambiente, eles foram banidos. Considere a aplicação de 500 g de um pesticida organoclorado em uma cultura e que, em certas condições, o tempo de meia-vida do pesticida no solo seja de 5 anos.', 'A massa do pesticida no decorrer de 35 anos será mais próxima de', '[{"letra": "A", "texto": "3,9 g."}, {"letra": "B", "texto": "31,2 g."}, {"letra": "C", "texto": "62,5 g."}, {"letra": "D", "texto": "125,0 g."}, {"letra": "E", "texto": "250,0 g."}]', 'A', 'Em 35 anos, com meia-vida de 5 anos, ocorrem 7 períodos de meia-vida. A massa final é 500 / (2^7) = 500 / 128 = 3,9 g.', NULL, NULL, 'resumida', TRUE, FALSE, '49e08174873809afd8168d4023bca2faf78d96eb143f6e8d8a29736d1ad6fae1', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 5, '140', 'matematica', 'medio', 'Uma grande rede de supermercados adota um sistema de avaliação dos faturamentos de suas filiais, considerando a média de faturamento mensal em milhão (Quadro de comissões por faixa de M e tabela de faturamentos mensais em um dado ano).', 'Nas condições apresentadas, os representantes desse supermercado avaliam que receberão, no ano seguinte, a comissão de tipo', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'B', 'A média mensal do faturamento obtido no ano foi de 3,75 milhões. Pela tabela de comissões, o valor situa-se na faixa 2 \le M < 4 (Comissão II).', NULL, '[{"titulo": "Passo 1", "conteudo": "A média mensal do faturamento obtido no ano foi de 3,75 milhões.", "formula": null}, {"titulo": "Conclusão", "conteudo": "Pela tabela de comissões, o valor situa-se na faixa 2 \\le M < 4 (Comissão II).", "formula": null}]', 'automatica', TRUE, FALSE, '617aec0007a861745832aa34f2c28b196b9f72cfdcf756bf3d3111eea2834f1e', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Genética e Biologia Molecular', 2021, '2º dia', 'INEP', 6, '96', NULL, 'dificil', 'A sequência de nucleotídeos do RNA mensageiro presentes em um gene de um fungo, constituída de sete códons, está escrita a seguir:
1: AUG | 2: UUU | 3: GUU | 4: CAA | 5: UGU | 6: AGU | 7: UAG
Pesquisadores submeteram a sequência a mutações independentes. Sabe-se que os códons UAG e UAA são terminais, ou seja, indicam a interrupção da tradução.', 'Qual mutação produzirá a menor proteína?', '[{"letra": "A", "texto": "Deleção de G no códon 3."}, {"letra": "B", "texto": "Substituição de C por U no códon 4."}, {"letra": "C", "texto": "Substituição de G por C no códon 6."}, {"letra": "D", "texto": "Substituição de A por G no códon 7."}, {"letra": "E", "texto": "Deleção dos dois primeiros nucleotídeos no códon 5."}]', 'E', 'A deleção dos dois primeiros nucleotídeos no códon 5 provoca mudança na leitura (frameshift) que introduz prematuramente um códon de parada ou altera a sequência gerando a menor proteína funcional antes do término original.', NULL, NULL, 'resumida', FALSE, FALSE, '6691b4554762bc24b197d0c4990b7b7e747b5ab3c77f182bee22e510a6a3da91', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Álgebra e Sequências', 2021, '2º dia', 'INEP', 6, '141', 'matematica', 'medio', 'Aplicativos que gerenciam serviços de hospedagem têm ganhado espaço... O preço P a ser pago é calculado considerando um preço por diária d, acrescido de uma taxa fixa de limpeza L e de uma taxa de serviço s (percentual s calculado sobre o valor pago pelo total das diárias).', 'Nessa situação, o preço a ser pago ao aplicativo para uma hospedagem de n diárias pode ser obtido pela expressão', '[{"letra": "A", "texto": "P = d \\cdot n + L + d \\cdot n \\cdot s"}, {"letra": "B", "texto": "P = d \\cdot n + L + d \\cdot s"}, {"letra": "C", "texto": "P = d + L + s"}, {"letra": "D", "texto": "P = d \\cdot n \\cdot s + L"}, {"letra": "E", "texto": "P = d \\cdot n + L + s"}]', 'A', 'O preço total P é composto pelo valor das diárias (d \cdot n), taxa fixa de limpeza (L) e a taxa de serviço percentual sobre as diárias (d \cdot n \cdot s), resultando em P = d \cdot n + L + d \cdot n \cdot s.', NULL, NULL, 'resumida', TRUE, FALSE, '23824efe583cdc815274dc783f083232724113e74ecf6c725fa7037920975b08', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Geral e Inorgânica', 2021, '2º dia', 'INEP', 7, '97', NULL, 'facil', 'A simples atitude de não jogar direto no lixo ou no ralo da pia o óleo de cozinha usado pode contribuir para a redução da poluição ambiental. Mas o que fazer com o óleo vegetal que não será mais usado? Não existe um modelo ideal de descarte, mas uma alternativa simples tem sido reaproveitá-lo para fazer sabão. Para isso, são necessários, além do próprio óleo, água e soda cáustica.
LOBO, I. Sabão feito com óleo de cozinha. Disponível em: http://pga.pgr.mpf.gov.br. Acesso em: 29 fev. 2012 (adaptado).', 'Com base no texto, a reação química que permite o reaproveitamento do óleo vegetal é denominada', '[{"letra": "A", "texto": "redução."}, {"letra": "B", "texto": "epoxidação."}, {"letra": "C", "texto": "substituição."}, {"letra": "D", "texto": "esterificação."}, {"letra": "E", "texto": "saponificação."}]', 'E', 'A reação entre óleos/gorduras (triglicerídeos) com uma base forte (soda cáustica, NaOH) para produção de sabão e glicerina é denominada saponificação.', NULL, NULL, 'resumida', FALSE, FALSE, 'd5ec98a371eafaf0b040e196299754b87472abb5e513e676ed183361fdfca224', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 7, '142', 'matematica', 'dificil', 'O organizador de uma competição de lançamento de dardos pretende tornar o campeonato mais competitivo. Nas regras atuais, o jogador lança 3 dardos e pontua caso acerte pelo menos um no alvo (probabilidade de acerto em cada lançamento = 1/2). O organizador planeja modificar as regras para que a probabilidade de pontuar seja igual ou superior a 9/10, aumentando a quantidade de dardos.', 'Com base nos valores considerados pelo organizador, a quantidade mínima de dardos que devem ser disponibilizados em uma rodada para tornar o jogo mais atrativo é', '[{"letra": "A", "texto": "2."}, {"letra": "B", "texto": "4."}, {"letra": "C", "texto": "6."}, {"letra": "D", "texto": "9."}, {"letra": "E", "texto": "10."}]', 'B', 'A probabilidade de errar todos os n dardos é (1/2)^n. Para que a chance de pontuar seja \ge 9/10, (1/2)^n \le 1/10, o que resulta em n = 4 dardos.', NULL, NULL, 'resumida', TRUE, FALSE, '2c7f4c9076e09ce9d904f20c795a489c08499e6d8adeede2533ae54335fe555a', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Fisiologia Humana e Comparada', 2021, '2º dia', 'INEP', 8, '98', NULL, 'medio', 'Durante o desenvolvimento embrionário humano ocorre uma comunicação entre os átrios direito e esquerdo através do forame oval (ou forame de Botal). Essa comunicação não causa prejuízos à circulação do bebê em formação, exceto se ela perdurar após o nascimento.', 'Os prejuízos no período embrionário são evitados porque a circulação fetal se assemelha à dos(as)', '[{"letra": "A", "texto": "aves, porque a pequena circulação e a grande circulação estão presentes."}, {"letra": "B", "texto": "répteis, porque a mistura de sangue é minimizada por um metabolismo lento."}, {"letra": "C", "texto": "crocodilianos, porque a separação dos ventrículos impede a mistura sanguínea."}, {"letra": "D", "texto": "peixes, porque a circulação é simples, ocorrendo uma passagem única pelo coração."}, {"letra": "E", "texto": "anfíbios, porque pressões diferenciais isolam temporalmente o sangue venoso do arterial."}]', 'E', 'No período embrionário, o sangue venoso e arterial se misturam parcialmente de forma regulada por pressões diferenciais, assemelhando-se à circulação dos anfíbios.', NULL, NULL, 'resumida', FALSE, FALSE, '9f0b84e5aea7d4d5da3bb9aaef34eb1e38c6f32af821980a8750c63853923990', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 8, '143', 'matematica', 'medio', 'O gráfico apresenta o nível de ocupação dos cinco reservatórios de água que abasteciam uma cidade em 2 de fevereiro de 2015 (com capacidades de 105, 100, 20, 80 e 40 bilhões de litros).', 'Nessa data, o reservatório com o maior volume de água era o', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'D', 'O volume de água é calculado multiplicando a capacidade pelo nível de ocupação percentual. O reservatório IV atinge 32 bilhões de litros (80 \times 40%), o maior volume entre todos.', NULL, NULL, 'resumida', TRUE, FALSE, 'e5bd8417ab5114848320f690a106f125cd2ba844347c309a0e12a064fd461f96', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Termodinâmica e Calorimetria', 2021, '2º dia', 'INEP', 9, '99', NULL, 'medio', 'Na cidade de São Paulo, as ilhas de calor são responsáveis pela alteração da direção do fluxo da brisa marítima que deveria atingir a região de mananciais. Mas, ao cruzar a ilha de calor, a brisa marítima agora encontra um fluxo de ar vertical, que transfere para ela energia térmica absorvida das superfícies quentes da cidade, deslocando-a para altas altitudes. Dessa maneira, há condensação e chuvas fortes no centro da cidade, em vez de na região de mananciais.
VIVEIROS, M. Ilhas de calor afastam chuvas de represas. Disponível em: www2.feis.unesp.br. Acesso em: 3 dez. 2019 (adaptado).', 'No processo de fortes chuvas no centro da cidade de São Paulo, há dois mecanismos dominantes de transferência de calor: entre o Sol e a ilha de calor, e entre a ilha de calor e a brisa marítima. Esses mecanismos são, respectivamente,', '[{"letra": "A", "texto": "irradiação e convecção."}, {"letra": "B", "texto": "irradiação e irradiação."}, {"letra": "C", "texto": "condução e irradiação."}, {"letra": "D", "texto": "convecção e irradiação."}, {"letra": "E", "texto": "convecção e convecção."}]', 'A', 'A transferência de calor entre o Sol e a superfície ocorre por irradiação eletromagnética, enquanto a transferência entre a superfície quente da ilha de calor urbana e a brisa marítima ocorre por convecção térmica através do fluxo de ar vertical.', NULL, NULL, 'resumida', FALSE, FALSE, '418f05d67cd7d2f01e90b3e7916a8f180b347d56252ccabb6a503f3b88e3c3e6', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 9, '144', 'matematica', 'facil', 'Uma pessoa realizou uma pesquisa com alguns alunos de uma escola, coletando suas idades, e organizou esses dados no gráfico (Frequências: idade 9 com freq 6; idade 18 com freq 12; idade 27 com freq 9).', 'Qual é a média das idades, em ano, desses alunos?', '[{"letra": "A", "texto": "9"}, {"letra": "B", "texto": "12"}, {"letra": "C", "texto": "19"}, {"letra": "D", "texto": "24"}, {"letra": "E", "texto": "27"}]', 'C', 'A média aritmética ponderada das idades pelos respectivos números de alunos (frequências) resulta em (9\times6 + 18\times12 + 27\times9) / 27 = 19 anos.', NULL, NULL, 'resumida', TRUE, FALSE, 'd195411b1dd35bb04fa8b7909091cceb18ad63256571564203c6cf1e1af3aca4', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Cinemática e Dinâmica', 2021, '2º dia', 'INEP', 10, '100', NULL, 'facil', 'No seu estudo sobre a queda dos corpos, Aristóteles afirmatva que se abandonarmos corpos leves e pesados de uma mesma altura, o mais pesado chegaria mais rápido ao solo. Essa ideia está apoiada em algo que é difícil de refutar, a observação direta da realidade baseada no senso comum. Após uma aula de física, dois colegas estavam discutindo sobre a queda dos corpos...
HÜLSENDEGER, M. Uma análise das concepções dos alunos sobre a queda dos corpos. Caderno Brasileiro de Ensino de Física, n. 3, dez. 2004 (adaptado).', 'O aspecto físico comum que explica a diferença de comportamento dos corpos em queda nessa discussão é o(a)', '[{"letra": "A", "texto": "peso dos corpos."}, {"letra": "B", "texto": "resistência do ar."}, {"letra": "C", "texto": "massa dos corpos."}, {"letra": "D", "texto": "densidade dos corpos."}, {"letra": "E", "texto": "aceleração da gravidade."}]', 'B', 'A diferença no comportamento de queda de corpos com massas ou formatos distintos (como a folha esticada versus amassada) é explicada pela força de resistência do ar.', NULL, NULL, 'resumida', FALSE, FALSE, '7b48f5a962dffbfa7f6ee040da0c5d731b7cf571a6dd3679e97492c68834b2dd', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 10, '145', 'matematica', 'dificil', 'Em um estudo realizado pelo IBGE... observou-se que a leitura ocupa em média 6 minutos diários... Faixas etárias: 10 a 24 anos (3 min), 24 a 60 anos (5 min), 60+ anos (12 min). Distribuição percentual dos entrevistados: x, y, x.
Disponível em: www.oglobo.globo.com. Acesso em: 16 ago. 2013 (adaptado).', 'Os valores de x e y do quadro são, respectivamente, iguais a', '[{"letra": "A", "texto": "10 e 80."}, {"letra": "B", "texto": "10 e 90."}, {"letra": "C", "texto": "20 e 60."}, {"letra": "D", "texto": "20 e 80."}, {"letra": "E", "texto": "25 e 50."}]', 'C', 'Montando a equação da média ponderada global com base nos percentuais x e y (onde 2x + y = 100%), encontra-se x = 20 e y = 60.', NULL, NULL, 'resumida', TRUE, FALSE, 'ee09825c6107a964388729ea4b1d27a4da07d2637678aeea04b1bcdec0d2dda4', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Geral e Inorgânica', 2021, '2º dia', 'INEP', 11, '101', NULL, 'dificil', 'A obtenção de etanol utilizando a cana-de-açúcar envolve a fermentação dos monossacarídeos formadores da sacarose contida no melaço. Um desses formadores é a glicose (C6H12O6), cuja fermentação produz cerca de 50 g de etanol a partir de 100 g de glicose, conforme a equação química descrita: C6H12O6 -> 2 CH3CH2OH + 2 CO2. Em uma condição específica de fermentação, obtém-se 80% de conversão em etanol que, após sua purificação, apresenta densidade igual a 0,80 g/mL. O melaço utilizado apresentou 50 kg de monossacarídeos na forma de glicose.', 'O volume de etanol, em litro, obtido nesse processo é mais próximo de', '[{"letra": "A", "texto": "16."}, {"letra": "B", "texto": "20."}, {"letra": "C", "texto": "25."}, {"letra": "D", "texto": "64."}, {"letra": "E", "texto": "100."}]', 'C', '50 kg de glicose geram estequiometricamente 25 kg de etanol a 100%. Com conversão de 80% e densidade de 0,80 g/mL, o volume obtido é de 25 litros.', NULL, NULL, 'resumida', TRUE, FALSE, '1841a7f7a171d4a5e46df88bccf0533650f26cdfaa8ac837b9fa937a7beffee2', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 11, '146', 'matematica', 'medio', 'Um zootecnista pretende testar se uma nova ração para coelhos é mais eficiente... Ração atual: massa média de 10 kg, desvio padrão de 1 kg. Nova ração: desvio padrão de 1,5 kg. Utiliza-se o coeficiente de variação CV = s / \bar{X}.', 'A substituição da ração ocorrerá se a média da distribuição das massas dos coelhos da amostra, em quilograma, for superior a', '[{"letra": "A", "texto": "5,0."}, {"letra": "B", "texto": "9,5."}, {"letra": "C", "texto": "10,0."}, {"letra": "D", "texto": "10,5."}, {"letra": "E", "texto": "15,0."}]', 'E', 'Para que a nova ração tenha coeficiente de variação menor que a atual (0,1), com desvio padrão de 1,5, a média de massa deve ser superior a 15,0 kg.', NULL, NULL, 'resumida', TRUE, FALSE, 'dc32cd82c62b1de74aa1499f5ac694ff0068f252dca28c7d5cffb3639d5ebfe0', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 12, '102', NULL, 'dificil', 'É possível ligar aparelhos elétricos de baixa corrente utilizando materiais comuns de laboratório no lugar das tradicionais pilhas. A ilustração apresenta uma montagem que faz funcionar um cronômetro digital com soluções de CuSO4 e ZnSO4, papel umedecido com Na2SO4 e eletrodos de Cu e Zn.', 'Utilizando a representação de projetos elétricos, o circuito equivalente a esse sistema é', '[{"letra": "A", "texto": "[Esquema A]"}, {"letra": "B", "texto": "[Esquema B]"}, {"letra": "C", "texto": "[Esquema C]"}, {"letra": "D", "texto": "[Esquema D]"}, {"letra": "E", "texto": "[Esquema E]"}]', 'A', 'O sistema de pilhas associadas em série gera a ddp necessária para alimentar o cronômetro, representada eletricamente no esquema A.', NULL, NULL, 'resumida', FALSE, FALSE, '3fd0e08a3cbb30e88ee0f28933652fda1feb7ca52f1c90f012253a3497f6d0b7', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matrizes e Sistemas Lineares', 2021, '2º dia', 'INEP', 12, '147', 'matematica', 'dificil', 'A Cifra de César é um exemplo de método de codificação... Cada letra trocada por outra um número fixo de casas adiante (três posições à frente). Gráfico de frequências do romance O guarani, de José de Alencar.
Disponível em: www.dominiopublico.gov.br. Acesso em: 7 fev. 2015.', 'Após codificar esse texto com a regra do exemplo fornecido, faz-se nova análise de frequência no texto codificado. As quatro letras mais frequentes, em ordem decrescente de frequência, do texto codificado são', '[{"letra": "A", "texto": "A, E, O e S."}, {"letra": "B", "texto": "D, E, F e G."}, {"letra": "C", "texto": "D, H, R e V."}, {"letra": "D", "texto": "R, L, B e X."}, {"letra": "E", "texto": "X, B, L e P."}]', 'C', 'A Cifra de César com deslocamento de três unidades à frente transforma as letras mais frequentes do português (A, E, O, S) em D, H, R e V.', NULL, NULL, 'resumida', TRUE, FALSE, '194439d992fcaf7556f282ed28b20c9d17616f40c80d8aaad48167d3dcb1bd56', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Geral e Inorgânica', 2021, '2º dia', 'INEP', 13, '103', NULL, 'medio', 'Um técnico analisou um lote de analgésicos que supostamente estava fora das especificações. A composição prevista era 100 mg de ácido acetilsalicílico por comprimido (princípio ativo), além do amido e da celulose (componentes inertes). O técnico realizou os seguintes testes: 1) obtenção da massa do comprimido; 2) medição da densidade do comprimido; 3) verificação do pH com papel indicador; 4) determinação da temperatura de fusão do comprimido; 5) titulação com solução aquosa de NaOH.', 'Após a realização dos testes, o lote do medicamento foi reprovado porque a quantidade de ácido acetilsalicílico por comprimido foi de apenas 40% da esperada. O teste que permitiu reprovar o lote de analgésicos foi o de número', '[{"letra": "A", "texto": "1."}, {"letra": "B", "texto": "2."}, {"letra": "C", "texto": "3."}, {"letra": "D", "texto": "4."}, {"letra": "E", "texto": "5."}]', 'E', 'A titulação ácido-base (teste 5) quantifica o teor de princípio ativo ácido (ácido acetilsalicílico) presente no comprimido, permitindo constatar que estava abaixo do esperado (40%).', NULL, NULL, 'resumida', FALSE, FALSE, '2295d75428e2e885e4eac6a2503f07cf4b527831b6e22ff0d49a8034563f9ab1', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 13, '148', 'matematica', 'facil', 'O quadro apresenta o número de terremotos de magnitude maior ou igual a 7 ocorridos entre 2000 e 2011 (15, 16, 13, 15, 16, 11, 11, 18, 12, 17, 24, 20).
Disponível em: https://earthquake.usgs.gov. Acesso em: 13 ago. 2012 (adaptado).', 'Um pesquisador acredita que a mediana representa bem o número anual típico de terremotos em um período. Segundo esse pesquisador, o número anual típico de terremotos de magnitude maior ou igual a 7 é', '[{"letra": "A", "texto": "11."}, {"letra": "B", "texto": "15."}, {"letra": "C", "texto": "15,5."}, {"letra": "D", "texto": "15,7."}, {"letra": "E", "texto": "17,5."}]', 'C', 'Ordenando os 12 valores de terremotos em ordem crescente, a mediana situa-se entre o 6º e o 7º valores (15 e 16), resultando em 15,5.', NULL, NULL, 'resumida', TRUE, FALSE, '1eb1791b7f1bbdf2c7147097887ff5e7fc1f23786f8ccb05696afbd295e3d96d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Cinemática e Dinâmica', 2021, '2º dia', 'INEP', 14, '104', NULL, 'medio', 'O rompimento da barragem de rejeitos de mineração no município mineiro de Mariana e o derramamento de produtos tóxicos nas águas do Rio Doce, ocorridos em 2015, ainda têm consequências para os organismos que habitam o Parque Nacional Marinho de Abrolhos, localizado a mais de 1000 quilômetros de distância. Esse desastre ambiental afetou o fitoplâncton, as esponjas, as algas macroscópicas, os peixes herbívoros e os golfinhos.
FRAINER, G.; SICILIANO, S.; TAVARES, D. C. Franciscana calls for help: [...]. International Whaling Commission, Conference Paper, jun. 2016 (adaptado).', 'Concentrações mais elevadas dos compostos citados são encontradas em', '[{"letra": "A", "texto": "esponjas."}, {"letra": "B", "texto": "golfinhos."}, {"letra": "C", "texto": "fitoplâncton."}, {"letra": "D", "texto": "peixes herbívoros."}, {"letra": "E", "texto": "algas macroscópicas."}]', 'B', 'Ocorre o fenômeno da biomagnificação ou magnificação trófica, onde os poluentes persistentes se acumulam em concentrações mais elevadas nos organismos situados no topo da cadeia alimentar (golfinhos).', NULL, NULL, 'resumida', FALSE, FALSE, 'e06a960dc63e2b8935b5f7c546865e964231b77d9d6f6b9bcc52b599a95d8448', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Funções e Gráficos', 2021, '2º dia', 'INEP', 14, '149', 'matematica', 'medio', 'O gráfico apresenta as receitas e despesas, em milhão de real, de uma empresa ao final dos cinco primeiros meses de um dado ano. O lucro mensal é a diferença entre receita e despesa.', 'A previsão para os próximos meses é que o lucro mensal não seja inferior ao maior lucro obtido até o mês de maio. Nessas condições, o lucro mensal para os próximos meses deve ser maior ou igual ao do mês de', '[{"letra": "A", "texto": "janeiro."}, {"letra": "B", "texto": "fevereiro."}, {"letra": "C", "texto": "março."}, {"letra": "D", "texto": "abril."}, {"letra": "E", "texto": "maio."}]', 'B', 'O maior lucro mensal ocorreu em fevereiro (receita 20 - despesa 10 = 10 milhões). Portanto, a previsão exige lucro maior ou igual a esse patamar.', NULL, '[{"titulo": "Passo 1", "conteudo": "O maior lucro mensal ocorreu em fevereiro (receita 20 - despesa 10 = 10 milhões).", "formula": null}, {"titulo": "Conclusão", "conteudo": "Portanto, a previsão exige lucro maior ou igual a esse patamar.", "formula": null}]', 'automatica', TRUE, FALSE, '43401489d7c2dcd406ccf9e611cc04ceeaf3ce710a803d7366ea9aff6507560b', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletromagnetismo', 2021, '2º dia', 'INEP', 15, '105', NULL, 'dificil', 'Duas esferas carregadas com cargas iguais em módulo e sinais contrários estão ligadas por uma haste rígida isolante na forma de haltere. O sistema se movimenta sob ação da gravidade numa região que tem um campo magnético horizontal uniforme (\vec{B}), da esquerda para a direita.', 'Visto de cima, o diagrama esquemático das forças magnéticas que atuam no sistema, no momento inicial em que as cargas penetram na região de campo magnético, está representado em', '[{"letra": "A", "texto": "[Diagrama A]"}, {"letra": "B", "texto": "[Diagrama B]"}, {"letra": "C", "texto": "[Diagrama C]"}, {"letra": "D", "texto": "[Diagrama D]"}, {"letra": "E", "texto": "[Diagrama E]"}]', 'B', 'Pela força de Lorentz (F = q(\vec{v} \times \vec{B})), as cargas de sinais opostos sofrem forças magnéticas em direções específicas ao penetrarem no campo magnético uniforme.', NULL, NULL, 'resumida', TRUE, FALSE, '252bf502f4e5a4ae103c225cd54d13a4de16c52f1a54d35f68c74b015c6a360d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 15, '150', 'matematica', 'medio', 'Com o aumento gradativo de casos de depressão, a venda desses medicamentos está em crescente evolução, conforme ilustra o gráfico (vendas de 2005 a 2009: 236 a 519,2 milhões).
Veja, 10 fev. 2010 (adaptado).', 'No período de 2005 a 2009, o aumento percentual no volume de vendas foi de', '[{"letra": "A", "texto": "45,4."}, {"letra": "B", "texto": "54,5."}, {"letra": "C", "texto": "120."}, {"letra": "D", "texto": "220."}, {"letra": "E", "texto": "283,2."}]', 'C', 'O aumento percentual entre 2005 (236 milhões) e 2009 (519,2 milhões) é dado por ((519,2 - 236) / 236) \times 100% = 120%.', NULL, NULL, 'resumida', TRUE, FALSE, '162b28b4cbb972aed87e3a76abbe227dc53570daaf0dda6adc35da6a490718e7', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Bioquímica e Isometria', 2021, '2º dia', 'INEP', 16, '106', NULL, 'medio', 'A icterícia, popularmente conhecida por amarelão, é uma patologia frequente em recém-nascidos. Na presença de luz, a bilirrubina é convertida no seu isômero lumirrubina que, por ser mais solúvel em água, é excretada pela bile ou pela urina.
MOREIRA, M. et al. O recém-nascido de alto risco: teoria e prática do cuidar. Rio de Janeiro: Fiocruz, 2004 (adaptado).', 'Na fototerapia, a luz provoca a conversão da bilirrubina no seu isômero', '[{"letra": "A", "texto": "óptico."}, {"letra": "B", "texto": "funcional."}, {"letra": "C", "texto": "de cadeia."}, {"letra": "D", "texto": "de posição."}, {"letra": "E", "texto": "geométrico."}]', 'E', 'A conversão da bilirrubina em lumirrubina sob ação da luz envolve a alteração da disposição espacial de grupos na cadeia carbônica, caracterizando um isômero geométrico.', NULL, NULL, 'resumida', FALSE, FALSE, '7b834aba5ac2e82c00b825539063ec5a83d45a72ab4da62de84b66f0831a7680', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Estatística e Probabilidade', 2021, '2º dia', 'INEP', 16, '151', 'matematica', 'dificil', 'Um casal está planejando comprar um apartamento de dois quartos... encontrou 105 apartamentos à venda. O gráfico ilustra a distribuição de frequências dos preços de venda (em mil reais) nas faixas ]300, 400],..., ]1200, 1300].', 'Com base no gráfico obtido, o menor preço, p (em mil reais), para o qual pelo menos 50% dos apartamentos apresenta preço inferior a p é', '[{"letra": "A", "texto": "600."}, {"letra": "B", "texto": "700."}, {"letra": "C", "texto": "800."}, {"letra": "D", "texto": "900."}, {"letra": "E", "texto": "1.000."}]', 'B', 'Somando as frequências do histograma acumulado a partir da faixa mais barata, a marca de 50% dos 105 imóveis (52,5) é ultrapassada na faixa cujo limite superior é 700 mil reais.', NULL, NULL, 'resumida', TRUE, FALSE, '9461c6bde0b21a72f98bf66f55fac6f858e302d0939734009837a6c9fba5e68a', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Cinemática e Dinâmica', 2021, '2º dia', 'INEP', 17, '107', NULL, 'dificil', 'Analisando a ficha técnica de um automóvel popular, verificam-se algumas características em relação ao seu desempenho. Considerando o mesmo automóvel em duas versões, uma delas funcionando a álcool e outra, a gasolina, tem-se os dados apresentados no quadro (Aceleração e Velocidade máxima).', 'Considerando desprezível a resistência do ar, qual versão apresenta a maior potência?', '[{"letra": "A", "texto": "Como a versão a gasolina consegue a maior aceleração, esta é a que desenvolve a maior potência."}, {"letra": "B", "texto": "Como a versão a gasolina atinge o maior valor de energia cinética, esta é a que desenvolve a maior potência."}, {"letra": "C", "texto": "Como a versão a álcool apresenta a maior taxa de variação de energia cinética, esta é a que desenvolve a maior potência."}, {"letra": "D", "texto": "Como ambas as versões apresentam a mesma variação de velocidade no cálculo da aceleração, a potência desenvolvida é a mesma."}, {"letra": "E", "texto": "Como a versão a gasolina fica com o motor trabalhando por mais tempo para atingir os 100 km/h, esta é a que desenvolve a maior potência."}]', 'C', 'Potência é a taxa de variação da energia no tempo. Como a versão a álcool atinge a mesma variação de velocidade em menor intervalo de tempo (12,9 s contra 13,4 s), sua taxa de variação da energia cinética é maior.', NULL, '[{"titulo": "Passo 1", "conteudo": "Potência é a taxa de variação da energia no tempo.", "formula": null}, {"titulo": "O que o enunciado dá", "conteudo": "Como a versão a álcool atinge a mesma variação de velocidade em menor intervalo de tempo (12,9 s contra 13,4 s), sua taxa de variação da energia cinética é maior.", "formula": null}]', 'automatica', TRUE, FALSE, '3bfec69ae8e5d37f3a8f98c611b74d2f2de8f02e8549e0c43d8c17a28c15015c', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Álgebra e Sequências', 2021, '2º dia', 'INEP', 17, '152', 'matematica', 'dificil', 'Para a comunicação entre dois navios é utilizado um sistema de codificação... operações triângulo (\Delta) e estrela (*) definidas por x \Delta y = x^2 + xy - y^2 e x * y = xy + x. O navio fornece valor de entrada b, gerando saída dada pela soma das duas maiores soluções da equação (a \Delta b) * (b \Delta a) = 0.', 'Um navio deseja enviar ao outro a mensagem "ATENÇÃO!". Para isso, deve utilizar o valor de entrada b = 1. Dessa forma, o valor recebido pelo navio receptor será', '[{"letra": "A", "texto": "\\sqrt{5}"}, {"letra": "B", "texto": "\\sqrt{3}"}, {"letra": "C", "texto": "\\frac{-1 + \\sqrt{5}}{2}"}, {"letra": "D", "texto": "\\frac{3 + \\sqrt{5}}{2}"}, {"letra": "E", "texto": "1"}]', 'C', 'Substituindo b = 1 nas operações definidas e resolvendo a equação resultante (a \Delta 1) * (1 \Delta a) = 0, obtém-se a raiz correspondente (-1 + \sqrt{5})/2.', NULL, NULL, 'resumida', TRUE, FALSE, '246e234703127a380793decf80c638c4b4e839f3d4b15d614e0a7645086bc372', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Astronomia e Astrofísica', 2021, '2º dia', 'INEP', 18, '108', NULL, 'medio', 'TEXTO I: No cordel intitulado Senhor dos Anéis, de autoria de Gonçalo Ferreira da Silva, lê-se a sextilha sobre a distância ao Sol e densidade menor que a água.
TEXTO II: Tabela com distâncias médias dos planetas ao Sol e suas densidades relativas médias.', 'Considerando os versos da sextilha e as informações da tabela, a qual planeta o cordel faz referência?', '[{"letra": "A", "texto": "Mercúrio."}, {"letra": "B", "texto": "Júpiter."}, {"letra": "C", "texto": "Urano."}, {"letra": "D", "texto": "Saturno."}, {"letra": "E", "texto": "Netuno."}]', 'D', 'A descrição poética menciona densidade menor que a água e distância compatível com os dados da tabela para Saturno (densidade relativa 0,7 g/cm³).', NULL, NULL, 'resumida', FALSE, FALSE, 'e6956f95c7e9ee371e3189ae3ee168af7754fd64d2efaed199ffbcbf83b05e2c', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial', 2021, '2º dia', 'INEP', 18, '153', 'matematica', 'facil', 'Um parque temático brasileiro construiu uma réplica em miniatura do castelo de Liechtenstein (Alemanha). A ponte tem 38,4 m de comprimento e 1,68 m de largura. Na réplica, as medidas eram 160 cm e 7 cm.', 'A escala utilizada para fazer a réplica é', '[{"letra": "A", "texto": "1:576"}, {"letra": "B", "texto": "1:240"}, {"letra": "C", "texto": "1:24"}, {"letra": "D", "texto": "1:4,2"}, {"letra": "E", "texto": "1:2,4"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'b9e2d73e792dcba90c761f1f81f5a74dafc148a2fc77a143a5ff83bbf694e4aa', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 19, '109', NULL, 'medio', 'Cientistas da Universidade de New South Wales, na Austrália, demonstraram em 2012 que a Lei de Ohm é válida mesmo para fios finíssimos, cuja área da seção reta compreende alguns poucos átomos. A tabela apresenta as áreas e comprimentos de alguns dos fios construídos.
WEBER, S. B. et al. Ohm''s Law Survives to the Atomic Scale. Science, n. 335, jan. 2012 (adaptado).', 'As resistências elétricas dos fios, em ordem crescente, são', '[{"letra": "A", "texto": "R1 < R2 < R3 < R4"}, {"letra": "B", "texto": "R2 < R1 < R3 < R4"}, {"letra": "C", "texto": "R2 < R3 < R1 < R4"}, {"letra": "D", "texto": "R4 < R1 < R3 < R2"}, {"letra": "E", "texto": "R4 < R3 < R2 < R1"}]', 'E', 'A resistência elétrica é diretamente proporcional ao comprimento e inversamente proporcional à área (R = \rho L / A). Calculando para cada fio, a ordem crescente resulta em R4 < R3 < R2 < R1.', NULL, '[{"titulo": "Passo 1", "conteudo": "A resistência elétrica é diretamente proporcional ao comprimento e inversamente proporcional à área (R = \\rho L / A).", "formula": null}, {"titulo": "Fazendo a conta", "conteudo": "Calculando para cada fio, a ordem crescente resulta em R4 < R3 < R2 < R1.", "formula": null}]', 'automatica', TRUE, FALSE, '5ed9d8a848c8a339c5b4ba612ffcedfd880d78eed4d21f4eed2e5c4c421571ff', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matrizes e Sistemas Lineares', 2021, '2º dia', 'INEP', 19, '154', 'matematica', 'medio', 'A demografia médica é o estudo da população de médicos... Quadro com evolução do número de médicos e da população brasileira (1990, 2000, 2010). Projeção estatística baseada na média das variações das décadas anteriores para 2020.
Disponível em: www.cremesp.org.br. Acesso em: 24 jun. 2015 (adaptado).', 'O número, com duas casas na parte decimal, mais próximo do número de médicos por mil habitantes no ano de 2020 seria de', '[{"letra": "A", "texto": "0,17."}, {"letra": "B", "texto": "0,49."}, {"letra": "C", "texto": "1,71."}, {"letra": "D", "texto": "2,06."}, {"letra": "E", "texto": "3,32."}]', 'D', 'Aplicando a projeção linear para 2020 (438 mil médicos e 213 milhões de habitantes), obtém-se a razão de aproximadamente 2,06 médicos por mil habitantes.', NULL, NULL, 'resumida', TRUE, FALSE, '5397b193b41027732f8aad65afffbccc4f4e8ce36acad433b40e7b354047ac03', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Bioquímica e Isometria', 2021, '2º dia', 'INEP', 20, '110', NULL, 'facil', 'Organismos autótrofos e heterótrofos realizam processos complementares que associam os ciclos do carbono e do oxigênio. O carbono fixado pela energia luminosa ou a partir de compostos inorgânicos é eventualmente degradado pelos organismos, resultando em fontes de carbono como metano ou gás carbônico.', 'O processo metabólico associado à expressão combustíveis ambientais é a', '[{"letra": "A", "texto": "fotossíntese."}, {"letra": "B", "texto": "fermentação."}, {"letra": "C", "texto": "quimiossíntese."}, {"letra": "D", "texto": "respiração aeróbica."}, {"letra": "E", "texto": "fosforilação oxidativa."}]', 'B', 'O catabolismo de compostos orgânicos com menor rendimento energético que produz subprodutos combustíveis ambientais refere-se à fermentação.', NULL, NULL, 'resumida', FALSE, FALSE, '3dff723ae3c0874c8e5fd25dffeda7d011aa317588cbcbd78953691dd1e3c9cd', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 20, '155', 'matematica', 'medio', 'Um atleta produz sua própria refeição com custo fixo de R$ 10,00 (400g frango, 600g batata-doce, hortaliça). Preços: Frango R$ 12,50/kg, Batata-doce R$ 5,00/kg, Hortaliça R$ 2,00. Haverá aumento de 50% na batata-doce, mantendo custo da refeição, quantidade de batata-doce e hortaliça.', 'Qual deve ser a redução percentual da quantidade de frango para que o atleta alcance seu objetivo?', '[{"letra": "A", "texto": "12,5"}, {"letra": "B", "texto": "28,0"}, {"letra": "C", "texto": "30,0"}, {"letra": "D", "texto": "50,0"}, {"letra": "E", "texto": "70,0"}]', 'C', 'Com o aumento de 50% no preço da batata-doce, o custo desse ingrediente sobe para R$ 4,50. Para manter o custo total em R$ 10,00, a quantidade de frango deve ser reduzida em 30%.', NULL, NULL, 'resumida', TRUE, FALSE, 'c6e57b9b05149d83784ddfa230d3c5cf08c5d0bc32530640af34f65611fa750a', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Meio Ambiente e Sustentabilidade', 2021, '2º dia', 'INEP', 21, '111', NULL, 'facil', 'Uma escola iniciou o processo educativo para implantação da coleta seletiva e destino de materiais recicláveis, planejando sensibilizar a comunidade, capacitar pessoal de limpeza e distribuir coletores.', 'Para completar a ação proposta no ambiente escolar, o que falta ser inserido no planejamento?', '[{"letra": "A", "texto": "Realizar campanhas educativas de sensibilização em bairros vizinhos para fortalecer a coleta seletiva."}, {"letra": "B", "texto": "Firmar parceria com a prefeitura ou cooperativa de catadores para recolhimento dos materiais recicláveis e destinação apropriada."}, {"letra": "C", "texto": "Organizar visitas ao lixão ou aterro local para identificar aspectos importantes sobre a disposição final do lixo."}, {"letra": "D", "texto": "Divulgar na rádio local, no jornal impresso e nas redes sociais que a escola está realizando a coleta seletiva."}, {"letra": "E", "texto": "Colocar recipientes coletores de lixo reciclável fora da escola para entrega voluntária pela população."}]', 'B', NULL, NULL, NULL, 'pendente', FALSE, FALSE, '3e86ebba65fa10ff48e07f9cdac6089c15fbd921e277e2a4626b5afb1d2a8016', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Álgebra e Sequências', 2021, '2º dia', 'INEP', 21, '156', 'matematica', 'dificil', 'Uma mola é solta da posição distendida. O gráfico representa a posição P (em cm) da massa m em função do tempo t (em segundo). Movimento periódico descrito por P(t) = \pm A \cos(\omega t) ou P(t) = \pm A \operatorname{sen}(\omega t).', 'A expressão algébrica que representa as posições P(t) da massa m, ao longo do tempo, no gráfico, é', '[{"letra": "A", "texto": "-3 \\cos(2t)"}, {"letra": "B", "texto": "-3 \\operatorname{sen}(2t)"}, {"letra": "C", "texto": "3 \\cos(2t)"}, {"letra": "D", "texto": "-6 \\cos(2t)"}, {"letra": "E", "texto": "6 \\operatorname{sen}(2t)"}]', 'A', 'O movimento harmônico simples com amplitude máxima 3 e deslocamento inicial em -3 no gráfico cosenoidal invertido é representado por P(t) = -3 \cos(2t).', NULL, NULL, 'resumida', TRUE, FALSE, '6eb01d823ddd82940758dcb53be26ce8348a9950f66ee589ec7e6dfaed223c53', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Genética e Biologia Molecular', 2021, '2º dia', 'INEP', 22, '112', NULL, 'medio', 'Os búfalos são animais considerados rústicos pelos criadores e, por isso, são deixados no campo sem controle reprodutivo. Por causa desse tipo de criação, a consanguinidade é favorecida, proporcionando o aparecimento de enfermidades, como o albinismo, defeitos cardíacos, entre outros.
DAME, M. C. F.; RIET-CORREA, F.; SCHILD, A. L. Pesq. Vet. Bras., n. 7, 2013 (adaptado).', 'Qual procedimento biotecnológico prévio é recomendado nessa situação?', '[{"letra": "A", "texto": "Transgenia."}, {"letra": "B", "texto": "Terapia gênica."}, {"letra": "C", "texto": "Vacina de DNA."}, {"letra": "D", "texto": "Clonagem terapêutica."}, {"letra": "E", "texto": "Mapeamento genético."}]', 'E', 'Para evitar problemas decorrentes da consanguinidade e planejar cruzamentos adequados, o mapeamento genético é o procedimento prévio recomendado.', NULL, NULL, 'resumida', FALSE, FALSE, 'e65c33a41ca6e374f0223a4e345cf6d4acb75d6c88d1f1bda0a5d622d5161dc3', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matrizes e Sistemas Lineares', 2021, '2º dia', 'INEP', 22, '157', 'matematica', 'medio', 'Uma construtora fez uma pesquisa sobre a quantidade de famílias que mudaram de uma região para outra (5 regiões). Matriz A = [a_{ij}], onde a_{ij} é o total de famílias (em dezena) que se mudaram da região i para a região j.', 'Qual região foi selecionada para o investimento da construtora?', '[{"letra": "A", "texto": "1"}, {"letra": "B", "texto": "2"}, {"letra": "C", "texto": "3"}, {"letra": "D", "texto": "4"}, {"letra": "E", "texto": "5"}]', 'D', 'Somando os valores de cada coluna da matriz de migração (fluxo de famílias que chegam a cada região), a região 4 apresenta o maior fluxo total de destino.', NULL, NULL, 'resumida', TRUE, FALSE, '0e0809a6983fc2b07318ec7b4a77621f4bfd75d9c51b718bf32ab90bde27df4c', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Geral e Inorgânica', 2021, '2º dia', 'INEP', 23, '113', NULL, 'medio', 'O ciclo do cobre é um experimento didático em que o cobre metálico é utilizado como reagente de partida. Após uma sequência de reações (I, II, III, IV e V), o cobre retorna ao seu estado inicial ao final do ciclo. (Esquema de reações com HNO3, NaOH, aquecimento, H2SO4, Zn e HCl).', 'A reação de redução do cobre ocorre na etapa', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'E', 'Na etapa V, o íon cobre em solução reage com zinco metálico, sofrendo redução (Cu2+ + 2e- -> Cu0) para retornar ao estado de cobre metálico inicial.', NULL, NULL, 'resumida', FALSE, FALSE, 'e1c9d905f218006a07574da7169d601cd367dcdcd0994c88d390b85dea1b68cf', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 23, '158', 'matematica', 'medio', 'Para realizar um voo entre duas cidades que distam 2 000 km, uma companhia usava aeronave A (200 passageiros, consumo 0,02 L/km por passageiro). Trocou pelo modelo B (10% a mais de passageiros, consumo 10% menor por km por passageiro).', 'A quantidade de combustível consumida pelo modelo de aeronave B, em relação à do modelo de aeronave A, em um voo lotado entre as duas cidades, é', '[{"letra": "A", "texto": "10% menor."}, {"letra": "B", "texto": "1% menor."}, {"letra": "C", "texto": "igual."}, {"letra": "D", "texto": "1% maior."}, {"letra": "E", "texto": "11% maior."}]', 'B', 'O consumo total da nova aeronave B (220 passageiros \times 2000 km \times 0,018 L/km) é de 7920 litros, o que representa uma redução de 1% em relação aos 8000 litros da aeronave A.', NULL, NULL, 'resumida', TRUE, FALSE, '7b318d354bd3bdf9b9c9f032e495f48ee068e28cc3400058db66d1f8957f4ff1', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Fisiologia Humana e Comparada', 2021, '2º dia', 'INEP', 24, '114', NULL, 'facil', 'Um dos exames clínicos mais tradicionais para medir a capacidade reflexa dos indivíduos é o exame do reflexo patelar. Este exame consiste na estimulação da patela, um pequeno osso localizado na parte anterior da articulação do joelho, com um pequeno martelo.', 'Qual região específica do sistema nervoso coordena essa resposta?', '[{"letra": "A", "texto": "Ponte."}, {"letra": "B", "texto": "Medula."}, {"letra": "C", "texto": "Cerebelo."}, {"letra": "D", "texto": "Hipotálamo."}, {"letra": "E", "texto": "Neuro-hipófise."}]', 'B', 'O reflexo patelar é um arco reflexo medular simples, coordenado diretamente pela medula espinhal sem envolvimento inicial do encéfalo.', NULL, NULL, 'resumida', FALSE, FALSE, '40ebd3ef9b8d00bfcc38a5950678e1609e327fd7471972544cf78b516822125e', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matrizes e Sistemas Lineares', 2021, '2º dia', 'INEP', 24, '159', 'matematica', 'medio', 'Em uma corrida automobilística, troca de pneus feita por grupo de 3 pessoas em cada pneu. 4 segundos para a troca com 4 grupos completos. O tempo é inversamente proporcional ao número de pessoas. Um trabalhador passou mal e um grupo ficou reduzido.', 'Nessa parada específica, com um dos grupos reduzido, qual foi o tempo gasto, em segundo, para trocar os quatro pneus?', '[{"letra": "A", "texto": "6,0"}, {"letra": "B", "texto": "5,7"}, {"letra": "C", "texto": "5,0"}, {"letra": "D", "texto": "4,5"}, {"letra": "E", "texto": "4,4"}]', 'A', 'Com um grupo reduzido a 2 pessoas, o tempo de troca desse grupo sobe para 6,0 segundos. Como os grupos atuam em paralelo, o tempo total da operação é determinado pelo grupo mais lento (6,0 s).', NULL, '[{"titulo": "Passo 1", "conteudo": "Com um grupo reduzido a 2 pessoas, o tempo de troca desse grupo sobe para 6,0 segundos.", "formula": null}, {"titulo": "O que o enunciado dá", "conteudo": "Como os grupos atuam em paralelo, o tempo total da operação é determinado pelo grupo mais lento (6,0 s).", "formula": null}]', 'automatica', TRUE, FALSE, '301a73f513dd8a01dbe6dc0f38ba088b8aa9c330ab3e22104fff30cd67ae1d82', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Termodinâmica e Calorimetria', 2021, '2º dia', 'INEP', 25, '115', NULL, 'dificil', 'Na montagem de uma cozinha para um restaurante, a escolha do material correto para as panelas é importante... A taxa de condução depende da condutividade k, área A, diferença de temperatura e espessura d. Compara-se uma panela de ferro, uma de alumínio e uma composta de 1/2 de cobre e 1/2 de aço.', 'A ordem crescente da mais econômica para a menos econômica é', '[{"letra": "A", "texto": "cobre-aço, alumínio e ferro."}, {"letra": "B", "texto": "alumínio, cobre-aço e ferro."}, {"letra": "C", "texto": "cobre-aço, ferro e alumínio."}, {"letra": "D", "texto": "alumínio, ferro e cobre-aço."}, {"letra": "E", "texto": "ferro, alumínio e cobre-aço."}]', 'A', 'A taxa de condução térmica depende da condutividade. A panela composta de cobre (alta condutividade) combinada com aço apresenta excelente eficiência, sendo a mais econômica.', NULL, NULL, 'resumida', FALSE, FALSE, '6797eae213fb8aa527ca8eb78872ec5df917d7fd5757dac44c069c77cb9badf9', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matrizes e Sistemas Lineares', 2021, '2º dia', 'INEP', 25, '160', 'matematica', 'dificil', 'Um nutricionista verificou falta de 800 mg do mineral A, 1 000 mg do B e 1 200 mg do C. Cinco suplementos em sachês com preços e quantidades de minerais informados.', 'Nessas condições, o cliente deverá comprar sachês do suplemento', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'B', 'O Suplemento II fornece quantidades suficientes de todos os minerais necessários com o menor custo total (6 sachês a R$ 3,00 = R$ 18,00).', NULL, NULL, 'resumida', TRUE, FALSE, '2f265f02ed0187b29108240b2557ef0570274cad3856a8f394cce2882f7a61c7', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Geral e Inorgânica', 2021, '2º dia', 'INEP', 26, '116', NULL, 'dificil', 'As águas subterrâneas têm sido contaminadas pelo uso de pesticidas na agricultura. Entre várias substâncias apresentadas na figura (I, II, III, IV, V), o hidróxido de sódio é capaz de identificar a presença de um desses pesticidas pela reação ácido-base de Brönsted-Lowry.', 'O teste positivo será observado com o pesticida', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'C', 'O hidróxido de sódio reage com compostos de caráter ácido (como fenóis ou ácidos carboxílicos). O pesticida III possui hidroxilas fenólicas que reagem via Brönsted-Lowry.', NULL, NULL, 'resumida', FALSE, FALSE, 'e1b9200aacf162c8bb70413040d583ff08742826929717176e6d7980dcb69c3e', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Funções e Gráficos', 2021, '2º dia', 'INEP', 26, '161', 'matematica', 'medio', 'O administrador de um teatro percebeu que com ingresso a R$ 20,00 atraía 200 pessoas e que a cada R$ 1,00 de redução, o público aumentava em 40. Ele apresentará um gráfico da arrecadação em função do valor do desconto.', 'O gráfico que mais se assemelha ao que deve ser elaborado pelo administrador é', '[{"letra": "A", "texto": "[Gráfico A]"}, {"letra": "B", "texto": "[Gráfico B]"}, {"letra": "C", "texto": "[Gráfico C]"}, {"letra": "D", "texto": "[Gráfico D]"}, {"letra": "E", "texto": "[Gráfico E]"}]', 'C', 'A função que relaciona a arrecadação com o desconto no ingresso é uma função quadrática com concavidade voltada para baixo, graficamente representada por uma parábola.', NULL, NULL, 'resumida', TRUE, FALSE, 'cedd4948399c91ec35788c9727975cf19c2b368e889c5dcf3887c0676e734dc5', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Meio Ambiente e Sustentabilidade', 2021, '2º dia', 'INEP', 27, '117', NULL, 'facil', 'Com o aumento da população de suínos no Brasil, torna-se necessária a adoção de métodos para reduzir o potencial poluidor dos resíduos dessa agroindústria... A utilização desses resíduos como matéria-prima na obtenção de combustíveis é uma alternativa.
BECK, A. M. Resíduos suínos como alternativa energética sustentável. XXVII ENEGEP, 2007 (adaptado).', 'O biocombustível a que se refere o texto é o', '[{"letra": "A", "texto": "etanol."}, {"letra": "B", "texto": "biogás."}, {"letra": "C", "texto": "butano."}, {"letra": "D", "texto": "metanol."}, {"letra": "E", "texto": "biodiesel."}]', 'B', 'Dejetos suínos ricos em matéria orgânica são excelentes substratos para digestão anaeróbica, produzindo biogás como alternativa energética sustentável.', NULL, NULL, 'resumida', FALSE, FALSE, 'd2ba5796c52f8802b82c9351ea236550578f137e4c3fa2e437c3598984c969e6', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Funções e Gráficos', 2021, '2º dia', 'INEP', 27, '162', 'matematica', 'medio', 'O quadro representa a relação entre o preço de um produto (R) e seu respectivo imposto devido (I) (isento até 5000; 10% de (R-5000) até 10000; 500 + 30% de (R-10000) até 15000).', 'O gráfico que melhor representa essa relação é', '[{"letra": "A", "texto": "[Gráfico A]"}, {"letra": "B", "texto": "[Gráfico B]"}, {"letra": "C", "texto": "[Gráfico C]"}, {"letra": "D", "texto": "[Gráfico D]"}, {"letra": "E", "texto": "[Gráfico E]"}]', 'B', 'As faixas de imposto progressivo por faixas de preço formam um gráfico composto por segmentos de reta com inclinações crescentes (função afim por partes).', NULL, NULL, 'resumida', TRUE, FALSE, '48148e54961c68f8b5f6b546210aafbba10f1b0d2cc5a86d175e12fde5a6f100', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Bioquímica e Isometria', 2021, '2º dia', 'INEP', 28, '118', NULL, 'medio', 'A curcumina, uma das substâncias que confere a cor alaranjada ao açafrão, pode auxiliar no combate à dengue quando adicionada à água de criadouros do mosquito transmissor. Essa substância acumula-se no intestino do inseto e induz a produção de espécies reativas de oxigênio quando ativada pela luz.
TOLEDO, K. Corante extraído do açafrão pode ser útil no combate à dengue. Disponível em: http://agencia.fapesp.br. Acesso em: 25 abr. 2015 (adaptado).', 'A forma de combate relatada tem como atividade o(a)', '[{"letra": "A", "texto": "morte do indivíduo adulto."}, {"letra": "B", "texto": "redução da eclosão dos ovos."}, {"letra": "C", "texto": "comprometimento da metamorfose."}, {"letra": "D", "texto": "impedimento do desenvolvimento da larva."}, {"letra": "E", "texto": "repelência da forma transmissora da doença."}]', 'D', 'A ativação da curcumina pela luz gera espécies reativas que danificam o tubo digestório das larvas, impedindo seu desenvolvimento nos criadouros.', NULL, NULL, 'resumida', FALSE, FALSE, 'f6e7ad1110c7e0b849c2b26aa5b7b13f6aab785a49c1f27e195ee66d629442db', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Grandezas e Análise Dimensional', 2021, '2º dia', 'INEP', 28, '163', 'matematica', 'medio', 'A relação de Newton-Laplace estabelece que o módulo volumétrico de um fluido é diretamente proporcional ao quadrado da velocidade do som e à sua densidade, com constante adimensional.', 'Nessa relação, a unidade de medida adequada para o módulo volumétrico é', '[{"letra": "A", "texto": "kg \\cdot m^{-2} \\cdot s^{-1}"}, {"letra": "B", "texto": "kg \\cdot m^{-1} \\cdot s^{-2}"}, {"letra": "C", "texto": "kg \\cdot m^{-5} \\cdot s^2"}, {"letra": "D", "texto": "kg^{-1} \\cdot m^1 \\cdot s^2"}, {"letra": "E", "texto": "kg^{-1} \\cdot m^5 \\cdot s^{-2}"}]', 'B', 'Analisando as dimensões físicas da velocidade ([m \cdot s^{-1}] \to [m^2 \cdot s^{-2}]) e da densidade ([kg \cdot m^{-3}]), o produto resulta em kg \cdot m^{-1} \cdot s^{-2}.', NULL, NULL, 'resumida', TRUE, FALSE, '1461e6affb8d1de19f987ca2e99d1794eeea9a145503e2842167b350cb3e3f93', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Botânica e Anatomia Vegetal', 2021, '2º dia', 'INEP', 29, '119', NULL, 'medio', 'Com o objetivo de identificar a melhor espécie produtora de madeira para construção (com resistência mecânica e à degradação), foram analisadas as estruturas anatômicas de cinco espécies, conforme o quadro.', 'Qual espécie corresponde ao objetivo proposto?', '[{"letra": "A", "texto": "1"}, {"letra": "B", "texto": "2"}, {"letra": "C", "texto": "3"}, {"letra": "D", "texto": "4"}, {"letra": "E", "texto": "5"}]', 'E', 'A espécie 5 apresenta grande quantidade de xerne e alburno estruturado adequado conforme os critérios exigidos para madeira de construção resistente.', NULL, NULL, 'resumida', FALSE, FALSE, 'a7f82e9ace7e138779f728766402d6dcec77c0897c18df4a4ae520968b14bb5c', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matrizes e Sistemas Lineares', 2021, '2º dia', 'INEP', 29, '164', 'matematica', 'medio', 'Uma pessoa pretende viajar despachando mala com até 10 kg. Duas viagens com combinações: Viagem 1 (12 camisas, 4 calças, 3 sapatos = 10 kg); Viagem 2 (18 camisas, 3 calças, 2 sapatos = 10 kg).', 'Para ter certeza de que sua bagagem terá massa de 10 kg, ela decide levar essa mala com duas calças, um sapato e o máximo de camisetas. Qual a quantidade máxima de camisetas?', '[{"letra": "A", "texto": "22"}, {"letra": "B", "texto": "24"}, {"letra": "C", "texto": "26"}, {"letra": "D", "texto": "33"}, {"letra": "E", "texto": "39"}]', 'B', 'Resolvendo o sistema linear formado pelas duas viagens, obtém-se a massa unitária de cada item, permitindo calcular o número máximo de 24 camisetas para totalizar 10 kg.', NULL, NULL, 'resumida', TRUE, FALSE, '3099d43b85ea4aabfaa814e19abedaf4a2ec8c3164c36fa9b6a6e3cffbeb2864', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Óptica e Espectroscopia', 2021, '2º dia', 'INEP', 30, '120', NULL, 'medio', 'No outono, as folhas das árvores mudam de cor... Conforme apresentado no espectro de absorção, as moléculas de clorofila absorvem a radiação solar nas regiões do azul e do vermelho. Já as antocianinas absorvem a luz desde o azul até o verde.
Disponível em: https://vidauniversoydemas.wordpress.com. Acesso em: 6 dez. 2017 (adaptado).', 'Em qual faixa do espectro visível os carotenos absorvem majoritariamente?', '[{"letra": "A", "texto": "Entre o violeta e o azul."}, {"letra": "B", "texto": "Entre o azul e o verde."}, {"letra": "C", "texto": "Entre o verde e o amarelo."}, {"letra": "D", "texto": "Entre o amarelo e o laranja."}, {"letra": "E", "texto": "Entre o laranja e o vermelho."}]', 'A', 'Conforme o espectro de absorção e cores complementares, os carotenos absorvem majoritariamente nas regiões do violeta e azul.', NULL, NULL, 'resumida', FALSE, FALSE, 'a2e7b53012865c95e1879228ccae40b05e7e570a446f44ea3c516b3f620170b9', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Grandezas e Análise Dimensional', 2021, '2º dia', 'INEP', 30, '165', 'matematica', 'medio', 'Um automóvel apresenta desempenho médio de 16 km/L. Um engenheiro desenvolveu um novo motor que economiza 0,1 L de combustível a cada 20 km percorridos.', 'O valor do desempenho médio do automóvel com o novo motor, em quilômetro por litro, expresso com uma casa decimal, é', '[{"letra": "A", "texto": "15,9."}, {"letra": "B", "texto": "16,1."}, {"letra": "C", "texto": "16,4."}, {"letra": "D", "texto": "17,4."}, {"letra": "E", "texto": "18,0."}]', 'D', 'O novo motor gasta 1,15 L para percorrer 20 km, o que resulta em um novo desempenho médio de 20 / 1,15 \approx 17,4 km/L.', NULL, NULL, 'resumida', TRUE, FALSE, 'e08ef8b97194340c9850907d6295cfec68ab376ff39eb8602adae6a004570200', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Evolução e Biologia Evolutiva', 2021, '2º dia', 'INEP', 31, '121', NULL, 'dificil', 'Entre 2014 e 2016, as regiões central e oeste da África sofreram uma grave epidemia de febre hemorrágica causada pelo vírus ebola... Em regiões de clima tropical e subtropical, um outro vírus também pode causar febre hemorrágica: o vírus da dengue...
Disponível em: www.who.int. Acesso em: 1 fev. 2017 (adaptado).', 'Segundo as informações do texto e aplicando princípios de evolução biológica às relações do tipo patógeno-hospedeiro, qual dos dois vírus infecta seres humanos há mais tempo?', '[{"letra": "A", "texto": "Ebola, pois o maior período de incubação reflete duração mais longa do processo de coevolução patógeno-hospedeiro."}, {"letra": "B", "texto": "Dengue, pois o menor período de incubação reflete duração mais longa do processo de coevolução patógeno-hospedeiro."}, {"letra": "C", "texto": "Ebola, cuja alta letalidade indica maior eficiência do vírus em parasitar seus hospedeiros, estabelecida ao longo de sua evolução."}, {"letra": "D", "texto": "Ebola, cujos surtos epidêmicos concentram-se no continente africano, reconhecido como berço da origem evolutiva dos seres humanos."}, {"letra": "E", "texto": "Dengue, cuja baixa letalidade indica maior eficiência do vírus em parasitar seus hospedeiros, estabelecida ao longo da coevolução patógeno-hospedeiro."}]', 'E', 'A baixa letalidade associada à coevolução prolongada entre patógeno e hospedeiro indica que o vírus da dengue parasita humanos há mais tempo que o ebola.', NULL, NULL, 'resumida', FALSE, FALSE, '4d335a19ded165a2ffbe85e8b535f30a33382ebdef567ada649bbdd6867e3e02', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial', 2021, '2º dia', 'INEP', 31, '166', 'matematica', 'medio', 'O projeto de um contêiner em forma de paralelepípedo previa pintura interna e externa das 4 paredes e piso interno. Alterou-se o comprimento e a largura para o dobro, mantendo a altura. Cinco fornecedores deram orçamentos.', 'Qual dos fornecedores prestou as informações adequadas, devendo ser o escolhido pelo construtor?', '[{"letra": "A", "texto": "I"}, {"letra": "B", "texto": "II"}, {"letra": "C", "texto": "III"}, {"letra": "D", "texto": "IV"}, {"letra": "E", "texto": "V"}]', 'B', 'Duplicando o comprimento e a largura, a área lateral (paredes) dobra (multiplica por 2) e a área da base (piso) quadruplica (multiplica por 4), correspondendo à resposta do Fornecedor II.', NULL, NULL, 'resumida', TRUE, FALSE, '0ec49ece9c87084ea33b020f8ccc54e3caab9e1f46d1be1fd6ed525821c73f78', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Genética e Biologia Molecular', 2021, '2º dia', 'INEP', 32, '122', NULL, 'facil', 'A imagem apresenta as etapas do funcionamento de uma estação individual para tratamento do esgoto residencial (1: Caixa de gordura, 2: Caixa de passagem, 3: Tanque séptico, 4: Caixa de inspeção, 5: Filtro biológico, 6: Cisternas).
TAVARES, K. Estações de tratamento de esgoto individuais permitem a reutilização da água. Disponível em: https://extra.globo.com. Acesso em: 18 nov. 2014 (adaptado).', 'Em qual etapa decanta-se o lodo a ser separado do esgoto residencial?', '[{"letra": "A", "texto": "1"}, {"letra": "B", "texto": "2"}, {"letra": "C", "texto": "3"}, {"letra": "D", "texto": "5"}, {"letra": "E", "texto": "6"}]', 'C', 'No tanque séptico (etapa 3), o esgoto permanece em repouso por período prolongado, permitindo a sedimentação e decantação do lodo.', NULL, NULL, 'resumida', FALSE, FALSE, '7290f1d5da157f7171f2b71e692a709e64a05ba23e8bc67be020ce0b176b9665', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial', 2021, '2º dia', 'INEP', 32, '167', 'matematica', 'medio', 'Um povoado com 100 habitantes precisa de um reservatório cilíndrico com base de 5 metros de diâmetro interno para atender à demanda por 7 dias (consumo médio diário de 120 litros por habitante). Use \pi = 3.', 'Nas condições apresentadas, o reservatório deverá ser construído com uma altura interna mínima, em metro, igual a', '[{"letra": "A", "texto": "1,12."}, {"letra": "B", "texto": "3,10."}, {"letra": "C", "texto": "4,35."}, {"letra": "D", "texto": "4,48."}, {"letra": "E", "texto": "5,60."}]', 'D', 'O consumo total em 7 dias para 100 pessoas é de 84.000 litros (84 m³). Com diâmetro de 5 m e \pi = 3, calcula-se a altura mínima de 4,48 metros.', NULL, NULL, 'resumida', TRUE, FALSE, '5ea94eca171585205c554eed869f465aeb50369d6f1f888c45d86d0b2f358fb4', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Botânica e Anatomia Vegetal', 2021, '2º dia', 'INEP', 33, '123', NULL, 'facil', 'O plantio por estaquia é um método de propagação de plantas no qual partes de um espécime são colocadas no solo para produzir novas gerações. Na floricultura, é comum utilizar o caule das roseiras para estaquia, pois a propagação da planta é positiva em razão da aplicação de auxinas na porção inferior do caule.', 'A utilização de auxinas no método de estaquia das roseiras contribui para', '[{"letra": "A", "texto": "floração da planta."}, {"letra": "B", "texto": "produção de gemas lateral."}, {"letra": "C", "texto": "formação de folhas maiores."}, {"letra": "D", "texto": "formação de raízes adventícias."}, {"letra": "E", "texto": "produção de compostos energéticos."}]', 'D', 'As auxinas são fitormônios que estimulam a diferenciação celular e a formação de raízes adventícias, essenciais no processo de estaquia.', NULL, NULL, 'resumida', FALSE, FALSE, '4cfe300a41395b3ce359f5a9a3b983e49e9bb948ee4d771df4df14c68f7e2953', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial', 2021, '2º dia', 'INEP', 33, '168', 'matematica', 'medio', 'Num octaedro regular, duas faces são opostas quando não têm arestas nem vértices em comum. Imagem de octaedro e planificação com face cinza escuro e 4 faces numeradas.', 'Qual(is) face(s) ficará(ão) oposta(s) à face de cor cinza escuro, quando o octaedro for reconstruído a partir da planificação dada?', '[{"letra": "A", "texto": "1, 2, 3 e 4"}, {"letra": "B", "texto": "1 e 3"}, {"letra": "C", "texto": "2"}, {"letra": "D", "texto": "3"}, {"letra": "E", "texto": "4"}]', 'E', 'Pela geometria do octaedro regular e sua respectiva planificação, a face oposta à face cinza escura corresponde à face numerada 4.', NULL, NULL, 'resumida', TRUE, FALSE, '1ec67d869ee81f43536348177bd0e2816ce426014559712e128cceff200ab96c', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 34, '124', NULL, 'medio', 'O emprego de células de combustível a hidrogênio pode ser uma tecnologia adequada ao transporte automotivo. O quadro apresenta características de cinco tecnologias (AFC, MSFC, PEM, PAFC, SOFC).
THOMAS, S.; ZALBOWITZ, M. Fuel cells: green power. Los Alamos National Laboratory, 1999 (adaptado).', 'A tecnologia testada mais adequada para o emprego em veículos automotivos é a célula de combustível', '[{"letra": "A", "texto": "AFC."}, {"letra": "B", "texto": "MSFC."}, {"letra": "C", "texto": "PEM."}, {"letra": "D", "texto": "PAFC."}, {"letra": "E", "texto": "SOFC."}]', 'C', 'As células do tipo PEM operam em baixos níveis de temperatura (60-100 °C), usam eletrólito polimérico sólido e meio ácido, sendo ideais para veículos automotivos.', NULL, NULL, 'resumida', FALSE, FALSE, '501a86a6d46018d7fb1e92dd3194c056a378501e05f65a1d3c7fc77e910d5ba3', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana', 2021, '2º dia', 'INEP', 34, '169', 'matematica', 'dificil', 'O instrumento percussão conhecido como triângulo... Peças produzidas com formato de triângulo equilátero de altura h = 8 cm. Comprimento da barra igual ao perímetro do triângulo. Use \sqrt{3} = 1,7.', 'Nessas condições, o valor que mais se aproxima da medida do comprimento da barra, em centímetro, é', '[{"letra": "A", "texto": "13,60."}, {"letra": "B", "texto": "20,40."}, {"letra": "C", "texto": "27,18."}, {"letra": "D", "texto": "36,24."}, {"letra": "E", "texto": "49,07."}]', 'C', 'A partir da altura h = 8 cm do triângulo equilátero, determina-se o lado l \approx 9,41 cm. O perímetro total (comprimento da barra) é de aproximadamente 27,18 cm.', NULL, NULL, 'resumida', TRUE, FALSE, 'dc405030f499c955ee15df7c71ca337f33013542ca1ec224d2231cc085a44b06', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Ondas e Acústica', 2021, '2º dia', 'INEP', 35, '125', NULL, 'facil', 'Considere a tirinha, na situação em que a temperatura do ambiente é inferior à temperatura corporal dos personagens (Calvin e Haroldo conversando sobre calor e umidade).
WATTERSON, B. Disponível em: https://novaescola.org.br. Acesso em: 11 ago. 2014.', 'O incômodo mencionado pelo personagem da tirinha deve-se ao fato de que, em dias úmidos,', '[{"letra": "A", "texto": "a temperatura do vapor-d''água presente no ar é alta."}, {"letra": "B", "texto": "o suor apresenta maior dificuldade para evaporar do corpo."}, {"letra": "C", "texto": "a taxa de absorção de radiação pelo corpo torna-se maior."}, {"letra": "D", "texto": "o ar torna-se mau condutor e dificulta o processo de liberação de calor."}, {"letra": "E", "texto": "o vapor-d''água presente no ar condensa-se ao entrar em contato com a pele."}]', 'B', 'Em dias úmidos, a alta concentração de vapor d''água no ar dificulta a evaporação do suor da pele, prejudicando a termorregulação e causando incômodo.', NULL, NULL, 'resumida', TRUE, FALSE, 'd796867f95f959f20a61860641d7c579cd2b3cfc4343731ff4a068e0db854094', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial', 2021, '2º dia', 'INEP', 35, '170', 'matematica', 'medio', 'Uma pessoa comprou uma caneca para tomar sopa. Topo é circunferência de diâmetro D = 10 cm, base é círculo de diâmetro d = 8 cm, altura h = 12 cm. Use \pi = 3.', 'Qual é a capacidade volumétrica, em mililitro, dessa caneca?', '[{"letra": "A", "texto": "216"}, {"letra": "B", "texto": "408"}, {"letra": "C", "texto": "732"}, {"letra": "D", "texto": "2 196"}, {"letra": "E", "texto": "2 928"}]', 'C', 'Utilizando a fórmula do volume do tronco de cone com D = 10, d = 8, h = 12 e \pi = 3, obtém-se 732 cm³, equivalentes a 732 mL.', NULL, NULL, 'resumida', TRUE, FALSE, '4495fcff7c4f5810e612b6f7d1adc4214802912c03b20cf9ad46505c4159e028', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 36, '126', NULL, 'dificil', 'Um garoto precisa montar um circuito que acenda três lâmpadas de cores diferentes (verde, vermelha, azul), uma de cada vez. Ele dispõe das lâmpadas, fios, bateria e dois interruptores de três pontos (fecha AB, abre BC e vice-versa).', 'O garoto fez cinco circuitos elétricos usando os dois interruptores, mas apenas um satisfaz a sua necessidade. Esse circuito é representado por', '[{"letra": "A", "texto": "[Circuito A]"}, {"letra": "B", "texto": "[Circuito B]"}, {"letra": "C", "texto": "[Circuito C]"}, {"letra": "D", "texto": "[Circuito D]"}, {"letra": "E", "texto": "[Circuito E]"}]', 'C', 'O circuito correto utiliza a permutação dos interruptores de três pontos para alternar o acendimento exclusivo de cada uma das três lâmpadas.', NULL, NULL, 'resumida', FALSE, FALSE, '7137b2f97209cdeeef02128ebbc44defd96065250f207c4f3d3b156ada65240d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana', 2021, '2º dia', 'INEP', 36, '171', 'matematica', 'dificil', 'O dono de uma loja pretende usar cartões imantados (R$ 0,01 por cm²; orçamento máximo R$ 0,80). Modelos: triângulo equilátero de lado 12; quadrado de lado 8; retângulo de 11x8; hexágono regular de lado 6; círculo de diâmetro 10. Use \pi = 3, \sqrt{3} = 1,7.', 'O dono da loja escolherá o modelo que tiver maior área de impressão dentro do limite. O modelo escolhido tem como face útil para impressão um', '[{"letra": "A", "texto": "triângulo."}, {"letra": "B", "texto": "quadrado."}, {"letra": "C", "texto": "retângulário."}, {"letra": "D", "texto": "hexágono."}, {"letra": "E", "texto": "círculo."}]', 'E', 'Calculando a área de cada modelo com o teto de orçamento de R$ 0,80 (máximo de 80 cm²), o círculo de diâmetro 10 cm possui área de 75 cm² (dentro do limite) e é o que possui maior área útil.', NULL, NULL, 'resumida', TRUE, FALSE, '9af2c970c0f481d9cf27df12e9a276787783d77906ed917cdcc0f3e1e564ba23', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Botânica e Anatomia Vegetal', 2021, '2º dia', 'INEP', 37, '127', NULL, 'medio', 'Estudo aponta que a extinção de preguiças-gigantes, cuja base da dieta eram frutos e sementes, provocou impactos consideráveis na vegetação do Pantanal brasileiro. A flora, embora não tenha desaparecido, tornou-se menos abundante que no passado, além de ocupar áreas mais restritas.
BICUDO, F. Jardineiros da pesada. Ecologia. Pesquisa Fapesp, ed. 231, maio 2015 (adaptado).', 'O evento descrito com a flora ocorreu em razão da redução', '[{"letra": "A", "texto": "da produção de flores."}, {"letra": "B", "texto": "do tamanho das plantas."}, {"letra": "C", "texto": "de fatores de disseminação das sementes."}, {"letra": "D", "texto": "da quantidade de sementes por fruto."}, {"letra": "E", "texto": "dos hábitats disponíveis para as plantas."}]', 'C', 'A extinção de animais frugívoros de grande porte (como as preguiças-gigantes) reduziu drasticamente os fatores de disseminação das sementes da flora local.', NULL, NULL, 'resumida', FALSE, FALSE, '2ba0ba2643c41343bfdcfacaa66560eb7f5df71c3433352f9d515cb7a1b59a56', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Saúde e Fisiologia (Matemática aplicada)', 2021, '2º dia', 'INEP', 37, '172', 'matematica', 'medio', 'Ciclista amador de 61 anos utilizou monitor cardíaco em 4 trechos (Leve plano: 90; Forte plano: 120; Subida moderada: 130; Subida forte: 140). Faixa aeróbica ideal entre 65% e 85% da Fc máx (Fc máx = 220 - idade).', 'Os trechos do percurso nos quais esse ciclista se mantém dentro de sua faixa aeróbica ideal, para o ganho de condicionamento físico, são', '[{"letra": "A", "texto": "leve no plano, forte no plano, subida moderada e subida forte."}, {"letra": "B", "texto": "leve no plano, forte no plano e subida moderada."}, {"letra": "C", "texto": "forte no plano, subida moderada e subida forte."}, {"letra": "D", "texto": "forte no plano e subida moderada."}, {"letra": "E", "texto": "leve no plano e subida forte."}]', 'D', 'Para um indivíduo de 61 anos, a frequência cardíaca máxima é 159 bpm, e a faixa aeróbica ideal (65% a 85%) situa-se entre 103,4 e 135,2 bpm. Os trechos compatíveis são forte no plano (120) e subida moderada (130).', NULL, NULL, 'resumida', TRUE, FALSE, '0d3fed2a88a9f232e378b06e2a842d85806d06a71a4d978633f710b13df0ba0d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 38, '128', NULL, 'medio', 'Carros elétricos estão cada vez mais baratos... Após realizar um percurso de 110 km, um motorista pretende recarregar as baterias de seu carro elétrico, que tem um desempenho médio de 5,0 km/kWh, usando um carregador ideal que opera a uma tensão de 220 V e é percorrido por uma corrente de 20 A.', 'Quantas horas são necessárias para recarregar a energia utilizada nesse percurso?', '[{"letra": "A", "texto": "0,005"}, {"letra": "B", "texto": "0,125"}, {"letra": "C", "texto": "2,5"}, {"letra": "D", "texto": "5,0"}, {"letra": "E", "texto": "8,0"}]', 'D', 'Energia necessária = 110 km / (5 km/kWh) = 22 kWh. Potência do carregador = 220 V \times 20 A = 4400 W = 4,4 kW. Tempo = 22 / 4,4 = 5,0 horas.', NULL, '[{"titulo": "Passo 1", "conteudo": "Energia necessária = 110 km / (5 km/kWh) = 22 kWh. Potência do carregador = 220 V \\times 20 A = 4400 W = 4,4 kW.", "formula": null}, {"titulo": "Conclusão", "conteudo": "Tempo = 22 / 4,4 = 5,0 horas.", "formula": null}]', 'automatica', TRUE, FALSE, '0488bb1075e2459a78a538981651d450dbe9bd3ce3e388c6407a035f8d991f91', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 38, '173', 'matematica', 'facil', 'Lava-rápido oferece lavagem simples (R$ 20,00) e completa (R$ 35,00). Receita diária mínima de R$ 300,00 para não ter prejuízos.', 'Para não ter prejuízo, o menor número de lavagens diárias que o lava-rápido deve efetuar é', '[{"letra": "A", "texto": "6."}, {"letra": "B", "texto": "8."}, {"letra": "C", "texto": "9."}, {"letra": "D", "texto": "15."}, {"letra": "E", "texto": "20."}]', 'C', 'Para atingir a receita mínima de R$ 300,00 com lavagens completas a R$ 35,00, são necessárias no mínimo 9 lavagens (9 \times 35 = 315).', NULL, NULL, 'resumida', TRUE, FALSE, 'cfbbf1cb8663dbc535a20c2210e5630689a4b81057f94122aa5222bc95f137e7', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Botânica e Anatomia Vegetal', 2021, '2º dia', 'INEP', 39, '129', NULL, 'medio', 'Nas angiospermas, além da fertilização da oosfera, existe uma segunda fertilização que resulta num tecido triploide.', 'Essa segunda fertilização foi importante evolutivamente, pois viabilizou a formação de um tecido de', '[{"letra": "A", "texto": "nutrição para o fruto."}, {"letra": "B", "texto": "reserva para o embrião."}, {"letra": "C", "texto": "revestimento para a semente."}, {"letra": "D", "texto": "proteção para o megagametófito."}, {"letra": "E", "texto": "vascularização para a planta jovem."}]', 'B', 'A segunda fertilização nas angiospermas forma o endosperma (tecido triploide), cuja função principal é atuar como tecido de reserva nutritiva para o embrião.', NULL, NULL, 'resumida', TRUE, FALSE, 'b582efeb8d16007f9ebac88d847b839156743c2382d7f51d2b69431d59204683', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Otimização e Custos', 2021, '2º dia', 'INEP', 39, '174', 'matematica', 'dificil', 'Paciente precisa de 3 medicamentos (X, Y, Z). Orçamento em 3 farmácias e descontos específicos (Farmácia 2: 20% em X e Y; Farmácia 3: 20% no valor total ao comprar os 3).', 'De acordo com as informações fornecidas, o paciente deve comprar os medicamentos da seguinte forma:', '[{"letra": "A", "texto": "X, Y e Z na Farmácia 1."}, {"letra": "B", "texto": "X e Y na Farmácia 1, e Z na Farmácia 3."}, {"letra": "C", "texto": "X e Y na Farmácia 2, e Z na Farmácia 3."}, {"letra": "D", "texto": "X na Farmácia 2, e Y e Z na Farmácia 3."}, {"letra": "E", "texto": "X, Y e Z na Farmácia 3."}]', 'C', 'Comparando os custos totais com descontos aplicados, adquirir os medicamentos X e Y na Farmácia 2 (com 20% de desconto) e o medicamento Z na Farmácia 3 resulta no menor gasto total (R$ 115,00).', NULL, NULL, 'resumida', TRUE, FALSE, '96330c69d56d69f55873f14e125b79a0e096710bb151901255dbbfa4fcabf23d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Orgânica (Funções e Polímeros)', 2021, '2º dia', 'INEP', 40, '130', NULL, 'medio', 'Com o objetivo de proporcionar aroma e sabor a diversos alimentos, a indústria alimentícia se utiliza de flavorizantes. Em geral, essas substâncias são ésteres, como as apresentadas no quadro (Benzoato de metila, Acetato de isoamila, Acetato de benzila, Propanoato de isobutila, Antranilato de metila).', 'O aroma do flavorizante derivado do ácido etanoico e que apresenta cadeia carbônica saturada é de', '[{"letra": "A", "texto": "kiwi."}, {"letra": "B", "texto": "banana."}, {"letra": "C", "texto": "pêssego."}, {"letra": "D", "texto": "rum."}, {"letra": "E", "texto": "uva."}]', 'B', 'O acetato de isoamila é um éster derivado do ácido etanoico (acético) com cadeia saturada, apresentando aroma de banana.', NULL, NULL, 'resumida', FALSE, FALSE, '56514cd01d13fe0c59926157e25a0453f604ab103bb59f1410cd2c469150fa0f', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana', 2021, '2º dia', 'INEP', 40, '175', 'matematica', 'dificil', 'Muitos brinquedos apresentam formatos de figuras geométricas bidimensionais e tridimensionais. Estrutura formada apenas por hastes metálicas conectadas (hastes congruentes).', 'Com base na proposta apresentada, quantas figuras geométricas planas de cada tipo são formadas pela união das hastes?', '[{"letra": "A", "texto": "12 trapézios isósceles e 12 quadrados."}, {"letra": "B", "texto": "24 trapézios isósceles e 12 quadrados."}, {"letra": "C", "texto": "12 paralelogramos e 12 quadrados."}, {"letra": "D", "texto": "8 trapézios isósceles e 12 quadrados."}, {"letra": "E", "texto": "12 trapézios escalenos e 12 retângulos."}]', 'B', 'A estrutura geométrica apresentada é composta por 24 trapézios isósceles e 12 quadrados formados pelas hastes metálicas congruentes.', NULL, NULL, 'resumida', TRUE, FALSE, 'ec30824f15ed2405499d03dddc136c5b63492f9c0388225af8d600313aa3297d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Fisiologia Cardíaca', 2021, '2º dia', 'INEP', 41, '131', NULL, 'medio', 'O eletrocardiograma é um exame cardíaco que mede a intensidade dos sinais elétricos advindos do coração. A imagem apresenta o resultado típico obtido em um paciente saudável e a intensidade do sinal (VEC) em função do tempo.', 'De acordo com o eletrocardiograma apresentado, qual foi o número de batimentos cardíacos por minuto desse paciente durante o exame?', '[{"letra": "A", "texto": "30"}, {"letra": "B", "texto": "60"}, {"letra": "C", "texto": "100"}, {"letra": "D", "texto": "120"}, {"letra": "E", "texto": "180"}]', 'C', 'Analisando o intervalo de tempo de um ciclo completo no eletrocardiograma (0,6 s), calcula-se a frequência dividindo 60 segundos por 0,6 s, resultando em 100 bpm.', NULL, NULL, 'resumida', FALSE, FALSE, '4bdfe1b98d5fcb9f771dfe6b0d3763faa5082784d689da14751f483f2ad0aedb', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Sistemas de Numeração', 2021, '2º dia', 'INEP', 41, '176', 'matematica', 'facil', 'Sistema de numeração romano (regras de repetição, adição e subtração). Placa indicadora do ano de fundação de cidade europeia: MCDLXIX.', 'Quantos anos de fundação essa cidade comemorará em 2050?', '[{"letra": "A", "texto": "379"}, {"letra": "B", "texto": "381"}, {"letra": "C", "texto": "579"}, {"letra": "D", "texto": "581"}, {"letra": "E", "texto": "601"}]', 'D', 'Convertendo os algarismos romanos MCDLXIX obtém-se o ano 1469. Subtraindo de 2050, a cidade comemorará 581 anos de fundação.', NULL, '[{"titulo": "Passo 1", "conteudo": "Convertendo os algarismos romanos MCDLXIX obtém-se o ano 1469.", "formula": null}, {"titulo": "Fazendo a conta", "conteudo": "Subtraindo de 2050, a cidade comemorará 581 anos de fundação.", "formula": null}]', 'automatica', TRUE, FALSE, 'b20f678a74409852d049887f0e2788c0492061aace91b09adbeaa57f177e530d', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Genética e Biologia Molecular', 2021, '2º dia', 'INEP', 42, '132', NULL, 'facil', 'A deficiência de lipase ácida lisossômica é uma doença hereditária associada a um gene do cromossomo 10... Quando ambos os progenitores são portadores, existe uma chance, em quatro, de que seu bebê possa nascer com essa doença.
ANDERSON, R. A. et al. Genomics, n. 1, jan. 1993 (adaptado).', 'Essa é uma doença hereditária de caráter', '[{"letra": "A", "texto": "recessivo."}, {"letra": "B", "texto": "dominante."}, {"letra": "C", "texto": "codominante."}, {"letra": "D", "texto": "poligênico."}, {"letra": "E", "texto": "polialélico."}]', 'A', 'A ocorrência da doença em proporção de 1 em 4 filhos de pais assintomáticos portadores caracteriza herança autossômica recessiva.', NULL, NULL, 'resumida', FALSE, FALSE, 'd7e907c9a127ad1fff6dec9cf7da48ce48d24b172736cbf1fb8d7b688e868399', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Sistemas de Numeração', 2021, '2º dia', 'INEP', 42, '177', 'matematica', 'medio', 'Computadores trabalham com números na base binária (algarismos 0 e 1). Quadro de regras de adição binária.', 'Considerando as informações do texto, o resultado da adição 9 + 12 será representado, na base binária, por', '[{"letra": "A", "texto": "101."}, {"letra": "B", "texto": "1101."}, {"letra": "C", "texto": "1111."}, {"letra": "D", "texto": "10101."}, {"letra": "E", "texto": "11001."}]', 'D', 'A soma dos valores decimais 9 e 12 é 21. Convertendo 21 para a base binária por divisões sucessivas, obtém-se 10101.', NULL, NULL, 'resumida', TRUE, FALSE, '9d9423fda4ee71e472c6430eb3c53809298aeda2cc1db91a452a9d1daa879afd', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 43, '133', NULL, 'medio', 'O alcoolômetro Gay Lussac é um instrumento destinado a medir o teor de álcool... A escala do instrumento é aferida a 20 °C, sendo necessária a correção da medida, caso a temperatura da solução não esteja na temperatura de aferição.
Manual alcoolômetro Gay Lussac. Disponível em: www.incoterm.com.br. Acesso em: 4 dez. 2018 (adaptado).', 'É necessária a correção da medida do instrumento, pois um aumento na temperatura promove o(a)', '[{"letra": "A", "texto": "aumento da dissociação da água."}, {"letra": "B", "texto": "aumento da densidade da água e do álcool."}, {"letra": "C", "texto": "mudança do volume dos materiais por dilatação."}, {"letra": "D", "texto": "aumento da concentração de álcool durante a medida."}, {"letra": "E", "texto": "alteração das propriedades químicas da mistura álcool e água."}]', 'C', 'O aumento da temperatura provoca a dilatação térmica dos materiais que compõem o alcoolômetro e da solução, alterando a leitura e exigindo correção na tabela.', NULL, NULL, 'resumida', FALSE, FALSE, '2c8028359467d9e1211104149208c7af954209deb97aff287bdaf77fa79afdd2', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 43, '178', 'matematica', 'medio', 'Unidade de medida hectare = 10 000 m². Fazendeiro utiliza 3 hectares (0,9 hectare para ruas e calçadas, restante em terrenos de 300 m²). 20 primeiros terrenos a R$ 20.000,00 cada, demais a R$ 30.000,00 cada.', 'Nas condições estabelecidas, o valor total, em real, obtido pelo fazendeiro com a venda de todos os terrenos será igual a', '[{"letra": "A", "texto": "700 000."}, {"letra": "B", "texto": "1 600 000."}, {"letra": "C", "texto": "1 900 000."}, {"letra": "D", "texto": "2 200 000."}, {"letra": "E", "texto": "2 800 000."}]', 'C', 'Dos 3 hectares (30.000 m²), desconta-se 0,9 hectare para ruas (9.000 m²), restando 21.000 m² para 70 lotes de 300 m². A venda de 20 lotes a R$ 20.000,00 e 50 lotes a R$ 30.000,00 totaliza R$ 1.900.000,00.', NULL, NULL, 'resumida', TRUE, FALSE, '51a8f3fc3ea06322d8d26582de747c91947b33a7a70f61d37750a1fd9e44faa3', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Química Orgânica (Funções e Polímeros)', 2021, '2º dia', 'INEP', 44, '134', NULL, 'dificil', 'O Prêmio Nobel de Química de 2000 deveu-se à descoberta e ao desenvolvimento de polímeros condutores... Uma propriedade-chave de um polímero condutor é a presença de ligações duplas conjugadas ao longo da cadeia principal do polímero.
ROCHA FILHO, R. C. Polímeros condutores: descoberta e aplicações. Química Nova na Escola, n. 12, 2000 (adaptado).', 'Um exemplo desse polímero é representado pela estrutura', '[{"letra": "A", "texto": "[Estrutura A]"}, {"letra": "B", "texto": "[Estrutura B]"}, {"letra": "C", "texto": "[Estrutura C]"}, {"letra": "D", "texto": "[Estrutura D]"}, {"letra": "E", "texto": "[Estrutura E]"}]', 'C', 'Polímeros condutores exigem a presença de ligações duplas conjugadas na cadeia principal (alternância entre ligações simples e duplas), conforme representado na estrutura C.', NULL, NULL, 'resumida', FALSE, FALSE, 'b82b5c3f5251f296b1fabed48251b7c4752bc3aca247d99bd57e60d4b7bf0b79', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Análise Combinatória', 2021, '2º dia', 'INEP', 44, '179', 'matematica', 'facil', 'Uma pessoa produzirá fantasia utilizando 2 tipos de tecidos diferentes e 5 tipos distintos de pedras ornamentais, tendo à disposição 6 tecidos e 15 pedras.', 'A quantidade de fantasias com materiais diferentes que podem ser produzidas é representada pela expressão', '[{"letra": "A", "texto": "\\frac{6!}{4!2!} \\cdot \\frac{15!}{10!5!}"}, {"letra": "B", "texto": "\\frac{6!}{4!2!} + \\frac{15!}{10!5!}"}, {"letra": "C", "texto": "\\frac{6!}{2!} + \\frac{15!}{5!}"}, {"letra": "D", "texto": "\\frac{6!}{2!} \\cdot \\frac{15!}{5!}"}, {"letra": "E", "texto": "\\frac{21!}{7!14!}"}]', 'A', 'O número de combinações possíveis para escolher 2 tecidos entre 6 e 5 pedras entre 15 é dado pelo produto dos números binomial C(6,2) \cdot C(15,5), representado pela expressão A.', NULL, NULL, 'resumida', TRUE, FALSE, '3b600750b2e01a7af5fa5b8391449d1f4a8beda9716c4092706508badc2e5224', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Ciências da Natureza', 'Eletrodinâmica e Circuitos', 2021, '2º dia', 'INEP', 45, '135', NULL, 'dificil', 'Considere que uma bateria é construída pela associação em série de três pilhas de lítio-iodo, nas condições-padrão, conforme as semiequações de redução apresentadas (I2 + 2e- -> 2I-, E° = +0,54V; Li+ + e- -> Li, E° = -3,05V). O quadro lista dispositivos eletrônicos e faixa de força eletromotriz.', 'Essa bateria é adequada para o funcionamento de qual dispositivo eletrônico?', '[{"letra": "A", "texto": "I"}, {"letra": "B", "texto": "II"}, {"letra": "C", "texto": "III"}, {"letra": "D", "texto": "IV"}, {"letra": "E", "texto": "V"}]', 'D', 'A fem total gerada pela associação em série de três pilhas é 3 \times 3,59 V = 10,77 V, compatível com a faixa do carrinho de controle remoto (10,5 a 10,9 V).', NULL, NULL, 'resumida', TRUE, FALSE, '8d359d3f6bb4b501f7d93cf6eaec9096896260511cdb3227bf8ad116a845dacd', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira e Razão/Proporção', 2021, '2º dia', 'INEP', 45, '180', 'matematica', 'dificil', 'Diretores de escola precisam construir laboratório: (i) tipo A, 100 usuários, 180 mil reais e 60 mil/ano manutenção; (ii) tipo B, 80 usuários, 120 mil reais e 16 mil/ano manutenção. Período de 4 anos.', 'A economia da escola, na utilização de um laboratório tipo B, em vez de um laboratório tipo A, num período de 4 anos, por usuário, será de', '[{"letra": "A", "texto": "1,31 mil reais."}, {"letra": "B", "texto": "1,90 mil reais."}, {"letra": "C", "texto": "2,30 mil reais."}, {"letra": "D", "texto": "2,36 mil reais."}, {"letra": "E", "texto": "2,95 mil reais."}]', 'B', 'Calculando o custo total em 4 anos por usuário para cada tipo de laboratório, o tipo A custa 4,2 mil reais por usuário e o tipo B custa 2,3 mil reais por usuário, gerando uma economia de 1,90 mil reais por usuário.', NULL, NULL, 'resumida', TRUE, FALSE, 'e3964fadb5152501b8b32c6d592822813c71f8a1e9428cd5e394c110d9a3e845', 'ENEM-2021-DIA2.txt'),
('ENEM', 'Inglês', 'Interpretação de texto / Identidade e imigração', 2022, '1º dia', 'INEP', 1, 'Questão 01', 'linguagens', 'facil', 'As my official bio reads, I was made in Cuba, assembled
in Spain, and imported to the United States — meaning my
mother, seven months pregnant, and the rest of my family
arrived as exiles from Cuba to Madrid, where I was born.
Less than two months later, we emigrated once more and
settled in New York City, then eventually in Miami, where
I was raised and educated. Although technically we lived
in the United States, the Cuban community was culturally
insular in Miami during the 1970s, bonded together by the
trauma of exile. What’s more, it seemed that practically
everyone was Cuban: my teachers, my classmates, the
mechanic, the bus driver. I didn’t grow up feeling different
or treated as a minority. The few kids who got picked on
in my grade school were the ones with freckles and funny
last names like Dawson and O’Neil.
BLANCO, R. Disponível em: http://edition.cnn.com. Acesso em: 9 dez. 2017 (adaptado).', 'Ao relatar suas vivências, o autor destaca o(a)', '[{"letra": "A", "texto": "qualidade da educação formal em Miami."}, {"letra": "B", "texto": "prestígio da cultura cubana nos Estados Unidos."}, {"letra": "C", "texto": "oportunidade de qualificação profissional em Miami."}, {"letra": "D", "texto": "cenário da integração de cubanos nos Estados Unidos."}, {"letra": "E", "texto": "fortalecimento do elo familiar em comunidades estadunidenses."}]', 'D', 'O autor narra sua trajetória familiar de exílio de Cuba para a Espanha e Estados Unidos, ressaltando o ambiente culturalmente insular de Miami onde os cubanos se integraram e mantiveram fortes laços comunitários.', NULL, NULL, 'resumida', FALSE, FALSE, '322a299baa21e04063b6cfd057be01e36df05b813e2f084b864a526ee1d8a66e', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Inglês', 'Interpretação de texto / Relações interpessoais e tecnologia', 2022, '1º dia', 'INEP', 2, 'Questão 02', 'linguagens', 'medio', 'Two hundred years ago, Jane Austen lived in a world
where single men boasted vast estates; single ladies
were expected to speak several languages, sing and play
the piano. In both cases, it was, of course, advantageous
if you looked good too. So, how much has — or hasn’t
— changed? Dating apps opaquely outline the demands
of today’s relationship market; users ruminate long and
hard over their choice of pictures and what they write in
their biographies to hook in potential lovers, and that’s just
your own profile. What do you look for in a future partner’s
profile — potential signifiers of a popular personality, a
good job, a nice car? These apps are a poignant reminder
of the often classist attitudes we still adopt, as well as
the financial and aesthetic expectations we demand from
potential partners.
GALER, S. Disponível em: www.bbc.com. Acesso em: 8 dez. 2017 (adaptado).', 'O texto aborda relações interpessoais com o objetivo de', '[{"letra": "A", "texto": "problematizar o papel de gênero em casamentos modernos."}, {"letra": "B", "texto": "apontar a relevância da educação formal na escolha de parceiros."}, {"letra": "C", "texto": "comparar a expectativa de parceiros amorosos em épocas distintas."}, {"letra": "D", "texto": "discutir o uso de aplicativos para proporcionar encontros românticos."}, {"letra": "E", "texto": "valorizar a importância da aparência física na seleção de pretendentes."}]', 'C', 'O texto estabelece um paralelo entre os critérios de seleção de parceiros amorosos no século XIX (descritos por Jane Austen) e os critérios exigidos nos aplicativos de relacionamento atuais.', NULL, NULL, 'resumida', FALSE, FALSE, 'ccf5ced31e4d625bd48ac468e29715eeceedf2697d59be5f65b9cf3e7daa2359', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Inglês', 'Leitura de tirinha / Humor e quebra de expectativa', 2022, '1º dia', 'INEP', 3, 'Questão 03', 'linguagens', 'facil', 'NOW THAT YOU ARE MY
BRIDE, YOU WILL NEVER
LEAVE THIS CASTLE!
WOW! YOUR
LIBRARY IS
AMAZING!
BEYOND THE CASTLE IS
A HIGH WALL WITH NO
GATE, AND BEYOND THAT
IS A DEEP, DARK FOREST
WITH NO PATH.
I SUPPOSE IT´S
MY LIBRARY TOO,
NOW WE‛ RE
MARRIED.
THE FOREST IS CRAWLING
WITH RAVENOUS WOLVES,
MALIGNANT BIRDS AND
THE SPIRITS OF LONG-
DEAD TRAVELLERS.
SO MANY BOOKS!
I CAN´T BELIEVE
MY LUCK!
WHEN THE SUN SETS,
I TRANSFORM INTO A WILD
BEAST AND SOAR INTO
THE NIGHT, SEIZED BY
A TERRIBLE BLOODLUST!
OK. I´LL STAY
HERE AND READ.
SEE YOU IN THE
MORNING.
1 2
3 4
GAULD, T. Disponível em: www.tomgauld.com. Acesso em: 25 out. 2021.', 'Nessa tirinha, o comportamento da mulher expressa', '[{"letra": "A", "texto": "revolta com a falta de sorte."}, {"letra": "B", "texto": "gosto pela prática da leitura."}, {"letra": "C", "texto": "receio pelo futuro do casamento."}, {"letra": "D", "texto": "entusiasmo com os livros de terror."}, {"letra": "E", "texto": "rejeição ao novo tipo de residência."}]', 'B', 'A tirinha contrasta as ameaças dramáticas do personagem com o entusiasmo da mulher, que se fascina com a biblioteca do castelo e prefere ficar lendo.', NULL, NULL, 'resumida', FALSE, FALSE, '7b6dd1e9f7807f34913376b14a2530190d0885618ed5b80c61242b7d62780414', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Inglês', 'Interpretação de texto / Redes sociais e saúde mental', 2022, '1º dia', 'INEP', 4, 'Questão 04', 'linguagens', 'facil', 'A Teen’s View of Social Media
Instagram is made up of all photos and videos. There
is the home page that showcases the posts from people
you follow, an explore tab which offers posts from accounts
all over the world, and your own page, with a notification
tab to show who likes and comments on your posts.
It has some downsides though. It is known to make
many people feel insecure or down about themselves
because the platform showcases the highlights of
everyone’s lives, while rarely showing the negatives.
This can make one feel like their life is not going as well
as others, contributing to the growing rates of anxiety or
depression in many teens today. There is an underlying
desire for acceptance through the number of likes or
followers one has.
Disponível em: https://cyberbullying.org. Acesso em: 29 out. 2021.', 'O termo “downsides ” introduz a ideia de que o Instagram
é responsável por', '[{"letra": "A", "texto": "oferecer recursos de fotografia."}, {"letra": "B", "texto": "divulgar problemas dos usuários."}, {"letra": "C", "texto": "estimular aceitação dos seguidores."}, {"letra": "D", "texto": "provocar ansiedade nos adolescentes."}, {"letra": "E", "texto": "aproximar pessoas ao redor do mundo."}]', 'D', 'O termo ''downsides'' (desvantagens) introduz a ideia de que o Instagram gera sentimentos de insegurança e contribui para o aumento de ansiedade e depressão em adolescentes.', NULL, NULL, 'resumida', FALSE, FALSE, '05620c8199aa7726047ed97b69b77d94ddf25bb83c4a474425ec285448dc9503', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Inglês', 'Compreensão poética / Comunicação digital e distanciamento', 2022, '1º dia', 'INEP', 5, 'Questão 05', 'linguagens', 'medio', 'I tend the mobile now
like an injured bird
We text, text, text
our significant words.
I re-read your first,
your second, your third,
Look for your small xx,
feeling absurd.
The codes we send
arrive with a broken chord.
I try to picture your hands,
their image is blurred.
Nothing my thumbs press
will ever be heard.
DUFFY, C. Disponível em: www.independent.co.uk. Acesso em: 27 out. 2021.', 'Nesse poema, o eu lírico evidencia um sentimento de', '[{"letra": "A", "texto": "contentamento com a interação virtual."}, {"letra": "B", "texto": "zelo com o envio de mensagens."}, {"letra": "C", "texto": "preocupação com a composição de textos."}, {"letra": "D", "texto": "mágoa com o comportamento de alguém."}, {"letra": "E", "texto": "insatisfação com uma forma de comunicação."}]', 'E', 'O eu lírico expressa insatisfação e frustração com as limitações da comunicação via mensagens de texto no celular, que não substituem o contato real.', NULL, NULL, 'resumida', FALSE, FALSE, '6cebad5a05ba32a2b58b3c35f05319526acdb991a2a023d0b13c91b208b79287', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Análise de texto opinativo / Marcas de informalidade e metáfora', 2022, '1º dia', 'INEP', 6, 'Questão 06', 'linguagens', 'facil', 'Urgência emocional
Se tudo é para ontem, se a vida engata uma primeira
e sai em disparada, se não há mais tempo para paradas
estratégicas, caímos fatalmente no vício de querer que
os amores sejam igualmente resolvidos num átimo de
segundo. Temos pressa para ouvir “eu te amo”. Não vemos
a hora de que fiquem estabelecidas as regras de convívio:
somos namorados, ficantes, casados, amantes? Urgência
emocional. Uma cilada. Associamos diversas palavras ao
AMOR: paixão, romance, sexo, adrenalina, palpitação.
Esquecemos, no entanto, da palavra que viabiliza esse
sentimento: “paciência”. Amor sem paciência não vinga.
Amor não pode ser mastigado e engolido com emergência,
com fome desesperada. É uma refeição que pode durar
uma vida.
MEDEIROS, M. Disponível em: http://porumavidasimples.blogspot.com.br.
Acesso em: 20 ago. 2017 (adaptado).
Nesse texto de opinião, as marcas linguísticas revelam
uma situação distensa e de pouca formalidade, o que se', 'evidencia pelo(a)', '[{"letra": "A", "texto": "impessoalização ao longo do texto, como em: “se não há mais tempo”."}, {"letra": "B", "texto": "construção de uma atmosfera de urgência, em palavras como: “pressa”."}, {"letra": "C", "texto": "repetição de uma determinada estrutura sintática, como em: “Se tudo é para ontem”."}, {"letra": "D", "texto": "ênfase no emprego da hipérbole, como em: “uma refeição que pode durar uma vida”."}, {"letra": "E", "texto": "emprego de metáforas, como em: “a vida engata uma primeira e sai em disparada”."}]', 'E', 'O texto emprega metáforas do cotidiano, como ''a vida engata uma primeira e sai em disparada'' e ''uma refeição que pode durar uma vida'', revelando tom distenso e informal.', NULL, NULL, 'resumida', FALSE, FALSE, '2c5b47ccae2daca7b922d76a5b2d2fa3bcbc468ed7b8110cef8d178d5a0d7189', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Comparação textual / Temática sobre animais de rua', 2022, '1º dia', 'INEP', 7, 'Questão 07', 'linguagens', 'medio', 'TEXTO I
EI...
ME LEVE PARA SUA CASA!!!
ADOTE UM
ANIMAL DE RUA
14ª FEIRA DE ADOÇÃO
DE CÃES E GATOS
DOCUMENTOS OBRIGATÓRIOS PARA ADOÇÃO
CARTEIRA DE IDENTIDADE CPF COMPROVANTE DE RESIDÊNCIA
E muito amor!!
Disponível em: https://amigodobicho.wordpress.com. Acesso em: 10 dez. 2017.
TEXTO II
Nas ruas, na cidade e no parque
Ninguém nunca prendeu o Delegado. O vaivém de rua
em rua e sua longa vida são relembrados e recontados.
Exemplo de sobrevivência, liderança, inteligência canina,
desde pequenininho seu focinho negro e seus olhos
delineados desenharam um mapa mental olfativo-visual de
Lavras. Corria de quem precisava correr e se aproximava
de quem não lhe faria mal, distinguia este daquele. Assim,
tornou-se um cão comunitário. Nunca se soube por que
escolheu a rua, talvez lhe tenham feito mal dentro de quatro
paredes. Idoso, teve câncer e desapareceu. O querido foi
procurado pela cidade inteira por duas protetoras, mas
nunca encontrado.
COSTA, A. R. N. Viver o amor aos cães : Parque Francisco de Assis.', 'Carmo do Cachoeira: Irdin, 2014 (adaptado).
Os dois textos abordam a temática de animais de rua,
porém, em relação ao Texto I, o Texto II', '[{"letra": "A", "texto": "problematiza a necessidade de adoção de animais sem lar."}, {"letra": "B", "texto": "valida a troca afetiva entre os pets adotados e seus donos."}, {"letra": "C", "texto": "reforça a importância da campanha de adoção de animais."}, {"letra": "D", "texto": "exalta a natureza amigável de cães e de gatos."}, {"letra": "E", "texto": "promove a campanha de adoção de animais."}]', 'E', 'Enquanto o Texto I é uma peça institucional promovendo uma feira de adoção, o Texto II narra a história afetiva do cão ''Delegado'', reforçando o amor pelos animais.', NULL, NULL, 'resumida', FALSE, FALSE, '63ae506ff769ab82c4b6aa7237ee2a8b30ac0110926b45a5154684ca4e8fb2f9', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Leitura crítica de mídias / Jogos e representatividade feminina', 2022, '1º dia', 'INEP', 8, 'Questão 08', 'linguagens', 'facil', 'É ruivo? Tem olhos azuis? É homem ou mulher?
Usa chapéu? Quem jogou Cara a Cara na infância sabe
de cor o roteiro de perguntas para adivinhar quem é o
personagem misterioso do seu oponente.
Agora, o jogo está prestes a ganhar uma nova
versão. A designer polonesa Zuzia Kozerska-Girard está
desenvolvendo uma variação do Guess Who? (nome
do Cara a Cara em inglês), em que as personalidades do
tabuleiro são, na verdade, mulheres notáveis da história
e da atualidade, como a artista Frida Kahlo, a ativista
Malala Yousafzai, a astronauta Valentina Tereshkova e a
aviadora Amelia Earhart. O Who’s She? (“Quem é ela?”,
em português) traz, no total, 28 mulheres que representam
diversas profissões, nacionalidades e idades.
A ideia é que, em vez de perguntar sobre a aparência
das personagens, as questões sejam direcionadas aos
feitos delas: ganhou algum Nobel, fez alguma descoberta?
Para cada personagem há um cartão com fatos divertidos
e interessantes sobre sua vida. Uma campanha entrou no
ar com o objetivo de arrecadar dinheiro para desenvolver
o Who’s She?. A meta inicial era reunir 17 mil dólares.
Oito dias antes de a campanha acabar, o projeto já
angariou quase 350 mil dólares.
A chegada do jogo à casa do comprador varia de
acordo com a quantia doada — quanto mais você doou,
mais rápido vai poder jogar.
Disponível em: www.super.abril.com.br. Acesso em: 4 dez. 2018 (adaptado).
Ao divulgar a adaptação do jogo para questões relativas a', 'ações e habilidades de mulheres notáveis, o texto busca', '[{"letra": "A", "texto": "contribuir para a formação cidadã dos jogadores."}, {"letra": "B", "texto": "refutar modelos estereotipados de beleza e elegância."}, {"letra": "C", "texto": "estimular a competitividade entre potenciais compradores."}, {"letra": "D", "texto": "exemplificar estratégias de arrecadação financeira pela internet."}, {"letra": "E", "texto": "desenvolver conhecimentos lúdicos específicos dos tempos atuais."}]', 'A', 'Ao substituir a investigação sobre aparência física por perguntas sobre feitos de mulheres notáveis, a adaptação do jogo contribui para a formação cidadã.', NULL, NULL, 'resumida', FALSE, FALSE, '3d45257dbd6ea71c9f9d9df611aa489cdf4180b79acec627b4ff5c5962315148', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Linguagem e tecnologia / Direitos autorais e ambiente virtual', 2022, '1º dia', 'INEP', 10, 'Questão 10', 'linguagens', 'medio', 'Ciente de que, no campo da criação, as inovações
tecnológicas abrem amplo leque de possibilidades
— ao permitir, e mesmo estimular, que o artista
explore a fundo, em seu processo criativo, questões
como a aleatoriedade, o acaso, a não linearidade e a
hipermídia —, Leo Cunha comenta que, no que tange
ao campo da divulgação, as alternativas são ainda
mais evidentes: “Afinal, é imensa a capacidade de
reprodução, multiplicação e compartilhamento das
obras artísticas/culturais. Ao mesmo tempo, ganham
dimensão os dilemas envolvidos com a questão
da autoria, dos direitos autorais, da reprodução e
intervenção não autorizadas, entre outras questões”.
Já segundo a professora Yacy-Ara Froner, o uso de
ferramentas tecnológicas não pode ser visto como
um fim em si mesmo. Isso porque computadores,
samplers, programas de imersão, internet e intranet,
vídeo, televisão, rádio, GPD etc. são apenas suportes
com os quais os artistas exercem sua imaginação.
SILVA JR., M. G. Movidas pela dúvida. Minas faz Ciências,
n. 52, dez.-fev. 2013 (adaptado).
Segundo os autores citados no texto, a expansão de', 'possibilidades no campo das manifestações artísticas
promovida pela internet pode pôr em risco o(a)', '[{"letra": "A", "texto": "sucesso dos artistas."}, {"letra": "B", "texto": "valorização dos suportes."}, {"letra": "C", "texto": "proteção da produção estética."}, {"letra": "D", "texto": "modo de distribuição de obras."}, {"letra": "E", "texto": "compartilhamento das obras artísticas."}]', 'C', 'O texto aponta que a facilidade de reprodução e compartilhamento na internet coloca em risco a proteção da propriedade intelectual e produção estética.', NULL, NULL, 'resumida', FALSE, FALSE, '770ee15255dfc42cc8282b2026af8900dded8488e77a9417687cf2d70288dedc', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Análise discursiva / Inovação tecnológica e aprendizagem', 2022, '1º dia', 'INEP', 11, 'Questão 11', 'linguagens', 'medio', 'Ora, sempre que surge uma nova técnica, ela quer
demonstrar que revogará as regras e coerções que
presidiram o nascimento de todas as outras invenções
do passado. Ela se pretende orgulhosa e única. Como
se a nova técnica carreasse com ela, automaticamente,
para seus novos usuários, uma propensão natural a fazer
economia de qualquer aprendizagem. Como se ela se
preparasse para varrer tudo que a precedeu, ao mesmo
tempo transformando em analfabetos todos os que
ousassem repeli-la.
Fui testemunha dessa mudança ao longo de toda
a minha vida. Ao passo que, na realidade, é o contrário
que acontece. Cada nova técnica exige uma longa
iniciação numa nova linguagem, ainda mais longa na
medida em que nosso espírito é formatado pela utilização
das linguagens que precederam o nascimento da
recém-chegada.
ECO, U.; CARRIÈRE, J.-C. Não contem com o fim do livro.
Rio de Janeiro: Record, 2010 (adaptado).
O texto revela que, quando a sociedade promove o
desenvolvimento de uma nova técnica, o que mais', 'impacta seus usuários é a', '[{"letra": "A", "texto": "dificuldade na apropriação da nova linguagem."}, {"letra": "B", "texto": "valorização da utilização da nova tecnologia."}, {"letra": "C", "texto": "recorrência das mudanças tecnológicas."}, {"letra": "D", "texto": "suplantação imediata dos conhecimentos prévios."}, {"letra": "E", "texto": "rapidez no aprendizado do manuseio das novas invenções."}]', 'A', 'Umberto Eco argumenta que cada nova técnica exige uma longa iniciação e aprendizado de uma nova linguagem, contrariando a ilusão de facilidade imediata.', NULL, NULL, 'resumida', FALSE, FALSE, 'dadcef4daafeff1964065d5f61e942e1902a4afda640162f1bd0ebf01b6c297b', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Norma-padrão e adequação linguística / Colocação pronominal', 2022, '1º dia', 'INEP', 12, 'Questão 12', 'linguagens', 'facil', 'Papos
— Me disseram...
— Disseram-me.
— Hein?
— O correto é “disseram-me”. Não “me disseram”.
— Eu falo como quero. E te digo mais... Ou é “digo-te”?
— O quê?
— Digo-te que você...
— O “te” e o “você” não combinam.
— Lhe digo?
— Também não. O que você ia me dizer?
— Que você está sendo grosseiro, pedante e
chato. [...]
— Dispenso as suas correções. Vê se esquece-me.
Falo como bem entender. Mais uma correção e eu...
— O quê?
— O mato.
— Que mato?
— Mato-o. Mato-lhe. Mato você. Matar-lhe-ei-te.
Ouviu bem? Pois esqueça-o e para-te. Pronome
no lugar certo é elitismo!
— Se você prefere falar errado...
— Falo como todo mundo fala. O importante é me
entenderem. Ou entenderem-me?
VERISSIMO, L. F. Comédias para se ler na escola.
Rio de Janeiro: Objetiva, 2001 (adaptado).
Nesse texto, o uso da norma-padrão defendido por um', 'dos personagens torna-se inadequado em razão do(a)', '[{"letra": "A", "texto": "falta de compreensão causada pelo choque entre gerações."}, {"letra": "B", "texto": "contexto de comunicação em que a conversa se dá."}, {"letra": "C", "texto": "grau de polidez distinto entre os interlocutores."}, {"letra": "D", "texto": "diferença de escolaridade entre os falantes."}, {"letra": "E", "texto": "nível social dos participantes da situação."}]', 'B', 'A rigidez no emprego de regras gramaticais de colocação pronominal torna-se inadequada ao contexto informal e descontraído da conversa.', NULL, NULL, 'resumida', FALSE, FALSE, '9daab1a6f0e91e76a6b292d777b88896319cdbdba4f96abc5c77b292187317c0', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Sociolinguística e inclusão digital / Perfil socioeconômico', 2022, '1º dia', 'INEP', 13, 'Questão 13', 'linguagens', 'facil', 'São vários os fatores, internos e externos, que
influenciam os hábitos das pessoas no acesso à internet,
assim como nas práticas culturais realizadas na rede.
A utilização das tecnologias de informação e comunicação
está diretamente relacionada aos aspectos como:
conhecimento de seu uso, acesso à linguagem letrada,
nível de instrução, escolaridade, letramento digital etc.
Os que detêm tais recursos (os mais escolarizados)
são os que mais acessam a rede e também os que
possuem maior índice de acumulatividade das práticas.
A análise dos dados nos possibilita dizer que a falta
de acesso à rede repete as mesmas adversidades e
exclusões já verificadas na sociedade brasileira no que
se refere a analfabetos, menos escolarizados, negros,
população indígena e desempregados. Isso significa
dizer que a internet, se não produz diretamente a
exclusão, certamente a reproduz, tendo em vista
que os que mais a acessam são justamente os mais
jovens, escolarizados, remunerados, trabalhadores
qualificados, homens e brancos.
SILVA, F. A. B.; ZIVIANE, P.; GHEZZI, D. R. As tecnologias digitais e seus usos.
Brasília; Rio de Janeiro: Ipea, 2019 (adaptado).
Ao analisarem a correlação entre os hábitos e o perfil
socioeconômico dos usuários da internet no Brasil, os', 'pesquisadores', '[{"letra": "A", "texto": "apontam o desenvolvimento econômico como solução para ampliar o uso da rede."}, {"letra": "B", "texto": "questionam a crença de que o acesso à informação é igualitário e democrático."}, {"letra": "C", "texto": "afirmam que o uso comercial da rede é a causa da exclusão de minorias."}, {"letra": "D", "texto": "refutam o vínculo entre níveis de escolaridade e dificuldade de acesso."}, {"letra": "E", "texto": "condicionam a expansão da rede à elaboração de políticas inclusivas."}]', 'B', 'A pesquisa questiona a ideia de que a internet seja democrática, pois os dados revelam que o acesso reproduz as desigualdades sociais e educacionais.', NULL, NULL, 'resumida', FALSE, FALSE, '23251decd6d3593ee6cb0b3ec436c8ba2e71055763ada61a323dcb8d33e36e49', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Preconceito linguístico / Léxico e discriminação racial', 2022, '1º dia', 'INEP', 14, 'Questão 14', 'linguagens', 'facil', 'TEXTO I
A língua não é uma nomenclatura, que se apõe a
uma realidade pré-categorizada, ela é que classifica
a realidade. No léxico, percebe-se, de maneira mais
imediata, o fato de que a língua condensa as experiências
de um dado povo.
FIORIN, J. L. Língua, modernidade e tradição. Diversitas, n. 2, mar.-set. 2014.
TEXTO II
As expressões coloquiais ainda estão impregnadas de
discriminação contra os negros. Basta recordar algumas
delas, como passar um “dia negro”, ter um “lado negro”,
ser a “ovelha negra” da família ou praticar “magia negra”.
Disponível em: https://brasil.elpais.com. Acesso em: 22 maio 2018.', 'O Texto II exemplifica o que se afirma no Texto I, na
medida em que defende a ideia de que as escolhas
lexicais são resultantes de um', '[{"letra": "A", "texto": "expediente próprio do sistema linguístico que nos apresenta diferentes possibilidades para traduzir estados de coisas."}, {"letra": "B", "texto": "ato inventivo de nomear novas realidades que surgem diante de uma comunidade de falantes de uma língua."}, {"letra": "C", "texto": "mecanismo de apropriação de formas linguísticas que estão no acervo da formação do idioma nacional."}, {"letra": "D", "texto": "processo de incorporação de preconceitos que são recorrentes na história de uma sociedade."}, {"letra": "E", "texto": "recurso de expressão marcado pela objetividade que se requer na comunicação diária."}]', 'D', 'O Texto II exemplifica como certas expressões coloquiais incorporam e perpetuam preconceitos raciais consolidados na história da sociedade.', NULL, NULL, 'resumida', FALSE, FALSE, '76946f7d57f00adeb0f56b6e9ab01fd79f3439112f28d86e393345c09d9943b1', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Gênero rede social / Transparência pública', 2022, '1º dia', 'INEP', 15, 'Questão 15', 'linguagens', 'facil', 'QUANTO CUSTOU?
Proposta obriga órgão público a divulgar gasto
com anúncio na própria peça publicitária.
Qual sua opinião?
Disponível em: www.facebook.com/senadofederal. Acesso em: 9 dez. 2017.
Considerando-se a função social dos posts, essa imagem', 'evidencia a apropriação de outro gênero com o objetivo de', '[{"letra": "A", "texto": "promover o uso adequado de campanhas publicitárias do governo."}, {"letra": "B", "texto": "divulgar o projeto sobre transparência da administração pública."}, {"letra": "C", "texto": "responsabilizar o cidadão pelo controle dos gastos públicos."}, {"letra": "D", "texto": "delegar a gestão de projetos de lei ao contribuinte."}, {"letra": "E", "texto": "assegurar a fiscalização dos gastos públicos."}]', 'B', 'O post do Senado utiliza o formato interativo de enquete para divulgar o projeto de lei que obriga a divulgação dos custos de campanhas publicitárias públicas.', NULL, NULL, 'resumida', FALSE, FALSE, 'fdadcf4960d32d52cb6163f8c08893b154c74636052334e16bee1917aac91000', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Gênero resenha / Análise crítica de documentário', 2022, '1º dia', 'INEP', 16, 'Questão 16', 'linguagens', 'medio', 'Ela era linda. Gostava de dançar, fazia teatro em São
Paulo e sonhava ser atriz em Hollywood. Tinha 13 anos
quando ganhou uma câmera de vídeo — e uma irmã.
As duas se tornaram suas companheiras de
experimentações. Adolescente, Elena vivia a criar
filminhos e se empenhava em dirigir a pequena Petra nas
cenas que inventava. Era exigente com a irmã. E acreditava
no potencial da menina para satisfazer seus arroubos de
diretora precoce. Por cinco anos, integrou algumas das
melhores companhias paulistanas de teatro e participou
de preleções para filmes e trabalhos na TV. Nunca foi
chamada. No início de 1990, Elena tinha 20 anos quando se
mudou para Nova York para cursar artes cênicas e batalhar
uma chance no mercado americano. Deslocada, ansiosa,
frustrada após alguns testes de elenco malsucedidos,
decepcionada com a ausência de reconhecimento e
vitimada por uma depressão que se agravava com a falta
de perspectivas, Elena pôs fim à vida no segundo semestre.
Petra tinha 7 anos. Vinte anos depois, é ela, a irmã caçula,
que volta a Nova York para percorrer os últimos passos da
irmã, vasculhar seus arquivos e transformar suas memórias
em imagem e poesia.
Elena é um filme sobre a irmã que parte e sobre a irmã
que fica. É um filme sobre a busca, a perda, a saudade, mas
também sobre o encontro, o legado, a memória. Um filme sobre
a Elena de Petra e sobre a Petra de Elena, sobre o que ficou de
uma na outra e, essencialmente, um filme sobre a delicadeza.
VANUCHI, C. Época, 19 out. 2012 (adaptado).', 'O texto é exemplar de um gênero discursivo que cumpre
a função social de', '[{"letra": "A", "texto": "narrar, por meio de imagem e poesia, cenas da vida das irmãs Petra e Elena."}, {"letra": "B", "texto": "descrever, por meio das memórias de Petra, a separação de duas irmãs."}, {"letra": "C", "texto": "sintetizar, por meio das principais cenas do filme, a história de Elena."}, {"letra": "D", "texto": "lançar, por meio da história de vida do autor, um filme autobiográfico."}, {"letra": "E", "texto": "avaliar, por meio de análise crítica, o filme em referência."}]', 'E', 'O texto cumpre a função social de resenhar e avaliar criticamente o documentário ''Elena'', de Petra Costa, destacando suas qualidades poéticas e afetivas.', NULL, NULL, 'resumida', TRUE, FALSE, '7c9d208092904b681309283ee4cf75090f94080d68b9bf38a3480e5a7c04653e', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Metalinguagem e poética / Conceito de palavra', 2022, '1º dia', 'INEP', 17, 'Questão 17', 'linguagens', 'facil', 'PALAVRA – As gramáticas classificam as palavras
em substantivo, adjetivo, verbo, advérbio, conjunção,
pronome, numeral, artigo e preposição. Os poetas
classificam as palavras pela alma porque gostam de
brincar com elas, e para brincar com elas é preciso ter
intimidade primeiro. É a alma da palavra que define,
explica, ofende ou elogia, se coloca entre o significante
e o significado para dizer o que quer, dar sentimento às
coisas, fazer sentido. A palavra nuvem chove. A palavra
triste chora. A palavra sono dorme. A palavra tempo
passa. A palavra fogo queima. A palavra faca corta.
A palavra carro corre. A palavra “palavra” diz. O que quer.
E nunca desdiz depois. As palavras têm corpo e alma,
mas são diferentes das pessoas em vários pontos.
As palavras dizem o que querem, está dito, e pronto.
FALCÃO, A. Pequeno dicionário de palavras ao vento.
São Paulo: Salamandra, 2013 (adaptado).
Esse texto, que simula um verbete para a palavra', '“palavra’’, constitui-se como um poema porque', '[{"letra": "A", "texto": "tematiza o fazer poético, como em “Os poetas classificam as palavras pela alma”."}, {"letra": "B", "texto": "utiliza o recurso expressivo da metáfora, como em “As palavras têm corpo e alma”."}, {"letra": "C", "texto": "valoriza a gramática da língua, como em “substantivo, adjetivo, verbo, advérbio, conjunção”."}, {"letra": "D", "texto": "estabelece comparações, como em “As palavras têm corpo e alma, mas são diferentes das pessoas”."}, {"letra": "E", "texto": "apresenta informações pertinentes acerca do conceito de “palavra”, como em “As gramáticas classificam as palavras”."}]', 'A', 'O texto simula um verbete para refletir sobre a criação poética, destacando que os poetas classificam as palavras pela alma e intimidade.', NULL, NULL, 'resumida', FALSE, FALSE, 'c36fee1ccab71ed23c7ac866636a09e0152e85504e6a42c27c28d490ab7ce9f3', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Coesão e ritmo narrativo / Estrutura do desabafo', 2022, '1º dia', 'INEP', 18, 'Questão 18', 'linguagens', 'medio', 'Morte lenta ao luso infame que inventou a calçada
portuguesa. Maldito D. Manuel I e sua corja de tenentes
Eusébios. Quadrados de pedregulho irregular socados à
mão. À mão! É claro que ia soltar, ninguém reparou que
ia soltar? Branco, preto, branco, preto, as ondas do mar
de Copacabana. De que me servem as ondas do mar de
Copacabana? Me deem chão liso, sem protuberâncias
calcárias. Mosaico estúpido. Mania de mosaico. Joga
concreto em cima e aplaina. Buraco, cratera, pedra
solta, bueiro-bomba. Depois dos setenta, a vida se
transforma numa interminável corrida de obstáculos.
A queda é a maior ameaça para o idoso. “Idoso”, palavra
odienta. Pior, só “terceira idade”. A queda separa a
velhice da senilidade extrema. O tombo destrói a cadeia
que liga a cabeça aos pés. Adeus, corpo. Em casa, vou
de corrimão em corrimão, tateio móveis e paredes, e
tomo banho sentado. Da poltrona para a janela, da janela
para a cama, da cama para a poltrona, da poltrona para
a janela. Olha aí, outra vez, a pedrinha traiçoeira atrás de
me pegar. Um dia eu caio, hoje não.
TORRES, F. Fim. São Paulo: Cia. das Letras, 2013.', 'O recurso que caracteriza a organização estrutural desse
texto é o(a)', '[{"letra": "A", "texto": "justaposição de sequências verbais e nominais."}, {"letra": "B", "texto": "mudança de eventos resultante do jogo temporal."}, {"letra": "C", "texto": "uso de adjetivos qualificativos na descrição do cenário."}, {"letra": "D", "texto": "encadeamento semântico pelo uso de substantivos sinônimos."}, {"letra": "E", "texto": "inter-relação entre orações por elementos linguísticos lógicos."}]', 'A', 'O texto constrói o ritmo do desabafo por meio da justaposição de sequências verbais e nominais curtas que descrevem a apreensão do idoso.', NULL, NULL, 'resumida', FALSE, FALSE, 'bb4ab14ea32045a49f46bdb8ed7b5ef2d7fd34812aa73c16cb6c7501c7221d96', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Educação Física', 'Práticas corporais e saúde pública / Desigualdade socioeconômica', 2022, '1º dia', 'INEP', 20, 'Questão 20', 'linguagens', 'medio', 'Seis em cada dez pessoas com 15 anos ou mais
não praticam esporte ou atividade física. São mais de
100 milhões de sedentários. Esses são dados do estudo
Práticas de esporte e atividade física, da Pnad 2015,
realizado pelo IBGE. A falta de tempo e de interesse são
os principais motivos apontados para o sedentarismo.
Paralelamente, 73,3% das pessoas de 15 anos ou mais
afirmaram que o poder público deveria investir em esporte
ou atividades físicas. Observou-se uma relação direta
entre escolaridade e renda na realização de esportes ou
atividades físicas. Enquanto 17,3% das pessoas que não
tinham instrução realizavam diversas práticas corporais,
esse percentual chegava a 56,7% das pessoas com
superior completo. Entre as pessoas que têm práticas
de esporte e atividade física regulares, o percentual de
praticantes ia de 31,1%, na classe sem rendimento, a
65,2%, na classe de cinco salários mínimos ou mais.
A falta de tempo foi mais declarada pela população adulta,
com destaque entre as pessoas de 25 a 39 anos. Entre
os adolescentes de 15 a 17 anos, o principal motivo foi não
gostarem ou não quererem. Já o principal motivo para praticar
esporte, declarado por 11,2 milhões de pessoas, foi relaxar
ou se divertir, seguido de melhorar a qualidade de vida ou o
bem-estar. A falta de instalação esportiva acessível ou nas
proximidades foi um motivo pouco citado, demonstrando
que a não prática estaria menos associada à infraestrutura
disponível.
Disponível em: www.esporte.gov.br. Acesso em: 9 ago. 2017 (adaptado).
Com base na pesquisa e em uma visão ampliada de
saúde, para a prática regular de exercícios ter influência', 'significativa na saúde dos brasileiros, é necessário o
desenvolvimento de estratégias que', '[{"letra": "A", "texto": "promovam a melhoria da aptidão física da população, dedicando-se mais tempo aos esportes."}, {"letra": "B", "texto": "combatam o sedentarismo presente em parcela significativa da população no território nacional."}, {"letra": "C", "texto": "facilitem a adoção da prática de exercícios, com ações relacionadas à educação e à distribuição de renda."}, {"letra": "D", "texto": "auxiliem na construção de mais instalações esportivas e espaços adequados para a prática de atividades físicas e esportes."}, {"letra": "E", "texto": "estimulem o incentivo fiscal para a iniciativa privada destinar verbas aos programas nacionais de promoção da saúde pelo esporte."}]', 'C', 'Os dados mostram que a prática regular de exercícios está diretamente ligada aos níveis de renda e escolaridade, demandando políticas redistributivas.', NULL, NULL, 'resumida', FALSE, FALSE, '4c18af662acbeb255be0783ca2a6e00f1dba27e4eb3089c3488800ac533c5add', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Romantismo / Abolicionismo em Maria Firmina dos Reis', 2022, '1º dia', 'INEP', 21, 'Questão 21', 'linguagens', 'medio', 'A escrava
— Admira-me —, disse uma senhora de sentimentos
sinceramente abolicionistas —; faz-me até pasmar como
se possa sentir, e expressar sentimentos escravocratas,
no presente século, no século dezenove! A moral
religiosa e a moral cívica aí se erguem, e falam bem
alto esmagando a hidra que envenena a família no mais
sagrado santuário seu, e desmoraliza, e avilta a nação
inteira! Levantai os olhos ao Gólgota, ou percorrei-os em
torno da sociedade, e dizei-me:
— Para que se deu em sacrifício o Homem Deus,
que ali exalou seu derradeiro alento? Ah! Então não é
verdade que seu sangue era o resgate do homem! É
então uma mentira abominável ter esse sangue comprado
a liberdade!? E depois, olhai a sociedade... Não vedes
o abutre que a corrói constantemente!… Não sentis a
desmoralização que a enerva, o cancro que a destrói?
Por qualquer modo que encaremos a escravidão, ela
é, e será sempre um grande mal. Dela a decadência do
comércio; porque o comércio e a lavoura caminham de
mãos dadas, e o escravo não pode fazer florescer a lavoura;
porque o seu trabalho é forçado.
REIS, M. F. Úrsula e outras obras. Brasília: Câmara dos Deputados, 2018.', 'Inscrito na estética romântica da literatura brasileira,
o conto descortina aspectos da realidade nacional no
século XIX ao', '[{"letra": "A", "texto": "revelar a imposição de crenças religiosas a pessoas escravizadas."}, {"letra": "B", "texto": "apontar a hipocrisia do discurso conservador na defesa da escravidão."}, {"letra": "C", "texto": "sugerir práticas de violência física e moral em nome do progresso material."}, {"letra": "D", "texto": "relacionar o declínio da produção agrícola e comercial a questões raciais."}, {"letra": "E", "texto": "ironizar o comportamento dos proprietários de terra na exploração do trabalho."}]', 'C', 'A obra ''A escrava'' critica a escravidão mostrando o progresso agrícola associado à violência física e degradação moral da nação.', NULL, NULL, 'resumida', FALSE, FALSE, '4e34eb94ed2d4466f219e162e2a0990ca58bdce5a8860f88a3e49dde1c2723e3', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Tecnologia e acessibilidade / Disseminação do conhecimento', 2022, '1º dia', 'INEP', 22, 'Questão 22', 'linguagens', 'facil', 'TEXTO I
Projeto Mural Eletrônico desenvolvido no INT,
semelhante a um totem, promete tornar o acesso à
informação disponível para todos
A inclusão de pessoas com deficiência se constituiu um
dos principais desafios e preocupações para a sociedade
ao longo das últimas décadas. E o uso da tecnologia tem
se revelado um aliado fundamental em muitas iniciativas
voltadas para essa área. Exemplo disso é uma das recentes
criações do Instituto Nacional de Tecnologia (INT) — unidade
de pesquisa do Ministério da Ciência, Tecnologia, Inovações
e Comunicações (MCTIC). Ali, com o objetivo de que as
diferenças entre pessoas não sejam sinônimo de obstáculos
no acesso à informação ou na comunicação, engenheiros e
tecnólogos vêm trabalhando no desenvolvimento do projeto
Mural Eletrônico.
O Mural Eletrônico nasceu da necessidade de
promover a inclusão nas escolas. Com interface
multimídia e interativa, todos têm a possibilidade de
acessar o Mural Eletrônico. Por meio do equipamento,
podem ser disponibilizados vídeos com Libras, leitura
sonora de textos, que também estarão acessíveis em
uma plataforma de braille dinâmico, ao lado do teclado.
KIFFER, D. Inclusão ampla e irrestrita. Rio Pesquisa, n. 36, set. 2016 (adaptado).
TEXTO II
Projeto Surdonews, desenvolvido na UFRJ, garante
acesso de surdos à informação e contribui para
sua “inclusão científica”
Para não permitir que a falta de informação seja
um fator para o isolamento e a inacessibilidade da
comunidade surda, a jornalista e pesquisadora Roberta
Savedra Schiaffino criou o projeto “Surdonews: montando
os quebra-cabeças das notícias para o surdo”. Trata-se de
uma página no Facebook, com notícias constantemente
atualizadas e apresentadas por surdos em Libras, e
veiculadas por meio de vídeos.
A ideia de criar o projeto surgiu quando Roberta, ela
própria surda profunda, ainda cursava o mestrado. Para
isso, ela procurou traçar um diagnóstico do conhecimento
informal entre as pessoas com surdez. Ela entrevistou
cinquenta alunos surdos do ensino fundamental e viu que
eles tinham muita dificuldade de ler, além de não captar a
notícia falada. “Isso é muito grave, pois 90% do saber de
um indivíduo vem do conhecimento informal, adquirido em
feiras científicas, conversas, cinema, teatro, incluindo a
mídia, por todas as suas possibilidades disseminadoras”,
explica a pesquisadora. “Prezamos pelo conteúdo científico
em nossas pautas. Contudo, independentemente disso,
nosso principal trabalho é, além de informar e atualizar, fazer
com que os textos não sejam empobrecidos no processo de
‘tradução’ e, sim, acessíveis”.
KIFFER, D. Comunicação sem barreiras. Rio Pesquisa, n. 37, dez. 2016 (adaptado).
Considerando-se o tema tecnologias e acessibilidade, os', 'textos I e II aproximam-se porque apresentam projetos que', '[{"letra": "A", "texto": "garantem a igualdade entre as pessoas."}, {"letra": "B", "texto": "foram criados por uma pesquisadora surda."}, {"letra": "C", "texto": "tiveram origem em um curso de pós-graduação."}, {"letra": "D", "texto": "estão circunscritos ao espaço institucional da escola."}, {"letra": "E", "texto": "têm como objetivo a disseminação do conhecimento."}]', 'E', 'Ambos os textos tratam de projetos tecnológicos (Mural Eletrônico e Surdonews) desenvolvidos para promover a inclusão e a difusão da informação.', NULL, NULL, 'resumida', FALSE, FALSE, '5bcb66295fad398f97577fa7ac554d8a033d4fa91c04a130946f7f56911bd379', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Descrição narrativa / Mestiçagem e regionalismo', 2022, '1º dia', 'INEP', 23, 'Questão 23', 'linguagens', 'medio', 'Mas seu olhar verde, inconfundível, impressionante,
iluminava com sua luz misteriosa as sombrias arcadas
superciliares, que pareciam queimadas por ela, dizia logo
a sua origem cruzada e decantada através das misérias
e dos orgulhos de homens de aventura, contadores de
histórias fantásticas, e de mulheres caladas e sofredoras,
que acompanhavam os maridos e amantes através
das matas intermináveis, expostas às febres, às feras,
às cobras do sertão indecifrável, ameaçador e sem fim, que
elas percorriam com a ambição única de um “pouso” onde
pudessem viver, por alguns dias, a vida ilusória de família
e de lar, sempre no encalço dos homens, enfebrados pela
procura do ouro e do diamante.
PENNA, C. Fronteira. Rio de Janeiro: Tecnoprint, s/d.
Ao descrever os olhos de Maria Santa, o narrador', 'estabelece correlações que refletem a', '[{"letra": "A", "texto": "caracterização da personagem como mestiça."}, {"letra": "B", "texto": "construção do enredo de conquistas da família."}, {"letra": "C", "texto": "relação conflituosa das mulheres e seus maridos."}, {"letra": "D", "texto": "nostalgia do desejo de viver como os antepassados."}, {"letra": "E", "texto": "marca de antigos sofrimentos no fluxo de consciência."}]', 'A', 'A descrição pormenorizada do olhar de Maria Santa estabelece correlações que expressam sua caracterização como personagem mestiça.', NULL, NULL, 'resumida', FALSE, FALSE, '90a7e8458d59a28a9dad33db7f00b4c1819f0e7ea5be3689407ddf98c6b3066f', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Variação e adequação linguística / Linguagem jurídica', 2022, '1º dia', 'INEP', 24, 'Questão 24', 'linguagens', 'facil', 'O complexo de falar difícil
O que importa realmente é que o(a) detentor(a)
do notável saber jurídico saiba quando e como deve
fazer uso desse português versão 2.0, até porque não
tem necessidade de alguém entrar numa padaria de
manhã com aquela cara de sono falando o seguinte:
“Por obséquio, Vossa Senhoria teria a hipotética
possibilidade de estabelecer com minha pessoa uma
relação de compra e venda, mediante as imposições
dos códigos Civil e do Consumidor, para que seja
possível a obtenção de 10 pãezinhos em temperatura
estável para que a relação pecuniária no valor de
R$ 5,00 seja plenamente legítima e capaz de saciar
minha fome matinal?”.
O problema é que temos uma cultura de valorizar
quem demonstra ser inteligente ao invés de valorizar quem
é. Pela nossa lógica, todo mundo que fala difícil tende a
ser mais inteligente do que quem valoriza o simples, e
99,9% das pessoas que estivessem na padaria iriam ficar
boquiabertas se alguém fizesse uso das palavras que
eu disse acima em plenas 7 da manhã em vez de dizer:
“Bom dia! O senhor poderia me vender cinco reais de pão
francês?”.
Agora entramos na parte interessante: o que
realmente é falar difícil? Simplesmente fazer uso de
palavras que a maioria não faz ideia do que seja é um
ato de falar difícil? Eu penso que não, mas é assim que
muita gente age. Falar difícil é fazer uso do simples,
mas com coerência e coesão, deixar tudo amarradinho
gramaticalmente falando. Falar difícil pode fazer alguém
parecer inteligente, mas não por muito tempo. É claro que
em alguns momentos não temos como fugir do português
rebuscado, do juridiquês propriamente dito, como no
caso de documentos jurídicos, entre outros.
ARAÚJO, H. Disponível em: www.diariojurista.com. Acesso em: 20 nov. 2021 (adaptado).', 'Nesse artigo de opinião, ao fazer uso de uma fala
rebuscada no exemplo da compra do pão, o autor
evidencia a importância de(a)', '[{"letra": "A", "texto": "se ter um notável saber jurídico."}, {"letra": "B", "texto": "valorização da inteligência do falante."}, {"letra": "C", "texto": "falar difícil para demonstrar inteligência."}, {"letra": "D", "texto": "coesão e da coerência em documentos jurídicos."}, {"letra": "E", "texto": "adequação da linguagem à situação de comunicação."}]', 'E', 'O artigo satiriza o uso do ''juridiquês'' na compra do pão na padaria, ressaltando a importância de adequar a linguagem à situação comunicativa.', NULL, NULL, 'resumida', FALSE, FALSE, '9df7da08892028970f571c377cd3eabe89fd3ab211ab0508cd63904245ad8146', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Educação Física', 'Esporte e representatividade feminina / Quebra de estereótipos', 2022, '1º dia', 'INEP', 25, 'Questão 25', 'linguagens', 'facil', 'A conquista da medalha de prata por Rayssa Leal,
no skate street nos Jogos Olímpicos, é exemplo da
representatividade feminina no esporte, avalia a âncora do
jornal da rede de televisão da CNN. A apresentadora, que
também anda de skate, celebrou a vitória da brasileira,
que entrou para a história como a atleta mais nova a subir
num pódio defendendo o Brasil. “Essa representatividade
do esporte nos Jogos faz pensarmos que não temos que
ficar nos encaixando em nenhum lugar. Posso gostar de
passar notícia e, mesmo assim, gostar de skate, subir
montanha, mergulhar, andar de bike, fazer yoga. Temos
que parar de ficar enquadrando as pessoas dentro de
regras. A gente vive num padrão no qual a menina ganha
boneca, mas por que também não fazer um esporte de
aventura? Por que o homem pode se machucar, cair de
joelhos, e a menina tem que estar sempre lindinha dentro
de um padrão? Acabamos limitando os talentos das
pessoas”, afirmou a jornalista, sobre a prática do skate
por mulheres.
Disponível em: www.cnnbrasil.com.br. Acesso em: 31 out. 2021 (adaptado).', 'O discurso da jornalista traz questionamentos sobre a
relação da conquista da skatista com a', '[{"letra": "A", "texto": "conciliação do jornalismo com a prática do skate."}, {"letra": "B", "texto": "inserção das mulheres na modalidade skate street."}, {"letra": "C", "texto": "desconstrução da noção do skate como modalidade masculina."}, {"letra": "D", "texto": "vanguarda de ser a atleta mais jovem a subir no pódio olímpico."}, {"letra": "E", "texto": "conquista de medalha nos Jogos Olímpicos de Tóquio."}]', 'C', 'A fala da jornalista celebra a conquista olímpica de Rayssa Leal como elemento de desconstrução da ideia do skate como modalidade masculina.', NULL, NULL, 'resumida', FALSE, FALSE, '352b04a7fce63a09eaa229bd29420d4548078a83f9066d18f3ca834d94444484', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Funções da linguagem / Emotiva na letra de música', 2022, '1º dia', 'INEP', 26, 'Questão 26', 'linguagens', 'facil', 'Assentamento
Zanza daqui
Zanza pra acolá
Fim de feira, periferia afora
A cidade não mora mais em mim
Francisco, Serafim
Vamos embora
Ver o capim
Ver o baobá
Vamos ver a campina quando flora
A piracema, rios contravim
Binho, Bel, Bia, Quim
Vamos embora
Quando eu morrer
Cansado de guerra
Morro de bem
Com a minha terra:
Cana, caqui
Inhame, abóbora
Onde só vento se semeava outrora
Amplidão, nação, sertão sem fim
Ó Manuel, Miguilim
Vamos embora
BUARQUE, C. As cidades. Rio de Janeiro: RCA, 1998 (fragmento).
Nesse texto, predomina a função poética da linguagem.', 'Entretanto, a função emotiva pode ser identificada no verso:', '[{"letra": "A", "texto": "“Zanza pra acolá”."}, {"letra": "B", "texto": "“Fim de feira, periferia afora”."}, {"letra": "C", "texto": "“A cidade não mora mais em mim”."}, {"letra": "D", "texto": "“Onde só vento se semeava outrora”."}, {"letra": "E", "texto": "“Ó Manuel, Miguilim”."}]', 'C', 'O verso ''A cidade não mora mais em mim'' expressa o sentimento subjetivo do eu lírico, evidenciando a função emotiva da linguagem.', NULL, NULL, 'resumida', TRUE, FALSE, '81a97dad51d8e6af2ea29f6f1c22bcd315e9716d5edf0795df75c16e713322d6', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Linguagem verbal e não verbal / Desconstrução de estereótipos', 2022, '1º dia', 'INEP', 27, 'Questão 27', 'linguagens', 'facil', 'tem estrada para andar
Os homens
não choram.
Mulher ao volante,
perigo constante.
Disponível em: https://viva-porto.pt. Acesso em: 24 nov. 2021 (adaptado).', 'A articulação entre os elementos verbais e os não verbais
do texto tem como propósito desencadear a', '[{"letra": "A", "texto": "identificação de distinções entre mulheres e homens."}, {"letra": "B", "texto": "revisão de representações estereotipadas de gênero."}, {"letra": "C", "texto": "adoção de medidas preventivas de combate ao sexismo."}, {"letra": "D", "texto": "ratificação de comportamentos femininos e masculinos."}, {"letra": "E", "texto": "retomada de opiniões a respeito da diversidade dos papéis sociais."}]', 'B', 'A rasura sobre frases feitas (''mulher ao volante'', ''homens não choram'') propõe a revisão de representações estereotipadas e antiquadas de gênero.', NULL, NULL, 'resumida', FALSE, FALSE, '1f2875c4fdb46a0ff626e41a7c56e52779ebca7b6a3fe7dc155d1b9ca7b5ad35', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Resistência indígena e identidade linguística / Povo Pataxó', 2022, '1º dia', 'INEP', 28, 'Questão 28', 'humanas', 'medio', 'As línguas silenciadas do Brasil
Para aprender a língua de seu povo, o professor
Txaywa Pataxó, de 29 anos, precisou estudar os fatores
que, por diversas vezes, quase provocaram a extinção
da língua patxôhã. Mergulhou na história do Brasil e
descobriu fatos violentos que dispersaram os pataxós,
forçados a abandonar a própria língua para escapar da
perseguição. “Os pataxós se espalharam, principalmente,
depois do Fogo de 1951. Queimaram tudo e expulsaram
a gente das nossas terras. Isso constrange o nosso povo
até hoje”, conta Txaywa, estudante da Universidade
Federal de Minas Gerais e professor na aldeia Barra
Velha, região de Porto Seguro (BA). Mais de quatro
décadas depois, membros da etnia retornaram ao antigo
local e iniciaram um movimento de recuperação da língua
patxôhã. Os filhos de Sameary Pataxó já são fluentes —
e ela, que se mudou quando já era adulta para a aldeia,
tenta aprender um pouco com eles. “É a nossa identidade.
Você diz quem você é por meio da sua língua”, afirma a
professora de ensino fundamental sobre a importância
de restaurar a língua dos pataxós. O patxôhã está entre
as línguas indígenas faladas no Brasil: o IBGE estimou
274 línguas no último censo. A publicação Povos indígenas
no Brasil 2011/2016, do Instituto Socioambiental, calcula
160. Antes da chegada dos portugueses, elas totalizavam
mais de mil.
Disponível em: https://brasil.elpais.com. Acesso em: 11 jun. 2019 (adaptado).', 'O movimento de recuperação da língua patxôhã assume
um caráter identitário peculiar na medida em que', '[{"letra": "A", "texto": "denuncia o processo de perseguição histórica sofrida pelos povos indígenas."}, {"letra": "B", "texto": "conjuga o ato de resistência étnica à preservação da memória cultural."}, {"letra": "C", "texto": "associa a preservação linguística ao campo da pesquisa acadêmica."}, {"letra": "D", "texto": "estimula o retorno de povos indígenas a suas terras de origem."}, {"letra": "E", "texto": "aumenta o número de línguas indígenas faladas no Brasil."}]', 'B', 'O movimento de retomada da língua patxôhã associa a resistência étnica à preservação da memória cultural afetada por perseguições.', NULL, NULL, 'resumida', FALSE, FALSE, '41520516b7e73cbf499f2e43e20792c0c5c27e0d13d83ebdfad9883239bc14bc', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Realismo / Ironia machadiana', 2022, '1º dia', 'INEP', 29, 'Questão 29', 'linguagens', 'medio', 'Esaú e Jacó
B árbara entrou, enquanto o pai pegou da viola e
passou ao patamar de pedra, à porta da esquerda.
Era uma criaturinha leve e breve, saia bordada, chinelinha
no pé. Não se lhe podia negar um corpo airoso. Os cabelos,
apanhados no alto da cabeça por um pedaço de fita
enxovalhada, faziam-lhe um solidéu natural, cuja borla era
suprida por um raminho de arruda. Já vai nisto um pouco
de sacerdotisa. O mistério estava nos olhos. Estes eram
opacos, não sempre nem tanto que não fossem também
lúcidos e agudos, e neste último estado eram igualmente
compridos; tão compridos e tão agudos que entravam
pela gente abaixo, revolviam o coração e tornavam cá
fora, prontos para nova entrada e outro revolvimento.
Não te minto dizendo que as duas sentiram tal ou qual
fascinação. Bárbara interrogou-as; Natividade disse
ao que vinha e entregou-lhe os retratos dos filhos e os
cabelos cortados, por lhe haverem dito que bastava.
— Basta, confirmou Bárbara. Os meninos são seus filhos?
— São.
ASSIS, M. Obra completa. Rio de Janeiro: Nova Aguilar, 1994.
No relato da visita de duas mulheres ricas a uma vidente
no Morro do Castelo, a ironia — um dos traços mais', 'representativos da narrativa machadiana — consiste no', '[{"letra": "A", "texto": "modo de vestir dos moradores do morro carioca."}, {"letra": "B", "texto": "senso prático em relação às oportunidades de renda."}, {"letra": "C", "texto": "mistério que cerca as clientes de práticas de vidência."}, {"letra": "D", "texto": "misto de singeleza e astúcia dos gestos da personagem."}, {"letra": "E", "texto": "interesse do narrador pelas figuras femininas ambíguas."}]', 'D', 'Machado de Assis constrói a vidente Bárbara combinando traços de singeleza com olhares astutos e manipuladores, evidenciando a ironia narrativa.', NULL, NULL, 'resumida', FALSE, FALSE, '7c59f7acfe1c8c1d50cdd20b685fc07d91c6fd7f8582137aa9a25cf69eaa6b48', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Naturalismo / Determinismo biológico e instinto', 2022, '1º dia', 'INEP', 30, 'Questão 30', 'linguagens', 'medio', 'A senhora manifestava-se por atos, por gestos,
e sobretudo por um certo silêncio, que amargava, que esfolava.
Porém desmoralizar escancaradamente o marido, não era
com ela. [...]
As negras receberam ordem para meter no serviço a gente
do tal compadre Silveira: as cunhadas, ao fuso; os cunhados,
ao campo, tratar do gado com os vaqueiros; a mulher e as
irmãs, que se ocupassem da ninhada. Margarida não tivera
filhos, e como os desejasse com a força de suas vontades,
tratava sempre bem aos pequenitos e às mães que os estavam
criando. Não era isso uma sentimentalidade cristã, uma ternura,
era o egoísta e cru instinto da maternidade, obrando por mera
simpatia carnal. Quanto ao pai do lote (referia-se ao Antônio),
esse que fosse ajudar ao vaqueiro das bestas.
Ordens dadas, o Quinquim referendava. Cada um
moralizava o outro, para moralizar-se.
PAIVA, M. O. Dona Guidinha do Poço. Rio de Janeiro: Tecnoprint, s/d.
No trecho do romance naturalista, a forma como', 'o narrador julga comportamentos e emoções das
personagens femininas revela influência do pensamento', '[{"letra": "A", "texto": "capitalista, marcado pela distribuição funcional do trabalho."}, {"letra": "B", "texto": "liberal, buscando a igualdade entre pessoas escravizadas e livres."}, {"letra": "C", "texto": "científico, considerando o ser humano como um fenômeno biológico."}, {"letra": "D", "texto": "religioso, fundamentado na fé e na aceitação dos dogmas do cristianismo."}, {"letra": "E", "texto": "afetivo, manifesto na determinação de acolher familiares e no respeito mútuo."}]', 'C', 'O narrador julga o comportamento da personagem sob a ótica naturalista/cientificista, reduzindo o desejo de maternidade ao mero instinto biológico.', NULL, NULL, 'resumida', FALSE, FALSE, '28a152371c4816f1772a8371a0866001e1f0536c880a187751a2c9d51037f376', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Romance de 30 / Drama dos retirantes', 2022, '1º dia', 'INEP', 31, 'Questão 31', 'linguagens', 'facil', 'Era o êxodo da seca de 1898. Uma ressurreição de
cemitérios antigos — esqueletos redivivos, com o aspecto
terroso e o fedor das covas podres.
Os fantasmas estropiados como que iam dançando,
de tão trôpegos e trêmulos, num passo arrastado de
quem leva as pernas, em vez de ser levado por elas.
Andavam devagar, olhando para trás, como quem
quer voltar. Não tinham pressa em chegar, porque não
sabiam aonde iam. Expulsos de seu paraíso por espadas
de fogo, iam, ao acaso, em descaminhos, no arrastão dos
maus fados.
Fugiam do sol e o sol guiava-os nesse forçado
nomadismo.
Adelgaçados na magreira cômica, cresciam, como se
o vento os levantasse. E os braços afinados desciam-lhes
aos joelhos, de mãos abanando.
Vinham escoteiros. Menos os hidrópicos — de ascite
consecutiva à alimentação tóxica — com os fardos das
barrigas alarmantes.
Não tinham sexo, nem idade, nem condição nenhuma.
Eram os retirantes. Nada mais.
ALMEIDA, J. A. A bagaceira. Rio de Janeiro: J. Olympio, 1978.', 'Os recursos composicionais que inserem a obra no
chamado “Romance de 30” da literatura brasileira
manifestam-se aqui no(a)', '[{"letra": "A", "texto": "desenho cru da realidade dramática dos retirantes."}, {"letra": "B", "texto": "indefinição dos espaços para efeito de generalização."}, {"letra": "C", "texto": "análise psicológica da reação dos personagens à seca."}, {"letra": "D", "texto": "engajamento político do narrador ante as desigualdades."}, {"letra": "E", "texto": "contemplação lírica da paisagem transformada em alegoria."}]', 'A', 'O trecho de ''A bagaceira'' enquadra-se no Romance de 30 ao apresentar o desenho cru e impactante da realidade dramática dos retirantes no Nordeste.', NULL, NULL, 'resumida', FALSE, FALSE, '14886e9e9d9d866414988b426300461eefb3b87cfbb2b952f62ff7edbbcfa8bb', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Orientação pediátrica / Uso de telas na infância', 2022, '1º dia', 'INEP', 32, 'Questão 32', 'linguagens', 'facil', 'MANUAL DE ORIENTAÇÃO
O primeiro guia prático da Sociedade Brasileira de Pediatria para ajudar
pais e pediatras no desafio de educar nativos digitais
TRABALHO DE BASE
Até 2 anos De 2 a 5 anos Até 10 anos
A criança não deve ser exposta
passivamente às telas — TV,
tablet, celular etc. —, principalmente
durante as refeições e até 2
horas antes de dormir.
O tempo de exposição às telas deve
ser limitado a 1 hora por dia. Crianças
dessa faixa etária devem ser mais
protegidas da violência virtual, pois
não sabem separar fantasia de realidade.
Devem ter acesso controlado
a computadores e dispositivos
móveis. Crianças de até 10
anos não devem usar TV ou
computador no próprio quarto.
Disponível em: https://tab.uol.com.br. Acesso em: 25 ago. 2017 (adaptado).', 'O texto sobre os chamados nativos digitais traz informações com a função de', '[{"letra": "A", "texto": "propor ações específicas para cada etapa da infância."}, {"letra": "B", "texto": "estabelecer regras que devem ser seguidas à risca."}, {"letra": "C", "texto": "explicar os efeitos do acesso precoce à internet."}, {"letra": "D", "texto": "determinar a incorporação de rituais à educação dos filhos."}, {"letra": "E", "texto": "educar com base em um conjunto de estratégias formativas."}]', 'A', 'O guia da Sociedade Brasileira de Pediatria traz recomendações para orientar pais e propor ações específicas para cada faixa etária da infância.', NULL, NULL, 'resumida', TRUE, FALSE, 'd8ceb4ca4d85eb1c675f3dcd94cda57f1ede2b95757aaf6a091d4115fb5f38c2', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Estilo machadiano / Inventário e rituais funèbres', 2022, '1º dia', 'INEP', 33, 'Questão 33', 'linguagens', 'facil', 'Notas
Soluços, lágrimas, casa armada, veludo preto nos portais, um homem que veio vestir o cadáver, outro que
tomou a medida do caixão, caixão, essa, tocheiros, convites, convidados que entravam, lentamente, a passo surdo,
e apertavam a mão à família, alguns tristes, todos sérios e calados, padre e sacristão, rezas, aspersões d’água benta,
o fechar do caixão, a prego e martelo, seis pessoas que o tomam da essa, e o levantam, e o descem a custo pela
escada, não obstante os gritos, soluços e novas lágrimas da família, e vão até o coche fúnebre, e o colocam em cima
e traspassam e apertam as correias, o rodar do coche, o rodar dos carros, um a um... Isto que parece um simples
inventário eram notas que eu havia tomado para um capítulo triste e vulgar que não escrevo.
ASSIS, M. Memórias póstumas de Brás Cubas. Disponível em: www.dominiopublico.gov.br.
Acesso em: 25 jul. 2022.', 'O recurso linguístico que permite a Machado de Assis considerar um capítulo de Memórias póstumas de Brás Cubas
como inventário é a', '[{"letra": "A", "texto": "enumeração de objetos e fatos."}, {"letra": "B", "texto": "predominância de linguagem objetiva."}, {"letra": "C", "texto": "ocorrência de período longo no trecho."}, {"letra": "D", "texto": "combinação de verbos no presente e no pretérito."}, {"letra": "E", "texto": "presença de léxico do campo semântico de funerais."}]', 'A', 'O recurso que permite considerar o capítulo como um inventário é a enumeração minuciosa de objetos, pessoas e procedimentos do velório.', NULL, NULL, 'resumida', FALSE, FALSE, '0133365f9389c30e59018c236298a0a7cd05f43116c2b9bf681179c865f35df1', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Educação Física', 'Esportes de aventura / Mountainboard', 2022, '1º dia', 'INEP', 34, 'Questão 34', 'linguagens', 'facil', 'Criado há cerca de 20 anos na Califórnia, o
mountainboard é um esporte de aventura que utiliza uma
espécie de skate off-road para realizar manobras similares
às das modalidades de snowboard, surf e do próprio
skate. A atividade chegou ao Brasil em 1997 e hoje possui
centenas de praticantes, um circuito nacional respeitável
e mais de uma dezena de pistas espalhadas pelo país.
Segundo consta na história oficial, o mountainboard foi
criado por praticantes de snowboard que sentiam falta
de praticar o esporte nos períodos sem neve. Para isso,
eles desenvolveram um equipamento bem simples:
uma prancha semelhante ao modelo utilizado na neve
(menor e um pouco menos flexível), com dois eixos
bem resistentes, alças para encaixar os pés e quatro
pneus com câmaras de ar para regular a velocidade que
pode ser alcançada em diferentes condições. Com essa
configuração, o esporte se mostrou possível em diversos
tipos de terreno: grama, terra, pedras, asfalto e areia.
Além desses pisos, também é possível procurar pelas
próprias trilhas para treinar as manobras.
Disponível em: www.webventure.com.br. Acesso em: 19 jun. 2019.', 'A história da prática do mountainboard representa
uma das principais marcas das atividades de aventura,
caracterizada pela', '[{"letra": "A", "texto": "competitividade entre seus praticantes."}, {"letra": "B", "texto": "atividade com padrões técnicos definidos."}, {"letra": "C", "texto": "modalidade com regras predeterminadas."}, {"letra": "D", "texto": "criatividade para adaptações a novos espaços."}, {"letra": "E", "texto": "necessidade de espaços definidos para a sua realização."}]', 'D', 'A criação do mountainboard demonstra a marca dos esportes de aventura caracterizada pela criatividade para adaptar manobras a novos terrenos.', NULL, NULL, 'resumida', FALSE, FALSE, '0340ef3f7ee84b6a932fc39bd7916f0bd8cc7739b523c7c97e46639146210025', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Gênero crônica / Refração e escrita jornalística', 2022, '1º dia', 'INEP', 35, 'Questão 35', 'linguagens', 'medio', 'Ser cronista
Sei que não sou, mas tenho meditado ligeiramente
no assunto.
Crônica é um relato? É uma conversa? É um resumo
de um estado de espírito? Não sei, pois antes de começar
a escrever para o Jornal do Brasil, eu só tinha escrito
romances e contos.
E também sem perceber, à medida que escrevia para
aqui, ia me tornando pessoal demais, correndo o risco
de em breve publicar minha vida passada e presente, o
que não pretendo. Outra coisa notei: basta eu saber que
estou escrevendo para o jornal, isto é, para algo aberto
facilmente por todo o mundo, e não para um livro, que
só é aberto por quem realmente quer, para que, sem
mesmo sentir, o modo de escrever se transforme. Não é
que me desagrade mudar, pelo contrário. Mas queria que
fossem mudanças mais profundas e interiores que não
viessem a se refletir no escrever. Mas mudar só porque
isso é uma coluna ou uma crônica? Ser mais leve só
porque o leitor assim o quer? Divertir? Fazer passar uns
minutos de leitura? E outra coisa: nos meus livros quero
profundamente a comunicação profunda comigo e com o
leitor. Aqui no jornal apenas falo com o leitor e agrada-me
que ele fique agradado. Vou dizer a verdade: não estou
contente.
LISPECTOR, C. In: A descoberta do mundo. Rio de Janeiro: Rocco, 1999.
No texto, ao refletir sobre a atividade de cronista, a autora', 'questiona características do gênero crônica, como', '[{"letra": "A", "texto": "relação distanciada entre os interlocutores."}, {"letra": "B", "texto": "articulação de vários núcleos narrativos."}, {"letra": "C", "texto": "brevidade no tratamento da temática."}, {"letra": "D", "texto": "descrição minuciosa dos personagens."}, {"letra": "E", "texto": "público leitor exclusivo."}]', 'C', 'Clarice Lispector reflete sobre sua atuação como cronista, questionando a exigência de brevidade e leveza no tratamento dos temas jornalísticos.', NULL, NULL, 'resumida', FALSE, FALSE, '6c890d871c5ba69dc1ec54889398d8219cd4a0d2f735f1da2baabb5db66d7e85', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Português', 'Gênero notícia / Conscientização sobre saúde pública', 2022, '1º dia', 'INEP', 36, 'Questão 36', 'linguagens', 'facil', 'Projeto na Câmara de BH quer a vacinação gratuita
de cães contra a leishmaniose
A doença é grave e vem causando preocupação na
região metropolitana da capital mineira
Ela é uma doença grave, transmitida pela picada do
mosquito-palha, e afeta tanto os seres humanos quanto
os cachorros: a leishmaniose. Por ser um problema de
saúde pública, a doença pode ganhar uma ação preventiva
importante, caso um projeto de lei seja aprovado na
Câmara Municipal de Belo Horizonte (CMBH). Diante
do alto número de casos da doença na Grande BH, a
Comissão de Saúde e Saneamento da CMBH aprovou
a proposta de realização de campanhas públicas de
vacinação gratuita de cães contra a leishmaniose, tema
do PL 404/17, apreciado pelo colegiado em reunião
ordinária, no dia 6 de dezembro.
Disponível em: https://revistaencontro.com.br. Acesso em: 11 dez. 2017.
Essa notícia, além de cumprir sua função informativa,', 'assume o papel de', '[{"letra": "A", "texto": "fiscalizar as ações de saúde e saneamento da cidade."}, {"letra": "B", "texto": "defender os serviços gratuitos de atendimento à população."}, {"letra": "C", "texto": "conscientizar a população sobre grave problema de saúde pública."}, {"letra": "D", "texto": "propor campanhas para a ampliação de acesso aos serviços públicos."}, {"letra": "E", "texto": "responsabilizar os agentes públicos pela demora na tomada de decisões."}]', 'C', 'A notícia cumpre sua função informativa e assume o papel de conscientizar a população sobre a leishmaniose e a necessidade de vacinação.', NULL, NULL, 'resumida', TRUE, FALSE, 'ed6b0a63cd8cf751eda334e65cf5da02a74483b7d5b3b9e06b6594b4704510d4', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Redes sociais e saúde mental / Positividade tóxica', 2022, '1º dia', 'INEP', 37, 'Questão 37', 'humanas', 'facil', '“Vida perfeita” em redes sociais pode afetar a
saúde mental
Nas várias redes sociais que povoam a internet,
os chamados digital influencers estão sempre felizes
e pregam a felicidade como um estilo de vida. Essas
pessoas espalham conteúdo para milhares de seguidores,
ditando tendência e mostrando um estilo de vida sonhado
por muitos, como o corpo esbelto, viagens incríveis,
casas deslumbrantes, carros novos e alegria em tempo
integral, algo bem improvável de ocorrer o tempo todo,
aponta Carla Furtado, mestre em psicologia e fundadora
do Instituto Feliciência.
A problemática pode surgir com a busca incessante
por essa felicidade, que gera efeitos colaterais em quem
consome diariamente a “vida perfeita” de outros. Daí vem
o conceito de positividade tóxica: a expressão tem sido
usada para abordar uma espécie de pressão pela adoção
de um discurso positivo, aliada a uma vida editada para
as redes sociais. Para manter a saúde mental e evitar ser
atingido pela positividade tóxica, o uso racional das redes
sociais é o mais indicado, aconselha a médica psiquiatra
Renata Nayara Figueiredo, presidente da Associação
Psiquiátrica de Brasília (APBr).
Disponível em: https://agenciabrasil.ebc.com.br. Acesso em: 21 nov. 2021 (adaptado).
Associada ao ideário de uma “vida perfeita”, a positividade
tóxica mencionada no texto é um fenômeno social', 'recente, que se constitui com base em', '[{"letra": "A", "texto": "representações estereotipadas e superficiais de felicidade."}, {"letra": "B", "texto": "ressignificações contemporâneas do conceito de alegria."}, {"letra": "C", "texto": "estilos de vida inacessíveis para a sociedade brasileira."}, {"letra": "D", "texto": "atitudes contraditórias de influenciadores digitais."}, {"letra": "E", "texto": "padrões idealizados e nocivos de beleza física."}]', 'A', 'A positividade tóxica é descrita como um fenômeno recente constituído por representações estereotipadas, editadas e superficiais de felicidade.', NULL, NULL, 'resumida', FALSE, FALSE, 'd6f74a1e23ee0345bd1d3aa20befa3d8023d4a5209e72d2919e08ede4c351df2', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Artes', 'Maneirismo / El Greco e distorção figurativa', 2022, '1º dia', 'INEP', 38, 'Questão 38', 'linguagens', 'medio', 'TEXTO I
EL GRECO. Laocoonte. Óleo sobre tela, 1,37cm x 1,72cm.
National Gallery of Art, Washington, Estados Unidos, circa 1610-1614.
Disponível em: https://images.nga.gov. Acesso em: 28 jun. 2019 (adaptado).
TEXTO II
Essa impressionante obra apresenta o sacerdote
Laocoonte sendo punido pelos deuses por tentar alertar
os troianos da ameaça do Cavalo de Troia, que escondia
um grupo de soldados gregos. Enviadas pelos deuses,
serpentes marinhas são vistas matando Laocoonte e
seus dois filhos como forma de punição.
KAY, A. In: FARTHING, S. (Org.). Tudo sobre arte.
Rio de Janeiro: Sextante, 2011 (adaptado).
Produzida no início do século XVII, a obra maneirista', 'distingue-se pela', '[{"letra": "A", "texto": "representação da nudez masculina."}, {"letra": "B", "texto": "distorção ao representar a figura humana."}, {"letra": "C", "texto": "evocação de um fato da cultura clássica grega."}, {"letra": "D", "texto": "presença do tema da morte como punição da família."}, {"letra": "E", "texto": "utilização da perspectiva para integrar os diferentes planos."}]', 'B', 'A obra ''Laocoonte'', de El Greco, distingue-se pelo estilo maneirista marcado pela distorção e alongamento das figuras humanas.', NULL, NULL, 'resumida', FALSE, FALSE, '8e93462722ecc2fa2be1a538ee369ea2ef4dc8bd405d63c70aeeda066b0e3509', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Artes', 'Minimalismo / Formas sintéticas no espaço', 2022, '1º dia', 'INEP', 39, 'Questão 39', 'linguagens', 'medio', 'TEXTO I
JUDD, D. Sem título. 1969.
Disponível em: https://dasartes.com.br. Acesso em: 16 jun. 2022.
TEXTO II
Embora não fosse um grupo ou um movimento
organizado, o Minimalismo foi um dos muitos rótulos
(incluindo estruturas primárias, objetos unitários, arte
ABC e Cool Art) aplicados pelos críticos para descrever
estruturas aparentemente simples que alguns artistas
estavam criando. Quando a arte minimalista começou
a surgir, muitos críticos e um público opinativo
julgaram-na fria, anônima e imperdoável. Os materiais
industriais pré-fabricados frequentemente usados não
pareciam “arte”.
DEMPSEY, A. Estilos, escolas e movimentos. São Paulo: Cosac & Naify, 2003 (adaptado).
De acordo com os textos I e II, compreende-se que a obra', 'minimalista é uma', '[{"letra": "A", "texto": "representação da simplicidade pelo artista."}, {"letra": "B", "texto": "exploração da técnica da escultura cubista."}, {"letra": "C", "texto": "valorização do cotidiano por meio da geometria."}, {"letra": "D", "texto": "utilização da complexidade dos elementos formais."}, {"letra": "E", "texto": "combinação de formas sintéticas no espaço utilizado."}]', 'E', 'De acordo com os textos, a escultura minimalista de Donald Judd caracteriza-se pela combinação de formas tridimensionais sintéticas e repetitivas.', NULL, NULL, 'resumida', FALSE, FALSE, '0a6f603fc1b0c6fa38251dc9d9209d0cdf11ee20d3167905047b51ec83d1629d', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Regionalismo / Afetividade e lirismo sertanejo', 2022, '1º dia', 'INEP', 40, 'Questão 40', 'linguagens', 'medio', 'Firmo, o vaqueiro
No dia seguinte, à hora em que saía o gado, estava eu
debruçado à varanda quando vi o cafuzo que preparava o
animal viajeiro:
— Raimundinho, como vai ele?...
De longe apontou a palhoça.
— Sim.
O braço caiu-lhe, olhou-me algum tempo comovido;
depois, saltando para o animal, levou o polegar à boca
fazendo estalar a unha nos dentes: “Às quatro horas
da manhã... Atirei um verso e disse, para bulir com ele:
Pega, velho! Não respondeu. Tio Firmo, mesmo velho e
doente, não era homem para deixar um verso no chão...
Fui ver, coitado!... estava morto”. E deu de esporas para
que eu não lhe visse as lágrimas.
NETTO, C. In: MARCHEZAN, L. G. (Org.). O conto regionalista.', 'São Paulo: Martins Fontes, 2009.
A passagem registra um momento em que a
expressividade lírica é reforçada pela', '[{"letra": "A", "texto": "plasticidade da imagem do rebanho reunido."}, {"letra": "B", "texto": "sugestão da firmeza do sertanejo ao arrear o cavalo."}, {"letra": "C", "texto": "situação de pobreza encontrada nos sertões brasileiros."}, {"letra": "D", "texto": "afetividade demonstrada ao noticiar a morte do cantador."}, {"letra": "E", "texto": "preocupação do vaqueiro em demonstrar sua virilidade."}]', 'D', 'A passagem registra a emoção do vaqueiro ao noticiar a morte do velho cantador de versos, reforçando a expressividade lírica da cena.', NULL, NULL, 'resumida', FALSE, FALSE, 'a3700bd4c1a1655e11629fef682029ac4eb5bbbe0ed36fd36d66ef58ce0c34ec', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Prosa moderna / Carnaval e ambivalência moral', 2022, '1º dia', 'INEP', 41, 'Questão 41', 'linguagens', 'medio', 'O bebê de tarlatana rosa
— [...] Na terça desliguei-me do grupo e caí no mar alto
da depravação, só, com uma roupa leve por cima da pele e
todos os maus instintos fustigados. De resto a cidade inteira
estava assim. É o momento em que por trás das máscaras
as meninas confessam paixões aos rapazes, é o instante
em que as ligações mais secretas transparecem, em que
a virgindade é dúbia, e todos nós a achamos inútil, a honra
uma caceteação, o bom senso uma fadiga. Nesse momento
tudo é possível, os maiores absurdos, os maiores crimes;
nesse momento há um riso que galvaniza os sentidos e o
beijo se desata naturalmente.
Eu estava trepidante, com uma ânsia de acanalhar-me,
quase mórbida. Nada de raparigas do galarim perfumadas
e por demais conhecidas, nada do contato familiar,
mas o deboche anônimo, o deboche ritual de chegar,
pegar, acabar, continuar. Era ignóbil. Felizmente muita
gente sofre do mesmo mal no carnaval.
RIO, J. Dentro da noite. São Paulo: Antiqua, 2002.
No texto, o personagem vincula ao carnaval atitudes e', 'reações coletivas diante das quais expressa', '[{"letra": "A", "texto": "consagração da alegria do povo."}, {"letra": "B", "texto": "atração e asco perante atitudes libertinas."}, {"letra": "C", "texto": "espanto com a quantidade de foliões nas ruas."}, {"letra": "D", "texto": "intenção de confraternizar com desconhecidos."}, {"letra": "E", "texto": "reconhecimento da festa como manifestação cultural."}]', 'B', 'O narrador demonstra atração e repulsa simultâneas perante as atitudes libertinas e o descontrole comportamental observados no carnaval.', NULL, NULL, 'resumida', FALSE, FALSE, '3898ef160fbfcad4635857e156ea3e349694cb5475eb8a1742a0c06b83706ec3', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Literatura testemunhal / Carolina Maria de Jesus', 2022, '1º dia', 'INEP', 42, 'Questão 42', 'linguagens', 'facil', '10 de maio
Fui na delegacia e falei com o tenente. Que homem
amavel! Se eu soubesse que ele era tão amavel, eu teria
ido na delegacia na primeira intimação. [...] O tenente
interessou-se pela educação dos meus filhos. Disse-me
que a favela é um ambiente propenso, que as pessoas
tem mais possibilidade de delinquir do que tornar-se util
a patria e ao país. Pensei: se ele sabe disto, porque não
faz um relatorio e envia para os politicos? O senhor Janio
Quadros, o Kubstchek e o Dr. Adhemar de Barros?
Agora falar para mim, que sou uma pobre lixeira.
Não posso resolver nem as minhas dificuldades.... O Brasil precisa ser dirigido por uma pessoa que já
passou fome. A fome tambem é professora.
Quem passa fome aprende a pensar no próximo,
e nas crianças.
JESUS, C. M. Quarto de despejo: diário de uma favelada. São Paulo: Ática, 2014.', 'A partir da intimação recebida pelo filho de 9 anos,
a autora faz uma reflexão em que transparece a', '[{"letra": "A", "texto": "lição de vida comunicada pelo tenente."}, {"letra": "B", "texto": "predisposição materna para se emocionar."}, {"letra": "C", "texto": "atividade política marcante da comunidade."}, {"letra": "D", "texto": "resposta irônica ante o discurso da autoridade."}, {"letra": "E", "texto": "necessidade de revelar seus anseios mais íntimos."}]', 'D', 'Carolina Maria de Jesus responde com ironia e lucidez ao discurso paternalista do tenente, afirmando a autoridade de quem vivenciou a fome.', NULL, NULL, 'resumida', FALSE, FALSE, 'f5e772af548e86f1e0528eae0eaff95792f6b6ea06169dcfc4478d151dd5388e', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Literatura', 'Narrativa de memória / Violência e alusão literária', 2022, '1º dia', 'INEP', 43, 'Questão 43', 'linguagens', 'medio', 'Vanda vinha do interior de Minas Gerais e de dentro
de um livro de Charles Dickens. Sem dinheiro para criá-la,
sua mãe a dera, com seus sete anos, a uma conhecida.
Ao recebê-la, a mulher perguntou o que a garotinha
gostava de comer. Anotou tudo num papel. Mal a mãe
virou as costas, no entanto, a fulana amassou a lista e,
como uma vilã de folhetim, decretou: “A partir de hoje,
você não vai mais nem sentir o cheiro dessas comidas!”.
Vanda trabalhou lá até os quinze anos, quando
recebeu a carta de uma prima com uma nota de cem
cruzeiros, saiu de casa com a roupa do corpo e fugiu num
ônibus para São Paulo.
Todas as vezes que eu e minha irmã a importunávamos
com nossas demandas de criança mimada, ela nos contava
histórias da infância de gata-borralheira, fazia-nos apertar
seu nariz quebrado por uma das filhas da “patroa” com um
rolo de amassar pão e nos expulsava da cozinha: “Sai pra
lá, peste, e me deixa acabar essa janta”.
PRATA, A. Nu de botas. São Paulo: Cia. das Letras, 2013 (adaptado).
Pela ótica do narrador, a trajetória da empregada de sua', 'casa assume um efeito expressivo decorrente da', '[{"letra": "A", "texto": "citação a referências literárias tradicionais."}, {"letra": "B", "texto": "alusão à inocência das crianças da época."}, {"letra": "C", "texto": "estratégia de questionar a bondade humana."}, {"letra": "D", "texto": "descrição detalhada das pessoas do interior."}, {"letra": "E", "texto": "representação anedótica de atos de violência."}]', 'A', 'A trajetória da empregada Vanda assume efeito expressivo pela citação e comparação com referências literárias tradicionais (Charles Dickens, Cinderela).', NULL, NULL, 'resumida', FALSE, FALSE, '2a15887da4f5f96f8708ad3cba5785ccb36b55d6cb79eafbca91c59f2c610e1b', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Artes', 'Arte conceitual / Diálogo com o Ready-made', 2022, '1º dia', 'INEP', 44, 'Questão 44', 'linguagens', 'medio', 'TEXTO I
SILVEIRA, R. In absentia, 1983. Instalação, 17ª Bienal de São Paulo.
Disponível em: www.bienal.org.br. Acesso em: 1 set. 2016 (adaptado).
TEXTO II
O termo ready-made foi criado por Marcel Duchamp
(1887-1968) para designar um tipo de objeto, por ele
inventado, que consiste em um ou mais artigos de uso
cotidiano, produzidos em massa, selecionados sem
critérios estéticos e expostos como obras de arte em
espaços especializados (museus e galerias). Seu primeiro
ready-made, de 1912, é uma roda de bicicleta montada
sobre um banquinho (Roda de bicicleta ). Ao transformar
qualquer objeto em obra de arte, o artista realiza uma
crítica radical ao sistema da arte.
Disponível em: www.bienal.org.br. Acesso em: 1 set. 2016 (adaptado).
A instalação In absentia propõe um diálogo com o', 'ready-made Roda de bicicleta, demonstrando que', '[{"letra": "A", "texto": "as formas de criticar obras do passado se repetem."}, {"letra": "B", "texto": "a recorrência de temas marca a arte do final do século XX."}, {"letra": "C", "texto": "as criações desmistificam os valores estéticos estabelecidos."}, {"letra": "D", "texto": "o distanciamento temporal permite a transformação dos referenciais estéticos."}, {"letra": "E", "texto": "o objeto ausente sugere a degradação da forma superando o modelo artístico."}]', 'C', 'A instalação de Regina Silveira dialoga com Duchamp projetando a sombra do objeto ausente, desmistificando os valores estéticos estabelecidos.', NULL, NULL, 'resumida', FALSE, FALSE, 'b9abf43e042304934492ed79c312f9b75b43ba9b0ef1cb7db4724eb75e9cc959', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Artes', 'Manguebeat / Hibridismo e renovação cultural', 2022, '1º dia', 'INEP', 45, 'Questão 45', 'linguagens', 'facil', 'O Recife fervilhava no começo da década de 1990, e
os artistas trabalhavam para resgatar o prestígio da cultura
pernambucana. Era preciso se inspirar, literalmente, nas
raízes sobre as quais a cidade se construiu. Foi aí que,
em 1992, com a publicação de um manifesto escrito
pelo músico e jornalista Fred Zero Quatro, da banda
Mundo Livre S/A, nasceu o manguebeat. O nome vem
de “mangue”, vegetação típica da região, e “beat”, para
representar as batidas e as influências musicais que o
movimento abraçaria a partir dali. Era a hora e a vez
de os caranguejos — aos quais os músicos recifenses
gostavam de se comparar — mostrarem as caras:
o maracatu e suas alfaias se misturaram com as batidas
do hip-hop, as guitarras do rock, elementos eletrônicos e
o sotaque recifense de Chico Science. A busca pelo novo
rendeu uma perspectiva diferente do Brasil ao olhar para o
Recife. A cidade deixou de ser o lugar apenas do frevo
e do carnaval, transformando-se na ebulição musical
que continua a acontecer mesmo após os 25 anos do
lançamento do primeiro disco da Nação Zumbi, Da lama
ao caos.
FORCIONI, G. et al. O mangue está de volta. Revista Esquinas, n. 87, set. 2019 (adaptado).
Chico Science foi fundamental para a renovação da', 'música pernambucana, fato que se deu pela', '[{"letra": "A", "texto": "utilização de aparelhos musicais eletrônicos em lugar dos instrumentos tradicionais."}, {"letra": "B", "texto": "ocupação de espaços da natureza local para a produção de eventos musicais memoráveis."}, {"letra": "C", "texto": "substituição de antigas práticas musicais, como o frevo, por melodias e harmonias inovadoras."}, {"letra": "D", "texto": "recuperação de composições tradicionais folclóricas e sua apresentação em grandes festivais."}, {"letra": "E", "texto": "integração de referenciais culturais de diferentes origens, criando uma nova combinação estética."}]', 'E', 'Chico Science renovou a música pernambucana ao integrar referenciais culturais locais (maracatu) com influências globais (rock, hip-hop, eletrônica).', NULL, NULL, 'resumida', FALSE, FALSE, '5d5f6e96759373eaf85ded57c82f1fa61f251803190aac829e1c231d6088f707', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Cultura sertaneja e leitura do clima / Caatinga', 2022, '1º dia', 'INEP', 46, 'Questão 46', 'humanas', 'facil', 'Espera, resignado, o dia 13 daquele mês porque,
em tal data, usança avoenga lhe faculta sondar o futuro,
interrogando a providência. É a experiência tradicional de
Santa Luzia. No dia 12 ao anoitecer expõe ao relento,
em linha, seis pedrinhas de sal, que representam, em
ordem sucessiva da esquerda para a direita, os seis
meses vindouros, de janeiro a junho. Ao alvorecer de 13
observa-as: se estão intactas, pressagiam a seca; se a
primeira apenas se deliu, transmudada em aljôfar límpido,
é certa a chuva em janeiro; se a segunda, em fevereiro;
se a maioria ou todas, é inevitável o inverno benfazejo.
Esta experiência é belíssima.
CUNHA, E. Os sertões. São Paulo: Editora Três, 1984.
No experimento descrito, a relação com a paisagem e', 'com a religiosidade permite que o sertanejo seja', '[{"letra": "A", "texto": "afeito à devoção ao aceitar destinos sacralizados."}, {"letra": "B", "texto": "acostumado à pobreza ao admitir acasos naturais."}, {"letra": "C", "texto": "habituado ao solo ao conhecer terrenos cultiváveis."}, {"letra": "D", "texto": "íntimo à Caatinga ao interpretar condições ambientais."}, {"letra": "E", "texto": "próximo à vegetação ao identificar espécies arbustivas."}]', 'D', 'O experimento tradicional de Santa Luzia demonstra a intimidade do sertanejo com o bioma Caatinga e os sinais naturais de precipitação.', NULL, NULL, 'resumida', FALSE, FALSE, '3545a0296b5421d93458466b55ca12e8737dfe80b613544e06cd8821ed16239c', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Filosofia', 'Filosofia política / Hannah Arendt e o discurso', 2022, '1º dia', 'INEP', 47, 'Questão 47', 'humanas', 'medio', 'Sempre que a relevância do discurso entra em
jogo, a questão torna-se política por definição, pois é o
discurso que faz do homem um ser político. E tudo que os
homens fazem, sabem ou experimentam só tem sentido
na medida em que pode ser discutido. Haverá, talvez,
verdades que ficam além da linguagem e que podem ser
de grande relevância para o homem no singular, isto é,
para o homem que, seja o que for, não é um ser político.
Mas homens no plural, isto é, os homens que vivem e se
movem e agem neste mundo, só podem experimentar o
significado das coisas por poderem falar e ser inteligíveis
entre si e consigo mesmos.
ARENDT, H. A condição humana. Rio de Janeiro: Forense Universitária, 2004.
No trecho, a filósofa Hannah Arendt mostra a importância', 'da linguagem no processo de', '[{"letra": "A", "texto": "entendimento da cultura."}, {"letra": "B", "texto": "aumento da criatividade."}, {"letra": "C", "texto": "percepção da individualidade."}, {"letra": "D", "texto": "melhoria da técnica."}, {"letra": "E", "texto": "construção da sociabilidade."}]', 'E', 'Hannah Arendt destaca que o discurso e a linguagem são os pilares fundamentais para a construção da sociabilidade e da vida política plural.', NULL, NULL, 'resumida', FALSE, FALSE, 'f03df79e22b99f8deb16f2de78cfcb2385951fe4c153fe3ae728c179a5ecd5ee', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Relações étnico-raciais / Racismo estrutural', 2022, '1º dia', 'INEP', 48, 'Questão 48', 'humanas', 'facil', 'Eu estava pagando o sapateiro e conversando com
um preto que estava lendo um jornal. Ele estava revoltado
com um guarda civil que espancou um preto e amarrou
numa árvore. O guarda civil é branco. E há certos brancos
que transforma preto em bode expiatório. Quem sabe se
guarda civil ignora que já foi extinta a escravidão e ainda
estamos no regime da chibata?
JESUS, C. M. Quarto de despejo: diário de uma favelada. São Paulo: Ática, 2014.
O texto, que guarda a grafia original da autora, expõe', 'uma característica da sociedade brasileira, que é o(a):', '[{"letra": "A", "texto": "Racismo estrutural."}, {"letra": "B", "texto": "Desemprego latente."}, {"letra": "C", "texto": "Concentração de renda."}, {"letra": "D", "texto": "Exclusão informacional."}, {"letra": "E", "texto": "Precariedade da educação."}]', 'A', 'O texto de Carolina Maria de Jesus expõe a permanência de práticas violentas e preconceituosas contra negros, caracterizando o racismo estrutural.', NULL, NULL, 'resumida', FALSE, FALSE, '63ccc349c2d7c31262f2cee783bbe09371776a865ed7ee0dec1375bda03e5ae1', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Hidrografia urbana / Impermeabilização do solo', 2022, '1º dia', 'INEP', 49, 'Questão 49', 'humanas', 'facil', '10% - 20% de superfície impermeável
percolação
profunda: 21%
infiltração
subsuperficial: 21%
escoamento
superficial: 20%
evapotranspiração: 38%
escoamento
superficial: 30%
infiltração
subsuperficial: 20%
percolação
profunda: 15%
evapotranspiração: 35%
escoamento
superficial: 55%
infiltração
subsuperficial: 10%
percolação
profunda: 5%75% - 100% de superfície impermeável
evapotranspiração: 30%
Cobertura natural do solo
infiltração
subsuperficial: 25%
escoamento
superficial:10%
percolação
profunda: 25%
evapotranspiração: 40%
35% - 50% de superfície impermeável
PAZ, A. D. Disponível em: www.ct.ufpb.br. Acesso em: 15 out. 2021 (adaptado).', 'A intensificação da ocupação urbana demonstrada afeta
de forma imediata o(a)', '[{"letra": "A", "texto": "nível altimétrico."}, {"letra": "B", "texto": "ciclo hidrológico."}, {"letra": "C", "texto": "padrão climático."}, {"letra": "D", "texto": "tectônica de placas."}, {"letra": "E", "texto": "estrutura das rochas."}]', 'B', 'A intensificação da impermeabilização do solo nas áreas urbanas reduz a infiltração de água e afeta de forma imediata o ciclo hidrológico.', NULL, NULL, 'resumida', FALSE, FALSE, '3b3fba8cc90c4a5d5c407d286861f5712df32e1554902f9a79444a0625e8fd38', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Ocupação da Amazônia / Ferrovia Madeira-Mamoré', 2022, '1º dia', 'INEP', 50, 'Questão 50', 'humanas', 'medio', 'Na construção da ferrovia Madeira-Mamoré, o
que dizer dos doentes, eternos moribundos a vagar
entre delírios febris, doses de quinino e corredores da
morte? O Hospital da Candelária era santuário e túmulo,
monumento ao progresso científico e preâmbulo da
escuridão. Foi ali, com suas instalações moderníssimas,
que médicos e sanitaristas dirigiram seu combate
aos males tropicais. As maiores vítimas, contudo,
permaneceriam na sombra à margem do palco, cobaias
sem consolo, credores sem nome de uma sociedade que
não lhes concedera tempo algum para ser decifrada.
FOOT HARDMAN, F. Trem fantasma: modernidade na selva.
São Paulo: Cia. das Letras, 1988 (adaptado).
No texto, há uma crítica ao modo de ocupação do espaço', 'amazônico pautada na', '[{"letra": "A", "texto": "discrepância entre engenharia ambiental e equilíbrio da fauna."}, {"letra": "B", "texto": "incoerência entre maquinaria estrangeira e controle da floresta."}, {"letra": "C", "texto": "incompatibilidade entre investimento estatal e proteção aos nativos."}, {"letra": "D", "texto": "competição entre farmacologia internacional e produtos da fitoterapia."}, {"letra": "E", "texto": "contradição entre desenvolvimento nacional e respeito aos trabalhadores."}]', 'E', 'O texto critica a profunda contradição entre o discurso de modernização nacional e o desrespeito à vida e saúde dos trabalhadores na ferrovia.', NULL, NULL, 'resumida', FALSE, FALSE, '8da656f19d6198cc758fd4b3a04eb6b5b4bca554ca8dba348645b5daebe47681', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Economia global e redes / Desterritorialização da produção', 2022, '1º dia', 'INEP', 51, 'Questão 51', 'humanas', 'medio', 'Uma nova economia surgiu em escala global no
último quartel do século XX. Chamo-a de informacional,
global e em rede para identificar suas características
fundamentais e diferenciadas e enfatizar sua interligação.
É informacional porque depende basicamente de sua
capacidade de gerar, processar e aplicar de forma
eficiente a informação baseada em conhecimentos. É
global porque seus componentes estão organizados
em escala global, diretamente ou mediante uma rede
de conexões entre agentes econômicos. É rede porque
é feita em uma rede global de interação entre redes
empresariais.
CASTELLS, M. A sociedade em rede — a era da informação: economia,', 'sociedade e cultura. São Paulo: Paz e Terra, 1999 (adaptado).
Qual mudança estrutural é resultado da forma de
organização econômica descrita no texto?', '[{"letra": "A", "texto": "Fabricação em série."}, {"letra": "B", "texto": "Ampliação de estoques."}, {"letra": "C", "texto": "Fragilização dos cartéis."}, {"letra": "D", "texto": "Padronização de mercadorias."}, {"letra": "E", "texto": "Desterritorialização da produção."}]', 'E', 'A reorganização econômica descrita por Manuel Castells apoia-se na desterritorialização e articulação em rede global das atividades produtivas.', NULL, NULL, 'resumida', FALSE, FALSE, '5e48a23c0114c717491621eebf20fe2486b8df5bf4e3281d0e7ce3d704617838', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Espaço rural / Abastecimento e produção alimentar', 2022, '1º dia', 'INEP', 52, 'Questão 52', 'humanas', 'facil', 'Olhar o Brasil e não ver o sertão
É como negar o queijo com a faca na mão
Esse gigante em movimento
Movido a tijolo e cimento
Precisa de arroz com feijão
Que tenha comida na mesa
Que agradeça sempre a grandeza
De cada pedaço de pão
Agradeça a Clemente
Que leva a semente
Em seu embornal
Zezé e o penoso balé
De pisar no cacau
Maria que amanhece o dia
Lá no milharal
VANDER LEE. Do Brasil. In: Pensei que fosse o céu: ao vivo.', 'Rio de Janeiro: Indie Records, 2006 (fragmento).
A letra da canção valoriza uma dimensão do espaço rural
brasileiro em sua relação com a cidade ao ressaltar sua
função de', '[{"letra": "A", "texto": "fornecer a mão de obra qualificada."}, {"letra": "B", "texto": "incorporar a inovação tecnológica."}, {"letra": "C", "texto": "preservar a diversidade biológica."}, {"letra": "D", "texto": "promover a produção alimentar."}, {"letra": "E", "texto": "garantir a moradia básica."}]', 'D', 'A letra da canção valoriza a dimensão do campo como fonte primordial de produção alimentar para o sustento das populações urbanas.', NULL, NULL, 'resumida', TRUE, FALSE, '6a996b941c5a159dded388eb68cedf2ccbb55fd4b5ac6e5f3e7d0ff22c89dc45', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Segundo Reinado / Leitura e imprensa feminina', 2022, '1º dia', 'INEP', 53, 'Questão 53', 'humanas', 'facil', 'O número cada vez maior de mulheres letradas
e interessadas pela literatura e pelas novelas, muitas
divulgadas em capítulos, seções, classificadas comumente
como folhetim, alçou a um gênero de ficção corrente já
em 1840, fazendo parte do florescimento da literatura
nacional brasileira, instigando a formação e a ampliação
de um público leitor feminino, ávido por novidades,
pelo apelo dos folhetins e “narrativas modernas” que
encenavam “os dramas e os conflitos de uma mulher em
processo de transformação patriarcal e provinciana que,
progressivamente, começava a se abrir para modernizar
seus costumes”. No Segundo Reinado, as mulheres
foram se tornando público determinante na construção
da literatura e da imprensa nacional. E não apenas
público, porquanto crescerá o número de escritoras que
colaboram para isso e emergirá uma imprensa feminina,
editada, escrita e dirigida por e para mulheres.
ABRANTES, A. Do álbum de família à vitrine impressa: trajetos de retratos (PB, 1920),', 'Revista Temas em Educação, n. 24, 2015 (adaptado).
O registro das atividades descritas associa a inserção
da figura feminina nos espaços de leitura e escrita do
Segundo Reinado ao(à)', '[{"letra": "A", "texto": "surgimento de novas práticas culturais."}, {"letra": "B", "texto": "contestação de antigos hábitos masculinos."}, {"letra": "C", "texto": "valorização de recentes publicações juvenis."}, {"letra": "D", "texto": "circulação de variados manuais pedagógicos."}, {"letra": "E", "texto": "aparecimento de diversas editoras comerciais."}]', 'A', 'O texto registra a ampliação do público leitor feminino no século XIX como motor para o surgimento de novas práticas culturais e editoriais.', NULL, NULL, 'resumida', FALSE, FALSE, 'f1902dba4246daa2941c53f95276598a688c8d2ae77ac919eaadd0c9ca8ac59d', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Brasil Império / Organização dos trabalhadores', 2022, '1º dia', 'INEP', 54, 'Questão 54', 'humanas', 'medio', 'Os caixeiros do comércio a retalho do Rio de Janeiro
estiveram entre as primeiras categorias de trabalhadores
a se organizar em associações e a exigir a intervenção
dos poderes públicos na mediação de suas lutas por
direitos. Na década de 1880, os caixeiros participaram
da arena política e ganharam as ruas com vários outros,
como os republicanos e os abolicionistas.
POPINIGIS, F. “Todas as liberdades são irmãs”: os caixeiros e as lutas dos trabalhadores por
direitos entre o Império e a República. Estudos Históricos, n. 59, set.-dez. 2016 (adaptado).
A atuação dos trabalhadores mencionados no texto', 'representou, na capital do Império, um momento de', '[{"letra": "A", "texto": "manutenção das regras patronais."}, {"letra": "B", "texto": "desprendimento das ideias liberais."}, {"letra": "C", "texto": "fortalecimento dos contratos laborais."}, {"letra": "D", "texto": "consolidação das estruturas sindicais."}, {"letra": "E", "texto": "contestação dos princípios monárquicos."}]', 'E', 'A atuação dos caixeiros do comércio na capital imperial representou uma forma de contestação e mobilização política contra as estruturas vigentes.', NULL, NULL, 'resumida', FALSE, FALSE, '917a79e00fdfad726d7919db1bf730084745687a351b21c43144a7f8544d4050', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Impactos ambientais no semiárido / Salinização do solo', 2022, '1º dia', 'INEP', 55, 'Questão 55', 'humanas', 'medio', 'Solos salinos ou alomórficos apresentam como
característica comum uma concentração muito alta
de sais solúveis e/ou de sódio trocável. Eles ocorrem
nos locais mais baixos do relevo, em regiões áridas e
semiáridas e próximas do mar. Em regiões semiáridas,
por exemplo, o polígono das secas do Nordeste brasileiro,
os locais menos elevados recebem água que se escoa
dos declives adjacentes, durante as chuvas que caem em
alguns meses do ano. Essa água traz soluções de sais
minerais e evapora-se rapidamente antes de infiltrar-se
totalmente, havendo então, cada vez que esse processo
é repetido, um pequeno acúmulo de sais no horizonte
superficial que, com o passar dos anos, provoca a
salinização do solo. Nas últimas décadas, a expansão
das atividades agrícolas na região tem ampliado esse
processo.
LEPSCH, I. F. Solos: formação e conservação.
São Paulo: Melhoramentos, 1993 (adaptado).
As atividades agrícolas, desenvolvidas na região', 'mencionada, intensificam o problema ambiental exposto ao', '[{"letra": "A", "texto": "realizar florestamentos de pinus, desrespeitando a prática do pousio."}, {"letra": "B", "texto": "utilizar sistemas de irrigação, desprezando uma drenagem adequada."}, {"letra": "C", "texto": "instalar açudes nos grotões, retardando a velocidade da vazão fluvial."}, {"letra": "D", "texto": "desmatar áreas de preservação permanente, causando assoreamento."}, {"letra": "E", "texto": "aplicar fertilizantes de origem orgânica, modificando a química da terra."}]', 'B', 'A irrigação em regiões áridas e semiáridas sem a drenagem adequada provoca a rápida evaporação da água e a salinização progressiva do solo.', NULL, NULL, 'resumida', FALSE, FALSE, '4fb6f381c03ea2d93ac90c07fb7fe2db46b41eb16cf6856eae71f0f3b025fe94', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Desigualdade social e exclusão digital / Pandemia', 2022, '1º dia', 'INEP', 56, 'Questão 56', 'humanas', 'facil', 'TEXTO I
TÁ
ESTUDANDO,
JÚNIOR?
CALMA,
TÔ TENTANDO
ACHAR UM SINAL
DE WI-FI!
CAZO. Disponível em: www.humorpolitico.com.br.
Acesso em: 21 nov. 2021 (adaptado).
TEXTO II
É como se os problemas fossem criados pela
pandemia quando, em verdade, isso só demonstra o
quanto eles sofrem uma tentativa de serem naturalizados.
Eles estavam lá, empurrados para debaixo de vários
tapetes. Diversos levantamentos realizados indicam
que parcela significativa dos estudantes não têm acesso
à internet em suas casas, não têm computadores; têm
celulares, mas com pacotes baratos que não permitem
assistir a todas as aulas. E, caso tenham celulares e
dados, pergunta-se: É possível elaborar um texto no
celular? É possível interagir na aula remota pelo celular?
ASSIS, A. E. S. Q. Educação e pandemia.
Educação em Revista, n. 37, 2021 (adaptado).', 'A crítica contida no texto e na figura evidencia o seguinte
aspecto da sociedade contemporânea:', '[{"letra": "A", "texto": "Exclusão social."}, {"letra": "B", "texto": "Expansão digital."}, {"letra": "C", "texto": "Manifestação cultural."}, {"letra": "D", "texto": "Organização espacial."}, {"letra": "E", "texto": "Valorização intelectual."}]', 'A', 'A charge e o texto denunciam como a falta de acesso a computadores e à internet de qualidade aprofunda a exclusão social entre os estudantes.', NULL, NULL, 'resumida', FALSE, FALSE, 'fd8ebb91042ba4d0643804a89f963a7d5522c3a77a069e842f8deacc002b08f7', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Foucault / Sociedade disciplinar e controle', 2022, '1º dia', 'INEP', 57, 'Questão 57', 'humanas', 'medio', 'O leproso é visto dentro de uma prática da rejeição,
do exílio-cerca; deixa-se que se perca lá dentro como
numa massa que não tem muita importância diferenciar;
os pestilentos são considerados num policiamento
tático meticuloso onde as diferenciações individuais são
os efeitos limitantes de um poder que se multiplica, se
articula e se subdivide. O grande fechamento por um
lado; o bom treinamento por outro. A lepra e sua divisão; a
peste e seus recortes. Uma é marcada; a outra, analisada
e repartida. O exílio do leproso e a prisão da peste não
trazem consigo o mesmo sonho político.
FOUCAULT, M. Vigiar e punir : nascimento da prisão. Petrópolis: Vozes, 1987.', 'Os modelos autoritários descritos no texto apontam para
um sistema de controle que se baseia no(a):', '[{"letra": "A", "texto": "Formação de sociedade disciplinar."}, {"letra": "B", "texto": "Flexibilização do regramento social."}, {"letra": "C", "texto": "Banimento da autoridade repressora."}, {"letra": "D", "texto": "Condenação da degradação humana."}, {"letra": "E", "texto": "Hierarquização da burocracia estatal."}]', 'A', 'Foucault explica como a gestão de epidemias e o isolamento de doentes serviram de modelo para a formação da sociedade disciplinar e de vigilância.', NULL, NULL, 'resumida', FALSE, FALSE, '59bc6af99366595c8ec614c32f163336478b6a0861ee16ff66e0ecd850600d69', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Religiosidade popular / Padre Cícero e Juazeiro', 2022, '1º dia', 'INEP', 58, 'Questão 58', 'humanas', 'facil', 'TEXTO I
Em março de 1889, quando apareceram as primeiras
romarias atraídas pelos milagres da beata Maria de
Araújo, Juazeiro inseriu-se no rol da fundação do espaço
religioso. Construía-se mais um centro, como Aparecida
do Norte, Canindé ou Lourdes.
RAMOS, F. R. L. O meio do mundo : território sagrado em Juazeiro do Padre Cícero.
Fortaleza: Imprensa Universitária, 2014.
TEXTO II
Não sabemos ao certo quantas pessoas estavam
presentes na capela no momento em que a hóstia
sangrou na boca de Maria de Araújo. O Padre Cícero
nos conta que o fato surpreendeu não só aos presentes,
mas a própria beata parecia atordoada com o ocorrido.
O fenômeno continuou acontecendo todas as quartas e
sextas na Capela de Nossa Senhora das Dores a partir
daquele dia. Os paninhos manchados do sangue que
escorria da hóstia e da boca da beata, a princípio, ficaram
sob a guarda do Padre Cícero, mas logo foram expostos
à visitação pública e, além disso, o sangramento foi
proclamado como milagre sem o conhecimento e sem a
autorização do bispo diocesano.
NOBRE, E. Incêndios da alma. Rio de Janeiro: Multifoco, 2016 (adaptado).
As práticas religiosas mencionadas nos textos estão', 'associadas, respectivamente, à:', '[{"letra": "A", "texto": "Delimitação de paisagens urbanas e abandono de componentes espiritualistas."}, {"letra": "B", "texto": "Demarcação de patrimônios afetivos e apropriação de elementos judaizantes."}, {"letra": "C", "texto": "Expansão de fronteiras regionais e subjetivação do cristianismo medieval."}, {"letra": "D", "texto": "Circunscrição de bens simbólicos e admissão de cerimônias ecumênicas."}, {"letra": "E", "texto": "Criação de lugares místicos e experiências do catolicismo popular."}]', 'E', 'Os textos retratam a formação de Juazeiro do Norte como centro de peregrinação fundado na criação de lugares místicos e no catolicismo popular.', NULL, NULL, 'resumida', FALSE, FALSE, 'f67e4f893b67c7cd70e7adbc5df14238d9eeda12c7ee07a9851225c3592fc5d5', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Agricultura familiar / PAA e mercado institucional', 2022, '1º dia', 'INEP', 59, 'Questão 59', 'humanas', 'facil', 'Em 2003, teve início o Programa de Aquisição de
Alimentos e, com ele, várias mudanças na perspectiva dos
mercados institucionais. Trata-se do primeiro programa
de compras públicas com uma orientação exclusiva
para a agricultura familiar, articulando-a explicitamente
com a segurança alimentar e nutricional. O Programa
é destinado à aquisição de produtos agropecuários
produzidos por agricultores enquadrados no Programa
Nacional de Fortalecimento da Agricultura Familiar
(Pronaf), incluídas aqui as categorias: assentados
da reforma agrária, trabalhadores rurais sem terra,
acampados, quilombolas, agroextrativistas, famílias
atingidas por barragens e comunidades indígenas.
GRISA, C.; ISOPO, S. P. Dez anos de PAA: As contribuições e os desafios para o
desenvolvimento rural. In: GRISA, C.; SCHNEIDER, S. (Org.). Políticas públicas de', 'desenvolvimento rural no Brasil. Porto Alegre: UFRGS, 2015.
A ação governamental descrita constitui-se uma
importante conquista para os pequenos produtores em
virtude da:', '[{"letra": "A", "texto": "Inovação tecnológica."}, {"letra": "B", "texto": "Reestruturação fundiária."}, {"letra": "C", "texto": "Comercialização garantida."}, {"letra": "D", "texto": "Eliminação no custo do frete."}, {"letra": "E", "texto": "Negociação na bolsa de valores."}]', 'C', 'O Programa de Aquisição de Alimentos (PAA) garante a comercialização dos produtos da agricultura familiar via compras públicas governamentais.', NULL, NULL, 'resumida', FALSE, FALSE, '2f673f9ae679f76aa46e2f3e5639ebde691ed6a10f573dfbb1cfc1073d60a755', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Tecnologia e relações sociais / Estímulo à cooperação', 2022, '1º dia', 'INEP', 60, 'Questão 60', 'humanas', 'medio', 'Um experimento denominado FunFit foi desenvolvido
com o objetivo de fazer com que os membros de uma
comunidade local se tornassem mais ativos fisicamente.
Todos os participantes do estudo foram vinculados a
dois outros membros da comunidade que receberiam
pequenos incentivos em dinheiro para serem estimulados
a aumentar a sua atividade física, que era medida por
acelerômetros nos celulares fornecidos pelo estado.
Assim, se a pessoa andasse mais do que o habitual, seus
conhecidos receberiam o dinheiro. Os resultados foram
assombrosos: o esquema mostrou-se de quatro a oito
vezes mais eficaz do que o método de oferecer incentivos
individuais.
MOROZOV, E. Big Tech: a ascensão dos dados e a morte da política.
São Paulo: Ubu, 2018 (adaptado).
Contrariando a visão prevalente sobre o impacto
tecnológico nas relações humanas, o texto revela que os', 'celulares podem desempenhar uma função', '[{"letra": "A", "texto": "recreativa, promovendo o lazer em redes integradas."}, {"letra": "B", "texto": "social, estimulando a reciprocidade por meios digitais."}, {"letra": "C", "texto": "laboral, convertendo o desenvolvedor em usuário final."}, {"letra": "D", "texto": "comercial, direcionando a escolha por produtos industrializados."}, {"letra": "E", "texto": "cognitiva, favorecendo a aprendizagem pelas ferramentas virtuais."}]', 'B', 'O experimento FunFit mostra que os celulares podem desempenhar uma função social ao fortalecer laços de cooperação e reciprocidade digital.', NULL, NULL, 'resumida', TRUE, FALSE, '99092529fe9e8b830a378a1a7944a0481e5c624fac0aabfca763ac4a41f3e1a7', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Mundo do trabalho / Automação e desemprego estrutural', 2022, '1º dia', 'INEP', 61, 'Questão 61', 'humanas', 'facil', 'A dublagem é o novo campo a ser explorado pela
inteligência artificial, e há empresas dedicadas a fazer
com que as vozes originais de atores sejam transpostas
para outros idiomas. A novidade reforça a tendência da
automação de postos de trabalho nas mais diversas áreas.
Tem potencial para facilitar a vida de estúdios e produtoras
e, ao mesmo tempo, tornar mais escassas as oportunidades
para dubladores e atores que trabalham com isso.
GAGLIONI, C. Disponível em: www.nexojornal.com.br. Acesso em: 25 out. 2021.', 'A consequência da mudança tecnológica apresentada no
texto é a', '[{"letra": "A", "texto": "proteção da economia nacional."}, {"letra": "B", "texto": "valorização da cultura tradicional."}, {"letra": "C", "texto": "diminuição da formação acadêmica."}, {"letra": "D", "texto": "estagnação da manifestação artística."}, {"letra": "E", "texto": "ampliação do desemprego estrutural."}]', 'E', 'O avanço da inteligência artificial na automação de atividades como a dublagem resulta no aumento do desemprego estrutural no setor.', NULL, NULL, 'resumida', FALSE, FALSE, 'ff790555a5148c4f78d463927113f8ef120900f944022b52ab3bac913db5065c', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Blocos econômicos / Mercosul e União Aduaneira', 2022, '1º dia', 'INEP', 62, 'Questão 62', 'humanas', 'medio', 'Brasil e Argentina chegaram a um acordo para a
redução em 10% da Tarifa Externa Comum (TEC) do
Mercosul. O consenso foi alcançado durante negociação
entre o ministro das Relações Exteriores do Brasil e o
seu equivalente argentino, no Palácio do Itamaraty, em
Brasília, no início do mês de outubro de 2021. A redução
da TEC é um antigo desejo do Brasil, que pretende
abrir mais sua economia e, com isso, ajudar a controlar
a inflação. Já a Argentina temia que a medida pudesse
afetar sua produção industrial. O acordo vai abranger
uma ampla gama de produtos e ainda será apresentado
ao Paraguai e Uruguai, para que seja formalizado.
Brasil e Argentina fecham acordo para corte de 10% na tarifa do Mercosul.
Disponível em: https://oglobo.globo.com. Acesso em: 8 out. 2021 (adaptado).', 'A necessidade de negociação diplomática para viabilizar
o acordo tarifário mencionado é explicada pela seguinte
característica do Mercosul:', '[{"letra": "A", "texto": "Limitação da circulação financeira."}, {"letra": "B", "texto": "Padronização da política monetária."}, {"letra": "C", "texto": "Funcionamento da união aduaneira."}, {"letra": "D", "texto": "Dependência da exportação agrícola."}, {"letra": "E", "texto": "Equivalência da legislação trabalhista."}]', 'C', 'Por se constituir como uma União Aduaneira, o Mercosul exige negociação diplomática e consenso para a alteração da Tarifa Externa Comum (TEC).', NULL, NULL, 'resumida', FALSE, FALSE, '110317b56331745ab1eb134bd6d6ca044df21ab43df78f5700fa1d5e7e6e22e2', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Idade Média / Papel da realeza e caridade', 2022, '1º dia', 'INEP', 63, 'Questão 63', 'humanas', 'medio', 'Ainda que a fome ocorrida na Itália em 536 tenha
origem nos eventos climáticos, suas implicações são
tanto políticas quanto econômicas. Nos primeiros séculos
da Idade Média, o auxílio aos famintos se inscreve no
domínio da gestão pública, mesmo quando a ação de
seus agentes é apresentada sob o ângulo da piedade e da
caridade individuais, como é o caso da Gália merovíngia.
Assim, o fato de que as respostas à fome são mostradas,
na Gália, como o fruto de iniciativas pessoais fundadas
no imperativo da caridade deriva da natureza das fontes
do século VI.
SILVA, M. C. Os agentes públicos e a fome nos primeiros séculos da Idade Média.
Varia Historia, n. 60, set.-dez. 2016 (adaptado).
Na conjuntura histórica destacada no texto, o dever de', 'agir em face da situação de crise apresentada pertencia à
jurisdição', '[{"letra": "A", "texto": "da nobreza, proveniente da obrigação de proteção ao campesinato livre."}, {"letra": "B", "texto": "da realeza, decorrente do conceito de governo subjacente à monarquia cristã."}, {"letra": "C", "texto": "dos mosteiros, resultante do caráter fraternal afirmado nas regras monásticas."}, {"letra": "D", "texto": "dos bispados, consequente da participação dos clérigos nos assuntos comunitários."}, {"letra": "E", "texto": "das corporações, procedente do padrão assistencialista previsto nas normas estatutárias."}]', 'B', 'Na alta Idade Média, as ações governamentais frente à fome decorriam do conceito de monarquia cristã e das obrigações morais do rei.', NULL, NULL, 'resumida', FALSE, FALSE, '9dcf3978b126a5790f84e9fce6e831d1410b1d7a6c6cb4726c07277a44d8ce71', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Geomorfologia / Tectonismo e vulcanismo', 2022, '1º dia', 'INEP', 64, 'Questão 64', 'humanas', 'medio', 'As forças tectônicas dentro da litosfera, controladas
pelo calor interno das profundezas, geram terremotos,
erupções e soerguimento de montanhas. As forças
meteorológicas dentro da atmosfera e da hidrosfera,
controladas pelo calor do Sol, produzem tempestades,
inundações, geleiras e outros agentes de erosão.
PRESS, F. et al. Para entender a Terra. Porto Alegre: Bookman, 2006 (adaptado).
A interação dinâmica entre as forças naturais citadas
favorece a ocupação do espaço geográfico, na medida', 'em que provoca a formação de', '[{"letra": "A", "texto": "solos vulcânicos."}, {"letra": "B", "texto": "dorsais oceânicas."}, {"letra": "C", "texto": "relevos escarpados."}, {"letra": "D", "texto": "superfícies lateríticas."}, {"letra": "E", "texto": "dobramentos modernos."}]', 'A', 'A interação entre processos endógenos (vulcanismo) e exógenos favorece a ocupação humana ao propiciar a formação de solos vulcânicos férteis.', NULL, NULL, 'resumida', FALSE, FALSE, 'edcaa64ae89f8851f5e460cb5b008ee10c161fb1643061a8b481bda3efccded0', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Violência doméstica / Ciclo da violência e feminicídio', 2022, '1º dia', 'INEP', 65, 'Questão 65', 'humanas', 'facil', 'carinho, paixão, presentes, promessas, reconciliação, liberdade
LUA DE MEL
insulto, humilhação, intimidação, gritos, ameaça, controle,
isolamento, medo, conflitos, descumprimento de promessa
TENSÃO
empurrão, beliscão, puxão de cabelo, sufocamento,
arremesso de objetos, tapa, chute, espancamento
AGRESSÃO
TENSÃO
TENSÃO
TENSÃO
TENSÃO
TENSÃO
TENSÃO
LUA DE MEL
LUA DE MEL
LUA DE MEL
LUA DE MEL
LUA DE MEL
LUA DE MEL
MORTE
AGRESSÃO
AGRESSÃO
AGRESSÃO
AGRESSÃO
AGRESSÃO
Disponível em: https://ndmais.com.br. Acesso em: 8 out. 2021.', 'O ápice da ilustração se traduz por uma conduta social
caracterizada pela', '[{"letra": "A", "texto": "cultura do cancelamento."}, {"letra": "B", "texto": "prática do feminicídio."}, {"letra": "C", "texto": "postura negacionista."}, {"letra": "D", "texto": "ação involuntária."}, {"letra": "E", "texto": "defesa da honra."}]', 'B', 'O gráfico em espiral ilustra a escalada progressiva da violência de gênero (tensão, agressão, lua de mel) que pode resultar em feminicídio.', NULL, NULL, 'resumida', FALSE, FALSE, '817ec3e599ff79d06a7c9d05d9b2c03dad9b722ee45d1674bf6f7607cfe6a897', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'História da educação feminina / Brasil Império', 2022, '1º dia', 'INEP', 66, 'Questão 66', 'humanas', 'facil', 'TEXTO I
A primeira grande lei educacional do Brasil, de 1827,
determinava que, nas “escolas de primeiras letras” do
Império, meninos e meninas estudassem separados e
tivessem currículos diferentes. No Senado, o Visconde
de Cayru foi um dos defensores de que o currículo de
matemática das garotas fosse o mais enxuto possível.
Nas palavras dele, o “belo sexo” não tinha capacidade
intelectual para ir muito longe: — Sobre as contas, são
bastantes [para as meninas] as quatro espécies, que não
estão fora do seu alcance e lhes podem ser de constante
uso na vida.
TEXTO II
No Senado, o único a defender publicamente que
as meninas tivessem, em matemática, um currículo
idêntico ao dos meninos foi o Marquês de Santo Amaro
(RJ). Ele argumentou: — Não me parece conforme, às
luzes do tempo em que vivemos, deixarmos de facilitar
às brasileiras a aquisição desses conhecimentos
[mais aprofundados de matemática]. A oposição que
se manifesta não pode nascer senão do arraigado e
péssimo costume em que estavam os antigos, os quais
nem queriam que suas filhas aprendessem a ler.
WESTIN, R. Senado Notícias. Disponível em: www12.senado.leg.br.
Acesso em: 20 out. 2021 (adaptado).', 'Os discursos expressam pontos de vista divergentes
respectivamente pela oposição entre', '[{"letra": "A", "texto": "liberdade de gênero e controle social."}, {"letra": "B", "texto": "equidade de escolha e imposição cultural."}, {"letra": "C", "texto": "dominação de corpos e igualdade humana."}, {"letra": "D", "texto": "geração de oportunidade e restrição profissional."}, {"letra": "E", "texto": "exclusão de competências e participação política."}]', 'E', 'Os discursos parlamentares de 1827 contrapunham a exclusão de competências matemáticas femininas (Cayru) à defesa de maior participação (Santo Amaro).', NULL, NULL, 'resumida', FALSE, FALSE, '79480c6dc5d8643c5419f879819062acaa0dbb4c6bad026570f04eb80a70034a', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Movimentos sociais urbanos / Direito à moradia', 2022, '1º dia', 'INEP', 67, 'Questão 67', 'humanas', 'facil', 'Após sete anos da ocupação de um terreno
abandonado em Santo André, no ABC paulista, os
condomínios Novo Pinheirinho e Santos Dias foram
inaugurados, com a presença de representantes dos
governos federal, estadual e municipal. A ocupação
começou em 2012 e, desde então, o movimento vinha
reivindicando o direito de usufruir do espaço para a
construção de casas. A Carta Magna, em seu art. 6º,
garante a todos os brasileiros o direito à moradia.
PUTTI, A. Disponível em: www.cartacapital.com.br. Acesso em: 13 nov. 2021 (adaptado).', 'O texto apresenta uma estratégia usada pelo movimento
social para', '[{"letra": "A", "texto": "fragilizar o poder público."}, {"letra": "B", "texto": "fomentar a economia solidária."}, {"letra": "C", "texto": "controlar a propriedade estatal."}, {"letra": "D", "texto": "garantir o preceito constitucional."}, {"letra": "E", "texto": "incentivar a especulação imobiliária."}]', 'D', 'A atuação do movimento social em Santo André constituiu uma estratégia para pressionar o Estado a efetivar o direito constitucional à moradia.', NULL, NULL, 'resumida', FALSE, FALSE, 'f2216ea84682a67b2a75f85639f5ff44a4468df712a44149fdc4b3369fe21336', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Geopolítica / Hegemonia dos EUA e recursos estratégicos', 2022, '1º dia', 'INEP', 68, 'Questão 68', 'humanas', 'medio', 'TEXTO I
A Marinha identifica, na voz de Thomas Barnett, uma
ampla região potencialmente insubmissa ou simplesmente
irredutível às normas gerais de funcionamento promovidas
pelos Estados Unidos e sancionadas pelo Fundo
Monetário Internacional, pela Organização Mundial do
Comércio e pelo Banco Mundial. E não necessariamente
por sua consciência rebelde, mas sim, em muitos casos,', 'pela insubstancialidade de suas instituições estatais.
TEXTO II
A “brecha” crítica do “Novo Mapa do Pentágono”
Petróleo e gásAlta densidade e
variedade germoplásmica
CECEÑA, A. E. Hegemonias e emancipações no século XXI. Buenos Aires: Clacso, 2005.
As preocupações do governo estadunidense expressas
no texto e no mapa evidenciam uma estratégia para', '[{"letra": "A", "texto": "compartilhamento de inovações tecnológicas."}, {"letra": "B", "texto": "promoção de independência financeira."}, {"letra": "C", "texto": "incremento de intercâmbios culturais."}, {"letra": "D", "texto": "ampliação de influência econômica."}, {"letra": "E", "texto": "preservação de recursos naturais."}]', 'D', 'A estratégia militar e cartográfica estadunidense expressa a preocupação em garantir a ampliação de sua influência econômica e acesso a recursos.', NULL, NULL, 'resumida', FALSE, FALSE, '9980bd886e9c83bd2520e083e91a409438520be9300ccc20a3df7c25ea3107b8', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Geopolítica contemporânea / Anexação da Crimeia', 2022, '1º dia', 'INEP', 69, 'Questão 69', 'humanas', 'facil', 'Colegas, na mente e no coração do povo, a Crimeia
sempre foi uma porção inseparável da Rússia. Essa firme
convicção se baseia na verdade e na justiça e foi passada
de geração em geração, ao longo do tempo, sob quaisquer
circunstâncias, apesar de todas as drásticas mudanças
que nosso país atravessou durante todo o século XX.
Disponível em: http://g1.globo.com. Acesso em: 28 jul. 2014.
Considerando a dinâmica geopolítica subjacente ao texto,
a justificativa utilizada por Vladimir Putin, em 2014, para', 'anexação dessa península apela para o argumento de que', '[{"letra": "A", "texto": "as populações com idioma comum devem estar submetidas à mesma autoridade estatal."}, {"letra": "B", "texto": "o imperialismo soviético havia se acomodado às pretensões das potências vizinhas."}, {"letra": "C", "texto": "os organismos transnacionais são incapazes de solucionar disputas territoriais."}, {"letra": "D", "texto": "a integração regional supõe a livre circulação de pessoas e mercadorias."}, {"letra": "E", "texto": "a expulsão das forças navais ocidentais garantiria a soberania nacional."}]', 'A', 'Vladimir Putin justificou a anexação da Crimeia recorrendo ao argumento de que populações com laços históricos e idioma russo devem integrar o mesmo Estado.', NULL, NULL, 'resumida', FALSE, FALSE, '59ac46dea824c69c10aedd04400102603dddffcf91fefcb1b51845f2e90fa445', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Interseccionalidade / Raça e gênero na extrema pobreza', 2022, '1º dia', 'INEP', 70, 'Questão 70', 'humanas', 'facil', 'TEXTO I
Interseccionalidade: intercruzamento de desigualdades
que gera padrões complexos de discriminação.
TEXTO II
30,4%
21,0%
11,6%
10,0%
Proporção de pessoas abaixo da linha de pobreza
Por arranjo domiciliar no Brasil — 2017
Mulher sem cônjuge e com filho(s) até 14 anos
Mulher preta ou parda sem cônjuge e com filho(s) até 14 anos
Mulher branca sem cônjuge e com filho(s) até 14 anos
Casal com filho(s)
Outros
Unipessoal
Casal sem filho
56,9%
64,4%
41,5%
Disponível em: www.agenciadenoticias.ibge.gov.br. Acesso em: 2 dez. 2018.
Considerando o conceito apresentado no Texto I e os
dados apresentados no Texto II, no Brasil, são fatores', 'que intensificam o fenômeno da discriminação:', '[{"letra": "A", "texto": "Raça e gênero."}, {"letra": "B", "texto": "Etnia e habitação."}, {"letra": "C", "texto": "Idade e nupcialidade."}, {"letra": "D", "texto": "Profissão e sexualidade."}, {"letra": "E", "texto": "Escolaridade e fecundidade."}]', 'A', 'Os dados estatísticos demonstram que fatores como raça e gênero se interseccionam, intensificando a vulnerabilidade e discriminação de mulheres pretas/pardas.', NULL, NULL, 'resumida', FALSE, FALSE, 'ee6c1e8e57146a24db27c0fc9fa5d4c4601930633af9c3d0918bc96f715d850e', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Estado de Direito / Princípio da legalidade', 2022, '1º dia', 'INEP', 71, 'Questão 71', 'humanas', 'facil', 'O princípio básico do Estado de direito é o da
eliminação do arbítrio no exercício dos poderes públicos,
com a consequente garantia de direitos dos indivíduos
perante esses poderes. Estado de direito significa que
nenhum indivíduo, presidente ou cidadão comum está
acima da lei. Os governos democráticos exercem a
autoridade por meio da lei e estão eles próprios sujeitos
aos constrangimentos impostos pela lei.
CANOTILHO, J. J. G. Estado de direito. Lisboa: Gradiva, 1999 (adaptado).
Nas sociedades contemporâneas, consiste em violação', 'do princípio básico enunciado no texto:', '[{"letra": "A", "texto": "Supressão de eleições de representantes políticos."}, {"letra": "B", "texto": "Intervenção em áreas de vulnerabilidade pela Igreja."}, {"letra": "C", "texto": "Disseminação de projetos sociais em universidades."}, {"letra": "D", "texto": "Ampliação dos processos de concentração de renda."}, {"letra": "E", "texto": "Regulamentação das relações de trabalho pelo Legislativo."}]', 'A', 'O princípio do Estado de Direito estabelece que todos estão submetidos à lei; logo, a supressão de eleições representa uma violação direta desse preceito.', NULL, '[{"titulo": "Passo 1", "conteudo": "O princípio do Estado de Direito estabelece que todos estão submetidos à lei;", "formula": null}, {"titulo": "Conclusão", "conteudo": "logo, a supressão de eleições representa uma violação direta desse preceito.", "formula": null}]', 'automatica', FALSE, FALSE, 'e3c075bd0d1ec722c6e93ea7956ee02e101e64340698d1a2f92a10737ac0aed7', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Demografia urbana / Movimento pendular', 2022, '1º dia', 'INEP', 72, 'Questão 72', 'humanas', 'facil', 'Brasileiros levam mais tempo de casa para o trabalho
Pesquisa do IBGE aponta que a situação é mais
grave no Sudeste: 13% das pessoas levam mais de uma
hora para chegar ao trabalho. Nas regiões metropolitanas
de São Paulo e do Rio, o IBGE registrou os maiores
percentuais de trabalhadores que levam mais de uma
hora no trajeto até o emprego. Quem vê o Marcelo chegar
ao trabalho nem imagina a maratona que ele enfrenta
todos os dias antes das 5 h. “Acordo 4 h 30, saio de casa
5 h, pego trem 5 h 20, chego na Central umas 6 h 50,
pego ônibus e chego no trabalho mais ou menos 7 h 10”,
conta. Segundo especialista, são os mais pobres os que
moram mais longe do emprego.
Disponível em: www.portaldotransito.com.br. Acesso em: 23 nov. 2021 (adaptado).', 'A pesquisa desenvolvida retrata a seguinte dinâmica
populacional:', '[{"letra": "A", "texto": "Fluxo de retorno."}, {"letra": "B", "texto": "Migração interna."}, {"letra": "C", "texto": "Mudança sazonal."}, {"letra": "D", "texto": "Movimento pendular."}, {"letra": "E", "texto": "Deslocamento forçado."}]', 'D', 'O deslocamento diário de trabalhadores entre o local de moradia distante e o centro de trabalho configura o movimento pendular.', NULL, NULL, 'resumida', FALSE, FALSE, 'de73d7271c8c644d3047d228a0a3e385348c1c486a911321bcf1520ac14acaa3', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'História do trabalho / Instituição do Primeiro de Maio', 2022, '1º dia', 'INEP', 73, 'Questão 73', 'humanas', 'facil', 'A história do Primeiro de Maio de 1890 — na França e na
Europa, o primeiro de todos os Primeiros de Maio — é, sob
vários aspectos, exemplar. Resultante de um ato político
deliberado, essa manifestação ilustra o lado voluntário da
construção de uma classe — a classe operária — à qual
os socialistas tentam dar uma unidade política e cultural
através daquela pedagogia da festa cujo princípio, eficácia
e limites há muito tempo tinham sido experimentados pela
Revolução Francesa.
PERROT, M. Os excluídos da história : operários, mulheres e prisioneiros.
Rio de Janeiro: Paz e Terra, 1988.
Com base no texto, a fixação dessa data comemorativa', 'tinha por objetivo', '[{"letra": "A", "texto": "valorizar um sentimento burguês."}, {"letra": "B", "texto": "afirmar uma identidade coletiva."}, {"letra": "C", "texto": "edificar uma memória nacional."}, {"letra": "D", "texto": "criar uma comunidade cívica."}, {"letra": "E", "texto": "definir uma tradição popular."}]', 'B', 'A fixação do Primeiro de Maio como data comemorativa operária buscou afirmar uma identidade coletiva e unidade política para os trabalhadores.', NULL, NULL, 'resumida', FALSE, FALSE, 'b1659080cb525ed1d3d2e4a6bd8c6c9b45ff7194e9e2ce1bfe8885d0ac1636d2', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Climatologia e energia / Radiação solar no Brasil', 2022, '1º dia', 'INEP', 74, 'Questão 74', 'humanas', 'facil', 'RADIAÇÃO SOLAR
GLOBAL HORIZONTAL
MÉDIA ANUAL
3,15 3,50 3,85 4,20 4,55 4,90 5,25 5,60 5,95 6,30 6,65 kWh/m²
0 200 400 600 800 1000 km
PEREIRA, E. B. et al. Atlas brasileiro de energia solar. São José dos Campos: Inpe, 2006.', 'Uma característica regional que justifica o maior
potencial anual médio para o aproveitamento da
energia solar é a reduzida', '[{"letra": "A", "texto": "declividade do relevo."}, {"letra": "B", "texto": "extensão longitudinal."}, {"letra": "C", "texto": "nebulosidade atmosférica."}, {"letra": "D", "texto": "irregularidade pluviométrica."}, {"letra": "E", "texto": "influência da continentalidade."}]', 'C', 'A região Nordeste apresenta o maior potencial de energia solar do país em razão de sua reduzida nebulosidade atmosférica ao longo do ano.', NULL, NULL, 'resumida', FALSE, FALSE, '41735af28347ebdc5e29d0f3692c925c1ee5ae5696f236ba079cf513c6f83389', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Povos tradicionais / Povo Kambeba e o rio Solimões', 2022, '1º dia', 'INEP', 75, 'Questão 75', 'humanas', 'facil', 'O povo Kambeba é o povo das águas. Os mais velhos
costumam contar que o povo nasceu de uma gota-d’água
que caiu do céu em uma grande chuva. Nessa gota
estavam duas gotículas: o homem e a mulher. “Por essa
narrativa e cosmologia indígena de que nós somos o povo
das águas é que o rio nos tem fundamental importância”,
diz Márcia Wayna Kambeba, mestre em Geografia e
escritora. Todos os dias, ela ia com o pai observar o rio.
Ia em silêncio e, antes que tomasse para si a palavra, era
interrompida. “Ouça o rio”, o pai dizia. Depois de cerca de
duas horas a ouvir as águas do Solimões, ela mergulhava.
“Confie no rio e aprenda com ele”. “Fui entender mais
tarde, com meus estudos e vivências, que meu pai estava
me apresentando à sabedoria milenar do rio”.
Rios amazônicos influenciam no agro e em reservatórios do Sudeste.
Disponível em: www.uol.com.br. Acesso em: 14 out. 2021.', 'Pelo descrito no texto, o povo Kambeba tem o rio como um(a)', '[{"letra": "A", "texto": "objeto tombado e museográfico."}, {"letra": "B", "texto": "herança religiosa e sacralizada."}, {"letra": "C", "texto": "cenário bucólico e paisagístico."}, {"letra": "D", "texto": "riqueza individual e efêmera."}, {"letra": "E", "texto": "patrimônio cultural e afetivo."}]', 'E', 'Para o povo indígena Kambeba, o rio transcende o aspecto físico, constituindo um patrimônio cultural, afetivo e espiritual inseparável de sua vida.', NULL, NULL, 'resumida', FALSE, FALSE, 'b430b59c1eed7ade4c357c9963897eb4dbbf420370a27d11492a84c5e0e900bf', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Obras públicas no Nordeste / Açude Itans', 2022, '1º dia', 'INEP', 76, 'Questão 76', 'humanas', 'medio', 'Lá embaixo está o Açude Itans, com seu formigueiro
a cavar a terra. É mesmo impressionante o esforço
daquele formigar de homens ao sol, lavados em suor, que
não param, em longas filas pacientes acompanhando
centenas de burricos que sobem e descem, numa ciranda
comovente e silenciosa, cada burrico com duas caixas
de terra no lombo. É o labor organizado para a salvação
da terra e do homem. Depois do semideserto que tanto
nos acabrunhou o espírito por falta de chuvas, o esforço
destes milhares de sertanejos, todos vestidos de brim
mescla e calçando alpercatas, no combate consciente
à esterilidade da natureza, com as famílias alojadas em
pequeninas casas de taipa e telha — embrião de futura
cidade — impressionava-nos profundamente.
VALLE, F. M. História do Açude Itans, município de Caicó (RN).
Brasília, 1994 (adaptado).
Na construção do empreendimento descrito, destaca-se', 'a presença de', '[{"letra": "A", "texto": "engenheiros na execução de canais fluviais."}, {"letra": "B", "texto": "coronéis na ampliação de antigas fazendas."}, {"letra": "C", "texto": "operários na distribuição dos recursos hídricos."}, {"letra": "D", "texto": "trabalhadores na formação de novos espaços."}, {"letra": "E", "texto": "negociantes na organização de redes comerciais."}]', 'D', 'A construção do açude envolveu milhares de trabalhadores sertanejos, promovendo a salvação da terra e a formação de novos espaços urbanos.', NULL, NULL, 'resumida', FALSE, FALSE, '84a63cffbc444e0c6f78de16b8b05774262a2d3c1edf67d441ae2e09ca8e59d5', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'História da medicina / Escravidão e Iluminismo', 2022, '1º dia', 'INEP', 77, 'Questão 77', 'humanas', 'medio', 'Para os Impérios Coloniais, o problema das
doenças que atingiam os escravos era algo com que
cotidianamente deparavam os senhores. Em vista
disso, uma série de obras dedicadas à administração
de escravos foi publicada com vista a implementar
uma moderna gestão da mão de obra escravista em
convergência com o Iluminismo. Nesse contexto,
o saber médico adquiria um papel extremamente
relevante. Este era encarado como um instrumento
fundamental ao desenvolvimento colonial, dada a
percepção do impacto que as doenças tropicais
causavam na população branca e nos povos
escravizados.
ABREU, J. L. N. A Colônia enferma e a saúde dos povos: a medicina das “luzes” e as
informações sobre as enfermidades da América portuguesa. História, Ciências,
Saúde – Manguinhos, n. 3, jul.-set. 2007 (adaptado).
De acordo com o texto, a importância da medicina se', 'justifica no âmbito dos objetivos', '[{"letra": "A", "texto": "econômicos das elites."}, {"letra": "B", "texto": "naturalistas dos viajantes."}, {"letra": "C", "texto": "abolicionistas dos letrados."}, {"letra": "D", "texto": "tradicionalistas dos nativos."}, {"letra": "E", "texto": "emancipadores das metrópoles."}]', 'A', 'O avanço da medicina no período colonial justificava-se por objetivos econômicos das elites, buscando preservar a saúde da mão de obra escravizada.', NULL, NULL, 'resumida', FALSE, FALSE, '2444e854126ff9f9c0898c3f484206154229a5c789354fb722f3dd198e501e80', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Cartografia / Cálculo de escala', 2022, '1º dia', 'INEP', 78, 'Questão 78', 'humanas', 'facil', 'Possível trajeto do voo MH370 da Malaysia Airlines
antes da queda, em 2014
MADAGASCAR
2 500 km
OCEANO
ÍNDICO
AUSTRÁLIA
Perth
Possível trajeto antes da queda
Local onde os destroços
foram avistados
INDONÉSIA
MALÁSIA
Kuala Lumpur
Último contato
Disponível em: http://imguol.com. Acesso em: 30 mar. 2014 (adaptado).
Considerando-se que a distância entre o local onde os
destroços do avião foram avistados e a cidade de Perth
é de 2 cm, a escala aproximada dessa representação', 'cartográfica é:', '[{"letra": "A", "texto": "1 : 12 500."}, {"letra": "B", "texto": "1 : 125 000."}, {"letra": "C", "texto": "1 : 1 250 000."}, {"letra": "D", "texto": "1 : 12 500 000."}, {"letra": "E", "texto": "1 : 125 000 000."}]', 'E', 'Com a distância real de 2.500 km (250.000.000 cm) representada por 2 cm no mapa, a escala cartográfica é calculada como 1 : 125.000.000.', NULL, NULL, 'resumida', TRUE, FALSE, '274b7b3e2265b50c91a30d91d15cfba544a39c7654ac4d1fac2a0272af2ae188', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Patrimônio cultural / Memória do trabalho artesanal', 2022, '1º dia', 'INEP', 79, 'Questão 79', 'humanas', 'facil', 'Hoje sou um ser inanimado, mas já tive vida pulsante
em seivas vegetais, fui um ser vivo; é bem verdade que
do reino vegetal, mas isso não me tirou a percepção de
vida vivida como tamborete. Guardo apreço pelos meus
criadores, as mãos que me fizeram, me venderam, e
pelas mulheres que me usaram para suas vendas e de
tantas outras maneiras. Essas pessoas, sim, tiveram
suas subjetividades, singularidades e pluralidades, que
estão incorporadas a mim. É preciso considerar que a
nossa história, de móveis de museus, está para além da
mera vinculação aos estilos e à patrimonialização que
recebemos como bem material vinculado ao patrimônio
imaterial. A nossa história está ligada aos dons individuais
das pessoas e suas práticas sociais. Alguns indivíduos
consagravam-se por terem determinados requisitos, tais
como o conhecimento de modelos clássicos ou destreza
nos desenhos.
FREITAS, J. M.; OLIVEIRA, L. R. Memórias de um tamborete de baiana: as muitas vozes
em um objeto de museu. Revista Brasileira de Pesquisa (Auto)Biográfica,
n. 14, maio-ago. 2020 (adaptado).
Ao descrever-se como patrimônio museológico, o objeto', 'abordado no texto associa a sua história às', '[{"letra": "A", "texto": "habilidades artísticas e culturais dos sujeitos."}, {"letra": "B", "texto": "vocações religiosas e pedagógicas dos mestres."}, {"letra": "C", "texto": "naturezas antropológica e etnográfica dos expositores."}, {"letra": "D", "texto": "preservações arquitetônica e visual dos conservatórios."}, {"letra": "E", "texto": "competências econômica e financeira dos comerciantes."}]', 'A', 'O texto valoriza os móveis museológicos ao associar sua trajetória às habilidades manuais, artísticas e práticas sociais dos trabalhadores.', NULL, NULL, 'resumida', FALSE, FALSE, '7072a4dea944b8f2b692c02a3628fb873b5d9d85b1afdc9fe96be0cc22efacd4', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Filosofia', 'Filosofia Grega / Origem da Polis e Sofistas', 2022, '1º dia', 'INEP', 80, 'Questão 80', 'humanas', 'medio', 'Advento da Polis, nascimento da filosofia: entre as
duas ordens de fenômenos, os vínculos são demasiado
estreitos para que o pensamento racional não apareça,
em suas origens, solidário das estruturas sociais e
mentais próprias da cidade grega. Assim recolocada na
história, a filosofia despoja-se desse caráter de revelação
absoluta que às vezes lhe foi atribuído, saudando, na
jovem ciência dos jônios, a razão intemporal que veio
encarnar-se no Tempo. A escola de Mileto não viu
nascer a Razão; ela construiu uma Razão, uma primeira
forma de racionalidade. Essa razão grega não é a razão
experimental da ciência contemporânea.
VERNANT, J. P. Origens do pensamento grego. Rio de Janeiro: Difel, 2002.
Os vínculos entre os fenômenos indicados no trecho
foram fortalecidos pelo surgimento de uma categoria de', 'pensadores, a saber:', '[{"letra": "A", "texto": "Os epicuristas, envolvidos com o ideal de vida feliz."}, {"letra": "B", "texto": "Os estoicos, dedicados à superação dos infortúnios."}, {"letra": "C", "texto": "Os sofistas, comprometidos com o ensino da retórica."}, {"letra": "D", "texto": "Os peripatéticos, empenhados na dinâmica do ensino."}, {"letra": "E", "texto": "Os poetas rapsodos, responsáveis pela narrativa do mito."}]', 'C', 'O nascimento da Polis e o desenvolvimento do espaço público democrático em Atenas foram fortalecidos pelos sofistas, mestres da retórica.', NULL, NULL, 'resumida', FALSE, FALSE, '5cbec73be3dd682d6091063d303e5937cdd6d8bb184178108fefc194a55e8a13', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Estado Novo / Censura e Departamento de Imprensa e Propaganda', 2022, '1º dia', 'INEP', 81, 'Questão 81', 'humanas', 'facil', 'Decreto-Lei n. 1 949, de 27/12/1937
Art. 1º Fica criado o Departamento de Imprensa
e Propaganda (DIP), diretamente subordinado ao
presidente da República.
Art. 2º O DIP tem por fim:
h) coordenar e incentivar as relações da imprensa com
os poderes públicos no sentido de maior aproximação
da mesma com os fatos que se ligam aos interesses
nacionais;
n) autorizar mensalmente a devolução dos depósitos
efetuados pelas empresas jornalísticas para a importação
de papel para imprensa, uma vez demonstrada, a seu
juízo, a eficiência e a utilidade pública dos jornais ou
periódicos por elas administrados ou dirigidos.
BRASIL apud CARONE, E. A Terceira República (1937-1945).
São Paulo: Difel, 1982 (adaptado).
Com base nos trechos do decreto, as finalidades do órgão', 'criado permitiram ao governo promover o(a)', '[{"letra": "A", "texto": "diversificação da opinião pública."}, {"letra": "B", "texto": "mercantilização da cultura popular."}, {"letra": "C", "texto": "controle das organizações sindicais."}, {"letra": "D", "texto": "cerceamento da liberdade de expressão."}, {"letra": "E", "texto": "privatização dos meios de comunicação."}]', 'D', 'O decreto de criação do DIP atribuiu ao órgão o poder de controlar a imprensa e direcionar publicações, promovendo o cerceamento da liberdade de expressão.', NULL, NULL, 'resumida', FALSE, FALSE, 'ec1826c7981b55253a6fd85c2112a56a02f27fa45a59addd95a84572be6c1271', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Geologia da Amazônia / Escudos cristalinos e minérios', 2022, '1º dia', 'INEP', 82, 'Questão 82', 'humanas', 'medio', 'Rochas ígneas
Amazônia Legal
ROCHAS ÍGNEAS DA AMAZÔNIA LEGAL
70°W 60°W 50°W
70°W 60°W 50°W
5°N
0°
5°S
10°S
15°S
5°N
0°
5°S
10°S
15°S
VenezuelaVenezuela
Colômbia
Peru
Bolívia
Chile
Guiana
Suriname
Guiana FrancesaGuiana Francesa
Oceano
Pacífico
Oceano
Atlântico
Amazonas
Pará
Amapá
TocantinsTocantins
Piauí
Bahia
Goiás
DF Minas Gerais
Mato Grosso do Sul
RondôniaRondônia
Mato Grosso
Acre
0 80 160 320Km
Projeção: Albers
Datum: SIRGAS 2000
RoraimaRoraima
aranhãoMaranhão
Geoestatísticas de recursos naturais da Amazônia Legal.
Rio de Janeiro: IBGE, 2011 (adaptado).
O mapa espacializa um recurso natural com alto potencial', 'para ocorrência de:', '[{"letra": "A", "texto": "Abalos sísmicos periódicos."}, {"letra": "B", "texto": "Jazidas de minerais metálicos."}, {"letra": "C", "texto": "Reservas de combustíveis fósseis."}, {"letra": "D", "texto": "Aquíferos sedimentares profundos."}, {"letra": "E", "texto": "Estruturas geológicas metamórficas."}]', 'B', 'O mapeamento das rochas ígneas e metamórficas do cráton amazônico indica alto potencial para a ocorrência de jazidas de minerais metálicos.', NULL, NULL, 'resumida', FALSE, FALSE, '27af0c4218939d121891aaa6da613ef271da89646ed882f545301860be1f585b', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Direitos humanos e cidadania / Condição de apátrida', 2022, '1º dia', 'INEP', 83, 'Questão 83', 'humanas', 'facil', 'Nascidas no Líbano, as duas irmãs não puderam
ser registradas no país, porque lá é exigido que os
nascidos sejam filhos de pais e mães libaneses. Seus
pais, de nacionalidade síria, também não puderam
registrá-las no país de origem. Na Síria, crianças só
são registradas por pais oficialmente casados, o que
não era o caso deles.
Disponível em: https://agenciabrasil.ebc.com.br. Acesso em: 7 nov. 2021.
Em situações como a apresentada no texto, as pessoas ao', 'nascerem já se encontram na condição sociopolítica de', '[{"letra": "A", "texto": "exiladas."}, {"letra": "B", "texto": "apátridas."}, {"letra": "C", "texto": "foragidas."}, {"letra": "D", "texto": "refugiadas."}, {"letra": "E", "texto": "clandestinas."}]', 'B', 'Crianças que nascem em países que exigem hereditariedade e não são registradas no país de origem dos pais ficam na condição de apátridas.', NULL, NULL, 'resumida', FALSE, FALSE, 'd4785d43d5cc07ba6c9b96df3694bffc24c79c2a218ae9e018b091230603f1fc', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Filosofia', 'Estética / Percepção e vivência estética', 2022, '1º dia', 'INEP', 84, 'Questão 84', 'humanas', 'medio', 'TEXTO I
Uma filosofia da percepção que queira reaprender a
ver o mundo restituirá à pintura e às artes em geral seu
lugar verdadeiro.
MERLEAU-PONTY, M. Conversas: 1948. São Paulo: Martins Fontes, 2004.
TEXTO II
Os grandes autores de cinema nos pareceram
confrontáveis não apenas com pintores, arquitetos,
músicos, mas também com pensadores. Eles pensam
com imagens, em vez de conceitos.
DELEUZE, G. Cinema 1: a imagem-movimento. São Paulo: Brasiliense, 1983 (adaptado).', 'De que modo os textos sustentam a existência de um
saber ancorado na sensibilidade?', '[{"letra": "A", "texto": "Admitindo o belo como fenômeno transcendental."}, {"letra": "B", "texto": "Reafirmando a vivência estética como juízo de gosto."}, {"letra": "C", "texto": "Considerando o olhar como experiência de conhecimento."}, {"letra": "D", "texto": "Apontando as formas de expressão como auxiliares da razão."}, {"letra": "E", "texto": "Estabelecendo a inteligência como implicação das representações."}]', 'C', 'Os textos sustentam que a pintura e o cinema produzem um saber ancorado na sensibilidade ao considerar o olhar como experiência de conhecimento.', NULL, NULL, 'resumida', FALSE, FALSE, '7ce5f7cac3c2b41b331aea5f4f3ef01c641b37b64a869e58d1fbb135ad35557d', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'Inquisição / Rituais de fé e disciplina social', 2022, '1º dia', 'INEP', 85, 'Questão 85', 'humanas', 'facil', 'TEXTO I
Manda o Santo Ofício da Inquisição que ninguém,
seja qual for seu estado, idade ou condição, pare com
carroça, caleça ou montaria nem atrapalhe com mesas
ou cadeiras o centro das ruas, que vão da Inquisição a
São Domingos, nem atravesse a procissão em ponto
algum da ida ou da volta, amanhã, 19 do corrente, em
que se celebrará auto de fé. E também que nem nesse
dia nem nos dos açoites ouse alguém atirar nos réus
maçãs, pedras, laranjas nem outra coisa qualquer.
PALMA, R. Anais da Inquisição de Lima. São Paulo: Edusp; Giordano, 1992 (adaptado).
TEXTO II
Como acontece em todos os ritos, o sentido do auto
da fé é conferido pela sequência dos atos que o compõem.
Os lugares, as posturas, os gestos, as palavras são
fixados previamente em toda a sua complexidade. Por
isso, o auto da fé apresenta momentos fortes — durante
a preparação, a encenação, o ato e a recepção — que
convém seguir em seus pormenores.
BETHENCOURT, F. História das Inquisições: Portugal, Espanha e Itália – séculos XV-XIX.', 'São Paulo: Cia. das Letras, 2000.
O rito mencionado nos textos demonstra a capacidade
da Igreja em', '[{"letra": "A", "texto": "abrandar cerimônias de punição."}, {"letra": "B", "texto": "favorecer anseios de violência."}, {"letra": "C", "texto": "criticar políticas de disciplina."}, {"letra": "D", "texto": "produzir padrões de conduta."}, {"letra": "E", "texto": "ordenar cultos de heresia."}]', 'D', 'Os autos de fé eram rituais encenados publicamente com extrema rigidez para produzir e reafirmar padrões morais e sociais de conduta.', NULL, NULL, 'resumida', FALSE, FALSE, '60844aa6ec1086a860c79b40d904f5b746e22d4525b5664ea5b317a2f851edda', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Filosofia', 'Pré-socráticos / Cosmologia de Empédocles', 2022, '1º dia', 'INEP', 86, 'Questão 86', 'humanas', 'medio', 'Empédocles estabelece quatro elementos corporais
— fogo, ar, água e terra —, que são eternos e que mudam
aumentando e diminuindo mediante mistura e separação;
mas os princípios propriamente ditos, pelos quais aqueles
são movidos, são o Amor e o Ódio. Pois é preciso que os
elementos permaneçam alternadamente em movimento,
sendo ora misturados pelo Amor, ora separados pelo Ódio.
SIMPLÍCIO. Física, 25, 21. In: Os pré-socráticos. São Paulo: Nova Cultural, 1996.
O texto propõe uma reflexão sobre o entendimento de
Empédocles acerca da arché, uma preocupação típica do', 'pensamento pré-socrático, porque', '[{"letra": "A", "texto": "exalta a investigação filosófica."}, {"letra": "B", "texto": "transcende ao mundo sensível."}, {"letra": "C", "texto": "evoca a discussão cosmogônica."}, {"letra": "D", "texto": "fundamenta as paixões humanas."}, {"letra": "E", "texto": "corresponde à explicação mitológica."}]', 'C', 'A filosofia de Empédocles volta-se para a busca da arché (origem) por meio da mistura e separação dos elementos, evocando a discussão cosmogônica.', NULL, NULL, 'resumida', FALSE, FALSE, '8606e062c72a71e035c6548fba60267bbd833808f0d51fb0f89c9d8a9f99dab8', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Geografia', 'Urbanização / Êxodo rural e macrocefalia', 2022, '1º dia', 'INEP', 87, 'Questão 87', 'humanas', 'facil', 'Macrocefalia urbana pode ser entendida como a
massiva concentração das atividades econômicas em
algumas metrópoles que propicia o desencadeamento
de processos descompassados: redirecionamento e
convergência de fluxos migratórios, déficit no número
de empregos, ocupação desordenada de determinadas
regiões da cidade e estigmatização de estratos sociais,
que comprometem substancialmente a segurança pública
urbana.
SANTOS, M. O espaço dividido: os dois circuitos da economia urbana dos países', 'subdesenvolvidos. São Paulo: Edusp, 2004.
O processo de concentração espacial apresentado foi
estimulado por qual fator geográfico?', '[{"letra": "A", "texto": "Limitação da área ocupada."}, {"letra": "B", "texto": "Êxodo da população do campo."}, {"letra": "C", "texto": "Ampliação do risco habitacional."}, {"letra": "D", "texto": "Deficiência do transporte alternativo."}, {"letra": "E", "texto": "Crescimento da taxa de fecundidade."}]', 'B', 'O processo de macrocefalia urbana foi intensificado pelo forte êxodo da população do campo em direção às poucas metrópoles do país.', NULL, NULL, 'resumida', TRUE, FALSE, '05d4bf4de558786803112084a2d2def2d6693230a4c0dc2cb2b890e3718d0384', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Filosofia', 'Estocismo / Sêneca e serenidade da alma', 2022, '1º dia', 'INEP', 88, 'Questão 88', 'humanas', 'facil', 'Entretanto, nosso amigo Basso tem o ânimo alegre.
Isso resulta da filosofia: estar alegre diante da morte, forte
e contente qualquer que seja o estado do corpo, sem
desfalecer, ainda que desfaleça.
SÊNECA, L. Cartas morais. Lisboa: Calouste Gulbenkian, 1990.', 'O excerto refere-se a uma carta de Sêneca na qual
se apresenta como um bem fundamental da filosofia
promover a', '[{"letra": "A", "texto": "valorização de disputas dialógicas."}, {"letra": "B", "texto": "rejeição das convenções sociais."}, {"letra": "C", "texto": "inspiração de natureza religiosa."}, {"letra": "D", "texto": "exaltação do sofrimento."}, {"letra": "E", "texto": "moderação das paixões."}]', 'E', 'Sêneca apresenta como benefício central da filosofia estoica a moderação das paixões e a serenidade da alma perante a dor e a morte.', NULL, NULL, 'resumida', FALSE, FALSE, '4ecb4d9ee79f1d16a7a13109780d0e90507deee993674470adafa187090c0ee0', 'ENEM-2022_DIA1.txt'),
('ENEM', 'História', 'América Pré-Colombiana / Saberes científicos e culturais', 2022, '1º dia', 'INEP', 89, 'Questão 89', 'humanas', 'facil', 'Quando os espanhóis chegaram à América, estava
em seu apogeu o império teocrático dos Incas, que
estendia seu poder sobre o que hoje chamamos Peru,
Bolívia e Equador, abarcava parte da Colômbia e do Chile
e alcançava até o norte argentino e a selva brasileira; a
confederação dos Astecas tinha conquistado um alto nível
de eficiência no vale do México, e no Yucatán, na América
Central, a esplêndida civilização dos Maias persistia nos
povos herdeiros, organizados para o trabalho e para a
guerra. Os Maias tinham sido grandes astrônomos,
mediram o tempo e o espaço com assombrosa precisão,
e tinham descoberto o valor do número zero antes de
qualquer povo da história. No museu de Lima, podem ser
vistos centenas de crânios que receberam placas de ouro
e prata por parte dos cirurgiões Incas.
GALEANO, E. As veias abertas da América Latina. Porto Alegre: L&PM, 2012.', 'As sociedades mencionadas deixaram como legado uma
diversidade de', '[{"letra": "A", "texto": "bens religiosos inspirados na matriz cristã."}, {"letra": "B", "texto": "materiais bélicos pilhados em batalhas coloniais."}, {"letra": "C", "texto": "heranças culturais constituídas em saberes próprios."}, {"letra": "D", "texto": "costumes laborais moldados em estilos estrangeiros."}, {"letra": "E", "texto": "práticas medicinais alicerçadas no conhecimento científico."}]', 'C', 'Incas, Maias e Astecas deixaram como legado um vasto acervo de heranças culturais constituídas em saberes científicos e astronômicos próprios.', NULL, NULL, 'resumida', FALSE, FALSE, '478049396ae8f16fe86c733eef76f9359fb450cfde803ffffb9fdcc39b7c8b60', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Sociologia', 'Saberes tradicionais / Paneleiras de Goiabeiras', 2022, '1º dia', 'INEP', 90, 'Questão 90', 'humanas', 'facil', 'Em Vitória (ES), no bairro Goiabeiras, encontramos
as paneleiras, mulheres que são conhecidas pelos
saberes/fazeres das tradicionais panelas de barro, ícones
da culinária capixaba. A tradição passada de mãe para
filha é de origem indígena e sofreu influência de outras
etnias, como a afro e a luso. Dessa mistura, acredita-se
que a fabricação das panelas de barro já tenha 400 anos.
A fabricação das panelas de barro se dá em várias etapas,
desde a obtenção de matéria-prima à confecção das
panelas. As matérias-primas tradicionalmente utilizadas
são provenientes do meio natural, como: argila, retirada
do barreiro no Vale do Mulembá; madeira, atualmente
proveniente das sobras da construção civil; e tinta, extraída
da casca do manguezal, o popular mangue-vermelho.', 'TRISTÃO, M. A educação ambiental e o pós-colonialismo.
Revista de Educação, n. 53, ago. 2014.
Uma característica de práticas tradicionais como a
exemplificada no texto é a vinculação entre os recursos
do mundo natural e a', '[{"letra": "A", "texto": "manutenção dos modos de vida."}, {"letra": "B", "texto": "conservação dos plantios da roça."}, {"letra": "C", "texto": "atualização do modelo de gestão."}, {"letra": "D", "texto": "participação na sociedade de consumo."}, {"letra": "E", "texto": "especialização nas etapas de produção."}]', 'A', 'A produção artesanal das panelas de barro em Vitória exemplifica como os recursos naturais e saberes ancestrais sustentam a manutenção dos modos de vida.', NULL, NULL, 'resumida', FALSE, FALSE, '195a6cf5588c22407a347a74669e0bc065dba3deebd1f7791c6e11f6ab24da54', 'ENEM-2022_DIA1.txt'),
('ENEM', 'Química', 'Reações de Oxirredução / Remediação de solos', 2022, '2º dia', 'INEP', 91, 'Questão 91', 'natureza', 'medio', 'A	figura	ilustra	esquematicamente	um	processo	de
remediação de solos contaminados com tricloroeteno
(TCE), um agente desengraxante. Em razão de
vazamentos de tanques de estocagem ou de manejo
inapropriado de resíduos industriais, ele se encontra
presente em águas subterrâneas, nas quais forma
uma	fase	líquida	densa	não	aquosa	(DNAPL)	que	se
deposita no fundo do aquífero. Essa tecnologia de
descontaminação	emprega	o	íon	persulfato	(S2O8
2−), que
é convertido no radical •SO 4
− por minerais que contêm
Fe(III).	O	esquema	representa	de	forma	simplificada	o
mecanismo	de	ação	química	sobre	o	TCE	e	a	formação
dos	produtos	de	degradação.
A) A
A) SOLO
Cl
Cl
Cl
OH
Cl
Cl
O
OH
O
OH
O
OH
C
H
O
MONITORAMENTO
TCE
DNAPL SOLUBILIZAÇÃO ÁGUA SUBTERRÂNEA
TCE
SO SOFe III
28
2
4⋅
SO28
2−
()
BERTAGI,	L.	T.;	BASÍLIO,	A.	O.;	PERALTA-ZAMORA,	P.	Aplicações	ambientais	de	persulfato:
remediação	de	águas	subterrâneas	e	solos	contaminados.	Química Nova, n. 9, 2021 (adaptado).', 'Esse	procedimento	de	remediação	de	águas	subterrâneas
baseia-se	em	reações	de', '[{"letra": "A", "texto": "oxirredução."}, {"letra": "B", "texto": "substituição."}, {"letra": "C", "texto": "precipitação."}, {"letra": "D", "texto": "desidratação."}, {"letra": "E", "texto": "neutralização."}]', 'A', 'O processo de conversão do íon persulfato em radical livre por íons de Fe(III) e a degradação do trichloroeteno (TCE) fundamentam-se em reações de transferência de elétrons (oxirredução).', NULL, NULL, 'resumida', TRUE, FALSE, 'addc4b9aeac2de20bdf2fb66d2208a6928ebfd04e3ba1d8296c8ce49c24d1e34', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Genética / Mutações e heredograma', 2022, '2º dia', 'INEP', 92, 'Questão 92', 'natureza', 'medio', 'De	acordo	com	a	Organização	Mundial	da	Saúde,
a	filariose	e	a	leishmaniose	são	consideradas	doenças
tropicais	infecciosas	e	constituem	uma	preocupação	para
a saúde pública por ser alto o índice de mortalidade a
elas associado.', 'Uma	medida	profilática	comum	a	essas	duas	doenças	é	o(a)', '[{"letra": "A", "texto": "incineração\tdo\tlixo\torgânico."}, {"letra": "B", "texto": "construção\tde\trede\tde\tesgoto."}, {"letra": "C", "texto": "uso\tde\tvermífugo\tpela\tpopulação."}, {"letra": "D", "texto": "controle das populações dos vetores."}, {"letra": "E", "texto": "consumo de carnes vermelhas bem cozidas."}]', 'C', 'A análise da árvore genealógica indica um padrão de herança dominante e ligado ao X ou autossômico, no qual o alelo mutado se expressa em heterozigozes.', NULL, NULL, 'resumida', FALSE, FALSE, '1dce0681baf66125fd4feb54d3bb1ecfe6b0fe0d8cf6f1a68ef0f596a20499d6', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Química Orgânica / Separação de misturas', 2022, '2º dia', 'INEP', 93, 'Questão 93', 'natureza', 'medio', 'Em 2017, foi inaugurado, no estado da Bahia, o
Parque Solar Lapa, composto por duas usinas (Bom Jesus
da Lapa e Lapa) e capaz de gerar cerca de 300 GWh de
energia por ano. Considere que cada usina apresente
potência igual a 75 MW, com o parque totalizando uma
potência instalada de 150 MW. Considere ainda que a
irradiância solar média é de 1 500 W
m2	e	que	a	eficiência
dos painéis é de 20%.
Parque Solar Lapa entra em operação. Disponível em: www.canalbioenergia.com.br.
Acesso em: 9 jun. 2022 (adaptado).
Nessas condições, a área total dos painéis solares que', 'compõem o Parque Solar Lapa é mais próxima de:', '[{"letra": "A", "texto": "1 000 000 m2"}, {"letra": "B", "texto": "500 000 m2"}, {"letra": "C", "texto": "250 000 m2"}, {"letra": "D", "texto": "100 000 m2"}, {"letra": "E", "texto": "20 000 m2"}]', 'B', 'A técnica descrita para purificação de biodiesel via extração com solventes polares promove a partição dos subprodutos glicéricos na fase aquosa.', NULL, NULL, 'resumida', TRUE, FALSE, '94f0531a8d3b2cf74bce11afd5de9cdc3ca6450b14b08660f5e602da13fea158', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Ecologia / Impactos ambientais e bioacumulação', 2022, '2º dia', 'INEP', 94, 'Questão 94', 'natureza', 'facil', 'Os riscos apresentados pelos produtos dependem de
suas propriedades e da reatividade quando em contato
com outras substâncias. Para prevenir os riscos devido
à natureza química dos produtos, devemos conhecer
a lista de substâncias incompatíveis e de uso cotidiano
em	fábricas,	hospitais	e	laboratórios,	a	fim	de	observar
cuidados na estocagem, manipulação e descarte.
O quadro elenca algumas dessas incompatibilidades, que
podem levar à ocorrência de acidentes.
Substância Incompatibilidade Riscos
associados
Ácidos
minerais
fortes
concentrados
Bases fortes
Cianetos
Hipoclorito de sódio
Reação	enérgica,
explosão,
produção	de
oxidante forte e
produto tóxico
Ácido nítrico
concentrado Matéria orgânica
Reação	enérgica,
explosão	e
produto tóxico
Considere que houve o descarte indevido de dois
conjuntos de substâncias:
(1) ácido clorídrico concentrado com cianeto de potássio;
(2) ácido nítrico concentrado com sacarose.
Disponível	em:	www.fiocruz.br.	Acesso	em:	6	dez.	2017	(adaptado).
O descarte dos conjuntos (1) e (2) resultará,', 'respectivamente, em', '[{"letra": "A", "texto": "liberação\tde\tgás\ttóxico\te\treação\toxidativa\tforte."}, {"letra": "B", "texto": "reação\toxidativa\tforte\te\tliberação\tde\tgás\ttóxico."}, {"letra": "C", "texto": "formação\tde\tsais\ttóxicos\te\treação\toxidativa\tforte."}, {"letra": "D", "texto": "liberação\tde\tgás\ttóxico\te\tliberação\tde\tgás\toxidante."}, {"letra": "E", "texto": "formação\tde\tsais\ttóxicos\te\tliberação\tde\tgás\toxidante. *020325AZ2* 3"}]', 'B', 'O acúmulo progressivo de microplásticos e contaminantes ao longo dos níveis tróficos da teia alimentar marinha caracteriza o fenômeno da magnificação trófica.', NULL, NULL, 'resumida', FALSE, FALSE, '4954cac8ef0c0ff2e95ddbd8234d539fce1c80f5a3cdf950e635e9609faeb42b', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Química Ambiental / Tratamento de água e coagulação', 2022, '2º dia', 'INEP', 97, 'Questão 97', 'natureza', 'facil', 'O urânio é empregado como fonte de energia em
reatores nucleares. Para tanto, o seu mineral deve
ser refinado, convertido a hexafluoreto de urânio e
posteriormente enriquecido, para aumentar de 0,7% a 3%
a	abundância	de	um	isótopo	específico	—	o	urânio-235.
Uma das formas de enriquecimento utiliza a pequena
diferença	de	massa	entre	os	hexafluoretos	de	urânio-235	e
de	urânio-238	para	separá-los	por	efusão,	precedida	pela
vaporização.	Esses	vapores	devem	efundir	repetidamente
milhares de vezes através de barreiras porosas formadas por
telas com grande número de pequenos orifícios. No entanto,
devido à complexidade e à grande quantidade de energia
envolvida, cientistas e engenheiros continuam a pesquisar
procedimentos alternativos de enriquecimento.
ATKINS, P.; JONES, L. Princípios de química: questionando a vida moderna e
o meio ambiente. Porto Alegre: Bookman, 2006 (adaptado).
Considerando a diferença de massa mencionada entre os
dois isótopos, que tipo de procedimento alternativo ao da', 'efusão	pode	ser	empregado	para	tal	finalidade?', '[{"letra": "A", "texto": "Peneiração."}, {"letra": "B", "texto": "Centrifugação."}, {"letra": "C", "texto": "Extração\tpor\tsolvente."}, {"letra": "D", "texto": "Destilação\tfracionada."}, {"letra": "E", "texto": "Separação\tmagnética."}]', 'B', 'A adição de sulfato de alumínio e hidróxido de cálcio promove a formação do precipitado de Al(OH)3, favorecendo a aglutinação e flotação/decantação de impurezas.', NULL, NULL, 'resumida', TRUE, FALSE, '1917e445280e2459afc6256b7b3922c4d414b572787e0f72d0224e11a9eed1cc', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Fisiologia Vegetal / Fitormônios e amadurecimento', 2022, '2º dia', 'INEP', 98, 'Questão 98', 'natureza', 'facil', 'A Agência Nacional de Vigilância Sanitária (Anvisa)
aprovou um produto de terapia gênica no país, indicado
para	o	tratamento	da	distrofia	hereditária	da	retina.	O
procedimento é recomendado para crianças acima de
12	meses	e	adultos	com	perda	de	visão	causada	pela
mutação	do	gene	humano	RPE65.	O	produto,	elaborado
por engenharia genética, é composto por um vírus, no qual
foi inserida uma cópia do gene normal humano RPE65
para corrigir o funcionamento das células da retina.
ANVISA. Disponível em: www.gov.br/anvisa. Acesso em: 4 dez. 2021 (adaptado).', 'O sucesso dessa terapia advém do fato de que o produto
favorecerá a', '[{"letra": "A", "texto": "correção do código genético para a tradução da proteína."}, {"letra": "B", "texto": "alteração\tdo\tRNA\tribossômico\tligado\tà\tsíntese\tda proteína."}, {"letra": "C", "texto": "produção\tde\tmutações\tbenéficas\tpara\ta\tcorreção\tdo problema."}, {"letra": "D", "texto": "liberação imediata da proteína normal na região ocular humana."}, {"letra": "E", "texto": "expressão\tdo\tgene\tresponsável\tpela\tprodução\tda enzima normal. *020325AZ4* 5"}]', 'D', 'O gás etileno é o fitormônio responsável por acelerar o amadurecimento de frutos climatéricos quando mantidos em recipientes fechados.', NULL, NULL, 'resumida', FALSE, FALSE, 'e40b946a3e8752d9c5d4e616e8bb68006466cae734cef993294b6c8c05ae2a4a', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Ondulatória / Refração e dispersão da luz', 2022, '2º dia', 'INEP', 99, 'Questão 99', 'natureza', 'medio', 'A extinção de espécies é uma ameaça real que
afeta	diversas	regiões	do	país.	A	introdução	de	espécies
exóticas pode ser considerada um fator maximizador
desse processo. A jaqueira (Artocarpus heterophyllus ),
por exemplo, é uma árvore originária da Índia e de
regiões do Sudeste Asiático que foi introduzida ainda na
era colonial e se aclimatou muito bem em praticamente
todo o território nacional.
Casos	como	o	dessa	árvore	podem	provocar	a	redução', 'da biodiversidade, pois elas', '[{"letra": "A", "texto": "ocupam áreas de vegetação nativa e substituem parcialmente\ta\tflora\toriginal."}, {"letra": "B", "texto": "estimulam\ta\tcompetição\tpor\tseus\tfrutos\tentre\tanimais típicos\tda\tregião\te\teliminam\tas\tespécies\tperdedoras."}, {"letra": "C", "texto": "alteram os nichos e aumentam o número de possibilidades de relações entre os seres vivos daquele ambiente."}, {"letra": "D", "texto": "apresentam\talta\ttaxa\tde\treprodução\te\tse\tmantêm com um número de indivíduos superior à capacidade suporte do ambiente."}, {"letra": "E", "texto": "diminuem a relação de competição entre os polinizadores\te\tfacilitam\ta\tação\tde\tdispersores\tde sementes de espécies nativas."}]', 'A', 'Ao passar de um meio menos refringente para outro mais refringente (como o ar para a gota d''água), a luz sofre refração com diminuição de velocidade e desvio angular.', NULL, NULL, 'resumida', TRUE, FALSE, '808d53356486a7fe445ff78512ec749a363b35c681ec2f21ebc628cb4d68b4f9', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Termoquímica / Entalpia de reação', 2022, '2º dia', 'INEP', 100, 'Questão 100', 'natureza', 'medio', 'Em	um	dia	de	calor intenso, dois colegas estão
a brincar com a água da mangueira. Um deles quer
saber até que altura o jato de água alcança, a partir da
saída de água, quando a mangueira está posicionada
totalmente na	direção	vertical. O	outro	colega	propõe
então	o	seguinte	experimento:	eles	posicionarem	a	saída
de	água	da	mangueira	na	direção	horizontal,	a	1	m	de', 'altura	em	relação	ao	chão,	e	então	medirem	a	distância
horizontal entre a mangueira e o local onde a água
atinge	o	chão.	A	medida	dessa	distância foi	de	3	m,
e a partir disso eles calcularam o alcance vertical do
jato	de	água.	Considere	a	aceleração	da	gravidade	de
10 m s -2.
O resultado que eles obtiveram foi de', '[{"letra": "A", "texto": "1,50 m."}, {"letra": "B", "texto": "2,25 m."}, {"letra": "C", "texto": "4,00 m."}, {"letra": "D", "texto": "4,50 m."}, {"letra": "E", "texto": "5,00 m."}]', 'C', 'A variação de entalpia da reação global é determinada pela soma das entalpias das etapas intermediárias aplicando-se a Lei de Hess.', NULL, NULL, 'resumida', TRUE, FALSE, '16d7a371718430767e6a7e68408dbf16a10833907321e5531aea1ea071e3cbfc', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Microbiologia / Controle bacteriano e antibióticos', 2022, '2º dia', 'INEP', 101, 'Questão 101', 'natureza', 'medio', 'O etanol é um combustível produzido a partir da
fermentação	da	sacarose	presente	no	caldo	de	cana-
-de-açúcar.	Um	dos	fatores	que	afeta	a	produção	desse
álcool	é	o	grau	de	deterioração	da	sacarose,	que	se	inicia
após	o	corte,	por	causa	da	ação	de	microrganismos.	Foram
analisadas	cinco	amostras	de	diferentes	tipos	de	cana-de-
-açúcar	e	cada	uma	recebeu	um	código	de	identificação.
No	quadro	são	apresentados	os	dados	de	concentração	de
sacarose e de microrganismos presentes nessas amostras.
Amostra de cana-de-açúcar
RB72 RB84 RB92 SP79 SP80
Concentração	inicial
de sacarose (g L -1) 13,0 18,0 16,0 14,0 17,0
Concentração	de
microrganismos
(mg L -1)
0,7 0,8 0,6 0,5 0,9
Pretende-se	escolher	o	tipo	de	cana-de-açúcar	que
conterá o maior teor de sacarose 10 horas após o corte
e que, consequentemente, produzirá a maior quantidade
de	etanol	por	fermentação.	Considere	que	existe	uma
redução de aproximadamente 50% da concentração
de sacarose nesse tempo, para cada 1,0 mg L -1 de
microrganismos	presentes	na	cana-de-açúcar.
Disponível em: www.inovacao.unicamp.br. Acesso em: 11 ago. 2012 (adaptado).', 'Qual	tipo	de	cana-de-açúcar	deve	ser	escolhido?', '[{"letra": "A", "texto": "RB72"}, {"letra": "B", "texto": "RB84"}, {"letra": "C", "texto": "RB92"}, {"letra": "D", "texto": "SP79"}, {"letra": "E", "texto": "SP80"}]', 'E', 'O mecanismo de ação descrito inibe a síntese da parede celular bacteriana de peptidoglicano, levando à lise e morte celular.', NULL, NULL, 'resumida', FALSE, FALSE, '14d8917c2336df14785b4fd0a575616251ca413c8a6dc0b3aff0bee40e0dd161', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Cinemática / Movimento Uniformemente Variado', 2022, '2º dia', 'INEP', 102, 'Questão 102', 'natureza', 'facil', 'Entre as diversas técnicas para diagnóstico da
covid-19,	destaca-se	o	teste	genético.	Considerando	as
diferentes variantes e cargas virais, um exemplo é a PCR,
reação	efetuada	por	uma	enzima	do	tipo	polimerase.
Essa	técnica	permite	identificar,	com	confiabilidade,	o
material	genético	do	SARS-CoV-2,	um	vírus	de	RNA.
Para	comprovação	da	infecção	por	esse	coronavírus,	são', 'coletadas amostras de secreções do indivíduo. Uma etapa
que	antecede	a	reação	de	PCR	precisa	ser	realizada	para
permitir	a	amplificação	do	material	genético	do	vírus.
Essa etapa deve ser realizada para', '[{"letra": "A", "texto": "concentrar o RNA viral para otimizar a técnica."}, {"letra": "B", "texto": "identificar\tnas\tamostras\tanticorpos\tanti-SARS-CoV-2."}, {"letra": "C", "texto": "proliferar o vírus em culturas, aumentando a carga viral."}, {"letra": "D", "texto": "purificar\tácidos\tnucleicos\tvirais,\tfacilitando\ta\tação\tda enzima."}, {"letra": "E", "texto": "obter\tmoléculas\tde\tcDNA\tviral\tpor\tmeio\tda\ttranscrição reversa. *020325AZ5* 6"}]', 'A', 'O cálculo da distância de frenagem segura utiliza a equação de Torricelli considerando a desaceleração máxima proporcionada pelos freios ABS.', NULL, NULL, 'resumida', TRUE, FALSE, 'e2da22b1a2b00a2bc9760921b0292f78b87f16fb1c505ed14919eac14632dde7', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Citologia / Divisão celular e meiose', 2022, '2º dia', 'INEP', 104, 'Questão 104', 'natureza', 'medio', 'Diversas	substâncias	são	empregadas	com	a	intenção
de incrementar o desempenho esportivo de atletas de
alto nível. O chamado doping sanguíneo, por exemplo,', 'pela	utilização	da	eritropoietina,	é	proibido	pelas	principais
federações de esportes no mundo. A eritropoietina é um
hormônio	produzido	pelos	rins	e	fígado	e	sua	principal	ação
é regular o processo de eritropoiese. Seu uso administrado
intravenosamente em quantidades superiores àquelas
presentes naturalmente no organismo permite que o
indivíduo	aumente	a sua	capacidade	de	realização	de
exercícios físicos.
Esse tipo de doping está diretamente relacionado ao
aumento da', '[{"letra": "A", "texto": "frequência cardíaca."}, {"letra": "B", "texto": "capacidade pulmonar."}, {"letra": "C", "texto": "massa muscular do indivíduo."}, {"letra": "D", "texto": "atividade anaeróbica da musculatura."}, {"letra": "E", "texto": "taxa de transporte de oxigênio pelo sangue."}]', 'B', 'A ocorrência de não-disjunção dos cromossomos homólogos durante a anáfase I da meiose resulta em gametas com anomalias numéricas (aneuploidias).', NULL, NULL, 'resumida', FALSE, FALSE, '1db3f28bf4920634bface529ccd64f818d5f18f28c983b1dd991cba6cd4de69a', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Eletrodinâmica / Circuitos elétricos e potência', 2022, '2º dia', 'INEP', 105, 'Questão 105', 'natureza', 'facil', 'Em um autódromo, os carros podem derrapar em
uma	curva	e	bater	na	parede	de	proteção.	Para	diminuir
o	impacto	de	uma	batida,	pode-se	colocar	na	parede
uma barreira de pneus, isso faz com que a colisão
seja mais demorada e o carro retorne com velocidade
reduzida.	Outra	opção	é	colocar	uma	barreira	de	blocos
de	um	material	que	se	deforma,	tornando-a	tão	demorada
quanto	a	colisão	com	os	pneus,	mas	que	não	permite	a
volta	do	carro	após	a	colisão.
Comparando	as	duas	situações,	como	ficam	a	força	média', 'exercida	sobre	o	carro	e	a	energia	mecânica	dissipada?', '[{"letra": "A", "texto": "A\tforça\té\tmaior\tna\tcolisão\tcom\ta\tbarreira\tde\tpneus,\te a\tenergia\tdissipada\té\tmaior\tna\tcolisão\tcom\ta\tbarreira de blocos."}, {"letra": "B", "texto": "A\tforça\té\tmaior\tna\tcolisão\tcom\ta\tbarreira\tde\tblocos,\te a\tenergia\tdissipada\té\tmaior\tna\tcolisão\tcom\ta\tbarreira de pneus."}, {"letra": "C", "texto": "A\tforça\té\tmaior\tna\tcolisão\tcom\ta\tbarreira\tde\tblocos,\te a energia dissipada é a mesma nas duas situações."}, {"letra": "D", "texto": "A\tforça\té\tmaior\tna\tcolisão\tcom\ta\tbarreira\tde\tpneus,\te a\tenergia\tdissipada\té\tmaior\tna\tcolisão\tcom\ta\tbarreira de pneus."}, {"letra": "E", "texto": "A\tforça\té\tmaior\tna\tcolisão\tcom\ta\tbarreira\tde\tblocos,\te a\tenergia\tdissipada\té\tmaior\tna\tcolisão\tcom\ta\tbarreira de blocos."}]', 'C', 'A potência dissipada por um resistor sob tensão constante é inversamente proporcional à sua resistência (P = V²/R), exigindo menor resistência para maior aquecimento.', NULL, NULL, 'resumida', TRUE, FALSE, 'fbac0a18e00e6ff3ed45f4ab7d2647a72c4d20124e3aa1f2e7aea753d3f47366', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Biotecnologia / Enzimas de restrição e DNA recombinante', 2022, '2º dia', 'INEP', 107, 'Questão 107', 'natureza', 'medio', 'A	biomassa	celulósica	pode	ser	utilizada	para	a	produção	de	etanol	de	segunda	geração.	Entretanto,	é	necessário
que os polissacarídeos sejam convertidos em mono e dissacarídeos, processo que pode ser conduzido em meio
ácido, conforme mostra o esquema:
O
OHOH
OO
OH
O
OH
OH
OH
O
OHOH
O
+O
OH
O
OH
OH
OHH
OH O
OH
OH
OH
O
OHOH
O
OH
H
O
H
O
OHOH O+
O
OH
H
H O
OHOH OH
O
OH
H
+
+
H
+
+
OGEDA, T. L.; PETRI, D. F. S. [...] Química Nova, n. 7, 2010 (adaptado).', 'Nessa	conversão	de	polissacarídeos,	a	função	do	íon	H+ é', '[{"letra": "A", "texto": "dissolver os reagentes."}, {"letra": "B", "texto": "deslocar o equilíbrio químico."}, {"letra": "C", "texto": "aumentar\ta\tvelocidade\tda\treação."}, {"letra": "D", "texto": "mudar\ta\tconstante\tde\tequilíbrio\tda\treação."}, {"letra": "E", "texto": "formar ligações de hidrogênio com o polissacarídeo."}]', 'A', 'A tecnologia do DNA recombinante utiliza enzimas de restrição para cortar sequências específicas de DNA e ligases para inserir o gene de interesse em plasmídeos.', NULL, NULL, 'resumida', TRUE, FALSE, '2266271f3876611a748ef32bf997280f6eecd1a74c64c6a18dbb93fb2cacc42a', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Óptica Geométrica / Lentes delgadas e correção visual', 2022, '2º dia', 'INEP', 108, 'Questão 108', 'natureza', 'facil', 'O	ácido	tartárico	é	o	principal	ácido	do	vinho	e	está	diretamente	relacionado	com	sua	qualidade.	Na	avaliação	de
um	vinho	branco	em	produção,	uma	analista	neutralizou	uma	alíquota	de	25,0	mL	do	vinho	com	NaOH	a	0,10	mol	L−1,
consumindo	um	volume	igual	a	8,0	mL	dessa	base.	A	reação	para	esse	processo	de	titulação	é	representada	pela
equação	química:
OH
OOH
O OH
OH
OOH
O OH
ONa
NaO
 2 NaOH  2 H2O
Ácido tartárico
(massa molar: 150 g mol
1
)', 'A	concentração	de	ácido	tartárico	no	vinho	analisado	é	mais	próxima	de:', '[{"letra": "A", "texto": "1,8 g L−1"}, {"letra": "B", "texto": "2,4 g L−1"}, {"letra": "C", "texto": "3,6 g L−1"}, {"letra": "D", "texto": "4,8 g L−1"}, {"letra": "E", "texto": "9,6 g L−1 *020325AZ8* 9"}]', 'C', 'A correção da miopia é realizada mediante a utilização de lentes divergentes, que afastam o ponto focal para que a imagem se forme sobre a retina.', NULL, NULL, 'resumida', TRUE, FALSE, 'ff18d0c6844bbff7e5ded2569eae8abd7a86b4954aa31ae2bb5e172425c5adcc', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Cinética Química / Catalisadores', 2022, '2º dia', 'INEP', 109, 'Questão 109', 'natureza', 'facil', 'O	elemento	iodo	(I)	tem	função	biológica	e	é	acumulado
na tireoide. Nos acidentes nucleares de Chernobyl e
Fukushima, ocorreu a liberação para a atmosfera do
radioisótopo 131 I, responsável por enfermidades nas
pessoas que foram expostas a ele. O decaimento de uma
massa de 12 microgramas do isótopo 131 I foi monitorado
por 14 dias, conforme o quadro.
Tempo (dia) Massa residual de 131I (µg)
0 12,0
2 10,1
4 8,5
5 7,8
6 7,2
8 6,0
14 3,6
Após o período de 40 dias, a massa residual desse', 'isótopo é mais próxima de', '[{"letra": "A", "texto": "2,4 µg."}, {"letra": "B", "texto": "1,5 µg."}, {"letra": "C", "texto": "0,8 µg."}, {"letra": "D", "texto": "0,4 µg."}, {"letra": "E", "texto": "0,2 µg."}]', 'E', 'A presença de um catalisador acelera a reação química ao fornecer um caminho reacional alternativo com menor energia de ativação, sem alterar a variação de entalpia.', NULL, NULL, 'resumida', TRUE, FALSE, '73eda3e20bb5f31c14abe804ff1a0b951128433717e733fcfae98c80bf10f131', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Evolução / Seleção natural e resistência', 2022, '2º dia', 'INEP', 110, 'Questão 110', 'natureza', 'facil', 'Desde	a	proposição da	teoria	de	seleção	natural
por Darwin, os seres vivos nunca mais foram olhados
da	mesma	forma.	No	que	diz	respeito	à	reprodução	de
anfíbios anuros, os cientistas já descreveram diferentes
padrões	reprodutivos,	como	os	exemplificados	a	seguir:
Espécie 1 – As fêmeas produzem cerca de
5	000 gametas, que são fecundados na água, em
lagoas temporárias de estação chuvosa. Todo o
desenvolvimento embrionário, do ovo à metamorfose,
ocorre, nesse ambiente, independente dos pais.
Espécie 2 – As fêmeas produzem aproximadamente
200	gametas,	que	são	depositados	em	poças	próximas	a
corpos-d’água.	Os	embriões	são	vigiados	pelos	machos
durante boa parte do seu desenvolvimento.
Espécie 3 – As fêmeas produzem por volta de
20	gametas, que	são	fecundados	sobre	a	superfície	das
folhas	de	plantas	cujos	galhos	estão	dispostos	acima	da
superfície de	corpos-d’água e	aí	se	desenvolvem até
a	eclosão.
Espécie 4 – As fêmeas produzem poucos gametas
que, quando fecundados, são “abocanhados” pelos
machos. Os embriões se desenvolvem no interior do
saco vocal do macho até a metamorfose, quando saem', 'através da boca do pai.
Os padrões descritos evidenciam que', '[{"letra": "A", "texto": "as\tfêmeas\tinfluenciam\to\tcomportamento\tdos\tmachos."}, {"letra": "B", "texto": "o cuidado parental é necessário para o desenvolvimento."}, {"letra": "C", "texto": "o grau de evolução determina o comportamento reprodutivo."}, {"letra": "D", "texto": "o sucesso reprodutivo pode ser garantido por estratégias diferentes."}, {"letra": "E", "texto": "o\tambiente\tinduz\tmodificação\tna\tprodução\tdo\tnúmero de gametas femininos."}]', 'B', 'O uso inadequado de defensivos agrícolas seleciona indivíduos naturalmente resistentes que já apresentavam mutações pré-existentes na população.', NULL, NULL, 'resumida', FALSE, FALSE, 'f6798b5eca42b4aa1fa219feaab3203438df2ae464d21cd11787a61a270b40ea', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Mecânica / Conservação da Energia Mecânica', 2022, '2º dia', 'INEP', 111, 'Questão 111', 'natureza', 'medio', 'O	eixo	de	rotação	da	Terra	apresenta	uma	inclinação
em	relação	ao	plano	de	sua	órbita	em	torno	do	Sol,
interferindo	na	duração	do	dia	e	da	noite	ao	longo	do	ano.
Incidência direta
ao meio-dia
Polo Norte
Trópico de
Câncer
Equador
Trópico de
Capricórnio
Círculo Polar
Antártico
Polo Sul
Círculo Polar
Ártico
Terra em 21 de dezembro
DIA NOITE
Uma pessoa instala em sua residência uma placa
fotovoltaica, que transforma energia solar em elétrica.
Ela monitora a energia total produzida por essa placa
em 4 dias do ano, ensolarados e sem nuvens, e lança os', 'resultados	no	gráfico.
Energia
Dia10/01 10/04 10/07 10/10
Disponível	em:	www.fisica.ufpr.br.	Acesso	em:	27	maio	2022	(adaptado).
Próximo	a	que	região	se	situa	a	residência	onde	as	placas
foram	instaladas?', '[{"letra": "A", "texto": "Trópico de Capricórnio."}, {"letra": "B", "texto": "Trópico de Câncer."}, {"letra": "C", "texto": "Polo Norte."}, {"letra": "D", "texto": "Polo Sul."}, {"letra": "E", "texto": "Equador. *020325AZ9* 10"}]', 'D', 'Na ausência de forças dissipativas, a energia potencial gravítica no topo da trajetória transforma-se integralmente em energia cinética no ponto mais baixo.', NULL, NULL, 'resumida', TRUE, FALSE, 'bf2a9ced39934de018ecc9ae74feec8b7a2574074e7b5574fd1e83066deccf4e', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Evolução dos Modelos Atômicos / Modelo de Bohr', 2022, '2º dia', 'INEP', 112, 'Questão 112', 'natureza', 'facil', 'Um pai faz um balanço utilizando dois segmentos
paralelos	e	iguais	da	mesma	corda	para	fixar	uma	tábua	a
uma barra horizontal. Por segurança, opta por um tipo de
corda	cuja	tensão	de	ruptura	seja	25%	superior	à	tensão
máxima calculada nas seguintes condições:
• O	ângulo	máximo	atingido	pelo	balanço	em	relação
à vertical é igual a 90°;
• Os	filhos	utilizarão	o	balanço	até	que	tenham	uma
massa de 24 kg.
Além disso, ele aproxima o movimento do balanço
para o movimento circular uniforme, considera que a', 'aceleração	da	gravidade	é	igual	a 10 2
m
s
e despreza
forças dissipativas.
Qual	é	a	tensão	de	ruptura	da	corda	escolhida?', '[{"letra": "A", "texto": "120 N"}, {"letra": "B", "texto": "300 N"}, {"letra": "C", "texto": "360 N"}, {"letra": "D", "texto": "450 N"}, {"letra": "E", "texto": "900 N"}]', 'A', 'O modelo atômico de Bohr explica a emissão de espectros luminosos descontínuos através da transição de elétrons de níveis de maior energia para níveis de menor energia.', NULL, NULL, 'resumida', TRUE, FALSE, '5834e98dc152c879fb3199328ed436d95cdaad046cb7c2eecfb5e1ea3ef2411f', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Zoologia / Artrópodes e vetores de doenças', 2022, '2º dia', 'INEP', 113, 'Questão 113', 'natureza', 'facil', 'A nanotecnologia é responsável pelo aprimoramento
de	diversos	materiais,	incluindo	os	que	são	impactados
com a presença de poluentes e da umidade na atmosfera,
causadores de corrosão. O processo de corrosão é
espontâneo	e	provoca	a	deterioração	de	metais	como
o ferro, que, em presença de oxigênio e água, sofre
oxidação,	conforme	ilustra	a	equação	química:
4 Fe (s) + 2 H2O (l) + 3 O2 (g) → 2 Fe2O3⋅H2O (s)
Uma forma de garantir a durabilidade da estrutura
metálica e a sua resistência à umidade consiste na
deposição de filmes finos nanocerâmicos à base de
zircônia	(ZrO2) e alumina (Al 2O3) sobre a superfície do
objeto que se deseja proteger.
CLEMENTE, G. A. B. F. et al. O uso de materiais híbridos ou nanocompósitos como
revestimentos anticorrosivos do aço. Química Nova, n. 9, 2021 (adaptado).', 'Essa nanotecnologia aplicada na proteção contra a
corrosão	se	baseia	no(a)', '[{"letra": "A", "texto": "proteção\tcatódica,\tque\tutiliza\tum\tmetal\tfortemente redutor."}, {"letra": "B", "texto": "uso de metais de sacrifício, que se oxidam no lugar do ferro."}, {"letra": "C", "texto": "passivação do ferro, que fica revestido pelo seu próprio óxido."}, {"letra": "D", "texto": "efeito de barreira, que impede o contato com o agente oxidante."}, {"letra": "E", "texto": "galvanização, que usa outros metais de menor potencial\tde\tredução."}]', 'D', 'A eliminação de recipientes com água parada interrompe o ciclo reprodutivo do mosquito Aedes aegypti, vetor de viroses como Dengue e Zika.', NULL, NULL, 'resumida', FALSE, FALSE, '4f4099080ebbbf6c387a1a92f24b528a31ab22f94aa5aa67b45d093bb1c58c6e', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Estática e Hidrostática / Princípio de Pascal', 2022, '2º dia', 'INEP', 114, 'Questão 114', 'natureza', 'medio', 'As células da epiderme da folha da Tradescantia
pallida purpurea, uma herbácea popularmente conhecida
como trapoeraba-roxa, contém um vacúolo onde se
encontra	um	pigmento	que	dá	a	coloração	arroxeada	a
esse tecido. Em um experimento, um corte da epiderme
de	uma	folha	da	trapoeraba-roxa	foi	imerso	em	ambiente
hipotônico	e,	logo	em	seguida,	foi	colocado	em	uma
lâmina e observado em microscópio óptico.', 'Durante	a	observação	desse	corte,	foi	possível	identificar	o(a)', '[{"letra": "A", "texto": "acúmulo\tdo\tsolvente\tcom\tfragmentação\tda\torganela."}, {"letra": "B", "texto": "rompimento\tda\tmembrana\tcelular\tcom\tliberação\tdo citosol."}, {"letra": "C", "texto": "aumento\tdo\tvacúolo\tcom\tdiluição\tdo\tpigmento\tno\tseu interior."}, {"letra": "D", "texto": "quebra da parede celular com extravasamento do pigmento."}, {"letra": "E", "texto": "murchamento\tda\tcélula\tcom\texpulsão\tdo\tpigmento do vacúolo."}]', 'C', 'De acordo com o Princípio de Pascal, a pressão exercida sobre um fluido incompressível é transmitida integralmente a todos os pontos do fluido e das paredes.', NULL, NULL, 'resumida', TRUE, FALSE, '83b95f2ba3bb9c93627756b607145b8464eaecd82b64f008f72c006432a241c7', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Equilíbrio Químico / Princípio de Le Chatelier', 2022, '2º dia', 'INEP', 115, 'Questão 115', 'natureza', 'medio', 'A variação da incidência de radiação solar sobre
a superfície da Terra resulta em uma variação de
temperatura ao longo de um dia denominada amplitude
térmica. Edificações e pavimentações realizadas nas
áreas urbanas contribuem para alterar as amplitudes
térmicas	dessas	regiões,	em	comparação	com	regiões	que
mantêm suas características naturais, com presença de
vegetação	e	água,	já	que	o	calor	específico	do	concreto	é
inferior	ao	da	água.	Assim,	parte	da	avaliação	do	impacto
ambiental que a presença de concreto proporciona às
áreas urbanas consiste em considerar a substituição
da área concretada por um mesmo volume de água e
comparar	as	variações	de	temperatura	devido	à	absorção
da radiação solar nas duas situações (concretada e
alagada). Desprezando os efeitos da evaporação e
considerando que toda a radiação é absorvida, essa
avaliação	pode	ser	realizada	com	os	seguintes	dados:
Densidade kg
m 3
/g167
/g169/g168
/g183
/g185/g184Calor específi coJ
gC/g113/g113
/g167
/g169/g168
/g183
/g185/g184
Água 1 000 4,2
Concreto 2 500 0,8
ROMERO, M. A. B. et al. Mudanças climáticas e ilhas de calor urbanas.', 'Brasília: UnB; ETB, 2019 (adaptado).
A	razão	entre	as	variações	de	temperatura	nas	áreas
concretada e alagada é mais próxima de', '[{"letra": "A", "texto": "1,0."}, {"letra": "B", "texto": "2,1."}, {"letra": "C", "texto": "2,5."}, {"letra": "D", "texto": "5,3."}, {"letra": "E", "texto": "13,1. *020325AZ10* 11"}]', 'E', 'O aumento da pressão do sistema desloca o equilíbrio químico no sentido de menor número de mols de substâncias gasosas.', NULL, NULL, 'resumida', TRUE, FALSE, '01b75bf93b08108c2a81ca57624c79be906e665ef78f9cb449caa5fced81ec03', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Botânica / Condução de seiva e transpiração', 2022, '2º dia', 'INEP', 116, 'Questão 116', 'natureza', 'facil', 'O manual de uma ducha elétrica informa que seus três
níveis de aquecimento (morno, quente e superquente)
apresentam as seguintes variações de temperatura da
água	em	função	de	sua	vazão:
Vazão L
min
/g167
/g169/g168
/g183
/g185/g184
/g39TC()/g113
Morno Quente Superquente
3 10 20 30
6 5 10 15
Utiliza-se	um	disjuntor	para	proteger	o	circuito	dessa
ducha contra sobrecargas elétricas em qualquer nível de
aquecimento.	Por	padrão,	o	disjuntor	é	especificado	pela
corrente nominal igual ao múltiplo de 5 A imediatamente
superior à corrente máxima do circuito. Considere que a
ducha deve ser ligada em 220 V e que toda a energia é
dissipada através da resistência do chuveiro e convertida
em energia térmica transferida para a água, que apresenta', 'calor	específico	de	4,2 J
gC/g3/g113
e densidade de 1 000 g
L.
O	disjuntor	adequado	para	a	proteção	dessa	ducha	é
especificado	por:', '[{"letra": "A", "texto": "60 A"}, {"letra": "B", "texto": "30 A"}, {"letra": "C", "texto": "20 A"}, {"letra": "D", "texto": "10 A"}, {"letra": "E", "texto": "5 A"}]', 'B', 'A teoria da coesão-tensão (Dixson-Joly) explica a subida da seiva bruta no xilema impulsionada pela transpiração foliar e forças de tensão/coesão da água.', NULL, NULL, 'resumida', FALSE, FALSE, '69268feafcf2a7e9add671e294699dfe897ab9888158342340af6ce84df817ed', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Ondulatória / Fenômeno de Interferência e Ruído', 2022, '2º dia', 'INEP', 117, 'Questão 117', 'natureza', 'medio', 'Um grupo de alunos realizou um experimento para
observar algumas propriedades dos ácidos, adicionando', 'um pedaço de mármore (CaCO 3 )	a	uma	solução	aquosa
de	ácido	clorídrico	(HCl),	observando	a	liberação	de	um
gás e o aumento da temperatura.
Gás
Ácido
Mármore
O gás obtido no experimento é o:', '[{"letra": "A", "texto": "H 2"}, {"letra": "B", "texto": "O 2"}, {"letra": "C", "texto": "CO 2"}, {"letra": "D", "texto": "CO"}, {"letra": "E", "texto": "Cl2"}]', 'C', 'Fones de ouvido com cancelamento de ruído ativo geram ondas sonoras com mesma frequência e amplitude, porém em oposição de fase (interferência destrutiva).', NULL, NULL, 'resumida', TRUE, FALSE, 'a6fc7793d6a7553590e7e6c7f4a2ecd28ed20358b048798a9d79c25e4e5f00e1', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Eletroquímica / Pilhas e Potencial de Redução', 2022, '2º dia', 'INEP', 118, 'Questão 118', 'natureza', 'facil', 'Em 2002, foi publicado um artigo científico que
relacionava	alterações	na	produção	de	hormônios	sexuais
de sapos machos expostos à atrazina, um herbicida, com
o	desenvolvimento	anômalo	de	seus	caracteres	sexuais
primários e secundários. Entre os animais sujeitos à
contaminação,	observaram-se	casos	de	hermafroditismo
e	desmasculinização	da	laringe.	O	estudo	em	questão
comparou	a	concentração	de	um	hormônio	específico
no sangue de machos expostos ao agrotóxico com a de
outros	machos	e	fêmeas	que	não	o	foram	(controles).
Os	resultados	podem	ser	vistos	na	figura.
Machos
controle
Concentração do hormônio (ng mL−1)
Machos
expostos
à atrazina
Fêmeas
controle
6
5
4
3
2
1
0
HAYES, T. B. et al. Hermaphroditic, Demasculinized Frogs After Exposure to
the Herbicide Atrazine at Low Ecologically Relevant Doses. Proceedings of
the National Academy of Sciences, n. 8, 2002 (adaptado).
Com	base	nas	informações	do	texto,	qual	é	o	hormônio', 'cujas	concentrações	estão	representadas	na	figura?', '[{"letra": "A", "texto": "Estrogênio."}, {"letra": "B", "texto": "Feromônio."}, {"letra": "C", "texto": "Testosterona."}, {"letra": "D", "texto": "Somatotrofina."}, {"letra": "E", "texto": "Hormônio\tfolículo\testimulante. *020325AZ11* 12"}]', 'A', 'O metal de sacrifício deve possuir um potencial de oxidação maior (menor potencial de redução) do que o metal da estrutura a ser protegida.', NULL, NULL, 'resumida', TRUE, FALSE, 'd17c71c951dfa5c71221ff3ec57ef87eeb98954d85cafeff03b0ca8e0e005397', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Imunologia / Vacinas versus Soros', 2022, '2º dia', 'INEP', 119, 'Questão 119', 'natureza', 'facil', 'Uma	lanterna	funciona	com	três	pilhas	de	resistência	interna	igual	a	0,5	Ω	cada,	ligadas	em	série.	Quando
posicionadas	corretamente,	devem	acender	a	lâmpada	incandescente	de	especificações	4,5	W	e	4,5	V.	Cada	pilha	na
posição	correta	gera	uma	f.e.m.	(força	eletromotriz)	de	1,5	V.	Uma	pessoa,	ao	trocar	as	pilhas	da	lanterna,	comete	o
equívoco	de	inverter	a	posição	de	uma	das	pilhas.	Considere	que	as	pilhas	mantêm	contato	independentemente	da
posição.', 'Com	esse	equívoco,	qual	é	a	intensidade	de	corrente	que	passa	pela	lâmpada	ao	se	ligar	a	lanterna?', '[{"letra": "A", "texto": "0,25 A"}, {"letra": "B", "texto": "0,33 A"}, {"letra": "C", "texto": "0,75 A"}, {"letra": "D", "texto": "1,00 A"}, {"letra": "E", "texto": "1,33 A"}]', 'D', 'A vacinação confere imunização ativa ao introduzir antígenos atenuados para induzir a produção de anticorpos e memória imunológica no organismo.', NULL, NULL, 'resumida', FALSE, FALSE, 'c4de9afb51baa5a2f0d1f7a5a5feaaf70467dc8f7752fea0e06d6dd564512be6', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Magnetismo / Força magnética sobre cargas', 2022, '2º dia', 'INEP', 120, 'Questão 120', 'natureza', 'medio', 'Em uma aula prática de bioquímica, para medir a atividade catalítica da enzima catalase, foram realizados seis
ensaios	independentes,	nas	mesmas	condições,	variando-se	apenas	a	temperatura.	A	catalase	decompõe	o	peróxido', 'de hidrogênio (H2O2),	produzindo	água	e	oxigênio.	Os	resultados	dos	ensaios	estão	apresentados	no	quadro.
Ensaio Temperatura (°C)
Resultado
Decomposição de H2O2
10 12/g16/g167
/g169
/g168
/g183
/g185
/g184
mo l
min
1 10 8,0
2 15 10,5
3 20 9,5
4 25 5,0
5 30 3,6
6 35 3,1
Os	diferentes	resultados	dos	ensaios	justificam-se	pelo(a)', '[{"letra": "A", "texto": "variação\tdo\tpH\tdo\tmeio."}, {"letra": "B", "texto": "aumento\tda\tenergia\tde\tativação."}, {"letra": "C", "texto": "consumo da enzima durante o ensaio."}, {"letra": "D", "texto": "diminuição\tda\tconcentração\tdo\tsubstrato."}, {"letra": "E", "texto": "modificação\tda\testrutura\ttridimensional\tda\tenzima."}]', 'B', 'Uma carga elétrica em movimento dentro de um campo magnético uniforme sofre a ação de uma força magnética perpendicular ao seu vetor velocidade (Lorentz).', NULL, NULL, 'resumida', TRUE, FALSE, 'c3ba88dd48ad528f9a27a95bf856992626c0a8924305c130cffd3f111462fdf3', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Funções Inorgânicas / Caráter ácido-base de sais', 2022, '2º dia', 'INEP', 121, 'Questão 121', 'natureza', 'medio', 'Antimicrobianos	são	substâncias	naturais	ou	sintéticas	que	têm	capacidade	de	matar	ou	inibir	o	crescimento	de
microrganismos. A tabela apresenta uma lista de antimicrobianos hipotéticos, bem como suas ações e efeitos sobre', 'o metabolismo microbiano.
Antimicrobiano Ação Efeito
1 Une-se	aos	ribossomos Impede a síntese proteica
2 Une-se	aos	microtúbulos Impede	a	segregação	das	cromátides
3 Une-se	aos	fosfolipídeos	da	membrana	plasmáticaReduz a permeabilidade da membrana plasmática
4 Interfere na síntese de timina Inibe a síntese de DNA
5 Interfere na síntese de uracila Impede a síntese de RNA
Qual	dos	antimicrobianos	deve	ser	utilizado	para	curar	uma	infecção	causada	por	um	fungo	sem	afetar	as	bactérias
da	microbiota	normal	do	organismo?', '[{"letra": "A", "texto": "1"}, {"letra": "B", "texto": "2"}, {"letra": "C", "texto": "3"}, {"letra": "D", "texto": "4"}, {"letra": "E", "texto": "5 *020325AZ12* 13"}]', 'C', 'A hidrólise salina de sais derivados de ácido fraco e base forte produz soluções de caráter básico devido ao acúmulo de íons OH-.', NULL, NULL, 'resumida', TRUE, FALSE, '10cc9a8998c3b4c2b7a91eaad6c4491cf187f02a1a2eabe86929ff0a26513b3a', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Bioquímica / Enzimas e denaturação térmica', 2022, '2º dia', 'INEP', 122, 'Questão 122', 'natureza', 'facil', 'O veneno da cascavel pode causar hemorragia com
risco de morte a quem é picado pela serpente. No entanto,
pesquisadores do Brasil e da Bélgica desenvolveram uma
molécula	de	interesse	farmacêutico,	a	PEG-collineína-1,
a partir de uma proteína encontrada no veneno dessa
cobra, capaz de modular a coagulação sanguínea.
Embora	a	técnica	não	seja	nova,	foi	a	primeira	vez	que
o método foi usado a partir de uma toxina animal na sua
forma recombinante, ou seja, produzida em laboratório
por	um	fungo	geneticamente	modificado.
JULIÃO,	A.	Técnica modifica proteína do veneno de cascavel e permite
criar fármaco que modula a coagulação sanguínea. Disponível em:
https://agencia.fapesp.br. Acesso em: 22 nov. 2021 (adaptado).', 'Esse	novo	medicamento	apresenta	potencial	aplicação	para', '[{"letra": "A", "texto": "impedir\ta\tformação\tde\ttrombos,\ttípicos\tem\talguns casos de acidente vascular cerebral."}, {"letra": "B", "texto": "tratar\tconsequências\tda\tanemia\tprofunda,\tem\trazão\tda perda de grande volume de sangue."}, {"letra": "C", "texto": "evitar a manifestação de urticárias, comumente relacionadas a processos alérgicos."}, {"letra": "D", "texto": "reduzir o inchaço dos linfonodos, parte da resposta imunitária de diferentes infecções."}, {"letra": "E", "texto": "regular\ta\toscilação\tda\tpressão\tarterial,\tcaracterística dos\tquadros\tde\thipertensão."}]', 'A', 'O aumento excessivo da temperatura altera a estrutura tridimensional das proteínas enzimáticas (desnaturação), inativando seu sítio catalítico.', NULL, NULL, 'resumida', FALSE, FALSE, '4ad7b84c015fd90f8121750115347a929a46c87491af8e2bf8561b35d0f75617', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Mecânica / Trabalho e Potência mecânica', 2022, '2º dia', 'INEP', 123, 'Questão 123', 'natureza', 'facil', 'Um Buraco Negro é um corpo celeste que possui uma
grande quantidade de matéria concentrada em uma pequena
região	do	espaço,	de	modo	que	sua	força	gravitacional	é
tão	grande	que	qualquer	partícula	fica	aprisionada	em	sua
superfície,	inclusive	a	luz.	O	raio	dessa	região	caracteriza
uma	superfície-limite,	chamada	de	horizonte	de	eventos,
da qual nada consegue escapar. Considere que o Sol foi
instantaneamente substituído por um Buraco Negro com
a mesma massa solar, de modo que o seu horizonte de
eventos seja de aproximadamente 3,0 km.
SCHWARZSCHILD,	K.	On the Gravitational Field of a Mass Point According to
Einstein’s Theory. Disponível em: arxiv.org. Acesso em: 26 maio 2022 (adaptado).
Após a substituição descrita, o que aconteceria aos', 'planetas	do	Sistema	Solar?', '[{"letra": "A", "texto": "Eles\tse\tmoveriam\tem\tórbitas\tespirais,\taproximando-se sucessivamente do Buraco Negro."}, {"letra": "B", "texto": "Eles oscilariam aleatoriamente em torno de suas órbitas elípticas originais."}, {"letra": "C", "texto": "Eles\tse\tmoveriam\tem\tdireção\tao\tcentro\tdo\tBuraco Negro."}, {"letra": "D", "texto": "Eles passariam a precessionar mais rapidamente."}, {"letra": "E", "texto": "Eles manteriam suas órbitas inalteradas."}]', 'E', 'A potência útil desenvolvida por um motor é dada pela razão entre o trabalho mecânico realizado contra a força peso e o intervalo de tempo decorrido.', NULL, NULL, 'resumida', TRUE, FALSE, '0a5b807136ca7f3594d46eceaec695f48116fc4868776f68dc167e3a0c1578c0', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Gases Ideais / Equação de Clapeyron', 2022, '2º dia', 'INEP', 124, 'Questão 124', 'natureza', 'medio', 'Durante o ano de 2020, impulsionado pela necessidade
de	respostas	rápidas	e	eficientes	para	desinfectar	ambientes
de	possíveis	contaminações	com	o	SARS-CoV-2,	causador
da	covid-19,	diversas	alternativas	foram	buscadas	para
os procedimentos	de descontaminação	de materiais	e
ambientes.	Entre	elas,	o	uso	de	ozônio	em	meio	aquoso
como	agente	sanitizante	para	pulverização	em	humanos
e equipamentos	de proteção	em câmaras ou túneis,
higienização	de	automóveis	e	de	ambientes	fechados	e
descontaminação	de	trajes.	No	entanto,	pouca	atenção	foi
dada	à	toxicidade	do	ozônio,	à	formação	de	subprodutos,	ao
nível	de	concentração	segura	e	às	precauções	necessárias.
LIMA,	M.	J.	A.;	FELIX,	E.	P.;	CARDOSO,	A.	A.	Aplicações	e	implicações	do	ozônio	na
indústria, ambiente e saúde. Química Nova, n. 9, 2021 (adaptado).', 'O grande risco envolvido no emprego indiscriminado
dessa	substância	deve-se	à	sua	ação	química	como', '[{"letra": "A", "texto": "catalisador."}, {"letra": "B", "texto": "oxidante."}, {"letra": "C", "texto": "redutor."}, {"letra": "D", "texto": "ácido."}, {"letra": "E", "texto": "base."}]', 'B', 'Em transformações isochóricas (volume constante), a pressão exercida por um gás ideal é diretamente proporcional à sua temperatura absoluta em Kelvin.', NULL, NULL, 'resumida', TRUE, FALSE, 'ec3f5a40a97d5134ad1843223d5b476142170b84a1ddd61ae645c22af7871a89', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Ecologia / Ciclo do Nitrogênio', 2022, '2º dia', 'INEP', 125, 'Questão 125', 'natureza', 'facil', 'Na	figura	está	representado	o	mosaicismo	em	função
da	inativação	aleatória	de	um	dos	cromossomos	X,	que
ocorre em todas as mulheres sem alterações patológicas.
Gameta
masculino
(22+X)
Gameta
feminino
(22+X)
Zigoto (44+XX)
Blástula (44+XX)
Células com cromossomo X paterno inativado
Células com cromossomo X materno inativado
Amostras de células corporais
Entre mulheres heterozigotas para doenças determinadas
por	genes	recessivos	ligados	ao	sexo,	essa	inativação', 'tem como consequência a ocorrência de', '[{"letra": "A", "texto": "pleiotropia."}, {"letra": "B", "texto": "mutação\tgênica."}, {"letra": "C", "texto": "interação\tgênica."}, {"letra": "D", "texto": "penetrância incompleta."}, {"letra": "E", "texto": "expressividade variável. *020325AZ13* 14"}]', 'C', 'As bactérias nitrificantes dos gêneros Nitrosomonas e Nitrobacter convertem a amônia em nitrito e este em nitrato, forma assimilável pelas plantas.', NULL, NULL, 'resumida', FALSE, FALSE, 'a4edb1ec3244bf1c132839aeeb6d45a777e518f7fe8ad94264f709c79b1a53f0', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Eletrodinâmica / Segunda Lei de Ohm', 2022, '2º dia', 'INEP', 126, 'Questão 126', 'natureza', 'facil', 'A água bruta coletada de mananciais apresenta
alto índice de sólidos suspensos, o que a deixa com
um aspecto turvo. Para se obter uma água límpida e
potável,	ela	deve	passar	por	um	processo	de	purificação', 'numa	estação	de	tratamento	de	água.	Nesse	processo,
as principais etapas são, nesta ordem: coagulação,
decantação,	filtração,	desinfecção	e	fluoretação.
Qual é a etapa de retirada de grande parte desses
sólidos?', '[{"letra": "A", "texto": "Coagulação."}, {"letra": "B", "texto": "Decantação."}, {"letra": "C", "texto": "Filtração."}, {"letra": "D", "texto": "Desinfecção."}, {"letra": "E", "texto": "Fluoretação."}]', 'D', 'A resistência elétrica de um condutor homogêneo é diretamente proporcional ao seu comprimento e inversamente proporcional à sua área de secção transversal.', NULL, NULL, 'resumida', TRUE, FALSE, 'f6b6167ef0b6901d27adf99c393dd2386bbc42525b4c3792aee14b1f3d27393b', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Isomeria / Isomeria Plana e Espacial', 2022, '2º dia', 'INEP', 127, 'Questão 127', 'natureza', 'medio', 'Os	ursos,	por	não	apresentarem	uma	hibernação
verdadeira, acordam por causa da presença de
termogenina, uma proteína mitocondrial que impede a
chegada dos prótons até a ATP sintetase, gerando calor.
Esse calor é importante para aquecer o organismo,
permitindo seu despertar.
SADAVA, D. et al. Vida: a ciência da biologia. Porto Alegre: Artmed, 2009 (adaptado).', 'Em qual etapa do metabolismo energético celular a
termogenina	interfere?', '[{"letra": "A", "texto": "Glicólise."}, {"letra": "B", "texto": "Fermentação\tlática."}, {"letra": "C", "texto": "Ciclo do ácido cítrico."}, {"letra": "D", "texto": "Oxidação\tdo\tpiruvato."}, {"letra": "E", "texto": "Fosforilação\toxidativa."}]', 'A', 'Substâncias que apresentam a mesma fórmula molecular mas diferem na disposição espacial dos átomos ao redor de uma dupla ligação exibem isomeria geométrica cis-trans.', NULL, NULL, 'resumida', TRUE, FALSE, '311a9d80ee121eb81725cceb31c04829ac277f108d715351e82b43497c133728', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Fisiologia Humana / Sistema Digestório e pH', 2022, '2º dia', 'INEP', 128, 'Questão 128', 'natureza', 'facil', 'A	fim	de	classificar	as	melhores	rotas	em	um	aplicativo
de trânsito, um pesquisador propõe um modelo com
base em circuitos elétricos. Nesse modelo, a corrente
representa o número de carros que passam por um ponto
da pista no intervalo de 1 s. A diferença de potencial (d.d.p.)
corresponde à quantidade de energia por carro necessária
para o deslocamento de 1 m. De forma análoga à lei de
Ohm,	cada	via	é	classificada	pela	sua	resistência,	sendo
a de maior resistência a mais congestionada. O aplicativo
mostra as rotas em ordem crescente, ou seja, da rota de
menor para a de maior resistência.
Como teste para o sistema, são utilizadas três
possíveis vias para uma viagem de A até B, com os
valores de d.d.p. e corrente conforme a tabela.
Rota d.d.p. J
carrom/g152
/g167
/g169/g168
/g183
/g185/g184 Corrente carro
s
/g167
/g169/g168
/g183
/g185/g184
1 510 4
2 608 4
3 575 3
Nesse teste, a ordenação das rotas indicadas pelo', 'aplicativo será:', '[{"letra": "A", "texto": "1, 2, 3."}, {"letra": "B", "texto": "1, 3, 2."}, {"letra": "C", "texto": "2, 1, 3."}, {"letra": "D", "texto": "3, 1, 2."}, {"letra": "E", "texto": "3, 2, 1."}]', 'E', 'A pepsina atua em meio estomacal fortemente ácido (pH baixo), enquanto as enzimas pancreáticas exigem meio alcalino neutralizado pelo bicarbonato.', NULL, NULL, 'resumida', FALSE, FALSE, '0cdef1b652128e6744aa7576729f2ed57cf73c87bd24e823306f0cc1d828090e', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Gravitação Universal / Leis de Kepler', 2022, '2º dia', 'INEP', 129, 'Questão 129', 'natureza', 'medio', 'O esquema representa o ciclo do nitrogênio:
Plantas
Assimilação
Bactérias
nitrificantesNitrificaçãoAmonificação
Bactérias fixadoras
de N2 no solo Bactérias nitrificantes
Bactérias fixa-
doras de N2 nos
nódulos de raízes
de leguminosas
Bactérias
desnitri-
ficantes
(fungos e bactérias
aeróbicas e anaeróbicas)
Decompositores
Amônia e Amônio
(NH3) (NH4
+) Nitritos (NO2
−
)
Nitratos (NO3
−
)
A chuva ácida interfere no ciclo do nitrogênio,
principalmente,	por	proporcionar	uma	diminuição	do	pH
do	solo	e	da	atmosfera,	alterando	a	concentração	dos
compostos presentes nesse ciclo.
Disponível em: http://scienceprojectideasforkids.com. Acesso em: 6 ago. 2012 (adaptado).', 'Em	um	solo	de	menor	pH,	será	favorecida	a	formação	de:', '[{"letra": "A", "texto": "N2"}, {"letra": "B", "texto": "NH3"}, {"letra": "C", "texto": "NH4 +"}, {"letra": "D", "texto": "NO2 −"}, {"letra": "E", "texto": "NO3 −"}]', 'C', 'De acordo com a Terceira Lei de Kepler, o quadrado do período de revolução de um planeta é proporcional ao cubo do raio médio de sua órbita.', NULL, NULL, 'resumida', TRUE, FALSE, '46a8b9f0941b285d5544cd7b23c84dc98e797e70d650d5b02493f234a33da47c', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Soluções / Concentração molar e diluição', 2022, '2º dia', 'INEP', 130, 'Questão 130', 'natureza', 'facil', 'No	processo	de	captação	da	luz	pelo	olho	para	a
formação	de	imagens	estão	envolvidas	duas	estruturas
celulares:	os	cones	e	os	bastonetes.	Os	cones	são	sensíveis
à energia dos fótons, e os bastonetes, à quantidade de
fótons incidentes. A energia dos fótons que compõem
os raios luminosos está associada à sua frequência, e a
intensidade, ao número de fótons incidentes.', 'Um animal que tem bastonetes mais sensíveis irá', '[{"letra": "A", "texto": "apresentar daltonismo."}, {"letra": "B", "texto": "perceber cores fora do espectro do visível."}, {"letra": "C", "texto": "enxergar bem em ambientes mal iluminados."}, {"letra": "D", "texto": "necessitar de mais luminosidade para enxergar."}, {"letra": "E", "texto": "fazer\tuma\tpequena\tdistinção\tde\tcores\tem\tambientes iluminados. *020325AZ14* 15"}]', 'B', 'Na diluição de uma solução, a quantidade de matéria do soluto permanece constante enquanto o volume total aumenta, reduzindo a molaridade.', NULL, NULL, 'resumida', TRUE, FALSE, '99635b48db33974ac567f49130a222c8dd737f6504c077920e03762d55850a37', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Biologia', 'Genética / Leis de Mendel e Cruzamentos', 2022, '2º dia', 'INEP', 131, 'Questão 131', 'natureza', 'medio', 'De	modo	geral,	a	palavra	“aromático”	invoca	associações	agradáveis,	como	cheiro	de	café	fresco	ou	de	um	pão	doce	de
canela.	Associações	similares	ocorriam	no	passado	da	história	da	química	orgânica,	quando	os	compostos	ditos	“aromáticos”
apresentavam um odor agradável e foram isolados de óleos naturais. À medida que as estruturas desses compostos eram
elucidadas,	foi	se	descobrindo	que	vários	deles	continham	uma	unidade	estrutural	específica.	Os	compostos	aromáticos
que	continham	essa	unidade	estrutural	tornaram-se	parte	de	uma	grande	família,	muito	mais	com	base	em	suas	estruturas
eletrônicas	do	que	nos	seus	cheiros,	como	as	substâncias	a	seguir,	encontradas	em	óleos	vegetais.
HO
O
CH3
O
OH
CH3
O
CH3
HO
OH
O
CH3
CH2
OH
O
CH3
H
O
Benzaldeído
(no óleo de amêndoas)
Salicilato de metila
(no óleo de gaultéria)
Anetol
(no óleo de anis)
Vanilina
(no óleo de baunilha)
Eugenol
(no óleo de cravos)
Cinamaldeído
(no óleo de canela)
SOLOMONS, T. W. G.; FRYHLE, C. B. Química orgânica. Rio de Janeiro: LTC, 2009 (adaptado).', 'A característica estrutural dessa família de compostos é a presença de', '[{"letra": "A", "texto": "ramificações."}, {"letra": "B", "texto": "insaturações."}, {"letra": "C", "texto": "anel benzênico."}, {"letra": "D", "texto": "átomos de oxigênio."}, {"letra": "E", "texto": "carbonos assimétricos."}]', 'D', 'A proporção fenotípica esperada no cruzamento de dois indivíduos di-heterozigotos para genes autossômicos independentes é 9:3:3:1.', NULL, NULL, 'resumida', FALSE, FALSE, '08d697ae88abe9ad85c7cf233109dcee59cc46d4db1731aac42c708b820ef1f2', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Termodinâmica / Máquinas térmicas e Ciclo de Carnot', 2022, '2º dia', 'INEP', 132, 'Questão 132', 'natureza', 'medio', 'Os	resultados	de	um	ensaio	clínico	randomizado	na	Indonésia	apontaram	uma	redução	de	77%	dos	casos	de
dengue nas áreas que receberam o mosquito Aedes aegypti infectado com a bactéria Wolbachia.	Trata-se	da	mesma
técnica	utilizada	no	Brasil	pelo	Método	Wolbachia,	iniciativa	conduzida	pela	Fundação	Oswaldo	Cruz	—	Fiocruz.	Essa
bactéria	induz	a	redução	da	carga	viral	no	mosquito	e,	consequentemente,	o	número	de	casos	de	dengue	na	área,
sendo repassada por meio do cruzamento entre os insetos. Como essa bactéria é um organismo intracelular e o vírus
também	precisa	entrar	nas	células	para	se	reproduzir,	ambos	necessitarão	de	recursos	comuns.
COSTA, G. Agência Fiocruz de Notícias. Estudo confirma eficácia do Método Wolbachia para dengue.	Disponível	em:	https://portal.fiocruz.br.	Acesso	em:	3	jun.	2022	(adaptado).', 'Essa tecnologia utilizada no combate à dengue consiste na', '[{"letra": "A", "texto": "predação\tdo\tvírus\tpela\tbactéria."}, {"letra": "B", "texto": "esterilização\tde\tmosquitos\tinfectados."}, {"letra": "C", "texto": "alteração\tno\tgenótipo\tdo\tmosquito\tpela\tbactéria."}, {"letra": "D", "texto": "competição\tdo\tvírus\te\tda\tbactéria\tno\thospedeiro."}, {"letra": "E", "texto": "inserção\tde\tmaterial\tgenético\tdo\tvírus\tna\tbactéria. *020325AZ15* 16"}]', 'A', 'O rendimento máximo de uma máquina térmica operando entre duas fontes de calor depende exclusivamente das temperaturas absolutas da fonte quente e fria.', NULL, NULL, 'resumida', TRUE, FALSE, '108a3604ca922b7968e042aa37a5e9ad695a1b6aa356f05596379fd3c25dc567', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Química', 'Estequiometria / Reagente Limitante', 2022, '2º dia', 'INEP', 133, 'Questão 133', 'natureza', 'medio', 'O protozoário Trypanosoma cruzi, causador da
doença de Chagas, pode ser a nova arma da medicina
contra o câncer. Pesquisadores brasileiros conseguiram
criar	uma	vacina	contra	a	doença	usando	uma	variação
do	protozoário	incapaz	de	desencadear	a	patologia	(não
patogênico). Para isso, realizaram uma modificação
genética criando um T. cruzi capaz de produzir também
moléculas fabricadas pelas células tumorais. Quando
o organismo inicia o combate ao protozoário, entra em
contato também com a molécula tumoral, que passa a ser
vista também pelo sistema imune como um indicador de
células do protozoário. Depois de induzidas as defesas,
estas passam a destruir todas as células com a molécula
tumoral, como se lutassem apenas contra o protozoário.
Disponível em: www.estadao.com.br. Acesso em: 1 mar. 2012 (adaptado).
Qual o mecanismo utilizado no experimento para enganar', 'as	células	de	defesa,	fazendo	com	que	ataquem	o	tumor?', '[{"letra": "A", "texto": "Autoimunidade."}, {"letra": "B", "texto": "Hipersensibilidade."}, {"letra": "C", "texto": "Ativação\tda\tresposta\tinata."}, {"letra": "D", "texto": "Apresentação\tde\tantígeno\tespecífico."}, {"letra": "E", "texto": "Desencadeamento\tde\tprocesso\tanti-inflamatório."}]', 'C', 'O reagente limitante é aquele que é totalmente consumido primeiro na reação, determinando a quantidade máxima teórica de produtos formados.', NULL, NULL, 'resumida', TRUE, FALSE, '04607438b620253591c141939ec78b0a79c5d202f34493c8f92e45dc12115047', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Física', 'Ondulatória / Equação Fundamental da Onda', 2022, '2º dia', 'INEP', 135, 'Questão 135', 'natureza', 'facil', 'Em 2002, um mecânico da cidade mineira de
Uberaba (MG) teve uma ideia para economizar o
consumo de energia elétrica e iluminar a própria casa
num dia de sol. Para isso, ele utilizou garrafas plásticas
PET	com	água	e	cloro,	conforme ilustram as	figuras.
Cada	garrafa	foi	fixada	ao	telhado	de	sua	casa	em	um
buraco com diâmetro igual ao da garrafa, muito maior
que o comprimento de onda da luz. Nos últimos dois
anos, sua ideia já alcançou diversas partes do mundo
e	deve	atingir	a	marca	de	1	milhão	de	casas	utilizando
a	“luz	engarrafada”.
ZOBEL,	G.	Brasileiro inventor de “luz engarrafada” tem ideia espalhada pelo mundo.
Disponível em: www.bbc.com. Acesso em: 23 jun. 2022 (adaptado).', 'Que	fenômeno	óptico	explica	o	funcionamento	da	“luz
engarrafada”?', '[{"letra": "A", "texto": "Difração."}, {"letra": "B", "texto": "Absorção."}, {"letra": "C", "texto": "Polarização."}, {"letra": "D", "texto": "Reflexão."}, {"letra": "E", "texto": "Refração. *020325AZ16* 17"}]', 'B', 'A velocidade de propagação de uma onda eletromagnética ou mecânica é o produto de seu comprimento de onda pela sua frequência (v = λ · f).', NULL, NULL, 'resumida', TRUE, FALSE, '81771f31b93c181e25686a37442d0936ca136203f100e3037530e47ce5c220d8', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Porcentagem e Estatística / Análise de gráficos', 2022, '2º dia', 'INEP', 136, 'Questão 136', 'matematica', 'facil', 'Uma	máquina	em	operação	tem	sua	temperatura
T monitorada	por	meio	de	um	registro	gráfico,	ao	longo	do
tempo t.	Essa	máquina	possui	um	pistão	cuja	velocidade
V varia com a temperatura T da máquina, de acordo
com	a	expressão	V = T 2 - 4. Após a máquina funcionar
durante o intervalo de tempo de 10 horas, o seu operador
analisa	o	registro	gráfico,	apresentado	na	figura,	para
avaliar a necessidade de eventuais ajustes, sabendo que', 'a máquina apresenta falhas de funcionamento quando a
velocidade	do	pistão	se	anula.
4
T (ºC)
2
0
−2
10
t (h)
Quantas	vezes	a	velocidade	do	pistão	se	anulou	durante
as	10	horas	de	funcionamento?', '[{"letra": "A", "texto": "1"}, {"letra": "B", "texto": "2"}, {"letra": "C", "texto": "3"}, {"letra": "D", "texto": "4"}, {"letra": "E", "texto": "5"}]', 'C', 'A determinação do maior crescimento percentual requer o cálculo da variação relativa entre os valores numéricos apresentados no gráfico.', NULL, NULL, 'resumida', TRUE, FALSE, '7f386230a208142c02d1c8cdc67192b4ba4749d5b95c33f92a1dcadfbc824d08', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Volume de cilindro e prisma', 2022, '2º dia', 'INEP', 137, 'Questão 137', 'matematica', 'facil', 'A World Series é a decisão do campeonato
norte-americano	de	beisebol.	Os	dois	times	que	chegam
a essa fase jogam, entre si, até sete partidas. O primeiro
desses times que completar quatro vitórias é declarado
campeão.
Considere que, em todas as partidas, a probabilidade', 'de qualquer um dos dois times vencer é sempre 1
2.
Qual	é	a	probabilidade	de	o	time	campeão	ser	aquele	que
venceu a primeira partida da World Series?', '[{"letra": "A", "texto": "35 64"}, {"letra": "B", "texto": "40 64"}, {"letra": "C", "texto": "42 64"}, {"letra": "D", "texto": "44 64"}, {"letra": "E", "texto": "52 64"}]', 'B', 'O volume de um cilindro reto é obtido pelo produto da área de sua base circular pela sua altura (V = π · r² · h).', NULL, NULL, 'resumida', TRUE, FALSE, 'f7e62b6b04536e6b72835d8907a56845c7d35ce8200c7a89af0ccbd59f179efc', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Razão e Proporção / Escala e conversão de unidades', 2022, '2º dia', 'INEP', 138, 'Questão 138', 'matematica', 'facil', 'O	gráfico	apresenta	os	totais	de	receitas	e	despesas
de	uma	empresa,	expressos	em	milhão	de	reais,	no
decorrer dos meses de um determinado ano. A empresa
obtém lucro quando a diferença entre receita e despesa é
positiva e tem prejuízo quando essa diferença é negativa.
Jan. Fev. Mar. Abr. Maio Jun. Jul. Ago. Set. Out. Nov. Dez.
9
8
7
6
5
4
3
2
1
0
Receitas Despesas
Qual	é	a	mediana,	em	milhão	de	reais,	dos	valores	dos', 'lucros	apurados	pela	empresa	nesse	ano?', '[{"letra": "A", "texto": "1,5"}, {"letra": "B", "texto": "2,0"}, {"letra": "C", "texto": "2,9"}, {"letra": "D", "texto": "3,0"}, {"letra": "E", "texto": "5,5 *020325AZ17* 18"}]', 'D', 'A conversão de medidas lineares da maquete para dimensões reais é obtida multiplicando-se o valor na maquete pelo fator inverso da escala.', NULL, NULL, 'resumida', TRUE, FALSE, '8ee42f28b1e7c7c40b556fe25503a636cdbad1f72ee1ff212e1d5638ba7ceec5', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Função do 1º Grau / Interpretação de tarifas', 2022, '2º dia', 'INEP', 139, 'Questão 139', 'matematica', 'facil', 'Um casal está reformando a cozinha de casa e
decidiu comprar um refrigerador novo. Observando a
planta da nova cozinha, desenhada na escala de 1 : 50,
notaram que o espaço destinado ao refrigerador tinha
3,8 cm de altura e 1,6 cm de largura. Eles sabem que
os fabricantes de refrigeradores indicam que, para um
bom funcionamento e fácil manejo na limpeza, esses
eletrodomésticos devem ser colocados em espaços que
permitam uma distância de, pelo menos, 10 cm de outros
móveis ou paredes, tanto na parte superior quanto nas
laterais. O casal comprou um refrigerador que caberia
no local a ele destinado na nova cozinha, seguindo as
instruções do fabricante.
Esse refrigerador tem altura e largura máximas, em', 'metro, respectivamente, iguais a', '[{"letra": "A", "texto": "1,80 e 0,60."}, {"letra": "B", "texto": "1,80 e 0,70."}, {"letra": "C", "texto": "1,90 e 0,80."}, {"letra": "D", "texto": "2,00 e 0,90."}, {"letra": "E", "texto": "2,00 e 1,00."}]', 'A', 'A função afim modela o custo total como a soma de um valor fixo (bandeirada) com um valor variável proporcional à distância percorrida.', NULL, NULL, 'resumida', TRUE, FALSE, 'cfaad7667099e947998c9deb7e1ce19d3289addde5cd68a0d05662f49dc281d0', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Probabilidade / Probabilidade simples', 2022, '2º dia', 'INEP', 140, 'Questão 140', 'matematica', 'facil', 'Foram convidadas 32 equipes para um torneio de
futebol, que foram divididas em 8 grupos com 4 equipes,
sendo que, dentro de um grupo, cada equipe disputa uma
única partida contra cada uma das demais equipes de
seu grupo. A primeira e a segunda colocadas de cada
grupo seguem para realizar as 8 partidas da próxima
fase	do	torneio,	chamada	oitavas	de	final.	Os	vencedores
das partidas das oitavas de final seguem para jogar
as	4	partidas	das	quartas	de	final.	Os	vencedores	das
quartas	de	final	disputam	as	2	partidas	das	semifinais,	e
os	vencedores	avançam	para	a	grande	final,	que	define	a
campeã	do	torneio.
Pelas regras do torneio, cada equipe deve ter um
período de descanso de, no mínimo, 3 dias entre dois
jogos por ela disputados, ou seja, se um time disputar
uma partida, por exemplo, num domingo, só poderá', 'disputar	a	partida	seguinte	a	partir	da	quinta-feira	da
mesma semana.
O	número	mínimo	de	dias	necessários	para	a	realização
desse torneio é', '[{"letra": "A", "texto": "22."}, {"letra": "B", "texto": "25."}, {"letra": "C", "texto": "28."}, {"letra": "D", "texto": "48."}, {"letra": "E", "texto": "64."}]', 'E', 'A probabilidade de ocorrência de um evento é dada pela razão entre o número de casos favoráveis e o número total de casos possíveis no espaço amostral.', NULL, NULL, 'resumida', TRUE, FALSE, '4ffc8fbdfd3a417d42193aefbda4b07cd9d23e844e4c2f9e33e6f5c72cb2876b', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Área de figuras compostas', 2022, '2º dia', 'INEP', 141, 'Questão 141', 'matematica', 'medio', 'Em um jogo de bingo, as cartelas contêm
16 quadrículas dispostas em linhas e colunas. Cada
quadrícula tem impresso um número, dentre os inteiros
de	1	a	50,	sem	repetição	de	número.	Na	primeira	rodada,
um número é sorteado, aleatoriamente, dentre os 50
possíveis. Em todas as rodadas, o número sorteado
é	descartado	e	não	participa	dos	sorteios	das	rodadas
seguintes. Caso o jogador tenha em sua cartela o número
sorteado, ele o assinala na cartela. Ganha o jogador que
primeiro conseguir preencher quatro quadrículas
que formam uma linha, uma coluna ou uma diagonal,
conforme os tipos de situações ilustradas na Figura 1.
Preenchimento
em linha
Preenchimento
em coluna
Preenchimento
em diagonal
Figura 1
O jogo inicia e, nas quatro primeiras rodadas, foram
sorteados os seguintes números: 03, 27, 07 e 48. Ao
final da	quarta rodada, somente Pedro possuía uma
cartela que continha esses quatro números sorteados,
sendo que todos os demais jogadores conseguiram
assinalar, no máximo, um desses números em suas', 'cartelas.	Observe	na	Figura	2	o	cartão	de	Pedro	após	as
quatro primeiras rodadas.
Figura 2
03 48
27
49 11
12
22 05
29 50 19 45
33 23 38
A probabilidade de Pedro ganhar o jogo em uma das duas
próximas rodadas é', '[{"letra": "A", "texto": "1 46 1 45+"}, {"letra": "B", "texto": "1 46 2 46 45/g14/g117"}, {"letra": "C", "texto": "1 46 8 46 45/g14/g117"}, {"letra": "D", "texto": "1 46 43 46 45/g14/g117"}, {"letra": "E", "texto": "1 46 49 46 45/g14/g117 *020325AZ18* 19"}]', 'B', 'A área da região sombreada é calculada pela diferença entre a área do retângulo externo e a soma das áreas dos polígonos internos.', NULL, NULL, 'resumida', TRUE, FALSE, '6dc206e0c9f9eb5c5923d1e4e0b6baefea2aaf288cbd6e24f43cbdf78e3d6346', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Estatística / Média, Mediana e Moda', 2022, '2º dia', 'INEP', 142, 'Questão 142', 'matematica', 'facil', 'Uma montadora de automóveis divulgou que oferta a
seus	clientes	mais	de	1	000	configurações	diferentes	de
carro,	variando	o	modelo,	a	motorização,	os	opcionais	e
a cor do veículo. Atualmente, ela oferece 7 modelos de
carros	com	2	tipos	de	motores:	1.0	e	1.6.	Já	em	relação
aos opcionais, existem 3 escolhas possíveis: central
multimídia, rodas de liga leve e bancos de couro, podendo
o cliente optar por incluir um, dois, três ou nenhum dos
opcionais disponíveis.
Para	ser	fiel	à	divulgação	feita,	a	quantidade	mínima', 'de cores que a montadora deverá disponibilizar a seus
clientes é', '[{"letra": "A", "texto": "8."}, {"letra": "B", "texto": "9."}, {"letra": "C", "texto": "11."}, {"letra": "D", "texto": "18."}, {"letra": "E", "texto": "24."}]', 'C', 'A mediana corresponde ao valor central do conjunto de dados ordenados em rol; caso o número de elementos seja par, é a média dos dois centrais.', NULL, NULL, 'resumida', TRUE, FALSE, '455d5f07cd6dbd39032f0e26bb0354fce107505a391c4a421cd827dce12117b4', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Função Quadrática / Vértice da parábola e valor máximo', 2022, '2º dia', 'INEP', 144, 'Questão 144', 'matematica', 'medio', 'Cada	número	que	identifica	uma	agência	bancária	tem
quatro dígitos: N1, N2, N3, N4	mais	um	dígito	verificador	N5.
N1 N2 N3 N4 N5
Todos esses dígitos são números naturais
pertencentes ao conjunto {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}.
Para	a	determinação	de	N5,	primeiramente	multiplica-se
ordenadamente os quatro primeiros dígitos do número
da	agência	por	5,	4,	3	e	2,	respectivamente,	somam-se
os	resultados	e	obtém-se	S	= 5 N1 + 4 N2 + 3 N3 + 2 N4.
Posteriormente,	encontra-se	o	resto	da	divisão	de
S por 11, denotando por R esse resto. Dessa forma, N5 é', 'a diferença 11 - R.
Considere o número de uma agência bancária cujos
quatro	primeiros	dígitos	são	0100.
Qual	é	o	dígito	verificador	N5	dessa	agência	bancária?', '[{"letra": "A", "texto": "0"}, {"letra": "B", "texto": "6"}, {"letra": "C", "texto": "7"}, {"letra": "D", "texto": "8"}, {"letra": "E", "texto": "9 *020325AZ19* 20"}]', 'D', 'O ponto de máximo de uma função do 2º grau com concavidade voltada para baixo é determinado pelas coordenadas do vértice (Xv, Yv).', NULL, NULL, 'resumida', TRUE, FALSE, 'eabd03c995fe8fde63072d2f2f12b6e4d53256c6c1bf7ab63625b1eeeabdd6a6', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira / Juros simples e compostos', 2022, '2º dia', 'INEP', 145, 'Questão 145', 'matematica', 'facil', 'O pacote básico de um jogo para smartphone, que
é vendido a R$ 50,00, contém 2 000 gemas e 100 000
moedas	de	ouro,	que	são	itens	utilizáveis	nesse	jogo.
A empresa que comercializa esse jogo decidiu criar
um pacote especial que será vendido a R$ 100,00 e que
se diferenciará do pacote básico por apresentar maiores
quantidades de gemas e moedas de ouro. Para estimular
as vendas desse novo pacote, a empresa decidiu inserir
nele	6	000	gemas	a	mais,	em	relação	ao	que	o	cliente
teria caso optasse por comprar, com a mesma quantia,
dois pacotes básicos.
A quantidade de moedas de ouro que a empresa deverá
inserir ao pacote especial, para que seja mantida a mesma', 'proporção	existente	entre	as	quantidades	de	gemas	e	de
moedas de ouro contidas no pacote básico, é', '[{"letra": "A", "texto": "50 000."}, {"letra": "B", "texto": "100 000."}, {"letra": "C", "texto": "200 000."}, {"letra": "D", "texto": "300 000."}, {"letra": "E", "texto": "400 000."}]', 'C', 'O montante final acumulado sob regime de juros compostos é calculado pela fórmula M = C · (1 + i)^n.', NULL, NULL, 'resumida', TRUE, FALSE, 'cf4e3503d81a4148c71fdfeffec4b2174d238b82c9de467d199977af983ec9a1', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Projeção ortogonal', 2022, '2º dia', 'INEP', 146, 'Questão 146', 'matematica', 'facil', 'Um parque tem dois circuitos de tamanhos
diferentes para corridas. Um corredor treina nesse
parque e, no primeiro dia, inicia seu treino percorrendo
3 voltas em torno do circuito maior e 2 voltas em torno
do menor, perfazendo um total de 1 800 m. Em seguida,
dando continuidade a seu treino, corre mais 2 voltas
em torno do circuito maior e 1 volta em torno do menor,
percorrendo mais 1 100 m.
No segundo dia, ele pretende percorrer 5 000 m nos
circuitos do parque, fazendo um número inteiro de voltas
em torno deles e de modo que o número de voltas seja o
maior possível.
A soma do número de voltas em torno dos dois circuitos,', 'no segundo dia, será', '[{"letra": "A", "texto": "10."}, {"letra": "B", "texto": "13."}, {"letra": "C", "texto": "14."}, {"letra": "D", "texto": "15."}, {"letra": "E", "texto": "16."}]', 'B', 'A projeção ortogonal da trajetória sobre o plano horizontal corresponde ao desenho de sua sombra vista perpendicularmente de cima.', NULL, NULL, 'resumida', TRUE, FALSE, 'dd22e7b8f03316b3d74bce351bbca843c0c3446d3b6675542dfe0ce518d12bff', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Sistemas de Equações / Problemas do 1º grau', 2022, '2º dia', 'INEP', 147, 'Questão 147', 'matematica', 'facil', 'Uma equipe de marketing digital foi contratada para
aumentar as vendas de um produto ofertado em um site
de	comércio	eletrônico.	Para	isso,	elaborou	um	anúncio
que, quando o cliente clica sobre ele, é direcionado
para a página de vendas do produto. Esse anúncio foi
divulgado em duas redes sociais, A e B, e foram obtidos
os seguintes resultados:
• rede social A: o anúncio foi visualizado por
3 000 pessoas; 10% delas clicaram sobre o anúncio
e foram redirecionadas para o site; 3% das que
clicaram sobre o anúncio compraram o produto.
O	investimento	feito	para	a	publicação	do	anúncio
nessa rede foi de R$ 100,00;
• rede social B: o anúncio foi visualizado por
1 000 pessoas; 30% delas clicaram sobre o anúncio
e foram redirecionadas para o site; 2% das que
clicaram sobre o anúncio compraram o produto.
O	investimento	feito	para	a	publicação	do	anúncio
nessa rede foi de R$ 200,00.
Por experiência, o pessoal da equipe de marketing
considera	que	a	quantidade	de	novas	pessoas	que	verão
o anúncio é diretamente proporcional ao investimento
realizado,	e	que	a	quantidade	de	pessoas	que	comprarão
o produto também se manterá proporcional à quantidade
de	pessoas	que	clicarão	sobre	o	anúncio.
O	responsável	pelo	produto	decidiu,	então,	investir
mais R$ 300,00 em cada uma das duas redes sociais
para	a	divulgação	desse	anúncio	e	obteve,	de	fato,	o
aumento proporcional esperado na quantidade de clientes
que	compraram	esse	produto.	Para	classificar	o	aumento
obtido na quantidade (Q) de compradores desse produto,
em	consequência	dessa	segunda	divulgação,	em	relação
aos resultados observados na primeira divulgação, o
responsável pelo produto adotou o seguinte critério:
• Q ≤	60%:	não	satisfatório;
• 60% < Q ≤ 100%: regular;
• 100% < Q ≤ 150%: bom;
• 150% < Q ≤ 190%: muito bom;
• 190% < Q ≤ 200%: excelente.
O aumento na quantidade de compradores, em', 'consequência dessa segunda divulgação, em relação
ao que foi registrado com a primeira divulgação, foi
classificado	como', '[{"letra": "A", "texto": "não\tsatisfatório."}, {"letra": "B", "texto": "regular."}, {"letra": "C", "texto": "bom."}, {"letra": "D", "texto": "muito bom."}, {"letra": "E", "texto": "excelente. *020325AZ20* 21"}]', 'E', 'A resolução do sistema de duas equações lineares com duas incógnitas permite determinar a quantidade exata de cada item comprado.', NULL, NULL, 'resumida', TRUE, FALSE, 'af8ab339f23f021439aed9200dbd61471e75ff04b4e232660734b62a0e11ebb7', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Trigonometria / Triângulo retângulo e razões', 2022, '2º dia', 'INEP', 148, 'Questão 148', 'matematica', 'facil', 'A luminosidade L de uma estrela está relacionada com
o raio R e com a temperatura T dessa estrela segundo a
Lei	de	Stefan-Boltzmann:	L = c ⋅ R 2 ⋅ T 4, em que c é uma
constante igual para todas as estrelas.
Disponível em: http://ciencia.hsw.uol.com.br. Acesso em: 22 nov. 2013 (adaptado).', 'Considere duas estrelas E e F, sendo que a estrela E
tem metade do raio da estrela F e o dobro da temperatura
de F.
Indique por LE e LF suas respectivas luminosidades.
A	relação	entre	as	luminosidades	dessas	duas	estrelas	é
dada por', '[{"letra": "A", "texto": "L L E F= 2"}, {"letra": "B", "texto": "L L E F= 4"}, {"letra": "C", "texto": "LE = LF"}, {"letra": "D", "texto": "LE = 4LF"}, {"letra": "E", "texto": "LE = 8LF"}]', 'A', 'A altura inacessível de um prédio ou árvore é determinada utilizando a razão trigonométrica da tangente do ângulo de elevação visada.', NULL, NULL, 'resumida', TRUE, FALSE, 'a8af14b841d27d41a07046ecf6f2d84265c95517da6de3b0963554f170a4aa0c', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Estatística / Desvio padrão e variabilidade', 2022, '2º dia', 'INEP', 149, 'Questão 149', 'matematica', 'medio', 'Uma das informações que pode auxiliar no
dimensionamento do número de pediatras que devem
atender em uma Unidade Básica de Saúde (UBS) é
o número que representa a mediana da quantidade
de crianças por família existente na região sob sua
responsabilidade.	O	quadro	mostra	a	distribuição	das
frequências	do	número	de	crianças	por	família	na	região
de responsabilidade de uma UBS.
Número de crianças
por família Frequência
0 100
1 400
2 200
3 150
4 100
5 50
O número que representa a mediana da quantidade de', 'crianças	por	família	nessa	região	é', '[{"letra": "A", "texto": "1,0."}, {"letra": "B", "texto": "1,5."}, {"letra": "C", "texto": "1,9."}, {"letra": "D", "texto": "2,1."}, {"letra": "E", "texto": "2,5."}]', 'D', 'O desvio padrão mede a dispersão dos dados em relação à média; o candidato ou processo mais regular é aquele com menor desvio padrão.', NULL, NULL, 'resumida', TRUE, FALSE, '872f696e51daa97f49af4c9fe5cf40e309a32128b5e25657957e0473e1386836', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Teorema de Pitágoras', 2022, '2º dia', 'INEP', 150, 'Questão 150', 'matematica', 'facil', 'Em jogos de voleibol, um saque é invalidado se a bola
atingir o teto do ginásio onde ocorre o jogo. Um jogador de
uma equipe tem um saque que atinge uma grande altura.
Seu recorde foi quando a batida do saque se iniciou a
uma altura de 1,5 m do piso da quadra, e a trajetória da
bola foi descrita pela parábola y xx/g32/g16/g16/g14
2
6
7
3 12, em
que y	representa	a	altura	da	bola	em	relação	ao	eixo
x (das abscissas) que está localizado a 1,5 m do piso
da	quadra,	como	representado	na	figura.	Suponha	que
em todas as partidas algum saque desse jogador atinja a
mesma altura do seu recorde.
1,5 m 1,5 m1,5 m
y
x
A equipe desse jogador participou de um torneio de
voleibol no qual jogou cinco partidas, cada uma delas
em um ginásio diferente. As alturas dos tetos desses
ginásios,	em	relação	aos	pisos	das	quadras,	são:', '• ginásio I: 17 m;
• ginásio II: 18 m;
• ginásio III: 19 m;
• ginásio IV: 21 m;
• ginásio V: 40 m.
O saque desse atleta foi invalidado', '[{"letra": "A", "texto": "apenas no ginásio I."}, {"letra": "B", "texto": "apenas nos ginásios I e II."}, {"letra": "C", "texto": "apenas nos ginásios I, II e III."}, {"letra": "D", "texto": "apenas nos ginásios I, II, III e IV."}, {"letra": "E", "texto": "em todos os ginásios. *020325AZ21* 22"}]', 'C', 'A medida da diagonal de um terreno retangular é calculada aplicando o Teorema de Pitágoras ao triângulo retângulo formado por seus lados.', NULL, NULL, 'resumida', TRUE, FALSE, 'd90fe4e86f94fbafeb8209fa922a399e23d2e0fe92bca97cb926da3d99232caf', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Logaritmos / Escala Richter e decibéis', 2022, '2º dia', 'INEP', 151, 'Questão 151', 'matematica', 'medio', 'Um médico faz o acompanhamento clínico de um grupo de pessoas que realizam atividades físicas diariamente.
Ele observou que a perda média de massa dessas pessoas para cada hora de atividade física era de 1,5 kg. Sabendo
que	a	massa	de	1	L	de	água	é	de	1	kg,	ele	recomendou	que	ingerissem,	ao	longo	das	3	horas	seguintes	ao	final	da
atividade, uma quantidade total de água correspondente a 40% a mais do que a massa perdida na atividade física,
para	evitar	desidratação.
Seguindo	a	recomendação	médica,	uma	dessas	pessoas	ingeriu,	certo	dia,	um	total	de	1,7	L	de	água	após
terminar seus exercícios físicos.', 'Para	que	a	recomendação	médica	tenha	efetivamente	sido	respeitada,	a	atividade	física	dessa	pessoa,	nesse	dia,	durou', '[{"letra": "A", "texto": "30 minutos ou menos."}, {"letra": "B", "texto": "mais de 35 e menos de 45 minutos."}, {"letra": "C", "texto": "mais de 45 e menos de 55 minutos."}, {"letra": "D", "texto": "mais de 60 e menos de 70 minutos."}, {"letra": "E", "texto": "70 minutos ou mais."}]', 'B', 'A comparação de intensidades em escalas logarítmicas faz-se isolando a razão de grandezas através das propriedades operatórias dos logaritmos.', NULL, NULL, 'resumida', TRUE, FALSE, '9a047d1477acafafd62c9d056f48aa6218e16cabb0c5ddb3be046ef0ca07f669', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Razão e Proporção / Divisão proporcional', 2022, '2º dia', 'INEP', 152, 'Questão 152', 'matematica', 'facil', 'Em	uma	sala	de	cinema,	para	garantir	que	os	espectadores	vejam	toda	a	imagem	projetada	na	tela,	a	disposição
das	poltronas	deve	obedecer	à	norma	técnica	da	Associação	Brasileira	de	Normas	Técnicas	(ABNT),	que	faz	as
seguintes indicações:
• Distância mínima (D mín)	entre	a	tela	de	projeção	e	o	encosto	da	poltrona	da	primeira	fileira	deve	ser	de,	pelo
menos, 60% da largura (L) da tela.
• Distância máxima (Dmáx)	entre	a	tela	de	projeção	e	o	encosto	da	poltrona	da	última	fileira	deve	ser	o	dobro	da
largura (L) da tela, sendo aceitável uma distância de até 2,9 vezes a largura (L) da tela.
Para	o	espaçamento	entre	as	fileiras	de	poltronas,	é	considerada	a	distância	de	1	metro	entre	os	encostos	de
poltronas	em	duas	fileiras	consecutivas.
Disponível em: www.ctav.gov.br. Acesso em: 14 nov. 2013.
Uma sala de cinema, cuja largura da tela mede 12 m, está montada em conformidade com as normas da ABNT e
tem	suas	dimensões	especificadas	na	figura.
D 2L=máx
L
Tela
Área de instalação
de novas poltronas
D 0,6Lmín
=
D 2,9Laceitável =
1 m 1 m
Fileira
Fileira
Fileira
Pretende-se	ampliar	essa	sala,	mantendo-se	na	mesma	posição	a	tela	e	todas	as	poltronas	já	instaladas,
ampliando-se	ao	máximo	a	sala	para	os	fundos	(área	de	instalação	de	novas	poltronas),	respeitando-se	o	limite
aceitável	da	norma	da	ABNT.	A	intenção	é	aumentar,	ao	máximo,	a	quantidade	de	poltronas	da	sala,	instalando-se
novas unidades, iguais às já instaladas.', 'Quantas	fileiras	de	poltronas	a	sala	comportará	após	essa	ampliação?', '[{"letra": "A", "texto": "26"}, {"letra": "B", "texto": "27"}, {"letra": "C", "texto": "28"}, {"letra": "D", "texto": "29"}, {"letra": "E", "texto": "35 *020325AZ22* 23"}]', 'A', 'A partilha do prêmio ou lucro é realizada dividindo o valor total em partes diretamente proporcionais ao investimento de cada sócio.', NULL, NULL, 'resumida', TRUE, FALSE, 'eb12cfea5e6bf546a5186a5b30ebbe684d65c4e6b84f1af47123dbc7ae2c65d6', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Planificação de sólidos', 2022, '2º dia', 'INEP', 153, 'Questão 153', 'matematica', 'facil', 'Uma empresa produz e vende um tipo de chocolate,
maciço, em formato de cone circular reto com as medidas
do diâmetro da base e da altura iguais a 8 cm e 10 cm,
respectivamente,	como	apresenta	a	figura.
8 cm
10 cm
Devido a um aumento de preço dos ingredientes
utilizados na produção desse chocolate, a empresa
decide produzir esse mesmo tipo de chocolate com um
volume 19% menor, no mesmo formato de cone circular
reto com altura de 10 cm.
Para isso, a empresa produzirá esses novos chocolates', 'com medida do raio da base, em centímetro, igual a', '[{"letra": "A", "texto": "1,52."}, {"letra": "B", "texto": "3,24."}, {"letra": "C", "texto": "3,60."}, {"letra": "D", "texto": "6,48."}, {"letra": "E", "texto": "7,20."}]', 'E', 'A planificação de um tronco de pirâmide retangular é composta por duas bases retangulares de tamanhos distintos e quatro faces trapezoidais.', NULL, NULL, 'resumida', TRUE, FALSE, 'e1ed312ce7288b5ab5b547d9e808daba79859b65563a665a9cddffc45fd73977', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Função Exponencial / Crescimento populacional e meia-vida', 2022, '2º dia', 'INEP', 154, 'Questão 154', 'matematica', 'medio', 'Em janeiro de 2013, foram declaradas 1 794 272
admissões e 1 765 372 desligamentos no Brasil, ou seja,
foram criadas 28 900 vagas de emprego, segundo dados
do Cadastro Geral de Empregados e Desempregados
(Caged), divulgados pelo Ministério do Trabalho e
Emprego (MTE). Segundo o Caged, o número de vagas
criadas em janeiro de 2013 sofreu uma queda de 75%,
quando comparado com o mesmo período de 2012.
Disponível em: http://portal.mte.gov.br. Acesso em: 23 fev. 2013 (adaptado).
De acordo com as informações dadas, o número de', 'vagas criadas em janeiro de 2012 foi', '[{"letra": "A", "texto": "16 514."}, {"letra": "B", "texto": "86 700."}, {"letra": "C", "texto": "115 600."}, {"letra": "D", "texto": "441 343."}, {"letra": "E", "texto": "448 568."}]', 'D', 'O modelo exponencial descreve fenômenos em que a taxa de variação é proporcional à quantidade presente em determinado instante t.', NULL, NULL, 'resumida', TRUE, FALSE, 'c00b5b54289d6d43a9839105390924505e1c9572753d3fac75934f0cbbe87177', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Análise Combinatória / Combinação simples', 2022, '2º dia', 'INEP', 155, 'Questão 155', 'matematica', 'medio', 'Um prédio, com 9 andares e 8 apartamentos de
2 quartos por andar, está com todos os seus apartamentos
à	venda.	Os	apartamentos	são	identificados	por	números
formados por dois algarismos, sendo que a dezena indica
o andar onde se encontra o apartamento, e a unidade,
um algarismo de 1 a 8, que diferencia os apartamentos
de um mesmo andar. Quanto à incidência de sol
nos quartos desses apartamentos, constatam-se as
seguintes	características,	em	função	de	seus	números	de
identificação:
• naqueles	que	finalizam	em	1	ou	2,	ambos	os	quartos
recebem	sol	apenas	na	parte	da	manhã;
• naqueles	que	finalizam	em	3,	4,	5	ou	6,	apenas	um
dos	quartos	recebe	sol	na	parte	da	manhã;
• naqueles	que	finalizam	em	7	ou	8,	ambos	os	quartos
recebem sol apenas na parte da tarde.
Uma pessoa pretende comprar 2 desses
apartamentos em um mesmo andar, mas quer que, em
ambos, pelo menos um dos quartos receba sol na parte', 'da	manhã.
De quantas maneiras diferentes essa pessoa poderá
escolher 2 desses apartamentos para compra nas
condições	desejadas?', '[{"letra": "A", "texto": "9 6 62/g117/g16 ! !/g11/g12"}, {"letra": "B", "texto": "9 6 62 2/g117/g16/g117 ! !!/g11/g12"}, {"letra": "C", "texto": "9 4 42 2/g117/g16/g117 ! !!/g11/g12"}, {"letra": "D", "texto": "9 2 22 2/g117/g16/g117 ! !!/g11/g12"}, {"letra": "E", "texto": "9 8 82 2 1/g117 /g16/g117/g16! !!/g11/g12 /g167 /g169 /g168/g168 /g183 /g185 /g184/g184 *020325AZ23* 24"}]', 'B', 'A escolha de uma comissão de k pessoas a partir de um grupo de n indivíduos sem ordem de preferência é calculada por C(n, k).', NULL, NULL, 'resumida', TRUE, FALSE, '8132806ca5c51563288526ed6b81849e0e6e0ab1f8c021b245112b9b0812e315', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Semelhança de triângulos', 2022, '2º dia', 'INEP', 157, 'Questão 157', 'matematica', 'facil', 'O	funcionário	de	uma	loja	tem	seu	salário	mensal	formado	por	uma	parcela	fixa	de	675	reais	mais	uma	comissão
que	depende	da	quantidade	de	peças	vendidas	por	ele	no	mês.	O	cálculo	do	valor	dessa	comissão	é	feito	de	acordo
com estes critérios:
• até	a	quinquagésima	peça	vendida,	paga-se	5	reais	por	peça;
• a partir da quinquagésima primeira peça vendida, o valor pago é de 7 reais por peça.
Represente por q a quantidade de peças vendidas no mês por esse funcionário, e por S(q) o seu salário mensal,
em real, nesse mês.', 'A	expressão	algébrica	que	descreve	S(q)	em	função	de	q é', '[{"letra": "A", "texto": "S(q) = 675 + 12q"}, {"letra": "B", "texto": "S(q) = 325 + 12q"}, {"letra": "C", "texto": "S(q) = 675 + 7q"}, {"letra": "D", "texto": "Sq qq qq(),,/g32 /g14 /g14/g33 625 55 0 925 75 0 se se /g100/g173 /g174 /g175"}, {"letra": "E", "texto": "Sq qq qq(),,/g32 /g14 /g14/g33 625 55 0 575 75 0 se se /g100/g173 /g174 /g175"}]', 'A', 'A razão entre os lados correspondentes de triângulos semelhantes estabelece uma proporção direta para o cálculo do comprimento desconhecido.', NULL, NULL, 'resumida', TRUE, FALSE, 'fd5ef33909ccdb4be511947075f5c7be2ea5772b70528f65bf6430c57db36aa4', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira / Descontos e equivalência', 2022, '2º dia', 'INEP', 158, 'Questão 158', 'matematica', 'facil', 'Ao analisar os dados de uma epidemia em uma cidade, peritos obtiveram um modelo que avalia a quantidade de
pessoas infectadas a cada mês, ao longo de um ano. O modelo é dado por p(t) = -t 2 + 10t + 24, sendo t um número
natural, variando de 1 a 12, que representa os meses do ano, e p(t) a quantidade de pessoas infectadas no mês t do
ano.	Para	tentar	diminuir	o	número	de	infectados	no	próximo	ano,	a	Secretaria	Municipal	de	Saúde	decidiu	intensificar
a	propaganda	oficial	sobre	os	cuidados	com	a	epidemia.	Foram	apresentadas	cinco	propostas	(I,	II,	III,	IV	e	V),
com	diferentes	períodos	de	intensificação	das	propagandas:
• I: 1 ≤ t ≤ 2;
• II: 3 ≤ t ≤ 4;
• III: 5 ≤ t ≤ 6;
• IV: 7 ≤ t ≤ 9;
• V: 10 ≤ t ≤ 12.
A	sugestão	dos	peritos	é	que	seja	escolhida	a	proposta	cujo	período	de	intensificação	da	propaganda	englobe	o
mês	em	que,	segundo	o	modelo,	há	a	maior	quantidade	de	infectados.	A	sugestão	foi	aceita.', 'A proposta escolhida foi a', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'D', 'O valor atual de um boleto pago antecipadamente é obtido subtraindo do valor nominal o desconto racional ou comercial acordado.', NULL, NULL, 'resumida', TRUE, FALSE, '662a9ab91ebaee5c9ca4191f5df3e391bbba6ab2641bcd808a69c35f143ccebf', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Esferas e captação de água', 2022, '2º dia', 'INEP', 159, 'Questão 159', 'matematica', 'medio', 'Um	atleta	iniciou	seu	treinamento	visando	as	competições	de	fim	de	ano.	Seu	treinamento	consiste	em	cinco	tipos
diferentes de treinos: treino T1, treino T2, treino T3, treino T4 e treino T5. A sequência dos treinamentos deve seguir esta ordem:
A	letra	R	significa	repouso.	Após	completar	a	sequência	de	treinamentos,	o	atleta	começa	novamente	a	sequência	a
partir do treino T1 e segue a ordem descrita. Após 24 semanas completas de treinamento, se dará o início das competições.', 'A sequência de treinamentos que o atleta realizará na 24ª semana de treinos é', '[{"letra": "A", "texto": "T3 R T4 R R T5 R."}, {"letra": "B", "texto": "R T3 R T4 R R T5."}, {"letra": "C", "texto": "R T4 R R T5 R T1."}, {"letra": "D", "texto": "R R T5 R T1 R R."}, {"letra": "E", "texto": "R T5 R T1 R R T2. *020325AZ25* 26"}]', 'C', 'O volume de um reservatório esférico é dado por V = (4/3) · π · r³, utilizado para mensurar a capacidade de armazenamento em litros.', NULL, NULL, 'resumida', TRUE, FALSE, '244f4c184d2381de9ff2e32c1abdc3af2ce3818f0412dc4131d001886948fe5f', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Estatística / Média ponderada', 2022, '2º dia', 'INEP', 161, 'Questão 161', 'matematica', 'facil', 'Uma empresa de engenharia projetou uma casa com
a forma de um retângulo para um de seus clientes. Esse
cliente	solicitou	a	inclusão	de	uma	varanda	em	forma
de	L.	A	figura	apresenta	a	planta	baixa	desenhada	pela
empresa, já com a varanda incluída, cujas medidas,
indicadas em centímetro, representam os valores das
dimensões da varanda na escala de 1 : 50.
16 cm
ESCALA 1 : 50
SALA
QUARTO
SUÍTE
BANHO
SOCIAL
BANHO
SUÍTECOZINHA
VARANDA
QUARTO
4 cm
18,4 cm
5 cm', 'A medida real da área da varanda, em metro quadrado, é', '[{"letra": "A", "texto": "33,40."}, {"letra": "B", "texto": "66,80."}, {"letra": "C", "texto": "89,24."}, {"letra": "D", "texto": "133,60."}, {"letra": "E", "texto": "534,40."}]', 'B', 'A nota final do processo seletivo é calculada pela média ponderada das notas obtidas nas provas multiplicadas por seus respectivos pesos.', NULL, NULL, 'resumida', TRUE, FALSE, '3e0b6ecca4b9e3783838714e2b65136676901bf5c25a49246183a5f76e03252d', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Função do 1º Grau / Gráficos e interseção', 2022, '2º dia', 'INEP', 162, 'Questão 162', 'matematica', 'facil', 'Uma	loja	de	roupas	fixou	uma	meta	de	vendas	de
77 000 reais para um determinado mês de 30 dias.
O	gráfico	mostra	o	volume	de	vendas	dessa	loja,	em	real,
nos dez primeiros dias do mês e entre o dia dez e o dia
vinte desse mês, nos seus dois únicos setores (infantil e
adulto).	Suponha	que	a	variação	no	volume	de	vendas,
para o período registrado, tenha se dado de forma linear,
como mostrado	no	gráfico, e	que	essa	tendência se
mantenha a mesma para os próximos dez dias.
18 000
8 000
10 30
7 000
15 000
Adulto
Dias
Infantil
20
Ao	final	do	trigésimo	dia,	quanto	faltará	no	volume	de	vendas,', 'em	real,	para	que	a	meta	fixada	para	o	mês	seja	alcançada?', '[{"letra": "A", "texto": "5 000"}, {"letra": "B", "texto": "7 000"}, {"letra": "C", "texto": "11 000"}, {"letra": "D", "texto": "18 000"}, {"letra": "E", "texto": "29 000 *020325AZ26* 27"}]', 'A', 'O ponto de interseção das duas retas no gráfico representa a quantidade produzida na qual o custo total iguala a receita total (break-even).', NULL, NULL, 'resumida', TRUE, FALSE, 'cd0d5dc1d93925981775bccb0855956d298fb92df1864e219c1c3671db215ca7', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Círculo e perímetro de roda', 2022, '2º dia', 'INEP', 163, 'Questão 163', 'matematica', 'facil', 'Em	uma	universidade,	atuam	professores	que	estão
enquadrados	funcionalmente	pela sua maior titulação:
mestre ou doutor. Nela há, atualmente, 60 mestres e
40 doutores. Os salários mensais dos professores mestres
e dos doutores são, respectivamente, R$ 8	000,00 e
R$ 12 000,00.
A	diretoria	da	instituição	pretende	proporcionar	um
aumento salarial diferenciado para o ano seguinte, de tal
forma que o salário médio mensal dos professores dessa
instituição	não	ultrapasse	R$	12	240,00.	A	universidade	já
estabeleceu que o aumento salarial será de 25% para os
mestres	e	precisa	ainda	definir	o	percentual	de	reajuste
para os doutores.
Mantido o número atual de professores com suas atuais
titulações, o aumento salarial, em porcentagem, a ser', 'concedido aos doutores deverá ser de, no máximo,', '[{"letra": "A", "texto": "14,4."}, {"letra": "B", "texto": "20,7."}, {"letra": "C", "texto": "22,0."}, {"letra": "D", "texto": "30,0."}, {"letra": "E", "texto": "37,5."}]', 'D', 'A distância percorrida por uma roda circular ao dar N voltas completas é dada por C = N · (2 · π · r).', NULL, NULL, 'resumida', TRUE, FALSE, '29fff7f2b54a8b0538c4c62ada3d60bf259fe0b95545ddf78623227f6fbc840d', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Probabilidade / Eventos independentes', 2022, '2º dia', 'INEP', 164, 'Questão 164', 'matematica', 'medio', 'Um	borrifador	de	atuação	automática	libera,	a	cada
acionamento, uma mesma quantidade de inseticida.
O recipiente desse produto, quando cheio, contém 360 mL
de inseticida, que duram 60 dias se o borrifador permanecer
ligado ininterruptamente e for acionado a cada 48 minutos.
A quantidade de inseticida que é liberada a cada', 'acionamento do borrifador, em mililitro, é', '[{"letra": "A", "texto": "0,125."}, {"letra": "B", "texto": "0,200."}, {"letra": "C", "texto": "4,800."}, {"letra": "D", "texto": "6,000."}, {"letra": "E", "texto": "12,000."}]', 'B', 'A probabilidade da ocorrência simultânea de dois eventos independentes A e B é dada pelo produto de suas probabilidades individuais P(A) · P(B).', NULL, NULL, 'resumida', TRUE, FALSE, '4b4faa04b20e1c8d0cc6e495ac8bff853f90bb7929d87add42568d0cff41ec63', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Paralelepípedo e caixas', 2022, '2º dia', 'INEP', 165, 'Questão 165', 'matematica', 'facil', 'Definem-se	o	dia	e	o	ano	de	um	planeta	de	um	sistema	solar
como sendo, respectivamente, o tempo que o planeta leva para
dar	1	volta	completa	em	torno	de	seu	próprio	eixo	de	rotação	e	o
tempo para dar 1 volta completa em torno de seu Sol.
Suponha	que	exista	um	planeta	Z,	em	algum	sistema
solar, onde um dia corresponda a 73 dias terrestres e', 'que 2 de seus anos correspondam a 1 ano terrestre.
Considere que 1 ano terrestre tem 365 de seus dias.
No	planeta	Z,	seu	ano	corresponderia	a	quantos	de	seus
dias?', '[{"letra": "A", "texto": "2,5"}, {"letra": "B", "texto": "10,0"}, {"letra": "C", "texto": "730,0"}, {"letra": "D", "texto": "13 322,5"}, {"letra": "E", "texto": "53 290,0"}]', 'C', 'O número máximo de caixas menores que cabem dentro do contêiner é obtido pela divisão inteira das dimensões correspondentes.', NULL, NULL, 'resumida', TRUE, FALSE, 'f0d065ea86b00d4bd1e69cefd7bbf8d90fe69c9cdbb38b9b438637ada5b287f8', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Razão e Proporção / Regra de três composta', 2022, '2º dia', 'INEP', 166, 'Questão 166', 'matematica', 'facil', 'Em	uma	competição	de	velocidade,	diz-se	que	há	uma
ultrapassagem quando um veículo que está atrás de outro
passa à sua frente, com ambos se deslocando no mesmo
sentido.	Considere	uma	competição	automobilística	entre
cinco carros em uma pista com 100 m de comprimento,
onde todos largam no mesmo instante e da mesma linha.
O	gráfico	mostra	a	variação	da	distância	percorrida	por	cada
veículo,	em	função	do	tempo,	durante	toda	a	competição.
100
0 Distância (m)
0 Tempo (s) 15
Qual o número de ultrapassagens, após o início da', 'competição, efetuadas pelo veículo que chegou em
último	lugar?', '[{"letra": "A", "texto": "0"}, {"letra": "B", "texto": "1"}, {"letra": "C", "texto": "2"}, {"letra": "D", "texto": "3"}, {"letra": "E", "texto": "4"}]', 'E', 'A resolução de problemas envolvendo operadores, horas trabalhadas e produção faz uso da proporcionalidade direta e inversa entre as grandezas.', NULL, NULL, 'resumida', TRUE, FALSE, '25969a018240bd8dc096db332c8db010bd2d6aaf4888e053eacf7aa9e6fa19da', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Função Trigonômétrica / Seno e Cosseno em fenômenos periódicos', 2022, '2º dia', 'INEP', 167, 'Questão 167', 'matematica', 'medio', 'Em uma loja, o preço promocional de uma geladeira
é de R$ 1 000,00 para pagamento somente em dinheiro.
Seu	preço	normal,	fora	da	promoção,	é	10%	maior.	Para
pagamento	feito	com	o	cartão	de	crédito	da	loja,	é	dado
um desconto de 2% sobre o preço normal.
Uma cliente decidiu comprar essa geladeira, optando
pelo	pagamento	com	o	cartão	de	crédito	da	loja.	Ela
calculou que o valor a ser pago seria o preço promocional
acrescido de 8%. Ao ser informada pela loja do valor a
pagar,	segundo	sua	opção,	percebeu	uma	diferença	entre
seu cálculo e o valor que lhe foi apresentado.
O valor apresentado pela loja, comparado ao valor', 'calculado pela cliente, foi', '[{"letra": "A", "texto": "R$ 2,00 menor."}, {"letra": "B", "texto": "R$ 100,00 menor."}, {"letra": "C", "texto": "R$ 200,00 menor."}, {"letra": "D", "texto": "R$ 42,00 maior."}, {"letra": "E", "texto": "R$ 80,00 maior. *020325AZ27* 28"}]', 'A', 'A variação periódica da maré ao longo do dia é modelada por uma função senoidal do tipo f(t) = A + B · cos(C · t + D).', NULL, NULL, 'resumida', TRUE, FALSE, '2a34ecce183e5cd9875e7f96ab90e675ff015f2db8e472e3a63d96fd8499db51', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Análise Combinatória / Permutação com repetição', 2022, '2º dia', 'INEP', 168, 'Questão 168', 'matematica', 'medio', 'Uma pessoa precisa se deslocar de automóvel do
ponto P para o ponto Q, indicados	na	figura,	na	qual	as
linhas verticais e horizontais simbolizam ruas.
P
Q
Por causa do sentido de tráfego nessas ruas, o
caminho poligonal destacado é a possibilidade mais
curta	de	efetuar	esse	deslocamento.	Para	descrevê-lo,
deve-se	especificar	qual	o	sentido	a	ser	tomado	em	cada
cruzamento	de	ruas,	em	relação	à	direção	de	deslocamento
do automóvel, que se movimentará continuamente.
Para	isso,	empregam-se	as	letras	E,	F	e	D	para	indicar', '“vire à esquerda”, “siga em frente” e “vire à direita”,
respectivamente.
A sequência de letras que descreve o caminho poligonal
destacado é', '[{"letra": "A", "texto": "DDEFDDEEFFD."}, {"letra": "B", "texto": "DFEFDDDEFFD."}, {"letra": "C", "texto": "DFEFDDEEFFD."}, {"letra": "D", "texto": "EFDFEEDDFFE."}, {"letra": "E", "texto": "EFDFEEEDFFE."}]', 'D', 'O número de anagramas ou arranjos de elementos em que há repetições é dado dividindo o fatorial total pelos fatoriais das repetições.', NULL, NULL, 'resumida', TRUE, FALSE, '5fc96e8e8e4634d91e1356c6005c0522854ab0314cd2480e1828a26f81215895', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Áreas de setores circulares', 2022, '2º dia', 'INEP', 169, 'Questão 169', 'matematica', 'facil', 'Uma loja comercializa cinco modelos de
caixas-d’água (I, II, III, IV e V), todos em formato
de cilindro reto de base circular. Os modelos II, III, IV e V
têm	as	especificações	de	suas	dimensões	dadas	em
relação	às	dimensões	do	modelo	I,	cuja	profundidade	é	P
e área da base é Ab, como segue:', '• modelo II: o dobro da profundidade e a metade da
área da base do modelo I;
• modelo III: o dobro da profundidade e a metade do
raio da base do modelo I;
• modelo IV: a metade da profundidade e o dobro da
área da base do modelo I;
• modelo V: a metade da profundidade e o dobro do
raio da base do modelo I.
Uma pessoa pretende comprar nessa loja o modelo
de caixa-d’água que ofereça a maior capacidade
volumétrica.
O modelo escolhido deve ser o', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'B', 'A área de um setor circular é diretamente proporcional à medida de seu ângulo central em graus em relação a 360°.', NULL, NULL, 'resumida', TRUE, FALSE, 'e122bd812626809ec34d54906f355fc386f86bed3f3ad3a03e7539f0bde696df', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Estatística / Análise de variância e amplitude', 2022, '2º dia', 'INEP', 170, 'Questão 170', 'matematica', 'facil', 'No período de 2005 a 2013, o valor de venda dos
imóveis em uma cidade apresentou alta, o que resultou
no aumento dos aluguéis. Os gráficos apresentam a
evolução	desses	valores,	para	um	mesmo	imóvel,	no
mercado imobiliário dessa cidade.
630
960
1 350
1 800
3 240
Valor mensal do aluguel (R$)
2005 2007 2009 2011 2013
Ano
90
120
270
450
540
Valor de mercado do imóvel
(milhar de R$)
2005 2007 2009 2011 2013
Ano
A rentabilidade do aluguel de um imóvel é calculada
pela	razão	entre	o	valor	mensal	de	aluguel	e	o	valor	de
mercado desse imóvel.
Com base nos dados fornecidos, em que ano a', 'rentabilidade	do	aluguel	foi	maior?', '[{"letra": "A", "texto": "2005"}, {"letra": "B", "texto": "2007"}, {"letra": "C", "texto": "2009"}, {"letra": "D", "texto": "2011"}, {"letra": "E", "texto": "2013 *020325AZ28* 29"}]', 'C', 'A amplitude de um conjunto de dados é calculada pela diferença simples entre o maior e o menor valor observado na amostra.', NULL, NULL, 'resumida', TRUE, FALSE, '27a769fa8f80a0aabb24f5490c0adf62097c7b23fbb45682869fc7b92a7ff5dc', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira / Inflação e poder de compra', 2022, '2º dia', 'INEP', 171, 'Questão 171', 'matematica', 'medio', 'Nos	cinco	jogos	finais	da	última temporada,	com
uma média de 18 pontos por jogo, um jogador foi eleito o
melhor do campeonato de basquete. Na atual temporada,
cinco jogadores têm a chance de igualar ou melhorar
essa	média.	No	quadro	estão	registradas	as	pontuações
desses cinco jogadores nos quatro primeiros jogos das
finais	deste	ano.
Jogadores Jogo 1 Jogo 2 Jogo 3 Jogo 4
I 12 25 20 20
II 12 12 27 20
III 14 14 17 26
IV 15 18 21 21
V 22 15 23 15
O quinto e último jogo será realizado para decidir a
equipe	campeã	e	qual	o	melhor	jogador	da	temporada.
O jogador que precisa fazer a menor quantidade de
pontos no quinto jogo, para igualar a média de pontos do', 'melhor jogador da temporada passada, é o', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'A', 'A variação real do poder de compra é calculada descalculando-se a taxa de inflação acumulada do reajuste nominal concedido.', NULL, NULL, 'resumida', TRUE, FALSE, '7d541b6e819e890a7b28c78be186d85a854b119aab26b03d32358912c0d29b97', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Tronco de cone', 2022, '2º dia', 'INEP', 172, 'Questão 172', 'matematica', 'medio', 'Um casal planeja construir em sua chácara uma
piscina com o formato de um paralelepípedo reto
retângulo com capacidade para 90 000 L de água.
O casal contratou uma empresa de construções que
apresentou cinco projetos com diferentes combinações
nas dimensões internas de profundidade, largura
e comprimento. A piscina a ser construída terá
revestimento interno em suas paredes e fundo com uma
mesma cerâmica, e o casal irá escolher o projeto que
exija a menor área de revestimento.
As dimensões internas de profundidade, largura
e comprimento, respectivamente, para cada um dos
projetos,	são:', '• projeto I: 1,8 m, 2,0 m e 25,0 m;
• projeto II: 2,0 m, 5,0 m e 9,0 m;
• projeto III: 1,0 m, 6,0 m e 15,0 m;
• projeto IV: 1,5 m, 15,0 m e 4,0 m;
• projeto V: 2,5 m, 3,0 m e 12,0 m.
O projeto que o casal deverá escolher será o', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'E', 'O cálculo da quantidade de tinta para pintar a superfície lateral de um copo ou vaso em formato de tronco de cone utiliza a área lateral Al = π · (R + r) · g.', NULL, NULL, 'resumida', TRUE, FALSE, '7cbe767ad5db71e129d57285c69f90c923ac3ca5f6a678897de0301b19333ad1', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Razão e Proporção / Consumo médio de combustível', 2022, '2º dia', 'INEP', 173, 'Questão 173', 'matematica', 'facil', 'Uma	instituição	de	ensino	superior	ofereceu	vagas
em um processo seletivo de acesso a seus cursos.
Finalizadas as inscrições, foi divulgada a relação do', 'número de candidatos por vaga em cada um dos cursos
oferecidos.	Esses	dados	são	apresentados	no	quadro.
Curso
Número
de vagas
oferecidas
Número
de candidatos
por vaga
Administração 30 6
Ciências Contábeis 40 6
Engenharia Elétrica 50 7
História 30 8
Letras 25 4
Pedagogia 25 5
Qual foi o número total de candidatos inscritos nesse
processo	seletivo?', '[{"letra": "A", "texto": "200"}, {"letra": "B", "texto": "400"}, {"letra": "C", "texto": "1 200"}, {"letra": "D", "texto": "1 235"}, {"letra": "E", "texto": "7 200"}]', 'D', 'O consumo médio do veículo em km/L é a razão entre a distância total percorrida e o volume de combustível consumido.', NULL, NULL, 'resumida', TRUE, FALSE, '7d127af088c00f6abaeb41fe6d0c2d618971d704ce4f29dc0883e857838962c0', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Probabilidade / Complementar', 2022, '2º dia', 'INEP', 174, 'Questão 174', 'matematica', 'facil', 'Peças metálicas de aeronaves abandonadas em
aeroportos serão recicladas. Uma dessas peças é
maciça e tem o formato cilíndrico, com a medida do raio
da base igual a 4 cm e a da altura igual a 50 cm. Ela será
derretida, e o volume de metal resultante será utilizado
para	a	fabricação	de	esferas	maciças	com	diâmetro	de
1 cm, a serem usadas para confeccionar rolamentos.', 'Para	estimar	a	quantidade	de	esferas	que	poderão	ser
produzidas a partir de cada uma das peças cilíndricas,
admite-se	que	não	ocorre	perda	de	material	durante	o
processo de derretimento.
Quantas	dessas	esferas	poderão	ser	obtidas	a	partir	de
cada	peça	cilíndrica?', '[{"letra": "A", "texto": "800"}, {"letra": "B", "texto": "1 200"}, {"letra": "C", "texto": "2 400"}, {"letra": "D", "texto": "4 800"}, {"letra": "E", "texto": "6 400 *020325AZ29* 30"}]', 'B', 'A probabilidade de ocorrer ao menos um evento favorável é calculada subtraindo da unidade a probabilidade de não ocorrer nenhum evento favorável.', NULL, NULL, 'resumida', TRUE, FALSE, '3e81dcbfedd975fb387203942d9d5a3a5f33e9ada4acce82470b1aa49d67c57b', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Sistemas de Numeração / Base binária e decimal', 2022, '2º dia', 'INEP', 175, 'Questão 175', 'matematica', 'facil', 'Ao	escutar	a	notícia	de	que	um	filme	recém-lançado
arrecadou,	no	primeiro	mês	de	lançamento,	R$	1,35	bilhão
em bilheteria, um estudante escreveu corretamente o
número que representa essa quantia, com todos os seus', 'algarismos.
O número escrito pelo estudante foi', '[{"letra": "A", "texto": "135 000,00."}, {"letra": "B", "texto": "1 350 000,00."}, {"letra": "C", "texto": "13 500 000,00."}, {"letra": "D", "texto": "135 000 000,00."}, {"letra": "E", "texto": "1 350 000 000,00."}]', 'C', 'A conversão de um número expresso em base binária para o sistema decimal realiza-se pela soma das potências de base 2 associadas aos dígitos 1.', NULL, NULL, 'resumida', TRUE, FALSE, '1e6d5f0e66dca2e8e467a406f5b918ab41661942891148152ecca7d2f6ae76e6', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Polígonos regulares e ângulos', 2022, '2º dia', 'INEP', 176, 'Questão 176', 'matematica', 'facil', 'O governo de um estado pretende realizar uma
obra de	infraestrutura para auxiliar na	integração e
no processo de escoamento da produção agrícola
de	duas cidades. O	projeto consiste na	interligação
direta das cidades A e B com a Rodovia 003, pela
construção	das	Rodovias	001	e	002.	As	duas	rodovias
serão	construídas em	linha	reta	e	deverão	se	conectar
à Rodovia 003 em um mesmo ponto, conforme
esboço	apresentado na	figura,	na	qual	estão	também
indicadas as posições das cidades A e B, considerando
o eixo x posicionado sobre a Rodovia 003, e cinco
localizações sugeridas	para	o	ponto	de	conexão	entre
as três rodovias.
0 5 10 15 20 25 30 35 40 45 50 55 x (km)
10
20
30
40
y (km) Cidade A
Cidade B
Rodovia 003
Rodovia 001
Rodovia 002
I II III IV V
Pretende-se	que	a	distância	percorrida	entre	as	duas
cidades, pelas Rodovias 001 e 002, passando pelo ponto
de	conexão,	seja	a	menor	possível.
Dadas as exigências do projeto, qual das localizações', 'sugeridas	deve	ser	a	escolhida	para	o	ponto	de	conexão?', '[{"letra": "A", "texto": "I"}, {"letra": "B", "texto": "II"}, {"letra": "C", "texto": "III"}, {"letra": "D", "texto": "IV"}, {"letra": "E", "texto": "V"}]', 'A', 'A soma dos ângulos internos de um polígono regular de n lados é dada por S = (n - 2) · 180°, sendo cada ângulo interno Si / n.', NULL, NULL, 'resumida', TRUE, FALSE, 'd6c0dd6aa376bfb6c9dce4fead84ccf2c552e4ce3534734b98a63ce606488b21', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Função Quadrática / Modelagem de lucro', 2022, '2º dia', 'INEP', 177, 'Questão 177', 'matematica', 'medio', 'Uma pessoa precisa contratar um operário para
fazer um serviço em sua casa. Para isso, ela postou um
anúncio em uma rede social.
Cinco pessoas responderam informando preços por
hora trabalhada, gasto diário com transporte e tempo', 'necessário	para	conclusão	do	serviço,	conforme	valores
apresentados no quadro.
Operário
Preço por
hora
(real)
Preço do
transporte
(real)
Tempo até
conclusão
(hora)
I 120 0,00 8
II 180 0,00 6
III 170 20,00 6
IV 110 10,00 9
V 110 0,00 10
Se a pessoa pretende gastar o mínimo possível com essa
contratação,	irá	contratar	o	operário', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'D', 'O preço de venda que maximiza o lucro da empresa corresponde à coordenada Xv do vértice da função quadrática que representa o lucro.', NULL, NULL, 'resumida', TRUE, FALSE, '222e28e3d6cd30ee1df272ee4ace5bb2f85f47fb1db2bea56aee74d529ed3db8', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Princípio de Cavalieri', 2022, '2º dia', 'INEP', 178, 'Questão 178', 'matematica', 'medio', 'Uma cozinheira produz docinhos especiais por
encomenda.	Usando	uma	receita-base	de	massa,	ela
prepara	uma	porção,	com	a	qual	produz	50	docinhos
maciços de formato esférico, com 2 cm de diâmetro.
Um cliente encomenda 150 desses docinhos, mas pede', 'que cada um tenha formato esférico com 4 cm de diâmetro.
A cozinheira pretende preparar o número exato de
porções da receita-base de massa necessário para
produzir os docinhos dessa encomenda.
Quantas	porções	da	receita-base	de	massa	ela	deve
preparar	para	atender	esse	cliente?', '[{"letra": "A", "texto": "2"}, {"letra": "B", "texto": "3"}, {"letra": "C", "texto": "6"}, {"letra": "D", "texto": "12"}, {"letra": "E", "texto": "24 *020325AZ30* 31"}]', 'B', 'Dois sólidos de mesma altura têm volumes iguais se as seções planas produzidas por planos paralelos à base tiverem áreas iguais.', NULL, NULL, 'resumida', TRUE, FALSE, '9de8e31c3694cf9f55c9145e4d0dde55eba05cdfbfa33b4cd7d79692af0ccf26', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Matemática', 'Sequências e Progressões / Progressão Aritmética (PA)', 2022, '2º dia', 'INEP', 179, 'Questão 179', 'matematica', 'facil', 'A esperança de vida ao nascer é o número médio
de anos que um indivíduo tende a viver a partir de seu
nascimento,	considerando	dados	da	população.	No	Brasil,
esse número vem aumentando consideravelmente, como
mostra	o	gráfico.
Esperança de vida ao nascer
75
74
73
72
2008
72,78
73,09
73,4
73,67
73,95
74,23
2009 2010 2011 2012 2013
Disponível em: http://cod.ibge.gov.br. Acesso em: 6 mar. 2014 (adaptado).
Pode-se	observar	que	a	esperança	de	vida	ao	nascer
em 2012 foi exatamente a média das registradas nos
anos de 2011 e 2013. Suponha que esse fato também
ocorreu com a esperança de vida ao nascer em 2013, em
relação	às	esperanças	de	vida	de	2012	e	de	2014.
Caso a suposição feita tenha sido confirmada, a
esperança de vida ao nascer no Brasil no ano de 2014', 'terá sido, em ano, igual a', '[{"letra": "A", "texto": "74,23."}, {"letra": "B", "texto": "74,51."}, {"letra": "C", "texto": "75,07."}, {"letra": "D", "texto": "75,23."}, {"letra": "E", "texto": "78,49."}]', 'E', 'O n-ésimo termo de uma PA é dado por an = a1 + (n - 1) · r, utilizado para calcular o valor de parcelas com acréscimo constante.', NULL, NULL, 'resumida', TRUE, FALSE, '4d0e0768ce1b06298ca4316f96d488fa9ee6310e2df90fc439e24d4fb7090dea', 'ENEM-2022_DIA2.txt'),
('ENEM', 'Inglês', 'Leitura e Interpretação de Texto (Campanha Publicitária / Meio Ambiente)', 2023, '1º dia', 'INEP', 1, '01', 'linguagens', 'facil', 'FOOD FOR THOUGHT
The average american tosses 300 pounds of food each year, making food the number one contributor to America''s landfills. Eat your leftovers and keep your perishables in the fridge - the Earth is counting on it.', 'Esse cartaz de campanha sugere que', '[{"letra": "A", "texto": "os lixões precisam de ampliação."}, {"letra": "B", "texto": "o desperdício degrada o ambiente."}, {"letra": "C", "texto": "os mercados doam alimentos perecíveis."}, {"letra": "D", "texto": "a desnutrição compromete o raciocínio."}, {"letra": "E", "texto": "as residências carecem de refrigeradores."}]', 'B', 'O cartaz explicita que o desperdício anual de 300 libras de comida por pessoa torna os alimentos os maiores vilões dos aterros sanitários americanos. A mensagem "the Earth is counting on it" deixa claro que combater o desperdício evita a degradação do meio ambiente.', NULL, NULL, 'resumida', FALSE, FALSE, '34635fb4809367ffe279525e35548b9e354c168ad7c8cf4608fa65a7d4f7d058', 'enem-2023-dia1.txt'),
('ENEM', 'Inglês', 'Análise Poética e Conectividade Humana', 2023, '1º dia', 'INEP', 2, '02', 'linguagens', 'facil', 'No man is an island,
Entire of itself;
Every man is a piece of the continent,
A part of the main.
[...]
Any man''s death diminishes me,
Because I am involved in mankind.
(DONNE, J. The Works of John Donne. Londres: John W. Parker, 1839)', 'Nesse poema, a expressão "No man is an island" ressalta o(a)', '[{"letra": "A", "texto": "medo da morte."}, {"letra": "B", "texto": "ideia de conexão."}, {"letra": "C", "texto": "conceito de solidão."}, {"letra": "D", "texto": "risco de devastação."}, {"letra": "E", "texto": "necessidade de empatia."}]', 'B', 'A célebre metáfora de John Donne ("Nenhum homem é uma ilha") afirma que todo ser humano faz parte de um continente e de um todo maior. O poema defende a interconexão fundamental entre os indivíduos da humanidade.', NULL, NULL, 'resumida', FALSE, FALSE, 'f90a334bfa67727543815c0312a8829cd5cee2baa5e4b93df055b5b7ad00f3eb', 'enem-2023-dia1.txt'),
('ENEM', 'Inglês', 'Poesia Contemporânea e Relações Sociais (Refugiados)', 2023, '1º dia', 'INEP', 3, '03', 'linguagens', 'medio', 'Things We Carry on the Sea
We carry tears in our eyes: good-bye father, good-bye mother
We carry soil in small bags: may home never fade in our hearts
We carry carnage of mining, droughts, floods, genocides
We carry dust of our families and neighbors incinerated in mushroom clouds
We carry our islands sinking under the sea
We carry our hands, feet, bones, hearts and best minds for a new life
We carry diplomas: medicine, engineer, nurse, education, math, poetry, even if they mean nothing to the other shore
We carry railroads, plantations, laundromats, bodegas, taco trucks, farms, factories, nursing homes, hospitals, schools, temples... built on our ancestors'' backs
We carry old homes along the spine, new dreams in our chests
We carry yesterday, today and tomorrow
We''re orphans of the wars forced upon us
We''re refugees of the sea rising from industrial wastes
And we carry our mother tongues
[...]
As we drift... in our rubber boats... from shore... to shore... to shore...
(PING, W.)', 'Ao retratar a trajetória de refugiados, o poema recorre à imagem de viagem marítima para destacar o(a)', '[{"letra": "A", "texto": "risco de choques culturais."}, {"letra": "B", "texto": "impacto do ensino de história."}, {"letra": "C", "texto": "importância da luta ambiental."}, {"letra": "D", "texto": "existência de experiências plurais."}, {"letra": "E", "texto": "necessidade de capacitação profissional."}]', 'D', 'O poema lista uma enorme variedade de objetos, sentimentos, memórias e profissões que os refugiados levam consigo. A travessia marítima atua como metáfora para carregar histórias e bagagens culturais extremamente plurais.', NULL, NULL, 'resumida', FALSE, FALSE, '2fac25f2c02507e3ab2ac3ab8eed8798e8f6916d7e3d55b4b30c570f69f033a2', 'enem-2023-dia1.txt'),
('ENEM', 'Inglês', 'Variação Linguística e Hibridismo Cultural (Spanglish)', 2023, '1º dia', 'INEP', 4, '04', 'linguagens', 'medio', 'Spanglish
pues estoy creando Spanglish
bi-cultural systems
scientific lexicographical
inter-textual integrations
two expressions
existentially wired
two dominant languages
continentally abrazándose
in colloquial combate
imperio spanglish emerges
sobre territorio bi-lingual
las novelas mexicanas
mixing with radiorocknroll
immigrant/migrant
nasal mispronouncements
hip-hop, street salsa, spanish pop
standard english classroom
with computer technicalities
spanglish is literally perfect
(LAVIERA, T.)', 'Nesse poema de Tato Laviera, o eu lírico destaca uma', '[{"letra": "A", "texto": "convergência linguístico-cultural."}, {"letra": "B", "texto": "característica histórico-cultural."}, {"letra": "C", "texto": "tendência estilístico-literária."}, {"letra": "D", "texto": "discriminação cultural."}, {"letra": "E", "texto": "censura musical."}]', 'A', 'O poema celebra a junção entre o espanhol e o inglês ("two dominant languages continentally abrazándose"), mostrando como o fenômeno do Spanglish promove uma integração e convergência linguística e cultural rica.', NULL, NULL, 'resumida', FALSE, FALSE, '0a5be76bd12839b0008025711f9c424bf0f15044f559d9419830fb606a1afd93', 'enem-2023-dia1.txt'),
('ENEM', 'Inglês', 'Análise de Cartum e Crítica Social no Trabalho', 2023, '1º dia', 'INEP', 5, '05', 'linguagens', 'facil', '[DESCRIÇÃO DA IMAGEM: Cartum mostrando uma sala de escritório com vários trabalhadores idênticos em vestimenta e aparência. Um executivo diz a uma nova funcionária: "Oh, you''ll love working here. Nobody treats you any differently just because of your age, race, or gender."]', 'Ao retratar o ambiente de trabalho em um escritório, esse cartum tem por objetivo', '[{"letra": "A", "texto": "criticar um padrão de vestimenta."}, {"letra": "B", "texto": "destacar a falta de diversidade."}, {"letra": "C", "texto": "indicar um modo de interação."}, {"letra": "D", "texto": "elogiar um modelo de organização."}, {"letra": "E", "texto": "salientar o espírito de cooperação."}]', 'C', 'O cartum ironiza a fala do chefe ao mostrar um escritório repleto de trabalhadores fisicamente idênticos. O objetivo do recurso visual e textual é evidenciar a flagrante falta de diversidade no ambiente profissional.', 'Cartum mostrando uma sala de escritório com vários trabalhadores idênticos em vestimenta e aparência. Um executivo diz a uma nova funcionária: "Oh, you''ll love working here. Nobody treats you any differently just because of your age, race, or gender."', NULL, 'resumida', FALSE, FALSE, '866cdc47141ee4e7614f8fcc976e21eaaf3b6cee3fb4dfbde2e8874d887726f8', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Interpretação de Texto e Esporte', 2023, '1º dia', 'INEP', 6, '06', 'linguagens', 'facil', 'A sessão do Comitê Olímpico Internacional (COI) aprovou uma mudança histórica e inédita no lema olímpico, criado em 1894 pelo Barão Pierre de Coubertin para expressar os valores e a excelência do esporte. Mais de 120 anos depois, o lema tem sua primeira alteração para ressaltar a solidariedade e incluir a palavra "juntos": mais rápido, mais alto, mais forte - juntos. A mudança foi aprovada por unanimidade pelos membros do COI e celebrada pelo presidente da entidade.', 'De acordo com o texto, a alteração do lema olímpico teve como objetivo a', '[{"letra": "A", "texto": "unificação do lema anterior ao atual."}, {"letra": "B", "texto": "aproximação entre o lema olímpico e o COI."}, {"letra": "C", "texto": "junção do lema olímpico com os princípios esportivos."}, {"letra": "D", "texto": "associação entre o lema olímpico e a cooperatividade."}, {"letra": "E", "texto": "vinculação entre o lema olímpico e os eventos atléticos."}]', 'D', 'A inserção da palavra "juntos" ao lema secular busca associar o ideal olímpico aos valores de cooperação, solidariedade e união coletiva entre os povos e atletas.', NULL, NULL, 'resumida', FALSE, FALSE, '37f592a90175508a4a4ec3fe8437e0c10f788221c6ac7df8865806424829b38b', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Literatura Contemporânea Feminina (Identidade e Etnia)', 2023, '1º dia', 'INEP', 7, '07', 'linguagens', 'medio', 'Mais iluminada que outras
Tenho dois seios, estas duas coxas, duas mãos que me são muito úteis, olhos escuros, estas duas sobrancelhas que preencho com maquiagem comprada por dezenove e noventa e orelhas que não aceitam bijuterias. Este corpo é um corpo faminto, dentado, cruel, capaz e violento. Movo os braços e multidões correm desesperadas. Caminho no escuro com o rosto para baixo, pois cada parte isolada de mim tem sua própria vida e não quero domá-las. Animal da caatinga. Forte demais. Engolidora de espadas e espinhos.
Dizem e eu ouvi, mas depois também li, que o estado do Ceará aboliu a escravidão quatro anos antes do restante do país. Todos aqueles corpos que eram trazidos com seus dedos contados, seus calcanhares prontos e seus umbigos em fogo, todos eles foram interrompidos no porto. Um homem - dizem e eu ouvi e depois também li - liderou o levante. E todos esses corpos foram buscar outros incômodos. Foram ser incomodados.
(ARRAES, J. Redemoinho em dia quente. São Paulo: Alfaguara, 2019.)', 'Nesse texto, os recursos expressivos usados pela narradora', '[{"letra": "A", "texto": "revelam as marcas da violência de raça e de gênero na construção da identidade."}, {"letra": "B", "texto": "questionam o pioneirismo do estado do Ceará no enfrentamento à escravidão."}, {"letra": "C", "texto": "reproduzem padrões estéticos em busca da valorização da autoestima feminina."}, {"letra": "D", "texto": "sugerem uma atmosfera onírica alinhada ao desejo de resgate da espiritualidade."}, {"letra": "E", "texto": "mimetizam, na paisagem, os corpos transformados pela violência da escravidão."}]', 'A', 'O texto contrapõe a corporeidade e a maquiagem cotidiana com a memória histórica dos corpos negros escravizados no Ceará, articulando raça e gênero na construção da identidade narrada.', NULL, NULL, 'resumida', FALSE, FALSE, 'a6f7a112412be4dbadef26cddf1ec8ce8c7895d4a9dba33f4004acd119e055a0', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Preconceito Linguístico e Variedade Lusitana', 2023, '1º dia', 'INEP', 8, '08', 'linguagens', 'medio', 'De quem é esta língua?
Uma pequena editora brasileira, a Urutau, acaba de lançar em Lisboa uma "antologia antirracista de poetas estrangeiros em Portugal", com o título Volta para a tua terra. O livro denuncia as diversas formas de racismo a que os imigrantes estão sujeitos. Alguns dos poetas brasileiros antologiados queixam-se do desdém com que um grande número de portugueses acolhe o português brasileiro. É uma queixa frequente.
"Aqui em Portugal eles dizem / - eles dizem - / que nosso português é errado, que nós não falamos português", escreve a poetisa paulista Maria Giulia Pinheiro, para concluir: "Se a sua linguagem, a lusitana, / ainda conserva a palavra da opressão / ela não é a mais bonita do mundo. / Ela é uma das mais violentas".
(AGUALUSA, J. E.)', 'O texto de Agualusa tematiza o preconceito em relação ao português brasileiro. Com base no trecho citado pelo autor, infere-se que esse preconceito se deve', '[{"letra": "A", "texto": "à dificuldade de consolidação da literatura brasileira em outros países."}, {"letra": "B", "texto": "aos diferentes graus de instrução formal entre os falantes de língua portuguesa."}, {"letra": "C", "texto": "à existência de uma língua ideal que alguns falantes lusitanos creem ser a falada em Portugal."}, {"letra": "D", "texto": "ao intercâmbio cultural que ocorre entre os povos dos diferentes países de língua portuguesa."}, {"letra": "E", "texto": "à distância territorial entre os falantes do português que vivem em Portugal e no Brasil."}]', 'C', 'O preconceito demonstrado por falantes portugueses fundamenta-se no mito do "português correto", segundo o qual a variedade lusitana seria a única norma culta ou ideal legítima da língua.', NULL, NULL, 'resumida', FALSE, FALSE, '58900ef900b830e9abacc61b1523fe9f767b472d18e93e3f25c2859e4055733f', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Circulação de Informações e História das Mídias', 2023, '1º dia', 'INEP', 9, '09', 'linguagens', 'facil', 'Na Idade Média, as notícias se propagavam com surpreendente eficácia. Segundo uma emérita professora de Sorbonne, um cavalo era capaz de percorrer 30 quilômetros por dia, mas o tempo podia se acelerar dependendo do interesse da notícia. As ordens mendicantes tinham um papel importante na disseminação de informações, assim como os jograis, os peregrinos e os vagabundos, porque todos eles percorriam grandes distâncias. As cidades também tinham correios organizados e selos para lacrar mensagens e tentar certificar a veracidade das correspondências.
Graças a tudo isso, a circulação de boatos era intensa e politicamente relevante. Um exemplo clássico de fake news da era medieval é a história do rei que desaparece na batalha e reaparece muito depois, idoso e transformado.', 'A propagação sistemática de informações é um fenômeno recorrente na história e no desenvolvimento das sociedades. No texto, a eficácia dessa propagação está diretamente relacionada ao(à)', '[{"letra": "A", "texto": "velocidade de circulação das notícias."}, {"letra": "B", "texto": "nível de letramento da população marginalizada."}, {"letra": "C", "texto": "poder de censura por parte dos serviços públicos."}, {"letra": "D", "texto": "legitimidade da voz dos representantes da nobreza."}, {"letra": "E", "texto": "diversidade dos meios disponíveis em uma época histórica."}]', 'E', 'O texto ressalta que a eficácia da circulação de notícias na Idade Média decorria da diversidade de meios e agentes (mensageiros, ordens mendicantes, jograis, peregrinos e selos postais).', NULL, NULL, 'resumida', FALSE, FALSE, 'f8b12ab2876369374dadf20165eabc67dc435e1d233d5591df726e50d35c326a', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Análise de Discurso Digital e Perfis Automatizados', 2023, '1º dia', 'INEP', 10, '10', 'linguagens', 'medio', 'Se a interferência de contas falsas em discussões políticas nas redes sociais já representava um perigo para os sistemas democráticos, sua sofisticação e maior semelhança com pessoas reais têm agravado o problema pelo mundo.
O perigo cresceu porque a tecnologia e os métodos evoluíram dos robôs, os "bots" - softwares com tarefas on-line automatizadas, para os "ciborgues" ou "trolls", contas controladas diretamente por humanos com ajuda de um pouco de automação.
Mas pesquisadores começam agora a observar outros padrões de comportamento: quando mensagens não são programadas, sua publicação se concentra só em horários de trabalho, já que é controlada por pessoas cuja profissão é exatamente essa, administrar um perfil falso durante o dia.
Outra pista: a pobreza vocabular das mensagens publicadas por esses perfis. Um funcionário de uma empresa que supostamente produzia e vendia perfis falsos explica que às vezes "faltava criatividade" para criar mensagens distintas controlando tantos perfis falsos ao mesmo tempo.
(GRAGNANI, J.)', 'De acordo com o texto, a análise de características da linguagem empregada por perfis automatizados contribui para o(a)', '[{"letra": "A", "texto": "controle da atuação dos profissionais de TI."}, {"letra": "B", "texto": "desenvolvimento de tecnologias como os \"trolls\"."}, {"letra": "C", "texto": "flexibilização dos turnos de trabalho dos controladores."}, {"letra": "D", "texto": "necessidade de regulamentação do funcionamento dos \"bots\"."}, {"letra": "E", "texto": "identificação de padrões de disseminação de informações inverídicas."}]', 'E', 'Elementos como padrões de horários de postagem (turnos comerciais) e a pobreza vocabular servem como indicadores para identificar contas administradas para a propagação de desinformação.', NULL, NULL, 'resumida', FALSE, FALSE, 'acddf31e918da7ac504d8c3b815390fade8e4b19dd653127974ce7cc999efa51', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Argumentação e Campanhas de Conscientização no Trânsito', 2023, '1º dia', 'INEP', 11, '11', 'linguagens', 'facil', 'Maio foi colorido de amarelo, e o foi porque mundialmente amarelo é a cor convencionada para as advertências. No trânsito, essas advertências têm sido fatais. A estimativa, caso nada seja feito, é a de que se atinjam assustadoras 2,4 milhões de mortes no trânsito em 2030 em todo o mundo.
A pressa constante, o sentimento de invencibilidade, a certeza de invulnerabilidade, a necessidade de poder, a falta de civilidade, a certeza de impunidade, a ausência de solidariedade, a inexistência de compaixão e o desrespeito por si próprio são circunstâncias reais que, não raro, concorrem para o comportamento violento no trânsito.
O Maio Amarelo, que preconiza a atenção pela vida, é uma das iniciativas nesse sentido. E é precisamente a atenção pela vida que está esquecida. Essa atenção, por certo, requer menos pressa, mais civilidade, limites assegurados, consciência de vulnerabilidade, solidariedade, compaixão e respeito por si e pelo outro. Reafirmar e praticar esses princípios e valores talvez seja um caminho mais seguro e menos violento, que garanta a vida e não celebre a morte.', 'Considerando os procedimentos argumentativos utilizados, infere-se que o objetivo desse texto é', '[{"letra": "A", "texto": "enumerar as causas determinantes da violência no trânsito."}, {"letra": "B", "texto": "contextualizar a campanha de advertência no cenário mundial."}, {"letra": "C", "texto": "divulgar dados numéricos alarmantes sobre acidentes de trânsito."}, {"letra": "D", "texto": "sensibilizar o público para a importância de uma direção responsável."}, {"letra": "E", "texto": "restringir os problemas da violência no trânsito a aspectos emocionais."}]', 'D', 'O texto utiliza dados e argumentos morais/comportamentais sobre a imprudência no trânsito para conscientizar e sensibilizar o leitor sobre a necessidade de adotar uma conduta segura e responsável ao dirigir.', NULL, NULL, 'resumida', FALSE, FALSE, '13417ae3b498c745f7c0739f867d52c25e6f01b08bae5077c9495974811847f8', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Ficção Urbana dos Anos 1950 (Lúcio Cardoso)', 2023, '1º dia', 'INEP', 12, '12', 'linguagens', 'dificil', 'Ainda daquela vez pude constatar a bizarrice dos costumes que constituíam as leis mais ou menos constantes do seu mundo: ao me aproximar, verifiquei que o Sr. Timóteo, gordo e suado, trajava um vestido de franjas e lantejoulas que pertencera a sua mãe. O corpete descia-lhe excessivamente justo na cintura, e aqui e ali rebentava através da costura um pouco da carne aprisionada, esgarçando a fazenda e tornando o prazer de vestir-se daquele modo uma autêntica espécie de suplício. Movia-se ele com lentidão, meneando todas as suas franjas e abanando-se vigorosamente com um desses leques de madeira de sândalo, o que o envolvia numa enjoativa onda de perfume. Não sei direito o que colocara sobre a cabeça, assemelhava-se mais a um turbante ou a um chapéu sem abas de onde saíam vigorosas mechas de cabelos alourados. Como era costume seu também, trazia o rosto pintado e para isto, bem como para suas vestimentas, apoderara-se de todo o guarda-roupa deixado por sua mãe, também em sua época famosa pela extravagância com que se vestia — o que sem dúvida fazia sobressair-lhe o nariz enorme, tão característico da família Meneses.
(CARDOSO, L. Crônica da casa assassinada. São Paulo: Círculo do Livro, s.d.)', 'Pela voz de uma empregada da casa, a descrição de um dos membros da família exemplifica a renovação da ficção urbana nos anos 1950, aqui observada na', '[{"letra": "A", "texto": "opção por termos e expressões de sentido ambíguo."}, {"letra": "B", "texto": "crítica social inspirada pelo convívio com os patrões."}, {"letra": "C", "texto": "descrição impressionista do fetiche do personagem."}, {"letra": "D", "texto": "presença de um foco narrativo de caráter impreciso."}, {"letra": "E", "texto": "ambiência de mistério das relações entre familiares."}]', 'C', 'O trecho de Lúcio Cardoso detalha minuciosamente os tecidos, perfumes, vestuário e pintura do Sr. Timóteo, configurando uma descrição de forte apelo sensorial e fetiche estético que inovou a ficção da época.', NULL, NULL, 'resumida', FALSE, FALSE, 'b3cd7804e7f3c7f16e978ad088d63dace4e122c51e2b9367b673e95567398b6a', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Modernismo - Primeira Geração (Mário de Andrade)', 2023, '1º dia', 'INEP', 13, '13', 'linguagens', 'medio', 'Girassol da madrugada
Teu dedo curioso me segue lento no rosto
Os sulcos, as sombras machucadas por onde a vida passou.
Que silêncio, prenda minha... Que desvio triunfal da verdade,
Que círculos vagarosos na lagoa em que uma asa gratuita roçou...
Tive quatro amores eternos...
O primeiro era moça donzela,
O segundo... eclipse, boi que fala, cataclisma,
O terceiro era a rica senhora,
O quarto és tu... E eu afinal me repousei dos meus cuidados
(ANDRADE, M. Poesias completas. Rio de Janeiro: Nova Fronteira, 2013)', 'Perante o outro, o eu lírico revela, na força das memórias evocadas, a', '[{"letra": "A", "texto": "vergonha das marcas provocadas pela passagem do tempo."}, {"letra": "B", "texto": "indecisão em face das possibilidades afetivas do presente."}, {"letra": "C", "texto": "serenidade sedimentada pela entrega pacífica ao desejo."}, {"letra": "D", "texto": "frustração causada pela vontade de retorno ao passado."}, {"letra": "E", "texto": "disponibilidade para a exploração do prazer efêmero."}]', 'C', 'Ao término da enumeração dos seus amores ("o quarto és tu... E eu afinal me repousei dos meus cuidados"), o eu lírico expressa um estado de paz e plenitude alcançado no relacionamento presente.', NULL, NULL, 'resumida', FALSE, FALSE, '36b11d047cd89a8e7d8f06fb1ee1d9489c6c5e82323624730d51d03dccaaf4e9', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Modernismo - Terceira Geração (Guimarães Rosa)', 2023, '1º dia', 'INEP', 14, '14', 'linguagens', 'medio', 'Dão Lalalão
Do povoado do Ão, ou dos sítios perto, alguém precisava urgente de querer vir por escutar a novela do rádio. Ouvia-a, aprendia-a, guardava na ideia, e, retornado ao Ão, no dia seguinte, a repetia a outros.
Assim estavam jantando, vinham os do povoado receber a nova parte da novela do rádio. Ouvir já tinham ouvido tudo, de uma vez, fugia da regra: falhara ali no Ão, na véspera, o caminhão de um comprador de galinhas e ovos, seo Abrãozinho Buristém, que carregava um rádio pequeno, de pilhas, armara um fio no arame da cerca... Mas queriam escutar outra vez, por confirmação. "A estória é estável de boa, mal que acompridada: taca e não rende..." explicava o Zuz ao Dalberto.
Soropita começou a recontar o capítulo da novela. Sem trabalho, se recordava das palavras, até com clareza — disso se admirava. Contava com prazer de demorar, encher a sala com o poder de outros altos personagens. Tomar a atenção de todos, pudesse contar aquilo noite adiante. Era preciso trazer luz, nem uns enxergavam mais os outros; quando alguém ria, ria de muito longe. O capítulo da novela estava terminando.
(ROSA, J. G. Noites do sertão (Corpo de baile). São Paulo: Global, 2021.)', 'Nesse trecho do conto, o gosto dos moradores do povoado por ouvir a novela de rádio recontada por Soropita deve-se ao(à)', '[{"letra": "A", "texto": "qualidade do som do rádio."}, {"letra": "B", "texto": "estabilidade do enredo contado."}, {"letra": "C", "texto": "ineditismo do capítulo da novela."}, {"letra": "D", "texto": "jeito singular de falar aos ouvintes."}, {"letra": "E", "texto": "dificuldade de compreensão da história."}]', 'D', 'Embora os moradores já conhecessem o conteúdo da novela transmitida pelo rádio do comprador de galinhas, o prazer da comunidade residia na forma única e cativante como Soropita recontava a narrativa.', NULL, NULL, 'resumida', FALSE, FALSE, '136905967c1172c14cd4a424ae1e65820772f4cecd41a89c8f82f44a01e31124', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Preservação do Patrimônio Linguístico e Cultural', 2023, '1º dia', 'INEP', 15, '15', 'linguagens', 'facil', 'As cinzas do Museu Nacional, no Rio de Janeiro, consumido pelas chamas no mês de setembro de 2018, são mais do que restos de fósseis, cerâmicas e espécimes raros. O museu abrigava, entre mais de 20 milhões de peças, os esqueletos com as respostas para perguntas que ainda não haviam sido respondidas ou sequer feitas por pesquisadores brasileiros. E o incêndio pode ter calado para sempre palavras e cantos indígenas ancestrais, de línguas que não existem mais no mundo.
O acervo do local continha gravações de conversas, cantos e rituais de dezenas de sociedades indígenas, muitas feitas durante a década de 1960 com antigos gravadores de rolo e que ainda não haviam sido digitalizadas. Alguns dos registros abordavam línguas já extintas, sem falantes originais ainda vivos. "A esperança é que outras instituições tenham registros dessas línguas", diz a linguista Marília Facó Soares. A pesquisadora, que trabalha com os índios Tikuna, o maior grupo da Amazônia brasileira, crê ter perdido parte de seu material. "Terei que fazer novas viagens de campo para recompor meus arquivos. Mas obviamente não dá para recuperar a fala de nativos já falecidos, geralmente os mais idosos", lamenta.', 'A perda dos registros linguísticos no incêndio do Museu Nacional tem impacto potencializado, uma vez que', '[{"letra": "A", "texto": "exige a retomada das pesquisas por especialistas de diferentes áreas."}, {"letra": "B", "texto": "representa danos irreparáveis à memória e à identidade nacionais."}, {"letra": "C", "texto": "impossibilita o surgimento de novas pesquisas na área."}, {"letra": "D", "texto": "resulta na extinção da cultura de povos originários."}, {"letra": "E", "texto": "inviabiliza o estudo da língua do povo Tikuna."}]', 'B', 'A perda irrecuperável de gravações de línguas indígenas extintas e rituais não digitalizados causa um dano inestimável à memória linguística e à identidade histórica cultural do país.', NULL, NULL, 'resumida', FALSE, FALSE, '69b8f2bb3d6bf1c05c679e285ddaa758aa35aea31719f600fbffff27968d8478', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Variação Linguística na Libras', 2023, '1º dia', 'INEP', 16, '16', 'linguagens', 'facil', 'Mandioca, macaxeira, aipim e castelinha são nomes diferentes da mesma planta. Semáforo, sinaleiro e farol também significam a mesma coisa. O que muda é só o hábito cultural de cada região. A mesma coisa acontece com a Língua Brasileira de Sinais (Libras). Embora ela seja a comunicação oficial da comunidade surda no Brasil, existem sinais que variam em relação à região, à idade e até ao gênero de quem se comunica. A cor verde, por exemplo, possui sinais diferentes no Rio de Janeiro, Paraná e São Paulo. São os regionalismos na língua de sinais.
Essas variações são um dos temas da disciplina Linguística na língua de sinais, oferecida pela Universidade Estadual Paulista (Unesp) ao longo do segundo semestre. "Muitas pessoas pensam que a língua de sinais é universal, o que não é verdade", explica a professora e chefe do Departamento de Linguística, Literatura e Letras Clássicas da Unesp. "Mesmo dentro de um mesmo país, ela sofre variação em relação à localização geográfica, à faixa etária e até ao gênero dos usuários", completa a especialista.
Os surdos podem criar sinais diferentes para identificar lugares, objetos e conceitos. Em São Paulo, o sinal de "cerveja" é feito com um giro do punho como uma meia-volta. Em Minas, a bebida é citada quando os dedos indicador e médio batem no lado do rosto. Também ocorrem mudanças históricas. Um sinal pode sofrer alterações decorrentes dos costumes da geração que o utiliza.', 'Nesse texto, a Língua Brasileira de Sinais (Libras)', '[{"letra": "A", "texto": "passa por fenômenos de variação linguística como qualquer outra língua."}, {"letra": "B", "texto": "apresenta variações regionais, assumindo novo sentido para algumas palavras."}, {"letra": "C", "texto": "sofre mudança estrutural motivada pelo uso de sinais diferentes para algumas palavras."}, {"letra": "D", "texto": "diferencia-se em todo o Brasil, desenvolvendo cada região a sua própria língua de sinais."}, {"letra": "E", "texto": "é ininteligível para parte dos usuários em razão das mudanças de sinais motivadas geograficamente."}]', 'A', 'O texto evidencia que a Libras, assim como as línguas orais, é um sistema linguístico vivo e dinâmico, sujeito a variações regionais, geracionais e sociais.', NULL, NULL, 'resumida', FALSE, FALSE, 'e9302ac626c09518eff09f3f6885debed9dd8d3d9c89cb6553d97d4caf753100', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Recursos Gráficos e Identidade Editorial', 2023, '1º dia', 'INEP', 17, '17', 'linguagens', 'medio', 'Como é bom reencontrar os leitores da Revista da Cultura por meio de uma publicação com outro visual, conteúdo de qualidade e interesses ampliados! ]cultura[, este nome simples, e eu diria mesmo familiar, nasce entre dois colchetes voltados para fora. E não é por acaso: são sinais abertos, receptivos, propícios à circulação de ideias. O DNA da publicação se mantém o mesmo, afinal, por longos anos montamos nossas edições com assuntos saídos das estantes de uma grande livraria — e assim continuará sendo. Literatura, sociologia, filosofia, artes... nunca será difícil montar a pauta da revista porque os livros nos ensinam que monotonia é só para quem não lê.
(HERZ, P.)', 'O uso não padrão dos colchetes para nomear a revista atribui-lhes uma nova função e está correlacionado ao(à)', '[{"letra": "A", "texto": "perfil de público-alvo, constituído por leitores exigentes e especializados em leitura acadêmica."}, {"letra": "B", "texto": "propósito do editor, chamando a atenção para o rigor normativo nos textos da revista."}, {"letra": "C", "texto": "exclusividade na seleção temática, direcionada para a área das ciências humanas."}, {"letra": "D", "texto": "identidade da revista, voltada para a recepção e a promoção de ideias circulantes em livros."}, {"letra": "E", "texto": "padrão editorial dos artigos, organizados em torno de uma proposta de design inovador."}]', 'D', 'Os colchetes abertos para fora simbolizam receptividade e abertura para a circulação livre das ideias contidas nos livros, alinhando-se diretamente com a proposta editorial da revista.', NULL, NULL, 'resumida', TRUE, FALSE, '8088e1a9e906e5236d0e63c13fafd6bf205b849437152259b6413fe38c952326', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Intertextualidade e Tecnologia na Canção Brasileira', 2023, '1º dia', 'INEP', 18, '18', 'linguagens', 'medio', 'TEXTO I
Alegria, alegria
O sol nas bancas de revista
Me enche de alegria e preguiça
Quem lê tanta notícia
Eu vou
Por entre fotos e nomes
Os olhos cheios de cores
O peito cheio de amores vãos
Eu vou
Por que não, por que não?
(VELOSO, C.)

TEXTO II
Anjos tronchos
Uns anjos tronchos do Vale do Silício
Desses que vivem no escuro em plena luz
Disseram vai ser virtuoso no vício
Das telas dos azuis mais do que azuis
Agora a minha história é um denso algoritmo
Que vende venda a vendedores reais
Neurônios meus ganharam novo outro ritmo
E mais, e mais, e mais, e mais, e mais
(VELOSO, C.)', 'Embora oriundas de momentos históricos diferentes, essas letras de canção têm em comum a', '[{"letra": "A", "texto": "referência às cores como elemento de crítica a hábitos contemporâneos."}, {"letra": "B", "texto": "percepção da profusão de informações gerada pela tecnologia."}, {"letra": "C", "texto": "contraposição entre os vícios e as virtudes da vida moderna."}, {"letra": "D", "texto": "busca constante pela liberdade de expressão individual."}, {"letra": "E", "texto": "crítica à finalidade comercial das notícias."}]', 'B', 'Tanto em "Alegria, alegria" (década de 1960) quanto em "Anjos tronchos" (século XXI), Caetano Veloso aborda o excesso e o bombardeio de dados e informações gerados pelos avanços tecnológicos de cada época.', NULL, NULL, 'resumida', TRUE, FALSE, '4e5f62317c0d35507ca4516d8af1c0093139d746cfd15bf965da92b58755668b', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Recursos Argumentativos na Denúncia do Racismo', 2023, '1º dia', 'INEP', 19, '19', 'linguagens', 'facil', '"São tantas formas de matar um preto
Que para alguns sua morte é justificada
Devia tá fazendo coisa errada
Se não era bandido, um dia ia ser
Por ser PRETO sua morte é defendida
O PRETO sempre merece morrer".
A estrofe acima é do poeta e educador social Baticum Proletário, que atua na periferia de Fortaleza, no Ceará, preparando jovens em quase sua totalidade negros para enfrentar as dificuldades impostas pelo racismo estrutural no país.
É a partir da arte que Baticum consegue envolver a juventude em um projeto de fortalecimento dessa população ao promover batalhas de rimas, slams e saraus com temáticas que discutem os problemas sociais. Não por acaso, o tema mais explorado nas rimas, versos e prosas é a violência. De acordo com o mais recente Atlas da violência, em 2019, os negros representaram 77% das vítimas de homicídios, quase 30 assassinatos por 100 mil habitantes, a maioria deles jovens.
O Atlas revela ainda que um negro tem quase 2,7 vezes mais chance de ser morto do que um branco, o que justifica o movimento de resistência crescente no Brasil.
(MENDONÇA, F.)', 'O uso de citação e de dados estatísticos nesse texto tem o objetivo de', '[{"letra": "A", "texto": "ressaltar a importância da poesia para denunciar a morte de negros, que cresce a cada dia."}, {"letra": "B", "texto": "destacar o crescimento exponencial da temática do preconceito na produção literária no Brasil."}, {"letra": "C", "texto": "demonstrar o incremento no quantitativo de expressões artísticas na discussão de problemas sociais."}, {"letra": "D", "texto": "evidenciar argumentos que reforçam a ideia de que os negros são vítimas em potencial da violência."}, {"letra": "E", "texto": "salientar o aumento da participação de jovens nos movimentos de resistência na área da cultura."}]', 'D', 'A combinação dos versos poéticos denunciantes com dados estatísticos do Atlas da Violência serve para fundamentar empiricamente a tese de que a população negra é a principal vítima de homicídios no Brasil.', NULL, NULL, 'resumida', FALSE, FALSE, '1ce7765373f3182d8e13cbf4c6e0249e3381b16ce613db0a3eb7dc85b3d12ae8', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Análise Crítica da Linguagem e Relações de Poder', 2023, '1º dia', 'INEP', 20, '20', 'linguagens', 'medio', 'No princípio era o verbo. A frase que abre o primeiro capítulo do Evangelho de João e remete à criação do mundo, assim como também faz o Gênesis, é a mais famosa da Bíblia. A ideia de que o mundo é criado pela palavra, porém, é tão estruturante que está presente em outras religiões, para muito além das fundadas no cristianismo. Como humanos, a linguagem é o mundo que habitamos. Basta tentar imaginar um mundo em que não podemos usar palavras para dizer de nós e dos outros para compreender o que isso significa. Ou um mundo em que aquilo que você diz não é entendido pelo outro, e o que o outro diz não é entendido por você.
O que acontece então quando a palavra é destruída e, com ela, a linguagem?
Durante séculos, em diferentes sociedades e línguas, é importante lembrar, a linguagem serviu e ainda serve para manter privilégios de grupos de poder e deixar todos os outros de fora. Quem entende linguagem de advogados, juízes e promotores, linguagem de médicos, linguagem de burocratas, linguagem de cientistas? A maior parte da população foi submetida à violência de propositalmente ser impedida de compreender a linguagem daqueles que determinam seus destinos. Se o princípio é o verbo, o fim pode ser o silenciamento. Mesmo que ele seja cheio de gritos entre aqueles que já não têm linguagem comum para compreender uns aos outros.
(BRUM, E.)', 'Nesse texto, a estratégia usada para convencer o leitor de que uma grande parcela da população não compreende a linguagem daqueles que detêm o poder foi', '[{"letra": "A", "texto": "revelar a origem religiosa da linguagem."}, {"letra": "B", "texto": "questionar o temor sobre o futuro da linguagem."}, {"letra": "C", "texto": "descrever a relação entre sociedade e linguagem."}, {"letra": "D", "texto": "apresentar as consequências do esfacelamento da linguagem."}, {"letra": "E", "texto": "criticar o obstáculo promovido pelos usos especializados da linguagem."}]', 'E', 'Eliane Brum questiona o uso de jargões e termos herméticos por médicos, advogados e burocratas para demonstrar como o uso especializado da linguagem exclui a maioria da população das decisões sociais.', NULL, NULL, 'resumida', FALSE, FALSE, '4f35a1c1309ef5710dbd5392af13b9d4079db08070c15ea03b678de64d467c88', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Variação Linguística e Comunicação Médico-Paciente', 2023, '1º dia', 'INEP', 21, '21', 'linguagens', 'facil', 'Um grupo de pesquisadores da Universidade Federal do Ceará desenvolveu um dicionário para traduzir sintomas de doenças da linguagem popular para os termos médicos. Defruço, chanha e piloura, por exemplo, podem ser termos conhecidos para muitos, mas, durante uma consulta médica, o desconhecimento pode significar um diagnóstico errado.
"Isso é um registro histórico e pode ser muito útil para estudos dessas comunidades, na abordagem médica delas. É de certa forma pioneiro no Brasil e, sem dúvida, um instrumento de trabalho importante, porque a comunicação é fundamental na relação médico-paciente", avalia o reitor da instituição.', 'Ao registrarem usos regionais de termos da área médica, pesquisadores', '[{"letra": "A", "texto": "apontaram erros motivados pelo desconhecimento da variedade linguística local."}, {"letra": "B", "texto": "explicaram problemas provocados pela incapacidade de comunicação."}, {"letra": "C", "texto": "descobriram novos sintomas de doenças existentes na comunidade."}, {"letra": "D", "texto": "propiciaram melhor compreensão dos sintomas dos pacientes."}, {"letra": "E", "texto": "divulgaram um novo rol de doenças características da localidade."}]', 'D', 'A elaboração de um dicionário que traduz a linguagem popular para a terminologia médica melhora a comunicação na consulta, garantindo diagnósticos mais precisos e tratamentos adequados.', NULL, NULL, 'resumida', TRUE, FALSE, 'f9afb0ca6d5f748dc36c2e3432333a28d5ff61915ef3b4a9727e55b0ad8afa17', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Literatura Afro-Brasileira e Tradição Oral (Conceição Evaristo)', 2023, '1º dia', 'INEP', 22, '22', 'linguagens', 'medio', 'Alguém muito recentemente cortara o mato, que na época das chuvas crescia e rodeava a casa da mãe de Ponciá Vicêncio e de Luandi. Havia também vestígios de que a terra fora revolvida, como se ali fosse plantar uma pequena roça. Luandi sorriu. A mãe devia estar bastante forte, pois ainda labutava a terra. Cantou alto uma cantiga que aprendera com o pai, quando eles trabalhavam na terra dos brancos. Era uma canção que os negros mais velhos ensinavam aos mais novos. Eles diziam ser uma cantiga de voltar, que os homens, lá na África, entoavam sempre, quando estavam regressando da pesca, da caça ou de algum lugar. O pai de Luandi, no dia em que queria agradar à mulher, costumava entoar aquela cantiga ao se aproximar de casa. Luandi não entendia as palavras do canto; sabia, porém, que era uma língua que alguns negros falavam ainda, principalmente os velhos. Era uma cantiga alegre. Luandi, além de cantar, acompanhava o ritmo batendo com as palmas das mãos em um atabaque imaginário. Estava de regresso à terra. Voltava em casa. Chegava cantando, dançando a doce e vitoriosa cantiga de regressar.
(EVARISTO, C. Ponciá Vicêncio. Rio de Janeiro: Pallas, 2018.)', 'A leitura do texto permite reconhecer a "cantiga de voltar" como patrimônio linguístico que', '[{"letra": "A", "texto": "representa a memória de uma língua africana extinta."}, {"letra": "B", "texto": "exalta a rotina executada por jovens afrodescendentes."}, {"letra": "C", "texto": "preserva a ancestralidade africana por meio da tradição oral."}, {"letra": "D", "texto": "resgata a musicalidade africana por meio de palavras inteligíveis."}, {"letra": "E", "texto": "remonta à tristeza dos negros mais velhos com saudade da África."}]', 'C', 'A "cantiga de voltar", transmitida entre gerações sem que os mais novos compreendessem formalmente todas as palavras, atua como um elo vivo da tradição oral que preserva a ancestralidade africana.', NULL, NULL, 'resumida', FALSE, FALSE, '442d7e95124d6ed66e00d08d99c4fb02d3efaa6c2fc8b4c27379fb710a1ce920', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Intertextualidade e Representação de Gênero', 2023, '1º dia', 'INEP', 23, '23', 'linguagens', 'medio', 'TEXTO I
Zapeei os canais, como há dezenas de anos faço, e pá: parei num que exibia um episódio daquela velha família do futuro, Os Jetsons.
Nesse episódio em particular, a Jane Jetson, esposa do George, tratava de dirigir aquele veículo voador deles. Meu queixo foi caindo à medida que as piadinhas machistas sobre mulheres dirigirem foram se acumulando. Impressionante! Que futuro careta aqueles roteiristas imaginavam! Seriam incapazes de projetar algo melhor, e não apenas em termos de tecnologias, robôs e carros voadores? Será que nossa máxima visão de futuro só atinge as coisas, e jamais as pessoas? Como a Jane, uma mulher de 33 anos no desenho, poderia ser o que foram as minhas bisavós? O futuro, naquele desenho, se esqueceu de ser melhor nas relações entre as pessoas. Aliás... tão parecido com a vida. Fiquei de cara, como dizemos aqui, ou como dizíamos na minha adolescência, pobre adolescência, aprendendo, sem querer e sem muita defesa, um futuro tão besta quanto o passado.
(RIBEIRO, A. E.)

TEXTO II
Masculino e feminino são campos escorregadios que só se definem por oposição, sempre incompleta, um do outro. São formações imaginárias que buscam produzir uma diferença radical e complementar onde só existem, de fato, mínimas diferenças. O resto é questão de estilo. Até pelo menos a segunda metade do século 19, o divisor de águas era claro: os homens ocupavam o espaço público. As mulheres tratavam da vida privada. Privada de quê? De visibilidade, diria Hannah Arendt. De visibilidade pública. Do que as mulheres estiveram privadas até o século 20 foi de presença pública manifesta não em imagem, mas em palavra. A palavra feminina, reservada ao espaço doméstico, não produzia diferença na vida social.
(KEHL, M. R.)', 'A representação da mulher apresentada no Texto I pode ser explicada pelo Texto II no que diz respeito à(às)', '[{"letra": "A", "texto": "censura a formas de expressão femininas."}, {"letra": "B", "texto": "ausência da figura feminina na vida pública."}, {"letra": "C", "texto": "construções imaginárias cristalizadas na sociedade."}, {"letra": "D", "texto": "limitações inerentes às figuras femininas e masculinas."}, {"letra": "E", "texto": "dificuldade na atribuição de papéis masculinos e femininos."}]', 'C', 'O incômodo com o machismo presente no desenho animado espacial (Texto I) reflete a manutenção de estereótipos e papéis de gênero construídos socialmente ao longo da história (Texto II).', NULL, NULL, 'resumida', FALSE, FALSE, 'be916098658aaca85910ce9ebfbee3a2de2a106b645f73537abad2c8949a6e60', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Comunicação Publicitária Social e Violência Doméstica', 2023, '1º dia', 'INEP', 24, '24', 'linguagens', 'facil', '#Juntas Somos Mais Fortes
Disque 180
A Defensoria não para!
Eu uso máscara mas não me calo!
Em tempos de isolamento social por conta da pandemia de covid-19, a Defensoria Pública alerta para o aumento da violência contra a mulher!
Não se cale! Denuncie!', 'Esse anúncio publicitário, veiculado durante o contexto da pandemia de covid-19, tem por finalidade', '[{"letra": "A", "texto": "divulgar o canal telefônico de atendimento a casos de violência contra a mulher."}, {"letra": "B", "texto": "informar sobre a atuação de uma entidade defensora da mulher vítima de violência."}, {"letra": "C", "texto": "evidenciar o trabalho da Defensoria Pública em relação ao problema do abuso contra a mulher."}, {"letra": "D", "texto": "alertar a sociedade sobre o aumento da violência contra a mulher em decorrência do coronavírus."}, {"letra": "E", "texto": "incentivar o público feminino a denunciar crimes de violência contra a mulher durante o período de isolamento."}]', 'E', 'A peça publicitária da Defensoria Pública foca no contexto de isolamento da COVID-19 para encorajar as mulheres a denunciarem episódios de violência doméstica por meio do Ligue 180.', NULL, NULL, 'resumida', FALSE, FALSE, 'afc9ea02277b01345bddf09ee6ab2ba1668a939d030fc5223f6c793fbce5bb40', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Literatura Contemporânea e Metáfora da Lavoura (Itamar Vieira Jr)', 2023, '1º dia', 'INEP', 25, '25', 'linguagens', 'medio', 'Passado muito tempo, resolvi tentar falar, porque estava sozinha me embrenhando na mesma vereda que Donana costumava entrar. Ainda recordo da palavra que escolhi: arado. Me deleitava vendo meu pai conduzindo o arado velho da fazenda carregado pelo boi, rasgando a terra para depois lançar grãos de arroz em torrões marrons e vermelhos revolvidos. Gostava do som redondo, fácil e ruidoso que tinha ao ser enunciado. "Vou trabalhar no arado." "Vou arar a terra." "Seria bom ter um arado novo, esse arado tá troncho e velho." O som que deixou minha boca era uma aberração, uma desordem, como se no lugar do pedaço perdido da língua tivesse um ovo quente. Era um arado torto, deformado, que penetrava a terra de tal forma a deixá-la infértil, destruída, dilacerada.
(VIEIRA JR., I. Torto arado. São Paulo: Todavia, 2019.)', 'Com a perda de parte da língua na infância, a narradora tenta voltar a falar. Essa tentativa revela uma experiência que', '[{"letra": "A", "texto": "reflete o olhar do pai sobre as etapas do plantio."}, {"letra": "B", "texto": "metaforiza a linguagem como ferramenta de lavoura."}, {"letra": "C", "texto": "explicita, na busca pela palavra, o medo da solidão."}, {"letra": "D", "texto": "confirma a frustração da narradora com relação à terra."}, {"letra": "E", "texto": "sugere, na ausência da linguagem, a estagnação do tempo."}]', 'B', 'Ao tentar pronunciar a palavra "arado", instrumento agrícola que abre a terra, a narradora estabelece uma metáfora entre a ação de lavrar o solo e o ato físico e doloroso de produzir a fala.', NULL, NULL, 'resumida', FALSE, FALSE, 'ad3ff61428289896be99395daec6fcc050f6193028816d241b18cf52a62646f5', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Pré-Modernismo e Crítica à Escravidão (Olavo Bilac)', 2023, '1º dia', 'INEP', 26, '26', 'linguagens', 'medio', 'A escravidão
Esses meninos que aí andam jogando peteca não viram nunca um escravo... Quando crescerem, saberão que já houve no Brasil uma raça triste, votada à escravidão e ao desespero; e verão nos museus a coleção hedionda dos troncos, dos vira-mundos e dos bacalhaus; e terão notícias dos trágicos horrores de uma época maldita: filhos arrancados ao seio das mães, virgens violadas em pranto, homens assados lentamente em fornos de cal, mulheres nuas recebendo na sua mísera nudez desvalida o duplo ultraje das chicotadas e dos olhares do feitor bestial. [...] Mas a sua indignação nunca poderá ser tão grande como a daqueles que nasceram e cresceram em pleno horror, no meio desse horrível drama de sangue e lodo, sentindo dentro do ouvido e da alma, numa arrastada e contínua melopeia, o longo gemer da raça mártir — orquestração satânica de todos os soluços, de todas as impressões, de todos os lamentos que a tortura e a injustiça podem arrancar a gargantas humanas.
(BILAC, O.)', 'Publicado em 1902, o texto de Olavo Bilac enfatiza as mazelas da escravidão no Brasil ao', '[{"letra": "A", "texto": "descrever de modo impessoal as consequências da exploração racial sobre as gerações futuras."}, {"letra": "B", "texto": "contrapor a infância privilegiada das crianças da época à infância violentada das crianças escravizadas."}, {"letra": "C", "texto": "antecipar o futuro apagamento das marcas da escravidão no contexto social."}, {"letra": "D", "texto": "criticar a atenuação da violência contra os povos escravizados nas memórias retratadas pelos museus."}, {"letra": "E", "texto": "imaginar a reação de indiferença de seus contemporâneos com os escravizados libertos."}]', 'B', 'Olavo Bilac constrói seu texto opondo a vida serena e lúdica das crianças libertas no início do século XX ao passado recente de tortura e desumanização sofrido pelas crianças e adultos escravizados.', NULL, NULL, 'resumida', FALSE, FALSE, '806fd216144e1c4b881cd946e47ca49086e1addf59b1cdd40152d0fd4f21e7a6', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Coesão e Progressão Textual (Adriana Lisboa)', 2023, '1º dia', 'INEP', 27, '27', 'linguagens', 'medio', 'E assim as coisas continuaram acontecendo entre os dois, em quase sustos, um grande por acaso com cacoetes de gestos definitivos. Com o Nunca Mais se oferecendo o tempo todo, bastaria dizer foi um prazer ter te conhecido, bastaria não trocar telefones nem e-mails e enterrar a casualidade com a cal da sabedoria — nada poderia ser definitivo, os encontros duravam duas horas ou duas décadas ou duas vezes isso, mas em algum momento necessariamente seria o fim. De todos os grandes amores. De todos os pequenos. De todas as juras, das promessas, de todos os na-alegria-e-na-tristeza. De todos os não amores, os desamores, os casamentos para sempre, os rancores para sempre, de todas as paralelas que só se viabilizam na abstração da geometria, de todas as pequenas paixões e de todas as grandes paixões, de tudo que para na antessala da paixão, de todos os vínculos não experimentados, de todos.
(LISBOA, A. Rakushisha. Rio de Janeiro: Objetiva, 2014.)', 'O recurso que promove a progressão textual, contribuindo para a construção da ideia de que as relações amorosas têm um enredo comum, é a', '[{"letra": "A", "texto": "repetição do pronome indefinido \"todos\"."}, {"letra": "B", "texto": "utilização do travessão na marcação do aposto."}, {"letra": "C", "texto": "retomada do antecedente pelo pronome \"isso\"."}, {"letra": "D", "texto": "contraposição de ideias marcada pela conjunção \"mas\"."}, {"letra": "E", "texto": "substantivação de expressões pela anteposição do artigo."}]', 'A', 'A anáfora do pronome e determinante "todos" ("De todos os grandes amores. De todos os pequenos...") estrutura a enumeração e confere ritmo à ideia de imprevisibilidade e término inevitável das relações.', NULL, NULL, 'resumida', FALSE, FALSE, 'bd3936154b264e0d2ddb8e1151d0d0c28de98e0f304b8192ddd6573214844411', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Funções da Linguagem na Poesia Slam', 2023, '1º dia', 'INEP', 28, '28', 'linguagens', 'facil', 'A garganta é a gruta que guarda o som
A garganta está entre a mente e o coração
Vem coisa de cima, vem coisa de baixo e de repente um nó (e o que eu quero dizer?)
Às vezes, acontece um negócio esquisito
Quando eu quero falar eu grito, quando eu quero gritar eu falo, o resultado
Calo.
(ESTRELA D''ALVA, R.)', 'A função emotiva presente no poema cumpre o propósito do eu lírico de', '[{"letra": "A", "texto": "revelar as desilusões amorosas."}, {"letra": "B", "texto": "refletir sobre a censura à sua voz."}, {"letra": "C", "texto": "expressar a dificuldade de comunicação."}, {"letra": "D", "texto": "ressaltar a existência de pressões externas."}, {"letra": "E", "texto": "manifestar as dores do processo de criação."}]', 'C', 'A centralidade das emoções do eu lírico ("Quando eu quero falar eu grito, quando eu quero gritar eu falo, o resultado / Calo") expressa o conflito interno e a dificuldade de articular a comunicação.', NULL, NULL, 'resumida', TRUE, FALSE, 'ffd3a4b9bfabccddd200254ac2dc578fca5da65089a7e6e531bb9bad6f9fc120', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Prosa Narrativa e Memória Histórica (João Alphonsus)', 2023, '1º dia', 'INEP', 29, '29', 'linguagens', 'medio', 'Era um gato preto, como convinha a um cultor das boas letras, que já lera Poe traduzido por Baudelaire. Preto e gordo. E lerdo. Tão gordo e lerdo que a certa altura observei que ia perdendo inteiramente as qualidades características da raça, que são em suma o ódio de morte aos ratos. Já nem os afugentava! Os ratos de Ouro Preto são também dignos e solenes — não ria — tradicionalistas... descendentes de outros ratos que naqueles mesmos casarões presenciaram acontecimentos importantes da nossa história... No sobrado do desembargador Tomás Antônio Gonzaga, imagine o senhor uma reunião dos sonhadores inconfidentes, com os antepassados daqueles ratos a passearem pelo sótão ou mesmo pelo assoalho por entre as pernas dos homens absortos na esperança da independência nacional! E depois, os ancestres daqueles roedores que eu via agora deslizar sutilmente no meu quarto podiam ter subido pelo poste da ignomínia colonial, onde estava exposta a cabeça do Tiradentes! E quando as órbitas se descarnaram ignominiosamente, podiam até ter penetrado no recesso daquele crânio onde verdadeiramente ardera a literatura, com a simplicidade do heroísmo, a febre nacionalista...
(ALPHONSUS, J. Contos e novelas. Rio de Janeiro: Imago; Brasília: INL, 1976.)', 'Descrevendo seu gato, o narrador remete ao contexto e a protagonistas da Inconfidência para criar um efeito desconcertante centrado no', '[{"letra": "A", "texto": "desenho imaginativo do casario colonial de Ouro Preto."}, {"letra": "B", "texto": "efeito de apagamento de limites entre ficção e realidade."}, {"letra": "C", "texto": "vínculo estabelecido entre animais urbanos e literatura."}, {"letra": "D", "texto": "questionamento sutil quanto à sanidade dos inconfidentes."}, {"letra": "E", "texto": "contraste entre austeridade pomposa e imagem repugnante."}]', 'E', 'O efeito desconcertante surge do contraste irônico entre a nobreza e solenidade atribuídas aos inconfidentes mineiros e a presença repulsiva dos ratos passeando pelo assoalho e pelo crânio de Tiradentes.', NULL, NULL, 'resumida', FALSE, FALSE, '48d4fd31b2185bacb432c98fc3a46e126aba288e408b93cc7b6d6b735b52b58b', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Alegoria Política nos Anos 1970 (J. J. Veiga)', 2023, '1º dia', 'INEP', 30, '30', 'linguagens', 'medio', 'Enquanto estivemos entretidos com os urubus outras coisas andaram acontecendo na cidade. A Companhia baixou novas proibições, umas inteiramente bobocas, só pelo prazer de proibir (ninguém podia cuspir pra cima, nem carregar água em jacá, nem tapar o sol com peneira, como se todo mundo estivesse abusando dessas esquisitices); mas outras bem irritantes, como a de pular muro pra cortar caminho, tática que quase todo mundo que não sofria de reumatismo vinha adotando ultimamente, principalmente os meninos. E não confiando na proibição só, nem na força dos castigos, que eram rigorosos, a Companhia ainda mandou fincar cacos de garrafa nos muros. Achei isso um exagero, e comentei o assunto com mamãe. Meu pai ouviu lá do quarto e veio explicar. Disse que em épocas normais bastava uma coisa ou outra; mas agora a Companhia não podia admitir nenhuma brecha em suas ordens; se alguém desobedecesse à proibição podia se cortar nos cacos; se alguém conseguisse pular um muro quebrando o corte de alguns cacos, ou jogando um couro por cima, era apanhado pela proibição, nhoc — e fez o gesto de quem torce o pescoço de um frango.
(VEIGA, J. J. Sombras de reis barbudos. Rio de Janeiro: Civilização Brasileira, 1978.)', 'Sob a perspectiva do menino que narra, os fatos ficcionais oferecem um esboço do momento político vigente na década de 1970, aqui representado pelo', '[{"letra": "A", "texto": "culto ao medo, infiltrado em situações do cotidiano."}, {"letra": "B", "texto": "sentimento de dúvida quanto à veracidade das informações."}, {"letra": "C", "texto": "ambiente de sonho, delineado por imagens perturbadoras."}, {"letra": "D", "texto": "incentivo ao desenvolvimento econômico com a iniciativa privada."}, {"letra": "E", "texto": "espaço urbano marcado por uma política de isolamento das crianças."}]', 'A', 'O ambiente repressivo da fictícia Companhia reflete o clima autoritário dos anos 1970 no Brasil, instaurando o medo através da proibição banal de comportamentos cotidianos sob ameaça de punição.', NULL, NULL, 'resumida', FALSE, FALSE, '1c1bc0c380a5f7fd76eec10dc36ed9764ba1f8d815f5d6bc8042b43b65b5f943', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Lirismo Contemporâneo e Relações Amorosas', 2023, '1º dia', 'INEP', 31, '31', 'linguagens', 'medio', 'Migalhas
Entre a toalha branca e um bule de café
seria inapropriado dizer
eu não te amo mais.
Era necessário algo mais solene,
um jardim japonês
para as perdas pensadas,
um noturno de tempestade
para arrebentar de dor,
uma praia de pedras para chorar
em silêncio, uma cama alta
para o incenso da despedida,
uma janela
dando para o abismo.
No entanto você abaixa os olhos
e recolhe lentamente as migalhas de pão
sobre a mesa posta para dois.
(MARQUES, A. M. A vida submarina. São Paulo: Cia. das Letras, 2021.)', 'Nesse poema, a representação do sentimento amoroso recupera a tradição lírica, mas se ajusta à visão contemporânea ao', '[{"letra": "A", "texto": "invocar o interlocutor para uma tomada de posição."}, {"letra": "B", "texto": "questionar a validade do envolvimento romântico."}, {"letra": "C", "texto": "diluir em banalidade a comoção de um amor frustrado."}, {"letra": "D", "texto": "transformar em paz as emoções conflituosas do casal."}, {"letra": "E", "texto": "condicionar a existência da paixão a espaços idealizados."}]', 'C', 'Em vez de cenários dramáticos tradicionais (tempestades, abismos), a ruptura amorosa ocorre de forma doméstica e corriqueira, enquanto uma das partes apenas recolhe migalhas na mesa do café.', NULL, NULL, 'resumida', FALSE, FALSE, '50832ae7ea3f2506ada3b99989aaa4a4c1a4a91e5f15672e8bd118bf3edaa1a4', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Música e Hibridismo Cultural no Pôr do Sol do Jacaré', 2023, '1º dia', 'INEP', 32, '32', 'linguagens', 'facil', 'O sol começa a descer por trás da vegetação da Ilha da Restinga, na outra margem do rio Paraíba, colorindo o céu de amarelo, laranja e lilás. Então se ouvem as primeiras notas do Bolero, do compositor francês Maurice Ravel, executadas pelo saxofonista Jurandy. É assim o pôr do sol da praia do Jacaré, em Cabedelo (Grande João Pessoa). Depois do Bolero, Jurandy toca Asa branca, de Luiz Gonzaga, e Meu sublime torrão, de Genival Macedo, espécie de hino não oficial da Paraíba.
(PINHEIRO, A.)', 'A interpretação musical de Jurandy do Sax, codinome de José Jurandy Félix, apresenta um repertório caracterizado pela', '[{"letra": "A", "texto": "inter-relação de referenciais estéticos aparentemente distanciados."}, {"letra": "B", "texto": "valorização de músicas que revelam mensagens de serenidade."}, {"letra": "C", "texto": "consagração do repertório erudito como cultura dominante."}, {"letra": "D", "texto": "iniciativa de estímulo à vocação turística da cidade."}, {"letra": "E", "texto": "divisão hierárquica entre gêneros e estilos musicais."}]', 'A', 'O espetáculo une a tradição erudita europeia (Ravel) ao cancioneiro popular nordestino (Luiz Gonzaga e Genival Macedo), promovendo a fusão de referências estéticas de origens distintas.', NULL, NULL, 'resumida', FALSE, FALSE, 'b81349c10c1c3d9f970cdd3b5ac62b6c059557c968bc2e741bdfd4f52b3de6ac', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'História da Arte e Perseguição Política (Lasar Segall)', 2023, '1º dia', 'INEP', 33, '33', 'linguagens', 'medio', 'TEXTO I
[DESCRIÇÃO DA IMAGEM: A pintura "Eternos caminhantes" (1919), de Lasar Segall, retrata figuras humanas estilizadas, expressivas e angulares, carregando fardos em um cenário de tom sombrio e expressionista.]

TEXTO II
Em 1933, a obra Eternos caminhantes ingressou em uma das primeiras edições das exposições de Arte Degenerada, promovida por membros do partido nazista alemão. Nos anos seguintes, ela voltaria a ser exibida na mostra denominada Exposição da Vergonha, promovida por pequenos grupos abastados. Em 1937, essa obra foi confiscada pelo Ministério da Propaganda daquele país, na grande ação nacional-socialista contra a "Arte Degenerada".
(SCHWARTZ, J.)', 'Quase cinquenta obras de Lasar Segall foram confiscadas pelo regime totalitário alemão na primeira metade do século XX, entre elas a obra Eternos caminhantes, considerada degenerada por', '[{"letra": "A", "texto": "representar uma estética tida como inconveniente para o ideário político vigente."}, {"letra": "B", "texto": "manifestar um posicionamento político-cultural concebido por grupos de oposição."}, {"letra": "C", "texto": "expressar a cultura artística por meio da representação parcial do corpo humano."}, {"letra": "D", "texto": "apresentar uma composição que antecipa o imaginário artístico germânico."}, {"letra": "E", "texto": "estimular discussões sobre o papel da arte na construção coletiva de cultura."}]', 'A', 'O regime nazista rotulou a obra expressionista de Segall como "arte degenerada" por ela não se adequar aos padrões estéticos realistas e ideológicos impostos pelo totalitarismo.', 'A pintura "Eternos caminhantes" (1919), de Lasar Segall, retrata figuras humanas estilizadas, expressivas e angulares, carregando fardos em um cenário de tom sombrio e expressionista.', NULL, 'resumida', FALSE, FALSE, '00c63df4bd683902534a23e24bb224c7f97bbcf215035ca0a579646e200f0f7f', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Dança Contemporânea e Matrizes Afro-Brasileiras', 2023, '1º dia', 'INEP', 34, '34', 'linguagens', 'medio', 'TEXTO I
Logo no início de Gira, um grupo de sete bailarinas ocupa o centro da cena. Mãos cruzadas sobre a lateral esquerda do quadril, olhos fechados, troncos que pendulam sobre si mesmos em vaguíssimas órbitas, tudo nelas sugere o transe. Está estabelecido o caráter volátil do que se passará no palco dali para frente. Mas engana-se quem pensa que vai assistir a uma representação mimética dos cultos afro-brasileiros.

TEXTO II
[DESCRIÇÃO DA IMAGEM: Foto do espetáculo Gira, do Grupo Corpo. Bailarinos vestidos com saias brancas se movimentam sob iluminação cênica expressiva.]', 'No diálogo que estabelece com religiões afro-brasileiras, sintetizado na descrição e na imagem do espetáculo, a dança exprime uma', '[{"letra": "A", "texto": "crítica aos movimentos padronizados do balé clássico."}, {"letra": "B", "texto": "representação contemporânea de rituais ancestrais extintos."}, {"letra": "C", "texto": "reelaboração estética erudita de práticas religiosas populares."}, {"letra": "D", "texto": "releitura irônica da atmosfera mística presente no culto a entidades."}, {"letra": "E", "texto": "oposição entre o resgate de tradições e a efemeridade da vida humana."}]', 'C', 'A companhia Grupo Corpo não realiza uma imitação literal dos rituais de Candomblé/Umbanda, mas reelabora poeticamente os elementos do transe e dos gestos sagrados em linguagem de dança contemporânea.', 'Foto do espetáculo Gira, do Grupo Corpo. Bailarinos vestidos com saias brancas se movimentam sob iluminação cênica expressiva.', NULL, 'resumida', FALSE, FALSE, 'c23d9ab696e756e7309c0ab22a8366812f706d33b1f48e3d97a2a24a42488602', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Esporte Eletrônico e Mercado Global', 2023, '1º dia', 'INEP', 35, '35', 'linguagens', 'facil', 'A indústria do esporte eletrônico é um mercado que está crescendo em um ritmo mais rápido do que a economia mundial. Sua popularidade cresceu muito e no Brasil não é diferente. De acordo com os dados de uma pesquisa, mais de 64% dos brasileiros que jogam videogame já ouviram falar de esporte eletrônico. No entanto, o que chama a atenção é o crescimento superior a 10% do público praticante comparado ao ano anterior, que subiu de 44,7% para 55,4%. Trata-se de um percentual expressivo, já que o Brasil está no top 3 dentre os países que têm maior número de espectadores de esporte eletrônico do mundo. Comparado ao ano anterior, em 2020, o Brasil teve um marco de crescimento de 20% na audiência. Mundo afora, a árdua dedicação de grandes gamers contribuiu para o reconhecimento do Comitê Olímpico Internacional, aliado a outras cinco federações esportivas e suas desenvolvedoras de jogos, que direcionaram um olhar mais atento ao assunto, permitindo dar o primeiro passo para concretizar, pela primeira vez na história dos jogos eletrônicos, um evento olímpico oficial.', 'O contexto em que o esporte eletrônico é apresentado no texto demonstra o(a)', '[{"letra": "A", "texto": "condição favorável à expansão dessa modalidade."}, {"letra": "B", "texto": "promoção dessa prática por jogadores profissionais."}, {"letra": "C", "texto": "impulsionamento de um processo de marketing."}, {"letra": "D", "texto": "favorecimento de fabricantes dos jogos."}, {"letra": "E", "texto": "modificação da audiência televisiva."}]', 'A', 'Os dados de aumento contínuo de praticantes, audiência e o apoio de entidades esportivas globais atestam um ambiente de forte crescimento e expansão para os e-sports.', NULL, NULL, 'resumida', FALSE, FALSE, '4f5d095ab923fa5e50332bcc1c939ffc873c244fd448353ef5454935b708af30', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Patrimônio Imaterial e Cultura Afro-Amapaense (Marabaixo)', 2023, '1º dia', 'INEP', 36, '36', 'linguagens', 'facil', 'O Marabaixo é uma expressão artístico-cultural formada nas tradições e na identificação cultural entre as comunidades negras do Amapá. O nome remonta às mortes de escravizados em navios negreiros que eram jogados na água. Em sua homenagem, hinos de lamento eram cantados mar abaixo, mar acima. Posteriormente, o Marabaixo se integrou à vivência das comunidades negras em um ciclo de danças, cantorias com tambores e festas religiosas, recebendo, em 2018, o título de Patrimônio Cultural do Brasil.', 'A manifestação do Marabaixo se constituiu em expressão de arte e cultura, exercendo função de', '[{"letra": "A", "texto": "ressignificar episódios dramáticos em novas práticas culturais."}, {"letra": "B", "texto": "adaptar coreografias como imitação dos movimentos do mar."}, {"letra": "C", "texto": "lembrar dos mortos no passado escravista como forma de lamento."}, {"letra": "D", "texto": "perpetuar uma narrativa de apagamento dos fatos históricos traumáticos."}, {"letra": "E", "texto": "ritualizar a passagem de atos fúnebres nas produções coletivas com espírito festivo."}]', 'A', 'O Marabaixo transformou memórias dolorosas das mortes nos navios negreiros em uma expressão cultural viva e comemorativa que celebra a identidade e a resistência negra no Amapá.', NULL, NULL, 'resumida', TRUE, FALSE, '333a83fd661f6611ffdf69c377e1bcf67670faf348dafebfc2ff848164476d98', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Artes Visuais Digitais e Redes Sociais', 2023, '1º dia', 'INEP', 37, '37', 'linguagens', 'facil', 'O uso das redes sociais como forma de ampliar universos foi uma descoberta recente para o artista Wolney Fernandes, que começou a criar quando o ambiente em Goiás era mais árido em relação às artes visuais. "Hoje, ser diferente é uma potência e quem sabe o que quer com a própria arte encontra espaço", diz. As colagens artísticas do goiano aparecem em capas de obras literárias pelo Brasil e exterior.', 'O artista goiano Wolney Fernandes busca expor seu trabalho por meio de plataformas virtuais com o objetivo de', '[{"letra": "A", "texto": "dar suporte à técnica de colagem em Artes Visuais, contornando dificuldades práticas."}, {"letra": "B", "texto": "aproximar-se da estética visual própria da editoração de obras artísticas, como capas de livros."}, {"letra": "C", "texto": "oferecer uma vitrine internacional para sua produção artística, a fim de dar mais visibilidade a suas obras."}, {"letra": "D", "texto": "enfatizar o caráter original e inovador de suas criações artísticas, diferenciando-se das artes tradicionais."}, {"letra": "E", "texto": "trazer um sentido tecnológico às suas colagens, uma vez que as imagens artísticas são recorrentes nas redes sociais."}]', 'C', 'A publicação de suas artes digitais nas redes permitiu ao artista goiano superar limitações geográficas regionais e projetar seu trabalho em âmbito nacional e internacional.', NULL, NULL, 'resumida', FALSE, FALSE, '8945fbd5bba714e7d85d0ce5e22361cd776432aabcb2ad15bb43a6a1a8019646', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Música Urbana Indígena (Rap Guarani-Kaiowá)', 2023, '1º dia', 'INEP', 38, '38', 'linguagens', 'facil', 'O mais antigo grupo de rap indígena do país, Brô MCs, surgiu em 2009, na aldeia Jaguapiru, em Dourados, Mato Grosso do Sul. Os integrantes conheceram o rap pelo rádio, ouvindo um programa que apresentava cantores e grupos brasileiros desse gênero musical. O Brô MCs conseguiu influenciar outros a fazerem rap e a lutarem pelas causas indígenas. Um dos nomes do movimento, Kunumí MC, é um jovem de 16 anos, da aldeia Krukutu, em São Paulo. O adolescente enxerga o rap como uma cultura da defesa e começou a fazer rimas quando percebeu que a poesia, pela qual sempre se interessou, podia virar música. Nas letras que cria, inspiradas tanto pelo rap quanto pelos ritmos indígenas, tenta incluir sempre assuntos aos quais acha importante dar voz, principalmente, a questão da demarcação de terras.', 'O movimento rap dos povos originários do Brasil revela o(a)', '[{"letra": "A", "texto": "fusão de manifestações artísticas urbanas contemporâneas com a cultura indígena."}, {"letra": "B", "texto": "contraposição das temáticas socioambientais indígenas às questões urbanas."}, {"letra": "C", "texto": "rejeição da indústria radiofônica às músicas indígenas."}, {"letra": "D", "texto": "distanciamento da realidade social indígena."}, {"letra": "E", "texto": "estímulo ao estudo da poesia indígena."}]', 'A', 'O grupo Brô MCs articula o gênero urbano do rap com os cantos e a língua nativa Guarani-Kaiowá, usando a música como ferramenta de denúncia e defesa territorial indígena.', NULL, NULL, 'resumida', FALSE, FALSE, 'fe49add287efba9287bee17496e7bdc4d1f30b897ee452610379985044cd59d8', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Mudança Lexical e Participação Social (Dicionário Michaelis)', 2023, '1º dia', 'INEP', 39, '39', 'linguagens', 'facil', 'A petição on-line criada por um cidadão paulista surtiu efeito: casado há três anos com seu companheiro, ele pedia a alteração da definição de "casamento" no tradicional dicionário Michaelis em português. Na definição anterior, casamento aparecia como "união legítima entre homem e mulher" e "união legal entre homem e mulher, para constituir família".
O novo verbete não traz em nenhum momento as palavras homem ou mulher — agora a definição de casamento se refere a "pessoas".
Para o diretor de comunicação do site onde a petição foi publicada, a iniciativa mostra a "eficiência da mobilização". "Em dois dias, mudou-se uma definição que permanecia a mesma há décadas", afirma. E conclui: "A plataforma serve para todos os tipos de causas, para as mudanças que importam para as pessoas.".
(SENRA, R.)', 'A notícia trata da mudança ocorrida em um dicionário da língua portuguesa. Segundo o texto, essa mudança foi impulsionada pela', '[{"letra": "A", "texto": "inclusão de informações no verbete."}, {"letra": "B", "texto": "relevância social da instituição casamento."}, {"letra": "C", "texto": "utilização pública da petição pelos cidadãos."}, {"letra": "D", "texto": "rapidez na disseminação digital do verbete."}, {"letra": "E", "texto": "divulgação de plataformas para a criação de petição."}]', 'C', 'A alteração no verbete do dicionário foi fruto direto do engajamento popular e do uso de ferramentas digitais de mobilização (petições públicas online) pela cidadania.', NULL, NULL, 'resumida', FALSE, FALSE, '4519effcd3d1ef97ce01d91d964329c236812aa8afc188db6fb742d8d52d38a3', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Inclusão Transgênero no Esporte Olímpico', 2023, '1º dia', 'INEP', 40, '40', 'linguagens', 'medio', 'A neozelandesa Laurel Hubbard fez história nos Jogos Olímpicos. Apesar de ter ficado de fora da disputa por medalhas, a levantadora de peso deixou sua marca na edição de Tóquio por ser a primeira mulher abertamente transgênero a participar de uma competição olímpica. No início da carreira, na década de 1990, a neozelandesa participava de disputas na categoria masculina. Em 2001, aos 23 anos, ela se afastou da atividade. "A pressão de tentar me encaixar em um mundo que talvez não tenha sido feito para pessoas como eu se tornou um fardo muito grande para suportar." Em 2012, Laurel começou sua transição de gênero por meio de terapias hormonais e, em 2013, declarou abertamente ser uma mulher trans. Para o Comitê Olímpico Internacional, a participação de mulheres trans nos Jogos é permitida caso o nível de testosterona, hormônio que aumenta a massa muscular, esteja abaixo de 10 nanomols por litro por pelo menos 12 meses.', 'No texto, os limites do potencial inclusivo do esporte são dados pela', '[{"letra": "A", "texto": "dificuldade de conseguir bons resultados esportivos."}, {"letra": "B", "texto": "dependência de características biológicas padronizadas."}, {"letra": "C", "texto": "inexistência de uma categoria para pessoas transgênero."}, {"letra": "D", "texto": "necessidade de afastamento temporário das competições."}, {"letra": "E", "texto": "impossibilidade de uso controlado de substâncias exógenas."}]', 'B', 'As diretrizes esportivas para a inclusão de atletas trans impõem limites rigorosos fundamentados em taxas hormonais e parâmetros biológicos fixos (ex.: nível de testosterona).', NULL, NULL, 'resumida', FALSE, FALSE, 'a2f67fde9f729e96afc1d72cf2c72f2d3bf0768e5c1668e675e0563a7119aeb7', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Saúde Mental e Abuso no Esporte de Alto Rendimento', 2023, '1º dia', 'INEP', 41, '41', 'linguagens', 'facil', '"Ganhei 25 medalhas em mundiais, sete em Jogos Olímpicos, e sou uma sobrevivente de abuso sexual." Foi assim que Simone Biles se apresentou ao comitê do Senado norte-americano que investiga as supostas falhas do FBI no caso Larry Nassar. Biles e outras três atletas, vítimas dos abusos do ex-médico da equipe de ginástica feminina dos EUA, exigiram que os agentes da investigação sejam processados por falta de ação prévia contra Nassar, agora preso. Biles esclareceu que culpa Larry Nassar e "todo o sistema que o permitiu e o perpetrou", acusando a Federação de Ginástica e o Comitê Olímpico dos Estados Unidos de saberem "muito antes" que ela havia sofrido abusos. A melhor ginasta do mundo é um ícone. Nos Jogos Olímpicos de Tóquio, uma lesão psicológica a impediu de competir como previa. No entanto, ela chegou ao topo como uma líder no trabalho de acabar com o preconceito com os problemas de saúde mental. "Não quero que nenhum outro atleta olímpico sofra o horror que eu e outras centenas suportamos e continuamos suportando até hoje", afirmou.', 'O fato relatado na notícia chama a atenção acerca da necessidade de reflexão sobre a relação entre o esporte e', '[{"letra": "A", "texto": "o desempenho atlético internacional."}, {"letra": "B", "texto": "a dimensão emocional dos atletas."}, {"letra": "C", "texto": "os comitês olímpicos nacionais."}, {"letra": "D", "texto": "as instituições de inteligência."}, {"letra": "E", "texto": "as federações esportivas."}]', 'B', 'O depoimento corajoso de Simone Biles evidencia que a busca por alto rendimento esportivo não pode negligenciar o suporte psicológico e a integridade emocional e física dos atletas.', NULL, NULL, 'resumida', FALSE, FALSE, '31bcd606099ffa61b73d155858783b775deb7b0db14bd4489f986b90b067ebcb', 'enem-2023-dia1.txt'),
('ENEM', 'Artes', 'Sociologia do Esporte e Lazer', 2023, '1º dia', 'INEP', 42, '42', 'linguagens', 'facil', 'O acesso às Práticas Corporais/Atividades Físicas (PC/AF) é desigual no Brasil, à semelhança de outros indicadores sociais e de saúde. Em geral, PC/AF prazerosas, diversificadas, mais afeitas ao período de lazer estão concentradas nas populações mais abastadas. As atividades físicas de deslocamento, trajetos a pé ou de bicicleta para estudar ou trabalhar, por exemplo, são mais frequentes na classe social menos favorecida. Aqui, há uma relação inversa e perversa entre variáveis socioeconômicas de acesso às PC/AF. As maiores prevalências de inatividade física foram em mulheres, pessoas com 60 anos ou mais, negros, pessoas com autoavaliação de saúde ruim ou muito ruim, com renda familiar de até quatro salários mínimos por pessoa, pessoas que desconhecem programas públicos de PC/AF e residentes em áreas sem locais públicos para a prática.
(KNUTH, A. G.; ANTUNES, P. C.)', 'O fator central que impacta a realização de práticas corporais/atividades físicas no tempo de lazer no Brasil é a', '[{"letra": "A", "texto": "diferença entre homens e mulheres."}, {"letra": "B", "texto": "inexistência de políticas públicas."}, {"letra": "C", "texto": "diversidade de faixa etária."}, {"letra": "D", "texto": "variação de condição étnica."}, {"letra": "E", "texto": "desigualdade entre classes sociais."}]', 'E', 'O artigo demonstra que o acesso às práticas esportivas de lazer é fortemente determinado pela classe social e poder aquisitivo, cabendo às classes populares o exercício predominantemente ligado ao deslocamento de trabalho.', NULL, NULL, 'resumida', FALSE, FALSE, '2ca0148d5561524e9f9c08d06d358b5435cf6a2deaf7ed17895ac86205e7ec02', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Oratória Acadêmica e Discurso de Homenagem (Rui Barbosa)', 2023, '1º dia', 'INEP', 43, '43', 'linguagens', 'medio', 'Mestre e companheiro, disse eu que nos íamos despedir. Mas disse mal. A morte não extingue: transforma; não aniquila: renova; não divorcia: aproxima. Um dia supuseste "morta e separada" a consorte dos teus sonhos e das tuas agonias, que te soubera "pôr um mundo inteiro no recanto" do teu ninho; e, todavia, nunca ela te esteve mais presente, no íntimo de ti mesmo e na expressão do teu canto, no fundo do teu ser e na face de tuas ações. Esses catorze versos inimitáveis, em que o enlevo dos teus discípulos resume o valor de toda uma literatura, eram a aliança de ouro do teu segundo noivado, um anel de outras núpcias, para a vida nova do teu renascimento e da tua glorificação, com a sócia sem nódoa dos teus anos de mocidade e madureza, da florescência e frutificação de tua alma. Para os eleitos do mundo das ideias a miséria está na decadência, e não na morte. A nobreza de uma nos preserva das ruínas da outra. Quando eles atravessavam essa passagem do invisível, que os conduz à região da verdade sem mescla, então é que entramos a sentir o começo do seu reino, o reino dos mortos sobre os vivos.
(BARBOSA, R. O adeus da Academia a Machado de Assis. Rio de Janeiro: Agir, 1962.)', 'Esse é um trecho do discurso de Rui Barbosa na Academia Brasileira de Letras em homenagem a Machado de Assis por ocasião de sua morte. Uma das características desse discurso de homenagem é a presença de', '[{"letra": "A", "texto": "metáforas relacionadas à trajetória pessoal e criadora do homenageado."}, {"letra": "B", "texto": "recursos fonológicos empregados para a valorização do ritmo do texto."}, {"letra": "C", "texto": "frases curtas e diretas no relato da vida e da morte do homenageado."}, {"letra": "D", "texto": "contraposição de ideias presentes na obra do homenageado."}, {"letra": "E", "texto": "seleção vocabular representativa do sentimento de nostalgia."}]', 'A', 'Rui Barbosa utiliza figurações metafóricas sobre a vida e o renascimento espiritual do escritor para exaltar a imortalidade da obra literária machadiana.', NULL, NULL, 'resumida', FALSE, FALSE, '4be62cc0e3096a6f0b2e2a55b0adfc5268c28016a3392dbb7cf930b84758f28f', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Campanha Publicitária de Saúde Pública', 2023, '1º dia', 'INEP', 44, '44', 'linguagens', 'facil', '[DESCRIÇÃO DA IMAGEM: Infográfico do Ministério da Saúde com o título "POR QUE É TÃO IMPORTANTE AMAMENTAR?". Pontos destacados: "O bebê recebe os anticorpos da mãe para proteção contra diversas doenças, como diarreia e como infecções, principalmente respiratórias", "Diminui o risco de asma, diabetes e obesidade em crianças", "É um ótimo exercício para o desenvolvimento da face do bebê e para o crescimento de dentes fortes e bonitos", "Desenvolve a fala e uma boa respiração".]', 'Essa campanha publicitária do Ministério da Saúde visa', '[{"letra": "A", "texto": "divulgar um conjunto de benefícios proporcionados pela amamentação."}, {"letra": "B", "texto": "apresentar tratamentos para infecções respiratórias em bebês."}, {"letra": "C", "texto": "defender o direito das mulheres de amamentar em público."}, {"letra": "D", "texto": "orientar sobre os exercícios para uma boa amamentação."}, {"letra": "E", "texto": "informar sobre o aumento de anticorpos nas mães."}]', 'A', 'O infográfico lista múltiplos benefícios da amamentação para a saúde do bebê, englobando aspectos imunológicos, odontológicos e de desenvolvimento fonoaudiológico.', 'Infográfico do Ministério da Saúde com o título "POR QUE É TÃO IMPORTANTE AMAMENTAR?". Pontos destacados: "O bebê recebe os anticorpos da mãe para proteção contra diversas doenças, como diarreia e como infecções, principalmente respiratórias", "Diminui o risco de asma, diabetes e obesidade em crianças", "É um ótimo exercício para o desenvolvimento da face do bebê e para o crescimento de dentes fortes e bonitos", "Desenvolve a fala e uma boa respiração".', NULL, 'resumida', FALSE, FALSE, 'c3d803c99426ae5bf7428e1ac1bff682b81e48f085aea49215b3e0621cdda02a', 'enem-2023-dia1.txt'),
('ENEM', 'Português', 'Gênero Textual Carta Aberta e Direitos Sociais', 2023, '1º dia', 'INEP', 45, '45', 'linguagens', 'medio', 'Carta aberta à população brasileira
Prezados Cidadãos e Cidadãs,
O envelhecimento populacional é um fenômeno mundial. Infelizmente, nosso país ainda não está preparado para atender às demandas dessa população.
Este é o retrato da saúde pública no Brasil, que, apesar dos indiscutíveis avanços, apresenta um cenário de deficiências e falta de integração em todos os níveis de atenção à saúde: primária (atendimento deficiente nas unidades de saúde da atenção básica), secundária (carência de centros de referência com atendimento por especialistas) e terciária (atendimento hospitalar com abordagem ao idoso centrada na doença), ou seja, não há, na prática, uma rede de atenção à saúde do idoso.
Diante desse cenário, a Sociedade Brasileira de Geriatria e Gerontologia (SBGG) vem a público manifestar suas preocupações com o presente e o futuro dos idosos no Brasil. É preciso garantir a saúde como direito universal. Esperamos que tanto nossos atuais quanto os futuros governantes e legisladores reflitam sobre a necessidade de investir na saúde e na qualidade de vida associada ao envelhecimento.
Dignidade à saúde do idoso!
Rio de Janeiro, 15 de setembro de 2014.', 'O objetivo desse texto é', '[{"letra": "A", "texto": "sensibilizar o idoso a respeito dos cuidados com a saúde."}, {"letra": "B", "texto": "alertar os governantes sobre os cuidados requeridos pelo idoso."}, {"letra": "C", "texto": "divulgar o trabalho da Sociedade Brasileira de Geriatria e Gerontologia."}, {"letra": "D", "texto": "informar o setor público sobre o retrocesso da legislação destinada à população idosa."}, {"letra": "E", "texto": "chamar a atenção da população sobre a qualidade dos serviços de saúde pública para o idoso."}]', 'B', 'A carta aberta da SBGG destina-se a cobrar dos governantes e legisladores investimentos em políticas públicas e estruturação de uma rede de atendimento integral à saúde do idoso.', NULL, NULL, 'resumida', FALSE, FALSE, 'e877907261fef58301623c7bbceec52b7abc6c69da2aa2ead8bf9af67a759451', 'enem-2023-dia1.txt'),
('ENEM', 'Geografia', 'Geografia Cultural e Representação do Sertão', 2023, '1º dia', 'INEP', 46, '46', 'humanas', 'facil', 'Sertão: a avó bordando caminhos com linhas coloridas.
[DESCRIÇÃO DA IMAGEM: Fotografia de um bordado manual retratando uma mulher idosa bordando caminhos e linhas sobre um tecido.]
(SCARELI, G. A máquina de costura e os fios da memória. Revista Brasileira de Pesquisa (Auto) Biográfica, n. 18, maio-ago. 2021.)', 'A definição de Sertão descrita no bordado associa esse recorte espacial a', '[{"letra": "A", "texto": "percursos e roteiros turísticos."}, {"letra": "B", "texto": "trajetos e movimentos holísticos."}, {"letra": "C", "texto": "vivências e itinerários socioafetivos."}, {"letra": "D", "texto": "fronteiras e demarcações territoriais."}, {"letra": "E", "texto": "profissões e interesses econômicos."}]', 'C', 'A obra de arte em bordado traduz o espaço geográfico do Sertão não como mera coordenada física, mas como um espaço vivido repleto de laços afetivos e memórias familiares.', 'Fotografia de um bordado manual retratando uma mulher idosa bordando caminhos e linhas sobre um tecido.', NULL, 'resumida', FALSE, FALSE, '77f0d7c32a3e317b7cda61ac2d4f1527fc9e04a8c55abb779cbc5c334b9ff551', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'História do Brasil Império e Letramento Feminino', 2023, '1º dia', 'INEP', 47, '47', 'humanas', 'medio', 'Felizes tempos eram esses! As moças iam à missa de madrugada. De dia ninguém as via e se alguma, em dia de festa, queria passear com a avó ou a tia, havia de ir de cadeirinhas. Bem razão têm os nossos velhos de chorar por esses tempos, em que as filhas não sabiam escrever, e por isso não mandavam nem recebiam bilhetinhos.
(Novo Correio de Modas, 1853, apud DONEGÁ, A. L.)', 'Na perspectiva do autor, as tradições e os costumes sociofamiliares sofreram alterações, no século XIX, decorrentes de quais fatores?', '[{"letra": "A", "texto": "Hábitos de leitura e mobilidade regional."}, {"letra": "B", "texto": "Circulação de impressos e trânsito religioso."}, {"letra": "C", "texto": "Valorização da língua e imigração estrangeira."}, {"letra": "D", "texto": "Práticas de letramento e transformação cultural."}, {"letra": "E", "texto": "Flexibilização do ensino e reformismo pedagógico."}]', 'D', 'O texto oitocentista registra com saudosismo o aumento do acesso das mulheres à alfabetização, reconhecendo que a leitura e a escrita transformaram a dinâmica social e familiar.', NULL, NULL, 'resumida', FALSE, FALSE, '0ba1bf4b84f3313a92185c4ee0ced88dd0520a6edbef219f83073385236a80c2', 'enem-2023-dia1.txt'),
('ENEM', 'Geografia', 'Geografia Agrária e Expropriação Camponesa no Cerrado', 2023, '1º dia', 'INEP', 48, '48', 'humanas', 'medio', 'No Cerrado, o conhecimento local está sendo cada vez mais subordinado à lógica do agronegócio. De um lado, o capital impõe os conhecimentos biotecnológicos, como mecanismo de universalização de práticas agrícolas e de novas tecnologias, e de outro, o modelo capitalista subordina homens e mulheres à lógica do mercado. Assim, as águas, as sementes, os minerais, as terras (bens comuns) tornam-se propriedade privada. Além do mais, há outros fatores negativos, como a mecanização pesada, a "pragatização" dos seres humanos e não humanos, a violência simbólica, a superexploração, as chuvas de veneno e a violência contra a pessoa.
(CALAÇA, M.; SILVA, E. B.; JESUS, J. N.)', 'Os elementos descritos no texto, a respeito da territorialização da produção, demonstram que há um', '[{"letra": "A", "texto": "cerco aos camponeses, inviabilizando a manutenção das condições para a vida."}, {"letra": "B", "texto": "descaso aos latifundiários, impactando a plantação de alimentos para a exportação."}, {"letra": "C", "texto": "desprezo ao assalariado, afetando o engajamento dos sindicatos para o trabalhador."}, {"letra": "D", "texto": "desrespeito aos governantes, comprometendo a criação de empregos para o lavrador."}, {"letra": "E", "texto": "assédio ao empresariado, dificultando o investimento de maquinários para a produção."}]', 'A', 'A expansão do agronegócio corporativo no Cerrado privatiza bens comuns (água e terra) e introduz poluição química, pressionando e marginalizando as comunidades camponesas locais.', NULL, NULL, 'resumida', FALSE, FALSE, '5c8d15a32361a715d9a0d7f054bd807863a4661cbd1133c1ff999747597a0ae4', 'enem-2023-dia1.txt'),
('ENEM', 'Geografia', 'Geopolítica da China e Ocupação Territorial em Xinjiang', 2023, '1º dia', 'INEP', 49, '49', 'humanas', 'medio', 'TEXTO I
Com uma população de 25 milhões de habitantes (cerca de 60% de minorias muçulmanas, principalmente da etnia Uigur), Xinjiang é uma região estratégica para a China. Faz fronteira com oito países, é uma artéria crucial do megaprojeto de infraestrutura chinês Cinturão e Rota e tem as maiores reservas nacionais de carvão e gás natural.
(NINIO, M.)

TEXTO II
Dentre as províncias da Região Oeste, Xinjiang se destaca ao receber mais de 1,7 milhão de migrantes entre 2000 e 2010. O principal motivo desse fluxo migratório é que o governo fornece subsídios à população visando aumentar a proporção de chineses da etnia Han em relação à população local de etnias turca e muçulmana.
(ALVES, F.; TOYOSHIMA, S.)', 'A política demográfica para a província mencionada nos textos é parte da seguinte ação estratégica do governo chinês:', '[{"letra": "A", "texto": "Promover a ocupação rural."}, {"letra": "B", "texto": "Favorecer a liberdade religiosa."}, {"letra": "C", "texto": "Descentralizar a gestão pública."}, {"letra": "D", "texto": "Incentivar a pluralidade cultural."}, {"letra": "E", "texto": "Assegurar a integridade territorial."}]', 'E', 'O incentivo estatal à migração da etnia majoritária Han para Xinjiang visa diluir a hegemonia da minoria uigur e assegurar o controle e a soberania territorial chinesa na fronteira estratégica.', NULL, NULL, 'resumida', FALSE, FALSE, '47ad852aa9d48566dda471f1760eab992c83e2bedcc9227e914bc83ce50fdd80', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'Historiografia Afro-Brasileira e Antirracismo', 2023, '1º dia', 'INEP', 50, '50', 'humanas', 'facil', 'Superar a história da escravidão como principal marca da trajetória do negro no país tem sido uma tônica daqueles que se dedicam a pesquisar as heranças de origem afro à cultura brasileira. A esse esforço de reconstrução da própria história do país, alia-se agora a criação da plataforma digital Ancestralidades. "A história do negro no Brasil vai continuar sendo contada, e cada passo que a gente dá para trás é um passo que a gente avança", diz Márcio Black, idealizador da plataforma, sobre o estudo de figuras ainda encobertas pela perspectiva histórica imposta pelos colonizadores da América.
(FIORATI, G.)', 'Em relação ao conhecimento sobre a formação cultural brasileira, iniciativas como a descrita no texto favorecem o(a)', '[{"letra": "A", "texto": "recuperação do tradicionalismo."}, {"letra": "B", "texto": "estímulo ao antropocentrismo."}, {"letra": "C", "texto": "reforço do etnocentrismo."}, {"letra": "D", "texto": "resgate do teocentrismo."}, {"letra": "E", "texto": "crítica ao eurocentrismo."}]', 'E', 'Ao resgatar a trajetória de personalidades negras omitidas pela história oficial, o projeto contesta a narrativa histórica hegemônica fundada no eurocentrismo.', NULL, NULL, 'resumida', FALSE, FALSE, '5dad8c339eb055db0b9335ad694ba6bb342fddf9bbdc4ca6c693f1a1225fd933', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'Conflitos no Oriente Médio e Declaração Balfour', 2023, '1º dia', 'INEP', 51, '51', 'humanas', 'medio', 'Escrito durante a Primeira Guerra Mundial, o seguinte trecho faz parte da carta enviada pelo secretário do exterior britânico, Sir Arthur James Balfour, ao banqueiro Lord Rothschild, presidente da Liga Sionista, em 2 de novembro de 1917, a carta ficou conhecida como Declaração Balfour:
"O governo de Sua Majestade vê com aprovação o estabelecimento na Palestina de um lar nacional para o povo judeu, e fará todos os esforços para facilitar tal objetivo. Nada será feito que possa prejudicar os direitos civis e religiosos das comunidades não judaicas na Palestina."
(GATTAZ, A. A Guerra da Palestina. São Paulo: Usina do Livro, 2002.)', 'A análise do resultado do processo em questão revela que o governo inglês foi incapaz de garantir seu objetivo de', '[{"letra": "A", "texto": "promover o bem-estar social."}, {"letra": "B", "texto": "negociar o apoio muçulmano."}, {"letra": "C", "texto": "mediar os conflitos territoriais."}, {"letra": "D", "texto": "estimular a cooperação regional."}, {"letra": "E", "texto": "combater os governos autocráticos."}]', 'C', 'A promessa britânica de apoiar um lar judaico resguardando ao mesmo tempo os direitos dos árabes palestinos mostrou-se contraditória, culminando em conflitos territoriais que o Reino Unido não conseguiu mediar.', NULL, NULL, 'resumida', FALSE, FALSE, '9143a25540697899f8dc3e2920d3ec69be46496fb0e8ef15f80a9ece179e092b', 'enem-2023-dia1.txt'),
('ENEM', 'Filosofia', 'Filosofia da Educação e Ética (Paulo Freire)', 2023, '1º dia', 'INEP', 52, '52', 'humanas', 'facil', 'TEXTO I
Como presença consciente no mundo não posso escapar à responsabilidade ética no meu mover-me no mundo. Se sou puro produto da determinação genética ou cultural ou de classe, sou irresponsável pelo que faço no meu mover-me no mundo e, se careço de responsabilidade, não posso falar em ética.
(FREIRE, P. Pedagogia da autonomia. São Paulo: Paz e Terra, 1996.)

TEXTO II
Paulo Freire construiu uma pedagogia da esperança. Na sua concepção, a história não é algo pronto e acabado. As estruturas de opressão e as desigualdades, apesar de serem naturalizadas, são sócio e historicamente construídas. Daí a importância de os educandos tomarem consciência da sua realidade para, assim, transformá-la.
(DEMARCHI, J. L.)', 'Com base no conceito de ética pedagógica presente nos textos, os educandos tornam-se responsáveis pela', '[{"letra": "A", "texto": "participação sociopolítica."}, {"letra": "B", "texto": "definição estético-cultural."}, {"letra": "C", "texto": "competição econômica local."}, {"letra": "D", "texto": "manutenção do sistema escolar."}, {"letra": "E", "texto": "capacitação de mobilidade individual."}]', 'A', 'Para Paulo Freire, a tomada de consciência ética exige que o indivíduo compreenda as determinações históricas para atuar ativamente na transformação sociopolítica da realidade.', NULL, NULL, 'resumida', FALSE, FALSE, '46ac5b47bd16bf9fc6774b8b57b55b09423b0a7db7a08351016905b327c35f40', 'enem-2023-dia1.txt'),
('ENEM', 'Geografia', 'Geomorfologia e Tectônica de Placas (Himalaia)', 2023, '1º dia', 'INEP', 53, '53', 'humanas', 'facil', 'A Cordilheira do Himalaia tem mais de 50 milhões de anos, sendo classificada como a maior cordilheira do planeta. Originário da língua sânscrito, comum na região, seu nome quer dizer "morada da neve". É possível encontrar nessa cordilheira as quinze maiores montanhas do mundo. Ao todo, existem mais de cem picos, que contam com altitudes bem maiores que 7 000 m. O Everest, considerado o ponto mais alto da Terra, tem nada menos que 8 848 m de altitude, e continua crescendo, aproximadamente, 0,8 mm a cada ano.', 'Qual dinâmica natural é responsável pelo fenômeno apresentado?', '[{"letra": "A", "texto": "Derrame de lava vulcânica."}, {"letra": "B", "texto": "Encontro de placas tectônicas."}, {"letra": "C", "texto": "Ação do intemperismo químico."}, {"letra": "D", "texto": "Sedimentação de erosão eólica."}, {"letra": "E", "texto": "Derretimento de geleiras glaciais."}]', 'B', 'A formação e o crescimento contínuo da Cordilheira do Himalaia decorrem do choque convergente entre as placas tectônicas Indiana e Euroasiática (orogênese).', NULL, NULL, 'resumida', FALSE, FALSE, '8ac24488b283d341378d12a3864f2bceb4116d0d0330a6f2729a2554f59cfeef', 'enem-2023-dia1.txt'),
('ENEM', 'Filosofia', 'Dualismo Cartesiano e Fenomenologia do Corpo', 2023, '1º dia', 'INEP', 54, '54', 'humanas', 'dificil', 'Eu poderia concluir que a raiva é um pensamento, que estar com raiva é pensar que alguém é detestável, e que esse pensamento, como todos os outros assim como Descartes o mostrou, não poderia residir em nenhum fragmento de matéria. A raiva seria, portanto, espírito. Porém, quando me volto para minha própria experiência da raiva, devo confessar que ela não estava fora do meu corpo, mas inexplicavelmente nele.
(MERLEAU-PONTY, M. Quinta conversa: o homem visto de fora. São Paulo: Martins Fontes, 1948.)', 'No que se refere ao problema do corpo, a filosofia cartesiana apresenta-se como contraponto ao entendimento expresso no texto por', '[{"letra": "A", "texto": "apresentar uma visão dualista."}, {"letra": "B", "texto": "confirmar uma tese naturalista."}, {"letra": "C", "texto": "demonstrar uma premissa realista."}, {"letra": "D", "texto": "sustentar um argumento idealista."}, {"letra": "E", "texto": "defender uma posição intencionalista."}]', 'A', 'O pensamento cartesiano separa rigorosamente a mente/espírito (res cogitans) do corpo material (res extensa), visão dualista contestada pela experiência corporal integrada de Merleau-Ponty.', NULL, NULL, 'resumida', FALSE, FALSE, '584ed8577f742b7bc14c0f2817c2d3254e8d721819ff454f4a35ec43b1bfb732', 'enem-2023-dia1.txt'),
('ENEM', 'Filosofia', 'Escola de Frankfurt e Indústria Cultural (Adorno e Horkheimer)', 2023, '1º dia', 'INEP', 55, '55', 'humanas', 'medio', 'A diversão é o prolongamento do trabalho sob o capitalismo tardio. Ela é procurada por quem quer escapar ao processo de trabalho mecanizado para se pôr de novo em condições de enfrentá-lo. Mas, ao mesmo tempo, a mecanização atingiu um tal poderio sobre a pessoa em seu lazer e sobre a sua felicidade, ela determina tão profundamente a fabricação das mercadorias destinadas à diversão que essa pessoa não pode mais perceber outra coisa senão as cópias que reproduzem o próprio processo de trabalho.
(ADORNO, T.; HORKHEIMER, M. Dialética do esclarecimento. Rio de Janeiro: Zahar, 1997.)', 'No texto, o tempo livre é concebido como', '[{"letra": "A", "texto": "consumo de produtos culturais elaborados no mesmo sistema produtivo do capitalismo."}, {"letra": "B", "texto": "forma de realizar as diversas potencialidades da natureza humana."}, {"letra": "C", "texto": "alternativa para equilibrar tensões psicológicas do dia a dia."}, {"letra": "D", "texto": "promoção da satisfação de necessidades artificiais."}, {"letra": "E", "texto": "mecanismo de organização do ócio e do prazer."}]', 'A', 'Adorno e Horkheimer defendem que, na Indústria Cultural, o tempo de lazer é mercantilizado e estruturado segundo a mesma lógica de produção e alienação do trabalho fabril.', NULL, NULL, 'resumida', FALSE, FALSE, '08541f023c3914a6ed82eb1c1578d94df32270c8b0e5c2fef295cf893ffe905c', 'enem-2023-dia1.txt'),
('ENEM', 'Sociologia', 'Sociologia Política e Participação Cidadã', 2023, '1º dia', 'INEP', 56, '56', 'humanas', 'facil', '[DESCRIÇÃO DA IMAGEM: Tirinha de Laerte. Um personagem pensa: "EU QUERIA PODER. FORÇA? VISÃO DE RAIO X? TELECINESE? TELEPATIA?". No último quadrinho, o personagem conclui diante de um jornal: "PODER POLÍTICO."]', 'A charge ilustra um anseio presente na sociedade contemporânea, que se caracteriza pela', '[{"letra": "A", "texto": "situação de revolta individual."}, {"letra": "B", "texto": "satisfação de desejos pessoais."}, {"letra": "C", "texto": "participação em ações decisórias."}, {"letra": "D", "texto": "permanência em passividade social."}, {"letra": "E", "texto": "conivência em interesses partidários."}]', 'C', 'A tirinha de Laerte surpreende o leitor ao deslocar o desejo de superpoderes fantásticos para o anseio real de exercer o poder político e participar das decisões da sociedade.', 'Tirinha de Laerte. Um personagem pensa: "EU QUERIA PODER. FORÇA? VISÃO DE RAIO X? TELECINESE? TELEPATIA?". No último quadrinho, o personagem conclui diante de um jornal: "PODER POLÍTICO."', NULL, 'resumida', FALSE, FALSE, '1d5843cad6f1b518a6ddd440059e8d32a3dc4ee1cd367994addf90b5f8922dde', 'enem-2023-dia1.txt'),
('ENEM', 'Filosofia', 'Ética do Perdão e Autonomia (Paul Ricoeur)', 2023, '1º dia', 'INEP', 57, '57', 'humanas', 'medio', 'Quem se mete pelo caminho do pedido de perdão deve estar pronto a escutar uma palavra de recusa. Entrar na atmosfera do perdão é aceitar medir-se com a possibilidade sempre aberta do imperdoável. Perdão pedido não é perdão a que se tem direito [devido]. É com o preço destas reservas que a grandeza do perdão se manifesta.
(RICOEUR, P. O perdão pode curar.)', 'A reflexão sobre o perdão apresentada no texto encontra fundamento na(s)', '[{"letra": "A", "texto": "rejeição particular amparada pelo desejo de poder."}, {"letra": "B", "texto": "decisão subjetiva determinada pela vontade divina."}, {"letra": "C", "texto": "liberdade mitigada pela predestinação do espírito."}, {"letra": "D", "texto": "escolhas humanas definidas pelo conhecimento empírico."}, {"letra": "E", "texto": "relações interpessoais mediadas pela autonomia dos indivíduos."}]', 'E', 'Paul Ricoeur concebe o perdão como um ato ético interpessoal baseado na autonomia das partes, no qual a possibilidade da recusa reforça a liberdade e o valor do ato.', NULL, NULL, 'resumida', FALSE, FALSE, '34ca00813819ef783ea55869da5f4bbd418d72133e32f239fa7463d092218c42', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'Patrimônio e Tradição Cultural (Cavalgada de Sant''Ana)', 2023, '1º dia', 'INEP', 58, '58', 'humanas', 'facil', 'A Cavalgada de Sant''Ana é uma expressão da devoção dos vaqueiros à padroeira de Caicó (RN). Nas décadas de 1950 a 1970, esse evento, então denominado Cavalaria, era celebrado pelas pessoas que residiam na zona rural do município de Caicó. Essas pessoas usavam os animais (jegues, mulas e cavalos) como único meio de transporte, sobretudo para se dirigirem à cidade nos dias de feiras, trazendo seus produtos para comercializarem. Estando em Caicó no período da Festa de Sant''Ana, esses agricultores se organizavam em cavalgada até o pátio da Catedral de Sant''Ana para louvar a santa e receber bênção para seus animais. Por volta da década de 1970, com a chegada do automóvel à zona rural do município, essa expressão cultural foi extinta. O meio de transporte utilizando os animais passou a ser substituído por carros, sobretudo caminhonetes e caminhões, que transportavam os camponeses para a cidade em dias de feiras e festas. Desde 2002, um grupo de caicoenses retomou essa expressão cultural e, em conjunto com a associação dos vaqueiros, realiza no primeiro domingo da Festa a Cavalgada de Sant''Ana. O evento, além de contar com a participação dos cavaleiros que residem nas zonas rurais, atrai também pessoas que residem em Caicó, cidades vizinhas e amantes das vaquejadas.', 'As mudanças culturais mencionadas no texto caracterizam-se pela presença de', '[{"letra": "A", "texto": "elementos tradicionais e modernos em torno de uma crença religiosa."}, {"letra": "B", "texto": "argumentos teológicos e históricos em consequência de uma ordem papal."}, {"letra": "C", "texto": "fundamentos estéticos e etnográficos em função de uma cerimônia clerical."}, {"letra": "D", "texto": "práticas corporais e esportivas em decorrência de uma imposição eclesiástica."}, {"letra": "E", "texto": "discursos filosóficos e antropológicos em resultado de uma determinação paroquial."}]', 'A', 'A restauração da Cavalgada de Sant''Ana recombina manifestações tradicionais da fé camponesa com adaptações modernas do meio de transporte e do público urbano e rural.', NULL, NULL, 'resumida', FALSE, FALSE, '0a1f054e0ddd0ea74724495a6f72f0ccd0c7e07dda02332d6a639d0dc370ef21', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'História das Mentalidades e Costumes (O Uso do Garfo)', 2023, '1º dia', 'INEP', 59, '59', 'humanas', 'medio', 'Do século XVI em diante, pelo menos nas classes mais altas, o garfo passou a ser usado como utensílio para comer, chegando através da Itália primeiramente à França e, em seguida, à Inglaterra e à Alemanha, depois de ter servido, durante algum tempo, apenas para retirar alimentos sólidos da travessa. Henrique III introduziu-o na França, trazendo-o provavelmente de Veneza. Seus cortesãos não foram pouco ridicularizados por essa maneira "afetada" de comer e, no princípio, não eram muito hábeis no uso do utensílio: pelo menos se dizia que metade da comida caía do garfo no caminho do prato à boca. Em data tão recente como o século XVII, o garfo era ainda basicamente artigo de luxo, geralmente feito de prata ou ouro.
(ELIAS, N. O processo civilizador: uma história dos costumes. Rio de Janeiro: Zahar, 1994.)', 'O processo social relatado indica a formação de uma etiqueta que tem como princípio a', '[{"letra": "A", "texto": "distinção das classes sociais."}, {"letra": "B", "texto": "valorização de hábitos de higiene."}, {"letra": "C", "texto": "exaltação da cultura mediterrânea."}, {"letra": "D", "texto": "consagração de tradições medievais."}, {"letra": "E", "texto": "disseminação de produtos manufaturados."}]', 'A', 'Norbert Elias demonstra que a introdução do garfo na nobreza europeia servia primariamente como marca distintiva de classe, requinte e status em relação às camadas populares.', NULL, NULL, 'resumida', FALSE, FALSE, '5ca13340ce00e33b6d679f5244f0c6482ebf3d0c3ef2052427a13eb5980b8643', 'enem-2023-dia1.txt'),
('ENEM', 'Sociologia', 'Violência Patrimonial contra a Mulher (Lei Maria da Penha)', 2023, '1º dia', 'INEP', 60, '60', 'humanas', 'facil', 'Negar o pedido por dinheiro indispensável para necessidades pessoais ou comprar bens usando o nome da pessoa sem o consentimento dela. Ameaçar o corte de recursos dependendo de atitudes pessoais, esconder documentos ou trocar senhas do banco sem avisar. Ou, ainda, proibir a pessoa de trabalhar ou destruir seus pertences. As histórias são comuns, mas às vezes não são reconhecidas como abuso. Mas é uma das cinco formas de conduta contra a mulher previstas na Lei Maria da Penha.
(LEWGOY, J.)', 'O texto apresenta tipos de conduta sujeitos a punição, conforme previsto na Lei Maria da Penha, porque consistem em formas de', '[{"letra": "A", "texto": "ação difamatória."}, {"letra": "B", "texto": "desvio comportamental."}, {"letra": "C", "texto": "expressão preconceituosa."}, {"letra": "D", "texto": "violência patrimonial."}, {"letra": "E", "texto": "desentendimento matrimonial."}]', 'D', 'Atos de controle econômico, privação de recursos, destruição de objetos ou retenção de documentos de mulheres caracterizam legalmente a violência patrimonial prevista na Lei Maria da Penha.', NULL, NULL, 'resumida', FALSE, FALSE, 'a922c5ce0195c9c28aa077f792ffbcbab5ce97e176aeecb606506e2d8b203c90', 'enem-2023-dia1.txt'),
('ENEM', 'Sociologia', 'Precarização e Invisibilidade do Trabalho na Era Digital', 2023, '1º dia', 'INEP', 61, '61', 'humanas', 'facil', 'Por trás da "mágica" do Google Assistant de sua capacidade de interpretar 26 idiomas está uma enorme equipe de linguistas distribuídos globalmente, trabalhando como subcontratados, que devem rotular tediosamente os dados de treinamento para que funcione. Eles ganham baixos salários e são rotineiramente forçados a trabalhar horas extras não remuneradas. A inteligência artificial não funciona com um pozinho mágico. Ela funciona por meio de trabalhadores que treinam algoritmos incansavelmente até que eles automatizem seus próprios trabalhos.', 'O texto critica a mudança tecnológica em razão da seguinte consequência:', '[{"letra": "A", "texto": "Diversificação da função."}, {"letra": "B", "texto": "Mobilidade da população."}, {"letra": "C", "texto": "Autonomia do empregado."}, {"letra": "D", "texto": "Concentração da produção."}, {"letra": "E", "texto": "Invisibilidade do profissional."}]', 'E', 'O texto denuncia que as tecnologias de Inteligência Artificial dependem do trabalho precário e invisibilizado de milhares de pessoas que treinam os algoritmos em segundo plano.', NULL, NULL, 'resumida', FALSE, FALSE, '4f5d0c2657a1c8f31b824ae54934bb1db0e4a3a99cfd4ae1274bb02763afb20d', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'Guerra Fria e Conflito Koreano', 2023, '1º dia', 'INEP', 62, '62', 'humanas', 'facil', 'Enormes alto-falantes sul-coreanos instalados na fronteira com o Norte costumavam transmitir desde canções em estilo K-pop (como é chamado o pop sul-coreano) até boletins climáticos e noticiário crítico ao vizinho comunista. O Norte costuma praticar atividade semelhante, transmitindo por seus alto-falantes discursos críticos a Seul e aliados. Durante os anos 1980, o governo sul-coreano construiu um mastro de 97 metros de altura para hastear sua bandeira no povoado de Daesong-dong, na fronteira com o Norte. O Norte respondeu com a construção de um mastro ainda mais alto (160 m) na cidade fronteiriça de Gijung-dong. "Essas demonstrações são uma válvula de escape competitiva e importante entre os dois lados, fora de um possível conflito militar", diz o analista Ankit Panda.
(TAN, Y.)', 'Os atos de competição citados têm suas origens históricas vinculadas a um contexto de', '[{"letra": "A", "texto": "domínio cultural-identitário de atores sociais."}, {"letra": "B", "texto": "disputas étnico-raciais de povos tradicionais."}, {"letra": "C", "texto": "divergências político-ideológicas de agentes estatais."}, {"letra": "D", "texto": "imposição econômico-financeira de empresas privadas."}, {"letra": "E", "texto": "protestos ecológico-sustentáveis de entidades ambientais."}]', 'C', 'A "guerra de propaganda" com alto-falantes e mastros na fronteira coreana tem origem na divisão ideológica e política da Guerra Fria entre o Norte socialista e o Sul capitalista.', NULL, NULL, 'resumida', FALSE, FALSE, 'c5b946c25c013cdf5c7763a298aa89ff302fe0e5ed8ca335d7f23f3818b3ed69', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'História do Brasil Colônia e Arte Barroca (Chinesices)', 2023, '1º dia', 'INEP', 63, '63', 'humanas', 'medio', 'Seda, madeiras aromáticas e têxteis, obras de arte, lã, cristais e muitas, muitas peças de porcelana chegaram ao Brasil ao longo dos séculos XVII e XVIII. A opulência proporcionada pelo ouro fez com que esses itens fossem ainda mais presentes em cidades mineiras como Ouro Preto, Mariana e Sabará. Esses objetos inspiraram a criação das chinesices, termo que designa um tipo de arte que evoca motivos chineses, presentes em várias igrejas barrocas de Minas Gerais. No Brasil, é bem provável que a inspiração para as pinturas nas igrejas barrocas com pássaros, elefantes, tigres, mandarins e pagodes tenha sido tirada de gravuras, tecidos, móveis e, principalmente, das porcelanas chinesas que circulavam livremente em uma sociedade enriquecida pelo comércio do ouro e pedras preciosas.
(MARIUZZO, P.)', 'O desenvolvimento do processo artístico descrito no texto foi possível pelo(a)', '[{"letra": "A", "texto": "representação arquitetônica."}, {"letra": "B", "texto": "intercâmbio transcontinental."}, {"letra": "C", "texto": "dependência econômica."}, {"letra": "D", "texto": "intervenção estatal."}, {"letra": "E", "texto": "padrão estético."}]', 'B', 'A presença de temas asiáticos (chinesices) nas igrejas de Minas Gerais resultou das rotas comerciais globais do Império Português, que interconectavam Ásia, Europa e América.', NULL, NULL, 'resumida', FALSE, FALSE, 'e5aeb9b0303fba96a83484bfbdf9e47f7dc23d0a82873e9dc53590cfa00a9874', 'enem-2023-dia1.txt'),
('ENEM', 'Sociologia', 'Sociologia Ambiental e Ativismo Indígena', 2023, '1º dia', 'INEP', 64, '64', 'humanas', 'facil', 'Txai Suruí, liderança da Juventude Indígena, profere seu discurso na abertura da COP-26:
"O clima está esquentando, os animais estão desaparecendo, os rios estão morrendo e nossas plantações não florescem como no passado. A Terra está falando: ela nos diz que não temos mais tempo."
(VICK, M.)', 'O discurso da líder indígena explicita um problema global relacionado ao(à)', '[{"letra": "A", "texto": "manejo tradicional."}, {"letra": "B", "texto": "reciclagem residual."}, {"letra": "C", "texto": "consumo consciente."}, {"letra": "D", "texto": "exploração predatória."}, {"letra": "E", "texto": "reaproveitamento energético."}]', 'D', 'A denúncia de Txai Suruí na COP-26 volta-se contra o modelo de desenvolvimento predatório que devasta ecossistemas, acelera o aquecimento global e esgota os recursos naturais.', NULL, NULL, 'resumida', FALSE, FALSE, 'f7bb32e15304ea9af3e39636deb2ab0eb210ebebc80979725d6aabda912ce638', 'enem-2023-dia1.txt'),
('ENEM', 'História', 'História da Arquitetura e Relações de Gênero (Lina Bo Bardi)', 2023, '1º dia', 'INEP', 65, '65', 'humanas', 'facil', 'Nas reportagens publicadas sobre a inauguração do Museu de Arte de São Paulo, em 1947, quando ele ainda ocupava um edifício na rua Sete de Abril, Lina Bo Bardi não foi mencionada nenhuma vez. A arquiteta era responsável pelo projeto do museu que mudaria para sempre a posição de São Paulo no circuito mundial das artes. Mas não houve nenhum registro disso. O louvor se concentrou em seu marido e parceiro profissional, o respeitado crítico de arte Pietro Maria Bardi. Passados 75 anos, a mulher então ignorada recebeu um Leão de Ouro póstumo, a maior homenagem da Bienal de Arquitetura de Veneza, e tem agora sua história contada em duas biografias de peso, que procuram destrinchar uma carreira marcada pela ousadia e pela contradição.
(PORTO, W.)', 'As transformações pelas quais passaram as sociedades ocidentais e que possibilitaram o reconhecimento recente do trabalho da arquiteta mencionada no texto foram resultado das mobilizações sociais pela', '[{"letra": "A", "texto": "equidade de gênero."}, {"letra": "B", "texto": "liberdade de expressão."}, {"letra": "C", "texto": "admissibilidade de voto."}, {"letra": "D", "texto": "igualdade de oportunidade."}, {"letra": "E", "texto": "reciprocidade de tratamento."}]', 'A', 'A revisão do papel de Lina Bo Bardi é reflexo das lutas feministas e sociais do último século que exigem equidade e reconhecimento do trabalho intelectual e artístico das mulheres.', NULL, NULL, 'resumida', FALSE, FALSE, 'c6f25152a322ccd364a6c6703c5022e946fc9de1d185c4adcbc5dc35da05b110', 'enem-2023-dia1.txt'),
('ENEM', 'Sociologia', 'Desigualdade Social e Fome no Brasil', 2023, '1º dia', 'INEP', 66, '66', 'humanas', 'facil', 'TEXTO I
Como é horrível ver um filho comer e perguntar: "Tem mais?" Esta palavra "tem mais" fica oscilando dentro do cérebro de uma mãe que olha as panela e não tem mais.
(JESUS, C. M. Quarto de despejo: diário de uma favelada. São Paulo: Ática, 2014.)

TEXTO II
A experiência de ver os filhos com fome na década de 1950, descrita por Carolina, é vivida no Brasil de 2021 por uma moradora de Petrolândia, em Pernambuco. "Eu trabalhava de ajudante de cabeleireira, mas a moça que tinha o salão fechou. Eu vinha me sustentando com o auxílio que tinha, mas agora eu não fui contemplada. Às vezes as pessoas me ajudam com alimentos para os meus filhos. De vez em quando, eu acho algum bico para fazer, mas é muito raro. Tem dias que não tenho nem o leite da minha bebê."
(CARRANÇA, T.)', 'Considerando a realidade brasileira, os textos se aproximam ao apresentarem uma reflexão sobre o(a)', '[{"letra": "A", "texto": "recorrência da miséria."}, {"letra": "B", "texto": "planejamento da saúde."}, {"letra": "C", "texto": "superação da escassez."}, {"letra": "D", "texto": "constância da economia."}, {"letra": "E", "texto": "romantização da carência."}]', 'A', 'O paralelo entre os relatos de 1950 e 2021 demonstra a triste permanência e recorrência da extrema pobreza e da insegurança alimentar no cenário social brasileiro.', NULL, NULL, 'resumida', FALSE, FALSE, '06123300086767ce26f1d1f19af942620d5ab9fac6a84068ecae735696c27a47', 'enem-2023-dia1.txt');
-- ─── 1. Garante que as matérias existem ─────────────────────────────
INSERT INTO materias (nome, descricao, icone_emoji)
SELECT DISTINCT s.materia_nome, 'Importada do banco de questões oficial', '📚'
FROM stg_questoes s
WHERE s.materia_nome IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM materias m WHERE m.nome = s.materia_nome);

-- ─── 2. Garante que os assuntos existem ─────────────────────────────
INSERT INTO assuntos (materia_id, nome, ordem)
SELECT DISTINCT m.id, s.assunto_nome, 0
FROM stg_questoes s
JOIN materias m ON m.nome = s.materia_nome
WHERE s.assunto_nome IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM assuntos a
    WHERE a.materia_id = m.id AND a.nome = s.assunto_nome
  );

-- ─── 3. Vincula matéria ao concurso (alimenta os filtros da UI) ─────
INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT DISTINCT c.id, m.id
FROM stg_questoes s
JOIN concursos c ON c.sigla = s.concurso_sigla
JOIN materias  m ON m.nome  = s.materia_nome
WHERE NOT EXISTS (
  SELECT 1 FROM concurso_materias cm
  WHERE cm.concurso_id = c.id AND cm.materia_id = m.id
);

-- ─── 4. Insere as questões ──────────────────────────────────────────
INSERT INTO questoes (
  concurso_id, materia_id, assunto_id,
  enunciado, texto_base, alternativas, resposta_correta, explicacao,
  ano, banca, dificuldade, dia_prova, numero_ordem, numero_original,
  area_conhecimento, figura_descricao, resolucao_passos, resolucao_status,
  precisa_resolucao, anulada, hash_conteudo, arquivo_origem, ativa
)
SELECT
  c.id, m.id, a.id,
  s.enunciado, s.texto_base, s.alternativas, s.resposta_correta, s.explicacao,
  s.ano, s.banca, s.dificuldade::dificuldade_tipo, s.dia_prova,
  s.numero_ordem, s.numero_original, s.area_conhecimento, s.figura_descricao,
  s.resolucao_passos, s.resolucao_status, s.precisa_resolucao, s.anulada,
  s.hash_conteudo, s.arquivo_origem, TRUE
FROM stg_questoes s
JOIN concursos c ON c.sigla = s.concurso_sigla
JOIN materias  m ON m.nome  = s.materia_nome
JOIN assuntos  a ON a.materia_id = m.id AND a.nome = s.assunto_nome
WHERE s.resposta_correta IS NOT NULL
ON CONFLICT (hash_conteudo) DO NOTHING;

-- ─── 5. Registra a importação no armazém ────────────────────────────
INSERT INTO questao_importadas (hash_conteudo, questao_id, arquivo_origem, status)
SELECT s.hash_conteudo, q.id, s.arquivo_origem, 'aceita'::questao_importada_status
FROM stg_questoes s
JOIN questoes q ON q.hash_conteudo = s.hash_conteudo
WHERE NOT EXISTS (
  SELECT 1 FROM questao_importadas qi WHERE qi.hash_conteudo = s.hash_conteudo
);

COMMIT;

SELECT
  'ENEM — lote 3/5' AS seed,
  (SELECT COUNT(*) FROM questoes) AS total_questoes_no_banco;
