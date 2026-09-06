-- ============================================================================
-- BatCaverna — Seed do Banco de Questões: ENEM
-- Gerado automaticamente por scripts/gerar_seed_sql.py — NÃO EDITE À MÃO.
-- Questões neste arquivo: 57   |   Lote 5 de 5
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
('ENEM', 'Química', 'Eletroquímica / Potencial Padrão de Redução e Pilhas', 2025, '2º dia', NULL, 124, NULL, 'natureza', 'medio', 'Objetos de prata escurecem em contato com compostos contendo enxofre por causa da formação de uma fina camada de sulfeto de prata. Um método simples para clarear o objeto consiste em forrar um recipiente com papel alumínio, adicionar ao recipiente uma solução aquosa de cloreto de sódio e, enfim, mergulhar o objeto de prata enegrecido. Em cerca de três minutos, a prata volta à coloração original.
Semirreações e potenciais-padrão de redução:
Ag2S(s) + 2 e- -> 2 Ag(s) + S²-(aq) E° = -0,69 V
O2(g) + 4 H+(aq) + 4 e- -> 2 H2O(l) E° = +1,23 V
Al³+(aq) + 3 e- -> Al(s) E° = -1,68 V

Os valores das diferenças de potencial-padrão das reações que representam o escurecimento e o clareamento do objeto de prata são, respectivamente:

A) +0,54 V e +2,37 V
B) +1,92 V e +0,99 V
C) -0,15 V e +5,43 V
D) +2,61 V e +1,29 V
E) +0,15 V e -1,29 V', 'QUESTÃO 124

Objetos de prata escurecem em contato com compostos contendo enxofre por causa da formação de uma fina camada de sulfeto de prata. Um método simples para clarear o objeto consiste em forrar um recipiente com papel alumínio, adicionar ao recipiente uma solução aquosa de cloreto de sódio e, enfim, mergulhar o objeto de prata enegrecido. Em cerca de três minutos, a prata volta à coloração original.
Semirreações e potenciais-padrão de redução:
Ag2S(s) + 2 e- -> 2 Ag(s) + S²-(aq) E° = -0,69 V
O2(g) + 4 H+(aq) + 4 e- -> 2 H2O(l) E° = +1,23 V
Al³+(aq) + 3 e- -> Al(s) E° = -1,68 V

Os valores das diferenças de potencial-padrão das reações que representam o escurecimento e o clareamento do objeto de prata são, respectivamente:', '[{"letra": "A", "texto": "+0,54 V e +2,37 V"}, {"letra": "B", "texto": "+1,92 V e +0,99 V"}, {"letra": "C", "texto": "-0,15 V e +5,43 V"}, {"letra": "D", "texto": "+2,61 V e +1,29 V"}, {"letra": "E", "texto": "+0,15 V e -1,29 V"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'c32181ef6c3e7df67421c000fa13b475c26b6548461b0301f3eac5c1e88a9ecd', 'enem-2025-dia2.txt'),
('ENEM', 'Química', 'Estequiometria / Equação dos Gases Ideais e Rendimento', 2025, '2º dia', NULL, 125, NULL, 'natureza', 'medio', 'Apaixonada por culinária e química, uma chefe de cozinha calculou que, para promover o crescimento adequado da massa durante o cozimento de um bolo a 180 °C (453 K) e 1,00 atm, ela precisaria utilizar uma quantidade de fermento químico suficiente para produzir um volume de gás igual a 4,00 L. Com esse objetivo, ela escolheu utilizar o bicarbonato de amônio, um composto que, sob aquecimento, degrada-se em três gases distintos:
NH4HCO3(s) -> NH3(g) + CO2(g) + H2O(g)

Considere que a mistura dos gases se comporta como gás ideal e que o rendimento é de 80%.
Dados: Massa molar do NH4HCO3 = 79 g/mol e R = 0,082 atm.L/(mol.K).

A massa, em grama, de bicarbonato de amônio que ela deve utilizar é mais próxima de

A) 2,3 g.
B) 3,5 g.
C) 5,9 g.
D) 6,8 g.
E) 8,9 g.', 'QUESTÃO 125

Apaixonada por culinária e química, uma chefe de cozinha calculou que, para promover o crescimento adequado da massa durante o cozimento de um bolo a 180 °C (453 K) e 1,00 atm, ela precisaria utilizar uma quantidade de fermento químico suficiente para produzir um volume de gás igual a 4,00 L. Com esse objetivo, ela escolheu utilizar o bicarbonato de amônio, um composto que, sob aquecimento, degrada-se em três gases distintos:
NH4HCO3(s) -> NH3(g) + CO2(g) + H2O(g)

Considere que a mistura dos gases se comporta como gás ideal e que o rendimento é de 80%.
Dados: Massa molar do NH4HCO3 = 79 g/mol e R = 0,082 atm.L/(mol.K).

A massa, em grama, de bicarbonato de amônio que ela deve utilizar é mais próxima de', '[{"letra": "A", "texto": "2,3 g."}, {"letra": "B", "texto": "3,5 g."}, {"letra": "C", "texto": "5,9 g."}, {"letra": "D", "texto": "6,8 g."}, {"letra": "E", "texto": "8,9 g."}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '0ad233b40119aa9f0267eb26ee11b55c964fdaeefb7e77b530f413ebe8d3e6f9', 'enem-2025-dia2.txt'),
('ENEM', 'Física', 'Vetores / Composição de Movimentos e Velocidade Relativa', 2025, '2º dia', NULL, 126, NULL, 'natureza', 'medio', 'Segundo o princípio da independência dos movimentos, de Galileu, sempre que a velocidade resultante de um corpo puder ser decomposta em duas ou mais componentes perpendiculares entre si, cada um desses movimentos poderá ser analisado separadamente.
Considere um avião que, ao decolar, é instruído pela torre a atingir, em 6 minutos, uma posição de 20 km a Leste, 20 km a Norte e 1 km de altitude. No entanto, no instante da decolagem, começa a soprar um vento cujo vetor velocidade tem componentes 30 km/h para Leste, 20 km/h para Sul e 1 km/h de cima para baixo.

Durante a ação do vento, a velocidade v que o piloto deve estabelecer em relação ao ar para que o avião chegue à posição esperada no tempo indicado tem as componentes

A) 230 km/h para Leste, 180 km/h para Sul e 9 km/h para baixo.
B) 230 km/h para Leste, 180 km/h para Norte e 9 km/h para cima.
C) 200 km/h para Oeste, 200 km/h para Norte e 10 km/h para cima.
D) 170 km/h para Leste, 220 km/h para Norte e 11 km/h para cima.
E) 170 km/h para Leste, 180 km/h para Norte e 11 km/h para cima.', 'QUESTÃO 126

Segundo o princípio da independência dos movimentos, de Galileu, sempre que a velocidade resultante de um corpo puder ser decomposta em duas ou mais componentes perpendiculares entre si, cada um desses movimentos poderá ser analisado separadamente.
Considere um avião que, ao decolar, é instruído pela torre a atingir, em 6 minutos, uma posição de 20 km a Leste, 20 km a Norte e 1 km de altitude. No entanto, no instante da decolagem, começa a soprar um vento cujo vetor velocidade tem componentes 30 km/h para Leste, 20 km/h para Sul e 1 km/h de cima para baixo.

Durante a ação do vento, a velocidade v que o piloto deve estabelecer em relação ao ar para que o avião chegue à posição esperada no tempo indicado tem as componentes', '[{"letra": "A", "texto": "230 km/h para Leste, 180 km/h para Sul e 9 km/h para baixo."}, {"letra": "B", "texto": "230 km/h para Leste, 180 km/h para Norte e 9 km/h para cima."}, {"letra": "C", "texto": "200 km/h para Oeste, 200 km/h para Norte e 10 km/h para cima."}, {"letra": "D", "texto": "170 km/h para Leste, 220 km/h para Norte e 11 km/h para cima."}, {"letra": "E", "texto": "170 km/h para Leste, 180 km/h para Norte e 11 km/h para cima."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'b5e744848ce8781d2a4db044b42d5da7e19b472d7b0aaf96d9ce3f9a3c797760', 'enem-2025-dia2.txt'),
('ENEM', 'Química', 'Cinética Química / Catalisadores e Energia de Ativação', 2025, '2º dia', NULL, 127, NULL, 'natureza', 'medio', 'Uma reação A -> B é realizada na presença e na ausência de uma enzima, com todas as demais condições permanecendo inalteradas. Considere que, no gráfico da variação de energia ao longo dessa reação, a linha contínua representa o avanço da reação na ausência da enzima, e a linha pontilhada, na presença da enzima.

O gráfico que representa a situação descrita é aquele em que:

A) A linha pontilhada possui maior energia de ativação.
B) A linha pontilhada altera a energia final do produto B.
C) A linha pontilhada possui uma barreira de energia de ativação menor que a contínua, mantendo os níveis de A e B.
D) A linha pontilhada possui maior pico que a contínua.
E) A linha pontilhada altera o nível inicial do reagente A.', 'QUESTÃO 127

Uma reação A -> B é realizada na presença e na ausência de uma enzima, com todas as demais condições permanecendo inalteradas. Considere que, no gráfico da variação de energia ao longo dessa reação, a linha contínua representa o avanço da reação na ausência da enzima, e a linha pontilhada, na presença da enzima.

O gráfico que representa a situação descrita é aquele em que:', '[{"letra": "A", "texto": "A linha pontilhada possui maior energia de ativação."}, {"letra": "B", "texto": "A linha pontilhada altera a energia final do produto B."}, {"letra": "C", "texto": "A linha pontilhada possui uma barreira de energia de ativação menor que a contínua, mantendo os níveis de A e B."}, {"letra": "D", "texto": "A linha pontilhada possui maior pico que a contínua."}, {"letra": "E", "texto": "A linha pontilhada altera o nível inicial do reagente A."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '096f9896d32a534464cdde9b7ce71deb806739948d0545d2d3c06522eaf80ebe', 'enem-2025-dia2.txt'),
('ENEM', 'Física', 'Termometria / Sensibilidade de Sensores de Temperatura', 2025, '2º dia', NULL, 128, NULL, 'natureza', 'medio', 'Para um sensor feito de platina, a relação entre a resistência e a temperatura pode ser descrita por uma equação do tipo R(T) = A + B.T, em que T é a temperatura e A e B são constantes. O gráfico apresenta a dependência da resistência em função da temperatura para cinco diferentes sensores (Sensor 1 ao Sensor 5).

Os sensores que apresentam maior sensibilidade (maior variação de resistência por unidade de temperatura) são

A) 1 e 2.
B) 1 e 3.
C) 2 e 3.
D) 2 e 4.
E) 2 e 5.', 'QUESTÃO 128

Para um sensor feito de platina, a relação entre a resistência e a temperatura pode ser descrita por uma equação do tipo R(T) = A + B.T, em que T é a temperatura e A e B são constantes. O gráfico apresenta a dependência da resistência em função da temperatura para cinco diferentes sensores (Sensor 1 ao Sensor 5).

Os sensores que apresentam maior sensibilidade (maior variação de resistência por unidade de temperatura) são', '[{"letra": "A", "texto": "1 e 2."}, {"letra": "B", "texto": "1 e 3."}, {"letra": "C", "texto": "2 e 3."}, {"letra": "D", "texto": "2 e 4."}, {"letra": "E", "texto": "2 e 5."}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '7594e3b0175542121b594851a38629960850f4530ba19901561a636ea3216279', 'enem-2025-dia2.txt'),
('ENEM', 'Biologia', 'Saúde Pública / Doenças Parasitárias e Vetores', 2025, '2º dia', NULL, 129, NULL, 'natureza', 'medio', 'O ácido úsnico é retirado de liquens e foi testado contra diversas espécies:
- Aedes aegypti (larvas): Baixa eficiência
- Bacilo de Koch: Média eficiência
- Moluscos aquáticos (adultos): Alta eficiência
- Pernilongo (larvas): Média eficiência
- Vermes platelmintos: Ineficiente

O ácido úsnico mostrou-se mais indicado para o controle da

A) esquistossomose.
B) febre amarela.
C) coqueluche.
D) tuberculose.
E) dengue.', 'QUESTÃO 129

O ácido úsnico é retirado de liquens e foi testado contra diversas espécies:
- Aedes aegypti (larvas): Baixa eficiência
- Bacilo de Koch: Média eficiência
- Moluscos aquáticos (adultos): Alta eficiência
- Pernilongo (larvas): Média eficiência
- Vermes platelmintos: Ineficiente

O ácido úsnico mostrou-se mais indicado para o controle da', '[{"letra": "A", "texto": "esquistossomose."}, {"letra": "B", "texto": "febre amarela."}, {"letra": "C", "texto": "coqueluche."}, {"letra": "D", "texto": "tuberculose."}, {"letra": "E", "texto": "dengue."}]', 'A', NULL, NULL, NULL, 'pendente', FALSE, FALSE, 'ade8a5a2984aabaeb1bcb8e56996e80dab8fd776c97e92d60939c19e35690d52', 'enem-2025-dia2.txt'),
('ENEM', 'Física', 'Eletrodinâmica / Divisor de Tensão e Associação de Resistores', 2025, '2º dia', NULL, 130, NULL, 'natureza', 'medio', 'Considere um equipamento de resistência elétrica Rc que funciona corretamente apenas em um dado valor de tensão. Porém, a única fonte de alimentação disponível fornece uma tensão 20% superior à tensão recomendada. Para adaptar essa fonte ao aparelho, a associação de um resistor de proteção Rp se faz necessária.

A configuração adequada do circuito e o valor do resistor de proteção, em relação ao valor da resistência do equipamento, são:

A) Paralelo com Rp = 0,2 Rc
B) Paralelo com Rp = 1,2 Rc
C) Série com Rp = 1,2 Rc
D) Série com Rp = 2,2 Rc
E) Série com Rp = 0,2 Rc', 'QUESTÃO 130

Considere um equipamento de resistência elétrica Rc que funciona corretamente apenas em um dado valor de tensão. Porém, a única fonte de alimentação disponível fornece uma tensão 20% superior à tensão recomendada. Para adaptar essa fonte ao aparelho, a associação de um resistor de proteção Rp se faz necessária.

A configuração adequada do circuito e o valor do resistor de proteção, em relação ao valor da resistência do equipamento, são:', '[{"letra": "A", "texto": "Paralelo com Rp = 0,2 Rc"}, {"letra": "B", "texto": "Paralelo com Rp = 1,2 Rc"}, {"letra": "C", "texto": "Série com Rp = 1,2 Rc"}, {"letra": "D", "texto": "Série com Rp = 2,2 Rc"}, {"letra": "E", "texto": "Série com Rp = 0,2 Rc"}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'fbca49ecbf65e53af5cd0b613ce87c1a3dd23696182538869c88ae2ebc6b5935', 'enem-2025-dia2.txt'),
('ENEM', 'Química', 'Estequiometria / Redução Aluminotérmica', 2025, '2º dia', NULL, 131, NULL, 'natureza', 'medio', 'O processo utilizado na produção do nióbio (massa molar 93 g/mol) é a redução aluminotérmica de Nb2O5 com excesso de 10% de Al (massa molar 27 g/mol), em relação à quantidade estequiométrica:
3 Nb2O5(s) + 10 Al(s) -> 6 Nb(s) + 5 Al2O3(s)

Uma engenheira estimou a massa de alumínio necessária para produzir 9,3 kg de nióbio nas condições descritas com rendimento de 100%.

A massa de alumínio, em quilograma, estimada pela engenheira é mais próxima de

A) 2,7 kg.
B) 3,0 kg.
C) 4,1 kg.
D) 4,5 kg.
E) 5,0 kg.', 'QUESTÃO 131

O processo utilizado na produção do nióbio (massa molar 93 g/mol) é a redução aluminotérmica de Nb2O5 com excesso de 10% de Al (massa molar 27 g/mol), em relação à quantidade estequiométrica:
3 Nb2O5(s) + 10 Al(s) -> 6 Nb(s) + 5 Al2O3(s)

Uma engenheira estimou a massa de alumínio necessária para produzir 9,3 kg de nióbio nas condições descritas com rendimento de 100%.

A massa de alumínio, em quilograma, estimada pela engenheira é mais próxima de', '[{"letra": "A", "texto": "2,7 kg."}, {"letra": "B", "texto": "3,0 kg."}, {"letra": "C", "texto": "4,1 kg."}, {"letra": "D", "texto": "4,5 kg."}, {"letra": "E", "texto": "5,0 kg."}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '9da0c631198b446d6ec555fdf677ed0534b0974e4a102aa9c46685ca036b2ebc', 'enem-2025-dia2.txt'),
('ENEM', 'Física', 'Ondulatória / Nível Sonoro em Decibéis', 2025, '2º dia', NULL, 132, NULL, 'natureza', 'medio', 'O nível sonoro, em decibel (dB), é calculado pela expressão n = 10 log10(I / I0).
O valor médio do ruído sonoro produzido por uma pessoa gritando "gol" na arquibancada de um estádio foi de 100 dB. Com esse dado, estimou-se o ruído sonoro produzido por 10 000 pessoas, distribuídas aleatoriamente, enquanto gritavam simultaneamente a palavra "gol".

O valor médio estimado para o ruído produzido por essas pessoas é de

A) 60 dB.
B) 104 dB.
C) 140 dB.
D) 400 dB.
E) 800 dB.', 'QUESTÃO 132

O nível sonoro, em decibel (dB), é calculado pela expressão n = 10 log10(I / I0).
O valor médio do ruído sonoro produzido por uma pessoa gritando "gol" na arquibancada de um estádio foi de 100 dB. Com esse dado, estimou-se o ruído sonoro produzido por 10 000 pessoas, distribuídas aleatoriamente, enquanto gritavam simultaneamente a palavra "gol".

O valor médio estimado para o ruído produzido por essas pessoas é de', '[{"letra": "A", "texto": "60 dB."}, {"letra": "B", "texto": "104 dB."}, {"letra": "C", "texto": "140 dB."}, {"letra": "D", "texto": "400 dB."}, {"letra": "E", "texto": "800 dB."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '7c0608e2d09b25559cdb4de70e75dfd2badd75d7e225198af3bf0fe60b8325ba', 'enem-2025-dia2.txt'),
('ENEM', 'Química', 'Química Orgânica / Interações Intermoleculares e Separação de Óleo', 2025, '2º dia', NULL, 133, NULL, 'natureza', 'medio', 'Pesquisadores desenvolveram um filtro capaz de separar óleo e água. O dispositivo é montado sobre uma malha de aço com uma sequência de camadas:
1ª camada: Polímero de carga positiva.
2ª camada: Nanopartículas de sílica (SiO2).
3ª camada: Mesmo polímero positivo.
4ª camada (superfície): Surfactante com cadeias fluoradas oleofóbicas/hidrofóbicas.

Na utilização desse dispositivo, a retenção do óleo ocorre

A) no surfactante.
B) na camada superior de polímero.
C) nas nanopartículas de sílica.
D) na camada inferior de polímero.
E) na malha de aço.', 'QUESTÃO 133

Pesquisadores desenvolveram um filtro capaz de separar óleo e água. O dispositivo é montado sobre uma malha de aço com uma sequência de camadas:
1ª camada: Polímero de carga positiva.
2ª camada: Nanopartículas de sílica (SiO2).
3ª camada: Mesmo polímero positivo.
4ª camada (superfície): Surfactante com cadeias fluoradas oleofóbicas/hidrofóbicas.

Na utilização desse dispositivo, a retenção do óleo ocorre', '[{"letra": "A", "texto": "no surfactante."}, {"letra": "B", "texto": "na camada superior de polímero."}, {"letra": "C", "texto": "nas nanopartículas de sílica."}, {"letra": "D", "texto": "na camada inferior de polímero."}, {"letra": "E", "texto": "na malha de aço."}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'f038395d310d69f66fa8f803ad89bda7c5ed1553d18c1c9abd72be9737336b21', 'enem-2025-dia2.txt'),
('ENEM', 'Química', 'Química Orgânica / Polaridade e Solubilidade em Água', 2025, '2º dia', NULL, 134, NULL, 'natureza', 'medio', 'Alguns hormônios sexuais apresentam baixa polaridade e solubilidade pequena e variável em água. As estruturas apresentadas são:
- Estradiol (2 grupos OH)
- Estriol (3 grupos OH)
- Estrona (1 grupo OH e 1 carbonila)
- Novestrol (2 grupos OH e 1 grupo alcino)
- Noretindrona (1 grupo OH, 1 carbonila e 1 grupo alcino)

Do ponto de vista das interações químicas, qual desses hormônios apresenta maior solubilidade em ambientes aquáticos?

A) Estradiol.
B) Estriol.
C) Estrona.
D) Novestrol.
E) Noretindrona.', 'QUESTÃO 134

Alguns hormônios sexuais apresentam baixa polaridade e solubilidade pequena e variável em água. As estruturas apresentadas são:
- Estradiol (2 grupos OH)
- Estriol (3 grupos OH)
- Estrona (1 grupo OH e 1 carbonila)
- Novestrol (2 grupos OH e 1 grupo alcino)
- Noretindrona (1 grupo OH, 1 carbonila e 1 grupo alcino)

Do ponto de vista das interações químicas, qual desses hormônios apresenta maior solubilidade em ambientes aquáticos?', '[{"letra": "A", "texto": "Estradiol."}, {"letra": "B", "texto": "Estriol."}, {"letra": "C", "texto": "Estrona."}, {"letra": "D", "texto": "Novestrol."}, {"letra": "E", "texto": "Noretindrona."}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '15205813ac6f2d0441e93e5ed74d1718864add73607ee0b4d993c9ef2507cb73', 'enem-2025-dia2.txt'),
('ENEM', 'Física', 'Ondulatória / Espectro Eletromagnético e Frequência', 2025, '2º dia', NULL, 135, NULL, 'natureza', 'medio', 'No tratamento de fototerapia com LEDs azuis, utiliza-se um sensor com fotoluminescência que altera sua emissão de vermelho-laranja (~600 nm) para verde com o tempo. A frequência da luz emitida pelo sensor AUMENTA em função do tempo de exposição.

O gráfico de fotoluminescência no início e no final do tratamento mostra que o pico no final do tratamento deve estar posicionado em relação ao início:

A) Deslocado para comprimentos de onda menores (à esquerda de 600 nm).
B) Deslocado para comprimentos de onda maiores (à direita de 600 nm).
C) Com a mesma posição e maior intensidade.
D) Com a mesma posição e menor intensidade.
E) Com dois picos simétricos em relação a 600 nm.', 'QUESTÃO 135

No tratamento de fototerapia com LEDs azuis, utiliza-se um sensor com fotoluminescência que altera sua emissão de vermelho-laranja (~600 nm) para verde com o tempo. A frequência da luz emitida pelo sensor AUMENTA em função do tempo de exposição.

O gráfico de fotoluminescência no início e no final do tratamento mostra que o pico no final do tratamento deve estar posicionado em relação ao início:', '[{"letra": "A", "texto": "Deslocado para comprimentos de onda menores (à esquerda de 600 nm)."}, {"letra": "B", "texto": "Deslocado para comprimentos de onda maiores (à direita de 600 nm)."}, {"letra": "C", "texto": "Com a mesma posição e maior intensidade."}, {"letra": "D", "texto": "Com a mesma posição e menor intensidade."}, {"letra": "E", "texto": "Com dois picos simétricos em relação a 600 nm."}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '466667b9de9d19a11c9febf969ca5c0697f8e72374fb34eefd09de4d4d8cc7e2', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Aritmética / Razão e Proporção', 2025, '2º dia', NULL, 136, NULL, 'matematica', 'medio', 'Uma pessoa pretende instalar um kit de gás natural veicular (GNV) em seu carro. Na loja, havia cinco modelos de cilindro de capacidades: 10 m³, 14 m³, 17 m³, 21 m³ e 25 m³. O preço é proporcional à capacidade. Esse carro rodará 30 km diariamente, 7 dias por semana, e o consumo do GNV é de 1 m³ a cada 13 km rodados. A pessoa escolherá o modelo de cilindro de menor preço que garanta apenas um abastecimento semanal.

Nessas condições, qual será a capacidade, em metro cúbico, do cilindro escolhido?

A) 10
B) 14
C) 17
D) 21
E) 25', 'QUESTÃO 136

Uma pessoa pretende instalar um kit de gás natural veicular (GNV) em seu carro. Na loja, havia cinco modelos de cilindro de capacidades: 10 m³, 14 m³, 17 m³, 21 m³ e 25 m³. O preço é proporcional à capacidade. Esse carro rodará 30 km diariamente, 7 dias por semana, e o consumo do GNV é de 1 m³ a cada 13 km rodados. A pessoa escolherá o modelo de cilindro de menor preço que garanta apenas um abastecimento semanal.

Nessas condições, qual será a capacidade, em metro cúbico, do cilindro escolhido?', '[{"letra": "A", "texto": "10"}, {"letra": "B", "texto": "14"}, {"letra": "C", "texto": "17"}, {"letra": "D", "texto": "21"}, {"letra": "E", "texto": "25"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '3fd6c7e433a94ac039ebe28b3dd04d98018a87069af51c62cb8f8f05306ab0f0', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Probabilidade / Porcentagem e Análise de Dados', 2025, '2º dia', NULL, 137, NULL, 'matematica', 'medio', 'Segundo dados de uma reportagem:
- 90% dos internautas brasileiros acessam redes sociais.
- Desses que acessam redes sociais, 60% são mulheres (e 40% são homens).

Ao se escolher aleatoriamente um internauta brasileiro, a probabilidade de ele ser um homem que acessa alguma rede social é

A) 30/90
B) 36/100
C) 40/100
D) 40/90
E) 46/90', 'QUESTÃO 137

Segundo dados de uma reportagem:
- 90% dos internautas brasileiros acessam redes sociais.
- Desses que acessam redes sociais, 60% são mulheres (e 40% são homens).

Ao se escolher aleatoriamente um internauta brasileiro, a probabilidade de ele ser um homem que acessa alguma rede social é', '[{"letra": "A", "texto": "30/90"}, {"letra": "B", "texto": "36/100"}, {"letra": "C", "texto": "40/100"}, {"letra": "D", "texto": "40/90"}, {"letra": "E", "texto": "46/90"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '4e3965cabb10d95bb9ad19469d4f699a7a8045de77339d36144a866b81174b19', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Projeções Ortogonais em Eixos 3D', 2025, '2º dia', NULL, 138, NULL, 'matematica', 'medio', 'Um cubo posicionado em um sistema cartesiano 3D aproxima-se 3 unidades do plano yz, afasta-se 5 unidades do plano xz e aproxima-se 4 unidades do plano xy.

A figura que apresenta as projeções ortogonais desse cubo sobre os três planos coordenados após os deslocamentos corresponde à alternativa:

A) Figura A
B) Figura B
C) Figura C
D) Figura D
E) Figura E', 'QUESTÃO 138

Um cubo posicionado em um sistema cartesiano 3D aproxima-se 3 unidades do plano yz, afasta-se 5 unidades do plano xz e aproxima-se 4 unidades do plano xy.

A figura que apresenta as projeções ortogonais desse cubo sobre os três planos coordenados após os deslocamentos corresponde à alternativa:', '[{"letra": "A", "texto": "Figura A"}, {"letra": "B", "texto": "Figura B"}, {"letra": "C", "texto": "Figura C"}, {"letra": "D", "texto": "Figura D"}, {"letra": "E", "texto": "Figura E"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '16c5c6f060807cfa54126a825f18d8304525679330e0ef699c0e0947530f24fd', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Comprimento de Circunferência', 2025, '2º dia', NULL, 139, NULL, 'matematica', 'medio', 'No entorno de uma lagoa circular de raio 1 km (1000 m), há uma ciclovia. Policiais serão alocados para cobrir a ciclovia. Um ponto é protegido se houver pelo menos um policial a, no máximo, 200 m de distância daquele ponto sobre a pista (cada policial protege um trecho total de 400 m).
Utilize 3 como aproximação para pi.

A quantidade mínima necessária de policiais alocados para proteger toda a ciclovia é

A) 4.
B) 8.
C) 15.
D) 30.
E) 60.', 'QUESTÃO 139

No entorno de uma lagoa circular de raio 1 km (1000 m), há uma ciclovia. Policiais serão alocados para cobrir a ciclovia. Um ponto é protegido se houver pelo menos um policial a, no máximo, 200 m de distância daquele ponto sobre a pista (cada policial protege um trecho total de 400 m).
Utilize 3 como aproximação para pi.

A quantidade mínima necessária de policiais alocados para proteger toda a ciclovia é', '[{"letra": "A", "texto": "4."}, {"letra": "B", "texto": "8."}, {"letra": "C", "texto": "15."}, {"letra": "D", "texto": "30."}, {"letra": "E", "texto": "60."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '84db6d8b424740522794253c983ee6e5c96db2c08a8eec59af4fe2101959a57a', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Porcentagem / Equação de Concentração e Misturas', 2025, '2º dia', NULL, 140, NULL, 'matematica', 'medio', 'Em um laboratório, um recipiente contém 10 litros de uma solução composta apenas pelas substâncias S1 e S2. Nessa solução, 99,95% é de S1. Uma quantidade de S1 será retirada dessa solução, mantendo a quantidade inicial de S2, de modo que 99,90% da nova solução seja de S1.

Qual é a quantidade de S1, em litro, que será retirada?

A) 0,0050
B) 0,0100
C) 0,5000
D) 4,9775
E) 5,0000', 'QUESTÃO 140

Em um laboratório, um recipiente contém 10 litros de uma solução composta apenas pelas substâncias S1 e S2. Nessa solução, 99,95% é de S1. Uma quantidade de S1 será retirada dessa solução, mantendo a quantidade inicial de S2, de modo que 99,90% da nova solução seja de S1.

Qual é a quantidade de S1, em litro, que será retirada?', '[{"letra": "A", "texto": "0,0050"}, {"letra": "B", "texto": "0,0100"}, {"letra": "C", "texto": "0,5000"}, {"letra": "D", "texto": "4,9775"}, {"letra": "E", "texto": "5,0000"}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '92e0a7239f969e6504426449cb009d47b9a346ecfaacfb19517e9b80f4d7b328', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Álgebra / Equação do 1º Grau e Perdas Fixas', 2025, '2º dia', NULL, 141, NULL, 'matematica', 'medio', 'Um posto encomendou 10 000 litros de gasolina. A distribuidora enviou 10 200 litros considerando o volume descartado no transporte, mas a quantidade entregue foi de 9 900 litros. Esse volume descartado independe da quantidade transportada.
Em um novo pedido, o posto solicitou o dobro do volume encomendado anteriormente (20 000 litros).

Utilizando o mesmo caminhão, qual é o volume mínimo de gasolina, em litro, que a distribuidora deverá enviar para garantir a entrega exata encomendada?

A) 20 100
B) 20 200
C) 20 300
D) 20 400
E) 20 600', 'QUESTÃO 141

Um posto encomendou 10 000 litros de gasolina. A distribuidora enviou 10 200 litros considerando o volume descartado no transporte, mas a quantidade entregue foi de 9 900 litros. Esse volume descartado independe da quantidade transportada.
Em um novo pedido, o posto solicitou o dobro do volume encomendado anteriormente (20 000 litros).

Utilizando o mesmo caminhão, qual é o volume mínimo de gasolina, em litro, que a distribuidora deverá enviar para garantir a entrega exata encomendada?', '[{"letra": "A", "texto": "20 100"}, {"letra": "B", "texto": "20 200"}, {"letra": "C", "texto": "20 300"}, {"letra": "D", "texto": "20 400"}, {"letra": "E", "texto": "20 600"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'ead02723ca8f26ddf90391cbbb02e4d1c6ee8bcf322351fdca09c181e8e18885', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Estatística / Mediana', 2025, '2º dia', NULL, 142, NULL, 'matematica', 'medio', 'A velocidade de referência de conexões de internet em dez cidades (em MB/s) é:
C1: 390, C2: 380, C3: 320, C4: 390, C5: 340, C6: 380, C7: 390, C8: 400, C9: 350, C10: 360.

A velocidade de referência padrão adotada, correspondente à mediana desse conjunto de valores, é

A) 360.
B) 370.
C) 380.
D) 390.
E) 400.', 'QUESTÃO 142

A velocidade de referência de conexões de internet em dez cidades (em MB/s) é:
C1: 390, C2: 380, C3: 320, C4: 390, C5: 340, C6: 380, C7: 390, C8: 400, C9: 350, C10: 360.

A velocidade de referência padrão adotada, correspondente à mediana desse conjunto de valores, é', '[{"letra": "A", "texto": "360."}, {"letra": "B", "texto": "370."}, {"letra": "C", "texto": "380."}, {"letra": "D", "texto": "390."}, {"letra": "E", "texto": "400."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '391c2ca2a5245e0eded14201169da04d61376613b9437b5c8469413098ef140c', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Aritmética / Multiplicação e Comparação de Dados', 2025, '2º dia', NULL, 143, NULL, 'matematica', 'medio', 'Informações de sódio por pacote de cinco alimentos:
- Batata chips: Pacote com 3 porções de 50 g | 170 mg de sódio por porção
- Palitos salgados: Pacote com 4 porções de 20 g | 501 mg de sódio por porção
- Biscoito multigrãos: Pacote com 8 porções de 25 g | 264 mg de sódio por porção
- Biscoito de polvilho: Pacote com 6 porções de 15 g | 175 mg de sódio por porção
- Biscoito de água e sal: Pacote com 5 porções de 40 g | 166 mg de sódio por porção

A estudante opta pelo alimento com a menor quantidade total de sódio por pacote. O produto escolhido é:

A) Batata chips.
B) Palitos salgados.
C) Biscoito multigrãos.
D) Biscoito de polvilho.
E) Biscoito de água e sal.', 'QUESTÃO 143

Informações de sódio por pacote de cinco alimentos:
- Batata chips: Pacote com 3 porções de 50 g | 170 mg de sódio por porção
- Palitos salgados: Pacote com 4 porções de 20 g | 501 mg de sódio por porção
- Biscoito multigrãos: Pacote com 8 porções de 25 g | 264 mg de sódio por porção
- Biscoito de polvilho: Pacote com 6 porções de 15 g | 175 mg de sódio por porção
- Biscoito de água e sal: Pacote com 5 porções de 40 g | 166 mg de sódio por porção

A estudante opta pelo alimento com a menor quantidade total de sódio por pacote. O produto escolhido é:', '[{"letra": "A", "texto": "Batata chips."}, {"letra": "B", "texto": "Palitos salgados."}, {"letra": "C", "texto": "Biscoito multigrãos."}, {"letra": "D", "texto": "Biscoito de polvilho."}, {"letra": "E", "texto": "Biscoito de água e sal."}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '14a34a6724de0cf256831557edc3e7dd63f26aa1627d6f86fa8c6277de8647aa', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Faces e Simetria de Poliedros', 2025, '2º dia', NULL, 144, NULL, 'matematica', 'medio', 'Um protótipo de peça tem a forma de um poliedro convexo obtido pela junção de um prisma hexagonal regular reto com um tronco de pirâmide hexagonal reta (com a base maior do tronco coincidindo com a base do prisma).
Faces congruentes entre si serão pintadas com a mesma cor, e não congruentes com cores distintas.

Qual é a quantidade de cores utilizadas para pintar a superfície externa do protótipo?

A) 9
B) 8
C) 4
D) 3
E) 2', 'QUESTÃO 144

Um protótipo de peça tem a forma de um poliedro convexo obtido pela junção de um prisma hexagonal regular reto com um tronco de pirâmide hexagonal reta (com a base maior do tronco coincidindo com a base do prisma).
Faces congruentes entre si serão pintadas com a mesma cor, e não congruentes com cores distintas.

Qual é a quantidade de cores utilizadas para pintar a superfície externa do protótipo?', '[{"letra": "A", "texto": "9"}, {"letra": "B", "texto": "8"}, {"letra": "C", "texto": "4"}, {"letra": "D", "texto": "3"}, {"letra": "E", "texto": "2"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '659acc3a88163495c17e437115f9701ffb70845b84390bc2c814945dbfa8658a', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Funções / Análise Gráfica de Variáveis', 2025, '2º dia', NULL, 145, NULL, 'matematica', 'medio', 'O gráfico apresenta a relação da frequência respiratória (rpm) em relação ao tempo t de um praticante de meditação: no instante t1 inicia-se a prática meditativa, e a frequência reduz progressivamente até o instante t2, a partir do qual se estabiliza no valor f2.

A partir do instante t1, o comportamento da frequência respiratória em relação ao tempo

A) mantém-se constante.
B) é diretamente proporcional ao tempo.
C) é inversamente proporcional ao tempo.
D) diminui até o instante t2 a partir do qual se torna constante.
E) diminui de forma proporcional ao tempo entre t1 e t2 e após t2.', 'QUESTÃO 145

O gráfico apresenta a relação da frequência respiratória (rpm) em relação ao tempo t de um praticante de meditação: no instante t1 inicia-se a prática meditativa, e a frequência reduz progressivamente até o instante t2, a partir do qual se estabiliza no valor f2.

A partir do instante t1, o comportamento da frequência respiratória em relação ao tempo', '[{"letra": "A", "texto": "mantém-se constante."}, {"letra": "B", "texto": "é diretamente proporcional ao tempo."}, {"letra": "C", "texto": "é inversamente proporcional ao tempo."}, {"letra": "D", "texto": "diminui até o instante t2 a partir do qual se torna constante."}, {"letra": "E", "texto": "diminui de forma proporcional ao tempo entre t1 e t2 e após t2."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'fd1b9698e5d2f9b3acefb6d8c7da6486b0e6682bb9a5b41416de2ce5f79e7080', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Aritmética / Subtração com Números Decimais', 2025, '2º dia', NULL, 146, NULL, 'matematica', 'medio', 'Marca de referência nos 100 metros rasos: 10,00 segundos. Recorde mundial de Usain Bolt em 2009: 9,58 segundos.

Qual é a diferença, em segundo, entre a marca de referência e a marca de Usain Bolt?

A) 0,02
B) 0,04
C) 0,38
D) 0,42
E) 0,52', 'QUESTÃO 146

Marca de referência nos 100 metros rasos: 10,00 segundos. Recorde mundial de Usain Bolt em 2009: 9,58 segundos.

Qual é a diferença, em segundo, entre a marca de referência e a marca de Usain Bolt?', '[{"letra": "A", "texto": "0,02"}, {"letra": "B", "texto": "0,04"}, {"letra": "C", "texto": "0,38"}, {"letra": "D", "texto": "0,42"}, {"letra": "E", "texto": "0,52"}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'ee6b2d314513f5817704d10f06a1f7ff290b3187449e4bf9e0de39a04f993631', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Estatística / Interpretação de Gráficos e Porcentagem', 2025, '2º dia', NULL, 147, NULL, 'matematica', 'medio', 'Matrículas por idioma em 2024: Inglês (280), Espanhol (80), Francês (20), Alemão (20).
Para 2025, o total de matrículas será o mesmo de 2024, mas com a distribuição percentual de 2023: Inglês (60%), Espanhol (25%), Francês (5%), Alemão (10%).

Segundo essa estimativa, o número de matrículas no curso de francês para 2025 será

A) 2.
B) 12.
C) 20.
D) 22.
E) 40.', 'QUESTÃO 147

Matrículas por idioma em 2024: Inglês (280), Espanhol (80), Francês (20), Alemão (20).
Para 2025, o total de matrículas será o mesmo de 2024, mas com a distribuição percentual de 2023: Inglês (60%), Espanhol (25%), Francês (5%), Alemão (10%).

Segundo essa estimativa, o número de matrículas no curso de francês para 2025 será', '[{"letra": "A", "texto": "2."}, {"letra": "B", "texto": "12."}, {"letra": "C", "texto": "20."}, {"letra": "D", "texto": "22."}, {"letra": "E", "texto": "40."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '141fdb12a8e07d17e803b62cea20fdb8ab69b47386580b0a480a175616a7e8b2', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Razão e Proporção / Escalas', 2025, '2º dia', NULL, 148, NULL, 'matematica', 'medio', 'Deslocamentos exibidos na tela do controle remoto:
I) 9 cm na escala 1:100
II) 5 cm na escala 1:300
III) 5 cm na escala 1:600
IV) 3 cm na escala 1:700
V) 2 cm na escala 1:1000

A opção que indica o deslocamento de maior comprimento real realizado é

A) I.
B) II.
C) III.
D) IV.
E) V.', 'QUESTÃO 148

Deslocamentos exibidos na tela do controle remoto:
I) 9 cm na escala 1:100
II) 5 cm na escala 1:300
III) 5 cm na escala 1:600
IV) 3 cm na escala 1:700
V) 2 cm na escala 1:1000

A opção que indica o deslocamento de maior comprimento real realizado é', '[{"letra": "A", "texto": "I."}, {"letra": "B", "texto": "II."}, {"letra": "C", "texto": "III."}, {"letra": "D", "texto": "IV."}, {"letra": "E", "texto": "V."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'b05d75eee2074b1f13afad918f135b900632b1eada3dfacc7911e93ecf7b6ef3', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Relação de Euler e Poliedros', 2025, '2º dia', NULL, 149, NULL, 'matematica', 'medio', 'A cúpula pentagonal giralongada possui como faces: 1 decágono regular, 1 pentágono regular, 5 quadrados e 15 triângulos equiláteros.

Quantos vértices tem esse poliedro?

A) 21
B) 25
C) 55
D) 80
E) 110', 'QUESTÃO 149

A cúpula pentagonal giralongada possui como faces: 1 decágono regular, 1 pentágono regular, 5 quadrados e 15 triângulos equiláteros.

Quantos vértices tem esse poliedro?', '[{"letra": "A", "texto": "21"}, {"letra": "B", "texto": "25"}, {"letra": "C", "texto": "55"}, {"letra": "D", "texto": "80"}, {"letra": "E", "texto": "110"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '0b9305acc2de8d2c6bf3f3c2fe5195dc6dc01f5a650a67288c05147b44a57130', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Regra de Três Composta', 2025, '2º dia', NULL, 150, NULL, 'matematica', 'medio', 'Uma fábrica com 3 funcionários, trabalhando 6 horas diárias, produz 720 tijolos por dia. A fábrica passou a ter 5 funcionários, trabalhando 9 horas diárias.

O número de tijolos fabricados diariamente após o aumento da capacidade é

A) 800.
B) 1080.
C) 1 200.
D) 1 800.
E) 2 520.', 'QUESTÃO 150

Uma fábrica com 3 funcionários, trabalhando 6 horas diárias, produz 720 tijolos por dia. A fábrica passou a ter 5 funcionários, trabalhando 9 horas diárias.

O número de tijolos fabricados diariamente após o aumento da capacidade é', '[{"letra": "A", "texto": "800."}, {"letra": "B", "texto": "1080."}, {"letra": "C", "texto": "1 200."}, {"letra": "D", "texto": "1 800."}, {"letra": "E", "texto": "2 520."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '04213e401c86193b1ebeeb1b0c605dad2ad2e6b914898a1a86fd38c3922f1364', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Lógica / Formação de Códigos Numéricos', 2025, '2º dia', NULL, 151, NULL, 'matematica', 'medio', 'Código de identificação de 7 dígitos:
- 1º dígito: Andar (1 a 4)
- 2º e 3º dígitos: Setor da empresa (01 a 20)
- 4º ao 6º dígitos: Número do funcionário (001 a 135)
- 7º dígito: Turno da visita (Manhã = 0, Tarde = 1)

Um visitante chegou às 10 horas da manhã para se reunir com o funcionário 109, do setor 08, no 2º andar.

O código de identificação desse visitante é

A) 0109082.
B) 0281090.
C) 1010982.
D) 2081090.
E) 2810910.', 'QUESTÃO 151

Código de identificação de 7 dígitos:
- 1º dígito: Andar (1 a 4)
- 2º e 3º dígitos: Setor da empresa (01 a 20)
- 4º ao 6º dígitos: Número do funcionário (001 a 135)
- 7º dígito: Turno da visita (Manhã = 0, Tarde = 1)

Um visitante chegou às 10 horas da manhã para se reunir com o funcionário 109, do setor 08, no 2º andar.

O código de identificação desse visitante é', '[{"letra": "A", "texto": "0109082."}, {"letra": "B", "texto": "0281090."}, {"letra": "C", "texto": "1010982."}, {"letra": "D", "texto": "2081090."}, {"letra": "E", "texto": "2810910."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '5ed39fc12b1c066d7781192393865f890ead76adbf60bd4d91a65079e44ca041', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Probabilidade / Permutação', 2025, '2º dia', NULL, 152, NULL, 'matematica', 'medio', 'Os celulares de quatro candidatos foram recolhidos e guardados em quatro envelopes pretos sem identificação. Ao término da prova, o aplicador devolveu aleatoriamente um envelope a cada candidato.

A probabilidade de que todos os candidatos tenham recebido de volta o envelope correto é

A) 1/2
B) 1/10
C) 1/16
D) 1/24
E) 1/256', 'QUESTÃO 152

Os celulares de quatro candidatos foram recolhidos e guardados em quatro envelopes pretos sem identificação. Ao término da prova, o aplicador devolveu aleatoriamente um envelope a cada candidato.

A probabilidade de que todos os candidatos tenham recebido de volta o envelope correto é', '[{"letra": "A", "texto": "1/2"}, {"letra": "B", "texto": "1/10"}, {"letra": "C", "texto": "1/16"}, {"letra": "D", "texto": "1/24"}, {"letra": "E", "texto": "1/256"}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '218f48c7e2a09827ec68e249f7192a41af734a5e8723ea09627f37bf5ea488c7', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Analítica / Equação da Reta Mediatriz', 2025, '2º dia', NULL, 153, NULL, 'matematica', 'medio', 'No plano cartesiano, os vértices de um quadrado STUV contêm o herói na posição inicial S(6, 2) e dois vilões nas posições V(8, 6) e T(2, 4). O herói movimenta-se na trajetória equidistante dos vilões V e T.

Qual é a equação da trajetória em que o herói se movimentará?

A) y = -3x + 20
B) y = -3x + 16
C) y = -3x - 20
D) y = 3x + 16
E) y = 3x - 16', 'QUESTÃO 153

No plano cartesiano, os vértices de um quadrado STUV contêm o herói na posição inicial S(6, 2) e dois vilões nas posições V(8, 6) e T(2, 4). O herói movimenta-se na trajetória equidistante dos vilões V e T.

Qual é a equação da trajetória em que o herói se movimentará?', '[{"letra": "A", "texto": "y = -3x + 20"}, {"letra": "B", "texto": "y = -3x + 16"}, {"letra": "C", "texto": "y = -3x - 20"}, {"letra": "D", "texto": "y = 3x + 16"}, {"letra": "E", "texto": "y = 3x - 16"}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'a25eafbe99d67fc11137baf6c5d3629369e897501a28a90560cf61458f58172b', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Estatística / Interpretação de Gráficos de Demanda e Estoque', 2025, '2º dia', NULL, 154, NULL, 'matematica', 'medio', 'Estoque e demanda de livros por gênero:
- Ficção: Estoque 200 (80 BR + 120 EST) | Demanda 160
- Autoajuda: Estoque 130 (50 BR + 80 EST) | Demanda 136
- Romance: Estoque 145 (40 BR + 105 EST) | Demanda 140
- Biografia: Estoque 95 (45 BR + 50 EST) | Demanda 80

O gerente encomendará novos exemplares do gênero cuja quantidade em estoque seja insuficiente para atender a demanda. O gênero encomendado será

A) ficção.
B) biografia.
C) autoajuda.
D) biografia.
E) romance.', 'QUESTÃO 154

Estoque e demanda de livros por gênero:
- Ficção: Estoque 200 (80 BR + 120 EST) | Demanda 160
- Autoajuda: Estoque 130 (50 BR + 80 EST) | Demanda 136
- Romance: Estoque 145 (40 BR + 105 EST) | Demanda 140
- Biografia: Estoque 95 (45 BR + 50 EST) | Demanda 80

O gerente encomendará novos exemplares do gênero cuja quantidade em estoque seja insuficiente para atender a demanda. O gênero encomendado será', '[{"letra": "A", "texto": "ficção."}, {"letra": "B", "texto": "biografia."}, {"letra": "C", "texto": "autoajuda."}, {"letra": "D", "texto": "biografia."}, {"letra": "E", "texto": "romance."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '2cedff087fd9010aaf437d619266c115fd6b7d61a7844acb972ab7f2d66bad46', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Análise Combinatória / Princípio Fundamental da Contagem', 2025, '2º dia', NULL, 155, NULL, 'matematica', 'medio', 'Dez casais constituirão uma diretoria com três cargos: presidente, secretário e tesoureiro. No máximo uma pessoa por casal pode ocupar um cargo nessa diretoria.

Quantas diretorias diferentes podem ser constituídas por esses 10 casais?

A) 10 x 9 x 8
B) 20 x 18 x 16
C) 20 x 19 x 18
D) 10 x 9 x 8 x 2
E) 20 x 18 x 16 x 2', 'QUESTÃO 155

Dez casais constituirão uma diretoria com três cargos: presidente, secretário e tesoureiro. No máximo uma pessoa por casal pode ocupar um cargo nessa diretoria.

Quantas diretorias diferentes podem ser constituídas por esses 10 casais?', '[{"letra": "A", "texto": "10 x 9 x 8"}, {"letra": "B", "texto": "20 x 18 x 16"}, {"letra": "C", "texto": "20 x 19 x 18"}, {"letra": "D", "texto": "10 x 9 x 8 x 2"}, {"letra": "E", "texto": "20 x 18 x 16 x 2"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '537a1a66b5ec1c8a00bd0f50b1cdbfb725b5ad4742a1660a16cc0e124f114250', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Razão e Proporção / Escalas', 2025, '2º dia', NULL, 156, NULL, 'matematica', 'medio', 'Um esboço feito na areia medindo 20 cm foi ampliado mantendo as mesmas proporções para uma obra com dimensão de 30 m.

Em qual escala esse desenho representa a obra de arte?

A) 1 : 1,5
B) 1 : 2,25
C) 1 : 10
D) 1 : 100
E) 1 : 150', 'QUESTÃO 156

Um esboço feito na areia medindo 20 cm foi ampliado mantendo as mesmas proporções para uma obra com dimensão de 30 m.

Em qual escala esse desenho representa a obra de arte?', '[{"letra": "A", "texto": "1 : 1,5"}, {"letra": "B", "texto": "1 : 2,25"}, {"letra": "C", "texto": "1 : 10"}, {"letra": "D", "texto": "1 : 100"}, {"letra": "E", "texto": "1 : 150"}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '8e378d8342e395c823113b267f42b39dcac2680661ca29462aeea530ce54bad8', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Álgebra / Proporcionalidade Direta', 2025, '2º dia', NULL, 157, NULL, 'matematica', 'medio', 'Em um estudo, a concentração de cortisol salivar no dia de trabalho (T) era, em média, 1,59 vezes a concentração no dia de folga (F).

Nesse estudo, a relação obtida entre T e F foi

A) T = 1,59 + F
B) F = 1,59 + T
C) T / F = 1,59
D) F / T = 1,59
E) F. T = 1,59', 'QUESTÃO 157

Em um estudo, a concentração de cortisol salivar no dia de trabalho (T) era, em média, 1,59 vezes a concentração no dia de folga (F).

Nesse estudo, a relação obtida entre T e F foi', '[{"letra": "A", "texto": "T = 1,59 + F"}, {"letra": "B", "texto": "F = 1,59 + T"}, {"letra": "C", "texto": "T / F = 1,59"}, {"letra": "D", "texto": "F / T = 1,59"}, {"letra": "E", "texto": "F. T = 1,59"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'dc067bf92ec17b8cce5dda6d7b76b07c495435a8d37aca750203d6ef5ac3bc44', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Matemática Financeira / Lucro e Despesas', 2025, '2º dia', NULL, 158, NULL, 'matematica', 'medio', 'Um estacionamento possui 120 vagas (todas ocupadas). Despesas mensais: R$ 14 240,00 de manutenção mais R$ 36,00 de seguro por veículo. A partir do mês seguinte, o seguro por veículo aumenta 20%. As despesas de manutenção permanecem constantes. O dono reajustará as mensalidades para obter um lucro mensal de R$ 10 000,00 com todas as 120 vagas ocupadas.

O valor, em real, da mensalidade reajustada será

A) 185,60.
B) 226,09.
C) 245,20.
D) 268,93.
E) 285,60.', 'QUESTÃO 158

Um estacionamento possui 120 vagas (todas ocupadas). Despesas mensais: R$ 14 240,00 de manutenção mais R$ 36,00 de seguro por veículo. A partir do mês seguinte, o seguro por veículo aumenta 20%. As despesas de manutenção permanecem constantes. O dono reajustará as mensalidades para obter um lucro mensal de R$ 10 000,00 com todas as 120 vagas ocupadas.

O valor, em real, da mensalidade reajustada será', '[{"letra": "A", "texto": "185,60."}, {"letra": "B", "texto": "226,09."}, {"letra": "C", "texto": "245,20."}, {"letra": "D", "texto": "268,93."}, {"letra": "E", "texto": "285,60."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'ba593ce9e0b5e3b092bc492f5803db0c2a54ab72cffaa25d268a467995038039', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Conversão de Unidades de Volume', 2025, '2º dia', NULL, 159, NULL, 'matematica', 'medio', 'O dono de uma sorveteria armazena sorvete em potes de 20 000 cm³. Ele serve o sorvete em taças em porções de 250 mL.

A quantidade de taças que ele consegue servir a partir de um pote cheio é

A) 5.
B) 8.
C) 50.
D) 80.
E) 800.', 'QUESTÃO 159

O dono de uma sorveteria armazena sorvete em potes de 20 000 cm³. Ele serve o sorvete em taças em porções de 250 mL.

A quantidade de taças que ele consegue servir a partir de um pote cheio é', '[{"letra": "A", "texto": "5."}, {"letra": "B", "texto": "8."}, {"letra": "C", "texto": "50."}, {"letra": "D", "texto": "80."}, {"letra": "E", "texto": "800."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'b2f99998b665744b1166098b6f85e727cca04e33834a2a7f45b1c619befd867d', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Trigonometria / Função Tangente e Transformações', 2025, '2º dia', NULL, 160, NULL, 'matematica', 'medio', 'A distância D da lâmina de água ao tampo da mesa varia com o tempo T (de 0 a 4 min) segundo D = k + tg[p(T + m)].
Do gráfico: ponto central (2,5; 30) e assíntotas verticais em T = (5 - 2pi)/2 e T = (5 + 2pi)/2.

A expressão algébrica que representa a relação entre D e T é

A) D = 2,5 + tg[30(T - (5-2pi)/2)]
B) D = 4 + tg[30(T + 5/2)]
C) D = 4 + tg[2,5(T + (5+2pi)/2)]
D) D = 30 + tg[(1/2)(T - 5)]
E) D = 30 + tg[(1/2)(T - 5/2)]', 'QUESTÃO 160

A distância D da lâmina de água ao tampo da mesa varia com o tempo T (de 0 a 4 min) segundo D = k + tg[p(T + m)].
Do gráfico: ponto central (2,5; 30) e assíntotas verticais em T = (5 - 2pi)/2 e T = (5 + 2pi)/2.

A expressão algébrica que representa a relação entre D e T é', '[{"letra": "A", "texto": "D = 2,5 + tg[30(T - (5-2pi)/2)]"}, {"letra": "B", "texto": "D = 4 + tg[30(T + 5/2)]"}, {"letra": "C", "texto": "D = 4 + tg[2,5(T + (5+2pi)/2)]"}, {"letra": "D", "texto": "D = 30 + tg[(1/2)(T - 5)]"}, {"letra": "E", "texto": "D = 30 + tg[(1/2)(T - 5/2)]"}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '9ef7b923209d90bdac59af381d751d80e00d8a9b3cd588f4a7d6536ae98d2e89', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Orientação e Deslocamento em Malha', 2025, '2º dia', NULL, 161, NULL, 'matematica', 'medio', 'João mora na extremidade nordeste de um quarteirão. Ao sair de casa, caminha na direção oeste, dobra à direita (norte), caminha por três quarteirões ao norte e dobra à esquerda (oeste). A casa de seu amigo A fica no segundo quarteirão a oeste.

O quarteirão onde se encontra a casa de João é representado no mapa pelo quadrado com a letra

A) Q.
B) R.
C) S.
D) P.
E) T.', 'QUESTÃO 161

João mora na extremidade nordeste de um quarteirão. Ao sair de casa, caminha na direção oeste, dobra à direita (norte), caminha por três quarteirões ao norte e dobra à esquerda (oeste). A casa de seu amigo A fica no segundo quarteirão a oeste.

O quarteirão onde se encontra a casa de João é representado no mapa pelo quadrado com a letra', '[{"letra": "A", "texto": "Q."}, {"letra": "B", "texto": "R."}, {"letra": "C", "texto": "S."}, {"letra": "D", "texto": "P."}, {"letra": "E", "texto": "T."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '5b0ea2017aeb352e467edf8cc5747763e88e830b8d5699aac7687570040d99ca', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Álgebra / Equações do 1º Grau e Redução de Custos', 2025, '2º dia', NULL, 162, NULL, 'matematica', 'medio', 'Uma empresa produz 110 toneladas de plástico de petróleo e 80 toneladas de plástico reciclado por mês. Custo de reciclagem = R$ 500,00/t (que equivale a 5% do custo do plástico de petróleo, ou seja, petróleo custa R$ 10 000,00/t). Para o próximo mês, a meta é produzir a mesma quantidade total (190 t) com redução de pelo menos 50% no custo total de produção.

A quantidade mínima de toneladas de plástico reciclado a ser produzida é

A) 135.
B) 140.
C) 155.
D) 160.
E) 175.', 'QUESTÃO 162

Uma empresa produz 110 toneladas de plástico de petróleo e 80 toneladas de plástico reciclado por mês. Custo de reciclagem = R$ 500,00/t (que equivale a 5% do custo do plástico de petróleo, ou seja, petróleo custa R$ 10 000,00/t). Para o próximo mês, a meta é produzir a mesma quantidade total (190 t) com redução de pelo menos 50% no custo total de produção.

A quantidade mínima de toneladas de plástico reciclado a ser produzida é', '[{"letra": "A", "texto": "135."}, {"letra": "B", "texto": "140."}, {"letra": "C", "texto": "155."}, {"letra": "D", "texto": "160."}, {"letra": "E", "texto": "175."}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '4079ead39c09f0b9f20e4ad007f8a60373af1e407d30682eb02ac96498e26946', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Estatística / Análise Conjunta de Gráficos', 2025, '2º dia', NULL, 163, NULL, 'matematica', 'medio', 'Todos os estudantes do ensino médio praticam apenas um esporte (Futebol, Vôlei ou Basquete).
No gráfico de setores, o basquete corresponde a 80 estudantes.
No gráfico de barras por série, as barras de basquete medem 1 unidade na 1ª série, 3 unidades na 2ª série e 4 unidades na 3ª série (totalizando 8 unidades = 80 alunos).

Qual é a quantidade total de estudantes no ensino médio dessa escola?

A) 720
B) 360
C) 320
D) 288
E) 240', 'QUESTÃO 163

Todos os estudantes do ensino médio praticam apenas um esporte (Futebol, Vôlei ou Basquete).
No gráfico de setores, o basquete corresponde a 80 estudantes.
No gráfico de barras por série, as barras de basquete medem 1 unidade na 1ª série, 3 unidades na 2ª série e 4 unidades na 3ª série (totalizando 8 unidades = 80 alunos).

Qual é a quantidade total de estudantes no ensino médio dessa escola?', '[{"letra": "A", "texto": "720"}, {"letra": "B", "texto": "360"}, {"letra": "C", "texto": "320"}, {"letra": "D", "texto": "288"}, {"letra": "E", "texto": "240"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '259adfab8740ebc19829ce54ee02a0bd9d40f7fd8904799b1f2ceac288a3eb2f', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Trigonometria / Lei dos Cossenos e Vetores', 2025, '2º dia', NULL, 164, NULL, 'matematica', 'medio', 'Rota planejada: P -> Q (direção 110°, 4h), Q -> R (direção 90°, 2h).
Rota executada por erro: P -> S (direção 340°, 4h), S -> T (direção 90°, 2h).
Chegando em T, necessita ir diretamente ao ponto de destino R.
Considere cos(50°) = 0,64.

A direção e o tempo aproximado de navegação de T para R são, respectivamente:

A) 135° e 7 horas e 15 minutos.
B) 45° e 7 horas e 15 minutos.
C) 135° e 12 horas.
D) 135° e 6 horas.
E) 45° e 6 horas.', 'QUESTÃO 164

Rota planejada: P -> Q (direção 110°, 4h), Q -> R (direção 90°, 2h).
Rota executada por erro: P -> S (direção 340°, 4h), S -> T (direção 90°, 2h).
Chegando em T, necessita ir diretamente ao ponto de destino R.
Considere cos(50°) = 0,64.

A direção e o tempo aproximado de navegação de T para R são, respectivamente:', '[{"letra": "A", "texto": "135° e 7 horas e 15 minutos."}, {"letra": "B", "texto": "45° e 7 horas e 15 minutos."}, {"letra": "C", "texto": "135° e 12 horas."}, {"letra": "D", "texto": "135° e 6 horas."}, {"letra": "E", "texto": "45° e 6 horas."}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '67102464caf4348a9c4dccd2e97ab1c1290095d41582e797db510092c717a758', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Estatística / Medidas de Tendência Central (Mediana)', 2025, '2º dia', NULL, 165, NULL, 'matematica', 'medio', '55 mulheres foram distribuídas em 5 grupos de 11 pessoas. O grupo escolhido deve apresentar a maioria das mulheres (pelo menos 6 de 11) com idades entre 20 e 30 anos.
Resumo parcial dos dados:
- Grupo 1: Média = 25, Desvio Padrão = 10
- Grupo 2: Mediana = 25, Desvio Padrão = 9
- Grupo 3: Moda = 25
- Grupo 4: Média = 25, Desvio Padrão = 1
- Grupo 5: Menor idade = 20, Maior idade = 35

O grupo que certamente atende ao critério de escolha é o

A) 1.
B) 2.
C) 3.
D) 4.
E) 5.', 'QUESTÃO 165

55 mulheres foram distribuídas em 5 grupos de 11 pessoas. O grupo escolhido deve apresentar a maioria das mulheres (pelo menos 6 de 11) com idades entre 20 e 30 anos.
Resumo parcial dos dados:
- Grupo 1: Média = 25, Desvio Padrão = 10
- Grupo 2: Mediana = 25, Desvio Padrão = 9
- Grupo 3: Moda = 25
- Grupo 4: Média = 25, Desvio Padrão = 1
- Grupo 5: Menor idade = 20, Maior idade = 35

O grupo que certamente atende ao critério de escolha é o', '[{"letra": "A", "texto": "1."}, {"letra": "B", "texto": "2."}, {"letra": "C", "texto": "3."}, {"letra": "D", "texto": "4."}, {"letra": "E", "texto": "5."}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '18c007316f2cae64a07b188d0ac3174126f5f1e793246591b31ffbc507f46e4b', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Aritmética / Ritmo (Pace) e Média', 2025, '2º dia', NULL, 166, NULL, 'matematica', 'medio', 'Em uma corrida de 5 km, o corredor acumulou os tempos ao cruzar as marcas: 1 km (272 s), 2 km (556 s), 3 km (844 s), 4 km (1 132 s). O tempo no 4º trecho foi de 288 s.
Seu melhor pace em corridas de 5 km é 281 s/km.

Para repetir seu melhor pace nessa corrida, seu tempo no 5º trecho deve ser quantos segundos menor do que o do 4º trecho?

A) 1
B) 2
C) 8
D) 9
E) 15', 'QUESTÃO 166

Em uma corrida de 5 km, o corredor acumulou os tempos ao cruzar as marcas: 1 km (272 s), 2 km (556 s), 3 km (844 s), 4 km (1 132 s). O tempo no 4º trecho foi de 288 s.
Seu melhor pace em corridas de 5 km é 281 s/km.

Para repetir seu melhor pace nessa corrida, seu tempo no 5º trecho deve ser quantos segundos menor do que o do 4º trecho?', '[{"letra": "A", "texto": "1"}, {"letra": "B", "texto": "2"}, {"letra": "C", "texto": "8"}, {"letra": "D", "texto": "9"}, {"letra": "E", "texto": "15"}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '2fc5212023f03c0aa75303409c2a043642a500aaa7d579133393d94799e72a91', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Análise Gráfica / Leitura de Gráficos e Custos', 2025, '2º dia', NULL, 167, NULL, 'matematica', 'medio', 'Em uma viagem de 240 km mantendo velocidade constante de 60 km/h:
- Metade do trajeto (120 km) a GNV: a 60 km/h o rendimento é 10 km/m³, preço R$ 2,00/m³.
- Outra metade (120 km) a Gasolina: a 60 km/h o rendimento é 8 km/L, preço R$ 3,00/L.

A diferença, em real, entre os gastos totais com gasolina e com GNV foi

A) 4.
B) 8.
C) 14.
D) 21.
E) 30.', 'QUESTÃO 167

Em uma viagem de 240 km mantendo velocidade constante de 60 km/h:
- Metade do trajeto (120 km) a GNV: a 60 km/h o rendimento é 10 km/m³, preço R$ 2,00/m³.
- Outra metade (120 km) a Gasolina: a 60 km/h o rendimento é 8 km/L, preço R$ 3,00/L.

A diferença, em real, entre os gastos totais com gasolina e com GNV foi', '[{"letra": "A", "texto": "4."}, {"letra": "B", "texto": "8."}, {"letra": "C", "texto": "14."}, {"letra": "D", "texto": "21."}, {"letra": "E", "texto": "30."}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'd2d38b8e9114e005b3f40f051857d1444d17c0d4e149058eb6309808e87d9177', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Aritmética / Comparação de Opções de Custos', 2025, '2º dia', NULL, 168, NULL, 'matematica', 'medio', 'Produtos: 20 aulas teóricas + 10 aulas práticas + aluguel do veículo.
Tabela de preços:
- Autoescola I: Teórica R$ 10, Prática R$ 80, Aluguel R$ 400
- Autoescola II: Teórica R$ 30, Prática R$ 50, Aluguel R$ 200
- Autoescola III: Teórica R$ 20, Prática R$ 40, Aluguel R$ 400

A autoescola contratada com o menor custo total é a

A) I, com o custo total de R$ 1 400,00.
B) II, com o custo total de R$ 280,00.
C) II, com o custo total de R$ 1 300,00.
D) III, com o custo total de R$ 460,00.
E) III, com o custo total de R$ 1 200,00.', 'QUESTÃO 168

Produtos: 20 aulas teóricas + 10 aulas práticas + aluguel do veículo.
Tabela de preços:
- Autoescola I: Teórica R$ 10, Prática R$ 80, Aluguel R$ 400
- Autoescola II: Teórica R$ 30, Prática R$ 50, Aluguel R$ 200
- Autoescola III: Teórica R$ 20, Prática R$ 40, Aluguel R$ 400

A autoescola contratada com o menor custo total é a', '[{"letra": "A", "texto": "I, com o custo total de R$ 1 400,00."}, {"letra": "B", "texto": "II, com o custo total de R$ 280,00."}, {"letra": "C", "texto": "II, com o custo total de R$ 1 300,00."}, {"letra": "D", "texto": "III, com o custo total de R$ 460,00."}, {"letra": "E", "texto": "III, com o custo total de R$ 1 200,00."}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '30e223f3fe4496990a06f98d31aaa898b50d91304255d89aaa0ef130218a236b', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Estatística / Produção Agrícola e Gráficos de Linha', 2025, '2º dia', NULL, 169, NULL, 'matematica', 'medio', 'Produtividade de soja (sacas de 50 kg por hectare) e área cultivada (hectare):
- Safra 11-12: Área = 200 ha | Produtividade = 40 sacas/ha (400 toneladas)
- Safra 12-13: Área = 220 ha | Produtividade = 30 sacas/ha (330 toneladas)
- Safra 13-14: Área = 250 ha | Produtividade = 45 sacas/ha (562,5 toneladas)
- Safra 14-15: Área = 250 ha | Produtividade = 45 sacas/ha (562,5 toneladas)
- Safra 15-16: Área = 200 ha | Produtividade = 50 sacas/ha (500 toneladas)

O gráfico de linhas que representa a produção de soja em toneladas é

A) Gráfico A (pontos: 400; 330; 562,5; 562,5; 500)
B) Gráfico B (pontos: 40; 30; 45; 45; 50)
C) Gráfico C (pontos: 200; 220; 250; 250; 200)
D) Gráfico D (pontos: 240; 250; 295; 295; 250)
E) Gráfico E (pontos: 8; 6,6; 11,25; 11,25; 10)', 'QUESTÃO 169

Produtividade de soja (sacas de 50 kg por hectare) e área cultivada (hectare):
- Safra 11-12: Área = 200 ha | Produtividade = 40 sacas/ha (400 toneladas)
- Safra 12-13: Área = 220 ha | Produtividade = 30 sacas/ha (330 toneladas)
- Safra 13-14: Área = 250 ha | Produtividade = 45 sacas/ha (562,5 toneladas)
- Safra 14-15: Área = 250 ha | Produtividade = 45 sacas/ha (562,5 toneladas)
- Safra 15-16: Área = 200 ha | Produtividade = 50 sacas/ha (500 toneladas)

O gráfico de linhas que representa a produção de soja em toneladas é', '[{"letra": "A", "texto": "Gráfico A (pontos: 400; 330; 562,5; 562,5; 500)"}, {"letra": "B", "texto": "Gráfico B (pontos: 40; 30; 45; 45; 50)"}, {"letra": "C", "texto": "Gráfico C (pontos: 200; 220; 250; 250; 200)"}, {"letra": "D", "texto": "Gráfico D (pontos: 240; 250; 295; 295; 250)"}, {"letra": "E", "texto": "Gráfico E (pontos: 8; 6,6; 11,25; 11,25; 10)"}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '50a705b117a172da677507bc2f397b4bb3608190be7314cfc6aec7666150e763', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Volume de Paralelepípedo Retângulo', 2025, '2º dia', NULL, 170, NULL, 'matematica', 'medio', 'Uma caixa de descarga em formato de paralelepípedo retângulo tem dimensões internas da base de 2,5 dm e 1,5 dm, e enche de água até a altura de 2 dm. A cada descarga, o volume total de água é despejado. Para economizar, garrafas de 300 mL cheias de areia serão colocadas submersas no interior da caixa. O volume mínimo de água despejada a cada descarga deve ser mantido em 5 L.

A quantidade máxima de garrafas de 300 mL que podem ser colocadas é

A) 10.
B) 8.
C) 4.
D) 3.
E) 2.', 'QUESTÃO 170

Uma caixa de descarga em formato de paralelepípedo retângulo tem dimensões internas da base de 2,5 dm e 1,5 dm, e enche de água até a altura de 2 dm. A cada descarga, o volume total de água é despejado. Para economizar, garrafas de 300 mL cheias de areia serão colocadas submersas no interior da caixa. O volume mínimo de água despejada a cada descarga deve ser mantido em 5 L.

A quantidade máxima de garrafas de 300 mL que podem ser colocadas é', '[{"letra": "A", "texto": "10."}, {"letra": "B", "texto": "8."}, {"letra": "C", "texto": "4."}, {"letra": "D", "texto": "3."}, {"letra": "E", "texto": "2."}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'f8eb392365b3a8d2efb81a56d308f5e7fbfc3e46e2b3693b5031d9bfc0fef3c0', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial e Plana / Inscrição de Cilindro em Prisma', 2025, '2º dia', NULL, 171, NULL, 'matematica', 'medio', 'Tortas cilíndricas possuem raio da base entre 12 cm e 16 cm (diâmetro máximo de 32 cm). Serão embaladas em caixas prismáticas de base quadrada, restando pelo menos 1 cm de folga entre a torta e as superfícies internas. As caixas originais possuem base quadrada de 14 cm de lado.

A aresta da base das novas caixas deve ser, no mínimo, quantos centímetros maior que a das caixas originais?

A) 4
B) 12
C) 16
D) 18
E) 20', 'QUESTÃO 171

Tortas cilíndricas possuem raio da base entre 12 cm e 16 cm (diâmetro máximo de 32 cm). Serão embaladas em caixas prismáticas de base quadrada, restando pelo menos 1 cm de folga entre a torta e as superfícies internas. As caixas originais possuem base quadrada de 14 cm de lado.

A aresta da base das novas caixas deve ser, no mínimo, quantos centímetros maior que a das caixas originais?', '[{"letra": "A", "texto": "4"}, {"letra": "B", "texto": "12"}, {"letra": "C", "texto": "16"}, {"letra": "D", "texto": "18"}, {"letra": "E", "texto": "20"}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '353b0fdb67e668e96f1f4aaaaf8efaeb81237e743d5368966a7fb96cbe170340', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Funções / Logaritmos e Função Quadrática', 2025, '2º dia', NULL, 172, NULL, 'matematica', 'medio', 'Pressão interna de uma máquina: P = 4. log[-K. (t + 1). (t - 19)], onde t é o tempo contínuo de uso em horas.
A recomendação é que P não ultrapasse 10 atmosferas durante 10 horas de uso contínuo (t = 10 h).

O maior valor a ser escolhido para o parâmetro K é

A) 10^0,5
B) 10^8
C) (10^2,5) / 84
D) (10^2,5) / 99
E) 25 x 10^-2', 'QUESTÃO 172

Pressão interna de uma máquina: P = 4. log[-K. (t + 1). (t - 19)], onde t é o tempo contínuo de uso em horas.
A recomendação é que P não ultrapasse 10 atmosferas durante 10 horas de uso contínuo (t = 10 h).

O maior valor a ser escolhido para o parâmetro K é', '[{"letra": "A", "texto": "10^0,5"}, {"letra": "B", "texto": "10^8"}, {"letra": "C", "texto": "(10^2,5) / 84"}, {"letra": "D", "texto": "(10^2,5) / 99"}, {"letra": "E", "texto": "25 x 10^-2"}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'e351aeb3f8da20f23fbc4937eef4c7d716b7dd031568c50f76609f9e483dfdcd', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Plana / Área do Semicírculo', 2025, '2º dia', NULL, 173, NULL, 'matematica', 'medio', 'Projeto 1: Dois túneis semicilíndricos independentes, um de diâmetro 12 m (automóveis) e outro de diâmetro 6 m (bicicletas).
Projeto 2: Um único túnel semicilíndrico de uso misto com diâmetro total de 18 m (3m + 6m + 6m + 3m).
Considere 3 como aproximação para pi. O projeto aprovado será o de menor área de seção transversal.

O projeto a ser aprovado é

A) o 1, pois apresenta área de seção transversal medindo 67,5 m².
B) o 2, pois apresenta área de seção transversal medindo 121,5 m².
C) o 1, pois apresenta área de seção transversal medindo 135 m².
D) o 2, pois apresenta área de seção transversal medindo 243 m².
E) qualquer um dos dois, pois apresentam áreas iguais.', 'QUESTÃO 173

Projeto 1: Dois túneis semicilíndricos independentes, um de diâmetro 12 m (automóveis) e outro de diâmetro 6 m (bicicletas).
Projeto 2: Um único túnel semicilíndrico de uso misto com diâmetro total de 18 m (3m + 6m + 6m + 3m).
Considere 3 como aproximação para pi. O projeto aprovado será o de menor área de seção transversal.

O projeto a ser aprovado é', '[{"letra": "A", "texto": "o 1, pois apresenta área de seção transversal medindo 67,5 m²."}, {"letra": "B", "texto": "o 2, pois apresenta área de seção transversal medindo 121,5 m²."}, {"letra": "C", "texto": "o 1, pois apresenta área de seção transversal medindo 135 m²."}, {"letra": "D", "texto": "o 2, pois apresenta área de seção transversal medindo 243 m²."}, {"letra": "E", "texto": "qualquer um dos dois, pois apresentam áreas iguais."}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'e03bb63684658fdb15b4639fd4f15cf2e5e03f2c404cc02a85db4d3c693eab2b', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Álgebra / Equação do 2º Grau', 2025, '2º dia', NULL, 174, NULL, 'matematica', 'medio', 'Um carro custa R$ 60 mil e possui duas opções de pagamento sem juros:
Opção 1: n parcelas iguais.
Opção 2: (n + 6) parcelas, com valor de cada parcela R$ 500,00 menor do que na Opção 1.

Qual é a quantidade n de parcelas na Opção 1?

A) 18
B) 24
C) 30
D) 42
E) 48', 'QUESTÃO 174

Um carro custa R$ 60 mil e possui duas opções de pagamento sem juros:
Opção 1: n parcelas iguais.
Opção 2: (n + 6) parcelas, com valor de cada parcela R$ 500,00 menor do que na Opção 1.

Qual é a quantidade n de parcelas na Opção 1?', '[{"letra": "A", "texto": "18"}, {"letra": "B", "texto": "24"}, {"letra": "C", "texto": "30"}, {"letra": "D", "texto": "42"}, {"letra": "E", "texto": "48"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'a7749896935765ca785c29df56ea1f6f1c35c6fc579a6a27e5a89dd4bd243106', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Análise Combinatória / Princípio Multiplicativo e Combinações', 2025, '2º dia', NULL, 175, NULL, 'matematica', 'medio', 'Um pai distribuirá 8 presentes distintos (incluindo 1 bicicleta e 1 celular) para 3 filhos. O mais velho receberá 3 presentes, o mais novo 3 presentes, e o do meio 2 presentes. O filho mais velho ganhará obrigatoriamente a bicicleta ou o celular, mas não ambos.

De quantas maneiras distintas a distribuição dos presentes pode ser feita?

A) 36
B) 53
C) 300
D) 360
E) 560', 'QUESTÃO 175

Um pai distribuirá 8 presentes distintos (incluindo 1 bicicleta e 1 celular) para 3 filhos. O mais velho receberá 3 presentes, o mais novo 3 presentes, e o do meio 2 presentes. O filho mais velho ganhará obrigatoriamente a bicicleta ou o celular, mas não ambos.

De quantas maneiras distintas a distribuição dos presentes pode ser feita?', '[{"letra": "A", "texto": "36"}, {"letra": "B", "texto": "53"}, {"letra": "C", "texto": "300"}, {"letra": "D", "texto": "360"}, {"letra": "E", "texto": "560"}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '95905b60a7c1c0741920cd828b0d9dab1c84846ae90bc98517eddf3964170849', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Aritmética / Razão e Velocidade Média', 2025, '2º dia', NULL, 176, NULL, 'matematica', 'medio', 'Um jogador entrou no início do segundo tempo regulamentar (45 minutos) e percorreu 4,5 km. Na prorrogação (30 minutos), manteve a mesma velocidade média do segundo tempo.

A distância total percorrida por esse jogador na partida, em quilômetro, foi

A) 4,5.
B) 6,0.
C) 7,5.
D) 9,0.
E) 12,0.', 'QUESTÃO 176

Um jogador entrou no início do segundo tempo regulamentar (45 minutos) e percorreu 4,5 km. Na prorrogação (30 minutos), manteve a mesma velocidade média do segundo tempo.

A distância total percorrida por esse jogador na partida, em quilômetro, foi', '[{"letra": "A", "texto": "4,5."}, {"letra": "B", "texto": "6,0."}, {"letra": "C", "texto": "7,5."}, {"letra": "D", "texto": "9,0."}, {"letra": "E", "texto": "12,0."}]', 'C', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '2cce6085ecb91515c46614423ba4ff9ee7534e288710a7d6a29a7f75233ae4a7', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Geometria Espacial / Volume de Cilindros e Prismas', 2025, '2º dia', NULL, 177, NULL, 'matematica', 'medio', 'Uma medalha tem a forma de um cilindro reto de diâmetro 6 cm (raio 3 cm) e espessura 3 mm (0,3 cm). Um prisma de base quadrada ABCD atravessa toda a medalha. Os vértices A, B, C, D estão inscritos na circunferência de diâmetro 6 cm. A região externa ao prisma será cunhada em ouro. Pretende-se confeccionar 100 medalhas.
Considere pi = 3,1.

Qual é o volume total de ouro, em centímetro cúbico, necessário para as 100 medalhas?

A) 288
B) 297
C) 567
D) 990
E) 1134', 'QUESTÃO 177

Uma medalha tem a forma de um cilindro reto de diâmetro 6 cm (raio 3 cm) e espessura 3 mm (0,3 cm). Um prisma de base quadrada ABCD atravessa toda a medalha. Os vértices A, B, C, D estão inscritos na circunferência de diâmetro 6 cm. A região externa ao prisma será cunhada em ouro. Pretende-se confeccionar 100 medalhas.
Considere pi = 3,1.

Qual é o volume total de ouro, em centímetro cúbico, necessário para as 100 medalhas?', '[{"letra": "A", "texto": "288"}, {"letra": "B", "texto": "297"}, {"letra": "C", "texto": "567"}, {"letra": "D", "texto": "990"}, {"letra": "E", "texto": "1134"}]', 'B', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '6c93c01bd11cdccdd3c9e77852544d71784f5f5b39ce5818db7b582b2b07eeac', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Probabilidade / Lançamento de Dados', 2025, '2º dia', NULL, 178, NULL, 'matematica', 'medio', 'Artur lança dois dados cúbicos comuns e João lança o terceiro dado. Compara-se o maior número obtido por Artur com o número de João. Vence quem obtiver o maior número; em caso de empate, João vence.

O jogador com maior probabilidade de vitória e sua respectiva probabilidade são

A) Artur, com probabilidade de 2/3.
B) João, com probabilidade de 4/9.
C) Artur, com probabilidade de 91/216.
D) João, com probabilidade de 91/216.
E) Artur, com probabilidade de 125/216.', 'QUESTÃO 178

Artur lança dois dados cúbicos comuns e João lança o terceiro dado. Compara-se o maior número obtido por Artur com o número de João. Vence quem obtiver o maior número; em caso de empate, João vence.

O jogador com maior probabilidade de vitória e sua respectiva probabilidade são', '[{"letra": "A", "texto": "Artur, com probabilidade de 2/3."}, {"letra": "B", "texto": "João, com probabilidade de 4/9."}, {"letra": "C", "texto": "Artur, com probabilidade de 91/216."}, {"letra": "D", "texto": "João, com probabilidade de 91/216."}, {"letra": "E", "texto": "Artur, com probabilidade de 125/216."}]', 'E', NULL, NULL, NULL, 'pendente', TRUE, FALSE, 'e8019c97131a9cd1018c0cb5764c36eb425bed3320133fbee8c896a6fc08948d', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Análise Dimensional / Unidades de Medida', 2025, '2º dia', NULL, 179, NULL, 'matematica', 'medio', 'A luminância é definida como a razão entre a intensidade luminosa, medida em candela (cd), e o quadrado da distância do objeto até o foco de luz, medida em metro (m).

A unidade de medida da luminância de um objeto é

A) cd / m²
B) m² / cd
C) cd / m
D) m / cd
E) m / cd²', 'QUESTÃO 179

A luminância é definida como a razão entre a intensidade luminosa, medida em candela (cd), e o quadrado da distância do objeto até o foco de luz, medida em metro (m).

A unidade de medida da luminância de um objeto é', '[{"letra": "A", "texto": "cd / m²"}, {"letra": "B", "texto": "m² / cd"}, {"letra": "C", "texto": "cd / m"}, {"letra": "D", "texto": "m / cd"}, {"letra": "E", "texto": "m / cd²"}]', 'A', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '495c9ff5d6e2812eee76c75554dd2adab16f4324f2201acb020a1a67fe4556a5', 'enem-2025-dia2.txt'),
('ENEM', 'Matemática', 'Álgebra / Sequências e Expressões Algébricas', 2025, '2º dia', NULL, 180, NULL, 'matematica', 'medio', 'Quatro jogadores (1, 2, 3 e 4) iniciam com 100 moedas cada. A cada rodada:
- Jogador 1 transfere 1 moeda para o Jogador 2.
- Jogador 2 transfere 2 moedas para o Jogador 3.
- Jogador 3 transfere 3 moedas para o Jogador 4.
- Jogador 4 transfere 4 moedas para o Jogador 1.

Ao final da rodada n, a expressão algébrica que representa o número de moedas do Jogador 1 é

A) 103 + 4n
B) 103 + 3n
C) 100 + 4n
D) 100 + 3n
E) 99 + 4n', 'QUESTÃO 180

Quatro jogadores (1, 2, 3 e 4) iniciam com 100 moedas cada. A cada rodada:
- Jogador 1 transfere 1 moeda para o Jogador 2.
- Jogador 2 transfere 2 moedas para o Jogador 3.
- Jogador 3 transfere 3 moedas para o Jogador 4.
- Jogador 4 transfere 4 moedas para o Jogador 1.

Ao final da rodada n, a expressão algébrica que representa o número de moedas do Jogador 1 é', '[{"letra": "A", "texto": "103 + 4n"}, {"letra": "B", "texto": "103 + 3n"}, {"letra": "C", "texto": "100 + 4n"}, {"letra": "D", "texto": "100 + 3n"}, {"letra": "E", "texto": "99 + 4n"}]', 'D', NULL, NULL, NULL, 'pendente', TRUE, FALSE, '54a716d716a3883d6367dc91e4a1ab49b8623be4379a8e05464beb578ad38c8b', 'enem-2025-dia2.txt');
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
  'ENEM — lote 5/5' AS seed,
  (SELECT COUNT(*) FROM questoes) AS total_questoes_no_banco;
