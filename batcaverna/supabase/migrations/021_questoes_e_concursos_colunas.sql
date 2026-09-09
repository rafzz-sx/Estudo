-- ============================================================================
-- BatCaverna — Migração 021: Adição de colunas auxiliares em questoes e concursos
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. COLUNAS COMPLEMENTARES EM CONCURSOS
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS concursos
  ADD COLUMN IF NOT EXISTS emoji VARCHAR(10) DEFAULT '🎯',
  ADD COLUMN IF NOT EXISTS cor_tema VARCHAR(30) DEFAULT '#f59e0b',
  ADD COLUMN IF NOT EXISTS ordem_exibicao INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tem_taf BOOLEAN DEFAULT FALSE;

-- ════════════════════════════════════════════════════════════════════
-- 2. COLUNAS COMPLEMENTARES EM QUESTOES
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS questoes
  ADD COLUMN IF NOT EXISTS texto_base TEXT,
  ADD COLUMN IF NOT EXISTS dia_prova INTEGER,
  ADD COLUMN IF NOT EXISTS numero_ordem INTEGER,
  ADD COLUMN IF NOT EXISTS numero_original INTEGER,
  ADD COLUMN IF NOT EXISTS area_conhecimento VARCHAR(100),
  ADD COLUMN IF NOT EXISTS figura_descricao TEXT,
  ADD COLUMN IF NOT EXISTS figura_svg TEXT,
  ADD COLUMN IF NOT EXISTS precisa_resolucao BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS anulada BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tem_comentario BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vezes_respondida INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vezes_acertada INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ativa BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_questoes_ativa ON questoes(ativa);

COMMIT;
