-- ============================================================================
-- BatCaverna — Conteúdo teórico: FÍSICA, QUÍMICA e BIOLOGIA
-- ============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- FÍSICA
-- ══════════════════════════════════════════════════════════════
INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

('Cinemática',
 'Cinemática: MRU, MRUV e lançamentos',
 'As equações do movimento, como escolher a certa em 10 segundos e os erros de sinal que mais custam pontos.',
 $md$
Cinemática descreve o movimento sem se preocupar com a causa. É o primeiro assunto de Física e um dos mais cobrados.

## Grandezas

- **Deslocamento (Δs)**: variação de posição. É vetorial — pode ser negativo.
- **Distância percorrida**: o caminho todo. É sempre positiva.
- **Velocidade média**: `vm = Δs / Δt`
- **Aceleração**: `a = Δv / Δt`

> Ida e volta ao mesmo ponto: deslocamento **zero**, distância percorrida **não zero**. A velocidade média do trajeto todo é zero; a velocidade escalar média não.

## MRU — Movimento Retilíneo Uniforme

Velocidade constante, aceleração nula.

`S = S₀ + v·t`

Gráfico S×t: reta inclinada (a inclinação **é** a velocidade). Gráfico v×t: reta horizontal.

## MRUV — Movimento Retilíneo Uniformemente Variado

Aceleração constante. Três equações:

1. `v = v₀ + a·t` — sem posição
2. `S = S₀ + v₀·t + (a·t²)/2` — a completa
3. `v² = v₀² + 2·a·ΔS` — **Torricelli**, sem tempo

### Como escolher em 10 segundos

Liste o que o problema dá e o que pede. **A equação certa é a que não contém a variável que você não tem e não precisa.**

Se o problema não fala em tempo e não pede tempo → **Torricelli**. Essa única observação economiza muita conta.

## Sinais: onde todo mundo erra

Escolha um sentido positivo **no começo** e mantenha.

- Objeto freando: `v` e `a` têm sinais **opostos**
- Objeto acelerando: `v` e `a` têm o **mesmo** sinal
- Queda livre com "para cima positivo": `a = -9,8 m/s²`

## Queda livre e lançamento vertical

Mesmas equações do MRUV com `a = g ≈ 10 m/s²` (a prova costuma permitir arredondar).

- Tempo de subida = tempo de descida (sem resistência do ar)
- No ponto mais alto, `v = 0` — mas a aceleração **continua sendo g**. Essa é a pegadinha clássica.
- Altura máxima: `H = v₀² / (2g)`

## Lançamento horizontal e oblíquo

O segredo é **decompor**: os movimentos horizontal e vertical são **independentes**.

- **Horizontal**: MRU → `x = vx · t`
- **Vertical**: MRUV com `g` → `y = v₀y·t - (g·t²)/2`

O que liga os dois é o **tempo**, que é o mesmo.

No lançamento oblíquo com ângulo `θ`:
- `vx = v₀ · cos θ` (constante)
- `v₀y = v₀ · sen θ`
- Alcance máximo em terreno plano: `θ = 45°`

> Duas bolas, uma solta e outra lançada horizontalmente da mesma altura, chegam ao chão **ao mesmo tempo**. O movimento horizontal não afeta a queda.

## Gráficos

| Gráfico | A inclinação dá | A área dá |
| --- | --- | --- |
| S × t | velocidade | — |
| v × t | aceleração | deslocamento |
| a × t | — | variação de velocidade |

Questão de gráfico v×t pedindo "distância percorrida" é sempre **área sob a curva**.

## Estratégia de prova

1. **Desenhe o eixo e marque o sentido positivo.**
2. **Liste dados e incógnita** antes de escolher a fórmula.
3. **Converta unidades no início.** `km/h ÷ 3,6 = m/s`.
4. **Verifique a plausibilidade.** Carro a 300 m/s (1080 km/h) é sinal de erro de conversão.
$md$, 12, 1),

('Ondulatória',
 'Ondulatória: propagação, som e fenômenos ondulatórios',
 'Equação fundamental, o que muda e o que não muda ao trocar de meio, reflexão, refração, interferência e efeito Doppler.',
 $md$
Ondulatória é o segundo assunto mais cobrado de Física neste banco. A teoria é enxuta, mas cheia de detalhes que a banca explora.

## Equação fundamental

`v = λ · f`

- `v` = velocidade de propagação (m/s)
- `λ` = comprimento de onda (m)
- `f` = frequência (Hz)

Período: `T = 1/f`

## O ponto que decide metade das questões

Quando uma onda **muda de meio**:

- A **frequência NÃO muda** — ela é imposta pela fonte.
- A **velocidade muda** — depende do meio.
- Logo, o **comprimento de onda muda** (`λ = v/f`).

> Luz saindo do ar para a água: a cor (frequência) é a mesma, mas ela fica mais lenta e o comprimento de onda encurta.

## Classificação

**Quanto à natureza:**
- **Mecânicas** — precisam de meio material. Som, ondas no mar, corda. *Não se propagam no vácuo.*
- **Eletromagnéticas** — não precisam de meio. Luz, rádio, raio X. *No vácuo, todas viajam a `c = 3×10⁸ m/s`.*

**Quanto à direção de vibração:**
- **Transversais** — vibração perpendicular à propagação (luz, corda)
- **Longitudinais** — vibração paralela à propagação (**som no ar**)

> O som é uma onda **mecânica e longitudinal**. Por isso não se propaga no vácuo — é a base de várias questões sobre filmes de ficção científica.

## Velocidade do som

Ao contrário da luz, o som é **mais rápido em meios mais densos e rígidos**:

`v(sólidos) > v(líquidos) > v(gases)`

No ar a ~20 °C: cerca de 340 m/s.

## Fenômenos

- **Reflexão** — volta ao mesmo meio. Ângulo de incidência = ângulo de reflexão. Frequência, velocidade e λ não mudam. Gera **eco** (som) e imagem no espelho (luz).
- **Refração** — muda de meio, muda a velocidade e a direção. Frequência constante.
- **Difração** — contorna obstáculos. Mais evidente quando o obstáculo tem tamanho próximo de λ. É por isso que você ouve alguém atrás da parede mas não o vê: o som tem λ muito maior que a luz.
- **Interferência** — duas ondas se somam. **Construtiva** (em fase, amplitude soma) ou **destrutiva** (em oposição, se cancelam). Base dos fones com cancelamento de ruído.
- **Ressonância** — a fonte externa vibra na frequência natural do sistema, e a amplitude cresce muito.

## Qualidades fisiológicas do som

| Qualidade | Depende de | Percepção |
| --- | --- | --- |
| Altura | frequência | grave ou agudo |
| Intensidade | amplitude | fraco ou forte |
| Timbre | forma da onda | distingue violão de piano na mesma nota |

> Cuidado com o vocabulário: no cotidiano dizemos "som alto" para forte. Em Física, **alto = agudo**. Som forte é questão de **intensidade**, não de altura.

## Efeito Doppler

Movimento relativo entre fonte e observador altera a **frequência percebida**:

- Aproximando → frequência **aumenta** (som mais agudo)
- Afastando → frequência **diminui** (som mais grave)

A sirene da ambulância mudando de tom ao passar por você é o exemplo padrão. Na astronomia, o *redshift* das galáxias é o mesmo efeito com luz.

## Estratégia de prova

1. **Pergunte primeiro: mudou de meio?** Se sim, `f` constante e `λ` muda.
2. **Confira as unidades.** λ em metros, f em Hz, v em m/s.
3. **"Não se propaga no vácuo" = onda mecânica.** Elimina alternativas na hora.
$md$, 11, 2)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Física'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- QUÍMICA
-- ══════════════════════════════════════════════════════════════
INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

('Química Orgânica',
 'Química Orgânica: cadeias, funções e isomeria',
 'Como identificar a função pelo grupo funcional, nomenclatura IUPAC e os tipos de isomeria que caem na prova.',
 $md$
Química Orgânica parece decoreba, mas se organiza em torno de uma ideia: **o grupo funcional determina a função e as propriedades**.

## Reconhecer a função pelo grupo

| Função | Grupo funcional | Sufixo | Exemplo |
| --- | --- | --- | --- |
| Hidrocarboneto | só C e H | -o | metano |
| Álcool | `–OH` em carbono saturado | -ol | etanol |
| Fenol | `–OH` ligado a anel aromático | — | fenol |
| Aldeído | `–CHO` (na ponta) | -al | etanal |
| Cetona | `–CO–` (no meio) | -ona | propanona |
| Ácido carboxílico | `–COOH` | -oico | ácido etanoico |
| Éster | `–COO–` | -oato de -ila | etanoato de etila |
| Éter | `–O–` entre carbonos | -óxi- | metoximetano |
| Amina | `–NH₂` | -amina | metilamina |
| Amida | `–CONH₂` | -amida | etanamida |

> **Aldeído × cetona**: os dois têm C=O. A diferença é a **posição**. Se a carbonila está na extremidade da cadeia, é aldeído; se está no meio, é cetona.

## Nomenclatura IUPAC em três partes

`PREFIXO` (nº de carbonos) + `INFIXO` (tipo de ligação) + `SUFIXO` (função)

**Prefixo:** met(1), et(2), prop(3), but(4), pent(5), hex(6), hept(7), oct(8), non(9), dec(10)

**Infixo:** *an* = só ligações simples · *en* = uma dupla · *in* = uma tripla

Assim: `prop` + `en` + `o` = **propeno** (3 carbonos, uma dupla, hidrocarboneto).

## Classificação da cadeia

- **Aberta (acíclica) × Fechada (cíclica)**
- **Saturada** (só simples) × **Insaturada** (tem dupla ou tripla)
- **Homogênea** (só C entre C) × **Heterogênea** (tem heteroátomo — O, N, S — no meio da cadeia)
- **Normal** (sem ramificação) × **Ramificada**

## Isomeria

Mesma fórmula molecular, estruturas diferentes.

**Isomeria plana (constitucional):**
- **De cadeia** — cadeias diferentes (normal vs. ramificada)
- **De posição** — o grupo funcional muda de lugar
- **De função** — funções diferentes (álcool e éter; aldeído e cetona; ácido e éster)
- **Tautomeria** — equilíbrio dinâmico entre dois isômeros (aldo-enólica)

**Isomeria espacial:**
- **Geométrica (cis-trans)** — exige dupla ligação (ou ciclo) **e** ligantes diferentes em cada carbono da dupla. *Cis*: iguais do mesmo lado. *Trans*: em lados opostos.
- **Óptica** — exige **carbono quiral**: um carbono ligado a 4 grupos **todos diferentes**. Gera moléculas que são imagens especulares não sobreponíveis.

> Teste rápido de isomeria óptica: procure um carbono com quatro ligantes distintos. Se existe pelo menos um, a molécula é opticamente ativa.

## Propriedades e ligações intermoleculares

O que determina ponto de ebulição:

1. **Ligação de hidrogênio** (mais forte) — quando há `O–H`, `N–H` ou `F–H`. Álcoois e ácidos.
2. **Dipolo-dipolo** — moléculas polares sem H em O/N/F. Aldeídos, cetonas, ésteres.
3. **Dipolo induzido (London)** (mais fraca) — moléculas apolares. Hidrocarbonetos.

Entre moléculas de massa parecida: **álcool ferve mais alto que aldeído, que ferve mais alto que hidrocarboneto**.

E dentro da mesma função: quanto **maior a cadeia**, maior o ponto de ebulição. Já a **ramificação diminui** o ponto de ebulição (a molécula fica mais esférica e o contato entre elas diminui).

## Estratégia de prova

1. **Circule o grupo funcional primeiro.** Ele responde metade da pergunta.
2. **Conte os carbonos da cadeia principal** — a mais longa que contém o grupo funcional.
3. **Para comparar ebulição**, olhe primeiro o tipo de interação, depois o tamanho, depois a ramificação.
$md$, 12, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Química'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- BIOLOGIA
-- ══════════════════════════════════════════════════════════════
INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

('Ecologia',
 'Ecologia: cadeias, ciclos e impacto ambiental',
 'Níveis tróficos, fluxo de energia, ciclos biogeoquímicos, relações ecológicas e os impactos que o ENEM adora cobrar.',
 $md$
Ecologia é o assunto mais cobrado de Biologia — especialmente no ENEM, onde quase sempre vem contextualizada em um problema ambiental real.

## Níveis de organização

Indivíduo → População → Comunidade (biocenose) → Ecossistema → Bioma → Biosfera

- **População**: indivíduos da **mesma** espécie, mesmo local
- **Comunidade**: populações **diferentes** convivendo
- **Ecossistema**: comunidade + fatores abióticos (luz, água, solo, temperatura)

## Cadeia e teia alimentar

**Produtores** (autotróficos: plantas, algas, cianobactérias) → **Consumidores** (1º, 2º, 3º...) → **Decompositores** (fungos e bactérias)

**Nível trófico** é a posição na cadeia. Um mesmo organismo pode ocupar níveis diferentes em teias distintas — o ser humano é onívoro e ocupa vários.

### Fluxo de energia: a regra dos 10%

A cada nível trófico, **cerca de 90% da energia se perde** (respiração, calor, movimento). Só ~10% passa adiante.

Consequências que a banca cobra:
- Cadeias alimentares são **curtas** (raramente passam de 4-5 níveis)
- A **pirâmide de energia é sempre** de base larga — nunca invertida
- Dietas baseadas em produtores sustentam mais pessoas que dietas baseadas em carne

> **Energia flui** (entra como luz, sai como calor — via de mão única). **Matéria cicla** (os átomos são reaproveitados indefinidamente). Confundir isso é o erro mais comum do assunto.

## Ciclos biogeoquímicos

**Ciclo do carbono** — fotossíntese retira CO₂; respiração, decomposição e **queima de combustível fóssil** devolvem. O desequilíbrio atual vem da queima de carbono que estava estocado há milhões de anos.

**Ciclo do nitrogênio** — o N₂ atmosférico é inerte para a maioria dos seres vivos. Bactérias fixadoras (muitas em nódulos de leguminosas) transformam N₂ em amônia. Depois vêm nitrificação (→ nitrito → nitrato), assimilação e desnitrificação.

**Ciclo da água** — evaporação, transpiração, condensação, precipitação, infiltração. A transpiração das florestas gera os "rios voadores" que levam umidade para o Sudeste.

## Relações ecológicas

**Harmônicas (nenhum é prejudicado):**
- *Intraespecíficas*: colônia, sociedade
- *Interespecíficas*: mutualismo (obrigatório, ambos ganham — líquens), protocooperação (facultativa), comensalismo (um ganha, outro indiferente), inquilinismo

**Desarmônicas (alguém é prejudicado):**
- *Intraespecíficas*: competição, canibalismo
- *Interespecíficas*: predatismo, parasitismo, herbivoria, amensalismo, competição

> **Mutualismo × protocooperação**: no mutualismo a dependência é **obrigatória** (um não vive sem o outro). Na protocooperação ambos ganham, mas conseguem viver separados.

## Sucessão ecológica

**Primária** — começa em local sem vida prévia (rocha nua). Espécies pioneiras (líquens) preparam o solo.
**Secundária** — em local que já teve comunidade (área desmatada, roça abandonada). É mais rápida porque o solo já existe.

Ao longo da sucessão: biodiversidade **aumenta**, biomassa **aumenta**, e a comunidade caminha para o **clímax**, mais estável.

## Impactos ambientais

| Problema | Causa | Consequência |
| --- | --- | --- |
| Efeito estufa intensificado | CO₂, CH₄ de queima e pecuária | aquecimento global |
| Chuva ácida | SO₂ e NOx industriais | acidifica solo e água |
| Eutrofização | excesso de nutrientes (esgoto, fertilizante) | algas proliferam, O₂ despenca, peixes morrem |
| Bioacumulação | poluentes não degradáveis (mercúrio, DDT) | concentram-se nos níveis tróficos superiores |
| Destruição da camada de ozônio | CFCs | mais radiação UV |

> **Bioacumulação/magnificação trófica**: o poluente se concentra à medida que sobe a cadeia. Por isso peixes grandes e predadores acumulam mais mercúrio — e por isso o topo da cadeia sofre primeiro.

## Estratégia de prova

1. **Identifique quem ganha e quem perde** para classificar a relação ecológica.
2. **Energia flui, matéria cicla.** Guarde essa frase.
3. **Em questão de impacto ambiental**, procure a cadeia causal completa: causa → mecanismo → efeito.
$md$, 12, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Biologia'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

SELECT 'Teoria de Ciências da Natureza' AS seed, COUNT(*) AS total
FROM teoria_conteudo t
JOIN materias m ON m.id = t.materia_id
WHERE m.nome IN ('Física', 'Química', 'Biologia');
