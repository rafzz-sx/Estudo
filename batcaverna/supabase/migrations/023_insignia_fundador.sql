-- ============================================================================
-- Migration 023: Insígnia Fundador Exclusiva e Ajustes de Grupo
-- ============================================================================
-- 1. Garante a insígnia 'Fundador' no catálogo com raridade 'lendaria'
-- 2. Concede a insígnia 'Fundador' EXCLUSIVAMENTE para a conta raf4biel.venafro...
-- 3. Remove a insígnia de qualquer outro usuário para manter a exclusividade
-- 4. Torna user_id_b anulável em conversas para flexibilidade total em grupos
-- ============================================================================

BEGIN;

-- 1. Garantir que a insígnia 'Fundador' existe no catálogo
INSERT INTO badges (nome, descricao, icone, criterio, cor_hex, raridade, criterio_tipo, criterio_valor)
VALUES (
  'Fundador',
  'Esteve entre os primeiros soldados da caverna',
  '⭐',
  'Concedido manualmente',
  '#06B6D4',
  'lendaria',
  'manual',
  NULL
)
ON CONFLICT (nome) DO NOTHING;

-- 2. Remover a insígnia Fundador de qualquer outro usuário
DELETE FROM user_badges
WHERE badge_id IN (SELECT id FROM badges WHERE nome = 'Fundador')
  AND user_id NOT IN (
    SELECT id FROM users WHERE LOWER(email) = 'raf4biel.venafro@gmail.com'
  );

-- 3. Conceder a insígnia Fundador exclusivamente para a conta raf4biel.venafro@gmail.com
INSERT INTO user_badges (user_id, badge_id, conquistado_em, exibir_no_perfil, ordem_exibicao)
SELECT u.id, b.id, NOW(), TRUE, 1
FROM users u
CROSS JOIN badges b
WHERE LOWER(u.email) = 'raf4biel.venafro@gmail.com'
  AND b.nome = 'Fundador'
ON CONFLICT (user_id, badge_id) DO UPDATE
SET exibir_no_perfil = TRUE,
    ordem_exibicao = 1;

-- 4. Flexibilidade para conversas em grupo: user_id_b anulável
ALTER TABLE conversas ALTER COLUMN user_id_b DROP NOT NULL;

COMMIT;
