-- ============================================================================
-- BatCaverna — Conteúdo teórico: GRAMÁTICA (Português)
-- ============================================================================
-- Português é a 2ª matéria com mais questão no banco (682) e a única que cai
-- em TODOS os nove concursos. Crase, concordância e regência sozinhas
-- respondem pela maior parte dos erros de quem já sabe interpretar texto.
--
-- O tema 'Gramática' casa com as vídeo-aulas de crase do seed
-- videoaulas_01.sql.
--
-- Idempotente: a UNIQUE (materia_id, tema, nivel) impede duplicata.
-- ============================================================================

BEGIN;

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Gramática',
 'Crase, concordância e regência: os três que mais derrubam',
 'A regra da crase que funciona sempre, os casos de concordância que a banca repete e a lista de regências que você precisa saber de cor.',
 $md$
Se você já interpreta texto bem e ainda erra Português, o problema está quase sempre em um destes três. Eles são regra, não interpretação — dá para zerar o erro.

## CRASE

### O que é
Crase é a **fusão de duas vogais idênticas**: a preposição **a** + o artigo **a(s)**, ou a + o pronome demonstrativo **aquele/aquela/aquilo**.

> Sem os dois, não existe crase. Toda a regra sai daí.

### O teste que resolve 90% dos casos

**Troque a palavra feminina por uma masculina equivalente.**

- Se virar **"ao"** → tem crase
- Se virar **"o"** → não tem

| Frase | Troca | Resultado |
| --- | --- | --- |
| Vou **à** feira | Vou **ao** mercado | tem crase |
| Vou **a** pé | Vou **a** pé (masc. "a pé") | sem crase |
| Refiro-me **à** aluna | Refiro-me **ao** aluno | tem crase |
| Comprei **a** casa | Comprei **o** carro | sem crase |

### As proibições — nunca há crase antes de:

1. **Verbo** — "Começou *a* estudar", "Passou *a* correr"
2. **Palavra masculina** — "Andar *a* cavalo", "Escrever *a* lápis"
   - **Exceção:** quando há "à moda de" subentendido → "Bife *à* milanesa", "Gol *à* Pelé"
3. **Pronome pessoal** — "Entreguei *a* ela"
4. **A maioria dos pronomes de tratamento** — "Escrevi *a* Vossa Senhoria"
   - **Exceções que aceitam:** senhora, senhorita, dona, madame
5. **Palavra no plural precedida de "a" singular** — "Não vou *a* festas"
6. **Palavras repetidas** — "cara *a* cara", "gota *a* gota", "frente *a* frente"
7. **Pronomes indefinidos e demonstrativos** — "Refiro-me *a* alguém", "*a* esta hora"
   - Mas **aquele/aquela/aquilo aceitam**: "Refiro-me **àquele** aluno"

### As obrigações — sempre há crase:

1. **Horas determinadas** — "Chegou **às** 8h" (teste: "chegou **ao** meio-dia")
2. **Locuções adverbiais femininas** — **à** noite, **à** tarde, **às** vezes, **às** pressas, **à** vontade, **à** direita
3. **Locuções prepositivas femininas** — **à** procura de, **à** espera de, **à** custa de
4. **Locuções conjuntivas femininas** — **à** medida que, **à** proporção que

> **Cuidado com o par:** "à medida que" (proporção) ≠ "na medida em que" (causa). E "**a** partir de" **nunca** tem crase — "partir" é verbo.

### Casos facultativos (a banca adora)

Nestes três, com ou sem crase está certo:
- Antes de **nome próprio feminino**: "Referi-me a Maria" / "à Maria"
- Antes de **pronome possessivo feminino**: "Entreguei a minha mãe" / "à minha mãe"
- Depois de **até**: "Fui até a porta" / "até à porta"

### Nomes de lugar — o truque do "vim"

Use o par **ir/vir**:
- Se você diz "**Vim da** Bahia" → "**Vou à** Bahia" (tem crase)
- Se você diz "**Vim de** Brasília" → "**Vou a** Brasília" (sem crase)

> Se o lugar admite artigo, admite crase. "Bahia" admite ("a Bahia"), "Brasília" não.

## CONCORDÂNCIA VERBAL

### Os casos que a banca repete

| Situação | Regra | Exemplo |
| --- | --- | --- |
| **Haver** = existir | **Impessoal**, sempre 3ª pessoa do singular | "**Havia** dez alunos" (nunca "haviam") |
| **Fazer** = tempo decorrido | Impessoal | "**Faz** cinco anos" |
| **Verbo + se** (partícula apassivadora) | Concorda com o sujeito | "**Vendem-se** casas" |
| **Verbo + se** (índice de indeterminação, com VTI) | Fica no singular | "**Precisa-se** de pedreiros" |
| Sujeito composto **antes** do verbo | Plural | "João e Maria **chegaram**" |
| Sujeito composto **depois** do verbo | Plural **ou** concorda com o mais próximo | "**Chegou/Chegaram** João e Maria" |
| **Um dos que** | Preferencialmente plural | "Foi um dos que **chegaram**" |
| Expressão partitiva ("a maioria de", "grande parte de") | Singular ou plural | "A maioria dos alunos **saiu/saíram**" |
| **Mais de um** | Singular | "Mais de um candidato **faltou**" |
| Porcentagem | Concorda com o número **ou** com o especificador | "20% dos alunos **faltaram**" |

> **"Haviam muitas pessoas" é o erro mais cobrado do Brasil.** Haver no sentido de existir não tem sujeito, então não tem com quem concordar. Já **existir** tem: "Existiam muitas pessoas" está certo.

### O truque do "existir"
Na dúvida com *haver*, troque por *existir*:
- "Havia problemas" → "Existiam problemas" ✔ (o correto com haver é singular)
- Se o "existir" fica plural, o "haver" fica **singular** mesmo assim.

## CONCORDÂNCIA NOMINAL

| Expressão | Regra |
| --- | --- |
| **anexo, incluso, obrigado, mesmo, próprio** | Adjetivos: **concordam** — "Seguem **anexas** as fotos", "**Obrigada**", disse ela |
| **em anexo** | Locução: **invariável** |
| **é proibido / é necessário / é bom** | Invariável **sem** artigo; concorda **com** artigo — "É proibid**o** entrada" / "É proibid**a** **a** entrada" |
| **meio** | "meio" = um pouco → **advérbio, invariável**: "Ela está **meio** cansada" (nunca "meia cansada") |
| **bastante** | Adjetivo (= muitos) varia: "bastant**es** motivos". Advérbio (= muito) não: "Estudou **bastante**" |
| **menos** | **Sempre invariável**. "**Menos** pessoas" — "menas" não existe |
| **alerta** | Advérbio, invariável: "Os soldados estão **alerta**" |

## REGÊNCIA VERBAL — a lista de cor

Os verbos que caem, com a preposição certa:

| Verbo | Regência | Exemplo |
| --- | --- | --- |
| **Assistir** (= ver) | **a** | "Assisti **ao** filme" |
| **Assistir** (= ajudar) | direto | "O médico assistiu **o** paciente" |
| **Visar** (= almejar) | **a** | "Visa **ao** cargo" |
| **Visar** (= mirar / dar visto) | direto | "Visou **o** alvo" |
| **Obedecer / desobedecer** | **a** | "Obedeça **às** regras" |
| **Aspirar** (= desejar) | **a** | "Aspira **ao** posto" |
| **Aspirar** (= inalar) | direto | "Aspirou **o** ar" |
| **Preferir** | **a** (nunca "do que") | "Prefiro estudar **a** dormir" |
| **Implicar** (= acarretar) | direto | "Implica **mudanças**" |
| **Namorar** | direto | "Namora **a** vizinha" (não "com a") |
| **Chegar / ir** | **a** (não "em") | "Cheguei **a** casa" |
| **Esquecer / lembrar** | direto sem pronome; **de** com pronome | "Esqueci o nome" / "Esqueci-me **do** nome" |

> **Preferir não aceita reforço.** "Prefiro muito mais X do que Y" tem três erros de uma vez.

## Estratégia de prova

1. **Crase: faça a troca pelo masculino.** É mais rápido e mais seguro que lembrar da lista.
2. **Viu "haviam" com sentido de existir? Está errado.** Ponto.
3. **"Menas" e "meia cansada" não existem.** São descartes automáticos.
4. **Regência muda com o sentido.** Assistir, visar e aspirar sempre aparecem no sentido menos óbvio.
$md$, 16, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Português'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

SELECT 'Teoria de Gramática' AS seed, COUNT(*) AS total
FROM teoria_conteudo t
JOIN materias m ON m.id = t.materia_id
WHERE m.nome = 'Português';
