-- ============================================================
-- BatCaverna — Migração 003: Ativação de Row Level Security (RLS)
-- Resolve todos os avisos "CRITICAL" no painel do Supabase
-- ============================================================

-- ─── 1. Ativar RLS em TODAS as tabelas do schema public ──────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE nivel_gamificacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE concurso_materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE concurso_assuntos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bizus ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_questao_respostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_concurso_favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_categoria_escrita ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE amizades ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes_importadas_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- ─── 2. Políticas de Leitura Pública para Conteúdos Estáticos ─
-- Permite leitura de catálogo de concursos, matérias, bizus públicos e níveis

CREATE POLICY "Permitir leitura publica de nivel_gamificacao"
  ON nivel_gamificacao FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de concursos"
  ON concursos FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de materias"
  ON materias FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de concurso_materias"
  ON concurso_materias FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de assuntos"
  ON assuntos FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de concurso_assuntos"
  ON concurso_assuntos FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de bizus ativos"
  ON bizus FOR SELECT USING (ativo = true);

CREATE POLICY "Permitir leitura publica de questoes ativas"
  ON questoes FOR SELECT USING (ativo = true);

CREATE POLICY "Permitir leitura publica de badges"
  ON badges FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de app_info"
  ON app_info FOR SELECT USING (true);

CREATE POLICY "Permitir leitura publica de admin_banners ativos"
  ON admin_banners FOR SELECT USING (ativo = true);

-- ─── 3. Observação de Acesso do Servidor ──────────────────────
-- O backend Next.js (API routes) conecta usando SUPABASE_SERVICE_ROLE_KEY,
-- que automaticamente faz bypass do RLS para realizar cadastros, logins,
-- atualizações de XP, tickets e chat com total segurança e isolamento.
