-- ============================================================================
-- Migration 018: Chat, Histórico de Amizades e Correção de Constraint de Seeds
-- ============================================================================

-- 1. Correção do índice de questões (A2 / ON CONFLICT erro 42P10)
-- O índice anterior era parcial (WHERE hash_conteudo IS NOT NULL), impedindo
-- a cláusula ON CONFLICT (hash_conteudo) usada pelos seeds de importação.
-- PostgreSQL aceita múltiplos NULLs em índices UNIQUE padrão.
DROP INDEX IF EXISTS idx_questoes_hash;
CREATE UNIQUE INDEX IF NOT EXISTS idx_questoes_hash ON questoes(hash_conteudo);

-- 2. Permitir status 'desfeita' em amizade_status
ALTER TYPE amizade_status ADD VALUE IF NOT EXISTS 'desfeita';

-- 3. Preservação do histórico de chat ao desfazer amizades (B7 / B8)
-- Torna a coluna amizade_id anulável em conversas
ALTER TABLE conversas ALTER COLUMN amizade_id DROP NOT NULL;

-- Remove constraint de deleção em cascata e recria com SET NULL
ALTER TABLE conversas DROP CONSTRAINT IF EXISTS conversas_amizade_id_fkey;
ALTER TABLE conversas
  ADD CONSTRAINT conversas_amizade_id_fkey
  FOREIGN KEY (amizade_id)
  REFERENCES amizades(id)
  ON DELETE SET NULL;
