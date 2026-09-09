BEGIN;

-- Garante que a tabela auxiliar existe
CREATE TABLE IF NOT EXISTS _mapa_taxonomia_temp (
  materia   TEXT NOT NULL,
  antigo    TEXT NOT NULL,
  canonico  TEXT NOT NULL
);

-- 1. Cria mapa com IDs baseado nos dados acumulados em _mapa_taxonomia_temp (com DISTINCT para segurança contra execuções repetidas)
CREATE TEMP TABLE troca_assunto AS
SELECT a_velho.id AS id_velho, a_novo.id AS id_novo
FROM (SELECT DISTINCT materia, antigo, canonico FROM _mapa_taxonomia_temp) mp
JOIN materias m       ON m.nome = mp.materia
JOIN assuntos a_velho ON a_velho.materia_id = m.id AND a_velho.nome = mp.antigo
JOIN assuntos a_novo  ON a_novo.materia_id  = m.id AND a_novo.nome  = mp.canonico
WHERE a_velho.id <> a_novo.id;

CREATE INDEX ON troca_assunto(id_velho);

-- 2. Atualizar as 7 tabelas dependentes
UPDATE questoes t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

UPDATE bizus t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

UPDATE concurso_assuntos t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

UPDATE user_progresso t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

UPDATE videoaulas t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

UPDATE teoria_conteudo t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

UPDATE plano_itens t SET assunto_id = tr.id_novo
FROM troca_assunto tr WHERE t.assunto_id = tr.id_velho;

-- 3. Apagar assuntos que ficaram órfãos
DELETE FROM assuntos a
WHERE EXISTS (SELECT 1 FROM troca_assunto tr WHERE tr.id_velho = a.id)
  AND NOT EXISTS (SELECT 1 FROM questoes t WHERE t.assunto_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM bizus t WHERE t.assunto_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM concurso_assuntos t WHERE t.assunto_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM user_progresso t WHERE t.assunto_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM videoaulas t WHERE t.assunto_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM teoria_conteudo t WHERE t.assunto_id = a.id)
  AND NOT EXISTS (SELECT 1 FROM plano_itens t WHERE t.assunto_id = a.id);

DROP TABLE troca_assunto;

-- 4. Exclui a tabela auxiliar de mapeamento
DROP TABLE IF EXISTS _mapa_taxonomia_temp;

COMMIT;

-- 5. Conferência dos Resultados
SELECT COUNT(*) AS total_de_assuntos FROM assuntos;

SELECT m.nome AS materia, a.nome AS assunto, COUNT(*) AS questoes
FROM questoes q
JOIN assuntos a ON a.id = q.assunto_id
JOIN materias m ON m.id = a.materia_id
WHERE q.ativa
GROUP BY m.nome, a.nome
ORDER BY COUNT(*) DESC
LIMIT 10;
