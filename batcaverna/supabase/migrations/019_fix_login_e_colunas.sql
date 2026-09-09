-- ============================================================================
-- Migration 019: Correção de Colunas de Autenticação e Reset de Senha
-- ============================================================================

-- 1. Garante que todas as colunas de autenticação e moderação existem em users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ativo             BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS suspenso_ate      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_suspensao  TEXT,
  ADD COLUMN IF NOT EXISTS suspenso_por      UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS moderado_em       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ultimo_login_em   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sessao_expira_em  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS combo_atual       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS combo_atualizado_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_questoes_respondidas INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_acertos     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tempo_estudo_total_segundos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS maior_streak      INTEGER DEFAULT 0;

-- Garante que nenhum usuário fique com ativo nulo
UPDATE users SET ativo = TRUE WHERE ativo IS NULL;

-- 2. Redefine a senha do Admin (raf4biel.venafro@gmail.com) e de rafaelolavo28@gmail.com
-- para a senha temporária: Batcaverna123!
-- (Hash SHA-256 de Batcaverna123!: 7733a30edf8682c7ac947e607dd550aadde231e6d7fd4c100c7c862a3e9f939d)
UPDATE users 
SET senha_hash = '7733a30edf8682c7ac947e607dd550aadde231e6d7fd4c100c7c862a3e9f939d',
    ativo = TRUE,
    email_verified = TRUE
WHERE email IN ('raf4biel.venafro@gmail.com', 'rafaelolavo28@gmail.com');

-- 3. Confirmação
SELECT id, nome, email, role, ativo, atualizado_em FROM users;
