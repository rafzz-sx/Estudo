-- ============================================================================
-- BatCaverna — Seed da Versão 2.9.0
--
-- Esta versão implementa a auditoria completa da plataforma:
--   • Correção da constraint única em questoes.hash_conteudo (ON CONFLICT)
--   • Preservação de histórico do chat ao desfazer amizades (ON DELETE SET NULL)
--   • Bloqueio de envio de mensagens no chat para amizades inativas/desfeitas
--   • Ordenação correta do chat (últimas 100 mensagens)
--   • Eliminação de stale closure no chat
--   • Mapeamento de concursos favoritos na tela de progresso
--   • Unificação de rotas de matérias sob [sigla]
--   • Botões para apagar redações e playlists com confirmação
--   • Ações de desfazer amizade e bloquear amigos na interface
--   • Envio de e-mail de verificação de cadastro com token
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
VALUES ('2.9.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
