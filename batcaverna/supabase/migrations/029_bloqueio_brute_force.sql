-- ============================================================
-- BatCaverna — Migração 029: Proteção contra Força Bruta no Login
-- Adiciona colunas para bloqueio temporário de contas atacadas
-- ============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tentativas_login_falhas INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bloqueado_ate TIMESTAMPTZ;

COMMENT ON COLUMN users.tentativas_login_falhas IS
  'Contador de tentativas consecutivas de senha incorreta. Zera no login correto.';

COMMENT ON COLUMN users.bloqueado_ate IS
  'Timestamp até quando a conta fica temporariamente congelada após 5 falhas seguidas.';
