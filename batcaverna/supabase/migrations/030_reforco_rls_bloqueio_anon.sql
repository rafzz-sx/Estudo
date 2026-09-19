-- ============================================================
-- BatCaverna — Migração 030: Reforço Estrito de RLS contra Chave Anônima
-- Impede qualquer mutação direta (INSERT, UPDATE, DELETE) no banco
-- feita com a chave anon do Supabase, forçando todo fluxo pelas APIs.
-- ============================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'refresh_tokens', 'email_verification_tokens',
    'user_privacy_settings', 'user_categoria_escrita',
    'user_progresso', 'user_questao_respostas', 'user_materia_stats',
    'user_badges', 'user_concurso_favoritos', 'user_teoria_progresso',
    'user_tempo_uso', 'user_questao_notas', 'study_sessions', 'simulados',
    'revisoes_agendadas', 'planos_estudo', 'plano_itens',
    'amizades', 'conversas', 'mensagem_chat', 'notificacoes',
    'tickets', 'ticket_mensagens', 'favoritos', 'redacoes', 'redacao_feedbacks',
    'playlists', 'playlist_itens', 'user_musicas_favoritas',
    'admin_audit_log', 'avisos_globais', 'feedback_plataforma',
    'importacao_logs', 'questao_importadas', 'ranking_cache',
    'depoimentos'
  ] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = t) THEN
      -- Garante RLS ligado
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
      
      -- Revoga permissões diretas de mutação para os papéis públicos da API REST do Supabase
      EXECUTE format('REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON %I FROM anon, authenticated', t);
      
      -- Remove policies permissivas legadas que possam ter sobrado
      EXECUTE format('DROP POLICY IF EXISTS "permitir_tudo_%1$s" ON %1$I', t);
      EXECUTE format('DROP POLICY IF EXISTS "anon_mutacao_%1$s" ON %1$I', t);
    END IF;
  END LOOP;

  -- Ajustar tamanho da coluna de mensagem_chat para acomodar payload cifrado em repouso
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mensagem_chat') THEN
    ALTER TABLE mensagem_chat DROP CONSTRAINT IF EXISTS mensagem_chat_tamanho;
    ALTER TABLE mensagem_chat ADD CONSTRAINT mensagem_chat_tamanho
      CHECK (conteudo_texto IS NULL OR length(conteudo_texto) <= 12000);
  END IF;
END $$;
