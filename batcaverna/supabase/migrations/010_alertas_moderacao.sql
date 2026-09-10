-- ============================================================================
-- BatCaverna — Alertas de moderação do chat (versão 2.3.0)
-- ============================================================================
-- O que existia: a coluna `sinalizada_para_revisao`, ligada por um
-- `texto.includes(palavrão)` com 12 termos, e uma aba no painel que listava
-- as 50 conversas MAIS RECENTES.
--
-- Três consequências práticas disso:
--
--   1. Uma conversa com ameaça de três meses atrás ficava enterrada na
--      página 51 — a ordenação por recência é exatamente o contrário do que
--      uma fila de moderação precisa.
--   2. O admin só descobria olhando. Não havia aviso nenhum.
--   3. Tudo tinha o mesmo peso: "que prova do caralho" e "vou te pegar na
--      saída" acendiam a mesma luz vermelha.
--
-- Esta migration dá à mensagem sinalizada a informação que faltava para
-- priorizar (gravidade, categoria, o que casou) e para fechar o ciclo (quem
-- revisou e quando). O alerta em si é gravado em `notificacoes`, para cair
-- na mesma caixa que o admin já abre.
--
-- Idempotente: rodar de novo não duplica nada.
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════
-- 1. Tipo de notificação
-- ════════════════════════════════════════════════════════════════════
-- ATENÇÃO: no Postgres, ALTER TYPE ... ADD VALUE não pode rodar dentro de um
-- bloco de transação junto com o uso desse mesmo valor. Por isso ele vem
-- sozinho aqui no topo, antes de qualquer BEGIN. Se o SQL Editor reclamar,
-- rode esta linha isolada primeiro e depois o resto do arquivo.

ALTER TYPE notificacao_tipo ADD VALUE IF NOT EXISTS 'moderacao';


-- ════════════════════════════════════════════════════════════════════
-- 2. Colunas da mensagem sinalizada
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE mensagem_chat
  ADD COLUMN IF NOT EXISTS gravidade_moderacao TEXT,
  ADD COLUMN IF NOT EXISTS categorias_moderacao TEXT[],
  ADD COLUMN IF NOT EXISTS termos_detectados TEXT[],
  ADD COLUMN IF NOT EXISTS revisada_em TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revisada_por UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS decisao_moderacao TEXT;

-- Sem restringir os valores, um erro de digitação no código viraria uma
-- gravidade nova que a ordenação do painel ignora em silêncio.
ALTER TABLE mensagem_chat
  DROP CONSTRAINT IF EXISTS mensagem_chat_gravidade_valida;
ALTER TABLE mensagem_chat
  ADD CONSTRAINT mensagem_chat_gravidade_valida
    CHECK (gravidade_moderacao IS NULL
           OR gravidade_moderacao IN ('critica', 'alta', 'media', 'baixa'));

ALTER TABLE mensagem_chat
  DROP CONSTRAINT IF EXISTS mensagem_chat_decisao_valida;
ALTER TABLE mensagem_chat
  ADD CONSTRAINT mensagem_chat_decisao_valida
    CHECK (decisao_moderacao IS NULL
           OR decisao_moderacao IN ('sem_problema', 'advertido', 'suspenso', 'em_apuracao'));

COMMENT ON COLUMN mensagem_chat.gravidade_moderacao IS
  'critica | alta | media | baixa. Definida por lib/moderacao.ts no momento '
  'do envio. É por ela que a fila do painel ordena.';
COMMENT ON COLUMN mensagem_chat.decisao_moderacao IS
  'O que o admin concluiu. NULL = ainda não revisada. Fechar o ciclo importa: '
  'sem isso a fila só cresce e a mesma mensagem é reavaliada toda semana.';

-- A fila do painel: pendentes primeiro, mais graves no topo. O índice
-- parcial só cobre o que interessa — mensagem limpa não entra nele.
CREATE INDEX IF NOT EXISTS idx_mensagem_moderacao_fila
  ON mensagem_chat(gravidade_moderacao, enviado_em DESC)
  WHERE sinalizada_para_revisao = TRUE AND revisada_em IS NULL;


-- ════════════════════════════════════════════════════════════════════
-- 3. Visão da fila de moderação
-- ════════════════════════════════════════════════════════════════════
-- Responde exatamente as três perguntas do moderador: QUEM escreveu, O QUE
-- escreveu e PARA QUEM. Antes era preciso abrir conversa por conversa.
--
-- REVOKE no fim: a view roda com o privilégio de quem a criou e, portanto,
-- fura o RLS. Se ficasse legível pela chave anônima, ela entregaria o
-- conteúdo das conversas privadas — o oposto do que esta migration quer.

CREATE OR REPLACE VIEW moderacao_fila AS
SELECT
  m.id                       AS mensagem_id,
  m.conversa_id,
  m.enviado_em,
  m.tipo,
  m.conteudo_texto,
  m.midia_url IS NOT NULL    AS tem_midia,
  m.gravidade_moderacao,
  m.categorias_moderacao,
  m.termos_detectados,
  m.revisada_em,
  m.decisao_moderacao,
  autor.id                   AS autor_id,
  autor.apelido              AS autor_apelido,
  autor.nome                 AS autor_nome,
  autor.email                AS autor_email,
  autor.ativo                AS autor_ativo,
  -- O destinatário é o outro lado da conversa: o chat é sempre 1 para 1.
  destino.id                 AS destinatario_id,
  destino.apelido            AS destinatario_apelido,
  destino.nome               AS destinatario_nome,
  -- Reincidência: quantas outras mensagens sinalizadas este autor tem.
  -- É o número que separa um escorregão de um padrão.
  (SELECT COUNT(*) FROM mensagem_chat o
    WHERE o.autor_id = m.autor_id AND o.sinalizada_para_revisao) AS total_do_autor
FROM mensagem_chat m
JOIN conversas c   ON c.id = m.conversa_id
JOIN users autor   ON autor.id = m.autor_id
JOIN users destino ON destino.id = CASE
                        WHEN c.user_id_a = m.autor_id THEN c.user_id_b
                        ELSE c.user_id_a
                      END
WHERE m.sinalizada_para_revisao = TRUE;

REVOKE ALL ON moderacao_fila FROM anon, authenticated;

COMMENT ON VIEW moderacao_fila IS
  'Fila de moderação: quem escreveu, o que escreveu, para quem, e quantas '
  'outras sinalizações o autor já tem. Só a chave de serviço lê — as rotas '
  '/api/admin conferem o cargo antes de consultar.';


-- ════════════════════════════════════════════════════════════════════
-- 4. Concluído
-- ════════════════════════════════════════════════════════════════════
-- A query de conferência foi removida daqui porque chamar enum_range()
-- na mesma transação que ADD VALUE gera o erro Postgres 55P04.

