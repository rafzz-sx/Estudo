-- ============================================================================
-- BatCaverna — Conteúdo teórico: INGLÊS
-- ============================================================================
-- Inglês é a TERCEIRA maior matéria do banco — 476 questões — e não tinha uma
-- linha de teoria. Era a maior lacuna da plataforma depois da taxonomia.
--
-- Os temas seguem a frequência real depois da unificação (migration 011):
-- Reading Comprehension 201, Gramática e Estrutura 72, Vocabulary 54.
-- Repare que interpretação sozinha é 42% das questões de Inglês — e é por
-- isso que ela vem primeiro e é a mais longa.
--
-- Os nomes dos temas são IGUAIS aos assuntos canônicos de propósito: é isso
-- que permite a trilha e o radar de fraqueza ligarem a questão errada ao
-- texto que a explica.
-- ============================================================================

BEGIN;

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Reading Comprehension',
 'Reading Comprehension: 42% da prova de Inglês',
 'A estratégia de leitura para quem não domina o vocabulário inteiro, e as quatro armadilhas que a banca repete.',
 $md$
Interpretação é **201 das 476 questões** de Inglês deste banco. Se você tiver tempo para estudar uma coisa só de Inglês, é esta.

## A notícia boa: você não precisa entender tudo

A prova não testa se você sabe traduzir o texto. Testa se você **localiza a informação** que a pergunta pede. São coisas diferentes, e confundir as duas é o que faz o candidato travar na primeira palavra desconhecida.

### A ordem certa de leitura

1. **Leia a PERGUNTA primeiro.** Você passa a ler o texto procurando algo, não decorando tudo.
2. **Leia o texto todo, sem parar em palavra desconhecida.** Só a primeira passada.
3. **Volte ao trecho** que responde à pergunta.
4. **Elimine** as alternativas que dizem algo que o texto não diz.

> Palavra desconhecida quase nunca é o problema. Na maioria das questões dá para responder sem saber 20% das palavras — desde que você entenda a **estrutura** da frase.

## Como adivinhar uma palavra pelo contexto

| Pista | Exemplo | O que fazer |
| --- | --- | --- |
| **Cognato** | *information, natural, possible* | Parece português e é. ~30% do vocabulário acadêmico |
| **Prefixo/sufixo** | *un-, dis-, -less, -ful* | `unhappy` = não-feliz; `useless` = sem uso |
| **Conector antes** | *however, therefore* | Diz se o que vem é oposição ou consequência |
| **Repetição** | a mesma ideia dita de outro jeito | O texto costuma se explicar sozinho |

### Falsos cognatos que a banca adora

| Parece | Na verdade é | O certo para o "parece" |
| --- | --- | --- |
| *actually* | na verdade | *currently* (atualmente) |
| *pretend* | fingir | *intend* (pretender) |
| *push* | empurrar | *pull* (puxar) |
| *library* | biblioteca | *bookstore* (livraria) |
| *parents* | pais | *relatives* (parentes) |
| *realize* | perceber | *carry out* (realizar) |
| *comprehensive* | abrangente | *understanding* (compreensivo) |
| *eventually* | por fim | *occasionally* (eventualmente) |

## Os quatro tipos de pergunta

**1. Ideia principal** — *"The main idea of the text is..."*
A resposta cobre o texto **inteiro**. Alternativa que fala de um parágrafo só está errada, mesmo sendo verdadeira.

**2. Detalhe** — *"According to the text..."*
A resposta está literalmente ali. Volte e ache.

**3. Inferência** — *"It can be inferred that..."*
Não está escrito, mas decorre. Cuidado: inferir não é chutar. Tem que se sustentar no texto.

**4. Referência** — *"The word 'it' in line 4 refers to..."*
Volte uma ou duas linhas. O referente quase sempre é o substantivo mais próximo antes.

## As armadilhas que se repetem

- **Alternativa verdadeira mas não perguntada.** Está certa sobre o mundo, ou está no texto — mas não responde àquela pergunta.
- **Extremo.** Alternativas com *always, never, all, none* costumam estar erradas. Texto acadêmico raramente é absoluto.
- **Inversão.** A alternativa troca causa por consequência.
- **Palavra igual.** A alternativa repete uma palavra do texto para parecer certa. Repetir não é responder.
$md$, 12, 1),

-- ══════════════════════════════════════════════════════════════
('Gramática e Estrutura da Frase',
 'Gramática de Inglês: a ordem da frase e o que ela revela',
 'A estrutura fixa do inglês, classes de palavras e a concordância — o que resolve a questão de gramática sem decorar regra.',
 $md$
## A ordem é fixa — e isso é uma vantagem

O inglês é rígido: **SUJEITO → VERBO → OBJETO**. Diferente do português, você não pode inverter à vontade.

Isso resolve muita questão: se você sabe onde cada peça fica, descobre a **função** da palavra mesmo sem conhecê-la.

> `The *blicket* quickly *gorped* the *frim*.`
> Você não sabe nenhuma das três palavras — mas sabe que *blicket* é o sujeito (substantivo), *gorped* é o verbo (passado, pelo *-ed*) e *frim* é o objeto.

## Identificar a classe pela posição e pelo sufixo

| Classe | Onde fica | Sufixos típicos |
| --- | --- | --- |
| **Substantivo** | antes do verbo, depois de *the/a* | -tion, -ment, -ness, -ity, -er |
| **Verbo** | depois do sujeito | -ate, -ize, -ify |
| **Adjetivo** | **antes** do substantivo | -ful, -less, -ous, -ive, -al |
| **Advérbio** | perto do verbo | **-ly** |

> Em inglês o adjetivo vem ANTES: *a red car*, nunca *a car red*. E adjetivo não tem plural: *two red cars*, não *reds cars*.

## Ordem dos adjetivos

Quando há vários, a ordem é fixa: **opinião → tamanho → idade → forma → cor → origem → material**.

*a beautiful small old round brown Italian wooden table*

A banca cobra pedindo qual sequência soa natural.

## Concordância — os casos que caem

- **3ª pessoa do singular no presente leva -s:** *He work**s***. É o erro mais cobrado.
- **Sujeitos incontáveis são singulares:** *information, advice, news, furniture* — *The news **is** good*, não *are*.
- **Everyone / everybody / each são singulares:** *Everyone **has** a ticket*.
- **There is / There are** concorda com o que vem depois: *There **are** three books*.

## Question tags

Afirmativa pede tag negativa e vice-versa, com o mesmo auxiliar:

- *She is a doctor, **isn't she**?*
- *You don't smoke, **do you**?*
- *He can swim, **can't he**?*

## Comparativo e superlativo

| Tamanho | Comparativo | Superlativo |
| --- | --- | --- |
| 1 sílaba | *tall**er** than* | *the tall**est*** |
| 2 sílabas em -y | *happ**ier** than* | *the happ**iest*** |
| 3+ sílabas | ***more** beautiful than* | *the **most** beautiful* |

Irregulares que sempre caem: *good → better → the best*; *bad → worse → the worst*; *far → further → the furthest*.
$md$, 10, 2),

-- ══════════════════════════════════════════════════════════════
('Verb Tenses',
 'Verb Tenses: escolher o tempo pelo marcador',
 'Os tempos verbais que caem, com o advérbio que denuncia cada um — a forma mais rápida de acertar sem decorar tabela.',
 $md$
## O atalho: cada tempo tem um marcador

Antes de olhar o verbo, procure o **advérbio de tempo**. Ele quase sempre entrega a resposta.

| Marcador | Tempo | Exemplo |
| --- | --- | --- |
| *every day, usually, often* | **Simple Present** | *She **works** every day* |
| *now, at the moment, look!* | **Present Continuous** | *She **is working** now* |
| *yesterday, ago, last week, in 1990* | **Simple Past** | *She **worked** yesterday* |
| *already, just, yet, ever, never* | **Present Perfect** | *She **has** just **worked*** |
| *for, since* | **Present Perfect** | *She **has worked** since 2020* |
| *tomorrow, next week* | **Will / Going to** | *She **will work** tomorrow* |
| *when X happened (2 ações no passado)* | **Past Perfect** | *She **had worked** before he arrived* |

## A confusão nº 1: Simple Past × Present Perfect

Esta é a distinção que mais derruba, porque **o português não faz essa diferença**.

- **Simple Past** — terminou, e o QUANDO importa: *I **saw** that film **last night***
- **Present Perfect** — a relação com o presente importa; o quando, não: *I **have seen** that film* (em algum momento; e por isso eu conheço o filme)

> Regra prática: se a frase tem **tempo específico e terminado** (*yesterday, in 2019, last month*), é Simple Past. Present Perfect **não convive** com esses marcadores.

### For × Since
- ***for*** + duração: *for three years, for a long time*
- ***since*** + ponto de início: *since 2020, since I was a child*

## Present Continuous não é só "agora"

Também serve para **futuro já combinado**: *I **am meeting** her tomorrow* (já está marcado).

E existem verbos que **não vão** para o continuous (*stative verbs*): *know, like, want, believe, need, understand, belong*. Não se diz *I am knowing*.

## Voz passiva

**be** (no tempo da frase) + **particípio**.

| Ativa | Passiva |
| --- | --- |
| They **build** houses | Houses **are built** |
| They **built** houses | Houses **were built** |
| They **have built** houses | Houses **have been built** |
| They **will build** houses | Houses **will be built** |

A passiva aparece quando o agente é desconhecido, óbvio ou irrelevante — e é por isso que domina texto científico e jornalístico, que é o que a prova usa.
$md$, 10, 3),

-- ══════════════════════════════════════════════════════════════
('Modal Verbs',
 'Modal Verbs: o que cada um significa de verdade',
 'A tabela dos modais por grau de certeza e obrigação, com a diferença entre mustn''t e don''t have to.',
 $md$
Modais não têm *-s* na 3ª pessoa, não usam *do* na negativa e são seguidos de verbo no **infinitivo sem to**.

*He **can** swim* — nunca *He cans* nem *He can to swim*.

## Por função

### Habilidade
- **can** — presente: *I **can** speak English*
- **could** — passado ou pedido educado: *I **could** swim when I was five*
- **be able to** — para os tempos que *can* não tem: *I **will be able to** go*

### Obrigação — e a pegadinha clássica

| Modal | Significa |
| --- | --- |
| **must** | obrigação forte, vinda de quem fala |
| **have to** | obrigação vinda de fora (regra, lei) |
| ⚠️ **mustn't** | **PROIBIDO** |
| ⚠️ **don't have to** | **não é necessário** (mas pode) |

> Esta é a pegadinha mais cobrada da matéria. *You **mustn't** smoke* = é proibido fumar. *You **don't have to** smoke* = você não precisa fumar. São quase opostos.

### Grau de certeza

| Modal | Certeza | Exemplo |
| --- | --- | --- |
| **must** | quase certeza positiva | *He **must** be tired* (só pode estar) |
| **may / might** | possibilidade | *It **might** rain* |
| **could** | possibilidade mais remota | *It **could** be true* |
| **can't** | quase certeza negativa | *He **can't** be serious* (não é possível) |

### Conselho
- **should / ought to** — *You **should** study more*
- **had better** — mais forte, com ameaça implícita: *You **had better** leave now*

## Modais no passado

**modal + have + particípio** — é a forma de falar de algo que já passou:

- *She **must have** forgotten* — deve ter esquecido
- *You **should have** told me* — devia ter me contado (mas não contou)
- *He **might have** left* — pode ter saído
- *I **could have** helped* — eu poderia ter ajudado (e não ajudei)

> Todas carregam arrependimento ou dedução sobre o passado. É por isso que aparecem tanto em texto de opinião.
$md$, 8, 4),

-- ══════════════════════════════════════════════════════════════
('Conjunctions and Connectors',
 'Connectors: a palavra que muda o sentido da frase inteira',
 'Os conectivos agrupados por função — a chave de metade das questões de interpretação.',
 $md$
Conectivo é o assunto que mais aparece **dentro** de questão de interpretação. A pergunta clássica: *"the word X introduces the idea of..."*.

Se você souber a **família** do conectivo, acerta sem entender o resto da frase.

## Por função

### Oposição / contraste
*but, however, nevertheless, although, though, even though, despite, in spite of, whereas, while, on the other hand, yet, instead of, rather than*

> A frase muda de direção. Se a alternativa fala em "contraste", "ressalva" ou "oposição", é aqui.

### Adição
*and, also, besides, moreover, furthermore, in addition, as well as, not only... but also*

### Causa
*because, since, as, due to, owing to, because of*

### Consequência
*so, therefore, thus, hence, consequently, as a result, that's why*

> **Cuidado com *since*:** significa "desde" (tempo) E "já que" (causa). O contexto decide.

### Condição
*if, unless, provided that, as long as, in case*

> ***unless* = if not.** *Unless you study, you will fail* = *If you don't study, you will fail*. A banca cobra essa equivalência direto.

### Finalidade
*to, in order to, so as to, so that*

### Exemplificação
*for example, for instance, such as, namely*

### Tempo
*when, while, before, after, as soon as, until, meanwhile*

## Although × Despite — o par que mais cai

Os dois significam "embora / apesar de", mas a estrutura é diferente:

| Conectivo | O que vem depois |
| --- | --- |
| *although / though / even though* | **frase completa** (sujeito + verbo) |
| *despite / in spite of* | **substantivo ou -ing** |

- *Although **it was raining**, we went out.* ✓
- *Despite **the rain**, we went out.* ✓
- *Despite **it was raining**...* ✗ — erro clássico

## Instead of × Rather than

- *instead of* — substituição: *He went out **instead of** studying* (não estudou)
- *rather than* — preferência: *He would walk **rather than** drive*
$md$, 8, 5),

-- ══════════════════════════════════════════════════════════════
('Vocabulary',
 'Vocabulary: formação de palavras e o que fazer com a palavra que você não sabe',
 'Prefixos, sufixos e phrasal verbs — como deduzir sentido em vez de decorar lista.',
 $md$
Decorar lista de vocabulário rende pouco. Entender **como a palavra é montada** rende em toda questão.

## Prefixos — mudam o sentido

| Prefixo | Sentido | Exemplo |
| --- | --- | --- |
| **un-, in-, im-, ir-, il-, dis-** | negação | *unhappy, impossible, irregular, disagree* |
| **re-** | de novo | *rewrite, rebuild* |
| **over-** | demais | *overwork, overcrowded* |
| **under-** | de menos, sob | *underestimate, underground* |
| **mis-** | errado | *misunderstand, misuse* |
| **pre-** | antes | *preview, prehistoric* |
| **post-** | depois | *postwar, postgraduate* |
| **co-** | junto | *cooperate, coexist* |

## Sufixos — mudam a classe

| Sufixo | Vira | Exemplo |
| --- | --- | --- |
| **-tion, -ment, -ness, -ity, -ship** | substantivo | *information, movement, happiness* |
| **-er, -or, -ist** | quem faz | *teacher, actor, scientist* |
| **-ful** | cheio de | *useful, careful* |
| **-less** | sem | *useless, careless* |
| **-able, -ible** | que pode ser | *readable, visible* |
| **-ly** | advérbio | *quickly, carefully* |
| **-ize, -ify, -en** | verbo | *modernize, simplify, widen* |

> **-ful × -less são opostos.** *Hopeful* (esperançoso) × *hopeless* (sem esperança). A banca troca um pelo outro na alternativa errada.

## Phrasal verbs

Verbo + preposição, e o sentido muda por completo. São os que mais aparecem:

| Phrasal | Sentido |
| --- | --- |
| *look for* | procurar |
| *look after* | cuidar de |
| *look up* | consultar (dicionário) |
| *look forward to* | ansiar por |
| *give up* | desistir |
| *find out* | descobrir |
| *carry out* | realizar, executar |
| *point out* | apontar, destacar |
| *come up with* | inventar, propor |
| *take place* | ocorrer |
| *put off* | adiar |
| *turn down* | recusar |
| *bring about* | causar |
| *get rid of* | livrar-se de |
| *deal with* | lidar com |

> Repare que *look for*, *look after*, *look up* e *look forward to* não têm nada a ver entre si. É a preposição que manda — e é por isso que decorar o verbo sozinho não ajuda.
$md$, 9, 6)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Inglês'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

-- Conferência: 6 temas de Inglês, cobrindo ~75% das questões da matéria.
SELECT m.nome AS materia, COUNT(*) AS temas
FROM teoria_conteudo t JOIN materias m ON m.id = t.materia_id
WHERE m.nome = 'Inglês' GROUP BY m.nome;
