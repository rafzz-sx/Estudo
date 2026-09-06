-- ============================================================================
-- BatCaverna — Migration 005: Estudo Inteligente
-- ============================================================================
-- Idempotente. Rode DEPOIS da 004.
--
-- Entrega os quatro mecanismos de aprendizagem:
--   1. Repetição espaçada  — a questão errada volta em 1, 3, 7 e 21 dias
--   2. Caderno de erros    — anotações pessoais por questão
--   3. Distratores         — por que CADA alternativa errada atrai
--   4. Cronograma          — plano de estudo até a data da prova
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. REPETIÇÃO ESPAÇADA
-- ════════════════════════════════════════════════════════════════════
-- Curva do esquecimento: reencontrar a informação pouco antes de esquecê-la
-- é o que a fixa. Os intervalos 1/3/7/21 dias são o padrão consagrado.
--
-- Fluxo: errou -> agenda para amanhã (etapa 0). Acertou na revisão ->
-- avança a etapa e afasta a próxima. Errou na revisão -> volta à etapa 0.
-- Concluiu a etapa 3 -> a questão sai do ciclo (considerada aprendida).

CREATE TABLE IF NOT EXISTS revisoes_agendadas (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questao_id     UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  -- 0 = +1 dia · 1 = +3 dias · 2 = +7 dias · 3 = +21 dias
  etapa          SMALLINT NOT NULL DEFAULT 0,
  agendada_para  DATE NOT NULL,
  -- Quantas vezes esta questão já derrubou a pessoa
  total_erros    INTEGER DEFAULT 1,
  total_revisoes INTEGER DEFAULT 0,
  ultima_revisao TIMESTAMPTZ,
  -- FALSE quando a pessoa completou o ciclo (aprendeu) ou arquivou
  ativa          BOOLEAN DEFAULT TRUE,
  aprendida_em   TIMESTAMPTZ,
  criada_em      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, questao_id)
);

CREATE INDEX IF NOT EXISTS idx_revisoes_fila
  ON revisoes_agendadas(user_id, ativa, agendada_para);


-- ════════════════════════════════════════════════════════════════════
-- 2. CADERNO DE ERROS
-- ════════════════════════════════════════════════════════════════════
-- A lista de erros sai de `user_questao_respostas`, que já existe. O que
-- falta é o espaço para a pessoa escrever o próprio raciocínio — que é
-- justamente o que faz o caderno de erros funcionar.

CREATE TABLE IF NOT EXISTS user_questao_notas (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questao_id    UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  anotacao      TEXT,
  -- Marcada pela pessoa como "já entendi, pode sair do caderno"
  resolvida     BOOLEAN DEFAULT FALSE,
  resolvida_em  TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, questao_id)
);

CREATE INDEX IF NOT EXISTS idx_notas_user ON user_questao_notas(user_id, resolvida);


-- ════════════════════════════════════════════════════════════════════
-- 3. EXPLICAÇÃO DAS ALTERNATIVAS ERRADAS (distratores)
-- ════════════════════════════════════════════════════════════════════
-- As bancas repetem famílias de distratores: a alternativa que inverte a
-- relação, a que usa o dado errado da tabela, a que confunde causa com
-- consequência. Entender POR QUE a "B" atrai é o que impede repetir o erro.
--
-- Formato: { "A": {"texto": "...", "armadilha": "inversao"}, ... }

ALTER TABLE questoes
  ADD COLUMN IF NOT EXISTS explicacao_alternativas JSONB;

-- Catálogo dos tipos de armadilha, para a interface nomear o padrão.
CREATE TABLE IF NOT EXISTS tipos_armadilha (
  codigo    VARCHAR(40) PRIMARY KEY,
  nome      VARCHAR(80) NOT NULL,
  descricao TEXT,
  emoji     VARCHAR(8)
);


-- ════════════════════════════════════════════════════════════════════
-- 4. CRONOGRAMA POR EDITAL
-- ════════════════════════════════════════════════════════════════════
-- O peso de cada matéria não é chutado: vem da frequência real dela no
-- banco de questões daquele concurso.

CREATE TABLE IF NOT EXISTS planos_estudo (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concurso_id       UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,
  nome              VARCHAR(120) NOT NULL,
  data_prova        DATE NOT NULL,
  horas_por_semana  INTEGER NOT NULL DEFAULT 10,
  -- 0=domingo .. 6=sábado
  dias_semana       SMALLINT[] DEFAULT ARRAY[1,2,3,4,5]::SMALLINT[],
  ativo             BOOLEAN DEFAULT TRUE,
  criado_em         TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planos_user ON planos_estudo(user_id, ativo);

CREATE TABLE IF NOT EXISTS plano_itens (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plano_id      UUID NOT NULL REFERENCES planos_estudo(id) ON DELETE CASCADE,
  materia_id    UUID REFERENCES materias(id) ON DELETE CASCADE,
  assunto_id    UUID REFERENCES assuntos(id) ON DELETE SET NULL,
  titulo        VARCHAR(200) NOT NULL,
  semana        INTEGER NOT NULL,
  data_alvo     DATE NOT NULL,
  minutos_alvo  INTEGER NOT NULL DEFAULT 60,
  -- Fração do tempo total que esta matéria merece (peso na prova)
  peso          DECIMAL(5,2) DEFAULT 1,
  -- estudar_teoria | resolver_questoes | revisar | simulado
  tipo          VARCHAR(24) DEFAULT 'resolver_questoes',
  concluido     BOOLEAN DEFAULT FALSE,
  concluido_em  TIMESTAMPTZ,
  ordem         INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_plano_itens ON plano_itens(plano_id, semana, ordem);


-- ════════════════════════════════════════════════════════════════════
-- 5. SEEDS
-- ════════════════════════════════════════════════════════════════════

INSERT INTO tipos_armadilha (codigo, nome, descricao, emoji)
SELECT * FROM (VALUES
  ('inversao',       'Inversão da relação',
   'Troca causa por consequência, ou inverte a ordem de uma proporção.', '🔄'),
  ('dado_errado',    'Usa o dado errado',
   'O cálculo está correto, mas partiu de um número que não era o pedido.', '🔢'),
  ('conta_parcial',  'Para no meio da conta',
   'Resultado de uma etapa intermediária, apresentado como resposta final.', '➗'),
  ('generalizacao',  'Generalização indevida',
   'Estende ao todo uma afirmação que o texto fez sobre uma parte.', '🌐'),
  ('fora_do_texto',  'Verdadeiro, mas não está no texto',
   'Afirmação correta no mundo real que o texto não sustenta.', '📄'),
  ('senso_comum',    'Apela ao senso comum',
   'A resposta que "parece certa" antes de ler com atenção.', '💭'),
  ('unidade',        'Erro de unidade',
   'Resposta certa na grandeza errada: cm em vez de cm², minuto em vez de hora.', '📏'),
  ('sinal',          'Troca de sinal',
   'Resultado com o sinal invertido, típico de quem esqueceu a orientação.', '➖'),
  ('termo_parecido', 'Termo parecido',
   'Conceito vizinho que se confunde com o cobrado (média x mediana).', '🔤'),
  ('literal',        'Leitura literal',
   'Interpreta ao pé da letra o que estava em sentido figurado.', '🎭')
) AS v(codigo, nome, descricao, emoji)
WHERE NOT EXISTS (
  SELECT 1 FROM tipos_armadilha t WHERE t.codigo = v.codigo
);


-- ════════════════════════════════════════════════════════════════════
-- 6. BACKFILL: monta o caderno de erros e a fila de revisão do histórico
-- ════════════════════════════════════════════════════════════════════
-- Quem já usava a plataforma não deve começar com as duas telas vazias.
-- Entram as questões erradas cuja ÚLTIMA resposta continua sendo errada.

INSERT INTO revisoes_agendadas (user_id, questao_id, etapa, agendada_para, total_erros)
SELECT
  e.user_id,
  e.questao_id,
  0,
  CURRENT_DATE,
  e.erros
FROM (
  SELECT
    r.user_id,
    r.questao_id,
    COUNT(*) FILTER (WHERE NOT r.correta) AS erros,
    -- Última resposta dada para esta questão
    (ARRAY_AGG(r.correta ORDER BY r.respondido_em DESC))[1] AS ultima_correta
  FROM user_questao_respostas r
  GROUP BY r.user_id, r.questao_id
) e
WHERE e.erros > 0
  AND e.ultima_correta = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM revisoes_agendadas ra
    WHERE ra.user_id = e.user_id AND ra.questao_id = e.questao_id
  );


-- ════════════════════════════════════════════════════════════════════
-- 7. RLS
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS revisoes_agendadas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_questao_notas  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS planos_estudo       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS plano_itens         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tipos_armadilha     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leitura_publica_tipos_armadilha" ON tipos_armadilha;
CREATE POLICY "leitura_publica_tipos_armadilha"
  ON tipos_armadilha FOR SELECT USING (true);

COMMIT;

SELECT
  (SELECT COUNT(*) FROM revisoes_agendadas) AS revisoes_agendadas,
  (SELECT COUNT(*) FROM tipos_armadilha)    AS tipos_armadilha;
