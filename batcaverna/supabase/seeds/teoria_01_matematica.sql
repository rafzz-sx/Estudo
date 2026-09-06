-- ============================================================================
-- BatCaverna — Conteúdo teórico: MATEMÁTICA
-- ============================================================================
-- Temas escolhidos pela frequência real no banco de questões oficiais.
-- Idempotente: a UNIQUE (materia_id, tema, nivel) impede duplicata.
--
-- Strings usam dollar-quoting ($md$...$md$) para o Markdown poder conter
-- aspas, apóstrofos e barras sem escape.
-- ============================================================================

BEGIN;

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Geometria Plana',
 'Geometria Plana: áreas, semelhança e o que a banca realmente cobra',
 'Áreas das figuras fundamentais, relações métricas no triângulo retângulo e o raciocínio de semelhança que resolve metade das questões.',
 $md$
Geometria Plana é o assunto mais cobrado de Matemática nos concursos militares — 79 questões só no banco desta plataforma. A boa notícia: a banca repete um número pequeno de ideias.

## As áreas que você precisa saber de cor

| Figura | Área | Observação |
| --- | --- | --- |
| Quadrado | `A = l²` | diagonal `d = l√2` |
| Retângulo | `A = b · h` | |
| Triângulo qualquer | `A = (b · h) / 2` | |
| Triângulo equilátero | `A = l²√3 / 4` | altura `h = l√3 / 2` |
| Paralelogramo | `A = b · h` | h é a altura, não o lado |
| Losango | `A = (D · d) / 2` | diagonais |
| Trapézio | `A = (B + b) · h / 2` | |
| Círculo | `A = πr²` | comprimento `C = 2πr` |
| Setor circular | `A = (α/360) · πr²` | α em graus |

> O erro clássico do paralelogramo: usar o lado inclinado como altura. Altura é sempre a **perpendicular** entre as bases.

## Relações métricas no triângulo retângulo

Com hipotenusa `a`, catetos `b` e `c`, altura relativa à hipotenusa `h`, e projeções `m` e `n`:

1. `a² = b² + c²` — Pitágoras
2. `b² = a · m` e `c² = a · n` — cada cateto é média geométrica
3. `h² = m · n`
4. `b · c = a · h` — a mais esquecida, e a que mais economiza tempo

A relação 4 sai de calcular a área por dois caminhos: `(b·c)/2 = (a·h)/2`. Sempre que a questão der os dois catetos e pedir a altura, use ela direto em vez de achar a hipotenusa e depois a projeção.

## Semelhança: o motor da maioria das questões

Dois triângulos são semelhantes quando têm os mesmos ângulos. Daí sai que **todos os lados correspondentes guardam a mesma razão** `k`.

E o ponto que a banca adora explorar:

- comprimentos escalam por `k`
- áreas escalam por `k²`
- volumes escalam por `k³`

Se a questão diz que dois triângulos semelhantes têm áreas 9 cm² e 25 cm², a razão entre os lados **não é** 9/25 — é `√(9/25) = 3/5`.

### Como reconhecer semelhança na figura

- Reta paralela a um lado do triângulo cortando os outros dois (Teorema de Tales)
- Altura relativa à hipotenusa: cria dois triângulos semelhantes ao original
- Ângulo comum + um ângulo reto em ambos

## Polígonos regulares

- Soma dos ângulos internos: `Si = (n - 2) · 180°`
- Cada ângulo interno (regular): `ai = (n - 2) · 180° / n`
- Soma dos externos: sempre `360°`, independente de `n`
- Número de diagonais: `d = n(n - 3) / 2`

## Circunferência: ângulos

- Ângulo **central**: vale o arco.
- Ângulo **inscrito**: vale metade do arco.
- Todo ângulo inscrito num semicírculo é reto — é o que garante o triângulo retângulo quando a hipotenusa é diâmetro.

## Estratégia de prova

1. **Desenhe.** Mesmo que a figura venha pronta, redesenhe marcando o que é dado e o que é pedido.
2. **Nomeie o que você quer.** Chame de `x` a grandeza pedida e escreva as relações que a envolvem.
3. **Procure semelhança antes de trigonometria.** Costuma ser mais curto.
4. **Confira a unidade.** Área em cm² e lado em cm: se a resposta saiu em cm quando pediram cm², algo foi somado errado.
$md$, 12, 1),

-- ══════════════════════════════════════════════════════════════
('Geometria Espacial',
 'Geometria Espacial: volumes, troncos e o princípio de Cavalieri',
 'Volume e área de prismas, pirâmides, cilindros, cones e esferas — e a razão k³ que derruba quem só decorou fórmula.',
 $md$
Geometria Espacial aparece em praticamente toda prova de Matemática dos concursos militares. As fórmulas são poucas; o que separa quem acerta é enxergar a figura.

## Fórmulas essenciais

| Sólido | Volume | Área total |
| --- | --- | --- |
| Prisma | `V = Ab · h` | `At = 2Ab + Al` |
| Cubo | `V = a³` | `At = 6a²` |
| Cilindro | `V = πr²h` | `At = 2πr² + 2πrh` |
| Pirâmide | `V = (Ab · h) / 3` | `At = Ab + Al` |
| Cone | `V = (πr²h) / 3` | `At = πr² + πrg` |
| Esfera | `V = (4πr³) / 3` | `A = 4πr²` |

Onde `g` é a geratriz do cone: `g² = r² + h²`.

> Repare no padrão: **tudo que "termina em ponta" leva divisão por 3**. Pirâmide é um terço do prisma de mesma base e altura; cone é um terço do cilindro correspondente. Isso não é coincidência — é o princípio de Cavalieri.

## A diagonal do bloco retangular

Com arestas `a`, `b`, `c`:

`D = √(a² + b² + c²)`

E no cubo de aresta `a`: `D = a√3`. Aparece direto, ou escondida em "a maior vareta que cabe na caixa".

## Razão de semelhança no espaço

Este é o ponto que mais derruba candidato. Se dois sólidos são semelhantes com razão `k` entre as arestas:

- áreas na razão `k²`
- **volumes na razão `k³`**

Questão típica: um cone é cortado por um plano paralelo à base na metade da altura. Que fração do volume fica no cone menor?

A razão linear é `k = 1/2`, então o volume do cone menor é `(1/2)³ = 1/8` do original. O tronco fica com os outros **7/8** — e não 1/2, como o instinto sugere.

## Tronco de pirâmide e de cone

O caminho mais seguro é sempre: **volume do sólido completo menos o volume do sólido menor removido**. Decorar a fórmula fechada do tronco costuma render mais erro de sinal do que economia de tempo.

Para o tronco de cone com raios `R` e `r` e altura `h`:

`V = (πh/3) · (R² + Rr + r²)`

Mas se você esquecer, reconstrua por diferença — leva 30 segundos a mais e não erra.

## Inscrição e circunscrição

- Esfera **inscrita** no cubo de aresta `a`: `r = a/2`
- Esfera **circunscrita** ao cubo de aresta `a`: `2r = a√3`, logo `r = a√3/2`
- Cilindro equilátero: `h = 2r` (a secção meridiana é um quadrado)
- Cone equilátero: `g = 2r` (a secção meridiana é um triângulo equilátero)

## Estratégia de prova

1. **Desenhe a secção plana.** Quase todo problema espacial vira um problema plano quando você corta o sólido no lugar certo (secção meridiana, diagonal, plano pela altura).
2. **Marque o triângulo retângulo.** Ele quase sempre está lá, ligando altura, raio e geratriz.
3. **Cuidado com a unidade cúbica.** Se o enunciado dá cm e pede litros, lembre: `1 L = 1 dm³ = 1000 cm³`.
4. **Estime antes de calcular.** Saber que a resposta é "um pouco menos que 1/3 do cilindro" já elimina duas alternativas.
$md$, 12, 2),

-- ══════════════════════════════════════════════════════════════
('Estatística',
 'Estatística: médias, dispersão e leitura de gráficos',
 'Média, mediana e moda sem confusão, desvio padrão descomplicado e as armadilhas de interpretação de gráfico que a banca planta.',
 $md$
Estatística é dos assuntos com melhor custo-benefício da prova: cai muito (50 questões neste banco), a teoria é curta e o cálculo é direto.

## As três medidas de tendência central

- **Média aritmética**: soma tudo, divide pela quantidade. Sensível a valores extremos.
- **Mediana**: valor do meio com os dados **ordenados**. Se a quantidade for par, é a média dos dois centrais. Resistente a extremos.
- **Moda**: o valor que mais se repete. Pode não existir, ou haver mais de uma.

> Questão clássica: "a renda média do bairro é R$ 8.000, mas a mediana é R$ 2.500". Isso não é contradição — significa que poucos moradores muito ricos puxaram a média para cima. Quando a banca pergunta qual medida "representa melhor" um conjunto com valores discrepantes, a resposta é **mediana**.

## Média ponderada

Quando cada valor tem um peso:

`Mp = (x₁·p₁ + x₂·p₂ + ... + xₙ·pₙ) / (p₁ + p₂ + ... + pₙ)`

O erro mais comum é dividir pela quantidade de valores em vez da **soma dos pesos**.

## Dispersão

- **Amplitude**: maior menos menor. Simples, mas ignora tudo no meio.
- **Variância**: média dos quadrados dos desvios em relação à média.

  `σ² = Σ(xᵢ - x̄)² / n`
- **Desvio padrão**: `σ = √(variância)`. Volta para a unidade original dos dados.

O que isso significa na prática: dois conjuntos podem ter a **mesma média** e comportamentos completamente diferentes. Notas {5, 5, 5} e {0, 5, 10} têm média 5, mas desvios padrão 0 e ≈4,08.

> Se a questão dá dois conjuntos com a mesma média e pergunta qual é "mais homogêneo" ou "mais regular", ela está perguntando qual tem **menor desvio padrão**.

## Propriedades que economizam conta

Se você somar uma constante `c` a todos os valores:
- a média aumenta em `c`
- o desvio padrão **não muda**

Se você multiplicar todos os valores por `c`:
- a média fica multiplicada por `c`
- o desvio padrão fica multiplicado por `|c|`

Muita questão que parece exigir recalcular tudo se resolve em uma linha com essas duas regras.

## Leitura de gráficos: onde a banca arma

1. **Eixo que não começa no zero.** Faz uma diferença de 2% parecer gigantesca. A pergunta costuma ser sobre a variação real, não a impressão visual.
2. **Gráfico de setores.** O total é sempre 100%. Se a questão dá 3 fatias e pede a quarta, é subtração.
3. **Escala logarítmica.** Cada passo multiplica, não soma.
4. **Frequência acumulada.** A barra não mostra o valor daquele intervalo, mas a soma até ele. Para achar o intervalo isolado, subtraia da anterior.

## Estratégia de prova

1. **Ordene sempre** antes de procurar mediana. Esquecer isso é o erro número um.
2. **Confira se pediram população ou amostra.** Em concurso militar quase sempre é população (divide por `n`), mas leia.
3. **Não calcule o que não foi pedido.** Muita questão de gráfico se resolve só lendo dois pontos.
$md$, 10, 3),

-- ══════════════════════════════════════════════════════════════
('Análise Combinatória',
 'Análise Combinatória: quando a ordem importa (e quando não)',
 'A única pergunta que resolve 90% das questões, princípio multiplicativo, arranjo, combinação, permutação com repetição.',
 $md$
Análise Combinatória assusta porque parece exigir escolher a fórmula certa entre muitas. Na verdade, quase tudo se resolve com **uma pergunta** e o princípio multiplicativo.

## A pergunta que decide tudo

> **A ordem dos elementos escolhidos muda o resultado?**

- **Sim, a ordem importa** → Arranjo (ou permutação)
- **Não, a ordem não importa** → Combinação

Exemplos concretos:

- Senha de 4 dígitos: 1234 ≠ 4321 → **ordem importa**
- Comissão de 3 pessoas entre 10: {Ana, Bia, Caio} = {Caio, Ana, Bia} → **ordem não importa**
- Pódio (1º, 2º, 3º lugar): ordem importa
- Sorteio de 3 nomes iguais para o mesmo prêmio: ordem não importa

## Princípio multiplicativo

Se uma decisão tem `m` opções e a seguinte tem `n`, o total é `m · n`. Ele resolve mais questão do que qualquer fórmula.

Placa com 3 letras e 4 dígitos, podendo repetir:
`26 · 26 · 26 · 10 · 10 · 10 · 10 = 26³ · 10⁴`

## Fórmulas

**Permutação simples** — todos os `n` elementos, ordem importa:

`Pₙ = n!`

**Arranjo** — escolher `p` entre `n`, ordem importa:

`A(n,p) = n! / (n - p)!`

**Combinação** — escolher `p` entre `n`, ordem não importa:

`C(n,p) = n! / [p! · (n - p)!]`

Repare que combinação é o arranjo dividido por `p!` — exatamente porque as `p!` ordens possíveis do mesmo grupo contam como uma só.

**Permutação com repetição** — `n` elementos com `a`, `b`, `c` repetidos:

`P = n! / (a! · b! · c!)`

Anagramas de BATATA: 6 letras, com 3 A e 2 T → `6! / (3! · 2!) = 720 / 12 = 60`.

## Técnicas que salvam questão

### Elementos que devem ficar juntos
Trate o bloco como **um único elemento**, permute tudo, e depois permute dentro do bloco.

5 pessoas em fila com um casal sempre junto: `4! · 2! = 48`.

### "Pelo menos um"
Quase sempre é mais rápido calcular o **complementar**:

`(pelo menos um) = (total) - (nenhum)`

### Elementos que não podem ficar juntos
`(total) - (juntos)`.

## Estratégia de prova

1. **Escreva a pergunta da ordem** na margem antes de qualquer conta.
2. **Simplifique o fatorial antes de multiplicar.** `10!/8!` é `10 · 9 = 90`, não um número gigante dividido por outro.
3. **Teste com números pequenos.** Se não tem certeza se é arranjo ou combinação, resolva o mesmo problema com 3 elementos contando na mão. Em 30 segundos você sabe.
4. **Desconfie de resposta muito grande ou muito pequena.** Combinação nunca passa do arranjo correspondente.
$md$, 11, 4),

-- ══════════════════════════════════════════════════════════════
('Probabilidade',
 'Probabilidade: do espaço amostral ao condicional',
 'Probabilidade como razão de contagem, união e interseção, eventos independentes e o cálculo condicional que a banca adora.',
 $md$
Probabilidade é Análise Combinatória com uma divisão no final. Se você conta direito, acerta.

## Definição

`P(A) = (casos favoráveis) / (casos possíveis)`

Vale quando **todos os resultados são igualmente prováveis**. Dado honesto, moeda honesta, sorteio aleatório. Se a questão diz "dado viciado", essa fórmula não se aplica direto.

Consequências imediatas:
- `0 ≤ P(A) ≤ 1`
- `P(evento certo) = 1`
- `P(A) + P(não A) = 1`

## União e interseção

`P(A ∪ B) = P(A) + P(B) - P(A ∩ B)`

O termo subtraído existe porque quem está nos dois conjuntos foi contado duas vezes. Se `A` e `B` são **mutuamente exclusivos** (não podem ocorrer juntos), `P(A ∩ B) = 0` e a fórmula vira uma soma simples.

> Cuidado: "mutuamente exclusivos" e "independentes" são coisas **diferentes**. Exclusivos: se um acontece, o outro não pode. Independentes: um não afeta a chance do outro.

## Eventos independentes

`P(A ∩ B) = P(A) · P(B)`

Dois lançamentos de moeda são independentes: o primeiro cara não muda nada no segundo. Já retirar duas cartas **sem reposição** cria dependência — a segunda probabilidade muda porque o baralho encolheu.

## Probabilidade condicional

`P(A | B) = P(A ∩ B) / P(B)`

Leia como: "a chance de A, **sabendo que** B aconteceu". Na prática, `B` vira o novo espaço amostral.

Exemplo: numa turma de 30 alunos, 18 são meninas e 12 dessas meninas usam óculos. Escolhendo ao acaso alguém que usa óculos entre as meninas, o denominador é 18 — não 30.

> Sinal de que é condicional: as palavras "sabendo que", "dado que", "sendo ele um...", "entre os que...".

## Sem reposição: o caso mais cobrado

Uma urna tem 5 bolas brancas e 3 pretas. Tirando duas sem reposição, qual a chance de ambas serem brancas?

`P = (5/8) · (4/7) = 20/56 = 5/14`

Repare que o segundo fator mudou nos **dois** números: sobrou uma branca a menos e uma bola a menos no total.

## Estratégia de prova

1. **Escreva o espaço amostral** ou pelo menos o seu tamanho, antes de tudo.
2. **Some as probabilidades de todos os casos.** Tem que dar 1. É a melhor verificação disponível.
3. **"Pelo menos um" → use o complementar.** `1 - P(nenhum)` quase sempre é mais curto.
4. **Simplifique as frações no caminho**, não no fim. Evita número grande e erro de conta.
$md$, 10, 5),

-- ══════════════════════════════════════════════════════════════
('Funções',
 'Funções: afim, quadrática, exponencial e logarítmica',
 'Como reconhecer, esboçar e extrair informação de cada família de funções que os concursos cobram.',
 $md$
Função é a linguagem em que quase todo problema de Matemática aplicada é escrito. Reconhecer a família resolve metade da questão.

## Função afim (1º grau)

`f(x) = ax + b`

- `a` é a **taxa de variação**: quanto `y` muda a cada unidade de `x`
- `b` é o **valor inicial** (onde o gráfico corta o eixo y)
- Gráfico: reta. Crescente se `a > 0`, decrescente se `a < 0`
- Raiz: `x = -b/a`

> Em problema contextualizado, `b` é quase sempre a taxa fixa (assinatura, custo fixo) e `a` é o valor por unidade (por minuto, por km, por peça).

## Função quadrática (2º grau)

`f(x) = ax² + bx + c`

- Gráfico: parábola. Concavidade **para cima** se `a > 0`, para baixo se `a < 0`
- Raízes: `x = (-b ± √Δ) / 2a`, com `Δ = b² - 4ac`
- `Δ > 0`: duas raízes reais distintas · `Δ = 0`: uma raiz dupla · `Δ < 0`: nenhuma raiz real
- **Vértice**: `xv = -b / 2a` e `yv = -Δ / 4a`

O vértice é o coração das questões de otimização. Concavidade para baixo → o vértice é o **máximo** (lucro máximo, altura máxima). Para cima → é o **mínimo** (custo mínimo).

### Relações de Girard
Para `ax² + bx + c = 0`:
- Soma das raízes: `S = -b/a`
- Produto das raízes: `P = c/a`

Quando a questão pede só a soma ou o produto, você **não precisa** achar as raízes.

## Função exponencial

`f(x) = a · bˣ`, com `b > 0` e `b ≠ 1`

- `b > 1`: crescimento (população, juros compostos, contágio)
- `0 < b < 1`: decaimento (meia-vida, depreciação)
- Nunca toca o eixo x: a imagem é sempre positiva

Juros compostos são exponencial pura: `M = C(1 + i)ᵗ`.

## Função logarítmica

`f(x) = log_b(x)` é a **inversa** da exponencial: `log_b(x) = y ⟺ bʸ = x`

Propriedades que a prova cobra:
- `log(A · B) = log A + log B`
- `log(A / B) = log A - log B`
- `log(Aⁿ) = n · log A`
- Mudança de base: `log_b(A) = log_c(A) / log_c(b)`

Domínio: só existe `log` de número **estritamente positivo**, e a base tem que ser positiva e diferente de 1. Muita questão de domínio se resolve só impondo isso.

> Onde aparece na vida real: escala Richter, pH, decibéis, e qualquer problema que pergunte "em quanto tempo dobra?".

## Estratégia de prova

1. **Identifique a família pela forma**, não pela história. `2ˣ` é exponencial mesmo que o enunciado fale de bactérias.
2. **Esboce o gráfico**, mesmo torto. Concavidade e sinal já eliminam alternativas.
3. **Confira o domínio.** Denominador ≠ 0, radicando ≥ 0, logaritmando > 0.
4. **Em otimização, vá direto ao vértice.** Não teste alternativas uma a uma.
$md$, 12, 6),

-- ══════════════════════════════════════════════════════════════
('Razão e Proporção',
 'Razão, proporção, regra de três e porcentagem',
 'A base aritmética que sustenta metade da prova — incluindo os descontos sucessivos que quase todo mundo erra.',
 $md$
Este é o assunto mais transversal da prova: aparece em Matemática, em Física, em interpretação de gráfico e em qualquer questão com contexto econômico.

## Razão e proporção

Razão é um quociente: `a/b`. Proporção é a igualdade entre duas razões: `a/b = c/d`.

Propriedade fundamental: `a · d = b · c` (o produto dos meios é igual ao dos extremos).

## Regra de três

**Direta** — quando uma grandeza cresce, a outra cresce junto. Mais horas trabalhadas, mais peças produzidas.

**Inversa** — quando uma cresce, a outra diminui. Mais operários, menos tempo para terminar.

> O passo que evita o erro: antes de montar, pergunte "se eu **aumentar** a primeira grandeza, a segunda aumenta ou diminui?". Só depois monte a proporção.

### Regra de três composta

Com três ou mais grandezas, compare **cada uma separadamente** com a incógnita e inverta as frações das que forem inversamente proporcionais.

Exemplo: 8 operários fazem 200 m de muro em 5 dias. Quantos dias 10 operários levam para fazer 300 m?

- Operários ↑ → dias ↓ (inversa) → usa `8/10`
- Muro ↑ → dias ↑ (direta) → usa `300/200`

`x = 5 · (8/10) · (300/200) = 5 · 0,8 · 1,5 = 6 dias`

## Porcentagem

`x% de V = (x/100) · V`

**Aumento de x%**: multiplique por `(1 + x/100)`
**Desconto de x%**: multiplique por `(1 - x/100)`

Trabalhar com o **fator multiplicativo** é o que separa quem resolve rápido de quem se perde:

- +20% → × 1,20
- -20% → × 0,80
- +5% → × 1,05

## Variações sucessivas: a pegadinha favorita das bancas

Um produto sofre aumento de 20% e depois desconto de 20%. Ele voltou ao preço original?

**Não.** `1,20 × 0,80 = 0,96` — o preço final é 96% do original, uma **perda de 4%**.

Porcentagens sucessivas se **multiplicam**, nunca se somam. Este é provavelmente o erro mais cobrado e mais cometido em toda a prova.

Outro caso: dois descontos sucessivos de 10% equivalem a um desconto único de quanto?

`0,90 × 0,90 = 0,81` → desconto único de **19%**, não 20%.

## Como achar a taxa de variação

`variação % = (final - inicial) / inicial × 100`

O denominador é sempre o valor **inicial**. Trocar isso é o segundo erro mais comum.

## Estratégia de prova

1. **Escreva os fatores multiplicativos**, não as porcentagens soltas.
2. **Em regra de três, confira o sentido** de cada grandeza antes de montar.
3. **Estime a ordem de grandeza.** Se a resposta deveria ser "um pouco menos que o dobro" e deu 10 vezes, tem erro.
4. **Não some porcentagens de bases diferentes.** 10% de 200 mais 10% de 500 não é 10% de 700 — bem, aqui é, mas 10% de aumento seguido de 10% de aumento não é 20%.
$md$, 10, 7),

-- ══════════════════════════════════════════════════════════════
('Trigonometria',
 'Trigonometria: do triângulo retângulo às leis gerais',
 'Razões fundamentais, valores notáveis, ciclo trigonométrico e as leis dos senos e cossenos.',
 $md$
Trigonometria começa simples — três razões num triângulo retângulo — e se estende para qualquer triângulo com duas leis.

## No triângulo retângulo

Fixando um ângulo agudo `θ`:

- `sen θ = cateto oposto / hipotenusa`
- `cos θ = cateto adjacente / hipotenusa`
- `tg θ = cateto oposto / cateto adjacente = sen θ / cos θ`

Relação fundamental: `sen²θ + cos²θ = 1`

> Truque de memória: **SOH-CAH-TOA** — Seno = Oposto/Hipotenusa, Cosseno = Adjacente/Hipotenusa, Tangente = Oposto/Adjacente.

## Ângulos notáveis

| θ | sen | cos | tg |
| --- | --- | --- | --- |
| 30° | 1/2 | √3/2 | √3/3 |
| 45° | √2/2 | √2/2 | 1 |
| 60° | √3/2 | 1/2 | √3 |

Repare no padrão do seno: `√1/2, √2/2, √3/2`. O cosseno é a mesma sequência ao contrário. Isso torna a tabela quase impossível de esquecer.

## Ciclo trigonométrico

Sinais por quadrante:

| Quadrante | sen | cos | tg |
| --- | --- | --- | --- |
| 1º (0-90°) | + | + | + |
| 2º (90-180°) | + | − | − |
| 3º (180-270°) | − | − | + |
| 4º (270-360°) | − | + | − |

Redução ao primeiro quadrante:
- `sen(180° - x) = sen x`
- `cos(180° - x) = -cos x`
- `sen(360° - x) = -sen x`
- `cos(360° - x) = cos x`

## Leis para triângulos quaisquer

**Lei dos senos** — use quando conhecer um lado e o ângulo oposto a ele:

`a/sen A = b/sen B = c/sen C = 2R`

(`R` é o raio da circunferência circunscrita — a banca às vezes pede exatamente isso.)

**Lei dos cossenos** — use quando conhecer dois lados e o ângulo entre eles, ou os três lados:

`a² = b² + c² - 2bc · cos A`

> Note que, se `A = 90°`, então `cos A = 0` e a lei dos cossenos vira Pitágoras. Ela é a generalização.

### Qual usar?

| O que você tem | Use |
| --- | --- |
| Lado + ângulo oposto | Lei dos senos |
| Dois lados + ângulo entre eles | Lei dos cossenos |
| Três lados, quer um ângulo | Lei dos cossenos |
| Dois ângulos + um lado | Lei dos senos |

## Área com trigonometria

`A = (1/2) · a · b · sen C`

Muito útil quando a altura não é dada — e é dada raramente.

## Estratégia de prova

1. **Marque o ângulo de referência na figura.** Oposto e adjacente dependem dele.
2. **Racionalize só no final.** Carregar `√3/3` no meio da conta atrasa.
3. **Confira o quadrante** antes de decidir o sinal.
4. **Se o triângulo não é retângulo, não force Pitágoras.** Vá para a lei dos cossenos.
$md$, 11, 8)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Matemática'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

SELECT 'Teoria de Matemática' AS seed, COUNT(*) AS total
FROM teoria_conteudo t
JOIN materias m ON m.id = t.materia_id
WHERE m.nome = 'Matemática';
