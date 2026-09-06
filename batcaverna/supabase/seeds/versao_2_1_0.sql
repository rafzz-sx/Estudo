-- ============================================================================
-- BatCaverna — Registro da versão 2.1.0
-- ============================================================================
-- O rodapé lê `app_info` e formata com `formatarDataHoraVersao`, que mostra
-- data + hora cheia, SEM os minutos ("06/09/2026 às 14h").
--
-- Rode este script POR ÚLTIMO, depois das migrations 004 e 005 e de todos
-- os seeds. `date_trunc('hour', NOW())` é o que garante a hora redonda.
--
-- O que entrou na 2.1.0:
--   • banco de questões limpo — 3.102 questões tinham régua de PDF colada
--     na última alternativa; agora zero
--   • resolução passo a passo que não quebra mais em fatorial, com rótulos
--     semânticos ("Aplicando a fórmula") no lugar de "Passo 1/2/3"
--   • questão anulada pela banca virou campo, sai do meio do enunciado e
--     deixa de contar como erro do aluno
--   • patamares de combo em 11 (INSANO) e 21 (BRUTA), mais dois novos
--     patamares no topo
--   • 46 faixas de música em domínio público + 72 vídeo-aulas conferidas
--   • teoria de História, Geografia, Filosofia, Sociologia, Literatura,
--     Redação e Gramática — as matérias que tinham questão e nenhum texto
-- ============================================================================

-- Zera o registro anterior para o rodapé não mostrar versão antiga.
DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.1.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
