-- ============================================================================
-- BatCaverna — Módulo de Redação (versão 2.7.0)
-- ============================================================================
-- A maior lacuna da plataforma para ENEM e EsPCEx: a redação vale 1.000 dos
-- pontos no ENEM e é eliminatória em vários concursos militares, e não havia
-- absolutamente nada sobre ela aqui.
--
-- O que este módulo É:
--   • banco de temas reais de provas passadas
--   • a rubrica oficial das 5 competências, com os 6 níveis de cada
--   • autoavaliação guiada: o aluno escreve, depois se corrige competência
--     por competência, com o descritor oficial na frente
--   • histórico: a evolução de cada competência ao longo do tempo
--
-- O que este módulo NÃO É, de propósito:
--   • NÃO corrige a redação automaticamente. Correção de redação exige leitor
--     humano treinado; um número inventado por regra de três seria pior que
--     nenhum número, porque o aluno estudaria para o alvo errado.
--   • NÃO traz "redações nota 1000 de exemplo". Não vou inventar texto e
--     atribuir nota oficial a ele. Se você tiver redações reais com nota
--     divulgada, cadastre-as — a tabela de temas aceita o link da fonte.
--
-- Idempotente. NÃO É DESTRUTIVA: só cria tabelas novas.
-- ============================================================================

BEGIN;

-- ─── Temas de redação ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redacao_temas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurso_id     UUID REFERENCES concursos(id) ON DELETE SET NULL,
  -- O enunciado como caiu na prova.
  titulo          TEXT NOT NULL,
  ano             INTEGER,
  -- 'oficial' = caiu numa prova de verdade; 'proposto' = tema de treino.
  origem          VARCHAR(20) NOT NULL DEFAULT 'oficial',
  -- Textos motivadores, quando existirem. Markdown.
  textos_apoio    TEXT,
  -- Link para a prova original, para o aluno conferir a fonte.
  fonte_url       TEXT,
  observacao      TEXT,
  ativo           BOOLEAN DEFAULT TRUE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redacao_temas_concurso
  ON redacao_temas(concurso_id) WHERE ativo;
CREATE INDEX IF NOT EXISTS idx_redacao_temas_ano
  ON redacao_temas(ano DESC) WHERE ativo;

-- Reimportar o mesmo tema não duplica.
CREATE UNIQUE INDEX IF NOT EXISTS idx_redacao_temas_unico
  ON redacao_temas(lower(titulo), COALESCE(ano, 0));


-- ─── Redações do aluno ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redacoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tema_id         UUID REFERENCES redacao_temas(id) ON DELETE SET NULL,
  -- Guardado para o histórico continuar legível se o tema for removido.
  tema_titulo     TEXT NOT NULL,

  texto           TEXT NOT NULL,
  palavras        INTEGER NOT NULL DEFAULT 0,
  linhas          INTEGER NOT NULL DEFAULT 0,
  tempo_segundos  INTEGER,

  -- Autoavaliação: 0 a 200 por competência, em degraus de 40.
  -- NULL = ainda não avaliada. A nota total é gerada, não digitada.
  c1              SMALLINT,
  c2              SMALLINT,
  c3              SMALLINT,
  c4              SMALLINT,
  c5              SMALLINT,
  nota_total      SMALLINT GENERATED ALWAYS AS (
                    COALESCE(c1,0) + COALESCE(c2,0) + COALESCE(c3,0)
                    + COALESCE(c4,0) + COALESCE(c5,0)
                  ) STORED,
  avaliada_em     TIMESTAMPTZ,

  -- O que o aluno percebeu ao se corrigir. É aqui que o exercício ensina.
  anotacoes       TEXT,

  criado_em       TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redacoes_user
  ON redacoes(user_id, criado_em DESC);

-- Degraus de 40: a rubrica oficial não tem nota intermediária. Sem esta
-- trava, um cliente falando direto com o banco gravaria 137 e o histórico
-- passaria a comparar coisas que não existem.
ALTER TABLE redacoes DROP CONSTRAINT IF EXISTS redacoes_competencias_validas;
ALTER TABLE redacoes
  ADD CONSTRAINT redacoes_competencias_validas CHECK (
    (c1 IS NULL OR (c1 BETWEEN 0 AND 200 AND c1 % 40 = 0)) AND
    (c2 IS NULL OR (c2 BETWEEN 0 AND 200 AND c2 % 40 = 0)) AND
    (c3 IS NULL OR (c3 BETWEEN 0 AND 200 AND c3 % 40 = 0)) AND
    (c4 IS NULL OR (c4 BETWEEN 0 AND 200 AND c4 % 40 = 0)) AND
    (c5 IS NULL OR (c5 BETWEEN 0 AND 200 AND c5 % 40 = 0))
  );

ALTER TABLE redacoes DROP CONSTRAINT IF EXISTS redacoes_texto_tamanho;
ALTER TABLE redacoes
  ADD CONSTRAINT redacoes_texto_tamanho
    CHECK (length(texto) BETWEEN 200 AND 20000);

ALTER TABLE redacao_temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE redacoes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE redacoes IS
  'Redações do aluno com autoavaliação pela rubrica oficial das 5 '
  'competências. A plataforma NÃO corrige automaticamente: a nota é a '
  'autoavaliação guiada, e a tela diz isso.';


-- ════════════════════════════════════════════════════════════════════
-- Temas oficiais de redação do ENEM
-- ════════════════════════════════════════════════════════════════════
-- Registro público das provas aplicadas. `fonte_url` aponta para o portal do
-- INEP, onde a prova de cada ano pode ser conferida.
--
-- >> CONFIRA ANTES DE CONFIAR: eu cadastrei o que consta no registro
--    público das provas, mas não tenho como validar contra a fonte a partir
--    desta máquina. Se algum enunciado estiver diferente do oficial, corrija
--    aqui — o índice único é por (título, ano), então editar não duplica.
--
-- Para acrescentar temas de concursos militares, use o mesmo INSERT com o
-- `concurso_id` correspondente.

INSERT INTO redacao_temas (titulo, ano, origem, fonte_url, concurso_id)
SELECT v.titulo, v.ano, 'oficial', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
       (SELECT id FROM concursos WHERE upper(sigla) = 'ENEM' LIMIT 1)
FROM (VALUES
  ('Desafios para a valorização da herança africana no Brasil', 2024),
  ('Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', 2023),
  ('Desafios para a valorização de comunidades e povos tradicionais no Brasil', 2022),
  ('Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil', 2021),
  ('O estigma associado às doenças mentais na sociedade brasileira', 2020),
  ('Democratização do acesso ao cinema no Brasil', 2019),
  ('Manipulação do comportamento do usuário pelo controle de dados na internet', 2018),
  ('Desafios para a formação educacional de surdos no Brasil', 2017),
  ('Caminhos para combater a intolerância religiosa no Brasil', 2016),
  ('A persistência da violência contra a mulher na sociedade brasileira', 2015)
) AS v(titulo, ano)
ON CONFLICT (lower(titulo), COALESCE(ano, 0)) DO NOTHING;

COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- Conferência
-- ════════════════════════════════════════════════════════════════════

SELECT ano, titulo FROM redacao_temas ORDER BY ano DESC;

SELECT COUNT(*) AS redacoes_escritas FROM redacoes;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('redacoes', 'redacao_temas');
