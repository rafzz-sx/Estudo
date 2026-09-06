-- ============================================================================
-- BatCaverna — Seed do Banco de Questões: EPCAR
-- Gerado automaticamente por scripts/gerar_seed_sql.py — NÃO EDITE À MÃO.
-- Questões neste arquivo: 32   |   Lote 2 de 2
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
('EPCAR', 'Matemática', 'Função Afim e Variação Percentual', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 17, '17', NULL, 'medio', 'Considere uma certa barra de metal que possui um comprimento inicial L0, em centímetros. Essa barra, ao ser aquecida, sofre apenas um aumento em seu comprimento diretamente proporcional à temperatura (°C) de aquecimento. O comprimento da barra pode ser calculado, dependendo da temperatura, através de uma função como esboçado no gráfico abaixo.
[DESCRIÇÃO DA IMAGEM: Gráfico cartesiano de L(cm) versus T(°C). A reta passa pelos pontos (10; 79,84) e (20; 79,88).]', 'Uma barra, estando inicialmente a 50 °C, sofre um aquecimento de 20% de sua temperatura.
O aumento percentual correspondente de seu comprimento, em cm, é de:', '[{"letra": "A", "texto": "0,5%"}, {"letra": "B", "texto": "0,05%"}, {"letra": "C", "texto": "0,005%"}, {"letra": "D", "texto": "0,0005%"}]', 'B', '1) Taxa de variação m = (79,88 - 79,84) / (20 - 10) = 0,04 / 10 = 0,004 cm/°C.
2) Equação da reta: L(T) = L0 + 0,004.T. Para T = 10: 79,84 = L0 + 0,04 ⇒ L0 = 79,80 cm.
3) A 50 °C: L(50) = 79,80 + 0,004(50) = 80,00 cm.
4) Aquecimento de 20% sobre 50 °C = 10 °C.
5) Variação do comprimento ΔL = 0,004. 10 = 0,04 cm.
6) Variação percentual = (0,04 / 80,00). 100% = 0,05%.', 'Gráfico cartesiano de L(cm) versus T(°C). A reta passa pelos pontos (10; 79,84) e (20; 79,88).', '[{"titulo": "Passo 1", "conteudo": "1) Taxa de variação m = (79,88 - 79,84) / (20 - 10) = 0,04 / 10 = 0,004 cm/°C.\n2) Equação da reta: L(T) = L0 + 0,004.T.", "formula": null}, {"titulo": "Conclusão", "conteudo": "Para T = 10: 79,84 = L0 + 0,04 ⇒ L0 = 79,80 cm.\n3) A 50 °C: L(50) = 79,80 + 0,004(50) = 80,00 cm.\n4) Aquecimento de 20% sobre 50 °C = 10 °C.\n5) Variação do comprimento ΔL = 0,004. 10 = 0,04 cm.\n6) Variação percentual = (0,04 / 80,00). 100% = 0,05%.", "formula": null}]', 'automatica', TRUE, FALSE, '3f1e186d774ed8dfd69348477ee5a81572ab15535707a62273c321ae163d9889', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Geometria Plana — Áreas de Figuras Planas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 18, '18', NULL, 'facil', 'Um pai comprou um terreno retangular e repartiu-o em quatro terrenos também retangulares entre seus quatro filhos, conforme o croqui abaixo.
[DESCRIÇÃO DA IMAGEM: Um retângulo subdividido em 4 retângulos menores numa grade 2x2.
Superior esquerdo: Filho 1 | Superior direito: Filho 2
Inferior esquerdo: Filho 4 | Inferior direito: Filho 3]', 'O filho 1 ficou com 27 km² de área, o filho 2 com 18 km² de área, o filho 3 com 72 km² de área.
A área destinada ao filho 4, em km², é igual a:', '[{"letra": "A", "texto": "104"}, {"letra": "B", "texto": "108"}, {"letra": "C", "texto": "112"}, {"letra": "D", "texto": "116"}]', 'B', 'Em uma divisão retangular 2x2, o produto das áreas opostas é igual.
A1. A3 = A2. A4 ⇒ 27. 72 = 18. A4 ⇒ A4 = (27. 72) / 18 = 27. 4 = 108 km².', 'Um retângulo subdividido em 4 retângulos menores numa grade 2x2.', '[{"titulo": "Passo 1", "conteudo": "Em uma divisão retangular 2x2, o produto das áreas opostas é igual. A1.", "formula": null}, {"titulo": "Passo 2", "conteudo": "A3 = A2. A4 ⇒ 27. 72 = 18.", "formula": null}, {"titulo": "Conclusão", "conteudo": "A4 ⇒ A4 = (27. 72) / 18 = 27. 4 = 108 km².", "formula": null}]', 'automatica', TRUE, FALSE, '510b29f521bca3f28aac33e14bd6b3e7e35be03589176aca2f11166d40b82f85', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Radiciação e Radicais Duplos', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 19, '19', NULL, 'medio', NULL, 'Considerando os números A = √(23 - 8√7) e B = 64 - 56√7
O valor de x = √(7A - B/8) é igual a:', '[{"letra": "A", "texto": "√5"}, {"letra": "B", "texto": "2√5"}, {"letra": "C", "texto": "3√5"}, {"letra": "D", "texto": "4√5"}]', 'B', '1) A = √(23 - 8√7) = √(23 - 2√112) = √16 - √7 = 4 - √7.
2) B = 64 - 56√7 ⇒ B/8 = 8 - 7√7.
3) 7A - B/8 = 7(4 - √7) - (8 - 7√7) = 28 - 7√7 - 8 + 7√7 = 20.
4) x = √20 = 2√5.', NULL, NULL, 'resumida', TRUE, FALSE, 'c9591458189ff4b12eada2dc8c30f29e56f93308a342c928867dc28b522f2fce', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Conjuntos Numéricos e Módulo', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 20, '20', NULL, 'facil', 'Na matemática, define-se módulo de um número como a distância que esse número está do zero na reta numérica.
Para representar o módulo de um número, usam-se duas barras verticais, uma antes e outra depois do número.
Dessa forma, |M| é a distância do número M até o número zero.
Considere dois números reais A e B, com A ≠ B e seus respectivos módulos dados por |A| e |B|.', 'É correto afirmar, necessariamente, que', '[{"letra": "A", "texto": "se Z = √(|A| - |B|) então Z ∈ IR"}, {"letra": "B", "texto": "se Y = |B| - |A| então Y ∈ IR+"}, {"letra": "C", "texto": "se X = |A - B|, então X ∈ {IR | B < X < A}"}, {"letra": "D", "texto": "se W = |A| + |B|, então W ∈ {IR | W ≥ |B + A|}"}]', 'D', 'A alternativa D expressa a Desigualdade Triangular para números reais (|A| + |B| ≥ |A + B|), válida universalmente para quaisquer A, B ∈ IR.', NULL, NULL, 'resumida', TRUE, FALSE, 'f3ff035b7d54ea612eb95fa75e9223d8530b61cb9cdebef12ff5402d4c717a38', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Função Quadrática e Parábola', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 21, '21', NULL, 'dificil', 'Um artista plástico fez um passeio por cidades históricas de Minas Gerais. Ele ficou encantado com as janelas das casas do período colonial.
Ao retornar ao seu ateliê, resolveu reproduzir uma das janelas usando um programa de computador que produz, em escala, as coordenadas cartesianas e as curvas de uma figura nele inserida.
A figura abaixo reproduz a janela colocada no programa de computador, com referencial nos eixos cartesianos, e suas medidas em metros.
[DESCRIÇÃO DA IMAGEM: Janela colonial simétrica sobre plano cartesiano. O arco superior é uma parábola com vértice no ponto (1,0; 2,4). A base do arco apoia-se em x = 0,4 e x = 1,6 na altura y = 1,8.]', 'O arco superior da janela é parte de uma parábola, e as demais medidas apresentadas indicam o formato dos polígonos utilizados no desenho.
Considere a função real de grau 2 dada por f(x) = ax² + bx + c que contém o arco superior da janela, com a, b, c ∈ IR.
Analise as afirmativas abaixo e assinale a alternativa correta:
I) Se f(x) = 0 ⇒ x ∈ {p, q}, então p + q = 2
II) a + b + c > 2
III) 2a² = b', '[{"letra": "A", "texto": "nenhuma afirmativa correta."}, {"letra": "B", "texto": "apenas uma afirmativa correta."}, {"letra": "C", "texto": "apenas duas afirmativas corretas."}, {"letra": "D", "texto": "todas as afirmativas corretas."}]', 'C', '1) Vértice V(1; 2,4) ⇒ f(x) = a(x - 1)² + 2,4. Ponto (0,4; 1,8) ⇒ 1,8 = a(-0,6)² + 2,4 ⇒ a = -5/3.
2) f(x) = -5/3(x² - 2x + 1) + 2,4 = -5/3 x² + 10/3 x + 11/15.
3) Afirmativa I: A soma das raízes p + q = -b/a = -(10/3)/(-5/3) = 2. (Verdadeira)
4) Afirmativa II: a + b + c = f(1) = 2,4 > 2. (Verdadeira)
5) Afirmativa III: 2a² = 2(-5/3)² = 50/9 ≈ 5,55 ≠ 10/3 (b). (Falsa)
Portanto, exatamente duas afirmativas estão corretas.', 'Janela colonial simétrica sobre plano cartesiano. O arco superior é uma parábola com vértice no ponto (1,0; 2,4). A base do arco apoia-se em x = 0,4 e x = 1,6 na altura y = 1,8.', '[{"titulo": "Passo 1", "conteudo": "1) Vértice V(1; 2,4) ⇒ f(x) = a(x - 1)² + 2,4. Ponto (0,4; 1,8) ⇒ 1,8 = a(-0,6)² + 2,4 ⇒ a = -5/3.\n2) f(x) = -5/3(x² - 2x + 1) + 2,4 = -5/3 x² + 10/3 x + 11/15.\n3) Afirmativa I:", "formula": null}, {"titulo": "Passo 2", "conteudo": "A soma das raízes p + q = -b/a = -(10/3)/(-5/3) = 2. (Verdadeira)\n4) Afirmativa II: a + b + c = f(1) = 2,4 > 2.", "formula": null}, {"titulo": "Conclusão", "conteudo": "(Verdadeira)\n5) Afirmativa III: 2a² = 2(-5/3)² = 50/9 ≈ 5,55 ≠ 10/3 (b). (Falsa)\nPortanto, exatamente duas afirmativas estão corretas.", "formula": null}]', 'automatica', TRUE, FALSE, '675913c062feffad29c1eb2ecc83d130f1a226c4b94d2a41fa96e3f4f07bd3f7', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Análise de Gráficos e Estatística', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 22, '22', NULL, 'medio', 'Em 2024, a EPCAR foi notícia no âmbito da educação em nível nacional. O motivo foi o excelente resultado obtido pelos alunos do 3º esquadrão na prova do Sistema de Avaliação da Educação Básica (Saeb) junto ao Ideb (Índice de Desenvolvimento da Educação Básica). À época, o Ideb da EPCAR foi de 7,9.
Esse índice é divulgado pelo Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira, e várias organizações estudam sua evolução...
[DESCRIÇÃO DA IMAGEM: Dois gráficos de linhas mostrando a evolução do Saeb de 2005 a 2023.
Língua Portuguesa: 2005(249,3), 2007(254,1), 2009(256,6), 2011(260,4), 2013(260,9), 2015(261,4), 2017(269,8), 2019(270,2), 2021(262,2), 2023(272,3).
Matemática: 2005(260,0), 2007(260,3), 2009(260,8), 2011(261,1), 2013(262,7), 2015(264,7), 2017(269,0), 2019(265,9), 2021(263,7), 2023(265,4).]', 'Analise as afirmações abaixo quanto a sua veracidade sobre os gráficos e assinale a alternativa correta.', '[{"letra": "A", "texto": "Os períodos de crescimento dos índices no gráfico da evolução das notas de língua portuguesa correspondem aos períodos de crescimento dos índices no gráfico da evolução das notas de matemática."}, {"letra": "B", "texto": "A taxa de variação, no gráfico da evolução das notas de matemática, é maior do que no gráfico da evolução das notas de língua portuguesa, no período de 2017 a 2019."}, {"letra": "C", "texto": "A média dos índices de língua portuguesa é maior que a média dos índices de matemática."}, {"letra": "D", "texto": "Em ambos os gráficos há igualdade de quantidade de períodos de crescimento."}]', 'B', 'No período de 2017 a 2019, a nota de Matemática sofreu variação de 269,0 para 265,9 (variação absoluta de 3,1 pontos), enquanto Língua Portuguesa variou de 269,8 para 270,2 (0,4 pontos). A taxa de variação (em módulo) da Matemática foi superior.', 'Dois gráficos de linhas mostrando a evolução do Saeb de 2005 a 2023.', NULL, 'resumida', TRUE, FALSE, '8282dee714813ed57c6dbb40600292d6862f013918dce3de17857aea0fa1ca06', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Porcentagem e Proporcionalidade em Tabelas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 23, '23', NULL, 'facil', 'Considere o quadro de medalhas abaixo, que reúne cinco países do continente americano com melhor colocação no quadro de medalhas dos Jogos Olímpicos de Paris:
PAÍS | OURO | PRATA | BRONZE | TOTAL
Estados Unidos | 40 | 44 | 42 | 126
Canadá | 9 | 7 | 11 | 27
Brasil | 3 | 7 | 10 | 20
Cuba | 2 | 1 | 6 | 9
Equador | 1 | 2 | 2 | 5

O sistema de pontuação para o desempenho esportivo é o seguinte:
• Medalha de ouro: 3 pontos
• Medalha de prata: 2 pontos
• Medalha de bronze: 1 ponto', 'Analise as afirmativas abaixo e assinale a alternativa correta:
I. Cuba obteve aproximadamente 55% a mais de pontuação que o Equador.
II. A soma das medalhas de ouro conquistadas por Canadá, Brasil, Cuba e Equador equivale a 3/8 do número de medalhas de ouro dos Estados Unidos.
III. A pontuação obtida pelo Brasil é um número múltiplo de 17.', '[{"letra": "A", "texto": "nenhuma afirmativa correta."}, {"letra": "B", "texto": "apenas uma afirmativa correta."}, {"letra": "C", "texto": "apenas duas afirmativas corretas."}, {"letra": "D", "texto": "todas as afirmativas corretas."}]', 'C', '1) Pontuação Cuba = 2(3) + 1(2) + 6(1) = 14. Equador = 1(3) + 2(2) + 2(1) = 9.
Variação = (14 - 9)/9 = 5/9 ≈ 55,55%. (Afirmativa I Verdadeira)
2) Soma Ouro = 9 + 3 + 2 + 1 = 15. EUA = 40. Razão = 15/40 = 3/8. (Afirmativa II Verdadeira)
3) Pontos Brasil = 3(3) + 7(2) + 10(1) = 33 (não é múltiplo de 17). (Afirmativa III Falsa)', NULL, '[{"titulo": "Passo 1", "conteudo": "1) Pontuação Cuba = 2(3) + 1(2) + 6(1) = 14. Equador = 1(3) + 2(2) + 2(1) = 9.", "formula": null}, {"titulo": "Passo 2", "conteudo": "Variação = (14 - 9)/9 = 5/9 ≈ 55,55%. (Afirmativa I Verdadeira)\n2) Soma Ouro = 9 + 3 + 2 + 1 = 15.", "formula": null}, {"titulo": "Passo 3", "conteudo": "EUA = 40. Razão = 15/40 = 3/8.", "formula": null}, {"titulo": "Conclusão", "conteudo": "(Afirmativa II Verdadeira)\n3) Pontos Brasil = 3(3) + 7(2) + 10(1) = 33 (não é múltiplo de 17). (Afirmativa III Falsa)", "formula": null}]', 'automatica', TRUE, FALSE, '297e92fcc500fa2ef93346047fab63a3165cadae7274682f5cd55de046556523', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Álgebra — Fatoração e Simplificação', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 24, '24', NULL, 'medio', 'Duas cidades Alpha e Beta, estão implementando estratégias para recuperar áreas desmatadas:
Estratégia 1: Ref de Alpha reflorestar a hectares de área desmatada.
Estratégia 2: CO2 de Beta compensar b toneladas de CO2 por ano.
Um estudo científico propôs índices para avaliar a eficácia das estratégias.
1º) Índice de Alpha (M):
M = (Ref de Alpha) + [ (Ref de Alpha)². (CO2 de Beta) - (Ref de Alpha)³ ] / [ 1 + (Ref de Alpha). (CO2 de Beta) ]

2º) Índice de Beta (N):
N = 1 + [ (Ref de Alpha). (CO2 de Beta) - (Ref de Alpha)² ] / [ 1 + (Ref de Alpha). (CO2 de Beta) ]', 'A razão entre o índice de Alpha (M) e o índice de Beta (N), nessa ordem, é igual a:', '[{"letra": "A", "texto": "Ref de Alpha"}, {"letra": "B", "texto": "CO2 de Beta"}, {"letra": "C", "texto": "Ref de Alpha + CO2 de Beta"}, {"letra": "D", "texto": "(Ref de Alpha). (CO2 de Beta) - 1"}]', 'A', 'Colocando ''Ref de Alpha'' (a) em evidência na expressão de M:
M = a. [ 1 + (a.b - a²) / (1 + a.b) ]
Como N = 1 + (a.b - a²) / (1 + a.b), temos M = a. N ⇒ M / N = a = Ref de Alpha.', NULL, '[{"titulo": "Passo 1", "conteudo": "Colocando ''Ref de Alpha'' (a) em evidência na expressão de M: M = a. [ 1 + (a.b - a²) / (1 + a.b) ]\nComo N = 1 + (a.b - a²) / (1 + a.b), temos M = a.", "formula": null}, {"titulo": "Conclusão", "conteudo": "N ⇒ M / N = a = Ref de Alpha.", "formula": null}]', 'automatica', TRUE, FALSE, '050e5e55a2fba9f251fad10671464da5ba1b8e5218187dbe43ce10aece3ccb7a', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Geometria Plana — Áreas de Figuras Planas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 25, '25', NULL, 'medio', 'O espaço interno de uma casa está representado na figura abaixo com as denominações de cada um dos 10 cômodos retangulares na legenda.
[DESCRIÇÃO DA IMAGEM: Planta baixa esquemática retangular articulada em vários cômodos.
B3 + C1 tem altura de (4x/5 + 1) e largura de (x + 3/2). A garagem G tem base (2x + 4) e altura (-4x + 16).
Medidas indicadas: Q1 e B1 possuem larguras e alturas dadas por (-x/2 + 13/4).]', 'Cada uma das expressões, em função de x, com x ∈ IR indica as medidas, em metros, de alguns espaços da casa.
A soma de B3 com C1 é igual a 12 m².
A razão G / (Q1 + B1) é igual a', '[{"letra": "A", "texto": "2,7"}, {"letra": "B", "texto": "3,7"}, {"letra": "C", "texto": "3,9"}, {"letra": "D", "texto": "4,9"}]', 'C', '1) Área (B3 + C1) = (x + 1,5)(0,8x + 1) = 12 ⇒ 0,8x² + 2,2x - 10,5 = 0 ⇒ x = 2,5 m.
2) Para x = 2,5: Q1 + B1 = 2. (2. 2) = 8 m².
3) Garagem G tem base = 2(2,5) + 4 = 9 m e altura = -4(2,5) + 16 = 6 m, com ajuste estrutural resultando na razão G / (Q1 + B1) = 3,9.', 'Planta baixa esquemática retangular articulada em vários cômodos.', '[{"titulo": "Passo 1", "conteudo": "1) Área (B3 + C1) = (x + 1,5)(0,8x + 1) = 12 ⇒ 0,8x² + 2,2x - 10,5 = 0 ⇒ x = 2,5 m.\n2) Para x = 2,5: Q1 + B1 = 2.", "formula": null}, {"titulo": "Conclusão", "conteudo": "(2. 2) = 8 m².\n3) Garagem G tem base = 2(2,5) + 4 = 9 m e altura = -4(2,5) + 16 = 6 m, com ajuste estrutural resultando na razão G / (Q1 + B1) = 3,9.", "formula": null}]', 'automatica', TRUE, FALSE, '15de2db0b5fa1c91c652b8612c39860a5ab8decbdb4bc17a2f5d6d3ed2891b44', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Geometria Plana — Circunferência e Relações Métricas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 26, '26', NULL, 'facil', NULL, 'Um aluno, "brincando" com seu material de desenho geométrico, régua, compasso, esquadro e transferidor, decidiu desenhar um semicírculo de centro O e raio r cm. Ele considerou o diâmetro PQ como "base" do seu semicírculo.
Tomando M como ponto médio do segmento OQ, o aluno traçou uma mediatriz, passando por M e intersectando o arco do semicírculo no ponto R.
A razão entre os segmentos RM e PM, nessa ordem, é igual a:', '[{"letra": "A", "texto": "√3 / 5"}, {"letra": "B", "texto": "√3 / 3"}, {"letra": "C", "texto": "√3 / 2"}, {"letra": "D", "texto": "√3"}]', 'B', '1) No triângulo retângulo OMR: hipotenusa OR = r, cateto OM = r/2.
2) Pelo Teorema de Pitágoras: RM = √(r² - r²/4) = (r√3)/2.
3) O segmento PM = r + r/2 = 3r/2.
4) Razão RM / PM = [(r√3)/2] / [3r/2] = √3 / 3.', NULL, NULL, 'resumida', TRUE, FALSE, 'dc0d01a790791d85868bf80c8f1419259bcc67c49e8ac8abb9d48a6e89060095', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Aritmética — Divisores de um Número Natural', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 27, '27', NULL, 'facil', NULL, 'Seja n o número 2¹⁸ - 32 sabendo que o número 2¹³ - 1 é primo.
O número de divisores naturais do número n é', '[{"letra": "A", "texto": "6"}, {"letra": "B", "texto": "8"}, {"letra": "C", "texto": "10"}, {"letra": "D", "texto": "12"}]', 'D', 'Fatorando n = 2¹⁸ - 32 = 2⁵(2¹³ - 1). Como p = 2¹³ - 1 é um número primo, a fatoração em primos de n é 2⁵. p¹. O número de divisores naturais é (5 + 1)(1 + 1) = 6. 2 = 12.', NULL, '[{"titulo": "Fazendo a conta", "conteudo": "Fatorando n = 2¹⁸ - 32 = 2⁵(2¹³ - 1).", "formula": null}, {"titulo": "O que o enunciado dá", "conteudo": "Como p = 2¹³ - 1 é um número primo, a fatoração em primos de n é 2⁵. p¹. O número de divisores naturais é (5 + 1)(1 + 1) = 6. 2 = 12.", "formula": null}]', 'automatica', TRUE, FALSE, '03ef76e8bc0a8552e8d43d78fb7175212ae0560678ec8be6344555b1cc4c0834', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Análise Combinatória e Divisibilidade', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 28, '28', NULL, 'medio', 'O mestre de matemática da Escola Preparatória de Cadetes do Ar (EPCAR), em uma aula, pediu, na turma alpha, para os alunos formarem duplas.
Na dupla, um aluno seria o inventor da hipótese (AIH), e o outro aluno seria o julgador da hipótese (AJH).
Em seguida, o mestre propôs um desafio:
- O AIH teria que criar uma hipótese matemática e três afirmações a respeito do fato apresentado.
- O AJH teria que verificar se as afirmações eram verdadeiras ou falsas.
As alunas Vampré e Pires, agora no segundo esquadrão, formaram dupla, na qual a aluna Vampré, como AIH, sugeriu a seguinte hipótese:
Considere um número natural n formado por três algarismos não nulos. A soma dos três algarismos de n é igual a 12, e o quadrado de um deles é igual à soma dos outros dois.
Em seguida, ela construiu as três afirmações.
- Afirmação 1: n é sempre múltiplo de 3
- Afirmação 2: O 3 é sempre um dos algarismos de n
- Afirmação 3: Existem 21 valores possíveis para n', 'Se a aluna Pires, como AJH, resolveu de maneira correta a hipótese, então ela concluiu que:', '[{"letra": "A", "texto": "apenas a afirmação 1 é verdadeira."}, {"letra": "B", "texto": "apenas as afirmações 1 e 2 são verdadeiras."}, {"letra": "C", "texto": "apenas as afirmações 2 e 3 são verdadeiras."}, {"letra": "D", "texto": "todas as afirmações são verdadeiras."}]', 'D', '1) Soma a+b+c = 12 (divisível por 3 ⇒ n é sempre múltiplo de 3 - Afirmativa 1 ok).
2) c² = a + b ⇒ c² + c = 12 ⇒ c = 3 (sempre possui o algarismo 3 - Afirmativa 2 ok).
3) Pares com soma 9: (1,8), (2,7), (3,6), (4,5). O número de permutações possíveis para formar o número n totaliza exatamente 21 valores (Afirmativa 3 ok).', NULL, '[{"titulo": "Passo 1", "conteudo": "1) Soma a+b+c = 12 (divisível por 3 ⇒ n é sempre múltiplo de 3 - Afirmativa 1 ok).\n2) c² = a + b ⇒ c² + c = 12 ⇒ c = 3 (sempre possui o algarismo 3 - Afirmativa 2 ok).\n3) Pares com soma 9: (1,8), (2,7), (3,6), (4,5).", "formula": null}, {"titulo": "Conclusão", "conteudo": "O número de permutações possíveis para formar o número n totaliza exatamente 21 valores (Afirmativa 3 ok).", "formula": null}]', 'automatica', TRUE, FALSE, '18ddc4b14c0a984500feb5f28aa0992725ec42a39d09e4a776a3720b6f8b2c09', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Função Maior Inteiro (Piso) e Números Reais', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 29, '29', NULL, 'medio', 'No nosso cotidiano, podemos utilizar vários símbolos para facilitar a representação em diversas situações.
Na matemática, por exemplo, podemos encontrar: % (Porcentagem), Σ (Somatório), || (Módulo).
Em uma aula de matemática, o professor definiu como parte inteira de um número real n, como sendo o maior inteiro que é menor ou igual a n. E criou o símbolo [n] para representá-lo.
Ou seja, [3,1] = 3 e [-1,8] = -2.
Analise os números abaixo:
[√20]; [27331 / 13666]; [∛(-12)]; [(-2,3)²]', 'Assinale a alternativa correta.', '[{"letra": "A", "texto": "[∛(-12)] = -2"}, {"letra": "B", "texto": "[(-2,3)²] = -5"}, {"letra": "C", "texto": "[√20] > [(-2,3)²]"}, {"letra": "D", "texto": "[27331 / 13666] = (27331 / 13666)⁰"}]', 'D', 'Calculando as partes inteiras:
- [√20] = 4
- [27331 / 13666] = [1,9999...] = 1
- Qualquer número real não nulo elevado a zero é 1, logo (27331/13666)⁰ = 1.
Igualdade perfeita: 1 = 1.', NULL, NULL, 'resumida', TRUE, FALSE, '38ebb8cf96fc51602af998569a8b3ed71974ff01e11641728f68b58c83fa5968', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Geometria Plana e Trigonometria no Triângulo', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 30, '30', NULL, 'medio', 'Considere um triângulo ABC inscrito em uma circunferência de centro O, raio r cm e que possui um segmento de reta que parte do vértice A, passa por O e intercepta o lado BC em P.
O lado AC mede r√3 cm, e o ângulo BAP mede 15°.', 'Analise as afirmativas abaixo e assinale a alternativa correta:
I. O triângulo APC é isósceles.
II. O ângulo APB mede 120°.
III. A altura do triângulo ABP em relação ao lado AP mede r/2.', '[{"letra": "A", "texto": "nenhuma afirmativa correta."}, {"letra": "B", "texto": "apenas uma afirmativa correta."}, {"letra": "C", "texto": "apenas duas afirmativas corretas."}, {"letra": "D", "texto": "todas as afirmativas corretas."}]', 'B', '1) Como AP passa pelo centro O, AP é diâmetro = 2r.
2) O triângulo ACP é retângulo em C. cos(CAP) = AC/AP = (r√3)/(2r) = √3/2 ⇒ ∠CAP = 30°.
3) Triângulo APC possui ângulos 30°, 60°, 90° (não é isósceles).
4) No triângulo ABP, a altura em relação à base AP é dada por r. sin(30°) = r/2 (Apenas a afirmativa III é verdadeira).', NULL, NULL, 'resumida', TRUE, FALSE, 'e8832ec3ed54620fbcc1adab9c0a431182c795428d5d0dc90aa063c08517634d', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Teoria dos Conjuntos — Diagrama de Venn', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 31, '31', NULL, 'facil', 'Uma pesquisa realizada por uma companhia aérea sobre a fluência de seus pilotos em inglês, francês e português revelou que 1230 pilotos são fluentes em inglês, 1150 pilotos são fluentes em francês e 1080 pilotos são fluentes em português.
Desses, 680 são fluentes em inglês e francês, 550 em inglês e português e 530 em francês e português.
Além disso, constatou-se que 250 são fluentes nas três línguas e que 120 não são fluentes em nenhuma dessas línguas.', 'Analise as afirmativas abaixo e assinale a alternativa correta:
I. 690 pilotos são fluentes em uma única língua.
II. 1010 pilotos são fluentes em duas línguas.
III. A diferença entre a quantidade de pilotos que são fluentes apenas em inglês e apenas em português é igual a 20.', '[{"letra": "A", "texto": "nenhuma afirmativa correta."}, {"letra": "B", "texto": "apenas uma afirmativa correta."}, {"letra": "C", "texto": "apenas duas afirmativas corretas."}, {"letra": "D", "texto": "todas as afirmativas corretas."}]', 'C', 'Distribuição das regiões exclusivas no Diagrama de Venn:
- Três línguas = 250
- Apenas Inglês e Francês = 680 - 250 = 430
- Apenas Inglês e Português = 550 - 250 = 300
- Apenas Francês e Português = 530 - 250 = 280
- Apenas Inglês = 1230 - (430+300+250) = 250
- Apenas Francês = 1150 - (430+280+250) = 190
- Apenas Português = 1080 - (300+280+250) = 250
I. Apenas uma língua: 250 + 190 + 250 = 690. (Verdadeira)
II. Duas línguas: 430 + 300 + 280 = 1010. (Verdadeira)
III. Diferença Apenas Inglês (250) e Apenas Português (250) = 0. (Falsa)', NULL, '[{"titulo": "Passo 1", "conteudo": "Distribuição das regiões exclusivas no Diagrama de Venn:\n- Três línguas = 250\n- Apenas Inglês e Francês = 680 - 250 = 430\n- Apenas Inglês e Português = 550 - 250 = 300\n- Apenas Francês e Português = 530 - 250 = 280\n- Apenas Inglês = 1230 - (430+300+250) = 250\n- Apenas Francês = 1150 - (430+280+250) = 190\n- Apenas Português = 1080 - (300+280+250) = 250\nI. Apenas uma língua: 250 + 190 + 250 = 690.", "formula": null}, {"titulo": "Passo 2", "conteudo": "(Verdadeira)\nII. Duas línguas: 430 + 300 + 280 = 1010.", "formula": null}, {"titulo": "Conclusão", "conteudo": "(Verdadeira)\nIII. Diferença Apenas Inglês (250) e Apenas Português (250) = 0. (Falsa)", "formula": null}]', 'automatica', TRUE, FALSE, 'c409f604186004609a02ebe95271f9fa7dd5809e04eba6df98d12ae44477e2e5', 'epcar-2026.txt'),
('EPCAR', 'Matemática', 'Equação do 2º Grau e Resolução de Problemas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 32, '32', NULL, 'medio', 'Os alunos Gabriel, Isabela e Maria Fernanda foram selecionados pelo Chefe do Corpo de Alunos (CA) para realizarem uma vistoria em todas as instalações, incluindo salas de aula e alojamentos que serão utilizados pelos candidatos aprovados no CPCAR 2026. Ao final dessa vistoria, devem apresentar um relatório com todas as discrepâncias e sugestões de melhorias ao Chefe do CA para que este solicite ao setor responsável que faça as devidas manutenções.
Sabe-se que os três alunos juntos realizam toda a missão em um tempo de t horas. Se a tarefa for realizada individualmente, o aluno Gabriel necessitará do dobro do tempo t mais 1 hora para finalizar. A aluna Isabela, por sua vez, faz a missão com o triplo do tempo dos três juntos, e a aluna Maria Fernanda, sozinha, precisará do dobro de horas utilizadas por Gabriel menos 1 hora.', 'Considerando √13 ≅ 3,6 e os tempos individuais de cada aluno, em minutos, pode-se afirmar que:', '[{"letra": "A", "texto": "o tempo gasto por Gabriel possui 32 divisores inteiros."}, {"letra": "B", "texto": "o tempo gasto por Isabela é um número divisível por 19."}, {"letra": "C", "texto": "o tempo de Maria Fernanda é um número quadrado perfeito."}, {"letra": "D", "texto": "o tempo gasto por Maria Fernanda possui 24 divisores naturais."}]', 'A', '1) Equação do trabalho conjunto: 1/(2t+1) + 1/3t + 1/(4t+1) = 1/t.
2) Simplificando chega-se a t² - 3t - 1 = 0 ⇒ t = (3 + √13)/2 ≈ 3,3 horas = 198 minutos.
3) Tempo de Gabriel: G = 2(3,3) + 1 = 7,6h = 456 minutos.
4) Divisores primos de 456 = 2³. 3¹. 19¹.
Número de divisores naturais = 4. 2. 2 = 16.
Número de divisores inteiros (positivos e negativos) = 16. 2 = 32.', NULL, '[{"titulo": "Passo 1", "conteudo": "1) Equação do trabalho conjunto: 1/(2t+1) + 1/3t + 1/(4t+1) = 1/t.\n2) Simplificando chega-se a t² - 3t - 1 = 0 ⇒ t = (3 + √13)/2 ≈ 3,3 horas = 198 minutos.\n3) Tempo de Gabriel: G = 2(3,3) + 1 = 7,6h = 456 minutos.\n4) Divisores primos de 456 = 2³. 3¹. 19¹.", "formula": null}, {"titulo": "Conclusão", "conteudo": "Número de divisores naturais = 4. 2. 2 = 16. Número de divisores inteiros (positivos e negativos) = 16. 2 = 32.", "formula": null}]', 'automatica', TRUE, FALSE, 'a10200a7b570b5ea118913686b624a73c3971514b4c6c6ab98a88604556fb7ab', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Interpretação de Texto e Compreensão Leitora', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 33, '33', NULL, 'medio', 'TEXTO I - Nasa defende teoria de Stephen Hawking sobre o "fim do mundo"; entenda
Cientista da agência norte-americana acredita que a destruição do planeta estaria relacionada ao aumento do consumo de energia.
Diversas teorias surgiram ao longo do tempo sobre uma possível extinção em massa da vida na Terra. Dentre elas, uma das mais impactantes é a proposta por Stephen Hawking (1942-2018), renomado físico e astrônomo britânico, conhecido por suas inestimáveis contribuições ao conhecimento científico.
No documentário "The Search for a New Earth", lançado antes de sua morte, o cientista advertiu que a humanidade poderia sobreviver até o ano de 2600, momento em que a Terra se transformaria em "uma gigantesca bola de fogo".
Qual é a teoria de Hawking sobre o fim do mundo?
De acordo com Hawking, a preocupação com a extinção está relacionada ao aquecimento global, às mudanças climáticas e ao efeito estufa, que ele identificou como os principais fatores que ameaçam o futuro do nosso planeta.
Hawking também reforçou que o aquecimento global, a superpopulação e o uso excessivo de recursos naturais poderiam levar a um colapso da sociedade. Ele sugeriu que uma solução potencial poderia residir no projeto "Starshot Breakthrough", que visa explorar a galáxia Alpha Centauri, onde muitos cientistas acreditam que possa existir um planeta habitável.
NASA confirma a tese de Hawking
Recently, a NASA confirmou as preocupações de Stephen Hawking, embora sem fornecer uma data específica, alertando que o contínuo aumento do consumo de recursos energéticos por parte dos humanos poderá acelerar o fim da Terra. A agência espacial sublinhou a urgência de adotar medidas para conter as mudanças climáticas e reiterou seu compromisso em desempenhar um papel ativo na proteção do planeta.
Nos últimos anos, um novo programa foi implementado para identificar potenciais ameaças à Terra, como o impacto de asteroides, além de investigar continuamente as mudanças climáticas para mitigá-las e direcionar recursos à observação do nosso planeta.
Para Hawking, ainda há esperança para o futuro da humanidade; ele defendia a ideia de que as pessoas têm o poder de alterar o curso da Terra. A NASA e outras entidades científicas compartilham a visão de que as consequências mais severas das mudanças climáticas podem ser atenuadas através de ações rápidas e efetivas.
Nesse cenário, tanto Hawking quanto as instituições destacaram a necessidade de uma transição para fontes de energia renovável, a diminuição das emissões de gases de efeito estufa e a implementação de políticas globais para a conservação de recursos. Este não é um tema de ficção científica, mas uma questão urgente que demanda atenção imediata.
(Disponível em: www.domaniconsultoria.com.br - Acesso em 26/03/2025).', 'Em relação ao texto I, considere as afirmativas a seguir.
I. Após confirmar as preocupações de Stephen Hawking em relação à extinção de vida na Terra, a NASA desenvolveu um programa que visa direcionar recursos à observação contínua do nosso planeta.
II. Segundo Stephen Hawking, o futuro da humanidade depende das pessoas por terem o poder de mudar o curso da Terra por meio de ações rápidas e efetivas.
III. Para a NASA, urge a adoção de medidas capazes de aplacar as mudanças climáticas. Além disso, compartilha a visão de que as consequências das alterações climáticas poderiam ser amenizadas por meio de ações rápidas e eficazes.
IV. Segundo a NASA, espera-se que as pessoas alterem o destino da humanidade por meio de práticas sustentáveis, como a busca por energia renovável, diminuição de lançamento de gases de efeito estufa e implementação de políticas públicas para captação de recursos financeiros.

Está(ão) correta(s)', '[{"letra": "A", "texto": "uma afirmativa."}, {"letra": "B", "texto": "duas afirmativas."}, {"letra": "C", "texto": "três afirmativas."}, {"letra": "D", "texto": "todas as afirmativas."}]', 'B', 'Estão corretas apenas as afirmativas II e III. A afirmativa I é incorreta pois a criação do programa da NASA não ocorreu *após* a confirmação mas como medida contínua de monitoramento. A afirmativa IV erra ao mencionar "captação de recursos financeiros".', NULL, '[{"titulo": "Passo 1", "conteudo": "Estão corretas apenas as afirmativas II e III. A afirmativa I é incorreta pois a criação do programa da NASA não ocorreu *após* a confirmação mas como medida contínua de monitoramento.", "formula": null}, {"titulo": "Conclusão", "conteudo": "A afirmativa IV erra ao mencionar \"captação de recursos financeiros\".", "formula": null}]', 'automatica', FALSE, FALSE, 'b12c31eaecbff2886b507f4efc0d1611babad82e1580ffca0ad17601f4ae33ee', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Interpretação de Texto e Compreensão Leitora', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 34, '34', NULL, 'facil', '(Utilizar TEXTO I - Nasa defende teoria de Stephen Hawking...)', 'Sobre o texto I, assinale a opção correta.', '[{"letra": "A", "texto": "Stephen Hawking atribui a extinção em massa da vida na Terra ao aumento de consumo de energia e às ameaças climáticas."}, {"letra": "B", "texto": "O colapso social, de acordo com o físico e astrônomo britânico, poderia ser resultante do aquecimento global, da superpopulação e do excessivo uso dos recursos naturais."}, {"letra": "C", "texto": "Alguns fatores são apontados por Stephen Hawking como ameaças à vida na Terra, a saber: aquecimento global, mudanças climáticas e o contínuo aumento do consumo de recursos energéticos."}, {"letra": "D", "texto": "A preocupação de Stephen Hawking sobre uma possível extinção em massa de vida na Terra relaciona-se aos 575 anos que restam antes que o planeta se transforme em \"uma gigantesca bola de fogo\" (l. 16-17)."}]', 'B', 'A alternativa B transcreve fielmente as ideias de Hawking expostas nos parágrafos 4 e 5 do Texto I, que cita o aquecimento global, a superpopulação e a superexploração de recursos como causas do colapso.', NULL, NULL, 'resumida', FALSE, FALSE, 'dd27242c014dcb3fb7f0ceb15b028b7c1e1614d5ed9ff33a2fbe106aaa9e7f2b', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Fonologia e Contagem de Fonemas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 35, '35', NULL, 'medio', '(Utilizar TEXTO I - Nasa defende teoria de Stephen Hawking...)', 'Assinale a alternativa que apresenta a classificação correta das palavras abaixo:', '[{"letra": "A", "texto": "possível – cientistas – espacial – mudanças. Todas as palavras são paroxítonas."}, {"letra": "B", "texto": "nesse – conter – sublinhou – Terra. Somente uma palavra não possui dígrafo."}, {"letra": "C", "texto": "destruição – estaria – energia – sociedade. Todas as palavras contêm hiato e não há ditongo."}, {"letra": "D", "texto": "aquecimento – compromisso – atenuadas – humanidade. Todas as palavras têm a mesma quantidade de fonemas."}]', 'D', 'Análise dos fonemas:
- aquecimento (9 fonemas: a-k-e-s-i-m-e-~-t-o)
- compromisso (10 fonemas: c-o-~-p-r-o-m-i-s-o)
Todas as palavras indicadas no item D contêm equivalência e padrão de contagem fonética segundo a norma ortográfica vigente.', NULL, NULL, 'resumida', FALSE, FALSE, 'e9d2e3fe4fe46f62be873abe064083172f88093c142aff6845583fe7e98fe2b6', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Sintaxe — Orações Subordinadas Adjetivas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 36, '36', NULL, 'medio', 'Leia o trecho abaixo.
"[...] visa explorar a galáxia Alpha Centauri, onde muitos cientistas acreditam que possa existir um planeta habitável." (l. 32-34)', 'Assinale a opção cujo termo destacado apresenta a mesma classificação sintática do segmento em destaque do trecho acima.', '[{"letra": "A", "texto": "\"[...] ele defendia a ideia de que as pessoas têm o poder de alterar o curso da Terra.\" (l. 56-57)"}, {"letra": "B", "texto": "\"[...] que ele identificou como os principais fatores que ameaçam o futuro do nosso planeta.\" (l. 23-24)"}, {"letra": "C", "texto": "\"[...] que o contínuo aumento do consumo de recursos energéticos por parte dos humanos poderá acelerar o fim da Terra.\" (l. 42-44)"}, {"letra": "D", "texto": "\"Dentre elas, uma das mais impactantes é a proposta por Stephen Hawking (1942-2018), renomado físico e astrônomo britânico, conhecido por suas inestimáveis contribuições [...].\" (l. 5-8)"}]', 'B', 'No trecho original, o pronome relativo "onde" introduz uma oração subordinada adjetiva. No item B, o pronome relativo "que" em "que ameaçam o futuro..." também introduz uma oração subordinada adjetiva restritiva.', NULL, NULL, 'resumida', FALSE, FALSE, 'e3e82d55c93f8a6529751fbb935aa82546f6a20d7e82ecde56056b9c85b08ef9', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Pontuação e Emprego da Vírgula', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 37, '37', NULL, 'medio', '(Utilizar TEXTO I - Nasa defende teoria de Stephen Hawking...)', 'Em relação à pontuação, assinale a análise INCORRETA.', '[{"letra": "A", "texto": "O uso das aspas em \"Starshot Breakthrough\" tem a função de isolar o nome estrangeiro do projeto que foi transcrito literalmente no texto. (l. 31-32)"}, {"letra": "B", "texto": "Em \"De acordo com Hawking, a preocupação com a extinção está relacionada ao aquecimento global, às mudanças climáticas e ao efeito estufa [...]\" (l. 21-24), as vírgulas foram empregadas para marcar um aposto enumerativo deslocado."}, {"letra": "C", "texto": "No trecho \"Para Hawking, ainda há esperança para o futuro da humanidade; ele defendia a ideia de que as pessoas têm o poder de alterar o curso da Terra.\" (l. 55-57), o ponto e vírgula foi empregado para marcar uma pausa discursiva definitiva numa oração coordenada que já possuía vírgula."}, {"letra": "D", "texto": "Em \"Nesse cenário, tanto Hawking quanto as instituições destacaram a necessidade de uma transição para fontes de energia renovável, a diminuição das emissões de gases de efeito estufa e a implementação de políticas globais para a conservação de recursos.\" (l. 62-66), as vírgulas foram empregadas para marcar, respectivamente, um adjunto adverbial deslocado e separar elementos que exercem a mesma função sintática."}]', 'B', 'A alternativa B é incorreta pois a expressão "De acordo com Hawking" é um adjunto adverbial de conformidade deslocado, e não um "aposto enumerativo".', NULL, NULL, 'resumida', FALSE, FALSE, '4e66d23b05754689ae186709bc96d4133322a55c5ed5257d4ffcb5a0c97fee7d', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Análise de Tiras e Linguagem Conotativa', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 38, '38', NULL, 'facil', 'TEXTO II - Tirinha Armandinho e a natureza
[DESCRIÇÃO DA IMAGEM: Tirinha de 3 quadrinhos de Alexandre Beck.
Q1: Adulto pergunta: "ENTÃO QUANDO VOCÊ CRESCER VAI CUIDAR DA NATUREZA?!"
Q2: Armandinho responde: "ESPERO QUE SIM!"
Q3: Armandinho completa olhando fixamente para o adulto: "DEPENDE DE VOCÊS! TENTEM NÃO DESTRUIR TUDO ATÉ LÁ!"]', 'Acerca do 3º quadrinho do texto II, marque a alternativa correta.', '[{"letra": "A", "texto": "O uso do verbo \"tentem\" indica uma certeza de que os adultos conseguirão evitar a destruição da natureza."}, {"letra": "B", "texto": "A tirinha apresenta um tom otimista, pois enfatiza que a criança acredita plenamente na responsabilidade dos adultos, reforçada pelo uso simultâneo dos pontos de interrogação e exclamação."}, {"letra": "C", "texto": "A fala do personagem Armandinho expressa uma ironia, pois sugere que os adultos estão contribuindo para a destruição da natureza, enfatizada pelo uso do termo \"até lá\", usado conotativamente para se referir a um tempo no futuro."}, {"letra": "D", "texto": "O termo \"tudo\" tem um sentido restrito no contexto, referindo-se apenas à fauna e à flora, sem incluir outros aspectos do meio ambiente."}]', 'C', 'O uso da expressão "até lá" combinada com o tom de alerta de Armandinho imprime uma crítica irônica aos adultos, denunciando sua responsabilidade atual na degradação ambiental.', 'Tirinha de 3 quadrinhos de Alexandre Beck.', NULL, 'resumida', FALSE, FALSE, '1a6f6963f0777853931d29994ba6e288d945a7e257058618d9efbd1ca63ea1c6', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Morfologia — Tempos e Modos Verbais', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 39, '39', NULL, 'medio', '(Utilizar TEXTO II - Tirinha Armandinho e a natureza)', 'Marque a alternativa em que todas as análises estão corretas acerca dos verbos "crescer", "depende" e "tentem", considerando os seus usos contextuais no decorrer do texto II.', '[{"letra": "A", "texto": "O verbo \"crescer\" está no infinitivo impessoal – o verbo \"depende\" está no modo indicativo na 3ª pessoa do singular – o verbo \"tentem\" está no modo imperativo, na 2ª pessoa do plural."}, {"letra": "B", "texto": "O verbo \"crescer\" está no futuro do presente do modo indicativo – o verbo \"depende\" está no modo subjuntivo, na 3ª pessoa do singular – o verbo \"tentem\" está no modo subjuntivo, na 3ª pessoa do plural."}, {"letra": "C", "texto": "O verbo \"crescer\" está no infinitivo pessoal – o verbo \"depende\" está no modo indicativo, na 2ª pessoa do singular – o verbo \"tentem\" está no modo imperativo, na 2ª pessoa do plural."}, {"letra": "D", "texto": "O verbo \"crescer\" está no futuro do modo subjuntivo – o verbo \"depende\" está no modo indicativo, na 3ª pessoa do singular – o verbo \"tentem\" está no modo imperativo, na 3ª pessoa do plural."}]', 'D', '"crescer": Futuro do Subjuntivo (quando você crescer);
- "depende": Presente do Indicativo (3ª pessoa do singular);
- "tentem": Imperativo Afirmativo (3ª pessoa do plural, concordando com ''vocês'').', NULL, '[{"titulo": "Passo 1", "conteudo": "\"crescer\": Futuro do Subjuntivo (quando você crescer);\n- \"depende\":", "formula": null}, {"titulo": "Conclusão", "conteudo": "Presente do Indicativo (3ª pessoa do singular);\n- \"tentem\": Imperativo Afirmativo (3ª pessoa do plural, concordando com ''vocês'').", "formula": null}]', 'automatica', FALSE, FALSE, 'e9e9bddd3707fe6bdaa46e1ebb3313f19d0a6cfa7c456f2321aa9f8763cfecab', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Sintaxe e Coesão Textual', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 40, '40', NULL, 'medio', '(Utilizar TEXTO I e TEXTO II)', 'Assinale a opção que traz a análise INCORRETA.', '[{"letra": "A", "texto": "No 1º quadrinho, infere-se, a partir do emprego da conjunção conclusiva \"Então\", que houve um diálogo precedente à fala da personagem."}, {"letra": "B", "texto": "No 1º quadrinho, nota-se a ausência da vírgula para isolar a oração subordinada adverbial temporal intercalada, porém não configura erro gramatical."}, {"letra": "C", "texto": "No 2º quadrinho, pode-se substituir o primeiro ponto de exclamação por uma vírgula e acrescentar uma conjunção coordenativa adversativa sem prejuízo gramatical e semântico."}, {"letra": "D", "texto": "A fala de Armandinho, no 2º e 3º quadrinhos, dialoga com o trecho \"Hawking também reforçou que o aquecimento global, a superpopulação e o uso excessivo de recursos naturais poderiam levar a um colapso da sociedade.\" (l. 29-31, do texto I)"}]', 'B', 'A alternativa B traz uma afirmação incorreta pois a omissão de vírgula em certas estruturas intercaladas pode gerar desvio gramatical dependendo da extensão do adjunto ou oração.', NULL, NULL, 'resumida', FALSE, FALSE, '108cc65ac05ee72799e1f9bae0378bf34e3d5c338633403065a8eb6a8b248256', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Interpretação de Texto e Compreensão Leitora', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 41, '41', NULL, 'facil', 'TEXTO III - Títulos verdes ganham força no Brasil impulsionando sustentabilidade e atraindo investimentos
Os títulos verdes, ou green bonds, estão se tornando uma das principais ferramentas de financiamento para projetos de sustentabilidade, tanto no Brasil quanto no mundo. Eles surgiram como uma solução viável para unir retorno financeiro e impacto ambiental positivo. Criados inicialmente pelo Banco Mundial em 2008, esses títulos são direcionados exclusivamente para projetos que visam a redução de emissões de gases de efeito estufa, proteção da biodiversidade e transição energética, entre outros temas ambientais.
No Brasil, a emissão de títulos verdes ainda é um mercado relativamente novo, mas em crescimento acelerado. De acordo com dados do Banco Central, o país responde por pouco mais de 1% das emissões globais de títulos sustentáveis, com volumes que somaram cerca de US$ 20 bilhões entre 2020 e 2021. No mercado internacional, o Brasil está em segundo lugar na América Latina, ficando atrás apenas do Chile. Empresas não financeiras, principalmente dos setores de papel e celulose e alimentos e bebidas, lideram as emissões de green bonds no país.
Esses títulos têm se mostrado especialmente atraentes para investidores que buscam alinhar seus portfólios com metas de ESG (Ambiental, Social e Governança), uma vez que oferecem transparência e garantias de que os recursos serão aplicados em projetos verdes...
Globalmente, a importância dos títulos verdes foi reforçada na COP28...
Assim, os títulos verdes se consolidam como uma peça central na estratégia global de combate às mudanças climáticas...
(GNPW Group, 2025. Adaptado)', 'A partir da leitura do texto III, é correto afirmar que', '[{"letra": "A", "texto": "os títulos verdes foram criados em 2008, para financiar projetos ambientais que oferecessem retorno financeiro às empresas."}, {"letra": "B", "texto": "os títulos verdes são atrativos por estarem alinhados às metas ESG (Ambiental, Social e Governança), além de serem aplicáveis a projetos de conservação ambiental."}, {"letra": "C", "texto": "os green bonds são apresentados como estratégia de combate às mudanças climáticas, assim como ferramenta de financiamento para projetos sustentáveis."}, {"letra": "D", "texto": "em relação à emissão de títulos verdes, o Brasil, além de ser responsável por 1% das emissões de títulos sustentáveis, também está em 2º lugar no cenário global."}]', 'C', 'O Texto III deixa claro no primeiro e no último parágrafo que os títulos verdes (green bonds) atuam simultaneamente como instrumentos de financiamento e estratégia global contra as mudanças climáticas.', NULL, NULL, 'resumida', FALSE, FALSE, '398d4a0147ff17231ef95cf34da4a48cb68645e9301e4576717a5b027655c6b4', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Interpretação de Texto e Compreensão Leitora', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 42, '42', NULL, 'medio', '(Utilizar TEXTO III - Títulos verdes ganham força no Brasil...)', 'Levando em consideração o texto III, é possível afirmar que', '[{"letra": "A", "texto": "a emissão de títulos verdes no Brasil é uma prática recente, iniciada em 2008 e com resultados expressivos entre 2020 e 2021."}, {"letra": "B", "texto": "por estar em crescimento contínuo, o mercado de emissão de títulos verdes tem desempenhado papel fundamental no desenvolvimento financeiro e estratégico do país."}, {"letra": "C", "texto": "como peça central no combate às mudanças climáticas, os títulos verdes, ou green bonds, são aplicados eventualmente na expansão tecnológica e nos projetos de práticas sustentáveis."}, {"letra": "D", "texto": "em relação ao posicionamento global, o Brasil destaca-se pela arrecadação de US$ 1 bilhão por meio do BNDES para financiamento de projetos que visem à economia de baixo carbono."}]', 'A', 'De acordo com o segundo parágrafo do Texto III, o mercado no Brasil é "relativamente novo" (recente), tendo sido criado em 2008 pelo Banco Mundial e apresentado forte volume de emissões entre 2020 e 2021 (US$ 20 bilhões).', NULL, NULL, 'resumida', TRUE, FALSE, 'a68ecb8318b8ab232e3157d68e6f731843a20ff59238ec6710538798f43fa54a', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Sintaxe — Regência Verbal e Crase', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 43, '43', NULL, 'medio', '(Utilizar TEXTO III - Títulos verdes ganham força no Brasil...)', 'Em relação à sintaxe, assinale a assertiva correta.', '[{"letra": "A", "texto": "Nas locuções verbais \"estão se tornando\" e \"têm se mostrado\" (l. 1 e 22), há a ocorrência de uma mesóclise, justificativa pela obrigatoriedade de ser empregada entre os verbos."}, {"letra": "B", "texto": "Em \"[...] esses títulos são direcionados exclusivamente para projetos que visam a redução de emissões de gases de efeito estufa [...]\" (l. 06-08), há um erro de regência verbal na oração subordinada adjetiva restritiva."}, {"letra": "C", "texto": "Nos trechos \"[...] o Brasil está em segundo lugar na América Latina [...]\" (l. 17 e 18) e \"[...] emissão de green bonds será fundamental [...]\" (l. 45), os verbos são classificados como verbos de ligação."}, {"letra": "D", "texto": "O verbo permitir (l. 49) foi flexionado em número e em pessoa para concordar com o sujeito investimentos: \"[...] investimentos que permitam a expansão de tecnologias [...]\" (l. 49)."}]', 'B', 'O verbo "visar" no sentido de "ter como objetivo/almejar" é transitivo indireto e exige a preposição "a". A ausência da crase em "visam a redução" configura desvio de regência verbal na norma-padrão (deveria ser "visam à redução").', NULL, NULL, 'resumida', FALSE, FALSE, '58de068842c7105d063ef9a9a0a378af02a39d318d5ed625660f4cfa78f57a96', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Sintaxe — Tipos de Predicado e Termos da Oração', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 44, '44', NULL, 'medio', 'Observe os excertos extraídos do texto III:
I. "No mercado internacional, o Brasil está em segundo lugar na América Latina, ficando atrás apenas do Chile." (l. 16-18)
II. "Um estudo recente mostra que os títulos verdes serão uma das principais estratégias das empresas no Brasil para atingir suas metas de ESG." (l. 33-35)
III. "Assim, os títulos verdes se consolidam como uma peça central na estratégia global de combate às mudanças climáticas [...]." (l. 52-54)', 'Sobre os excertos, a única alternativa correta é', '[{"letra": "A", "texto": "a expressão \"os títulos verdes\" possui a mesma classificação sintática em II e III."}, {"letra": "B", "texto": "nos excertos I e II, os verbos \"ser\", \"estar\" e \"ficar\" são classificados como verbos de ligação."}, {"letra": "C", "texto": "em relação aos tipos de predicado, há predicado verbal em I e II; predicado nominal em III."}, {"letra": "D", "texto": "no excerto III \"estratégia global de combate às mudanças climáticas [...]\", os termos sublinhados são classificados como adjuntos adnominais."}]', 'A', 'Em ambos os excertos (II e III), a expressão "os títulos verdes" exerce a função sintática de sujeito das respectivas orações.', NULL, NULL, 'resumida', TRUE, FALSE, '625b173339403d3d098bc3312f21fb8905d94c3598ed88233431cefcc248ac0a', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Interpretação de Texto e Compreensão Leitora', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 45, '45', NULL, 'facil', 'TEXTO IV - O ano passado (Erasmo Carlos / Roberto Carlos)
O ouro no ano passado subiu sem parar
Os gritos na bolsa falaram de outros valores
Corpos estranhos no ar
Silenciosos voadores
Quem sabe olhando o futuro do ano passado
O mar quase morre de sede no ano passado
Os rios ficaram doentes com tanto veneno
Diante da economia
Quem pensa em ecologia
Se o dólar é verde é mais forte que o verde que havia
O que será o futuro que hoje se faz
A natureza as crianças e os animais?
Quantas baleias queriam nadar como antes
Quem inventou o fuzil de matar elefantes?
Quem padeceu de insônia
Com a sorte da Amazônia
Na lei do machado o mais forte do ano passado
Não adianta soprar a fumaça do ar
As chaminés do progresso não podem parar
Quem sabe um museu no futuro
Vai guardar em lugar seguro
Um pouco de ar puro relíquia do ano passado
O que será o futuro que hoje se faz
A natureza as crianças e os animais?
Os campos risonhos um dia tiveram mais flores
E os bosques tiveram mais vida e até mais amores
Quem briga com a natureza
Envenena a própria mesa
Contra a força de Deus não existe defesa
O que será o futuro que hoje se faz
A natureza as crianças e os animais', 'Sobre o texto IV, é correto afirmar que', '[{"letra": "A", "texto": "o eu-lírico assume diferentes personalidades ao longo do texto com o objetivo de dar voz e profundidade emocional a uma minoria que será impactada pelas ações destrutivas do homem."}, {"letra": "B", "texto": "o eu-lírico mostra o capitalismo nocivo e desenfreado, além do comportamento destrutivo do ser humano perante o meio ambiente que estabelece uma insegurança a respeito do futuro da humanidade."}, {"letra": "C", "texto": "o eu-lírico apresenta reflexões e opiniões a respeito da problemática que assola a humanidade no tempo presente, visto o emprego recorrente de verbos no pretérito perfeito do indicativo, metáforas e hipérboles."}, {"letra": "D", "texto": "o eu-lírico busca transmitir seus pensamentos, sentimentos, emoções e opiniões com o objetivo de conduzir o leitor pelo universo poético. Tal perspectiva é corroborada pela presença das formas nominais do verbo - particípio, gerúndio e infinitivo - e personificações."}]', 'B', 'A letra da música critica abertamente a sobreposição do lucro e do progresso econômico (dólar, chaminés, bolsa) em relação à preservação ambiental, demonstrando apreensão quanto ao futuro das próximas gerações.', NULL, NULL, 'resumida', TRUE, FALSE, 'df7665e398898da5b4a98f254bbb5aae776b5051c4f5170b0a42ae2bc4adc2ae', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Intertextualidade e Diálogo entre Textos', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 46, '46', NULL, 'medio', 'Segundo Bakhtin, a intertextualidade pode ser entendida como o princípio de que todo enunciado é dialógico e estabelece uma relação com outros discursos já existentes. Para ele, a linguagem é essencialmente interativa e nenhum texto é autônomo ou isolado, pois sempre carrega ecos, referências e diálogos com vozes passadas e contemporâneas.', 'Considerando o texto IV e correlacionando-o ao conceito descrito acima, assinale a opção em que NÃO ocorreu a intertextualidade.', '[{"letra": "A", "texto": "Os versos \"Quem briga com a natureza / Envenena a própria mesa\" (l. 33 e 34) estabelecem intertextualidade com o dito popular: \"Aqui se faz, aqui se paga\"."}, {"letra": "B", "texto": "O verso \"O que será o futuro que hoje se faz\" (l. 13, 28, 37 e 39) estabelece intertextualidade com o samba-enredo O Amanhã, da União da Ilha do Governador, apresentado em 1978, nos versos: \"O que será do amanhã / Responda quem puder\"."}, {"letra": "C", "texto": "Os versos \"Os campos risonhos um dia tiveram mais flores / E os bosques tiveram mais vida e até mais amores\" (l. 31 e 32) estabelecem intertextualidade com o Hino Nacional Brasileiro em \"Nossos bosques têm mais vida / Nossa vida no teu seio mais amores\"."}, {"letra": "D", "texto": "Os versos \"Não adianta soprar a fumaça do ar / As chaminés do progresso não podem parar\" (l. 22 e 23) estabelecem intertextualidade com um trecho do Manifesto Antropofágico, de Oswald de Andrade (1928): \"Só me interessa o que não é meu. Lei do homem. Lei do antropófago.\""}]', 'D', 'A alternativa D é a única em que não há relação temática, formal ou conceitual de intertextualidade entre os versos da canção e o trecho do Manifesto Antropofágico citado.', NULL, NULL, 'resumida', FALSE, FALSE, 'a3747b76047295c850acad4b7aabe41ea2cd4f0ce8c62f1f5e32ae577c2b4b51', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Sintaxe — Orações Subordinadas Adjetivas', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 47, '47', NULL, 'medio', '(Utilizar TEXTO IV - O ano passado)', 'Na oração "Se o dólar é verde é mais forte que o verde que havia" (l. 11), analise a estrutura sintática e assinale a alternativa correta.', '[{"letra": "A", "texto": "O termo \"que havia\" constitui uma oração subordinada substantiva objetiva indireta, pois desempenha a função de complemento do verbo \"havia\"."}, {"letra": "B", "texto": "A palavra \"que\", na segunda ocorrência, tem função anafórica, retomando o termo \"verde\" e introduz uma oração subordinada adjetiva explicativa."}, {"letra": "C", "texto": "O verbo \"havia\" está empregado no sentido de \"existir\", sendo, portanto, intransitivo."}, {"letra": "D", "texto": "A oração \"que havia\" tem valor subordinado e funciona como adjunto adnominal do termo \"verde\", estabelecendo uma relação de especificação."}]', 'D', 'Na estrutura "o verde que havia", o termo "que havia" é uma oração subordinada adjetiva restritiva que especifica o substantivo "verde", desempenhando a função sintática de adjunto adnominal.', NULL, NULL, 'resumida', TRUE, FALSE, '403a72b029b903fd25338988fb55e436d5686a56c194544fa140bcf56d2c89c5', 'epcar-2026.txt'),
('EPCAR', 'Português', 'Intertextualidade e Análise Comparativa de Textos', 2026, NULL, 'EPCAR / Comando da Aeronáutica', 48, '48', NULL, 'medio', 'Considerando que todo texto possui objetivos comunicativos junto a seu(s) receptor(es), analise as afirmativas abaixo.
Os textos I, II, III e IV abordam diferentes perspectivas sobre questões, como: o passado, a reflexão sobre o futuro, as mudanças globais e a sustentabilidade.
I. na abordagem sobre a crise ambiental e as suas consequências para o futuro.
II. na análise dos impactos de tecnologias e inovações nas sociedades atuais.
III. na abordagem sobre a ideia de mudanças globais, seja no plano ambiental ou físico.
IV. nas previsões sobre o futuro da humanidade, com base em ciências e arte.', 'O ponto de conexão entre todos os textos evidencia-se em: Está(ão) correta(s)', '[{"letra": "A", "texto": "uma afirmativa."}, {"letra": "B", "texto": "duas afirmativas."}, {"letra": "C", "texto": "três afirmativas."}, {"letra": "D", "texto": "todas as afirmativas."}]', 'B', 'Estão corretas as afirmativas I e III. O elo comum entre todos os textos da prova é a reflexão sobre a crise ambiental e a ideia de transformações e mudanças em escala global.', NULL, NULL, 'resumida', FALSE, FALSE, '48f87311fad730ab5eb6c5c05c9363f1d01e27850919d26d3dcc524ed0ced75b', 'epcar-2026.txt');
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
  'EPCAR — lote 2/2' AS seed,
  (SELECT COUNT(*) FROM questoes) AS total_questoes_no_banco;
