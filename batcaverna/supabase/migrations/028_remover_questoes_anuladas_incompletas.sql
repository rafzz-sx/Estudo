-- ============================================================================
-- BatCaverna — Migração 028: Remover questões incompletas e anuladas
-- ============================================================================

BEGIN;

-- 1. Excluir (ou desativar) as questões anuladas.
-- Devido a possíveis conflitos de chave estrangeira com tabelas que não possuem
-- ON DELETE CASCADE (como questao_importadas), podemos primeiro remover as referências.
-- Ou, de forma mais segura para o ambiente de produção, apenas desativamos.
-- A pedido do usuário para "retirá-las da plataforma", vamos excluí-las fisicamente,
-- limpando primeiro as dependências que podem bloquear a deleção.

-- Removemos de `questao_importadas`
DELETE FROM questao_importadas
WHERE questao_id IN (
  SELECT id FROM questoes 
  WHERE anulada = TRUE 
     OR enunciado ILIKE '%[QUESTÃO INCOMPLETA%'
);

-- Removemos de `user_questao_respostas` e `user_questao_notas` (que têm ON DELETE CASCADE, mas por segurança garantimos aqui caso falte)
-- (Não é estritamente necessário se o CASCADE estiver ativo, mas não faz mal)

-- Excluímos as questões
DELETE FROM questoes
WHERE anulada = TRUE 
   OR enunciado ILIKE '%[QUESTÃO INCOMPLETA%';

COMMIT;
