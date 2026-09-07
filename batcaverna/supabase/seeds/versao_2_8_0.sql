-- ============================================================================
-- BatCaverna — Registro da versão 2.8.0
-- ============================================================================
-- Rode POR ÚLTIMO, depois de todas as migrations e seeds.
--
-- >> ESTA VERSÃO TRAZ UMA MIGRATION NOVA: 017_contestar_gabarito.sql
--    Rode-a ANTES deste arquivo. É aditiva e não destrutiva: só cria a
--    tabela `questao_contestacoes`.
--
-- >> OS SEEDS DE QUESTÕES MUDARAM. Se você já rodou os seeds e a 011, rode
--    a 011 NOVA: 39 questões estavam no assunto errado (veja abaixo) e é
--    ela que remapeia o que já está no banco. `ON CONFLICT` cuida do resto.
--
-- ─── Assunto errado em 39 questões ─────────────────────────────────────────
--   • o casamento de termos da taxonomia era substring crua, e substring
--     crua casa no MEIO da palavra: "organica" dentro de "inorganica",
--     "etica" dentro de "estetica" e de "dialetica", "sintaxe" dentro de
--     "morfossintaxe", "grafia" dentro de "-grafia", "danca" dentro de
--     "mudanca"
--   • 14 questões de química inorgânica estavam arquivadas como "Química
--     Orgânica", e o assunto "Funções Inorgânicas" tinha ZERO questões —
--     inalcançável, porque todo termo dele contém "organica". Quem filtrava
--     Orgânica recebia neutralização ácido-base e íons bário
--   • os absurdos: "Escola Nova" e "Perfil Carcerário" caíam em Hidrografia,
--     "Mudança Lexical" em Teatro e Dança, "Pré-Socráticos e a Dialética" em
--     Ética e Moral
--   • o pior não era errar, era errar devolvendo "casou no dicionário =
--     verdadeiro". O erro entrava na métrica de cobertura como acerto
--
-- ─── Importar pelo painel refragmentava a taxonomia ────────────────────────
--   • o importador canonizava matéria e dificuldade e gravava o ASSUNTO como
--     a banca escreveu. Como ele cria em `assuntos` o que não existe, cada
--     prova trazida pela tela abria rótulos novos, desfazendo a unificação
--     de 2.452 rótulos em 529 que a migration 011 faz
--   • e esse era o caminho "recomendado" nas instruções: o jeito indicado de
--     crescer o banco era o que o desmontava, sem erro nenhum na tela
--   • a taxonomia agora existe dos dois lados, mas GERADA de uma fonte só
--
-- ─── Fila de Figura (admin) ────────────────────────────────────────────────
--   • 347 questões (10%) dependem de um desenho e só têm a descrição dele em
--     texto: 107 de Matemática, 85 de Física
--   • o caminho de exibição já existia inteiro — coluna, componente, cinco
--     telas, editor e sanitização. Faltava a fila: a de resolução filtra por
--     explicação ausente, e TODAS as 347 têm explicação, então nenhuma
--     aparecia. O editor era inalcançável para quem precisava dele
--
-- ─── Contestar gabarito ────────────────────────────────────────────────────
--   • o aluno não tinha como avisar que uma questão está errada
--   • as questões vieram de extração de PDF, e extração de PDF erra.
--     Gabarito errado é o pior defeito possível: questão ausente o aluno não
--     estuda, gabarito errado ele ESTUDA, e aprende errado
--   • só contesta quem respondeu, uma vez por questão. Contestar NÃO muda o
--     gabarito: abre um caso. A fila ordena por CONSENSO — várias pessoas
--     apontando a mesma letra é a assinatura de um erro real; uma sozinha
--     costuma ser quem errou
--
-- ─── Recuperação de senha ──────────────────────────────────────────────────
--   • em produção sem provedor de e-mail, a tela avançava para o passo do
--     código assim mesmo. A mensagem "recuperação por e-mail não está ativa"
--     aparecia com ✓ VERDE de sucesso, acima de um formulário pedindo "o
--     código enviado para seu e-mail". Ninguém saía dali
--   • o código de redefinição valia 24 h, herdadas da verificação de e-mail.
--     Confirmar endereço é conveniência; redefinir senha é tomada de conta.
--     Agora são 30 minutos
--   • pedir um código novo agora INVALIDA os anteriores. Antes cada pedido
--     só inseria, e uma conta acumulava vários códigos válidos ao mesmo tempo
-- ============================================================================

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.8.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;


-- ════════════════════════════════════════════════════════════════════
-- Conferência do que esta versão corrigiu
-- ════════════════════════════════════════════════════════════════════

-- Química: "Funções Inorgânicas" e "Ácidos, Bases e pH" têm que ter
-- questões. Antes da 011 nova, os dois vinham com 0.
SELECT a.nome AS assunto, COUNT(*) AS questoes
FROM questoes q
JOIN assuntos a ON a.id = q.assunto_id
JOIN materias m ON m.id = q.materia_id
WHERE m.nome = 'Química'
GROUP BY a.nome
ORDER BY 2 DESC;

-- Filosofia: "Estética" tem que aparecer com 1.
SELECT a.nome AS assunto, COUNT(*) AS questoes
FROM questoes q
JOIN assuntos a ON a.id = q.assunto_id
JOIN materias m ON m.id = q.materia_id
WHERE m.nome = 'Filosofia'
GROUP BY a.nome
ORDER BY 2 DESC;

-- Quantas questões esperam desenho. São 347 num banco recém-semeado, e o
-- número cai conforme a Fila de Figura é trabalhada.
SELECT COUNT(*) AS esperando_figura
FROM questoes
WHERE ativa
  AND figura_descricao IS NOT NULL
  AND figura_descricao <> ''
  AND figura_svg IS NULL;

-- Resíduo de importação pelo painel ANTES desta versão: rótulo comprido,
-- com parêntese, aparecendo uma ou duas vezes. Se listar algo, rode a 011.
SELECT a.nome, COUNT(q.id) AS questoes
FROM assuntos a
LEFT JOIN questoes q ON q.assunto_id = a.id
WHERE a.nome LIKE '%(%'
GROUP BY a.nome
ORDER BY 2, 1;
