-- ============================================================
-- BatCaverna — Migração 031: Otimização de Performance e Índices de Alta Velocidade
-- Acelera buscas de questões, ranking e estatísticas de alunos.
-- Idempotente (100% seguro).
-- ============================================================

-- 1. EXTENSÃO TRIGRAM (para buscas textuais instantâneas sem Full Table Scan)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICE GIN TRIGRAM NO ENUNCIADO DAS QUESTÕES
-- Transforma o ilike('%termo%') de varredura lenta em busca por índice ultra-rápida
CREATE INDEX IF NOT EXISTS idx_questoes_enunciado_trgm 
  ON questoes USING gin (enunciado gin_trgm_ops);

-- 3. ÍNDICES COMPOSTOS PARA RESPOSTAS DE ALUNOS
-- Acelera o filtro "nao_respondidas=1", combos, streaks e estatísticas
CREATE INDEX IF NOT EXISTS idx_uqr_user_data_desc 
  ON user_questao_respostas (user_id, respondido_em DESC);

CREATE INDEX IF NOT EXISTS idx_uqr_user_correta 
  ON user_questao_respostas (user_id, correta);

-- 4. ÍNDICE PARA SESSÕES DE ESTUDO
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_tempo 
  ON study_sessions (user_id, iniciada_em DESC);
