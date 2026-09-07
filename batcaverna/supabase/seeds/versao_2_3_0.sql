-- ============================================================================
-- BatCaverna — Registro da versão 2.3.0
-- ============================================================================
-- Rode POR ÚLTIMO, depois de todas as migrations e seeds.
-- `date_trunc('hour', NOW())` é o que garante a hora cheia, sem minutos.
--
-- O que entrou na 2.3.0:
--
--   Moderação (o pedido do dono)
--     • alerta na caixa de notificação do admin quando uma mensagem é
--       sinalizada, dizendo quem escreveu, o que escreveu e para quem
--     • classificador novo com 8 categorias e 4 gravidades, no lugar da
--       lista de 12 palavrões com `includes` — que casava dentro de palavra
--       ("lixo" em "prolixo", "puta" em "computador")
--     • só gravidade crítica e alta notificam na hora; palavrão espera na
--       fila. Sino que toca demais é sino que se desliga.
--     • categoria de sinal de autolesão, que NÃO é punitiva: existe para
--       alguém poder oferecer ajuda
--     • aba nova no painel: mensagem (não conversa) como unidade, mais grave
--       no topo, com reincidência do autor e quatro decisões que fecham o
--       ciclo
--
--   Três abas do painel que voltavam vazias
--     • "Usuários Online Agora" pedia `study_sessions.dispositivo`; a coluna
--       é `dispositivo_origem`, e o PostgREST recusa o select inteiro
--     • contagem de questões do dia e atividade do usuário pediam
--       `respondida_em`; a coluna é `respondido_em`
-- ============================================================================

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.3.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
