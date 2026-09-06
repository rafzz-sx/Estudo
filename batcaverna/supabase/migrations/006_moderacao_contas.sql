-- ============================================================================
-- BatCaverna — Moderação de contas (versão 2.1.0)
-- ============================================================================
-- A aba "Contas & Apelidos" do painel admin era SÓ LEITURA: uma tabela com
-- filtro por cargo e nenhuma ação. Não havia como promover um moderador,
-- nem como suspender uma conta que estivesse abusando do chat — a única
-- saída era editar a linha na mão no Supabase.
--
-- Faltavam as colunas de estado da conta. Elas entram aqui.
--
-- Idempotente: pode rodar de novo sem quebrar nada.
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════
-- 1. Estado da conta
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE users
  -- Conta desativada não entra na plataforma nem aparece no ranking.
  ADD COLUMN IF NOT EXISTS ativo             BOOLEAN DEFAULT TRUE,
  -- Suspensão temporária: volta sozinha quando a data passa.
  ADD COLUMN IF NOT EXISTS suspenso_ate      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_suspensao  TEXT,
  ADD COLUMN IF NOT EXISTS suspenso_por      UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS moderado_em       TIMESTAMPTZ;

-- Ninguém fica com `ativo = NULL` depois desta migration.
UPDATE users SET ativo = TRUE WHERE ativo IS NULL;

CREATE INDEX IF NOT EXISTS idx_users_ativo ON users(ativo)
  WHERE ativo = FALSE;

CREATE INDEX IF NOT EXISTS idx_users_suspenso ON users(suspenso_ate)
  WHERE suspenso_ate IS NOT NULL;


-- ════════════════════════════════════════════════════════════════════
-- 1.1 Notificação de sistema
-- ════════════════════════════════════════════════════════════════════
-- A moderação avisa o usuário do que aconteceu com a conta dele. O enum
-- `notificacao_tipo` não tinha um valor para isso, e um INSERT com tipo
-- inexistente é recusado pelo Postgres inteiro — o aviso simplesmente não
-- chegaria.

-- Precisa ser um comando solto: `ALTER TYPE ... ADD VALUE` é recusado
-- dentro de bloco DO/função ("cannot be executed from a function").
-- O IF NOT EXISTS deixa rodar de novo sem erro.
ALTER TYPE notificacao_tipo ADD VALUE IF NOT EXISTS 'sistema';


-- ════════════════════════════════════════════════════════════════════
-- 2. Quem está bloqueado agora
-- ════════════════════════════════════════════════════════════════════
-- A suspensão temporária expira sozinha: em vez de um job que precisa
-- rodar, a checagem é feita na leitura. Esta view existe para o login e o
-- ranking perguntarem uma coisa só, em vez de repetirem a regra.

CREATE OR REPLACE VIEW users_bloqueados AS
SELECT
  id,
  apelido,
  email,
  CASE
    WHEN ativo = FALSE THEN 'desativada'
    WHEN suspenso_ate IS NOT NULL AND suspenso_ate > NOW() THEN 'suspensa'
    ELSE 'liberada'
  END AS situacao,
  suspenso_ate,
  motivo_suspensao
FROM users
WHERE ativo = FALSE
   OR (suspenso_ate IS NOT NULL AND suspenso_ate > NOW());


-- ════════════════════════════════════════════════════════════════════
-- 3. Conferência
-- ════════════════════════════════════════════════════════════════════

SELECT
  COUNT(*) FILTER (WHERE ativo)                                AS contas_ativas,
  COUNT(*) FILTER (WHERE NOT ativo)                            AS desativadas,
  COUNT(*) FILTER (WHERE suspenso_ate IS NOT NULL
                     AND suspenso_ate > NOW())                 AS suspensas_agora,
  COUNT(*) FILTER (WHERE role = 'admin')                       AS admins
FROM users;
