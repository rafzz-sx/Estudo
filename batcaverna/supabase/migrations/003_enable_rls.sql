-- ============================================================
-- BatCaverna — Migração 003: Ativação de Row Level Security (RLS)
-- Resolve todos os avisos "CRITICAL" no painel do Supabase
-- ============================================================

-- ─── 1. Ativar RLS em TODAS as tabelas existentes do schema public ──

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS nivel_gamificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS concurso_materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS concurso_assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bizus ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_questao_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ranking_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_concurso_favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_categoria_escrita ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS questao_importadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS importacao_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS app_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS amizades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mensagem_chat ENABLE ROW LEVEL SECURITY;

-- ─── 2. Políticas de Leitura Pública para Conteúdos do Catálogo ──

DROP POLICY IF EXISTS "Permitir leitura publica de nivel_gamificacao" ON nivel_gamificacao;
CREATE POLICY "Permitir leitura publica de nivel_gamificacao"
  ON nivel_gamificacao FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de concursos" ON concursos;
CREATE POLICY "Permitir leitura publica de concursos"
  ON concursos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de materias" ON materias;
CREATE POLICY "Permitir leitura publica de materias"
  ON materias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de concurso_materias" ON concurso_materias;
CREATE POLICY "Permitir leitura publica de concurso_materias"
  ON concurso_materias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de assuntos" ON assuntos;
CREATE POLICY "Permitir leitura publica de assuntos"
  ON assuntos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de concurso_assuntos" ON concurso_assuntos;
CREATE POLICY "Permitir leitura publica de concurso_assuntos"
  ON concurso_assuntos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de bizus" ON bizus;
CREATE POLICY "Permitir leitura publica de bizus"
  ON bizus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de questoes" ON questoes;
CREATE POLICY "Permitir leitura publica de questoes"
  ON questoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de badges" ON badges;
CREATE POLICY "Permitir leitura publica de badges"
  ON badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de app_info" ON app_info;
CREATE POLICY "Permitir leitura publica de app_info"
  ON app_info FOR SELECT USING (true);
