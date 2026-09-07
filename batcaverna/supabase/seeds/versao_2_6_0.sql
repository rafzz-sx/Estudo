-- ============================================================================
-- BatCaverna — Registro da versão 2.6.0
-- ============================================================================
-- Rode POR ÚLTIMO, depois de todas as migrations e seeds.
--
-- NÃO HÁ MIGRATION NOVA NESTA VERSÃO. Nenhuma tabela foi criada ou alterada.
-- A correção do hash de senha, que normalmente pediria uma coluna nova, usa um
-- formato auto-descritivo que cabe no `senha_hash VARCHAR(255)` existente.
--
-- O que entrou na 2.6.0 (correção final, pós-varredura de 07/09):
--
--   Críticos
--     • a rota GET /api/tickets/[id] NUNCA EXISTIU. Quatro telas a chamavam e
--       recebiam 404 em silêncio; como a caixa de resposta vive dentro do
--       bloco que depende do detalhe do chamado, ninguém — nem aluno, nem
--       admin — conseguia responder um ticket. O suporte aceitava só a
--       abertura.
--     • o heartbeat de estudo aceitava a duração do navegador SEM TETO. Uma
--       requisição com 99999999 virava ~2.500.000 de XP gravados direto em
--       users.xp_total (o nível máximo pede 25.000) e o topo dos dois
--       rankings. Agora é cortada no tempo que o relógio realmente andou.
--     • senha era SHA-256 de uma volta, sem sal. Virou PBKDF2-HMAC-SHA256 com
--       210.000 iterações e sal por usuário, pela Web Crypto — sem dependência
--       nova. A base migra sozinha: quem entra com a senha certa no formato
--       antigo sai já no novo, sem precisar redefinir nada.
--
--   Sessão de estudo (estava com o ciclo de vida quebrado)
--     • a sessão nunca era encerrada: `finalizada_em` ficava nulo para sempre,
--       e com isso "tempo de estudo hoje" dava 0 da segunda visita em diante,
--       o limite de 8 h virava teto de vida e o multiplicador de continuidade
--       travava em 1,5× para todo mundo. A regra de virada (8 h ou mudança de
--       dia) virou fonte única no servidor.
--
--   Fachadas que viraram funcionalidade
--     • playlists podiam ser criadas e ficavam vazias PARA SEMPRE: a rota de
--       adicionar faixa existia completa e sem nenhum chamador
--     • a aba "Badges" do perfil mostrava dados inventados — um card fixo
--       "Primeiro Login" e oito cadeados "???" — com a API real já em uso na
--       aba ao lado. Agora é o catálogo de verdade
--     • as mensagens do formulário de contato eram gravadas e nunca lidas: o
--       admin só via 139 caracteres na notificação. Aba nova no painel, usando
--       as colunas que a migration 015 já tinha
--     • bloquear um soldado: a rota existia e não havia botão
--
--   Privacidade e correção
--     • a prova de simulado guardada no aparelho não dizia de quem era; em
--       computador compartilhado o próximo aluno caía na prova do anterior
--     • falha ao entregar a prova não aparecia na tela
--     • o proxy mandava o UUID e o papel do usuário nos cabeçalhos de resposta
--     • a questão do dia podia mudar durante o dia (faltava ORDER BY)
--
--   Desempenho
--     • /api/usuarios/me não devolve mais o banner (base64 de até 16 MB) em
--       toda carga de página — só com ?completo=1
--     • sino de notificações não consulta com a aba escondida
--     • admin/atividade-usuarios lê além de 1.000 linhas
--     • total de usuários do painel deixa de congelar em 500
-- ============================================================================

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.6.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
