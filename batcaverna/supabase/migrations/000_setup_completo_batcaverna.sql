-- ============================================================
-- BATCAVERNA — SCRIPT MESTRE COMPLETO (100% IDEMPOTENTE)
-- Executa: Schema + Seed Data + Segurança RLS
-- Pode ser executado no SQL Editor do Supabase de uma só vez!
-- ============================================================

-- ─── 1. EXTENSÕES ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. TIPOS ENUM ──────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('user', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE forca_tipo AS ENUM ('aeronautica', 'marinha', 'exercito', 'enem'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nivel_ensino_tipo AS ENUM ('fundamental', 'medio', 'avancado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE nivel_impacto_tipo AS ENUM ('alto', 'util', 'avancado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE dificuldade_tipo AS ENUM ('facil', 'medio', 'dificil'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE progresso_status AS ENUM ('nao_iniciado', 'em_andamento', 'concluido'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE dispositivo_tipo AS ENUM ('web', 'app', 'pwa'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ranking_tipo AS ENUM ('tempo_estudo', 'questoes_respondidas'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ranking_periodo AS ENUM ('semanal', 'mensal', 'geral'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_motivo_tipo AS ENUM ('bugs', 'ideia', 'outros'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_status_tipo AS ENUM ('aberto', 'respondido', 'finalizado'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_msg_role AS ENUM ('usuario', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE banner_tipo AS ENUM ('imagem', 'gif', 'video'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE favorito_tipo AS ENUM ('bizu', 'questao'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notificacao_tipo AS ENUM (
  'xp_ganho', 'subiu_nivel', 'mensagem_motivacional',
  'atualizacao_plataforma', 'resposta_ticket', 'streak',
  'badge_conquistado', 'ranking', 'nova_mensagem_amigo', 'solicitacao_amizade'
); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE amizade_status AS ENUM ('pendente', 'aceita', 'recusada', 'bloqueada'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE mensagem_chat_tipo AS ENUM ('texto', 'audio', 'imagem'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE questao_importada_status AS ENUM ('aceita', 'ignorada_duplicada', 'erro_validacao'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 3. TABELAS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_apelido ON users(apelido);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_em TIMESTAMPTZ NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evt_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_evt_user ON email_verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  dispositivo dispositivo_tipo DEFAULT 'web',
  expira_em TIMESTAMPTZ NOT NULL,
  revogado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_rt_hash ON refresh_tokens(token_hash);

CREATE TABLE IF NOT EXISTS nivel_gamificacao (
  nivel INTEGER PRIMARY KEY,
  titulo VARCHAR(50) NOT NULL,
  xp_minimo_necessario INTEGER NOT NULL,
  icone_url TEXT
);

CREATE TABLE IF NOT EXISTS concursos (
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

CREATE TABLE IF NOT EXISTS materias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao TEXT,
  icone_emoji VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS concurso_materias (
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  peso_na_prova DECIMAL(3,1),
  PRIMARY KEY (concurso_id, materia_id)
);

CREATE TABLE IF NOT EXISTS assuntos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  ordem INTEGER DEFAULT 0,
  resumo_teorico TEXT
);

CREATE INDEX IF NOT EXISTS idx_assuntos_materia ON assuntos(materia_id);

CREATE TABLE IF NOT EXISTS concurso_assuntos (
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
  incluido BOOLEAN DEFAULT TRUE,
  peso_relativo DECIMAL(3,1),
  PRIMARY KEY (concurso_id, assunto_id)
);

CREATE TABLE IF NOT EXISTS bizus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assunto_id UUID NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
  titulo VARCHAR(150) NOT NULL,
  conteudo TEXT NOT NULL,
  nivel_impacto nivel_impacto_tipo DEFAULT 'util',
  exemplo_pratico TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bizus_assunto ON bizus(assunto_id);

CREATE TABLE IF NOT EXISTS questoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurso_id UUID NOT NULL REFERENCES concursos(id),
  materia_id UUID NOT NULL REFERENCES materias(id),
  assunto_id UUID NOT NULL REFERENCES assuntos(id),
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  resposta_correta VARCHAR(2) NOT NULL,
  explicacao TEXT NOT NULL,
  ano INTEGER,
  banca VARCHAR(80),
  dificuldade dificuldade_tipo DEFAULT 'medio',
  bizu_relacionado_id UUID REFERENCES bizus(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questoes_concurso ON questoes(concurso_id);
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes(materia_id);
CREATE INDEX IF NOT EXISTS idx_questoes_assunto ON questoes(assunto_id);
CREATE INDEX IF NOT EXISTS idx_questoes_dificuldade ON questoes(dificuldade);
CREATE INDEX IF NOT EXISTS idx_questoes_ano ON questoes(ano);

CREATE TABLE IF NOT EXISTS user_progresso (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assunto_id UUID NOT NULL REFERENCES assuntos(id) ON DELETE CASCADE,
  status progresso_status DEFAULT 'nao_iniciado',
  percentual DECIMAL(5,2) DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, assunto_id)
);

CREATE TABLE IF NOT EXISTS user_questao_respostas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questao_id UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  resposta_dada VARCHAR(2) NOT NULL,
  correta BOOLEAN NOT NULL,
  tempo_gasto_segundos INTEGER DEFAULT 0,
  combo_no_momento INTEGER DEFAULT 0,
  respondido_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uqr_user ON user_questao_respostas(user_id);
CREATE INDEX IF NOT EXISTS idx_uqr_questao ON user_questao_respostas(questao_id);
CREATE INDEX IF NOT EXISTS idx_uqr_respondido ON user_questao_respostas(respondido_em);

CREATE TABLE IF NOT EXISTS simulados (
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

CREATE INDEX IF NOT EXISTS idx_simulados_user ON simulados(user_id);

CREATE TABLE IF NOT EXISTS favoritos (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo favorito_tipo NOT NULL,
  item_id UUID NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tipo, item_id)
);

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(80) NOT NULL UNIQUE,
  descricao TEXT,
  icone TEXT,
  criterio TEXT
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  conquistado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS study_sessions (
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

CREATE INDEX IF NOT EXISTS idx_ss_user ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ss_iniciada ON study_sessions(iniciada_em);

CREATE TABLE IF NOT EXISTS ranking_cache (
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

CREATE INDEX IF NOT EXISTS idx_rc_posicao ON ranking_cache(tipo, periodo, posicao);

CREATE TABLE IF NOT EXISTS user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ocultar_do_ranking BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_concurso_favoritos (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concurso_id UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, concurso_id)
);

CREATE TABLE IF NOT EXISTS user_categoria_escrita (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  texto VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS tickets (
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

CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE TABLE IF NOT EXISTS ticket_mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  autor_id UUID NOT NULL REFERENCES users(id),
  autor_role ticket_msg_role NOT NULL,
  conteudo TEXT NOT NULL,
  enviado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tm_ticket ON ticket_mensagens(ticket_id);

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo notificacao_tipo NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT,
  dados_extra JSONB,
  lida BOOLEAN DEFAULT FALSE,
  criada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_notif_criada ON notificacoes(criada_em DESC);

CREATE TABLE IF NOT EXISTS questao_importadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hash_conteudo VARCHAR(64) NOT NULL UNIQUE,
  questao_id UUID REFERENCES questoes(id),
  arquivo_origem VARCHAR(255),
  status questao_importada_status NOT NULL,
  motivo_ignorada TEXT,
  importado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS importacao_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  executado_em TIMESTAMPTZ DEFAULT NOW(),
  arquivos_encontrados INTEGER DEFAULT 0,
  questoes_aceitas INTEGER DEFAULT 0,
  questoes_ignoradas_duplicadas INTEGER DEFAULT 0,
  questoes_com_erro INTEGER DEFAULT 0,
  duracao_segundos INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS app_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  versao_atual VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  acao VARCHAR(100) NOT NULL,
  entidade_afetada VARCHAR(50),
  entidade_id UUID,
  detalhes JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aal_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_aal_criado ON admin_audit_log(criado_em DESC);

CREATE TABLE IF NOT EXISTS amizades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id_solicitante UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id_destinatario UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status amizade_status DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  respondido_em TIMESTAMPTZ,
  UNIQUE(user_id_solicitante, user_id_destinatario)
);

CREATE INDEX IF NOT EXISTS idx_amiz_solicitante ON amizades(user_id_solicitante);
CREATE INDEX IF NOT EXISTS idx_amiz_destinatario ON amizades(user_id_destinatario);

CREATE TABLE IF NOT EXISTS conversas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amizade_id UUID NOT NULL REFERENCES amizades(id) ON DELETE CASCADE,
  user_id_a UUID NOT NULL REFERENCES users(id),
  user_id_b UUID NOT NULL REFERENCES users(id),
  criada_em TIMESTAMPTZ DEFAULT NOW(),
  ultima_mensagem_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conv_users ON conversas(user_id_a, user_id_b);

CREATE TABLE IF NOT EXISTS mensagem_chat (
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

CREATE INDEX IF NOT EXISTS idx_mc_conversa ON mensagem_chat(conversa_id, enviado_em);

-- ─── 4. TRIGGERS ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_tickets ON tickets;
CREATE TRIGGER set_timestamp_tickets
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ─── 5. DADOS INICIAIS (SEED DATA) ──────────────────────────

-- Níveis
INSERT INTO nivel_gamificacao (nivel, titulo, xp_minimo_necessario) VALUES
  (1,  'Recruta das Sombras',   0),
  (2,  'Aprendiz da Caverna',   150),
  (3,  'Vigia Noturno',         400),
  (4,  'Rastreador de Pistas',  750),
  (5,  'Predador da Noite',     1200),
  (6,  'Estrategista Sombrio',  1800),
  (7,  'Sombra de Gotham',      2600),
  (8,  'Caçador de Questões',   3600),
  (9,  'Guardião da Caverna',   4900),
  (10, 'Lenda em Ascensão',     6500),
  (11, 'O Implacável',          8500),
  (12, 'Protetor Noturno',      11000),
  (13, 'Lenda da Caverna',      14000),
  (14, 'Cavaleiro de Gotham',   18000),
  (15, 'Rei da Batcaverna',     23000)
ON CONFLICT (nivel) DO UPDATE 
SET titulo = EXCLUDED.titulo, xp_minimo_necessario = EXCLUDED.xp_minimo_necessario;

-- 9 Concursos
INSERT INTO concursos (nome, sigla, descricao, nivel_ensino, forca, frase_curta_card) VALUES
  ('Escola de Especialistas de Aeronáutica', 'EEAR',
   'Formação de sargentos especialistas da FAB. Provas de Português, Matemática e Inglês.',
   'medio', 'aeronautica', 'Sargentos Especialistas · Português, Matemática e Inglês'),

  ('Escola de Sargentos das Armas', 'ESA',
   'Formação de sargentos combatentes do Exército Brasileiro.',
   'medio', 'exercito', 'Praças do Exército · Português, Matemática, História e Geografia'),

  ('Escola de Aprendizes-Marinheiros', 'EAM',
   'Ingresso na Marinha como Praça. Nível fundamental/médio.',
   'fundamental', 'marinha', 'Praças da Marinha · Nível Fundamental/Médio'),

  ('Colégio Naval', 'CN',
   'Ensino médio na Marinha do Brasil. Ingresso pelo 9º ano.',
   'fundamental', 'marinha', '9º ano → Ensino Médio · Marinha do Brasil'),

  ('Escola Preparatória de Cadetes do Ar', 'EPCAR',
   'Ensino médio da Força Aérea Brasileira. Ingresso pelo 9º ano.',
   'fundamental', 'aeronautica', '9º ano → Ensino Médio · Força Aérea Brasileira'),

  ('Escola Preparatória de Cadetes do Exército', 'EsPCEx',
   'Formação de oficiais combatentes do Exército Brasileiro.',
   'medio', 'exercito', 'Oficial do Exército · Todas as disciplinas'),

  ('Escola de Formação de Oficiais da Marinha Mercante', 'EFOMM',
   'Oficial da Marinha Mercante com banca própria.',
   'medio', 'marinha', 'Oficial da Marinha Mercante · Banca própria'),

  ('Instituto Militar de Engenharia', 'IME',
   'Engenharia militar de alto nível. Provas discursivas complexas.',
   'avancado', 'exercito', 'Oficial de Engenharia · Nível avançado'),

  ('Exame Nacional do Ensino Médio', 'ENEM',
   'Exame para ingresso em universidades. 4 áreas + Redação.',
   'medio', 'enem', '4 áreas + Redação · Questões contextualizadas')
ON CONFLICT (sigla) DO NOTHING;

-- Matérias
INSERT INTO materias (nome, descricao, icone_emoji) VALUES
  ('Português',           'Gramática, interpretação de texto, redação',  '📝'),
  ('Matemática',          'Álgebra, geometria, aritmética, funções',     '📐'),
  ('Física',              'Mecânica, termodinâmica, óptica, eletricidade', '⚡'),
  ('Química',             'Química geral, orgânica e inorgânica',        '🧪'),
  ('Biologia',            'Citologia, genética, ecologia, zoologia',     '🧬'),
  ('História do Brasil',  'Colonial, Imperial, República, contemporânea','📜'),
  ('História Geral',      'Antiga, Medieval, Moderna, Contemporânea',    '🌍'),
  ('Geografia do Brasil', 'Física, humana, econômica do Brasil',         '🗺️'),
  ('Geografia Geral',     'Geopolítica, climatologia, cartografia',      '🌐'),
  ('Inglês',              'Gramática, vocabulário, interpretação',        '🇬🇧'),
  ('Literatura',          'Escolas literárias, autores, obras',          '📖'),
  ('Redação',             'Dissertação argumentativa, narração',         '✍️'),
  ('Ciências da Natureza','Área integrada ENEM: Física+Química+Bio',     '🔬'),
  ('Ciências Humanas',    'Área integrada ENEM: Hist+Geo+Fil+Soc',      '🏛️'),
  ('Linguagens',          'Área integrada ENEM: Port+Lit+Ing+Artes',     '🗣️')
ON CONFLICT (nome) DO NOTHING;

-- Concurso ↔ Matérias
INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EEAR' AND m.nome IN ('Português', 'Matemática', 'Inglês')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'ESA' AND m.nome IN ('Português', 'Matemática', 'História do Brasil', 'Geografia do Brasil')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EAM' AND m.nome IN ('Português', 'Matemática', 'Física', 'Inglês')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'CN' AND m.nome IN ('Português', 'Matemática', 'Inglês', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EPCAR' AND m.nome IN ('Português', 'Matemática', 'Inglês', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EsPCEx' AND m.nome IN ('Português', 'Matemática', 'Física', 'Química', 'Inglês', 'História do Brasil', 'Geografia do Brasil', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EFOMM' AND m.nome IN ('Português', 'Matemática', 'Física', 'Inglês', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'IME' AND m.nome IN ('Matemática', 'Física', 'Química', 'Inglês', 'Português', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'ENEM' AND m.nome IN ('Ciências da Natureza', 'Ciências Humanas', 'Linguagens', 'Matemática', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

-- Assuntos
INSERT INTO assuntos (materia_id, nome, ordem)
SELECT m.id, a.nome, a.ordem
FROM materias m
CROSS JOIN (VALUES
  ('Acentuação Gráfica', 1),
  ('Crase', 2),
  ('Concordância Verbal e Nominal', 3),
  ('Regência Verbal e Nominal', 4),
  ('Interpretação de Texto', 5),
  ('Classes de Palavras', 6),
  ('Ortografia', 7),
  ('Pontuação', 8),
  ('Vozes Verbais', 9),
  ('Figuras de Linguagem', 10)
) AS a(nome, ordem)
WHERE m.nome = 'Português'
AND NOT EXISTS (SELECT 1 FROM assuntos sub WHERE sub.materia_id = m.id AND sub.nome = a.nome);

INSERT INTO assuntos (materia_id, nome, ordem)
SELECT m.id, a.nome, a.ordem
FROM materias m
CROSS JOIN (VALUES
  ('Equações do 1º e 2º Grau', 1),
  ('Razão e Proporção', 2),
  ('Porcentagem', 3),
  ('Regra de Três', 4),
  ('Geometria Plana', 5),
  ('Geometria Espacial', 6),
  ('Funções', 7),
  ('Trigonometria', 8),
  ('Progressões (PA e PG)', 9),
  ('Análise Combinatória e Probabilidade', 10)
) AS a(nome, ordem)
WHERE m.nome = 'Matemática'
AND NOT EXISTS (SELECT 1 FROM assuntos sub WHERE sub.materia_id = m.id AND sub.nome = a.nome);

-- Usuário Admin Padrão
INSERT INTO users (
  nome, apelido, email, senha_hash, email_verified, role, xp_total, nivel_atual, streak_dias, maior_combo_pessoal, bio
) VALUES (
  'Administrador BatCaverna',
  'AdminCaverna',
  'raf4biel.venafro@gmail.com',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  TRUE,
  'admin',
  25000,
  15,
  30,
  50,
  'Comandante Chefe da BatCaverna. Central de Operações de Concursos Militares.'
) ON CONFLICT (email) DO NOTHING;

-- Questões Exemplo
INSERT INTO questoes (
  concurso_id, materia_id, assunto_id, enunciado, alternativas, resposta_correta, explicacao, ano, banca, dificuldade
)
SELECT
  c.id, m.id, a.id,
  'Assinale a alternativa em que o uso do acento indicativo de crase é OBRIGATÓRIO:',
  '[{"letra": "A", "texto": "Fui a pé até a escola."}, {"letra": "B", "texto": "Entreguei o relatório à capitã."}, {"letra": "C", "texto": "Ele começou a falar sem parar."}, {"letra": "D", "texto": "Dirigi-me a ela com respeito."}]'::jsonb,
  'B',
  'A alternativa B está correta porque o verbo "entregar" rege a preposição "a" e "capitã" admite o artigo feminino "a", resultando em crase (à capitã). As demais são proibições: A (palavra masculina), C (antes de verbo), D (antes de pronome pessoal).',
  2023, 'Aeronáutica', 'medio'
FROM concursos c, materias m, assuntos a
WHERE c.sigla = 'EEAR' AND m.nome = 'Português' AND a.nome = 'Crase'
AND NOT EXISTS (SELECT 1 FROM questoes q WHERE q.concurso_id = c.id AND q.enunciado LIKE 'Assinale a alternativa em que o uso do acento indicativo de crase%');

INSERT INTO questoes (
  concurso_id, materia_id, assunto_id, enunciado, alternativas, resposta_correta, explicacao, ano, banca, dificuldade
)
SELECT
  c.id, m.id, a.id,
  'Na equação do segundo grau 3x² - 12x + 9 = 0, a soma das raízes é igual a:',
  '[{"letra": "A", "texto": "2"}, {"letra": "B", "texto": "3"}, {"letra": "C", "texto": "4"}, {"letra": "D", "texto": "12"}]'::jsonb,
  'C',
  'Pela relação de Girard, a soma das raízes de ax² + bx + c = 0 é dada por S = -b/a. Logo, S = -(-12)/3 = 12/3 = 4.',
  2023, 'Exército', 'facil'
FROM concursos c, materias m, assuntos a
WHERE c.sigla = 'ESA' AND m.nome = 'Matemática' AND a.nome = 'Equações do 1º e 2º Grau'
AND NOT EXISTS (SELECT 1 FROM questoes q WHERE q.concurso_id = c.id AND q.enunciado LIKE 'Na equação do segundo grau 3x² - 12x + 9 = 0%');

-- ─── 6. ATIVAÇÃO DE RLS EM TODAS AS TABELAS ─────────────────
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

-- Políticas de Leitura Pública
DROP POLICY IF EXISTS "Permitir leitura publica de nivel_gamificacao" ON nivel_gamificacao;
CREATE POLICY "Permitir leitura publica de nivel_gamificacao" ON nivel_gamificacao FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de concursos" ON concursos;
CREATE POLICY "Permitir leitura publica de concursos" ON concursos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de materias" ON materias;
CREATE POLICY "Permitir leitura publica de materias" ON materias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de concurso_materias" ON concurso_materias;
CREATE POLICY "Permitir leitura publica de concurso_materias" ON concurso_materias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de assuntos" ON assuntos;
CREATE POLICY "Permitir leitura publica de assuntos" ON assuntos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de concurso_assuntos" ON concurso_assuntos;
CREATE POLICY "Permitir leitura publica de concurso_assuntos" ON concurso_assuntos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de bizus" ON bizus;
CREATE POLICY "Permitir leitura publica de bizus" ON bizus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de questoes" ON questoes;
CREATE POLICY "Permitir leitura publica de questoes" ON questoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de badges" ON badges;
CREATE POLICY "Permitir leitura publica de badges" ON badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir leitura publica de app_info" ON app_info;
CREATE POLICY "Permitir leitura publica de app_info" ON app_info FOR SELECT USING (true);
