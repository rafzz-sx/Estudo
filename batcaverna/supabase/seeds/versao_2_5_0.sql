-- ============================================================================
-- BatCaverna — Registro da versão 2.5.0
-- ============================================================================
-- Rode POR ÚLTIMO, depois de todas as migrations e seeds.
--
-- O que entrou na 2.5.0 (implementação das correções da auditoria de 07/09):
--
--   Arquitetura
--     • um único layout para toda a área logada (route group `(privado)`).
--       Antes eram 14 layouts irmãos, e navegar entre seções desmontava e
--       remontava o AppShell inteiro — era a causa raiz de estado perdido
--       ao trocar de página.
--     • /chat passou a ter sidebar, notificações, player e o contador de
--       tempo de uso — ficava fora do AppShell.
--
--   Tempo de estudo (estava 100% inoperante)
--     • o componente que inicia a sessão, faz o tick e manda o heartbeat
--       existia e NÃO ERA MONTADO. Cronômetro parado, XP por tempo nunca
--       concedido, ranking por tempo vazio. Agora está montado, e só conta
--       com a aba visível.
--
--   Persistência
--     • simulado sobrevive a recarregar a página e ao Android matar a
--       WebView: respostas ficam no aparelho, o relógio é o do servidor
--     • favoritar EsPCEx funcionava? Não — comparação sensível a maiúscula,
--       e a API respondia sucesso sem gravar. Corrigido, com retorno do que
--       foi realmente salvo e sem a janela em que se perdiam todos os
--       favoritos
--
--   Segurança e privacidade
--     • mini-perfil exige login e respeita "ocultar do ranking"
--     • variáveis de ambiente do Supabase passam a ter precedência sobre o
--       valor fixo (a comparação anterior nunca era verdadeira)
--     • aviso alto no log quando o segredo padrão do JWT está em uso
--     • service worker: rede primeiro para HTML, nada autenticado em cache,
--       cache limpo no logout, versão v2 expurga a v1
--     • proxy protege as 15 rotas privadas (faltavam 6)
--
--   Formulário de contato
--     • enviava? Não — setTimeout e "mensagem encaminhada". Agora grava em
--       `contatos_publicos` (migration 015) e avisa os administradores
--
--   Admin
--     • painel, listagem de usuários e aviso global leem além de 1.000
--       linhas; a listagem parou de carregar o banner (até 16 MB/usuário)
--
--   Combo
--     • patamares em fonte única (@batcaverna/utils), servidor e cliente
--       importam a mesma lista
-- ============================================================================

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.5.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
