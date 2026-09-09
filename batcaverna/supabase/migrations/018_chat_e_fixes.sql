-- ============================================================================
-- Migration 018: Chat, Histórico de Amizades e Correção de Constraint de Seeds
-- ============================================================================

-- 1. Correção do índice de questões (A2 / ON CONFLICT erro 42P10)
-- Garante que a coluna hash_conteudo existe antes de criar o índice único
ALTER TABLE questoes ADD COLUMN IF NOT EXISTS hash_conteudo VARCHAR(64);

-- Recria o índice como UNIQUE padrão (aceita múltiplos NULLs e permite ON CONFLICT)
DROP INDEX IF EXISTS idx_questoes_hash;
CREATE UNIQUE INDEX IF NOT EXISTS idx_questoes_hash ON questoes(hash_conteudo);

-- 2. Permitir status 'desfeita' em amizade_status
ALTER TYPE amizade_status ADD VALUE IF NOT EXISTS 'desfeita';

-- 3. Preservação do histórico de chat ao desfazer amizades (B7 / B8)
-- Torna a coluna amizade_id anulável em conversas
ALTER TABLE conversas ALTER COLUMN amizade_id DROP NOT NULL;

-- Remove qualquer constraint de foreign key existente em amizade_id e recria com ON DELETE SET NULL
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.table_name = 'conversas' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'amizade_id'
    ) LOOP
        EXECUTE 'ALTER TABLE conversas DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

ALTER TABLE conversas
  ADD CONSTRAINT conversas_amizade_id_fkey
  FOREIGN KEY (amizade_id)
  REFERENCES amizades(id)
  ON DELETE SET NULL;
