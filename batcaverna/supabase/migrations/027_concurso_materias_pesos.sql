-- ============================================================================
-- BatCaverna — Calibração Oficial de Pesos dos Editais (Fase 3 de Evolução)
-- ============================================================================
-- Corrige a distribuição de tempo do cronograma de estudos:
-- O peso passa a ser o número real de questões do edital oficial,
-- garantindo que matérias com poucas questões cadastradas no app (ex: Redação,
-- Física na EEAR) não fiquem com tempo zerado ou desproporcional.
-- ============================================================================

BEGIN;

-- 1. Adiciona coluna peso_edital na tabela concurso_materias
ALTER TABLE concurso_materias
  ADD COLUMN IF NOT EXISTS peso_edital DECIMAL(5,2) DEFAULT 1.0;

-- 2. Atualiza os pesos oficiais conforme os editais das principais bancas

-- ─── EEAR (96 questões: 24 para cada uma das 4 matérias = 25% cada) ────────
UPDATE concurso_materias cm
SET peso_edital = 24.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'EEAR'
  AND m.nome IN ('Português', 'Matemática', 'Física', 'Inglês');

-- ─── ESA (50 questões: 14 Mat, 14 Port, 12 Hist/Geo, 10 Ing + Redação) ────
UPDATE concurso_materias cm
SET peso_edital = 14.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'ESA'
  AND m.nome IN ('Português', 'Matemática');

UPDATE concurso_materias cm
SET peso_edital = 6.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'ESA'
  AND m.nome IN ('História do Brasil', 'Geografia do Brasil', 'História', 'Geografia');

UPDATE concurso_materias cm
SET peso_edital = 10.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'ESA'
  AND m.nome IN ('Inglês', 'Redação');

-- ─── EsPCEx (100 questões: 20 Port, 20 Mat, 12 Fís, 12 Quím, 12 Hist, 12 Geo, 12 Ing + Redação)
UPDATE concurso_materias cm
SET peso_edital = 20.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'EsPCEx'
  AND m.nome IN ('Português', 'Matemática');

UPDATE concurso_materias cm
SET peso_edital = 12.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'EsPCEx'
  AND m.nome IN ('Física', 'Química', 'História do Brasil', 'Geografia do Brasil', 'História', 'Geografia', 'Inglês');

UPDATE concurso_materias cm
SET peso_edital = 15.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'EsPCEx'
  AND m.nome = 'Redação';

-- ─── ENEM (45 questões por área de conhecimento) ───────────────────────────
UPDATE concurso_materias cm
SET peso_edital = 45.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'ENEM';

-- ─── Colégio Naval (CN) e EPCAr ───────────────────────────────────────────
UPDATE concurso_materias cm
SET peso_edital = 20.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'CN';

UPDATE concurso_materias cm
SET peso_edital = 16.0
FROM concursos c, materias m
WHERE cm.concurso_id = c.id
  AND cm.materia_id = m.id
  AND c.sigla = 'EPCAR';

COMMIT;
