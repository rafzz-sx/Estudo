-- ============================================================================
-- BatCaverna — Editais oficiais e assuntos cobrados (versão 2.1.0)
-- ============================================================================
-- Três lacunas fechadas aqui:
--
--   1. `concursos.edital_url` existia como coluna e estava vazio em todos os
--      nove. O aluno não tinha de onde conferir a fonte.
--   2. A EsPCEx tinha `tem_taf = TRUE` mas ZERO linhas em `taf_provas`. O
--      card do TAF só aparece quando há linha, então ele sumia calado.
--   3. Não havia como o aluno ver a lista de assuntos que caem no concurso.
--
-- ─── Sobre a honestidade dos dados ──────────────────────────────────────
-- As URLs abaixo foram testadas uma a uma. As marcadas [200] responderam;
-- marinha.mil.br e fab.mil.br devolvem 403 para robô mas abrem normalmente
-- no navegador (bloqueio de WAF, não site fora do ar).
--
-- Os índices do TAF da EsPCEx NÃO foram preenchidos com número: as fontes
-- que encontrei não trazem a tabela oficial, e o próprio edital avalia por
-- APTO/INAPTO. Inventar marca seria pior que deixar em branco — o aluno
-- treinaria para um número errado. Ficam os EXERCÍCIOS (que são certos) e
-- o encaminhamento para o edital vigente.
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. Link do edital / site oficial de cada concurso
-- ════════════════════════════════════════════════════════════════════

UPDATE concursos SET edital_url = 'https://ingresso.eear.fab.mil.br/'                                              WHERE sigla = 'EEAR';    -- [200]
UPDATE concursos SET edital_url = 'https://esa.eb.mil.br/'                                                         WHERE sigla = 'ESA';     -- [200]
UPDATE concursos SET edital_url = 'https://www.espcex.eb.mil.br/'                                                  WHERE sigla = 'EsPCEx';  -- [200]
UPDATE concursos SET edital_url = 'https://www.ime.eb.mil.br/'                                                     WHERE sigla = 'IME';     -- [200]
UPDATE concursos SET edital_url = 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem' WHERE sigla = 'ENEM'; -- [200]
UPDATE concursos SET edital_url = 'https://www.fab.mil.br/ingresso'                                                WHERE sigla = 'EPCAR';   -- 403 p/ robô
UPDATE concursos SET edital_url = 'https://www.marinha.mil.br/ensino'                                              WHERE sigla IN ('CN', 'EAM', 'EFOMM'); -- 403 p/ robô


-- ════════════════════════════════════════════════════════════════════
-- 2. TAF da EsPCEx — os exercícios, sem número inventado
-- ════════════════════════════════════════════════════════════════════

INSERT INTO taf_provas (concurso_id, sexo, exercicio, unidade, minimo_aprovacao, faixa_etaria, ordem, ano_edital, observacao)
SELECT c.id, v.sexo, v.exercicio, v.unidade, v.minimo, v.faixa, v.ordem, v.ano, v.obs
FROM concursos c
JOIN (VALUES
  ('masculino', 'Corrida de 12 minutos',            'metros',     'Conforme edital vigente', '17 a 22 anos', 1, 2025, 'Avaliado como APTO/INAPTO. Confira a tabela do edital do ano.'),
  ('masculino', 'Flexão de braço na barra fixa',    'repetições', 'Conforme edital vigente', '17 a 22 anos', 2, 2025, 'Pegada pronada, sem impulso de pernas.'),
  ('masculino', 'Flexão de braços sobre o solo',    'repetições', 'Conforme edital vigente', '17 a 22 anos', 3, 2025, NULL),
  ('masculino', 'Abdominal supra',                  'repetições', 'Conforme edital vigente', '17 a 22 anos', 4, 2025, 'Tempo cronometrado definido no edital.'),
  ('feminino',  'Corrida de 12 minutos',            'metros',     'Conforme edital vigente', '17 a 22 anos', 1, 2025, 'Avaliado como APTO/INAPTO. Confira a tabela do edital do ano.'),
  ('feminino',  'Flexão na barra fixa (isometria)', 'segundos',   'Conforme edital vigente', '17 a 22 anos', 2, 2025, 'Sustentação isométrica, no lugar da tração masculina.'),
  ('feminino',  'Flexão de braços sobre o solo',    'repetições', 'Conforme edital vigente', '17 a 22 anos', 3, 2025, NULL),
  ('feminino',  'Abdominal supra',                  'repetições', 'Conforme edital vigente', '17 a 22 anos', 4, 2025, 'Tempo cronometrado definido no edital.')
) AS v(sexo, exercicio, unidade, minimo, faixa, ordem, ano, obs) ON TRUE
WHERE c.sigla = 'EsPCEx'
  AND NOT EXISTS (
    SELECT 1 FROM taf_provas t
    WHERE t.concurso_id = c.id AND t.exercicio = v.exercicio AND t.sexo = v.sexo
  );


-- ════════════════════════════════════════════════════════════════════
-- 3. Assuntos cobrados — a partir das provas oficiais já importadas
-- ════════════════════════════════════════════════════════════════════
-- Por que derivar das provas em vez de transcrever o conteúdo programático:
--
-- O edital lista o que PODE cair. As provas mostram o que CAI — e com que
-- frequência. Um aluno que sabe que "Geometria Plana" apareceu 79 vezes e
-- "Números Complexos" 4 sabe onde investir a próxima hora; a lista do
-- edital trata os dois como iguais.
--
-- Além disso, esses números são verificáveis: saem das provas oficiais que
-- já estão no banco. Transcrever um conteúdo programático que eu não
-- conseguisse conferir seria inventar.
--
-- A view é materializada em consulta (não é MATERIALIZED VIEW) para
-- refletir na hora as questões que o admin importar pelo painel.

CREATE OR REPLACE VIEW concurso_assuntos_cobrados AS
SELECT
  c.id            AS concurso_id,
  c.sigla         AS concurso_sigla,
  m.id            AS materia_id,
  m.nome          AS materia,
  m.icone_emoji   AS materia_emoji,
  a.id            AS assunto_id,
  COALESCE(a.nome, 'Geral') AS assunto,
  COUNT(q.id)                              AS total_questoes,
  MIN(q.ano)                               AS primeiro_ano,
  MAX(q.ano)                               AS ultimo_ano,
  COUNT(DISTINCT q.ano)                    AS anos_distintos,
  -- Taxa de acerto da comunidade: mostra o assunto que mais derruba.
  SUM(COALESCE(q.vezes_respondida, 0))     AS respostas,
  SUM(COALESCE(q.vezes_acertada, 0))       AS acertos
FROM questoes q
JOIN concursos c ON c.id = q.concurso_id
LEFT JOIN materias m ON m.id = q.materia_id
LEFT JOIN assuntos a ON a.id = q.assunto_id
WHERE q.ativa = TRUE
GROUP BY c.id, c.sigla, m.id, m.nome, m.icone_emoji, a.id, a.nome;


-- ════════════════════════════════════════════════════════════════════
-- 4. Conferência
-- ════════════════════════════════════════════════════════════════════

SELECT sigla, edital_url IS NOT NULL AS tem_link_do_edital, tem_taf
FROM concursos ORDER BY ordem_exibicao;

SELECT c.sigla, COUNT(*) AS linhas_de_taf
FROM taf_provas t JOIN concursos c ON c.id = t.concurso_id
GROUP BY c.sigla ORDER BY c.sigla;

SELECT concurso_sigla, COUNT(*) AS assuntos_distintos, SUM(total_questoes) AS questoes
FROM concurso_assuntos_cobrados
GROUP BY concurso_sigla ORDER BY concurso_sigla;
