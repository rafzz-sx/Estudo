-- ============================================================================
-- BatCaverna — Conteúdo teórico: REDAÇÃO e LITERATURA
-- ============================================================================
-- Redação é a única "matéria" que vale 1.000 pontos sozinha no ENEM e que
-- não tem questão de múltipla escolha — por isso a teoria aqui é ainda mais
-- necessária: não dá para aprender resolvendo questão.
--
-- Os TEMAS batem com os de `videoaulas` (seed videoaulas_01.sql), que é o
-- que faz a trilha mostrar texto e vídeo do mesmo assunto lado a lado.
--
-- Idempotente: a UNIQUE (materia_id, tema, nivel) impede duplicata.
-- ============================================================================

BEGIN;

-- A matéria Redação pode ainda não existir se nenhuma prova importada tinha
-- questão dela. Criamos antes de inserir a teoria.
INSERT INTO materias (nome, descricao, icone_emoji)
SELECT 'Redação', 'Texto dissertativo-argumentativo para ENEM e concursos', '✍️'
WHERE NOT EXISTS (SELECT 1 FROM materias WHERE nome = 'Redação');


-- ════════════════════════════════════════════════════════════════════
-- REDAÇÃO
-- ════════════════════════════════════════════════════════════════════

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Estrutura da Redação',
 'A estrutura da redação nota 1000, parágrafo por parágrafo',
 'Introdução, dois desenvolvimentos e conclusão: o que entra em cada parágrafo, com o esqueleto pronto e os erros que zeram.',
 $md$
A redação do ENEM tem uma estrutura tão previsível que dá para montar o esqueleto **antes de saber o tema**. Quem chega na prova sem esse esqueleto perde tempo decidindo o formato em vez de pensar no conteúdo.

## O formato exigido

- **Texto dissertativo-argumentativo** em prosa
- **Mínimo 8 linhas, máximo 30**
- Alvo realista: **25 a 30 linhas**, em **4 ou 5 parágrafos**
- Norma-padrão da língua portuguesa
- **Proposta de intervenção** obrigatória, respeitando os direitos humanos

## O esqueleto de 4 parágrafos

### Parágrafo 1 — Introdução (4 a 6 linhas)

Três movimentos, nessa ordem:

1. **Repertório de abertura** — um dado histórico, filosófico, literário, científico ou legal que ancore o tema
2. **Contextualização** — traga o repertório para o Brasil atual
3. **Tese** — sua posição, em uma frase clara, já indicando os dois aspectos que você vai desenvolver

> **Modelo:** "Na obra *X*, o autor Y defende que [ideia]. No entanto, no Brasil contemporâneo, [problema] persiste. Isso decorre tanto de [aspecto 1] quanto de [aspecto 2]."

Esse "tanto... quanto" fecha um contrato com o corretor: ele já sabe o que virá nos dois próximos parágrafos.

### Parágrafo 2 — Desenvolvimento 1 (7 a 9 linhas)

1. **Tópico frasal** — anuncie o aspecto 1
2. **Repertório legitimado** — dado, autor, lei, pesquisa
3. **Argumentação** — explique **por que** aquilo comprova sua tese. É aqui que a maioria perde ponto: cita e não explica
4. **Fecho** — costure de volta à tese

### Parágrafo 3 — Desenvolvimento 2 (7 a 9 linhas)

Mesma arquitetura, aspecto diferente. **Use um repertório de outra área** — se o D1 foi histórico, faça o D2 sociológico ou jurídico. Diversificar mostra repertório real.

### Parágrafo 4 — Conclusão (5 a 7 linhas)

Retome a tese e apresente a **proposta de intervenção completa**. Ela precisa dos **cinco elementos**:

| Elemento | Pergunta que responde | Exemplo |
| --- | --- | --- |
| **Agente** | Quem faz? | O Ministério da Educação |
| **Ação** | O que faz? | deve promover campanhas educativas |
| **Meio/modo** | Como? | por meio de parcerias com escolas públicas |
| **Finalidade** | Para quê? | a fim de conscientizar os jovens sobre [tema] |
| **Detalhamento** | Um deles explicado a fundo | com oficinas mensais no contraturno escolar |

> **O detalhamento é o que separa 160 de 200 na competência 5.** Não basta listar os cinco: um deles precisa vir explicado.

## Repertório: o que conta e o que não conta

**Conta (repertório legitimado):**
- Obras literárias, filmes, séries com autoria conhecida
- Filósofos e sociólogos (Bauman, Foucault, Arendt, Durkheim...)
- Dados de IBGE, ONU, OMS
- Constituição Federal, ECA, Lei Maria da Penha
- Fatos históricos

**Não conta:**
- "Desde os primórdios da humanidade..." — clichê vazio
- Provérbio popular
- Opinião sem fonte
- Repertório **citado mas não conectado** ao argumento

## Erros que zeram a redação

1. **Fuga total ao tema**
2. Não ser dissertativo-argumentativo (escreveu narração ou poema)
3. Menos de 8 linhas
4. **Desrespeito aos direitos humanos** — a armadilha mais comum: propor pena de morte, tortura, castração, extermínio
5. Cópia dos textos motivadores sem desenvolvimento próprio
6. Parte deliberadamente desconectada do tema

## Cronograma dos 60 minutos

| Tempo | O que fazer |
| --- | --- |
| 0–5 min | Ler a proposta e os textos motivadores; **circular a palavra-chave do tema** |
| 5–12 min | Rascunhar: tese + dois aspectos + proposta |
| 12–45 min | Escrever no rascunho |
| 45–55 min | **Passar a limpo** |
| 55–60 min | Revisar: crase, concordância, repetição de palavra |

> Não passe a limpo depois dos 55 minutos. Redação incompleta na folha oficial vale o que está escrito lá — o rascunho não é corrigido.

## Estratégia final

1. **Nunca comece pela introdução no rascunho.** Defina a tese e os dois aspectos primeiro; a introdução sai sozinha depois.
2. **Um parágrafo, uma ideia.** Se você precisou de "além disso" duas vezes no mesmo parágrafo, ele virou dois.
3. **Leia o texto motivador para achar o recorte**, nunca para copiar frase.
4. **Escreva o nome do agente com precisão.** "O governo" é vago; "o Ministério da Saúde" pontua mais.
$md$, 14, 1),

-- ══════════════════════════════════════════════════════════════
('As 5 Competências',
 'As 5 competências: como o corretor distribui os 1.000 pontos',
 'O que cada competência mede, o que faz cair de 200 para 160, e o checklist de revisão que recupera pontos em 5 minutos.',
 $md$
A redação vale **1.000 pontos**, divididos em **5 competências de 200 pontos cada**. Cada uma é avaliada em faixas de 0, 40, 80, 120, 160 ou 200. Saber o que cada corretor procura é meio caminho.

## Competência 1 — Norma-padrão (200 pts)

**Mede:** domínio da modalidade escrita formal.

O que derruba:
- Erro de **concordância** verbal e nominal
- **Crase** (o campeão de erros)
- **Regência** (assistir *a*, obedecer *a*, visar *a*)
- Pontuação — em especial vírgula separando sujeito de verbo
- Ortografia e acentuação
- **Registro informal**: "a gente", "tipo", "pra", "coisa", "muito ruim"

> **Faixa 200 tolera 1 ou 2 desvios leves.** Você não precisa de perfeição absoluta — precisa de ausência de erro grave e recorrente.

## Competência 2 — Compreender o tema e o tipo textual (200 pts)

**Mede:** se você entendeu o recorte E se escreveu uma dissertação-argumentativa de verdade.

- **Tangenciar** o tema (falar do assunto geral, mas não do recorte) → teto de 80
- **Fugir** do tema → zero na redação inteira
- Repertório **produtivo** (usado no argumento) vale mais que repertório **decorativo** (citado e abandonado)

> **O recorte importa mais que o assunto.** Se o tema é "desafios da valorização do idoso no Brasil", escrever sobre "envelhecimento populacional" em geral é tangenciar.

## Competência 3 — Selecionar e organizar argumentos (200 pts)

**Mede:** o projeto de texto. O corretor pergunta: *dá para ver que isso foi planejado?*

Sinais de projeto de texto:
- A introdução anuncia dois aspectos e os parágrafos seguintes os desenvolvem **na mesma ordem**
- Cada parágrafo tem tópico frasal, argumentação e fecho
- Nenhuma ideia solta aparece do nada

> É aqui que o esqueleto de 4 parágrafos rende mais. Estrutura visível = projeto de texto visível.

## Competência 4 — Coesão (200 pts)

**Mede:** o encadeamento entre e dentro dos parágrafos.

Ferramentas:
- **Conectivos entre parágrafos** — cada um dos parágrafos 2, 3 e 4 deve começar com um
- **Pronomes e sinônimos** para evitar repetir a mesma palavra
- Referência clara: se você escreve "isso", o leitor precisa saber a que se refere

Banco de conectivos por função:

| Função | Opções |
| --- | --- |
| Adição | ademais, outrossim, além disso, somado a isso |
| Oposição | entretanto, contudo, todavia, em contrapartida |
| Causa | visto que, uma vez que, porquanto, dado que |
| Consequência | por conseguinte, logo, dessa forma, assim |
| Conclusão | portanto, destarte, diante do exposto |

> **Não repita o mesmo conectivo.** Três "além disso" na mesma redação derruba a faixa.

## Competência 5 — Proposta de intervenção (200 pts)

**Mede:** solução completa e viável, respeitando os direitos humanos.

Os cinco elementos: **agente, ação, meio, finalidade e detalhamento**. Contagem prática:

| Elementos presentes | Nota |
| --- | --- |
| 5 (com um detalhado) | 200 |
| 4 | 160 |
| 3 | 120 |
| 2 | 80 |
| 1 | 40 |
| Nenhum ou fere direitos humanos | 0 |

> **Nunca proponha** pena de morte, tortura, castração química, extermínio, censura, ou "tirar a criança da família". Zera a competência inteira.

## Checklist de revisão — 5 minutos que valem 80 pontos

Passe os olhos procurando **uma coisa por vez**:

1. **Crase** — toda ocorrência de "à". Antes de verbo e de palavra masculina, corte.
2. **Vírgula entre sujeito e verbo** — releia o começo de cada frase longa.
3. **Repetição** — alguma palavra aparece 3+ vezes? Troque por sinônimo ou pronome.
4. **Conectivo no início dos parágrafos 2, 3 e 4** — está lá?
5. **Os cinco elementos da proposta** — conte no dedo. Um deles está detalhado?
6. **Título** — é opcional no ENEM. Se colocar, não pode ser a única linha diferente.
7. **Marca de identificação** — nome, desenho ou recado ao corretor **anulam** a redação.

## A conta que muda a estratégia

Uma redação bem estruturada com português mediano tira ~760 (160+160+160+160+120).
Uma redação com português impecável mas sem projeto de texto tira ~680.

> **Estrutura rende mais que vocabulário rebuscado.** Priorize o esqueleto e a proposta completa antes de caçar palavra difícil.
$md$, 13, 2)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Redação'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- LITERATURA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Modernismo',
 'Modernismo brasileiro: as três gerações e como reconhecer cada uma',
 'De 1922 a 1945: o que cada fase rompeu, os autores e obras que caem, e as marcas de estilo que identificam a geração num trecho.',
 $md$
Modernismo é o movimento mais cobrado de Literatura no ENEM. E a questão quase sempre dá **um trecho** e pede a geração ou o autor. Então o que importa é reconhecer **marcas de estilo**.

## Semana de Arte Moderna — 1922

Teatro Municipal de São Paulo, 13 a 17 de fevereiro. Contexto: centenário da Independência, São Paulo enriquecida pelo café, vanguardas europeias chegando (Futurismo, Cubismo, Dadaísmo).

**O que o movimento rejeitava:**
- O **Parnasianismo** — a forma perfeita, o soneto, o vocabulário rebuscado
- A cópia do modelo europeu
- O português "de Portugal" na literatura brasileira

**O que propunha:**
- **Verso livre** e sem rima obrigatória
- **Língua brasileira falada** — coloquialismo como matéria literária
- **Liberdade formal** e humor
- Busca de uma identidade nacional

> Na época a Semana foi vaiada. A prova gosta de lembrar que o reconhecimento veio depois.

## Primeira geração (1922–1930): a fase heroica

**Marca de estilo:** irreverência, humor, poema-piada, verso curto, coloquialismo agressivo, paródia.

| Autor | Obras | O que caracteriza |
| --- | --- | --- |
| **Mário de Andrade** | *Paulicéia Desvairada*, ***Macunaíma*** | "Herói sem nenhum caráter"; rapsódia; pesquisa do folclore brasileiro |
| **Oswald de Andrade** | *Manifesto Pau-Brasil*, ***Manifesto Antropófago***, *Memórias Sentimentais de João Miramar* | **Antropofagia**: devorar a cultura estrangeira e devolvê-la brasileira. "Tupi or not tupi, that is the question" |
| **Manuel Bandeira** | *Libertinagem* ("Vou-me embora pra Pasárgada", "Poética") | Transição; lirismo do cotidiano e da doença |

**Os grupos e manifestos:**
- **Pau-Brasil / Antropofagia** (Oswald) — nacionalismo crítico, bem-humorado
- **Verde-Amarelismo / Anta** (Plínio Salgado) — nacionalismo ufanista, deriva para o Integralismo

> **Macunaíma é a obra-síntese:** o herói preguiçoso e contraditório é uma alegoria do próprio Brasil. Se cair Macunaíma, "herói sem nenhum caráter" é quase sempre a chave da resposta.

## Segunda geração (1930–1945): a fase de consolidação

**Marca de estilo:** menos piada, mais densidade. Poesia reflexiva e prosa social.

### Poesia
| Autor | Marca |
| --- | --- |
| **Carlos Drummond de Andrade** | Ironia, "gauchesco" existencial, "No meio do caminho tinha uma pedra"; do individual ao social em *A Rosa do Povo* |
| **Cecília Meireles** | Musicalidade, transitoriedade, herança simbolista; *Romanceiro da Inconfidência* |
| **Vinicius de Moraes** | Do soneto religioso ao lírico-amoroso; depois a Bossa Nova |
| **Murilo Mendes / Jorge de Lima** | Vertente espiritualista |

### Prosa — o Romance de 30 (regionalista/social)
| Autor | Obra | Recorte |
| --- | --- | --- |
| **Graciliano Ramos** | ***Vidas Secas***, *São Bernardo* | Seca, linguagem seca e enxuta, narrador em 3ª pessoa que adere ao personagem |
| **Rachel de Queiroz** | *O Quinze* | Seca de 1915, êxodo |
| **José Lins do Rego** | *Menino de Engenho* | Decadência do engenho de açúcar |
| **Jorge Amado** | *Capitães da Areia* | Bahia, exclusão urbana |
| **Érico Verissimo** | *O Tempo e o Vento* | Rio Grande do Sul, saga histórica |

> ***Vidas Secas* é a obra mais cobrada da geração.** Detalhe técnico que cai: os capítulos são quase **autônomos** (romance desmontável), e a cachorra **Baleia** ganha fluxo de consciência — o animal é humanizado enquanto os humanos são desumanizados pela seca.

## Terceira geração (1945 em diante)

**Marca de estilo:** rigor formal de volta na poesia; experimentação radical na prosa.

| Autor | Marca |
| --- | --- |
| **João Cabral de Melo Neto** | "Poeta engenheiro": construção racional, antilirismo, palavra seca. ***Morte e Vida Severina*** — auto de Natal pernambucano, migração e morte |
| **Clarice Lispector** | Fluxo de consciência, **epifania** (revelação súbita no banal), introspecção. *A Hora da Estrela*, *Laços de Família* |
| **Guimarães Rosa** | Recriação da linguagem: neologismo, sintaxe invertida, sertão como universo metafísico. ***Grande Sertão: Veredas*** |

> **Clarice = epifania. João Cabral = concretude e engenharia. Guimarães Rosa = invenção vocabular.** Essas três palavras identificam o autor num trecho.

## Como reconhecer a geração num trecho

| Se o trecho tem... | É provavelmente... |
| --- | --- |
| Verso curto, piada, "erro" de português proposital | **1ª geração** |
| Reflexão existencial, seca, denúncia social, prosa regional | **2ª geração** |
| Palavra inventada, sertão filosófico | **Guimarães Rosa (3ª)** |
| Personagem comum tendo uma revelação interior súbita | **Clarice (3ª)** |
| Rigor quase matemático, repetição estrutural, Nordeste | **João Cabral (3ª)** |

## Estratégia de prova

1. **Comece pela forma, não pelo conteúdo.** Verso livre e curto com humor já entrega a 1ª geração.
2. **Se o texto é regional e sofrido, é 2ª geração** — provavelmente Graciliano.
3. **Antropofagia não é rejeitar o estrangeiro** — é devorá-lo e transformá-lo. Alternativa que fala em "recusa total do que vem de fora" está errada.
4. **A Semana de 1922 não inaugurou tudo sozinha.** Ela é o marco simbólico; havia produção antes e o próprio movimento mudou muito depois.
$md$, 15, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Literatura'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

SELECT m.nome AS materia, COUNT(*) AS temas_de_teoria
FROM teoria_conteudo t
JOIN materias m ON m.id = t.materia_id
WHERE m.nome IN ('Redação', 'Literatura')
GROUP BY m.nome
ORDER BY m.nome;
