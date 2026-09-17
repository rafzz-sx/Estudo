-- ============================================================================
-- BatCaverna — Redação Multi-Banca (Fase 2 de Evolução)
-- ============================================================================
-- Permite que o aluno escolha e treine a redação específica para:
-- 1. ENEM (5 competências com proposta de intervenção)
-- 2. Concursos Militares (ESA, EEAR, EsPCEx, CN, EPCAr, EFOMM)
-- 3. Cebraspe / Carreiras Policiais (PF, PRF, PCDF, Tribunais)
--
-- Idempotente e segura.
-- ============================================================================

BEGIN;

-- 1. Coluna matriz_id na tabela de redações
ALTER TABLE redacoes
  ADD COLUMN IF NOT EXISTS matriz_id VARCHAR(30) NOT NULL DEFAULT 'enem';

-- 2. Coluna matriz_id na tabela de temas propostos
ALTER TABLE redacao_temas
  ADD COLUMN IF NOT EXISTS matriz_id VARCHAR(30) NOT NULL DEFAULT 'enem';

-- 3. Índice para filtros rápidos por banca
CREATE INDEX IF NOT EXISTS idx_redacoes_matriz
  ON redacoes(matriz_id, user_id);

CREATE INDEX IF NOT EXISTS idx_redacao_temas_matriz
  ON redacao_temas(matriz_id) WHERE ativo;

COMMIT;
