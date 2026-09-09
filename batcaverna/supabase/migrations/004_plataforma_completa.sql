-- ============================================================================
-- BatCaverna — Migration 004: Plataforma Completa
-- ============================================================================
-- Idempotente. Pode ser executada quantas vezes forem necessárias.
-- Pré-requisito: 000_setup_completo_batcaverna.sql já aplicado.
--
-- O que esta migration entrega:
--   1. Banco de questões de verdade (texto base, figura, resolução passo a passo)
--   2. Correção do bug de XP/combo (combo e contadores persistidos)
--   3. Frases motivacionais e patamares de combo (INSANO / BRUTA / ...)
--   4. Badges com seleção de exibição no mini-perfil
--   5. Avisos globais do admin + notificações apagáveis pelo usuário
--   6. Feedback automático por tempo de uso
--   7. Espaço de música com playlists
--   8. TAF por concurso militar
--   9. Vídeo-aulas e conteúdo teórico
--  10. Estatísticas por matéria (alimenta "o que mais estuda")
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. MATÉRIAS QUE FALTAVAM
-- ════════════════════════════════════════════════════════════════════
-- O banco de questões oficial traz matérias que o seed original não tinha
-- (História e Geografia sem recorte Brasil/Geral, Filosofia, Sociologia...).

INSERT INTO materias (nome, descricao, icone_emoji)
SELECT val.nome, val.descricao, val.icone_emoji
FROM (VALUES
  ('História',        'História do Brasil e Geral',                    '📜'),
  ('Geografia',       'Geografia física, humana e geopolítica',        '🗺️'),
  ('Filosofia',       'Filosofia antiga, moderna e contemporânea',     '🏛️'),
  ('Sociologia',      'Sociologia clássica e contemporânea',           '👥'),
  ('Artes',           'História da arte, linguagens artísticas',       '🎨'),
  ('Educação Física', 'Corpo, movimento, saúde e esporte',             '🏃'),
  ('Atualidades',     'Temas contemporâneos e tecnologia',             '📰'),
  ('Espanhol',        'Gramática, vocabulário, interpretação',         '🇪🇸'),
  ('Informática',     'Noções de informática e tecnologia',            '💻')
) AS val(nome, descricao, icone_emoji)
WHERE NOT EXISTS (SELECT 1 FROM materias m WHERE m.nome = val.nome);


-- ════════════════════════════════════════════════════════════════════
-- 2. QUESTÕES — estrutura completa
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE questoes
  -- O enunciado costuma vir precedido de um texto de apoio (poema, gráfico,
  -- reportagem). Guardar separado é o que permite a tela exibir
  -- "texto base + enunciado" como o usuário pediu.
  ADD COLUMN IF NOT EXISTS texto_base          TEXT,
  ADD COLUMN IF NOT EXISTS numero_ordem        INTEGER,
  ADD COLUMN IF NOT EXISTS numero_original     VARCHAR(20),
  ADD COLUMN IF NOT EXISTS dia_prova           VARCHAR(24),
  -- ENEM: natureza | humanas | linguagens | matematica
  ADD COLUMN IF NOT EXISTS area_conhecimento   VARCHAR(20),
  -- Descrição textual da figura -> renderizada no "quadro branco" da questão
  ADD COLUMN IF NOT EXISTS figura_descricao    TEXT,
  -- SVG opcional desenhado à mão para questões de geometria
  ADD COLUMN IF NOT EXISTS figura_svg          TEXT,
  -- [{ "titulo": "...", "conteudo": "...", "formula": "..." }, ...]
  ADD COLUMN IF NOT EXISTS resolucao_passos    JSONB,
  -- pendente | automatica | revisada
  ADD COLUMN IF NOT EXISTS resolucao_status    VARCHAR(20) DEFAULT 'pendente',
  -- true para questões de cálculo/dedução, em que só o gabarito não basta
  ADD COLUMN IF NOT EXISTS precisa_resolucao   BOOLEAN DEFAULT FALSE,
  -- Questão anulada pela banca: vira tarja na tela, e não conta como erro
  -- na estatística do aluno.
  ADD COLUMN IF NOT EXISTS anulada             BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hash_conteudo       VARCHAR(64),
  ADD COLUMN IF NOT EXISTS arquivo_origem      VARCHAR(120),
  ADD COLUMN IF NOT EXISTS ativa               BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS vezes_respondida    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vezes_acertada      INTEGER DEFAULT 0;

-- A importação em massa nem sempre traz explicação; deixa de ser obrigatória.
ALTER TABLE questoes ALTER COLUMN explicacao DROP NOT NULL;

-- Deduplicação: mesmo enunciado do mesmo concurso/ano entra uma única vez.
CREATE UNIQUE INDEX IF NOT EXISTS idx_questoes_hash
  ON questoes(hash_conteudo);

CREATE INDEX IF NOT EXISTS idx_questoes_area    ON questoes(area_conhecimento);
CREATE INDEX IF NOT EXISTS idx_questoes_ativa   ON questoes(ativa);
CREATE INDEX IF NOT EXISTS idx_questoes_filtro
  ON questoes(concurso_id, materia_id, ano, dificuldade);
-- Busca textual no enunciado
CREATE INDEX IF NOT EXISTS idx_questoes_busca
  ON questoes USING gin(to_tsvector('portuguese', enunciado));


-- ════════════════════════════════════════════════════════════════════
-- 3. USUÁRIO — combo e contadores persistidos  [BUG CRÍTICO]
-- ════════════════════════════════════════════════════════════════════
-- Antes, o combo vivia só no useState da página: sair da tela zerava a
-- sequência e o XP otimista era sobrescrito pelo valor do banco.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS combo_atual                 INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS combo_atualizado_em         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_questoes_respondidas  INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_acertos               INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tempo_estudo_total_segundos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ultimo_login_em             TIMESTAMPTZ,
  -- Quando a sessão automática expira (o admin precisa ver quanto falta)
  ADD COLUMN IF NOT EXISTS sessao_expira_em            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS maior_streak                INTEGER DEFAULT 0;

-- Reconstrói os contadores a partir do histórico já existente, para que
-- nenhum usuário perca o que já respondeu antes desta migration.
UPDATE users u SET
  total_questoes_respondidas = COALESCE(r.total, 0),
  total_acertos              = COALESCE(r.acertos, 0)
FROM (
  SELECT user_id,
         COUNT(*)                                  AS total,
         COUNT(*) FILTER (WHERE correta)           AS acertos
  FROM user_questao_respostas
  GROUP BY user_id
) r
WHERE r.user_id = u.id;

UPDATE users u SET tempo_estudo_total_segundos = COALESCE(s.total, 0)
FROM (
  SELECT user_id, SUM(duracao_segundos) AS total
  FROM study_sessions GROUP BY user_id
) s
WHERE s.user_id = u.id;


-- ════════════════════════════════════════════════════════════════════
-- 4. ESTATÍSTICAS POR MATÉRIA
-- ════════════════════════════════════════════════════════════════════
-- Alimenta o "o que mais estuda" do mini-perfil e o card de estatísticas
-- por concurso.

CREATE TABLE IF NOT EXISTS user_materia_stats (
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  materia_id           UUID NOT NULL REFERENCES materias(id) ON DELETE CASCADE,
  concurso_id          UUID REFERENCES concursos(id) ON DELETE CASCADE,
  questoes_respondidas INTEGER DEFAULT 0,
  acertos              INTEGER DEFAULT 0,
  tempo_segundos       INTEGER DEFAULT 0,
  atualizado_em        TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, materia_id, concurso_id)
);

CREATE INDEX IF NOT EXISTS idx_ums_user ON user_materia_stats(user_id);


-- ════════════════════════════════════════════════════════════════════
-- 5. FRASES MOTIVACIONAIS
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS frases_motivacionais (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  texto     TEXT NOT NULL UNIQUE,
  -- erro | acerto | combo_quebrado | retorno | marco
  categoria VARCHAR(20) NOT NULL DEFAULT 'erro',
  ativa     BOOLEAN DEFAULT TRUE,
  criada_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frases_cat ON frases_motivacionais(categoria, ativa);


-- ════════════════════════════════════════════════════════════════════
-- 6. PATAMARES DE COMBO  (COMBO / INSANO / BRUTA / ...)
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS combo_patamares (
  id           SERIAL PRIMARY KEY,
  minimo       INTEGER NOT NULL UNIQUE,   -- combo a partir do qual vale
  rotulo       VARCHAR(24) NOT NULL,      -- COMBO, INSANO, BRUTA, ...
  cor_hex      VARCHAR(9) NOT NULL,
  emoji        VARCHAR(8),
  multiplicador_bonus DECIMAL(3,2) DEFAULT 1.0
);


-- ════════════════════════════════════════════════════════════════════
-- 7. BADGES — exibição escolhida pelo usuário
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE badges
  ADD COLUMN IF NOT EXISTS cor_hex     VARCHAR(9) DEFAULT '#F5C518',
  ADD COLUMN IF NOT EXISTS raridade    VARCHAR(16) DEFAULT 'comum', -- comum|rara|epica|lendaria
  ADD COLUMN IF NOT EXISTS criterio_tipo  VARCHAR(32),  -- xp|combo|questoes|streak|tempo|manual
  ADD COLUMN IF NOT EXISTS criterio_valor INTEGER;

ALTER TABLE user_badges
  ADD COLUMN IF NOT EXISTS exibir_no_perfil BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ordem_exibicao   INTEGER DEFAULT 0;


-- ════════════════════════════════════════════════════════════════════
-- 8. NOTIFICAÇÕES E AVISOS GLOBAIS DO ADMIN
-- ════════════════════════════════════════════════════════════════════

-- O usuário comum precisa poder limpar a caixa de notificações.
ALTER TABLE notificacoes
  ADD COLUMN IF NOT EXISTS arquivada  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expira_em  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS aviso_id   UUID;

CREATE TABLE IF NOT EXISTS avisos_globais (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo             VARCHAR(200) NOT NULL,
  mensagem           TEXT NOT NULL,
  -- info | alerta | sucesso | manutencao | atualizacao
  tipo               VARCHAR(20) DEFAULT 'info',
  criado_por_admin_id UUID REFERENCES users(id),
  criado_em          TIMESTAMPTZ DEFAULT NOW(),
  -- O admin escolhe quanto tempo o aviso permanece na caixa
  expira_em          TIMESTAMPTZ,
  ativo              BOOLEAN DEFAULT TRUE,
  total_destinatarios INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_avisos_ativo ON avisos_globais(ativo, expira_em);


-- ════════════════════════════════════════════════════════════════════
-- 9. FEEDBACK POR TEMPO DE USO
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_tempo_uso (
  user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  segundos_totais     INTEGER DEFAULT 0,
  -- Último marco (em horas) em que o convite de feedback já foi mostrado
  ultimo_marco_horas  INTEGER DEFAULT 0,
  nunca_mais          BOOLEAN DEFAULT FALSE,
  adiado_ate          TIMESTAMPTZ,
  atualizado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_plataforma (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- opiniao | bug | ideia
  tipo         VARCHAR(20) NOT NULL DEFAULT 'opiniao',
  nota         INTEGER CHECK (nota IS NULL OR (nota BETWEEN 1 AND 5)),
  mensagem     TEXT NOT NULL,
  marco_horas  INTEGER,
  lido_por_admin BOOLEAN DEFAULT FALSE,
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_criado ON feedback_plataforma(criado_em DESC);


-- ════════════════════════════════════════════════════════════════════
-- 10. ESPAÇO DE MÚSICA
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS musicas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo           VARCHAR(200) NOT NULL,
  artista          VARCHAR(200),
  album            VARCHAR(200),
  capa_url         TEXT,
  audio_url        TEXT NOT NULL,
  duracao_segundos INTEGER DEFAULT 0,
  -- Cores extraídas da capa: alimentam o Dynamic Island
  cor_primaria     VARCHAR(9) DEFAULT '#F5C518',
  cor_secundaria   VARCHAR(9) DEFAULT '#0B0B0F',
  -- local | archive | jamendo | url
  fonte            VARCHAR(24) DEFAULT 'local',
  fonte_id         VARCHAR(120),
  genero           VARCHAR(60),
  ativa            BOOLEAN DEFAULT TRUE,
  criado_em        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_musicas_busca
  ON musicas USING gin(to_tsvector('portuguese', titulo || ' ' || COALESCE(artista, '')));

CREATE TABLE IF NOT EXISTS playlists (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nome       VARCHAR(80) NOT NULL,
  descricao  VARCHAR(200),
  capa_url   TEXT,
  criada_em  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);

CREATE TABLE IF NOT EXISTS playlist_itens (
  playlist_id  UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  musica_id    UUID NOT NULL REFERENCES musicas(id) ON DELETE CASCADE,
  ordem        INTEGER DEFAULT 0,
  adicionado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (playlist_id, musica_id)
);

CREATE TABLE IF NOT EXISTS user_musicas_favoritas (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  musica_id  UUID NOT NULL REFERENCES musicas(id) ON DELETE CASCADE,
  criado_em  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, musica_id)
);


-- ════════════════════════════════════════════════════════════════════
-- 11. TAF — Teste de Aptidão Física por concurso
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS taf_provas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurso_id       UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  -- masculino | feminino | ambos
  sexo              VARCHAR(12) NOT NULL DEFAULT 'ambos',
  exercicio         VARCHAR(80) NOT NULL,
  unidade           VARCHAR(24) NOT NULL,   -- repetições, metros, segundos...
  minimo_aprovacao  VARCHAR(40) NOT NULL,
  faixa_etaria      VARCHAR(40),
  observacao        TEXT,
  ordem             INTEGER DEFAULT 0,
  ano_edital        INTEGER,
  fonte_edital      TEXT
);

CREATE INDEX IF NOT EXISTS idx_taf_concurso ON taf_provas(concurso_id, sexo, ordem);


-- ════════════════════════════════════════════════════════════════════
-- 12. VÍDEO-AULAS E TEORIA
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS videoaulas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id       UUID REFERENCES materias(id) ON DELETE CASCADE,
  assunto_id       UUID REFERENCES assuntos(id) ON DELETE CASCADE,
  concurso_id      UUID REFERENCES concursos(id) ON DELETE CASCADE,
  -- Mesmo agrupamento por tema usado em `teoria_conteudo`.
  tema             VARCHAR(120),
  titulo           VARCHAR(200) NOT NULL,
  descricao        TEXT,
  provedor         VARCHAR(20) DEFAULT 'youtube',
  -- ID do vídeo, para embutir no player interno (sem sair da plataforma)
  video_id         VARCHAR(60) NOT NULL,
  canal            VARCHAR(120),
  duracao_segundos INTEGER,
  ordem            INTEGER DEFAULT 0,
  ativa            BOOLEAN DEFAULT TRUE,
  criado_em        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videoaulas_assunto ON videoaulas(assunto_id, ordem);
CREATE INDEX IF NOT EXISTS idx_videoaulas_materia ON videoaulas(materia_id, ordem);

-- O banco de questões traz ~1.800 nomes de assunto diferentes (cada banca
-- descreve o mesmo conteúdo à sua maneira). Amarrar a teoria a `assunto_id`
-- exigiria 1.800 textos. Por isso a teoria é organizada por TEMA canônico
-- dentro de uma matéria — "Geometria Plana", "Crase", "Cinemática" — e o
-- `assunto_id` fica opcional, para quando quisermos um texto sob medida.
CREATE TABLE IF NOT EXISTS teoria_conteudo (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id        UUID REFERENCES materias(id) ON DELETE CASCADE,
  assunto_id        UUID REFERENCES assuntos(id) ON DELETE CASCADE,
  concurso_id       UUID REFERENCES concursos(id) ON DELETE CASCADE,
  tema              VARCHAR(120) NOT NULL,
  titulo            VARCHAR(200) NOT NULL,
  resumo            VARCHAR(400),
  corpo_markdown    TEXT NOT NULL,
  nivel             VARCHAR(20) DEFAULT 'base',  -- base | aprofundado
  tempo_leitura_min INTEGER DEFAULT 5,
  ordem             INTEGER DEFAULT 0,
  atualizado_em     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (materia_id, tema, nivel)
);

CREATE INDEX IF NOT EXISTS idx_teoria_materia ON teoria_conteudo(materia_id, ordem);
CREATE INDEX IF NOT EXISTS idx_teoria_assunto ON teoria_conteudo(assunto_id, ordem);

-- Progresso do aluno na teoria e nas vídeo-aulas
CREATE TABLE IF NOT EXISTS user_teoria_progresso (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teoria_id    UUID NOT NULL REFERENCES teoria_conteudo(id) ON DELETE CASCADE,
  concluido    BOOLEAN DEFAULT FALSE,
  visto_em     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, teoria_id)
);


-- ════════════════════════════════════════════════════════════════════
-- 13. CONCURSOS — metadados de edital
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE concursos
  ADD COLUMN IF NOT EXISTS emoji             VARCHAR(8),
  ADD COLUMN IF NOT EXISTS cor_tema          VARCHAR(9),
  ADD COLUMN IF NOT EXISTS tem_taf           BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS edital_ano        INTEGER,
  ADD COLUMN IF NOT EXISTS edital_url        TEXT,
  ADD COLUMN IF NOT EXISTS orgao             VARCHAR(120),
  ADD COLUMN IF NOT EXISTS requisitos        TEXT,
  ADD COLUMN IF NOT EXISTS etapas            TEXT,
  ADD COLUMN IF NOT EXISTS escolaridade      VARCHAR(120),
  ADD COLUMN IF NOT EXISTS faixa_etaria      VARCHAR(60),
  ADD COLUMN IF NOT EXISTS duracao_curso     VARCHAR(60),
  ADD COLUMN IF NOT EXISTS ordem_exibicao    INTEGER DEFAULT 0;


-- ════════════════════════════════════════════════════════════════════
-- 14. SIMULADOS — modos rápido e por concurso
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE simulados
  -- rapido | completo | personalizado | materia
  ADD COLUMN IF NOT EXISTS tipo             VARCHAR(20) DEFAULT 'personalizado',
  ADD COLUMN IF NOT EXISTS materia_id       UUID REFERENCES materias(id),
  ADD COLUMN IF NOT EXISTS duracao_minutos  INTEGER,
  ADD COLUMN IF NOT EXISTS tempo_gasto_segundos INTEGER DEFAULT 0,
  -- { "<questao_id>": "B", ... } — respostas do aluno antes da correção
  ADD COLUMN IF NOT EXISTS respostas        JSONB;


-- ════════════════════════════════════════════════════════════════════
-- 15. SEEDS
-- ════════════════════════════════════════════════════════════════════

-- ─── 15.1 Patamares de combo ────────────────────────────────────────
-- Os pisos são "um a mais que o número redondo" de propósito: quem acerta
-- MAIS de 10 seguidas vê "INSANO x11", e quem passa de 20 vê "BRUTA x21".
-- Até 10 acertos o rótulo ainda é COMBO/EM CHAMAS.
--
-- Este DELETE existe porque a versão anterior usava os pisos 10/20/30/...
-- Sem ele, rodar a migration de novo deixaria os dois conjuntos no banco e
-- o aluno veria "INSANO x10" e "INSANO x11" alternando.
DELETE FROM combo_patamares WHERE minimo IN (10, 20, 30, 50, 75, 100);

INSERT INTO combo_patamares (minimo, rotulo, cor_hex, emoji, multiplicador_bonus)
SELECT * FROM (VALUES
  (3,   'COMBO',       '#22C55E', '🔥', 1.05),
  (5,   'EM CHAMAS',   '#F5C518', '🔥', 1.10),
  (11,  'INSANO',      '#F97316', '⚡', 1.20),
  (21,  'BRUTA',       '#EF4444', '💥', 1.30),
  (31,  'LENDÁRIO',    '#A855F7', '👑', 1.40),
  (51,  'IMPARÁVEL',   '#EC4899', '🚀', 1.45),
  (76,  'SOBRENATURAL','#06B6D4', '🌌', 1.48),
  (101, 'DIVINO',      '#FFFFFF', '🦇', 1.50),
  (151, 'MORCEGO-REI', '#F5C518', '👑', 1.55),
  (201, 'IMORTAL',     '#10B981', '☠️', 1.60)
) AS v(minimo, rotulo, cor_hex, emoji, mult)
WHERE NOT EXISTS (SELECT 1 FROM combo_patamares c WHERE c.minimo = v.minimo);


-- ─── 15.2 Frases motivacionais (60 para erro, todas distintas) ──────
INSERT INTO frases_motivacionais (texto, categoria)
SELECT v.texto, v.categoria FROM (VALUES
  ('Errar aqui é de graça. Errar na prova custa a vaga. Bora entender o porquê.', 'erro'),
  ('Essa questão acabou de te ensinar mais do que dez que você acertaria de olhos fechados.', 'erro'),
  ('Ninguém decora a caverna na primeira volta. Você está mapeando o caminho.', 'erro'),
  ('O gabarito não é seu inimigo — é o professor mais paciente que você vai ter.', 'erro'),
  ('Um erro entendido vale mais que três acertos por sorte.', 'erro'),
  ('Aprovado não é quem nunca errou. É quem nunca parou depois de errar.', 'erro'),
  ('Anota essa: o assunto que te derrubou hoje é o que você vai dominar semana que vem.', 'erro'),
  ('A banca te mostrou uma fraqueza. Agradeça e transforme em blindagem.', 'erro'),
  ('Você não perdeu pontos. Você comprou informação.', 'erro'),
  ('Respira. Lê a resolução com calma. O clique vem.', 'erro'),
  ('Sabe qual questão mais faz diferença no seu resultado? Exatamente essa que você errou.', 'erro'),
  ('Todo aprovado tem um caderno cheio de erros. Esse é o seu.', 'erro'),
  ('Se fosse fácil, não valeria uma farda.', 'erro'),
  ('Você está a uma explicação de distância de nunca mais errar isso.', 'erro'),
  ('O erro dói dois minutos. A desistência dói um ano.', 'erro'),
  ('Não existe questão perdida — existe questão ainda não estudada.', 'erro'),
  ('A diferença entre você e a aprovação é a quantidade de erros que você teve coragem de encarar.', 'erro'),
  ('Nenhum morcego enxergou de primeira. Ele aprendeu a ouvir o caminho.', 'erro'),
  ('Marca essa no caderno de erros. É lá que a aprovação é construída.', 'erro'),
  ('Errou? Ótimo. Agora você sabe onde investir seu tempo.', 'erro'),
  ('Prova é sobre repetição inteligente. Você acabou de encontrar o que repetir.', 'erro'),
  ('O que te incomoda agora é exatamente o que vai te destacar depois.', 'erro'),
  ('Cada erro corrigido é um concorrente a menos na sua frente.', 'erro'),
  ('Você não é ruim nessa matéria. Você ainda não foi ensinado direito. Vem cá.', 'erro'),
  ('Persistência não é fazer mais questões. É entender as que você errou.', 'erro'),
  ('Guarde a frustração por 30 segundos. Depois use ela como combustível.', 'erro'),
  ('Quem lê o gabarito com atenção erra menos na próxima. Simples assim.', 'erro'),
  ('Nenhum plano de estudo sobrevive sem erro. O seu está funcionando.', 'erro'),
  ('A prova não avisa qual assunto vai cair. Por isso você treina justo os difíceis.', 'erro'),
  ('Não foi hoje. Mas vai ser — e vai ser porque você não fugiu daqui.', 'erro'),
  ('Sua futura farda está sendo costurada com pontos que você ainda vai acertar.', 'erro'),
  ('Errar em treino é sinal de que o treino está no nível certo.', 'erro'),
  ('Se você só acertasse, não estaria aprendendo nada novo.', 'erro'),
  ('O caminho mais rápido entre você e a vaga passa por essa resolução aí embaixo.', 'erro'),
  ('Anota o porquê, não só a letra. É o porquê que cai de novo.', 'erro'),
  ('Você errou uma questão, não perdeu um sonho.', 'erro'),
  ('Concentração se treina. Paciência também. Continua.', 'erro'),
  ('Amanhã essa questão vai parecer óbvia. Confia no processo.', 'erro'),
  ('A banca repete padrões. Entenda esse e você desarma vários.', 'erro'),
  ('Você está treinando no escuro para brilhar no dia da prova.', 'erro'),
  ('Um passo atrás para dois à frente. Bora pra resolução.', 'erro'),
  ('Erro sem análise é tempo perdido. Erro analisado é vantagem competitiva.', 'erro'),
  ('Ninguém vê seu erro aqui. Todo mundo vai ver sua aprovação lá.', 'erro'),
  ('Essa é daquelas que separa quem estuda de quem só lê. Você está estudando.', 'erro'),
  ('Volte na alternativa que você marcou e descubra a armadilha. É sempre a mesma família.', 'erro'),
  ('Nada de pressa. Entender leva minutos; decorar errado leva meses.', 'erro'),
  ('O placar que importa é o do dia da prova. Aqui é aquecimento.', 'erro'),
  ('Sua meta não é acertar tudo hoje. É não errar isso de novo.', 'erro'),
  ('Firmeza. Quem chega até a resolução já está na frente de quem fechou a aba.', 'erro'),
  ('Transforme esse "poxa" em "agora entendi". É só rolar a tela.', 'erro'),
  ('Questão difícil é elogio: significa que você chegou no nível dela.', 'erro'),
  ('A caverna é escura para todo mundo. Só que você trouxe lanterna.', 'erro'),
  ('Nenhuma aprovação foi linear. A sua também não vai ser.', 'erro'),
  ('Não desconte no seu esforço o preço de uma alternativa.', 'erro'),
  ('Você está construindo repertório. Isso não aparece hoje, aparece na prova.', 'erro'),
  ('Reler o enunciado devagar resolve metade dos erros. Vale o teste.', 'erro'),
  ('A vaga não é de quem acerta mais rápido, é de quem desiste mais devagar.', 'erro'),
  ('Sua evolução é medida em erros compreendidos por semana.', 'erro'),
  ('Bota essa no radar e segue. Uma questão não define seu dia.', 'erro'),
  ('O importante não é o placar de agora. É você ainda estar aqui.', 'erro'),
  -- Acerto
  ('Isso! Repetiu o padrão da banca e derrubou a questão.', 'acerto'),
  ('Boa! Esse tipo de questão já é território seu.', 'acerto'),
  ('Preciso. Continua nesse ritmo.', 'acerto'),
  ('Acertou com técnica, não com sorte. Isso escala.', 'acerto'),
  ('Mais uma que não vai te derrubar no dia da prova.', 'acerto'),
  -- Combo quebrado
  ('A sequência caiu, mas o conhecimento fica. Recomeça a contagem.', 'combo_quebrado'),
  ('Sequência interrompida — não o seu progresso. Bora reconstruir.', 'combo_quebrado'),
  ('Todo combo tem fim. O próximo você faz maior.', 'combo_quebrado'),
  -- Retorno
  ('Bom te ver de volta na caverna. Vamos retomar de onde parou.', 'retorno'),
  ('Consistência vence intensidade. Você voltou — isso já conta.', 'retorno')
) AS v(texto, categoria)
WHERE NOT EXISTS (
  SELECT 1 FROM frases_motivacionais f WHERE f.texto = v.texto
);


-- ─── 15.3 Badges ────────────────────────────────────────────────────
INSERT INTO badges (nome, descricao, icone, criterio, cor_hex, raridade, criterio_tipo, criterio_valor)
SELECT v.* FROM (VALUES
  ('Primeiro Voo',      'Respondeu a primeira questão da plataforma',      '🦇', 'Responder 1 questão',        '#94A3B8', 'comum',    'questoes', 1),
  ('Cem Batidas',       'Respondeu 100 questões',                          '💯', 'Responder 100 questões',     '#22C55E', 'comum',    'questoes', 100),
  ('Meio Milhar',       'Respondeu 500 questões',                          '🎯', 'Responder 500 questões',     '#3B82F6', 'rara',     'questoes', 500),
  ('Mil Questões',      'Respondeu 1000 questões',                         '🏆', 'Responder 1000 questões',    '#F5C518', 'epica',    'questoes', 1000),
  ('Combo x10',         'Acertou 10 questões seguidas',                    '⚡', 'Combo de 10',                '#F97316', 'rara',     'combo',    10),
  ('Combo x20',         'Acertou 20 questões seguidas',                    '💥', 'Combo de 20',                '#EF4444', 'epica',    'combo',    20),
  ('Combo x50',         'Acertou 50 questões seguidas',                    '🚀', 'Combo de 50',                '#EC4899', 'lendaria', 'combo',    50),
  ('Semana Cheia',      'Estudou 7 dias seguidos',                         '🔥', 'Streak de 7 dias',           '#F97316', 'comum',    'streak',   7),
  ('Mês de Ferro',      'Estudou 30 dias seguidos',                        '🛡️', 'Streak de 30 dias',          '#A855F7', 'epica',    'streak',   30),
  ('Cem Dias',          'Estudou 100 dias seguidos',                       '👑', 'Streak de 100 dias',         '#FFD700', 'lendaria', 'streak',   100),
  ('Dez Horas',         'Acumulou 10 horas de estudo',                     '⏱️', '10h de estudo',              '#22C55E', 'comum',    'tempo',    36000),
  ('Cem Horas',         'Acumulou 100 horas de estudo',                    '⌛', '100h de estudo',             '#3B82F6', 'rara',     'tempo',    360000),
  ('Maratonista',       'Acumulou 500 horas de estudo',                    '🏃', '500h de estudo',             '#A855F7', 'lendaria', 'tempo',    1800000),
  ('Guardião',          'Alcançou o nível 10',                             '🗝️', 'Nível 10',                   '#F5C518', 'rara',     'xp',       6500),
  ('Rei da Batcaverna', 'Alcançou o nível 15',                             '🦇', 'Nível 15',                   '#FFD700', 'lendaria', 'xp',       23000),
  ('Fundador',          'Esteve entre os primeiros soldados da caverna',   '⭐', 'Concedido manualmente',      '#06B6D4', 'lendaria', 'manual',   NULL)
) AS v(nome, descricao, icone, criterio, cor_hex, raridade, criterio_tipo, criterio_valor)
WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.nome = v.nome);


-- ─── 15.4 Metadados dos concursos (editais mais recentes) ───────────
UPDATE concursos SET emoji='✈️', cor_tema='#3B82F6', tem_taf=TRUE, orgao='Força Aérea Brasileira',
  escolaridade='Ensino Médio completo', faixa_etaria='17 a 24 anos', duracao_curso='2 anos',
  etapas='Prova escrita objetiva · Inspeção de Saúde · Teste de Aptidão Física (TACF) · Validação documental',
  ordem_exibicao=1 WHERE sigla='EEAR';
UPDATE concursos SET emoji='⭐', cor_tema='#22C55E', tem_taf=TRUE, orgao='Exército Brasileiro',
  escolaridade='Ensino Médio completo', faixa_etaria='17 a 24 anos', duracao_curso='1 ano + estágio',
  etapas='Exame Intelectual · Inspeção de Saúde · Exame de Aptidão Física · Revisão médica',
  ordem_exibicao=2 WHERE sigla='ESA';
UPDATE concursos SET emoji='⚓', cor_tema='#0EA5E9', tem_taf=TRUE, orgao='Marinha do Brasil',
  escolaridade='Ensino Fundamental completo', faixa_etaria='18 a 21 anos', duracao_curso='1 ano',
  etapas='Prova escrita objetiva · Inspeção de Saúde · Teste de Suficiência Física · Verificação de dados',
  ordem_exibicao=3 WHERE sigla='EAM';
UPDATE concursos SET emoji='🚢', cor_tema='#0EA5E9', tem_taf=TRUE, orgao='Marinha do Brasil',
  escolaridade='9º ano do Ensino Fundamental', faixa_etaria='15 a 18 anos', duracao_curso='3 anos (Ensino Médio)',
  etapas='Prova escrita objetiva · Redação · Inspeção de Saúde · Teste de Suficiência Física · Verificação de dados',
  ordem_exibicao=4 WHERE sigla='CN';
UPDATE concursos SET emoji='🛩️', cor_tema='#3B82F6', tem_taf=TRUE, orgao='Força Aérea Brasileira',
  escolaridade='9º ano do Ensino Fundamental', faixa_etaria='14 a 16 anos', duracao_curso='3 anos (Ensino Médio)',
  etapas='Exame de Admissão · Redação · Inspeção de Saúde · Teste de Avaliação do Condicionamento Físico',
  ordem_exibicao=5 WHERE sigla='EPCAR';
UPDATE concursos SET emoji='🎖️', cor_tema='#22C55E', tem_taf=TRUE, orgao='Exército Brasileiro',
  escolaridade='Ensino Médio completo', faixa_etaria='17 a 22 anos', duracao_curso='5 anos (AMAN)',
  etapas='Exame Intelectual · Inspeção de Saúde · Exame de Aptidão Física · Avaliação psicológica',
  ordem_exibicao=6 WHERE sigla='EsPCEx';
UPDATE concursos SET emoji='🌊', cor_tema='#0EA5E9', tem_taf=TRUE, orgao='Marinha do Brasil / Ensino Profissional Marítimo',
  escolaridade='Ensino Médio completo', faixa_etaria='18 a 25 anos', duracao_curso='4 anos',
  etapas='Prova escrita objetiva · Inspeção de Saúde · Teste de Suficiência Física · Verificação de dados',
  ordem_exibicao=7 WHERE sigla='EFOMM';
UPDATE concursos SET emoji='🔬', cor_tema='#22C55E', tem_taf=TRUE, orgao='Exército Brasileiro',
  escolaridade='Ensino Médio completo', faixa_etaria='16 a 22 anos', duracao_curso='5 anos',
  etapas='Exame de Escolaridade (2 fases) · Inspeção de Saúde · Exame de Aptidão Física',
  ordem_exibicao=8 WHERE sigla='IME';
UPDATE concursos SET emoji='📚', cor_tema='#F59E0B', tem_taf=FALSE, orgao='INEP / Ministério da Educação',
  escolaridade='Ensino Médio', faixa_etaria='Sem restrição', duracao_curso='—',
  etapas='1º dia: Linguagens, Humanas e Redação · 2º dia: Natureza e Matemática',
  ordem_exibicao=9 WHERE sigla='ENEM';


-- ─── 15.5 TAF por concurso ──────────────────────────────────────────
-- Índices mínimos de aprovação. Confira sempre o edital vigente: as bancas
-- ajustam marcas de um ano para o outro.
INSERT INTO taf_provas (concurso_id, sexo, exercicio, unidade, minimo_aprovacao, faixa_etaria, ordem, ano_edital, observacao)
SELECT c.id, v.sexo, v.exercicio, v.unidade, v.minimo, v.faixa, v.ordem, v.ano, v.obs
FROM concursos c
JOIN (VALUES
  -- EEAR (TACF)
  ('EEAR','masculino','Corrida de 12 minutos','metros','2.100 m','17 a 24 anos',1,2025,'Teste de Avaliação do Condicionamento Físico'),
  ('EEAR','masculino','Flexão de braço na barra fixa','repetições','4 repetições','17 a 24 anos',2,2025,'Pegada pronada, sem impulso'),
  ('EEAR','masculino','Abdominal tipo remador','repetições','35 em 1 min','17 a 24 anos',3,2025,NULL),
  ('EEAR','feminino','Corrida de 12 minutos','metros','1.700 m','17 a 24 anos',1,2025,NULL),
  ('EEAR','feminino','Apoio de frente sobre o solo','repetições','12 repetições','17 a 24 anos',2,2025,'Modalidade adaptada'),
  ('EEAR','feminino','Abdominal tipo remador','repetições','30 em 1 min','17 a 24 anos',3,2025,NULL),
  -- ESA
  ('ESA','masculino','Corrida de 12 minutos','metros','2.100 m','17 a 24 anos',1,2025,NULL),
  ('ESA','masculino','Flexão na barra fixa','repetições','4 repetições','17 a 24 anos',2,2025,NULL),
  ('ESA','masculino','Flexão de braço no solo','repetições','20 repetições','17 a 24 anos',3,2025,NULL),
  ('ESA','masculino','Abdominal supra','repetições','35 em 1 min','17 a 24 anos',4,2025,NULL),
  ('ESA','feminino','Corrida de 12 minutos','metros','1.700 m','17 a 24 anos',1,2025,NULL),
  ('ESA','feminino','Barra fixa estática (isometria)','segundos','12 segundos','17 a 24 anos',2,2025,NULL),
  ('ESA','feminino','Flexão de braço no solo','repetições','13 repetições','17 a 24 anos',3,2025,NULL),
  ('ESA','feminino','Abdominal supra','repetições','30 em 1 min','17 a 24 anos',4,2025,NULL),
  -- Colégio Naval (TSF)
  ('CN','masculino','Corrida de 12 minutos','metros','1.800 m','15 a 18 anos',1,2025,'Teste de Suficiência Física'),
  ('CN','masculino','Flexão na barra fixa','repetições','3 repetições','15 a 18 anos',2,2025,NULL),
  ('CN','masculino','Abdominal','repetições','35 em 1 min','15 a 18 anos',3,2025,NULL),
  ('CN','masculino','Natação 50 m (nado livre)','segundos','Concluir o percurso','15 a 18 anos',4,2025,'Eliminatório'),
  ('CN','feminino','Corrida de 12 minutos','metros','1.500 m','15 a 18 anos',1,2025,NULL),
  ('CN','feminino','Barra fixa estática (isometria)','segundos','10 segundos','15 a 18 anos',2,2025,NULL),
  ('CN','feminino','Abdominal','repetições','30 em 1 min','15 a 18 anos',3,2025,NULL),
  ('CN','feminino','Natação 50 m (nado livre)','segundos','Concluir o percurso','15 a 18 anos',4,2025,'Eliminatório'),
  -- EAM
  ('EAM','masculino','Corrida de 12 minutos','metros','1.800 m','18 a 21 anos',1,2025,NULL),
  ('EAM','masculino','Flexão na barra fixa','repetições','3 repetições','18 a 21 anos',2,2025,NULL),
  ('EAM','masculino','Abdominal','repetições','35 em 1 min','18 a 21 anos',3,2025,NULL),
  ('EAM','feminino','Corrida de 12 minutos','metros','1.500 m','18 a 21 anos',1,2025,NULL),
  ('EAM','feminino','Barra fixa estática (isometria)','segundos','10 segundos','18 a 21 anos',2,2025,NULL),
  ('EAM','feminino','Abdominal','repetições','30 em 1 min','18 a 21 anos',3,2025,NULL),
  -- EPCAR (TACF)
  ('EPCAR','masculino','Corrida de 12 minutos','metros','2.000 m','14 a 16 anos',1,2025,NULL),
  ('EPCAR','masculino','Flexão na barra fixa','repetições','3 repetições','14 a 16 anos',2,2025,NULL),
  ('EPCAR','masculino','Abdominal tipo remador','repetições','30 em 1 min','14 a 16 anos',3,2025,NULL),
  ('EPCAR','feminino','Corrida de 12 minutos','metros','1.600 m','14 a 16 anos',1,2025,NULL),
  ('EPCAR','feminino','Apoio de frente sobre o solo','repetições','10 repetições','14 a 16 anos',2,2025,NULL),
  ('EPCAR','feminino','Abdominal tipo remador','repetições','25 em 1 min','14 a 16 anos',3,2025,NULL),
  -- EsPCEx
  ('EsPCEx','masculino','Corrida de 12 minutos','metros','2.400 m','17 a 22 anos',1,2025,NULL),
  ('EsPCEx','masculino','Flexão na barra fixa','repetições','5 repetições','17 a 22 anos',2,2025,NULL),
  ('EsPCEx','masculino','Flexão de braço no solo','repetições','25 repetições','17 a 22 anos',3,2025,NULL),
  ('EsPCEx','masculino','Abdominal supra','repetições','40 em 1 min','17 a 22 anos',4,2025,NULL),
  ('EsPCEx','feminino','Corrida de 12 minutos','metros','1.900 m','17 a 22 anos',1,2025,NULL),
  ('EsPCEx','feminino','Barra fixa estática (isometria)','segundos','15 segundos','17 a 22 anos',2,2025,NULL),
  ('EsPCEx','feminino','Flexão de braço no solo','repetições','15 repetições','17 a 22 anos',3,2025,NULL),
  ('EsPCEx','feminino','Abdominal supra','repetições','35 em 1 min','17 a 22 anos',4,2025,NULL),
  -- EFOMM
  ('EFOMM','masculino','Corrida de 12 minutos','metros','2.000 m','18 a 25 anos',1,2025,NULL),
  ('EFOMM','masculino','Flexão na barra fixa','repetições','4 repetições','18 a 25 anos',2,2025,NULL),
  ('EFOMM','masculino','Abdominal','repetições','35 em 1 min','18 a 25 anos',3,2025,NULL),
  ('EFOMM','masculino','Natação 50 m (nado livre)','segundos','Concluir o percurso','18 a 25 anos',4,2025,'Eliminatório'),
  ('EFOMM','feminino','Corrida de 12 minutos','metros','1.700 m','18 a 25 anos',1,2025,NULL),
  ('EFOMM','feminino','Barra fixa estática (isometria)','segundos','12 segundos','18 a 25 anos',2,2025,NULL),
  ('EFOMM','feminino','Abdominal','repetições','30 em 1 min','18 a 25 anos',3,2025,NULL),
  ('EFOMM','feminino','Natação 50 m (nado livre)','segundos','Concluir o percurso','18 a 25 anos',4,2025,'Eliminatório'),
  -- IME
  ('IME','masculino','Corrida de 12 minutos','metros','2.400 m','16 a 22 anos',1,2025,NULL),
  ('IME','masculino','Flexão na barra fixa','repetições','5 repetições','16 a 22 anos',2,2025,NULL),
  ('IME','masculino','Abdominal supra','repetições','40 em 1 min','16 a 22 anos',3,2025,NULL),
  ('IME','feminino','Corrida de 12 minutos','metros','1.900 m','16 a 22 anos',1,2025,NULL),
  ('IME','feminino','Barra fixa estática (isometria)','segundos','15 segundos','16 a 22 anos',2,2025,NULL),
  ('IME','feminino','Abdominal supra','repetições','35 em 1 min','16 a 22 anos',3,2025,NULL)
) AS v(sigla, sexo, exercicio, unidade, minimo, faixa, ordem, ano, obs)
  ON c.sigla = v.sigla
WHERE NOT EXISTS (
  SELECT 1 FROM taf_provas t
  WHERE t.concurso_id = c.id AND t.sexo = v.sexo AND t.exercicio = v.exercicio
);


-- ─── 15.6 Registro de versão ────────────────────────────────────────
INSERT INTO app_info (versao_atual, atualizado_em)
SELECT '2.0.0', NOW()
WHERE NOT EXISTS (SELECT 1 FROM app_info WHERE versao_atual = '2.0.0');


-- ════════════════════════════════════════════════════════════════════
-- 16. RLS nas tabelas novas
-- ════════════════════════════════════════════════════════════════════
-- Todas as escritas passam pelas API routes com service_role, então o RLS
-- só precisa liberar leitura pública do catálogo e bloquear o resto.

ALTER TABLE IF EXISTS frases_motivacionais  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS combo_patamares       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS avisos_globais        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_tempo_uso        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback_plataforma   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS musicas               ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playlists             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS playlist_itens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_musicas_favoritas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS taf_provas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS videoaulas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teoria_conteudo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_teoria_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_materia_stats    ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'frases_motivacionais','combo_patamares','musicas',
    'taf_provas','videoaulas','teoria_conteudo'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "leitura_publica_%1$s" ON %1$I', t);
    EXECUTE format(
      'CREATE POLICY "leitura_publica_%1$s" ON %1$I FOR SELECT USING (true)', t
    );
  END LOOP;
END $$;

COMMIT;

-- ============================================================================
-- FIM DA MIGRATION 004
-- Próximo passo: rodar os seeds de questões gerados por
--   python scripts/gerar_seed_sql.py
-- ============================================================================
