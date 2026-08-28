-- ============================================================
-- BatCaverna — Schema SQL Completo
-- PostgreSQL (Supabase)
-- Todas as tabelas da seção 5.2 do documento de especificação
-- ============================================================

-- ─── Extensões ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tipos Enum ──────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE forca_tipo AS ENUM ('aeronautica', 'marinha', 'exercito', 'enem');
CREATE TYPE nivel_ensino_tipo AS ENUM ('fundamental', 'medio', 'avancado');
CREATE TYPE nivel_impacto_tipo AS ENUM ('alto', 'util', 'avancado');
CREATE TYPE dificuldade_tipo AS ENUM ('facil', 'medio', 'dificil');
CREATE TYPE progresso_status AS ENUM ('nao_iniciado', 'em_andamento', 'concluido');
CREATE TYPE dispositivo_tipo AS ENUM ('web', 'app', 'pwa');
CREATE TYPE ranking_tipo AS ENUM ('tempo_estudo', 'questoes_respondidas');
CREATE TYPE ranking_periodo AS ENUM ('semanal', 'mensal', 'geral');
CREATE TYPE ticket_motivo_tipo AS ENUM ('bugs', 'ideia', 'outros');
CREATE TYPE ticket_status_tipo AS ENUM ('aberto', 'respondido', 'finalizado');
CREATE TYPE ticket_msg_role AS ENUM ('usuario', 'admin');
CREATE TYPE banner_tipo AS ENUM ('imagem', 'gif', 'video');
CREATE TYPE favorito_tipo AS ENUM ('bizu', 'questao');
CREATE TYPE notificacao_tipo AS ENUM (
  'xp_ganho', 'subiu_nivel', 'mensagem_motivacional',
  'atualizacao_plataforma', 'resposta_ticket', 'streak',
  'badge_conquistado', 'ranking', 'nova_mensagem_amigo', 'solicitacao_amizade'
);
CREATE TYPE amizade_status AS ENUM ('pendente', 'aceita', 'recusada', 'bloqueada');
CREATE TYPE mensagem_chat_tipo AS ENUM ('texto', 'audio', 'imagem');
CREATE TYPE questao_importada_status AS ENUM ('aceita', 'ignorada_duplicada', 'erro_validacao');

-- ═══════════════════════════════════════════════════════════════
-- TABELAS PRINCIPAIS
-- ═══════════════════════════════════════════════════════════════

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  apelido VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  banner_url TEXT,
  banner_tipo banner_tipo,
  bio VARCHAR(150),
  data_nascimento DATE,
  role user_role DEFAULT 'user',
  xp_total INTEGER DEFAULT 0,
  nivel_atual INTEGER DEFAULT 1,
  maior_combo_pessoal INTEGER DEFAULT 0,
  streak_dias INTEGER DEFAULT 0,
  ultimo_dia_estudado DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_apelido ON users(apelido);
CREATE INDEX idx_users_role ON users(role);

-- ─── Tokens de Verificação de E-mail ─────────────────────────
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evt_token ON email_verification_tokens(token);
CREATE INDEX idx_evt_user ON email_verification_tokens(user_id);

-- ─── Refresh Tokens (sessão de 10h) ─────────────────────────
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  dispositivo dispositivo_tipo DEFAULT 'web',
  expira_em TIMESTAMPTZ NOT NULL,
  revogado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rt_user ON refresh_tokens(user_id);
CREATE INDEX idx_rt_hash ON refresh_tokens(token_hash);

-- ─── Níveis de Gamificação ───────────────────────────────────
CREATE TABLE nivel_gamificacao (
  nivel INTEGER PRIMARY KEY,
  titulo VARCHAR(50) NOT NULL,
  xp_minimo_necessario INTEGER NOT NULL,
  icone_url TEXT
);

-- ─── Concursos ───────────────────────────────────────────────
CREATE TABLE concursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  sigla VARCHAR(10) NOT NULL UNIQUE,
  descricao TEXT,
  nivel_ensino nivel_ensino_tipo NOT NULL,
  forca forca_tipo NOT NULL,
  icone_url TEXT,
  brasao_url TEXT,
  imagem_fundo_url TEXT,
  frase_curta_card VARCHAR(200)
);

-- ─── Matérias ────────────────────────────────────────────────
CREATE TABLE materias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(80) NOT NULL,
  descricao TEXT,
  icone_emoji VARCHAR(10)
);

-- ─── Relação Concurso ↔ Matéria ──────────────────────────────
CREATE TABLE concurso_materias (
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  peso_na_prova DECIMAL(3,1),
  PRIMARY KEY (concurso_id, materia_id)
);

-- ─── Assuntos ────────────────────────────────────────────────
CREATE TABLE assuntos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  ordem INTEGER DEFAULT 0,
  resumo_teorico TEXT
);

CREATE INDEX idx_assuntos_materia ON assuntos(materia_id);

-- ─── Relação Concurso ↔ Assunto ──────────────────────────────
CREATE TABLE concurso_assuntos (
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
  incluido BOOLEAN DEFAULT TRUE,
  peso_relativo DECIMAL(3,1),
  PRIMARY KEY (concurso_id, assunto_id)
);

-- ─── Bizus ───────────────────────────────────────────────────
CREATE TABLE bizus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assunto_id UUID NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
  titulo VARCHAR(150) NOT NULL,
  conteudo TEXT NOT NULL,
  nivel_impacto nivel_impacto_tipo DEFAULT 'util',
  exemplo_pratico TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bizus_assunto ON bizus(assunto_id);

-- ─── Questões ────────────────────────────────────────────────
CREATE TABLE questoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurso_id UUID NOT NULL REFERENCES concursos(id),
  materia_id UUID NOT NULL REFERENCES materias(id),
  assunto_id UUID NOT NULL REFERENCES assuntos(id),
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL, -- [{letra, texto}, ...]
  resposta_correta VARCHAR(2) NOT NULL,
  explicacao TEXT NOT NULL,
  ano INTEGER,
  banca VARCHAR(80),
  dificuldade dificuldade_tipo DEFAULT 'medio',
  bizu_relacionado_id UUID REFERENCES bizus(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questoes_concurso ON questoes(concurso_id);
CREATE INDEX idx_questoes_materia ON questoes(materia_id);
CREATE INDEX idx_questoes_assunto ON questoes(assunto_id);
CREATE INDEX idx_questoes_dificuldade ON questoes(dificuldade);
CREATE INDEX idx_questoes_ano ON questoes(ano);

-- ─── Progresso do Usuário por Assunto ────────────────────────
CREATE TABLE user_progresso (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
  status progresso_status DEFAULT 'nao_iniciado',
  percentual DECIMAL(5,2) DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, assunto_id)
);

-- ─── Respostas de Questões ───────────────────────────────────
CREATE TABLE user_questao_respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  resposta_dada VARCHAR(2) NOT NULL,
  correta BOOLEAN NOT NULL,
  tempo_gasto_segundos INTEGER DEFAULT 0,
  combo_no_momento INTEGER DEFAULT 0,
  respondido_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uqr_user ON user_questao_respostas(user_id);
CREATE INDEX idx_uqr_questao ON user_questao_respostas(questao_id);
CREATE INDEX idx_uqr_respondido ON user_questao_respostas(respondido_em);

-- ─── Simulados ───────────────────────────────────────────────
CREATE TABLE simulados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concurso_id UUID NOT NULL REFERENCES concursos(id),
  questoes_ids UUID[] NOT NULL,
  total_questoes INTEGER NOT NULL,
  acertos INTEGER DEFAULT 0,
  pontuacao DECIMAL(5,2),
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  finalizado_em TIMESTAMPTZ
);

CREATE INDEX idx_simulados_user ON simulados(user_id);

-- ─── Favoritos (Bizus e Questões) ────────────────────────────
CREATE TABLE favoritos (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo favorito_tipo NOT NULL,
  item_id UUID NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tipo, item_id)
);

-- ─── Badges / Conquistas ─────────────────────────────────────
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(80) NOT NULL,
  descricao TEXT,
  icone TEXT,
  criterio TEXT
);

CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  conquistado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ─── Sessões de Estudo ───────────────────────────────────────
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dispositivo_origem dispositivo_tipo DEFAULT 'web',
  iniciada_em TIMESTAMPTZ DEFAULT NOW(),
  ultima_atividade_em TIMESTAMPTZ DEFAULT NOW(),
  finalizada_em TIMESTAMPTZ,
  duracao_segundos INTEGER DEFAULT 0,
  blocos_continuos_completados INTEGER DEFAULT 0,
  multiplicador_continuidade_atual DECIMAL(3,2) DEFAULT 1.0,
  xp_ganho_na_sessao INTEGER DEFAULT 0
);

CREATE INDEX idx_ss_user ON study_sessions(user_id);
CREATE INDEX idx_ss_iniciada ON study_sessions(iniciada_em);
CREATE INDEX idx_ss_ativa ON study_sessions(user_id, finalizada_em) WHERE finalizada_em IS NULL;

-- ─── Cache de Ranking ────────────────────────────────────────
CREATE TABLE ranking_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo ranking_tipo NOT NULL,
  periodo ranking_periodo NOT NULL,
  concurso_id UUID REFERENCES concursos(id),
  materia_id UUID REFERENCES materias(id),
  tempo_total_segundos INTEGER DEFAULT 0,
  total_questoes_respondidas INTEGER DEFAULT 0,
  percentual_acerto DECIMAL(5,2) DEFAULT 0,
  posicao INTEGER DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tipo, periodo, concurso_id, materia_id)
);

CREATE INDEX idx_rc_posicao ON ranking_cache(tipo, periodo, posicao);

-- ─── Privacidade do Ranking ──────────────────────────────────
CREATE TABLE user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ocultar_do_ranking BOOLEAN DEFAULT FALSE
);

-- ─── Concursos Favoritos do Usuário ──────────────────────────
CREATE TABLE user_concurso_favoritos (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, concurso_id)
);

-- ─── Categoria "Escrito" do Usuário ──────────────────────────
CREATE TABLE user_categoria_escrita (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  texto VARCHAR(100)
);

-- ─── Tickets de Suporte ──────────────────────────────────────
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  motivo ticket_motivo_tipo NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  status ticket_status_tipo DEFAULT 'aberto',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  finalizado_em TIMESTAMPTZ,
  finalizado_por_admin_id UUID REFERENCES users(id)
);

CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);

CREATE TABLE ticket_mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES users(id),
  autor_role ticket_msg_role NOT NULL,
  conteudo TEXT NOT NULL,
  enviado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tm_ticket ON ticket_mensagens(ticket_id);

-- ─── Notificações ────────────────────────────────────────────
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo notificacao_tipo NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT,
  dados_extra JSONB,
  lida BOOLEAN DEFAULT FALSE,
  criada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notificacoes(user_id, lida);
CREATE INDEX idx_notif_criada ON notificacoes(criada_em DESC);

-- ─── Armazém de Questões — Importações ───────────────────────
CREATE TABLE questao_importadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hash_conteudo VARCHAR(64) NOT NULL,
  questao_id UUID REFERENCES questoes(id),
  arquivo_origem VARCHAR(255),
  status questao_importada_status NOT NULL,
  motivo_ignorada TEXT,
  importado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_qi_hash ON questao_importadas(hash_conteudo);

CREATE TABLE importacao_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  executado_em TIMESTAMPTZ DEFAULT NOW(),
  arquivos_encontrados INTEGER DEFAULT 0,
  questoes_aceitas INTEGER DEFAULT 0,
  questoes_ignoradas_duplicadas INTEGER DEFAULT 0,
  questoes_com_erro INTEGER DEFAULT 0,
  duracao_segundos INTEGER DEFAULT 0
);

-- ─── Info da Aplicação (versão) ──────────────────────────────
CREATE TABLE app_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  versao_atual VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Log de Auditoria do Admin ───────────────────────────────
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  acao VARCHAR(100) NOT NULL,
  entidade_afetada VARCHAR(50),
  entidade_id UUID,
  detalhes JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aal_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_aal_criado ON admin_audit_log(criado_em DESC);

-- ─── Amizades ────────────────────────────────────────────────
CREATE TABLE amizades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_solicitante UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_destinatario UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status amizade_status DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  respondido_em TIMESTAMPTZ,
  UNIQUE(user_id_solicitante, user_id_destinatario)
);

CREATE INDEX idx_amiz_solicitante ON amizades(user_id_solicitante);
CREATE INDEX idx_amiz_destinatario ON amizades(user_id_destinatario);

-- ─── Conversas (Chat entre Amigos) ───────────────────────────
CREATE TABLE conversas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amizade_id UUID NOT NULL REFERENCES amizades(id) ON DELETE CASCADE,
  user_id_a UUID NOT NULL REFERENCES users(id),
  user_id_b UUID NOT NULL REFERENCES users(id),
  criada_em TIMESTAMPTZ DEFAULT NOW(),
  ultima_mensagem_em TIMESTAMPTZ
);

CREATE INDEX idx_conv_users ON conversas(user_id_a, user_id_b);

-- ─── Mensagens do Chat ───────────────────────────────────────
CREATE TABLE mensagem_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversa_id UUID NOT NULL REFERENCES conversas(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES users(id),
  tipo mensagem_chat_tipo DEFAULT 'texto',
  conteudo_texto TEXT,
  midia_url TEXT,
  duracao_segundos INTEGER,
  enviado_em TIMESTAMPTZ DEFAULT NOW(),
  lida BOOLEAN DEFAULT FALSE,
  sinalizada_para_revisao BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_mc_conversa ON mensagem_chat(conversa_id, enviado_em);
CREATE INDEX idx_mc_sinalizada ON mensagem_chat(sinalizada_para_revisao) WHERE sinalizada_para_revisao = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- FUNÇÕES AUXILIARES
-- ═══════════════════════════════════════════════════════════════

-- Atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tickets
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
