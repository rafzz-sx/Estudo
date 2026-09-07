-- ============================================================================
-- BatCaverna — Registro da versão 2.2.0
-- ============================================================================
-- O rodapé lê `app_info` e formata com `formatarDataHoraVersao`, que mostra
-- data + hora CHEIA, sem os minutos ("06/09/2026 às 14h").
--
-- Rode este script POR ÚLTIMO, depois de todas as migrations e seeds.
-- `date_trunc('hour', NOW())` é o que garante a hora redonda.
--
-- O que entrou na 2.2.0 (varredura de bugs de 06/09/2026):
--
--   Ranking
--     • passou a respeitar "sair do ranking" — a preferência era salva e
--       simplesmente ignorada na hora de montar a lista
--     • exige login (qualquer um baixava a base inteira de fora)
--     • o filtro por concurso funciona (era decorativo)
--     • some quem está com a conta suspensa
--     • as somas leem além das 1.000 linhas do PostgREST; antes o ranking
--       passaria a mentir assim que houvesse uso de verdade
--     • ranking semanal/mensal de questões voltava vazio por causa de um
--       nome de coluna errado (`respondida_em` × `respondido_em`)
--
--   Simulado
--     • "Simulado rápido" do card do concurso criava a prova e jogava o
--       aluno na tela de configuração; a prova ficava órfã no banco
--     • modo "Por matéria" não deixava escolher a matéria
--     • modo Personalizado novo: quantidade, tempo, matéria e ano
--
--   XP e sequência
--     • `maior_streak` era sobrescrito pela sequência corrente a cada
--       resposta: quem tinha recorde de 40 dias e furava a corrente perdia
--       o recorde
--
--   Questões
--     • filtro "só com gabarito comentado" e selo nas que não têm
--     • busca deixou de aceitar curinga do LIKE
--     • lista de "não respondidas" cabia em 800 UUIDs numa URL de 30 KB,
--       acima do que o proxy do Supabase aceita
--
--   Chat
--     • no celular a lista e a conversa empilhavam; agora é uma de cada vez
--     • "Online" verde para todo mundo virou último acesso real
--     • o selo "Criptografado Ponta a Ponta" era falso — as mensagens ficam
--       em texto no banco e a moderação lê ao apurar denúncia
--
--   Player
--     • arrastar a barra e soltar fora dela deixava a posição travada
--     • espaço e shift+setas controlam a música em qualquer tela
--
--   Segurança
--     • /api/teoria/[id] devolvia o conteúdo inteiro sem login
--     • cadastro devolvia a mensagem crua do Postgres na tela
--     • IDs de URL validados antes de virar consulta
-- ============================================================================

-- Zera o registro anterior para o rodapé não mostrar versão antiga.
DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.2.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
