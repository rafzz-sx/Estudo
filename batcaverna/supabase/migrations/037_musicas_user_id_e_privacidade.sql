-- Migration 037: Isolamento pessoal de músicas importadas por aluno
-- Músicas com user_id IS NULL são faixas oficiais da BatCaverna (públicas para todos).
-- Músicas com user_id preenchido pertencem exclusivamente ao aluno que as importou.

ALTER TABLE musicas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_musicas_user_id ON musicas(user_id);

