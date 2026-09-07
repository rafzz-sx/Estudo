# Ordem de execução no Supabase — versão 2.5.0

Todos os scripts são **idempotentes**: rodar de novo não duplica nada.
Cole cada arquivo no **SQL Editor** do Supabase e execute na ordem abaixo.

> Se você já rodou a 2.0, **rode tudo de novo assim mesmo**. As questões
> mudaram (a régua de PDF saiu de 3.102 alternativas) e a migration 004
> ganhou colunas novas. O `ON CONFLICT` cuida de não duplicar.

---

## 1. Estrutura (obrigatório)

| Ordem | Arquivo | O que faz |
| --- | --- | --- |
| 1 | `../migrations/000_setup_completo_batcaverna.sql` | Schema base (**só se o banco for novo**) |
| 2 | `../migrations/004_plataforma_completa.sql` | Tudo que a 2.0 acrescentou |
| 3 | `../migrations/005_estudo_inteligente.sql` | Revisão espaçada, caderno de erros e planos de estudo |
| 4 | `../migrations/006_moderacao_contas.sql` | Suspender/desativar conta e promover admin pelo painel |
| 5 | `../migrations/007_editais_e_assuntos.sql` | Link do edital de cada concurso, TAF da EsPCEx e a lista de assuntos cobrados |
| 6 | `../migrations/008_seguranca_rls.sql` | **Fecha o gabarito público.** `questoes` tinha `SELECT USING (true)`: qualquer visitante baixava a resposta das 3.247 questões com a chave anônima |
| 7 | `../migrations/009_simulados_e_gabaritos.sql` | Coluna `tem_comentario`, ano-base de cada concurso e 33 frases motivacionais novas |
| 8 | `../migrations/010_alertas_moderacao.sql` | Gravidade e categoria na mensagem sinalizada, view `moderacao_fila` e o tipo de notificação `moderacao` |
| 9 | `../migrations/011_taxonomia_assuntos.sql` | **Unifica 2.452 assuntos em 515.** Arquivo grande (224 KB) — cole sozinho, leva ~1 min |
| 10 | `../migrations/012_escudo_streak_e_simulados.sql` | Escudo de sequência e histórico de simulados |
| 11 | `../migrations/013_taf_treino.sql` | Diário de treino do TAF |
| 12 | `../migrations/014_teoria_ligada_ao_assunto.sql` | Liga cada texto de teoria ao assunto canônico |
| 13 | `../migrations/015_contatos_publicos.sql` | Tabela do formulário público de contato (que antes descartava a mensagem) |

> **A 011 depende dos seeds de questões.** Se o banco estiver vazio, rode
> primeiro os `.sql` do banco de questões (seção 2) e só então a 011 — ela
> remapeia o que já existe.

> **A 014 depende da 011 e dos seeds de teoria.** Ela casa `teoria_conteudo.tema`
> com `assuntos.nome`; sem os assuntos canônicos, não casa nada.

A migration 004 já traz os patamares de combo, 70 frases motivacionais, 16
insígnias, os metadados dos 9 concursos e as tabelas de TAF preenchidas.
A 009 sobe para 103 frases: `combo_quebrado` tinha só 3, e é justamente
quem errou vindo de 20 acertos seguidos que mais precisa de variedade.

> **Atenção na 004:** ela agora começa apagando os patamares de combo
> antigos (pisos 10/20/30/…) para reinstalar os novos (11/21/31/…). Sem
> isso o aluno veria "INSANO x10" e "INSANO x11" alternando.

---

## 2. Banco de questões (~2 min por arquivo)

São **3.247 questões oficiais** em 12 arquivos, divididos para não estourar
o SQL Editor. Rode na ordem que preferir — cada um é independente.

> 34 questões extraídas ficaram de fora de propósito: 21 sem gabarito, 7
> com todas as alternativas em branco (no PDF original são imagens), 4
> com alternativas duplicadas e 2 cujo texto de apoio se perdeu. Questão
> que o aluno não consegue responder é pior que questão ausente.

```
cn_01.sql      cn_02.sql        (432 questões — Colégio Naval / CPACN)
eear_01.sql                     (382 — EEAR)
efomm_01.sql                    (196 — EFOMM)
enem_01.sql .. enem_05.sql      (1.656 — ENEM 2016 a 2025)
epcar_01.sql   epcar_02.sql     (431 — EPCAR/CPCAR)
esa_01.sql                      (150 — ESA)
```

Cada arquivo cria as matérias e assuntos que faltarem, vincula a matéria ao
concurso (o que alimenta os filtros da tela) e insere as questões com
`ON CONFLICT (hash_conteudo) DO NOTHING`.

---

## 3. Conteúdo didático

| Arquivo | Conteúdo |
| --- | --- |
| `teoria_01_matematica.sql` | 8 temas de Matemática |
| `teoria_02_linguagens.sql` | 3 de Português + 2 de Inglês |
| `teoria_03_natureza.sql` | 2 de Física, 1 de Química, 1 de Biologia |
| `teoria_04_humanas.sql` | 2 de História, 2 de Geografia, 1 de Filosofia, 1 de Sociologia |
| `teoria_05_redacao_literatura.sql` | 2 de Redação + 1 de Literatura |
| `teoria_06_gramatica.sql
teoria_07_sociologia_filosofia.sql
teoria_08_ingles.sql
teoria_09_historia_artes_edfisica.sql` | Crase, concordância e regência |
| `bizus_01.sql` | 31 bizus táticos ancorados nos mesmos temas |
| `videoaulas_01.sql` | 72 vídeo-aulas, todas conferidas no YouTube |
| `musicas_01.sql` | 46 faixas em domínio público para estudar |

> `teoria_05` cria a matéria **Redação** se ela ainda não existir — nenhuma
> prova importada tem questão de múltipla escolha dessa matéria.

**Rode `videoaulas_01.sql` depois dos seeds de teoria.** Os dois casam pelo
campo `tema`; é isso que faz a trilha mostrar o texto e o vídeo do mesmo
assunto lado a lado.

---

## 4. Versão (por último)

```
versao_2_5_0.sql
```

Grava a versão do rodapé com a **hora cheia**, sem minutos.

> As versões anteriores continuam no diretório só como histórico. Rodar mais
> de uma não quebra nada (cada uma apaga o registro anterior antes de
> inserir), mas só a 2.3.0 precisa ser executada.

---

## Como adicionar provas novas — pelo painel (recomendado)

A partir da 2.1.0 dá para importar uma prova inteira **sem sair da
plataforma** e sem rodar nada no terminal:

1. Entre como admin em **/admin → 📥 Importar Questões**
2. Escolha o concurso e carregue o `.txt` da prova
3. Clique em **Conferir antes de importar** — a tela mostra quantas
   questões entram, quantas já estão no banco, quais são recusadas (com o
   motivo de cada uma) e renderiza três de amostra do jeito que o aluno vai
   ver. **Nada é gravado nesse passo.**
4. Se a amostra estiver boa, clique em **Importar**

O importador usa o mesmo SHA-256 do pipeline Python, então reimportar uma
prova que já entrou pelo terminal não duplica nada. A paridade dos dois é
conferida por `python scripts/checar_paridade_hash.py`.

Questão que chega sem gabarito comentado entra como `pendente` e aparece em
**/admin → ✍️ Fila de Resolução**, ordenada pelas que mais derrubam aluno,
para alguém escrever a explicação e os passos direto na tela.

---

## Como adicionar provas novas — pelo terminal

1. Coloque o `.txt` da prova em `C:\Users\SARA\documents\BANCO DE QUESTOES`.
2. Gere o JSON e os novos SQL:

```bash
python scripts/parse_questoes.py            # lê os .txt -> scripts/out/questoes.json
python scripts/auditar_gabaritos.py         # aponta o que cheira a erro de extração
python scripts/gerar_seed_sql.py            # gera supabase/seeds/*.sql
python scripts/checar_seeds.py              # confere os .sql antes de colar
```

3. Rode no Supabase apenas os arquivos que mudaram.

O parser aceita os seis formatos de prova já presentes na pasta. Se você
trouxer um layout novo, ele avisa no relatório (`variante=nenhum`) em vez de
importar errado. O SHA-256 do enunciado garante que rodar de novo não
duplica questão já cadastrada.

## Como revalidar as vídeo-aulas

Vídeo do YouTube sai do ar. Para conferir todos e regerar o seed só com os
que continuam no ar:

```bash
python scripts/gerar_videoaulas.py
```

Ele consulta o oEmbed do YouTube um por um e descarta o que não responder.

---

## Conferindo o que entrou

```sql
-- Questões por concurso e ano
SELECT c.sigla, q.ano, COUNT(*) AS questoes
FROM questoes q
JOIN concursos c ON c.id = q.concurso_id
GROUP BY c.sigla, q.ano
ORDER BY c.sigla, q.ano DESC;

-- Saúde do gabarito comentado
SELECT resolucao_status, COUNT(*)
FROM questoes GROUP BY resolucao_status;

-- Teoria e vídeo por matéria
SELECT m.nome,
       COUNT(DISTINCT t.id) AS temas_teoria,
       COUNT(DISTINCT v.id) AS videoaulas
FROM materias m
LEFT JOIN teoria_conteudo t ON t.materia_id = m.id
LEFT JOIN videoaulas      v ON v.materia_id = m.id
GROUP BY m.nome
HAVING COUNT(DISTINCT t.id) + COUNT(DISTINCT v.id) > 0
ORDER BY m.nome;

-- Nenhuma alternativa deve voltar aqui: é a checagem da régua de PDF
SELECT COUNT(*) AS alternativas_sujas
FROM questoes
WHERE alternativas::text ~ '-{6,}';
```
