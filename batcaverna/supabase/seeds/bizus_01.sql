-- ============================================================================
-- BatCaverna — Bizus táticos
-- ============================================================================
-- Macetes que economizam tempo ou evitam a armadilha clássica da banca.
-- Cada bizu é ancorado num assunto; se o assunto não existir na matéria,
-- ele é criado aqui mesmo.
-- Idempotente: não duplica bizu com o mesmo título.
-- ============================================================================

BEGIN;

-- ─── Garante os assuntos usados pelos bizus ────────────────────────
INSERT INTO assuntos (materia_id, nome, ordem)
SELECT m.id, v.assunto, 0
FROM materias m
JOIN (VALUES
  ('Matemática', 'Geometria Plana'),
  ('Matemática', 'Geometria Espacial'),
  ('Matemática', 'Análise Combinatória'),
  ('Matemática', 'Probabilidade'),
  ('Matemática', 'Estatística'),
  ('Matemática', 'Porcentagem e Proporção'),
  ('Matemática', 'Funções'),
  ('Matemática', 'Trigonometria'),
  ('Português', 'Crase'),
  ('Português', 'Sintaxe'),
  ('Português', 'Interpretação de Texto'),
  ('Português', 'Concordância'),
  ('Física',    'Cinemática'),
  ('Física',    'Ondulatória'),
  ('Física',    'Dinâmica'),
  ('Química',   'Química Orgânica'),
  ('Química',   'Estequiometria'),
  ('Biologia',  'Ecologia'),
  ('Inglês',    'Interpretação de Texto'),
  ('Inglês',    'Gramática')
) AS v(materia, assunto) ON m.nome = v.materia
WHERE NOT EXISTS (
  SELECT 1 FROM assuntos a WHERE a.materia_id = m.id AND a.nome = v.assunto
);

-- ─── Bizus ─────────────────────────────────────────────────────────
INSERT INTO bizus (assunto_id, titulo, conteudo, nivel_impacto, exemplo_pratico)
SELECT a.id, v.titulo, v.conteudo, v.impacto::nivel_impacto_tipo, v.exemplo
FROM assuntos a
JOIN materias m ON m.id = a.materia_id
JOIN (VALUES

-- ═══════════════ MATEMÁTICA ═══════════════
('Matemática', 'Porcentagem e Proporção',
 'Aumento e desconto iguais NÃO voltam ao preço original',
 'Porcentagens sucessivas se multiplicam, nunca se somam. Um aumento de 20% seguido de um desconto de 20% deixa o preço em 96% do original — uma perda de 4%. Trabalhe sempre com o fator multiplicativo: +20% é ×1,20 e −20% é ×0,80.',
 'alto',
 '1,20 × 0,80 = 0,96  →  perda de 4%
Dois descontos de 10%: 0,90 × 0,90 = 0,81  →  desconto único de 19% (não 20%)'),

('Matemática', 'Geometria Plana',
 'Razão de semelhança: k para lados, k² para áreas, k³ para volumes',
 'Se dois triângulos semelhantes têm áreas 9 e 25, a razão entre os lados NÃO é 9/25 — é a raiz: 3/5. A banca conta com você esquecer o expoente.',
 'alto',
 'Áreas 9 e 25  →  k = √(9/25) = 3/5
Volumes 8 e 27  →  k = ∛(8/27) = 2/3'),

('Matemática', 'Geometria Plana',
 'A relação métrica que ninguém lembra: b·c = a·h',
 'No triângulo retângulo, o produto dos catetos é igual ao produto da hipotenusa pela altura relativa a ela. Sai de calcular a área por dois caminhos. Quando a questão dá os dois catetos e pede a altura, isso resolve em uma linha.',
 'alto',
 'Catetos 6 e 8 → hipotenusa 10
6 × 8 = 10 × h  →  h = 4,8'),

('Matemática', 'Geometria Espacial',
 'Tudo que termina em ponta se divide por 3',
 'Pirâmide é 1/3 do prisma de mesma base e altura. Cone é 1/3 do cilindro correspondente. Não é coincidência — é o princípio de Cavalieri. Isso reduz seis fórmulas a três.',
 'util',
 'V(cilindro) = πr²h   →   V(cone) = πr²h/3
V(prisma) = Ab·h     →   V(pirâmide) = Ab·h/3'),

('Matemática', 'Análise Combinatória',
 'Uma pergunta decide entre arranjo e combinação',
 'Pergunte: trocar a ordem muda o resultado? Senha (1234 ≠ 4321) → ordem importa → arranjo. Comissão ({Ana,Bia} = {Bia,Ana}) → ordem não importa → combinação. Escreva a resposta na margem antes de qualquer conta.',
 'alto',
 'Pódio de 3 entre 10 → A(10,3) = 720
Comissão de 3 entre 10 → C(10,3) = 120
A diferença é exatamente 3! = 6'),

('Matemática', 'Análise Combinatória',
 '"Pelo menos um" pede o complementar',
 'Contar diretamente "pelo menos um" obriga a somar vários casos. Contar o complementar ("nenhum") costuma ser um cálculo só.',
 'alto',
 'P(pelo menos uma cara em 3 moedas)
= 1 − P(nenhuma cara)
= 1 − (1/2)³ = 7/8'),

('Matemática', 'Estatística',
 'Média puxada por extremo? A resposta é mediana',
 'Quando a questão diz que a média é muito maior que a mediana (ou pergunta qual medida "representa melhor" o conjunto), há valores discrepantes puxando a média. A medida resistente a extremos é a mediana.',
 'alto',
 'Salários: 2, 2, 3, 3, 90 (mil)
Média = 20  |  Mediana = 3
A mediana descreve melhor o grupo'),

('Matemática', 'Estatística',
 'Somar constante não muda o desvio padrão',
 'Se todos os valores sobem 10, a média sobe 10 mas a dispersão continua igual. Já multiplicar todos por k multiplica o desvio padrão por |k|. Muita questão que parece exigir recalcular tudo sai em uma linha.',
 'util',
 'Dados +5:  média +5,  desvio igual
Dados ×3:  média ×3,  desvio ×3'),

('Matemática', 'Funções',
 'Otimização é sempre o vértice da parábola',
 'Lucro máximo, altura máxima, custo mínimo, área máxima: se o modelo é quadrático, a resposta está em xv = −b/2a. Não teste alternativa por alternativa.',
 'alto',
 'h(t) = −5t² + 20t
xv = −20 / (2·(−5)) = 2 s
h(2) = 20 m (altura máxima)'),

('Matemática', 'Trigonometria',
 'A tabela dos notáveis em uma linha só',
 'Os senos de 30°, 45° e 60° são √1/2, √2/2 e √3/2. O cosseno é a mesma sequência ao contrário. Não precisa decorar seis valores — só a ordem.',
 'util',
 'sen: √1/2 , √2/2 , √3/2
cos: √3/2 , √2/2 , √1/2'),

('Matemática', 'Trigonometria',
 'Lei dos cossenos é Pitágoras generalizado',
 'a² = b² + c² − 2bc·cos A. Se A = 90°, cos A = 0 e sobra Pitágoras. Sempre que o triângulo NÃO for retângulo, é ela — não force Pitágoras.',
 'util',
 'Lados 5 e 7 com 60° entre eles:
a² = 25 + 49 − 2·5·7·(1/2) = 39
a = √39'),

('Matemática', 'Probabilidade',
 'Sem reposição muda numerador E denominador',
 'Ao tirar a segunda bola sem devolver a primeira, some uma bola do total e uma da cor retirada. O erro clássico é alterar só um dos dois.',
 'alto',
 '5 brancas, 3 pretas. Duas brancas seguidas:
(5/8) × (4/7) = 5/14
Note: 5→4 e 8→7'),

-- ═══════════════ PORTUGUÊS ═══════════════
('Português', 'Crase',
 'Troque a palavra feminina por uma masculina',
 'Se ao trocar aparecer "ao", há crase. Se aparecer só "a" ou "o", não há. Esse teste resolve mais casos que qualquer lista decorada.',
 'alto',
 'Fui à escola → Fui ao colégio ✔ crase
Refiro-me à proposta → ao projeto ✔ crase
Comecei a estudar → a trabalhar ✘ sem crase'),

('Português', 'Crase',
 'Nunca há crase antes de verbo, masculino ou pronome pessoal',
 'Três bloqueios absolutos. Se depois do "a" vem verbo (a fazer), palavra masculina (a lápis) ou pronome pessoal (a ela), a crase está errada — não importa o resto da frase.',
 'alto',
 'Errado: Começou à chorar
Errado: Escrito à lápis
Errado: Entreguei à ela'),

('Português', 'Sintaxe',
 'A vírgula na oração adjetiva muda o sentido da frase',
 'Restritiva (sem vírgula) restringe a um subgrupo. Explicativa (entre vírgulas) vale para todos. É uma das questões mais recorrentes das provas militares.',
 'alto',
 'Os alunos que estudaram passaram.
→ só alguns estudaram, e esses passaram

Os alunos, que estudaram, passaram.
→ todos estudaram e todos passaram'),

('Português', 'Concordância',
 '"Haver" de existir é impessoal e não vai ao plural',
 'Havia dez alunos (nunca "haviam"). Já "existir" tem sujeito e concorda: existiam dez alunos. A troca entre os dois é armadilha garantida.',
 'alto',
 'Havia dez alunos ✔
Haviam dez alunos ✘
Existiam dez alunos ✔'),

('Português', 'Interpretação de Texto',
 'Se você não aponta a linha, não é a resposta',
 'A alternativa errada costuma ser verdadeira no mundo — mas não afirmada pelo autor. Antes de marcar, localize o trecho que sustenta a alternativa. Se não achar, desconfie.',
 'alto',
 'Cuidado com alternativas contendo
"sempre", "nunca", "todos", "nenhum":
texto argumentativo raramente é absoluto'),

-- ═══════════════ FÍSICA ═══════════════
('Física', 'Cinemática',
 'Sem tempo no enunciado? Use Torricelli',
 'v² = v₀² + 2aΔS é a única equação do MRUV sem a variável tempo. Se o problema não dá nem pede tempo, ela evita duas etapas de cálculo.',
 'alto',
 'Carro a 20 m/s freia com a = −4 m/s².
Distância até parar:
0 = 400 − 8·ΔS → ΔS = 50 m'),

('Física', 'Cinemática',
 'No ponto mais alto, v = 0 mas a aceleração continua sendo g',
 'A pegadinha mais cobrada de lançamento vertical. A velocidade zera; a gravidade não. Se zerasse, o corpo ficaria parado no ar.',
 'alto',
 'No topo: v = 0 , a = −10 m/s²
Altura máxima: H = v₀²/(2g)'),

('Física', 'Cinemática',
 'Movimentos horizontal e vertical são independentes',
 'Uma bola solta e outra lançada horizontalmente da mesma altura tocam o chão ao mesmo tempo. O que liga os dois eixos é apenas o tempo.',
 'util',
 'Horizontal: x = vx·t  (MRU)
Vertical:   y = g·t²/2 (MRUV)
Mesmo t nos dois'),

('Física', 'Ondulatória',
 'Mudou de meio: a frequência NÃO muda',
 'A frequência é imposta pela fonte. Ao trocar de meio, muda a velocidade e, por consequência, o comprimento de onda. Metade das questões de refração sai daqui.',
 'alto',
 'v = λf , com f constante
Meio mais lento → λ menor
A cor da luz não muda dentro d''água'),

('Física', 'Ondulatória',
 'Em Física, som "alto" é agudo — não é forte',
 'Altura = frequência (grave/agudo). Intensidade = amplitude (fraco/forte). O uso cotidiano é o oposto, e a banca explora isso.',
 'util',
 'Altura     → frequência → grave/agudo
Intensidade → amplitude  → fraco/forte
Timbre     → forma da onda'),

('Física', 'Dinâmica',
 'Ação e reação nunca se anulam',
 'Elas atuam em corpos DIFERENTES. Forças só se cancelam quando agem sobre o mesmo corpo. Confundir isso derruba a questão inteira.',
 'alto',
 'A Terra puxa você (peso).
Você puxa a Terra com força igual.
São corpos distintos → não se anulam'),

-- ═══════════════ QUÍMICA ═══════════════
('Química', 'Química Orgânica',
 'Aldeído × cetona: a diferença é a POSIÇÃO da carbonila',
 'Os dois têm C=O. Na ponta da cadeia é aldeído (−CHO); no meio é cetona (−CO−). Circule o grupo funcional antes de qualquer coisa.',
 'alto',
 'CH₃−CH₂−CHO  → aldeído (propanal)
CH₃−CO−CH₃   → cetona (propanona)'),

('Química', 'Química Orgânica',
 'Ponto de ebulição: interação > tamanho > ramificação',
 'Compare nesta ordem. Ligação de hidrogênio ferve mais alto que dipolo-dipolo, que ferve mais que London. Empatou o tipo? Cadeia maior ferve mais. Empatou o tamanho? Ramificada ferve MENOS.',
 'alto',
 'álcool > aldeído > hidrocarboneto
butano > propano
isobutano < butano (ramificado ferve menos)'),

-- ═══════════════ BIOLOGIA ═══════════════
('Biologia', 'Ecologia',
 'Energia flui, matéria cicla',
 'A energia entra como luz, atravessa a cadeia perdendo ~90% por nível e sai como calor — via de mão única. Já os átomos são reaproveitados para sempre. É a frase que resolve boa parte das questões de ecologia do ENEM.',
 'alto',
 'Regra dos 10%: cada nível trófico
recebe ~10% da energia do anterior.
Por isso cadeias são curtas.'),

('Biologia', 'Ecologia',
 'Bioacumulação sobe a cadeia',
 'Poluentes que não se degradam (mercúrio, DDT) concentram-se cada vez mais nos níveis tróficos superiores. Por isso o predador de topo — e o humano que o come — sofre primeiro.',
 'util',
 'Fitoplâncton → peixe pequeno →
peixe grande → humano
Concentração aumenta a cada seta'),

-- ═══════════════ INGLÊS ═══════════════
('Inglês', 'Interpretação de Texto',
 'Marcadores discursivos entregam a resposta',
 'A banca costuma perguntar que ideia um conectivo introduz. "However" = contraste. "Therefore" = consequência. "Instead of" = substituição. "Despite" = concessão. Decorar a tabela vale mais que decorar vocabulário.',
 'alto',
 'however, nevertheless → contraste
therefore, thus → consequência
moreover, besides → adição
instead of → substituição'),

('Inglês', 'Interpretação de Texto',
 'Os falsos cognatos que mais caem',
 'Palavras que parecem português e não são. Errar um deles muda o sentido da frase inteira.',
 'alto',
 'actually = na verdade (não atualmente)
eventually = no fim (não eventualmente)
pretend = fingir (não pretender)
library = biblioteca (não livraria)
parents = pais (não parentes)
realize = perceber (não realizar)'),

('Inglês', 'Gramática',
 'Marcador de tempo decide o tempo verbal',
 'yesterday/ago/in 1999 → Simple Past. already/yet/since/for → Present Perfect. Procure o marcador antes de analisar o verbo.',
 'alto',
 'I saw him yesterday. (Simple Past)
I have lived here for 5 years.
(Present Perfect — ainda moro aqui)'),

('Inglês', 'Gramática',
 'Depois de modal, infinitivo SEM "to"',
 'can, could, may, might, must, should, will, would — todos pedem o verbo puro. Elimina alternativa na hora.',
 'util',
 'She can swim ✔
She can to swim ✘
You must go ✔')

) AS v(materia, assunto, titulo, conteudo, impacto, exemplo)
  ON m.nome = v.materia AND a.nome = v.assunto
WHERE NOT EXISTS (SELECT 1 FROM bizus b WHERE b.titulo = v.titulo);

COMMIT;

SELECT 'Bizus cadastrados' AS seed, COUNT(*) AS total FROM bizus;
