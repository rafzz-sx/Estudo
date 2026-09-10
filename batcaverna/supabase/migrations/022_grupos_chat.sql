-- ============================================================================
-- Migration 022: Grupos de Estudo no Chat
-- ============================================================================
-- Adiciona suporte a conversas em grupo (squads) ao sistema de chat.
-- A tabela `conversas` ganha campos opcionais para grupos, e uma nova tabela
-- `conversa_participantes` armazena os membros de cada grupo.
--
-- Conversas diretas (1-a-1) continuam funcionando sem alteração.
-- Idempotente.
-- ============================================================================

BEGIN;

-- 1. Colunas de grupo na tabela de conversas
ALTER TABLE conversas ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'direta';
ALTER TABLE conversas ADD COLUMN IF NOT EXISTS nome_grupo VARCHAR(100);
ALTER TABLE conversas ADD COLUMN IF NOT EXISTS criador_id UUID REFERENCES users(id);

-- 2. Tabela de participantes de grupos
CREATE TABLE IF NOT EXISTS conversa_participantes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversa_id  UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  adicionado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversa_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_part_user ON conversa_participantes(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_part_conv ON conversa_participantes(conversa_id);

-- 3. RLS
ALTER TABLE IF EXISTS conversa_participantes ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para o service role (API routes usam service key)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'conversa_participantes' AND policyname = 'conversa_participantes_service'
  ) THEN
    CREATE POLICY conversa_participantes_service ON conversa_participantes
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

COMMIT;
