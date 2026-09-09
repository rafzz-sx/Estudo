-- ============================================================================
-- BatCaverna — Migração 020: Depoimentos na vitrine + Solicitações de reset
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. TABELA DE FEEDBACK DA PLATAFORMA & DEPOIMENTOS
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS feedback_plataforma (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL,
  tipo                  VARCHAR(20) NOT NULL DEFAULT 'opiniao',
  nota                  INTEGER CHECK (nota IS NULL OR (nota BETWEEN 1 AND 5)),
  mensagem              TEXT NOT NULL,
  marco_horas           INTEGER,
  lido_por_admin        BOOLEAN DEFAULT FALSE,
  aprovado_para_vitrine BOOLEAN DEFAULT FALSE,
  destaque_landing      BOOLEAN DEFAULT FALSE,
  criado_em             TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT feedback_plataforma_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Garantir as colunas caso a tabela já existisse de migração anterior
ALTER TABLE IF EXISTS feedback_plataforma
  ADD COLUMN IF NOT EXISTS aprovado_para_vitrine BOOLEAN DEFAULT FALSE;

ALTER TABLE IF EXISTS feedback_plataforma
  ADD COLUMN IF NOT EXISTS destaque_landing BOOLEAN DEFAULT FALSE;

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_feedback_criado
  ON feedback_plataforma(criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_vitrine
  ON feedback_plataforma(aprovado_para_vitrine)
  WHERE aprovado_para_vitrine = TRUE;

CREATE INDEX IF NOT EXISTS idx_feedback_user
  ON feedback_plataforma(user_id);

-- RLS: ativado
ALTER TABLE IF EXISTS feedback_plataforma ENABLE ROW LEVEL SECURITY;

-- Política: Leitura pública dos depoimentos aprovados para a vitrine
DROP POLICY IF EXISTS "Permitir leitura publica de depoimentos aprovados" ON feedback_plataforma;
CREATE POLICY "Permitir leitura publica de depoimentos aprovados"
  ON feedback_plataforma FOR SELECT
  USING (aprovado_para_vitrine = TRUE);

-- ════════════════════════════════════════════════════════════════════
-- 2. SOLICITAÇÕES DE RESET DE SENHA
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS solicitacoes_reset_senha (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL,
  motivo         TEXT,
  status         VARCHAR(20) NOT NULL DEFAULT 'pendente',
  -- pendente | resolvida | recusada
  resolvida_por  UUID,
  resolvida_em   TIMESTAMPTZ,
  criado_em      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT solicitacoes_reset_senha_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT solicitacoes_reset_senha_resolvida_por_fkey FOREIGN KEY (resolvida_por) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reset_senha_status
  ON solicitacoes_reset_senha(status)
  WHERE status = 'pendente';

CREATE INDEX IF NOT EXISTS idx_reset_senha_user
  ON solicitacoes_reset_senha(user_id);

-- RLS: tabela privada (gerenciada via service_role no backend)
ALTER TABLE IF EXISTS solicitacoes_reset_senha ENABLE ROW LEVEL SECURITY;

COMMIT;
