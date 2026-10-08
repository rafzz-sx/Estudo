-- ============================================================
-- BatCaverna — Migração 031: Otimização de Performance e Índices de Alta Velocidade
-- Acelera consultas de questões, chat em tempo real, ranking e sessões de estudo.
-- Idempotente (pode rodar múltiplas vezes com segurança).
-- ============================================================

-- 1. EXTENSÃO TRIGRAM (para buscas textuais instantâneas sem Full Table Scan)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICE GIN TRIGRAM NO ENUNCIADO DAS QUESTÕES
-- Transforma o ilike('%termo%') de varredura lenta em busca por índice veloz
CREATE INDEX IF NOT EXISTS idx_questoes_enunciado_trgm 
  ON questoes USING gin (enunciado gin_trgm_ops);

-- 3. ÍNDICES COMPOSTOS PARA RESPOSTAS DE ALUNOS
-- Acelera o filtro "nao_respondidas=1" e o cálculo de estatísticas e streaks
CREATE INDEX IF NOT EXISTS idx_uqr_user_data_desc 
  ON user_questao_respostas (user_id, respondido_em DESC);

CREATE INDEX IF NOT EXISTS idx_uqr_user_correta 
  ON user_questao_respostas (user_id, correta);

-- 4. ÍNDICES PARA CHAT E MENSAGENS (acelera o polling de 5s no mobile e web)
CREATE INDEX IF NOT EXISTS idx_mensagem_chat_conversa_tempo 
  ON mensagem_chat (conversa_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_conversa_participantes_user 
  ON conversa_participantes (user_id, conversa_id);

-- 5. ÍNDICES PARA SESSÕES DE ESTUDO E REVISÕES ESPAÇADAS
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_tempo 
  ON study_sessions (user_id, iniciada_em DESC);

CREATE INDEX IF NOT EXISTS idx_revisoes_agendadas_user_data 
  ON revisoes_agendadas (user_id, agendada_para) 
  WHERE ativa = TRUE;

-- 6. ÍNDICE PARA NOTIFICAÇÕES (ícone do sino no header)
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_lida 
  ON notificacoes (user_id, lida, criado_em DESC);
