-- ============================================================================
-- BatCaverna — Seed da Versão 3.0.0
--
-- Esta versão implementa:
--   • Sincronia de Esquadrão (+10% de XP em combate conjunto com amigos)
--   • Mensagens Dinâmicas de Estudo por Concurso Alvo e Horário
--   • Ações Rápidas de 1 Toque na Notificação com mensagem na DM
--   • Radar de Soldados ao Vivo na Dashboard (Visual com auréola pulsante)
--   • Filtro Inteligente Anti-Falso Disparo (2 minutos de estudo real)
--   • Insígnia Fundador Nível 6 e Raridades Padronizadas
--   • Permissões de Microfone e Áudio no Android APK Nativo
--   • Layout Responsivo no Chat Mobile
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
INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('3.0.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
