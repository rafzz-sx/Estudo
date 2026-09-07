-- ============================================================================
-- BatCaverna — Teoria ligada ao assunto canônico (versão 2.4.0)
-- ============================================================================
-- Depois da migration 011, os assuntos das questões têm nome canônico. Os
-- TEMAS dos textos de teoria, não: foram escritos antes e usam nomes livres.
--
-- Isso deixava a plataforma com o conteúdo certo e nenhuma ligação:
--
--   assunto da questão   "Brasil República"     (33 questões)
--   tema do texto        "República Velha"      (o texto existe!)
--   → o radar de fraqueza não conseguia mandar o aluno para a teoria
--
-- Medido: História tinha 151 questões e DOIS textos cujos nomes não batiam
-- com assunto nenhum. Na prática, cobertura zero — com o conteúdo escrito.
--
-- Esta migration renomeia os temas para o nome canônico e, mais importante,
-- PREENCHE `teoria_conteudo.assunto_id`, que existia desde a 004 e estava
-- nulo em tudo. É esse campo que liga "você erra Geometria Plana" a "leia
-- este texto".
--
-- Idempotente.
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. Renomear os temas que ficaram fora do padrão
-- ════════════════════════════════════════════════════════════════════
-- Só os que divergem. Os demais (Geometria Plana, Estatística, Cinemática,
-- Ecologia, Interpretação de Texto, Sintaxe, Figuras de Linguagem,
-- Climatologia, Geopolítica, Modernismo...) já nasceram com o nome certo.

-- "República Velha" e "Era Vargas" são períodos DENTRO de Brasil República,
-- que é o assunto canônico. Os dois textos passam a viver sob ele: o
-- primeiro vira o texto principal, o segundo continua acessível pela trilha.
UPDATE teoria_conteudo t SET tema = 'Brasil República'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'História'
  AND t.tema IN ('República Velha', 'Era Vargas')
  -- Não colide com o texto novo do seed 09, que já usa este nome.
  AND NOT EXISTS (
    SELECT 1 FROM teoria_conteudo o
    WHERE o.materia_id = t.materia_id
      AND o.tema = 'Brasil República'
      AND o.nivel = t.nivel
  );

UPDATE teoria_conteudo t SET tema = 'Razão, Proporção e Regra de Três'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'Matemática'
  AND t.tema = 'Razão e Proporção';

-- Dois textos de Português com o mesmo assunto e nomes diferentes.
UPDATE teoria_conteudo t SET tema = 'Interpretação de Texto'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'Português'
  AND t.tema = 'Compreensão e Interpretação de Texto'
  AND NOT EXISTS (
    SELECT 1 FROM teoria_conteudo o
    WHERE o.materia_id = t.materia_id
      AND o.tema = 'Interpretação de Texto'
      AND o.nivel = t.nivel
  );

-- "Panorama para a prova" era o nome genérico dos textos de Filosofia e
-- Sociologia escritos antes de haver taxonomia. Ganham o assunto que mais
-- cai em cada uma.
UPDATE teoria_conteudo t SET tema = 'Ética e Moral'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'Filosofia'
  AND t.tema = 'Panorama para a prova'
  AND NOT EXISTS (
    SELECT 1 FROM teoria_conteudo o
    WHERE o.materia_id = t.materia_id AND o.tema = 'Ética e Moral' AND o.nivel = t.nivel
  );

UPDATE teoria_conteudo t SET tema = 'Trabalho e Sociedade'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'Sociologia'
  AND t.tema = 'Panorama para a prova'
  AND NOT EXISTS (
    SELECT 1 FROM teoria_conteudo o
    WHERE o.materia_id = t.materia_id AND o.tema = 'Trabalho e Sociedade' AND o.nivel = t.nivel
  );

-- O texto de gramática de Português cobre crase, concordância e regência.
-- "Concordância" é o que mais cai dos três.
UPDATE teoria_conteudo t SET tema = 'Concordância'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'Português'
  AND t.tema = 'Gramática'
  AND NOT EXISTS (
    SELECT 1 FROM teoria_conteudo o
    WHERE o.materia_id = t.materia_id AND o.tema = 'Concordância' AND o.nivel = t.nivel
  );

-- Idem para o de Inglês, se existir com nome genérico.
UPDATE teoria_conteudo t SET tema = 'Gramática e Estrutura da Frase'
FROM materias m
WHERE m.id = t.materia_id AND m.nome = 'Inglês'
  AND t.tema = 'Gramática'
  AND NOT EXISTS (
    SELECT 1 FROM teoria_conteudo o
    WHERE o.materia_id = t.materia_id
      AND o.tema = 'Gramática e Estrutura da Frase' AND o.nivel = t.nivel
  );


-- ════════════════════════════════════════════════════════════════════
-- 2. Ligar cada texto ao assunto de mesmo nome
-- ════════════════════════════════════════════════════════════════════
-- A coluna existe desde a 004 e estava NULA em 100% das linhas. É ela que
-- permite ao radar de fraqueza dizer "você erra isto — leia aquilo".

UPDATE teoria_conteudo t
SET assunto_id = a.id
FROM assuntos a
WHERE a.materia_id = t.materia_id
  AND a.nome = t.tema
  AND t.assunto_id IS DISTINCT FROM a.id;

COMMENT ON COLUMN teoria_conteudo.assunto_id IS
  'Assunto canônico que este texto explica. Preenchido pela migration 014 '
  'casando `tema` com `assuntos.nome`. É o vínculo que leva o aluno do erro '
  'ao conteúdo.';

-- Índice para a busca "qual teoria existe para este assunto?", que o radar
-- faz uma vez por assunto fraco listado.
CREATE INDEX IF NOT EXISTS idx_teoria_por_assunto
  ON teoria_conteudo(assunto_id)
  WHERE assunto_id IS NOT NULL;

COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- 3. Conferência
-- ════════════════════════════════════════════════════════════════════

-- Quantos textos ficaram ligados a um assunto. Os sem vínculo são os de
-- Redação e os temas que não correspondem a assunto de prova — normal.
SELECT
  COUNT(*)                                    AS textos,
  COUNT(*) FILTER (WHERE assunto_id IS NOT NULL) AS ligados_a_assunto
FROM teoria_conteudo;

-- Cobertura por matéria: quantas questões estão num assunto que TEM teoria.
SELECT
  m.nome AS materia,
  COUNT(q.id)                                                        AS questoes,
  COUNT(q.id) FILTER (WHERE t.id IS NOT NULL)                        AS com_teoria,
  ROUND(100.0 * COUNT(q.id) FILTER (WHERE t.id IS NOT NULL)
        / NULLIF(COUNT(q.id), 0), 0)                                 AS percentual
FROM questoes q
JOIN materias m ON m.id = q.materia_id
LEFT JOIN teoria_conteudo t ON t.assunto_id = q.assunto_id
WHERE q.ativa
GROUP BY m.nome
ORDER BY COUNT(q.id) DESC;
