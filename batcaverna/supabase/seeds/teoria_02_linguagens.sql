-- ============================================================================
-- BatCaverna — Conteúdo teórico: PORTUGUÊS e INGLÊS
-- ============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════
-- PORTUGUÊS
-- ══════════════════════════════════════════════════════════════
INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

('Interpretação de Texto',
 'Interpretação de Texto: ler o que está escrito',
 'O método para não cair nas alternativas que "fazem sentido" mas não estão no texto, e como identificar tese, argumento e intenção.',
 $md$
Interpretação é o assunto que mais cai em toda prova de Português — e o único em que decorar não ajuda. O que ajuda é **método**.

## A regra que resolve a maioria dos erros

> A resposta certa está **no texto**. A alternativa errada costuma ser verdadeira no mundo, mas não afirmada pelo autor.

O candidato erra quando responde com o que ele sabe sobre o assunto, em vez do que o texto diz. Antes de marcar, pergunte: **em que linha isso está?** Se você não consegue apontar, provavelmente é a alternativa armadilha.

## Ordem de leitura

1. **Leia o enunciado primeiro.** Saber o que procurar muda como você lê.
2. **Leia o texto inteiro sem parar.** Não sublinhe na primeira passada — você ainda não sabe o que importa.
3. **Volte ao trecho específico** que a pergunta indica.
4. **Elimine.** Em interpretação, eliminar é mais seguro do que escolher.

## Tese, argumento e conclusão

- **Tese**: a opinião central que o autor defende. Costuma estar no primeiro ou no último parágrafo.
- **Argumentos**: o que sustenta a tese (dados, exemplos, autoridade, comparação).
- **Conclusão**: o fechamento, que muitas vezes retoma a tese com outras palavras.

> Quando a questão pede a "ideia central" ou o "objetivo do texto", ela quer a **tese**, não um detalhe interessante do meio.

## Verbos de comando: o que cada um pede

| Verbo | O que fazer |
| --- | --- |
| Depreende-se / infere-se | Conclusão **não** escrita, mas sustentada pelo texto |
| Afirma-se / o autor diz | Está literalmente no texto |
| O texto sugere | Sentido implícito, com pista textual |
| Pode-se concluir | Consequência lógica do que foi dito |

A diferença entre "infere-se" e "afirma-se" derruba muita gente. Inferência precisa ter **base no texto** — não é chute nem opinião.

## Funções da linguagem

| Função | Foco | Marca |
| --- | --- | --- |
| Referencial | informação | 3ª pessoa, objetividade, dados |
| Emotiva | emissor | 1ª pessoa, interjeição, subjetividade |
| Conativa | receptor | imperativo, vocativo, "você" |
| Fática | canal | "alô?", "entende?", testa a conexão |
| Metalinguística | código | linguagem falando de si (dicionário, poema sobre poesia) |
| Poética | mensagem | rima, figura de linguagem, forma trabalhada |

Publicidade quase sempre mistura **conativa** (convencer você) com **poética** (forma criativa).

## Denotação e conotação

- **Denotativo**: sentido literal, de dicionário.
- **Conotativo**: sentido figurado, construído pelo contexto.

"Ele é uma rocha" — se for geologia, denotativo; se for sobre firmeza de caráter, conotativo.

## Estratégia de prova

1. **Marque as palavras-chave do enunciado**: "EXCETO", "INCORRETA", "principal".
2. **Cuidado com generalizações.** Alternativas com "sempre", "nunca", "todos", "nenhum" costumam ser falsas, porque textos argumentativos raramente afirmam absolutos.
3. **Volte ao texto para cada alternativa.** Quatro voltas rápidas custam menos que uma questão errada.
$md$, 10, 1),

('Sintaxe',
 'Sintaxe: da oração ao período, sem decoreba',
 'Sujeito, predicado, transitividade, orações subordinadas e o raciocínio que sustenta concordância, regência e crase.',
 $md$
Sintaxe é a espinha dorsal da gramática de prova: concordância, regência, crase e pontuação **todas** dependem de você identificar a função dos termos.

## Termos essenciais

**Sujeito** — de quem se declara algo. Ache o verbo e pergunte *quem?* ou *o quê?*

Tipos:
- **Simples**: um núcleo — *O soldado chegou.*
- **Composto**: dois ou mais núcleos — *Ana e Bruno chegaram.*
- **Oculto/elíptico**: identificável pela desinência — *Chegamos cedo.*
- **Indeterminado**: verbo na 3ª pessoa do plural sem referente, ou com *se* — *Falaram mal de você.* / *Precisa-se de voluntários.*
- **Oração sem sujeito**: verbos que indicam fenômeno da natureza, *haver* no sentido de existir, e *fazer* de tempo — *Choveu muito.* / *Havia dez alunos.* / *Faz dois anos.*

> `Haver` no sentido de existir é **impessoal**: fica sempre no singular. *Havia dez alunos*, nunca "haviam". Já `existir` tem sujeito e concorda: *Existiam dez alunos.*

## Transitividade verbal

| Tipo | Complemento | Exemplo |
| --- | --- | --- |
| Intransitivo | nenhum | *O menino dormiu.* |
| Transitivo direto | objeto direto (sem preposição) | *Comprei **o livro**.* |
| Transitivo indireto | objeto indireto (com preposição) | *Preciso **de ajuda**.* |
| Bitransitivo | os dois | *Dei **o livro** **a ela**.* |
| De ligação | predicativo | *Ele **é** competente.* |

Transitividade é o que determina a **regência** — e regência é o que determina a **crase**.

## Predicativo do sujeito × adjunto adnominal

- **Predicativo**: atribui estado, ligado ao verbo — *Os alunos chegaram **cansados**.*
- **Adjunto adnominal**: caracteriza o substantivo diretamente — *Os alunos **cansados** chegaram.*

A diferença muda a interpretação: no primeiro, todos chegaram e estavam cansados; no segundo, só os cansados chegaram.

## Orações subordinadas

**Substantivas** — exercem função de substantivo. Teste: substitua por *isso*.
*Espero **que você venha**.* → *Espero isso.* (objetiva direta)

**Adjetivas** — exercem função de adjetivo, introduzidas por pronome relativo.
- **Restritiva** (sem vírgula): restringe — *Os alunos **que estudaram** passaram.* (só alguns passaram)
- **Explicativa** (entre vírgulas): explica — *Os alunos, **que estudaram**, passaram.* (todos estudaram e todos passaram)

> Essa vírgula muda o sentido da frase inteira. É uma das questões mais recorrentes de toda prova militar.

**Adverbiais** — indicam circunstância: causal (*porque*), condicional (*se*), concessiva (*embora*), consecutiva (*tão... que*), comparativa (*como*), final (*para que*), temporal (*quando*), proporcional (*à medida que*).

## Crase: a regra em três passos

Crase é a fusão da preposição `a` com o artigo `a(s)`. Existe quando:

1. O termo regente **exige a preposição `a`**, e
2. O termo regido é **feminino e admite artigo**.

Teste prático: **troque a palavra feminina por uma masculina**. Se aparecer *ao*, há crase.

- *Fui **à** escola* → *Fui **ao** colégio* ✔ crase
- *Refiro-me **à** proposta* → *Refiro-me **ao** projeto* ✔ crase
- *Cheguei **a** Brasília* → *Cheguei **a** Recife*... teste melhor: *Voltei **de** Brasília* (não *da*) → sem artigo → sem crase

**Nunca há crase** antes de: verbo (*a fazer*), palavra masculina (exceto "à moda de"), pronome pessoal (*a ela*), a maioria dos pronomes de tratamento, palavra no plural precedida de *a* singular (*a pessoas*).

**Sempre há crase** em: *à moda de*, *à medida que*, *à noite*, *às vezes*, *à direita*, e antes de *aquele/aquela/aquilo* quando o verbo pede preposição (*Refiro-me àquilo*).

## Estratégia de prova

1. **Ache o verbo primeiro.** Sujeito e complementos giram em torno dele.
2. **Para crase, faça o teste do masculino.** É mais rápido e mais confiável que decorar lista.
3. **Vírgula que muda sentido é sempre pegadinha de oração adjetiva.**
$md$, 13, 2),

('Figuras de Linguagem',
 'Figuras de Linguagem: reconhecer pelo efeito, não pelo nome',
 'As figuras mais cobradas, com o critério prático que distingue as que costumam ser confundidas.',
 $md$
A banca raramente pergunta "o que é uma metonímia". Ela dá um trecho e pergunta **qual recurso foi usado**. Então o que importa é reconhecer o efeito.

## Figuras de palavra

- **Metáfora** — comparação implícita, sem conectivo. *Meu coração é um deserto.*
- **Comparação (símile)** — comparação explícita, com *como*, *tal qual*. *Meu coração é **como** um deserto.*
- **Metonímia** — troca por proximidade lógica. *Li **Machado de Assis*** (autor pela obra). *Bebeu **um copo*** (recipiente pelo conteúdo).
- **Catacrese** — metáfora tão gasta que virou o nome usual. *Braço da cadeira, pé da mesa, asa da xícara.*
- **Sinestesia** — mistura de sentidos. *Um grito **áspero***, *cor **quente***.

> **Metáfora × metonímia**: metáfora é por *semelhança* (coração ≈ deserto: ambos vazios). Metonímia é por *contiguidade* (o autor produziu a obra — não são parecidos, são ligados).

## Figuras de pensamento

- **Antítese** — ideias opostas lado a lado. *O amor é fogo que arde sem se ver.*
- **Paradoxo (oximoro)** — ideias opostas na **mesma** ideia, criando contradição aparente. *Silêncio ensurdecedor.*
- **Ironia** — dizer o contrário do que se quer dar a entender. *Que belo trabalho*, diante de um desastre.
- **Eufemismo** — suavizar. *Ele nos deixou* (morreu).
- **Hipérbole** — exagerar. *Morri de rir.*
- **Prosopopeia (personificação)** — dar traço humano ao não humano. *O vento sussurrava.*

> **Antítese × paradoxo**: na antítese os opostos convivem em partes diferentes da frase. No paradoxo eles se chocam dentro da mesma expressão, criando algo logicamente impossível.

## Figuras de sintaxe

- **Elipse** — omitir termo facilmente recuperável. *Na sala, apenas dois alunos.* (omitiu-se *havia*)
- **Zeugma** — omitir termo já citado antes. *Ela prefere cinema; ele, teatro.*
- **Pleonasmo** — redundância. Vicioso: *subir para cima*. Literário (de reforço): *Morrerás morte vil.*
- **Anáfora** — repetir palavra no início de versos ou frases seguidas.
- **Hipérbato (inversão)** — alterar a ordem natural. *Ouviram do Ipiranga as margens plácidas...*
- **Polissíndeto** — repetir conectivo. *E chora, e ri, e grita, e cala.*

## Figuras de som

- **Aliteração** — repetição de consoantes. *O rato roeu a roupa do rei.*
- **Assonância** — repetição de vogais.
- **Onomatopeia** — imitação de som. *Tic-tac, zunzum.*

## Estratégia de prova

1. **Descreva o efeito antes de nomear.** "Ele comparou sem usar 'como'" → metáfora.
2. **Duas alternativas plausíveis?** Volte ao critério que as separa (semelhança vs. proximidade; opostos separados vs. opostos fundidos).
3. **Em texto publicitário**, procure hipérbole, metáfora e prosopopeia — são as prediletas.
$md$, 9, 3)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Português'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ══════════════════════════════════════════════════════════════
-- INGLÊS
-- ══════════════════════════════════════════════════════════════
INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

('Compreensão e Interpretação de Texto',
 'Reading: como acertar sem entender todas as palavras',
 'Skimming, scanning, cognatos e a estratégia para responder texto em inglês mesmo com vocabulário limitado.',
 $md$
Interpretação em inglês é o item mais cobrado da prova de Língua Inglesa — 109 questões neste banco. E a boa notícia é que você **não precisa entender todas as palavras** para acertar.

## As três leituras

**1. Skimming (visão geral)** — passe os olhos em 30 segundos. Título, primeira e última frase de cada parágrafo. Objetivo: descobrir o **assunto** e o **tom** (crítico? informativo? irônico?).

**2. Scanning (busca dirigida)** — leia a pergunta, identifique a palavra-chave, e procure **só ela** no texto. Números, nomes próprios e datas são fáceis de localizar.

**3. Leitura detalhada** — apenas do trecho onde a resposta está.

## Cognatos: use, mas com cuidado

Muita palavra em inglês é transparente: *important, situation, government, technology, national*. Elas dão o esqueleto do sentido.

**Falsos cognatos** que a banca adora:

| Inglês | Parece | É na verdade |
| --- | --- | --- |
| actually | atualmente | na verdade |
| eventually | eventualmente | no fim das contas |
| pretend | pretender | fingir |
| push | puxar | empurrar |
| library | livraria | biblioteca |
| parents | parentes | pais |
| realize | realizar | perceber |
| support | suportar | apoiar |
| costume | costume | fantasia |
| college | colégio | faculdade |

## Marcadores discursivos: o mapa do texto

Eles avisam para onde o argumento vai — e a banca pergunta exatamente isso.

| Função | Marcadores |
| --- | --- |
| Adição | *moreover, furthermore, besides, in addition* |
| Contraste | *however, nevertheless, although, whereas, on the contrary, yet* |
| Causa | *because, since, due to, owing to* |
| Consequência | *therefore, thus, hence, as a result, consequently* |
| Exemplo | *for instance, such as, namely* |
| Concessão | *despite, in spite of, even though* |
| Alternativa | *instead of, rather than* |
| Conclusão | *in short, to sum up, overall* |

> Se a questão pergunta que ideia *however* introduz, a resposta é **contraste/oposição**. Se pergunta sobre *instead of*, é **substituição** — troca de uma coisa por outra.

## Referência: a que "it" se refere?

Pronomes retomam algo já dito. A regra prática: o referente costuma ser o **substantivo mais próximo antes**, que concorde em número.

- *it / its* → coisa ou animal no singular
- *they / their / them* → plural
- *who / whom* → pessoas
- *which* → coisas
- *this / these* → perto (ou o que acabou de ser dito)
- *that / those* → longe (ou algo mais distante no texto)

## Inferência de vocabulário pelo contexto

Não sabe uma palavra? Procure:
1. **Definição na própria frase** — muitas vezes vem entre vírgulas ou depois de *that is*, *or*.
2. **Contraste** — se vier depois de *but* ou *however*, significa o oposto do que veio antes.
3. **Exemplo** — *such as* seguido de exemplos revela a categoria.
4. **Prefixo/sufixo** — *un-*, *dis-*, *-less* negam; *-ful* indica cheio de; *-ly* forma advérbio.

## Estratégia de prova

1. **Leia o enunciado em português primeiro.** Ele diz o que procurar.
2. **Nunca traduza o texto inteiro.** Não há tempo e não é necessário.
3. **Elimine alternativas com informação que não está no texto**, mesmo que sejam verdadeiras no mundo.
4. **Cuidado com alternativa que copia palavras do texto** mas inverte o sentido — é a armadilha mais comum.
$md$, 10, 1),

('Gramática',
 'Grammar: os pontos que os concursos militares realmente cobram',
 'Tempos verbais, modais, comparativos, condicionais e preposições — o núcleo gramatical das provas.',
 $md$
A gramática cobrada nos concursos militares é previsível. Estes são os blocos que se repetem ano após ano.

## Tempos verbais essenciais

| Tempo | Uso | Marcadores |
| --- | --- | --- |
| Simple Present | rotina, fato geral | *always, usually, every day* |
| Present Continuous | agora, temporário | *now, at the moment* |
| Simple Past | ação concluída no passado | *yesterday, ago, last week, in 1999* |
| Past Continuous | ação em curso no passado | *while, when* |
| Present Perfect | passado com ligação ao presente | *already, yet, ever, never, since, for* |
| Past Perfect | passado antes de outro passado | *had + particípio* |
| Future (will / going to) | *will* = decisão na hora; *going to* = plano | *tomorrow, next* |

> **Simple Past × Present Perfect** é a distinção mais cobrada. Se há tempo definido no passado (*yesterday, in 2010*), é Simple Past. Se o tempo é indefinido ou o efeito continua (*I have lived here for 5 years*), é Present Perfect.

## Verbos modais

| Modal | Significado |
| --- | --- |
| can / could | capacidade, possibilidade, permissão |
| may / might | possibilidade, permissão formal |
| must | obrigação forte, dedução lógica |
| have to | obrigação externa |
| should / ought to | conselho, recomendação |
| would | condicional, hipótese |

Depois de modal vem sempre o verbo no **infinitivo sem *to***: *She can swim*, nunca "can to swim".

> *must* × *have to*: **must** é obrigação de quem fala ("eu determino"); **have to** é obrigação vinda de fora (regra, lei). Na negativa a diferença é grande: *mustn't* = proibido; *don't have to* = não é necessário.

## Comparativos e superlativos

- Adjetivos curtos (1 sílaba): *tall → taller → the tallest*
- Terminados em *-y*: *happy → happier → the happiest*
- Adjetivos longos: *beautiful → more beautiful → the most beautiful*
- Irregulares: *good → better → the best* · *bad → worse → the worst* · *far → further → the furthest*

Estruturas:
- Igualdade: *as ... as* — *She is **as tall as** her brother.*
- Superioridade: *more/-er ... than*
- Inferioridade: *less ... than*

## Condicionais

| Tipo | Estrutura | Uso |
| --- | --- | --- |
| Zero | If + present, present | fato sempre verdadeiro |
| First | If + present, will + verbo | possível no futuro |
| Second | If + past, would + verbo | hipotético/improvável |
| Third | If + past perfect, would have + particípio | impossível (passado) |

*If I **were** you...* — no Second Conditional usa-se *were* para todas as pessoas.

## Pronomes relativos

- **who** — pessoas (sujeito)
- **whom** — pessoas (objeto, formal): *the children, two thirds of **whom**...*
- **which** — coisas
- **that** — pessoas ou coisas (só em orações restritivas)
- **whose** — posse

## Voz passiva

`be + particípio passado`

*They built the school in 1950* → *The school **was built** in 1950.*

A passiva é usada quando quem pratica a ação é irrelevante ou desconhecido — muito comum em textos científicos e jornalísticos.

## Estratégia de prova

1. **Procure o marcador temporal.** Ele decide o tempo verbal na maioria das questões.
2. **Depois de modal, infinitivo sem *to*.** Elimina alternativas rapidamente.
3. **Em concordância, ache o núcleo do sujeito**, ignorando o que vem entre vírgulas.
$md$, 11, 2)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Inglês'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

SELECT 'Teoria de Linguagens' AS seed, COUNT(*) AS total
FROM teoria_conteudo t
JOIN materias m ON m.id = t.materia_id
WHERE m.nome IN ('Português', 'Inglês');
