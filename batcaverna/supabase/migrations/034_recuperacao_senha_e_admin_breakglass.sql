-- ==============================================================================
-- BatCaverna — Migration 034: Sistema Seguro de Recuperação de Senha & Break-Glass
-- Versão: 3.3.2
--
-- Criação de tabelas dedicadas para:
-- 1. password_reset_tokens: Armazena tokens criptográficos e códigos de 6 dígitos
--    (SEMPRE em formato HASH SHA-256) com tempo de expiração curto (30 min) e uso único.
-- 2. admin_recovery_codes: Códigos de contingência pré-gerados para o administrador
--    (armazenados com HASH SHA-256) para recuperação sem depender de e-mail.
-- ==============================================================================

-- ─── 1. Tabela de Tokens de Recuperação de Senha ──────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'link', -- 'link' ou 'codigo'
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  usado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_pendentes ON password_reset_tokens(user_id, usado, expira_em) WHERE usado = FALSE;

-- Row Level Security: Nenhum acesso para chave anônima (apenas service_role)
ALTER TABLE IF EXISTS password_reset_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Bloqueio anonimo total em password_reset_tokens" ON password_reset_tokens;
  CREATE POLICY "Bloqueio anonimo total em password_reset_tokens"
    ON password_reset_tokens
    FOR ALL
    TO anon, authenticated
    USING (false);
EXCEPTION WHEN others THEN null; END $$;

-- ─── 2. Tabela de Códigos de Contingência do Administrador ───
CREATE TABLE IF NOT EXISTS admin_recovery_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  codigo_hash VARCHAR(255) NOT NULL UNIQUE,
  usado BOOLEAN NOT NULL DEFAULT FALSE,
  usado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arc_admin_id ON admin_recovery_codes(admin_id);
CREATE INDEX IF NOT EXISTS idx_arc_codigo_hash ON admin_recovery_codes(codigo_hash);
CREATE INDEX IF NOT EXISTS idx_arc_disponiveis ON admin_recovery_codes(admin_id, usado) WHERE usado = FALSE;

-- Row Level Security: Apenas service_role
ALTER TABLE IF EXISTS admin_recovery_codes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Bloqueio anonimo total em admin_recovery_codes" ON admin_recovery_codes;
  CREATE POLICY "Bloqueio anonimo total em admin_recovery_codes"
    ON admin_recovery_codes
    FOR ALL
    TO anon, authenticated
    USING (false);
EXCEPTION WHEN others THEN null; END $$;
