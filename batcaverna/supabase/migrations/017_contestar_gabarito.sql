-- ============================================================================
-- BatCaverna — Contestação de gabarito (versão 2.8.0)
-- ============================================================================
-- O aluno não tinha como avisar que uma questão está errada. O único
-- "sinalizar" da plataforma é o da moderação do chat.
--
-- Por que isso importa aqui mais do que em outros produtos: as 3.247 questões
-- vieram de extração automática de PDF. A régua de aceitação é boa (34 foram
-- descartadas por não terem como ser respondidas), mas extração de PDF erra —
-- e um gabarito errado é o pior defeito possível numa plataforma de estudo.
-- Questão ausente o aluno não estuda. Gabarito errado ele ESTUDA, e aprende
-- errado, com a confiança de quem conferiu a resposta.
--
-- Já existe um caso concreto esperando conferência: o gabarito do
-- ENEM-2020-DIA2 tem "D" em 38% das 90 questões, muito acima do esperado para
-- uma prova de 5 alternativas. A extração é byte a byte igual ao .txt de
-- origem, então o parser não é o culpado — ou o .txt já veio torto, ou aquela
-- prova realmente teve essa distribuição. Está na ação manual A-4, à espera de
-- alguém abrir o gabarito do INEP.
--
-- Quem resolve a questão com atenção e discorda é o melhor detector de erro
-- que a plataforma tem, e esse sinal estava sendo jogado fora inteiro.
--
-- ─── O que esta tabela NÃO faz ──────────────────────────────────────────────
-- Contestação NÃO altera o gabarito. Nada aqui muda `questoes` sozinho: a
-- contestação abre um caso para um humano decidir. Aluno errar e achar que a
-- prova está errada é o caso comum, não a exceção — se a contestação mudasse
-- a resposta, a plataforma passaria a ensinar o erro da maioria.
--
-- Idempotente. NÃO É DESTRUTIVA: só cria tabela nova.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS questao_contestacoes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  questao_id    UUID NOT NULL REFERENCES questoes(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,

  -- O que o aluno diz que está errado.
  --   'gabarito'     a letra apontada como certa não é a certa
  --   'enunciado'    falta texto, veio truncado, veio embaralhado
  --   'alternativa'  alternativa cortada, repetida ou em branco
  --   'figura'       depende de uma imagem que não dá para reconstruir
  --   'explicacao'   o comentário não bate com o gabarito
  tipo          VARCHAR(20) NOT NULL DEFAULT 'gabarito',

  -- Obrigatório e com tamanho mínimo: "ta errado" não ajuda ninguém a
  -- decidir nada. A régua está na API, o CHECK aqui é a rede.
  motivo        TEXT NOT NULL CHECK (length(btrim(motivo)) >= 15),

  -- Qual letra o aluno defende. Opcional: dá para contestar o enunciado sem
  -- propor outra resposta.
  alternativa_sugerida VARCHAR(2),

  --   'aberta'     ninguém olhou
  --   'procede'    o aluno tinha razão — a questão foi corrigida ou anulada
  --   'improcede'  o gabarito está certo
  --   'duplicada'  outro caso já cobre esta questão
  status        VARCHAR(20) NOT NULL DEFAULT 'aberta',

  -- A resposta do admin volta para o aluno. Contestar e nunca saber no que
  -- deu ensina o aluno a não contestar mais.
  resposta_admin TEXT,

  criado_em     TIMESTAMPTZ DEFAULT NOW(),
  resolvido_em  TIMESTAMPTZ,
  resolvido_por UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_contestacao_tipo
    CHECK (tipo IN ('gabarito', 'enunciado', 'alternativa', 'figura', 'explicacao')),
  CONSTRAINT chk_contestacao_status
    CHECK (status IN ('aberta', 'procede', 'improcede', 'duplicada'))
);

-- Um aluno contesta a mesma questão uma vez. Sem isto, quem insiste pesa mais
-- que quem tem razão, e a fila passa a medir teimosia em vez de erro.
CREATE UNIQUE INDEX IF NOT EXISTS idx_contestacao_unica
  ON questao_contestacoes(questao_id, user_id);

-- A fila do admin: abertas primeiro, mais recentes no topo.
CREATE INDEX IF NOT EXISTS idx_contestacao_fila
  ON questao_contestacoes(status, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_contestacao_questao
  ON questao_contestacoes(questao_id);

CREATE INDEX IF NOT EXISTS idx_contestacao_user
  ON questao_contestacoes(user_id, criado_em DESC);

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Mesmo arranjo do resto da plataforma: a API usa `service_role` e faz a
-- checagem de dono em código. A RLS fecha a porta para a chave anônima, que
-- vai para o navegador.
ALTER TABLE questao_contestacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contestacoes_sem_anon ON questao_contestacoes;
CREATE POLICY contestacoes_sem_anon ON questao_contestacoes
  FOR ALL TO anon USING (false) WITH CHECK (false);

COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- Conferência
-- ════════════════════════════════════════════════════════════════════

-- Tem que voltar 0 na primeira vez.
SELECT COUNT(*) AS contestacoes FROM questao_contestacoes;

-- RLS ligada?
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'questao_contestacoes';

-- A fila, depois que começar a encher: questão com mais gente discordando
-- primeiro. É esta consulta que a rota do admin reproduz.
SELECT q.id,
       c.sigla                        AS concurso,
       q.ano,
       q.numero_original,
       COUNT(*)                       AS contestacoes,
       COUNT(DISTINCT ct.alternativa_sugerida) AS letras_propostas,
       q.resposta_correta             AS gabarito_atual
FROM questao_contestacoes ct
JOIN questoes q  ON q.id = ct.questao_id
LEFT JOIN concursos c ON c.id = q.concurso_id
WHERE ct.status = 'aberta'
GROUP BY q.id, c.sigla, q.ano, q.numero_original, q.resposta_correta
ORDER BY COUNT(*) DESC;
