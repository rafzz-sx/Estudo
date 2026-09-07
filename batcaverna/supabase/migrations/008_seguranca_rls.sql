-- ============================================================================
-- BatCaverna — Auditoria de segurança: RLS revisado (versão 2.1.0)
-- ============================================================================
--
-- ─── O modelo de acesso desta plataforma ────────────────────────────────
--
-- Toda leitura e escrita do app passa pelas API routes do Next.js, que usam
-- a `service_role` — e a service_role IGNORA o RLS por definição. Ou seja:
-- o RLS aqui não protege o app de si mesmo. Ele protege o banco de quem
-- chegar com a **chave anônima**, que é pública por natureza (vai no
-- bundle do navegador, qualquer um lê no DevTools).
--
-- Portanto a régua correta é: com a chave anônima, o que dá para ler?
--
-- ─── O que estava errado ────────────────────────────────────────────────
--
-- 1. `questoes` tinha `FOR SELECT USING (true)`. Essa tabela guarda
--    `resposta_correta` e `explicacao`. Qualquer pessoa com a chave anônima
--    (isto é, qualquer visitante) podia baixar o gabarito INTEIRO das 3.247
--    questões com uma requisição — e a blindagem de gabarito do simulado,
--    que o código faz com tanto cuidado no servidor, virava decoração.
--
-- 2. `bizus` idem: o acervo inteiro de macetes exposto para raspagem.
--
-- 3. 40 tabelas estão com RLS ligado e NENHUMA policy. Isso na prática
--    nega tudo para a chave anônima — que é o comportamento correto — mas
--    não estava declarado em lugar nenhum, então parecia esquecimento.
--    Aqui isso vira intenção explícita e documentada.
--
-- ─── Não quebra nada ────────────────────────────────────────────────────
-- Nenhuma tela perde acesso: todas leem pelas API routes com service_role.
-- Confirmado que nenhum componente do app usa o cliente de navegador
-- (`createBrowserSupabaseClient` não é importado em lugar nenhum).
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- 1. FECHA O GABARITO
-- ════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Permitir leitura publica de questoes" ON questoes;
DROP POLICY IF EXISTS "leitura_publica_questoes"             ON questoes;

DROP POLICY IF EXISTS "Permitir leitura publica de bizus" ON bizus;
DROP POLICY IF EXISTS "leitura_publica_bizus"             ON bizus;

COMMENT ON TABLE questoes IS
  'Sem policy de leitura anônima de propósito: a tabela guarda resposta_correta. '
  'O acesso é exclusivamente pelas API routes com service_role.';

COMMENT ON TABLE bizus IS
  'Sem policy de leitura anônima de propósito: acervo próprio da plataforma. '
  'O acesso é exclusivamente pelas API routes com service_role.';


-- ════════════════════════════════════════════════════════════════════
-- 2. CATÁLOGO PÚBLICO — o que pode ser lido sem login
-- ════════════════════════════════════════════════════════════════════
-- São dados de vitrine: nomes de concurso, matérias, patentes, TAF. Nada
-- aqui identifica pessoa nem entrega resposta de prova. A landing page e as
-- telas públicas dependem deles.
--
-- A policy é FOR SELECT apenas — nunca FOR ALL. Escrita continua sendo
-- exclusividade da service_role.

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'concursos', 'materias', 'assuntos', 'concurso_materias',
    'concurso_assuntos', 'badges', 'nivel_gamificacao', 'app_info',
    'frases_motivacionais', 'combo_patamares', 'taf_provas',
    'videoaulas', 'teoria_conteudo', 'musicas', 'tipos_armadilha'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS "leitura_publica_%1$s" ON %1$I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Permitir leitura publica de %1$s" ON %1$I', t);
      EXECUTE format(
        'CREATE POLICY "catalogo_publico_select_%1$s" ON %1$I '
        'FOR SELECT TO anon, authenticated USING (true)', t
      );
    END IF;
  END LOOP;
END $$;


-- ════════════════════════════════════════════════════════════════════
-- 3. TUDO MAIS: NEGADO PARA A CHAVE ANÔNIMA
-- ════════════════════════════════════════════════════════════════════
-- Estas guardam dado pessoal, progresso, conversa privada, token de sessão
-- ou controle administrativo. RLS ligado + zero policy = ninguém entra com
-- a chave anônima, em nenhuma operação.
--
-- O bloco existe para GARANTIR o RLS ligado (uma tabela criada depois sem
-- RLS ficaria aberta) e para deixar a decisão registrada no banco.

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    -- Identidade e sessão
    'users', 'refresh_tokens', 'email_verification_tokens',
    'user_privacy_settings', 'user_categoria_escrita',
    -- Progresso e desempenho
    'user_progresso', 'user_questao_respostas', 'user_materia_stats',
    'user_badges', 'user_concurso_favoritos', 'user_teoria_progresso',
    'user_tempo_uso', 'user_questao_notas', 'study_sessions', 'simulados',
    'revisoes_agendadas', 'planos_estudo', 'plano_itens',
    -- Social
    'amizades', 'conversas', 'mensagem_chat', 'notificacoes',
    'tickets', 'ticket_mensagens', 'favoritos',
    'playlists', 'playlist_itens', 'user_musicas_favoritas',
    -- Administração e operação
    'admin_audit_log', 'avisos_globais', 'feedback_plataforma',
    'importacao_logs', 'questao_importadas', 'ranking_cache'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      -- Remove qualquer policy permissiva que tenha sobrado de migrations
      -- anteriores; o padrão passa a ser negar.
      EXECUTE format('DROP POLICY IF EXISTS "leitura_publica_%1$s" ON %1$I', t);
      EXECUTE format('DROP POLICY IF EXISTS "Permitir leitura publica de %1$s" ON %1$I', t);
    END IF;
  END LOOP;
END $$;

COMMENT ON TABLE refresh_tokens IS
  'Tokens de sessão. Nenhuma policy: inalcançável pela chave anônima.';
COMMENT ON TABLE mensagem_chat IS
  'Conversa privada entre alunos. Nenhuma policy: inalcançável pela chave anônima.';
COMMENT ON TABLE admin_audit_log IS
  'Trilha de auditoria. Nenhuma policy: inalcançável pela chave anônima.';


-- ════════════════════════════════════════════════════════════════════
-- 4. VIEWS
-- ════════════════════════════════════════════════════════════════════
-- View no Postgres roda com os privilégios de quem a criou, NÃO com os de
-- quem consulta — por isso ela pode furar o RLS das tabelas de baixo.
-- `users_bloqueados` expõe e-mail e motivo de suspensão; revogamos o acesso
-- anônimo explicitamente.

REVOKE ALL ON users_bloqueados FROM anon;
REVOKE ALL ON users_bloqueados FROM authenticated;

-- Esta é só contagem agregada de questões por assunto: não entrega
-- enunciado nem gabarito, e alimenta o card público de assuntos.
GRANT SELECT ON concurso_assuntos_cobrados TO anon, authenticated;


-- ════════════════════════════════════════════════════════════════════
-- 5. LIMITES DE TAMANHO NO BANCO
-- ════════════════════════════════════════════════════════════════════
-- Avatar e banner são gravados como data URL (base64) direto na coluna. O
-- limite de 15 MB existia SÓ no navegador — quem chamasse a API na mão
-- podia gravar o que quisesse e encher o banco.
--
-- A validação principal entrou na API (apps/web/src/app/api/usuarios/me),
-- mas a trava no banco é a que não tem como contornar.

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_avatar_tamanho,
  DROP CONSTRAINT IF EXISTS users_banner_tamanho,
  DROP CONSTRAINT IF EXISTS users_bio_tamanho,
  DROP CONSTRAINT IF EXISTS users_nome_tamanho;

ALTER TABLE users
  -- ~4 MB de base64 = ~3 MB de arquivo. Mais que suficiente para avatar.
  ADD CONSTRAINT users_avatar_tamanho
    CHECK (avatar_url IS NULL OR length(avatar_url) <= 4194304),
  -- Banner aceita vídeo curto, então tem folga maior.
  ADD CONSTRAINT users_banner_tamanho
    CHECK (banner_url IS NULL OR length(banner_url) <= 16777216),
  ADD CONSTRAINT users_bio_tamanho
    CHECK (bio IS NULL OR length(bio) <= 150),
  ADD CONSTRAINT users_nome_tamanho
    CHECK (length(nome) BETWEEN 2 AND 100);

-- Mensagem de chat: impede alguém de enfiar um megabyte de texto numa
-- mensagem e derrubar a tela de quem for ler.
--
-- A coluna chama `conteudo_texto`. Escrito como `conteudo`, este ALTER
-- abortava com "column conteudo does not exist" e derrubava a transação
-- inteira — as políticas de RLS acima ficavam sem efeito, caladas.
ALTER TABLE mensagem_chat
  DROP CONSTRAINT IF EXISTS mensagem_chat_tamanho;
ALTER TABLE mensagem_chat
  ADD CONSTRAINT mensagem_chat_tamanho
    CHECK (conteudo_texto IS NULL OR length(conteudo_texto) <= 2000);

-- A mídia do chat vai em data URL, dentro da própria linha. Sem teto, uma
-- pessoa grava 200 MB numa mensagem e a conversa não abre mais para ninguém.
-- 8 MB de base64 ≈ 6 MB de arquivo: sobra para foto e áudio de voz.
ALTER TABLE mensagem_chat
  DROP CONSTRAINT IF EXISTS mensagem_chat_midia_tamanho;
ALTER TABLE mensagem_chat
  ADD CONSTRAINT mensagem_chat_midia_tamanho
    CHECK (midia_url IS NULL OR length(midia_url) <= 8 * 1024 * 1024);


COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- 6. CONFERÊNCIA
-- ════════════════════════════════════════════════════════════════════

-- Toda tabela do schema public tem que aparecer com rls_ativo = true.
SELECT tablename, rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public' AND NOT rowsecurity
ORDER BY tablename;
-- ^ Se voltar alguma linha, essa tabela está ABERTA. Investigue.

-- Quem pode ser lido sem login. Só catálogo deve aparecer aqui —
-- questoes e bizus NÃO podem estar nesta lista.
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
