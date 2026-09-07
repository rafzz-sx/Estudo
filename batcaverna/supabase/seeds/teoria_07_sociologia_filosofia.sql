-- ============================================================================
-- BatCaverna — Conteúdo teórico: SOCIOLOGIA e FILOSOFIA
-- ============================================================================
-- Sociologia tinha 64 questões no banco e ZERO texto de teoria. Filosofia,
-- 46 questões e 2% de cobertura. Eram as duas piores da plataforma.
--
-- Os temas abaixo saem da frequência real depois da unificação da taxonomia
-- (migration 011) — não de um sumário de livro. "Trabalho e Sociedade" vem
-- primeiro porque é o que mais cai, não porque é o capítulo 1.
--
-- Idempotente: a UNIQUE (materia_id, tema, nivel) impede duplicata.
-- ============================================================================

BEGIN;

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Trabalho e Sociedade',
 'Trabalho e Sociedade: de Taylor ao aplicativo',
 'Os modelos de organização do trabalho que o ENEM cobra todo ano, e a chave para não confundir taylorismo com fordismo.',
 $md$
Trabalho é o assunto mais cobrado de Sociologia — 12 questões só neste banco. E quase sempre pela mesma porta: um texto sobre um modelo produtivo e a pergunta "qual é o modelo?".

## Os três modelos clássicos

| Modelo | Ideia central | Marca registrada |
| --- | --- | --- |
| **Taylorismo** | Separar quem PENSA de quem EXECUTA | Cronômetro. Tempos e movimentos. O operário não decide nada |
| **Fordismo** | Linha de montagem + produção em massa | Esteira. Produto padronizado. Estoque grande |
| **Toyotismo** | Produzir sob demanda, sem estoque | *Just in time*. Trabalhador multifuncional. Qualidade total |

> **O erro clássico:** achar que taylorismo e fordismo são a mesma coisa. Taylorismo é um **método de gestão** (como organizar o trabalho); fordismo é um **sistema de produção** (linha de montagem + consumo de massa + salário que permite comprar o que se produz). Ford aplicou Taylor, mas foi além dele.

## O que a banca cobra hoje: precarização e uberização

O recorte contemporâneo aparece mais que os três modelos clássicos:

- **Trabalho informal** — sem carteira, sem direitos, sem previdência
- **Terceirização** — a empresa contrata outra empresa em vez de contratar a pessoa
- **Uberização** — a plataforma diz que é intermediária, não empregadora. O trabalhador é "parceiro", assume os custos (carro, combustível, manutenção) e não tem férias, 13º nem FGTS
- **Empreendedorismo de si** — o discurso de que cada um é "dono do próprio negócio" transfere ao trabalhador o risco que era da empresa

A pegadinha frequente: o texto elogia a "autonomia" e a "flexibilidade" do trabalhador de aplicativo, e a alternativa correta é a que identifica **perda de direitos disfarçada de liberdade**.

## Divisão do trabalho: Durkheim

- **Solidariedade mecânica** — sociedades simples, pessoas fazem tarefas parecidas, coesão vem da semelhança
- **Solidariedade orgânica** — sociedades complexas, cada um faz uma coisa, coesão vem da **interdependência**

> Mnemônico: **mecânica = iguais**, **orgânica = diferentes que precisam uns dos outros** (como os órgãos de um corpo).

Quando a divisão do trabalho quebra sem que novas regras a substituam, Durkheim chama de **anomia**: ausência de normas. É a palavra que mais aparece em questão sobre ele.
$md$, 9, 1),

-- ══════════════════════════════════════════════════════════════
('Teóricos Clássicos',
 'Marx, Durkheim e Weber: o que cada um enxerga',
 'Os três fundadores da Sociologia em uma tabela, com o conceito-chave de cada um e a frase que denuncia o autor na questão.',
 $md$
A banca raramente pergunta "quem disse isso?". Ela dá um texto e pergunta **qual perspectiva teórica ele expressa**. Reconhecer o autor pela lente é o que resolve.

## A tabela que resolve a maioria

| | **Marx** | **Durkheim** | **Weber** |
| --- | --- | --- | --- |
| O que move a sociedade | Conflito entre classes | Coesão e normas coletivas | Ação individual dotada de sentido |
| Conceito-chave | Mais-valia, luta de classes, alienação | Fato social, anomia, solidariedade | Ação social, tipo ideal, burocracia |
| O indivíduo | Determinado pela posição na produção | Coagido pelo fato social | Ponto de partida da análise |
| Palavra que denuncia | *exploração, burguesia, proletariado* | *coerção, exterior ao indivíduo, coletivo* | *sentido, racionalidade, legitimidade* |

## Os detalhes que a banca cobra

**Marx — mais-valia.** O trabalhador produz mais valor do que recebe em salário. A diferença é apropriada pelo dono dos meios de produção. **Alienação** é o trabalhador não se reconhecer no que produz.

**Durkheim — fato social.** Tem três características, e a questão sempre pede as três:
1. **Exterioridade** — existe antes de você nascer
2. **Coercitividade** — se você desobedece, sofre sanção
3. **Generalidade** — vale para todos do grupo

**Weber — os três tipos de dominação legítima:**

| Tipo | Fonte da obediência | Exemplo |
| --- | --- | --- |
| **Tradicional** | O costume, "sempre foi assim" | Monarquia, patriarcado |
| **Carismática** | Qualidades excepcionais do líder | Líder religioso, revolucionário |
| **Racional-legal** | A regra escrita, o cargo | Estado moderno, burocracia |

> Weber é o autor da **burocracia** como tipo ideal — e "tipo ideal" não significa "ideal" no sentido de bom. É um modelo construído para comparar com a realidade, não um elogio.
$md$, 8, 2),

-- ══════════════════════════════════════════════════════════════
('Cidadania e Direitos',
 'Cidadania: as três gerações de direitos',
 'A classificação que aparece em quase toda questão de cidadania, e o que a Constituição de 1988 mudou.',
 $md$
## As três gerações (ou dimensões)

| Geração | O que garante | Palavra-chave | Exemplos |
| --- | --- | --- | --- |
| **1ª — Civis e políticos** | Liberdade **contra** o Estado | Liberdade | Ir e vir, expressão, voto, propriedade |
| **2ª — Sociais, econômicos e culturais** | Prestação **pelo** Estado | Igualdade | Saúde, educação, trabalho, previdência |
| **3ª — Difusos e coletivos** | Direitos de toda a humanidade | Fraternidade | Meio ambiente, paz, patrimônio, consumidor |

> A tríade **liberdade – igualdade – fraternidade** é a chave mnemônica: é a ordem da Revolução Francesa e a ordem das gerações.

## O caso brasileiro tem uma inversão

No modelo clássico (T. H. Marshall, estudando a Inglaterra), a ordem foi: civis → políticos → sociais.

**No Brasil a ordem se inverteu.** Os direitos sociais vieram primeiro — trabalhistas, na Era Vargas, num período **sem** direitos políticos plenos. Isso deu origem ao conceito de **cidadania regulada**: o cidadão era quem tinha carteira de trabalho assinada numa profissão reconhecida. Quem estava fora do mercado formal ficava fora da cidadania.

Esse é o ponto que a banca mais explora em questão sobre cidadania no Brasil.

## A Constituição de 1988

Chamada de **Constituição Cidadã** porque:

- ampliou os direitos sociais como direitos de **todos**, não de quem tem carteira
- criou instrumentos de participação: plebiscito, referendo, iniciativa popular
- tornou o racismo crime inafiançável e imprescritível
- reconheceu direitos de indígenas e quilombolas

## Direitos humanos: o argumento que cai

Questão sobre direitos humanos costuma trazer o senso comum "direitos humanos defendem bandido" e pedir a alternativa que o refuta. O argumento correto: direitos humanos são **universais e indivisíveis** — valem para todos justamente porque, se dependessem de mérito, deixariam de ser direitos e virariam prêmio.
$md$, 8, 3),

-- ══════════════════════════════════════════════════════════════
('Ética e Moral',
 'Ética e Moral: o assunto nº 1 de Filosofia',
 'A diferença entre ética e moral, e as três grandes correntes que a banca compara — com a pergunta que identifica cada uma.',
 $md$
Ética é o assunto mais cobrado de Filosofia: 13 questões neste banco, quase o triplo do segundo colocado.

## Ética ≠ Moral

- **Moral** é o conjunto de regras de conduta de um grupo, num tempo e lugar. É plural: existe a moral de cada sociedade.
- **Ética** é a **reflexão filosófica sobre** essas regras. Pergunta por que a regra vale, e se deveria valer.

> Moral responde "o que se deve fazer aqui". Ética pergunta "por que se deve".

## As três correntes que caem

| Corrente | Pergunta central | Autor | Critério do certo |
| --- | --- | --- | --- |
| **Ética das virtudes** | Que tipo de pessoa devo ser? | Aristóteles | O **hábito** virtuoso, o meio-termo |
| **Deontologia** | Qual é o meu dever? | Kant | A **intenção** e a regra universalizável |
| **Utilitarismo** | Qual é o resultado? | Bentham, Stuart Mill | A **consequência**: maior bem-estar do maior número |

### Aristóteles — o meio-termo
A virtude está entre dois vícios: a coragem fica entre a covardia e a temeridade; a generosidade, entre a avareza e o esbanjamento. Virtude se adquire por **hábito** (*ethos*), não por teoria. **Eudaimonia** — a felicidade como realização plena — é o fim.

### Kant — o imperativo categórico
"Age apenas segundo a máxima pela qual possas ao mesmo tempo querer que ela se torne lei universal."

Duas coisas que a banca cobra:
- a ação moral vale pela **intenção**, não pelo resultado. Ajudar por interesse não é ato moral, mesmo dando certo
- **autonomia** é dar a si mesmo a lei pela razão; **heteronomia** é obedecer a uma lei vinda de fora (medo, costume, religião)

### Utilitarismo — o cálculo
Certo é o que produz mais felicidade para o maior número. O problema clássico que a questão explora: o utilitarismo pode justificar sacrificar uma minoria pelo bem da maioria — e é aí que ele colide com Kant, para quem a pessoa é **fim em si mesma**, nunca meio.

> **A questão típica:** um dilema (o bonde desgovernado, a mentira que salva alguém) e as alternativas descrevem as três posições. Identifique pela pergunta que cada uma faz: *que pessoa serei?* (Aristóteles), *qual é a regra?* (Kant), *qual o saldo?* (utilitarismo).
$md$, 10, 1),

-- ══════════════════════════════════════════════════════════════
('Teoria do Conhecimento',
 'Teoria do Conhecimento: como sabemos o que sabemos',
 'Racionalismo, empirismo e a síntese de Kant, mais o problema do ceticismo — a segunda maior incidência de Filosofia.',
 $md$
## A pergunta que organiza tudo

De onde vem o conhecimento verdadeiro: da **razão** ou da **experiência**?

| Corrente | Origem do conhecimento | Autores | Imagem-chave |
| --- | --- | --- | --- |
| **Racionalismo** | A razão. Há ideias inatas | Descartes, Espinosa, Leibniz | A mente já traz a estrutura |
| **Empirismo** | Os sentidos. A mente nasce vazia | Locke, Hume, Bacon | *Tabula rasa* — folha em branco |
| **Criticismo** | Os dois, articulados | Kant | Os óculos que você não pode tirar |

### Descartes — a dúvida metódica
Duvidar de tudo até achar algo indubitável. O que resiste: **penso, logo existo**. Duvidar já é pensar; pensar exige existir. É o ponto de partida, não a conclusão.

### Hume — o problema da causalidade
Nunca observamos "causa". Observamos que B sempre veio depois de A e criamos o **hábito** de esperar B. A necessidade causal é psicológica, não lógica. É a crítica que, segundo o próprio Kant, o "despertou do sono dogmático".

### Kant — a síntese
Conhecemos o **fenômeno** (a coisa como aparece a nós), nunca o **númeno** (a coisa em si). Espaço, tempo e causalidade não estão no mundo: são as formas com que o nosso entendimento organiza a experiência.

> A metáfora que funciona: são óculos que não dá para tirar. Tudo que você vê passa por eles — e por isso você nunca vê o mundo "sem óculos".

## Ceticismo

Não é "não acreditar em nada". É **suspender o juízo** (*epoché*) diante de argumentos igualmente fortes dos dois lados. O cético pirrônico busca a *ataraxia*: a tranquilidade de quem parou de disputar o que não se pode decidir.

> **Cuidado com o senso comum na questão:** "cético" no dia a dia virou sinônimo de negacionista. Em Filosofia, é quem exige critério antes de afirmar — o oposto de quem afirma sem critério.
$md$, 9, 2),

-- ══════════════════════════════════════════════════════════════
('Filosofia Política',
 'Filosofia Política: contratualistas e o poder',
 'Hobbes, Locke e Rousseau lado a lado, mais Maquiavel e o conceito moderno de Estado.',
 $md$
## Os contratualistas

Todos partem da mesma ficção — um **estado de natureza** anterior à sociedade — e chegam a Estados diferentes.

| | **Hobbes** | **Locke** | **Rousseau** |
| --- | --- | --- | --- |
| Estado de natureza | Guerra de todos contra todos | Relativamente pacífico, mas inseguro | Bom, livre e feliz |
| O que o homem é | "O homem é o lobo do homem" | Racional, com direitos naturais | Bom por natureza; a sociedade corrompe |
| Por que sair dele | Medo da morte violenta | Falta um juiz imparcial | Já saiu — e mal |
| Poder resultante | **Absoluto**, irrevogável | **Limitado**, com direito de resistência | **Vontade geral** do povo |
| Obra | *Leviatã* | *Segundo Tratado* | *Do Contrato Social* |

> **Vontade geral ≠ vontade da maioria.** Em Rousseau, é o que visa ao bem comum — e a soma dos interesses particulares pode contrariá-la. É o ponto que mais derruba candidato.

## Maquiavel

Não é contratualista e não é o vilão da caricatura. O que ele faz em *O Príncipe* é **separar a política da moral religiosa**: descrever como o poder funciona de fato, não como deveria ser.

- **Virtù** — a capacidade e a astúcia do governante
- **Fortuna** — o acaso, as circunstâncias que ele não controla
- A frase "os fins justificam os meios" **não está** no livro; é uma síntese posterior

## Conceitos modernos que caem

- **Estado laico** — não adota religião oficial; não significa Estado ateu
- **Tripartição dos poderes** (Montesquieu) — Executivo, Legislativo e Judiciário se limitam mutuamente
- **Democracia direta × representativa × participativa** — a brasileira é representativa com instrumentos de participação (plebiscito, referendo, iniciativa popular)
- **Totalitarismo** (Hannah Arendt) — não é só ditadura: é o regime que busca controlar até a esfera privada e a própria capacidade de pensar
$md$, 9, 3)

) AS v(tema, titulo, resumo, corpo, minutos, ordem)
  ON m.nome = CASE
    WHEN v.tema IN ('Trabalho e Sociedade', 'Teóricos Clássicos', 'Cidadania e Direitos')
      THEN 'Sociologia'
    ELSE 'Filosofia'
  END
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

-- Conferência: 3 temas de Sociologia e 3 de Filosofia.
SELECT m.nome AS materia, COUNT(*) AS temas
FROM teoria_conteudo t JOIN materias m ON m.id = t.materia_id
WHERE m.nome IN ('Sociologia', 'Filosofia')
GROUP BY m.nome;
