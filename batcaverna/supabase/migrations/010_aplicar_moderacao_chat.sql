-- ============================================================================
-- Migração Opcional: Adicionar Colunas de Moderação ao Chat
-- Execute este script no SQL Editor do Supabase se desejar habilitar
-- os campos avançados de auditoria e moderação automática nas mensagens.
-- ============================================================================

ALTER TABLE mensagem_chat
  ADD COLUMN IF NOT EXISTS gravidade_moderacao TEXT,
  ADD COLUMN IF NOT EXISTS categorias_moderacao TEXT[],
  ADD COLUMN IF NOT EXISTS termos_detectados TEXT[],
  ADD COLUMN IF NOT EXISTS revisada_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revisada_por UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS decisao_moderacao TEXT;

ALTER TABLE mensagem_chat
  DROP CONSTRAINT IF EXISTS mensagem_chat_gravidade_valida;

ALTER TABLE mensagem_chat
  ADD CONSTRAINT mensagem_chat_gravidade_valida
    CHECK (gravidade_moderacao IS NULL
           OR gravidade_moderacao IN ('critica', 'alta', 'media', 'baixa'));

ALTER TABLE mensagem_chat
  DROP CONSTRAINT IF EXISTS mensagem_chat_decisao_valida;

ALTER TABLE mensagem_chat
  ADD CONSTRAINT mensagem_chat_decisao_valida
    CHECK (decisao_moderacao IS NULL
           OR decisao_moderacao IN ('sem_problema', 'advertido', 'suspenso', 'em_apuracao'));

CREATE INDEX IF NOT EXISTS idx_mensagem_moderacao_fila
  ON mensagem_chat(gravidade_moderacao, enviado_em DESC)
  WHERE gravidade_moderacao IS NOT NULL;
