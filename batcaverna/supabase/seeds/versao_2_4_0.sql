-- ============================================================================
-- BatCaverna — Registro da versão 2.4.0
-- ============================================================================
-- Rode POR ÚLTIMO, depois de todas as migrations e seeds.
--
-- O que entrou na 2.4.0:
--
--   TAXONOMIA (a base de todo o resto)
--     • 2.452 assuntos viram 515. 88% deles tinham UMA questão só, porque os
--       .txt usam rótulo livre: "Geometria Plana", "Geometria plana",
--       "Geometria Plana (Áreas)" eram três coisas diferentes.
--     • Geometria Plana passa a mostrar 134 questões — antes exibia 23.
--     • Isso quebrava, em silêncio, o card "Assuntos que caem", a ordenação
--       da trilha, a revisão espaçada, o caderno de erros e o plano de estudo.
--
--   TELA INICIAL
--     • /dashboard vira "Plano de Hoje": o que está vencido, onde a próxima
--       hora rende mais ponto, o que você nunca abriu, como está evoluindo
--     • /progresso guarda a tela antiga, intacta
--     • radar de fraqueza: cruza quanto o aluno erra com quanto o assunto cai
--     • contagem regressiva para a prova (o dado existia e não aparecia)
--
--   SIMULADO
--     • "Refazer meus erros" — só o que a última resposta errou
--     • "Formato da banca" — 60 questões em 4h na EEAR, 40 na EFOMM
--     • histórico com curva e comparação com a faixa de aprovação
--
--   GAMIFICAÇÃO
--     • escudo de sequência: cobre um dia falho por semana
--     • acertar questão de revisão vale 60% mais XP
--
--   TAF
--     • diário de treino com a distância até o índice do edital
--
--   TEORIA
--     • cobertura de 24% para 43%; Inglês de 0% para 78%
--     • `teoria_conteudo.assunto_id` preenchido: o radar leva o aluno do
--       erro direto ao texto
--
--   ADMIN
--     • aba 🩺 Diagnóstico: confere se cada migration chegou mesmo ao banco
-- ============================================================================

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.4.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
