-- ============================================================================
-- BatCaverna — Escudo de sequência e histórico de simulados (versão 2.4.0)
-- ============================================================================
-- Duas mudanças de produto, nenhuma cosmética.
--
-- 1) ESCUDO DE SEQUÊNCIA
--
-- Hoje um dia perdido zera a sequência inteira. Para um adolescente com
-- escola, prova de colégio e família, isso não gera disciplina: gera
-- abandono. A pessoa perde 40 dias por causa de um domingo e não volta —
-- porque o número que a prendia virou 1.
--
-- O escudo cobre UM dia falho por semana, automaticamente, sem a pessoa
-- precisar saber que ele existe. Sequência de 40 dias sobrevive a um domingo
-- ruim; sequência de 40 dias não sobrevive a uma semana inteira sumido, e
-- isso está certo — a corrente tem que significar alguma coisa.
--
-- 2) HISTÓRICO DE SIMULADOS
--
-- A tabela `simulados` guarda cada prova feita e NADA na plataforma mostra a
-- série. "Sua nota subiu de 42 para 61 em três meses" é o que sustenta um ano
-- de preparação; o resultado de hoje, sozinho, num dia ruim só machuca.
-- Faltavam índice e a marcação de prova abandonada.
--
-- Idempotente.
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. Escudo de sequência
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS escudos_streak        SMALLINT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS escudo_recarregado_em DATE,
  ADD COLUMN IF NOT EXISTS escudos_usados_total  INTEGER  DEFAULT 0;

-- Quem já está na base começa com o escudo cheio: seria estranho estrear a
-- funcionalidade com a pessoa devendo.
UPDATE users
SET escudos_streak = 1,
    escudo_recarregado_em = CURRENT_DATE
WHERE escudos_streak IS NULL OR escudo_recarregado_em IS NULL;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_escudos_faixa;
ALTER TABLE users
  ADD CONSTRAINT users_escudos_faixa
    CHECK (escudos_streak IS NULL OR escudos_streak BETWEEN 0 AND 3);

COMMENT ON COLUMN users.escudos_streak IS
  'Escudos disponíveis para cobrir um dia sem estudar. Recarrega para 1 a '
  'cada 7 dias (lógica em lib/gamificacao.ts). O teto de 3 é uma trava de '
  'segurança: nenhum caminho de código concede mais que 1.';

COMMENT ON COLUMN users.escudo_recarregado_em IS
  'Última recarga. É a data que o cálculo compara para saber se já passou a '
  'semana.';


-- ════════════════════════════════════════════════════════════════════
-- 2. Histórico de simulados
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE simulados
  ADD COLUMN IF NOT EXISTS abandonado BOOLEAN DEFAULT FALSE;

-- Prova criada e nunca entregue polui a série de evolução: o aluno abriu,
-- fechou a aba e aquilo não é um resultado. Marcar em vez de apagar mantém
-- o dado para quem quiser investigar desistência.
UPDATE simulados
SET abandonado = TRUE
WHERE finalizado_em IS NULL
  AND iniciado_em < NOW() - INTERVAL '2 days'
  AND abandonado IS DISTINCT FROM TRUE;

CREATE INDEX IF NOT EXISTS idx_simulados_historico
  ON simulados(user_id, finalizado_em DESC)
  WHERE finalizado_em IS NOT NULL;

COMMENT ON COLUMN simulados.abandonado IS
  'Prova iniciada e nunca entregue. Fica de fora da série de evolução — não '
  'é um resultado, é uma aba fechada.';

COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- 3. Conferência
-- ════════════════════════════════════════════════════════════════════

-- Todo mundo tem que ter escudo e data de recarga.
SELECT COUNT(*) FILTER (WHERE escudos_streak IS NULL)        AS sem_escudo,
       COUNT(*) FILTER (WHERE escudo_recarregado_em IS NULL) AS sem_data
FROM users;

-- Simulados entregues por mês — a série que a tela de progresso mostra.
SELECT to_char(finalizado_em, 'YYYY-MM') AS mes,
       COUNT(*)                          AS provas,
       ROUND(AVG(pontuacao), 1)          AS media
FROM simulados
WHERE finalizado_em IS NOT NULL AND NOT abandonado
GROUP BY 1 ORDER BY 1;
