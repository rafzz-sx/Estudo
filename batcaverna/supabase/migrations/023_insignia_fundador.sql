-- ============================================================================
-- Migration 023: Insígnia Fundador Exclusiva (raf4biel.venafro@gmail.com)
-- ============================================================================

BEGIN;

-- 1. Garantir que a insígnia 'Fundador' existe no catálogo
INSERT INTO badges (nome, descricao, icone, criterio, cor_hex, raridade, criterio_tipo, criterio_valor)
SELECT 
  'Fundador',
  'Esteve entre os primeiros soldados da caverna',
  '⭐',
  'Concedido manualmente',
  '#06B6D4',
  'lendaria',
  'manual',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE nome = 'Fundador');

-- 2. Remover a insígnia Fundador de qualquer outro usuário
DELETE FROM user_badges
WHERE badge_id IN (SELECT id FROM badges WHERE nome = 'Fundador')
  AND user_id NOT IN (
    SELECT id FROM users WHERE LOWER(email) = 'raf4biel.venafro@gmail.com'
  );

-- 3. Atualizar configurações caso o usuário já tenha o registro
UPDATE user_badges
SET exibir_no_perfil = TRUE,
    ordem_exibicao = 1
WHERE badge_id IN (SELECT id FROM badges WHERE nome = 'Fundador')
  AND user_id IN (SELECT id FROM users WHERE LOWER(email) = 'raf4biel.venafro@gmail.com');

-- 4. Conceder a insígnia Fundador exclusivamente para a conta raf4biel.venafro@gmail.com caso ainda não tenha
INSERT INTO user_badges (user_id, badge_id, conquistado_em, exibir_no_perfil, ordem_exibicao)
SELECT u.id, b.id, NOW(), TRUE, 1
FROM users u
CROSS JOIN badges b
WHERE LOWER(u.email) = 'raf4biel.venafro@gmail.com'
  AND b.nome = 'Fundador'
  AND NOT EXISTS (
    SELECT 1 FROM user_badges ub WHERE ub.user_id = u.id AND ub.badge_id = b.id
  );

-- 5. Flexibilidade para conversas em grupo: user_id_b anulável
ALTER TABLE conversas ALTER COLUMN user_id_b DROP NOT NULL;

COMMIT;
