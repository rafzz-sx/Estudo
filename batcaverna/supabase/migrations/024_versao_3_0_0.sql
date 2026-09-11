-- ============================================================================
-- Migração 024: Atualização de Versão para 3.0.0
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  versao_atual VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  notas_versao TEXT
);

ALTER TABLE IF EXISTS app_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura publica de app_info" ON app_info;
CREATE POLICY "Permitir leitura publica de app_info" ON app_info FOR SELECT USING (true);

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em, notas_versao)
VALUES (
  '3.0.0',
  date_trunc('hour', NOW()),
  'Sincronia de Esquadrão, Radar ao Vivo, Mensagens Dinâmicas e Correções Mobile'
);
