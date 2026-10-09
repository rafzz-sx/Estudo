-- ============================================================================
-- BatCaverna — Migração 035: Atualização de Versão para 3.3.2
-- ============================================================================

-- Garante que a coluna notas_versao exista
ALTER TABLE IF EXISTS app_info ADD COLUMN IF NOT EXISTS notas_versao TEXT;

-- Atualiza a versão canônica no banco de dados
DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em, notas_versao)
VALUES (
  '3.3.2',
  date_trunc('hour', NOW()),
  'Blindagem de Acesso, Recuperação Tática de Senha e Notificações Militares Oficiais'
);
