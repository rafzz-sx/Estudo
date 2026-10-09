-- ============================================================================
-- BatCaverna — Migração 036: Atualização de Versão para 3.4.0
-- ============================================================================

-- Garante que a coluna notas_versao exista
ALTER TABLE IF EXISTS app_info ADD COLUMN IF NOT EXISTS notas_versao TEXT;

-- Atualiza a versão canônica no banco de dados
DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em, notas_versao)
VALUES (
  '3.4.0',
  date_trunc('hour', NOW()),
  'Trilha Sonora Tática (Spotify & YouTube), Chat Militar com Histórico Datado, Blindagem de Segurança e Recuperação Visual de Conta'
);
