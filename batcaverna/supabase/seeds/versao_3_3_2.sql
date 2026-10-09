-- ============================================================================
-- BatCaverna — Seed da Versão 3.3.2
--
-- Esta versão implementa:
--   • Blindagem de Acesso & Recuperação Tática de Credenciais
--   • Envio de Links e Códigos de Autorização de 6 Dígitos
--   • E-mails Militares Oficiais com Brasão da BatCaverna e Dark Mode
--   • Alternância Obrigatória de Visibilidade nos Campos de Senha
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  versao_atual VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  notas_versao TEXT
);

ALTER TABLE IF EXISTS app_info ADD COLUMN IF NOT EXISTS notas_versao TEXT;

ALTER TABLE IF EXISTS app_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura publica de app_info" ON app_info;
CREATE POLICY "Permitir leitura publica de app_info" ON app_info FOR SELECT USING (true);

DELETE FROM app_info;

-- Grava SOMENTE A HORA SEM OS MINUTOS (hora cheia truncada)
INSERT INTO app_info (versao_atual, atualizado_em, notas_versao)
VALUES ('3.3.2', date_trunc('hour', NOW()), 'Blindagem de Acesso e Recuperação Tática de Credenciais');

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
