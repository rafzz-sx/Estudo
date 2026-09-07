-- ============================================================================
-- BatCaverna — Mensagens do formulário público de contato (versão 2.5.0)
-- ============================================================================
-- A página /contato tinha um formulário completo cujo botão "Enviar" fazia
-- um setTimeout de 800 ms e mostrava "Sua mensagem foi encaminhada com
-- sucesso para o comando. Responderemos em breve no seu e-mail." Nenhuma
-- requisição era feita. A mensagem era descartada.
--
-- Nem `tickets` nem `feedback_plataforma` servem: as duas exigem
-- `user_id NOT NULL`, e o contato é público — quem escreve pode não ter
-- conta (é justamente o caso de quem quer perguntar antes de se cadastrar).
--
-- Tabela nova, aditiva, sem tocar em nada existente. Cada mensagem também
-- vira uma notificação para os administradores, reaproveitando a caixa que
-- eles já abrem — sem tela nova no painel.
--
-- Idempotente.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS contatos_publicos (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome           VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  -- duvida | bizu | bug | parceria | outro (os valores do <select> da tela)
  assunto        VARCHAR(20)  NOT NULL DEFAULT 'outro',
  mensagem       TEXT         NOT NULL,
  -- Se quem escreveu estava logado, guardamos o vínculo; senão fica nulo.
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_origem      VARCHAR(64),
  lido_por_admin BOOLEAN DEFAULT FALSE,
  respondido_em  TIMESTAMPTZ,
  criado_em      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contatos_criado
  ON contatos_publicos(criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_contatos_nao_lidos
  ON contatos_publicos(lido_por_admin)
  WHERE lido_por_admin = FALSE;

-- Travas do mesmo tamanho que a rota valida, para um cliente que fale
-- direto com o banco não conseguir gravar 10 MB de texto.
ALTER TABLE contatos_publicos
  DROP CONSTRAINT IF EXISTS contatos_publicos_tamanhos;
ALTER TABLE contatos_publicos
  ADD CONSTRAINT contatos_publicos_tamanhos
    CHECK (length(mensagem) BETWEEN 10 AND 4000
       AND length(nome) BETWEEN 2 AND 100);

-- RLS ligado, negativa por padrão, como todas as tabelas com dado pessoal.
-- A rota usa a chave de serviço e valida no código.
ALTER TABLE contatos_publicos ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE contatos_publicos IS
  'Mensagens do formulário público /contato. Quem escreve pode não ter '
  'conta. Cada linha também gera uma notificação (tipo sistema) para os '
  'administradores.';

COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- Conferência
-- ════════════════════════════════════════════════════════════════════

SELECT COUNT(*) AS mensagens_de_contato FROM contatos_publicos;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'contatos_publicos';
