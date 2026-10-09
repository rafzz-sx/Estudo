-- ============================================================================
-- BatCaverna — Seed da Versão 3.3.0
--
-- Esta versão implementa:
--   • Página Dedicada /novidades com linha do tempo e filtros por categoria
--   • Detector e Modal Inteligente de Atualizações Perdidas (MissedUpdatesModal)
--   • Unificação canônica de versões (Web, Mobile APK, Banco e API)
--   • Selo indicador visual sutil na barra de navegação para novidades não lidas
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

-- Grava SOMENTE A HORA SEM OS MINUTOS (hora cheia truncada)
INSERT INTO app_info (versao_atual, atualizado_em, notas_versao)
VALUES ('3.3.0', date_trunc('hour', NOW()), 'Central de Novidades e Sistema Inteligente de Versões');

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
