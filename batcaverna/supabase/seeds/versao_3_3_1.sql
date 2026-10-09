-- ============================================================================
-- BatCaverna — Seed da Versão 3.3.1
--
-- Esta versão implementa:
--   • Sistema de Classificação Tática de Lançamentos:
--       - ⭐ Maior Atualização (vX.0.0 — muda 1º número da esquerda)
--       - 🚀 Grande Atualização (v3.X.0 — muda número do meio)
--       - ⚡ Atualização (v3.5.X — muda 3º número com recursos expressivos)
--       - 🛠️ Pequena Atualização (v3.5.X — muda 3º número com ajustes/correções)
--   • Guia Interativo de Taxonomia de Versões na página /novidades
--   • Badges hierárquicos integrados na Linha do Tempo e no Modal de Boas-Vindas
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
VALUES ('3.3.1', date_trunc('hour', NOW()), 'Sistema de Classificação Tática de Lançamentos');

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
