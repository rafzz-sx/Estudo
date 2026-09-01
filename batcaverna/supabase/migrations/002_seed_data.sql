-- ============================================================
-- BatCaverna — Seed Data (Idempotente)
-- Dados iniciais: concursos, matérias, assuntos, níveis,
-- badges, questões de exemplo, bizus, app_info
-- ============================================================

-- ═══════════════════════════════════════════════════════════════
-- NÍVEIS DE GAMIFICAÇÃO (15 níveis)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO nivel_gamificacao (nivel, titulo, xp_minimo_necessario) VALUES
  (1,  'Recruta das Sombras',   0),
  (2,  'Aprendiz da Caverna',   150),
  (3,  'Vigia Noturno',         400),
  (4,  'Rastreador de Pistas',  750),
  (5,  'Predador da Noite',     1200),
  (6,  'Estrategista Sombrio',  1800),
  (7,  'Sombra de Gotham',      2600),
  (8,  'Caçador de Questões',   3600),
  (9,  'Guardião da Caverna',   4900),
  (10, 'Lenda em Ascensão',     6500),
  (11, 'O Implacável',          8500),
  (12, 'Protetor Noturno',      11000),
  (13, 'Lenda da Caverna',      14000),
  (14, 'Cavaleiro de Gotham',   18000),
  (15, 'Rei da Batcaverna',     23000)
ON CONFLICT (nivel) DO UPDATE 
SET titulo = EXCLUDED.titulo, xp_minimo_necessario = EXCLUDED.xp_minimo_necessario;

-- ═══════════════════════════════════════════════════════════════
-- 9 CONCURSOS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO concursos (nome, sigla, descricao, nivel_ensino, forca, frase_curta_card) VALUES
  ('Escola de Especialistas de Aeronáutica', 'EEAR',
   'Formação de sargentos especialistas da FAB. Provas de Português, Matemática e Inglês.',
   'medio', 'aeronautica', 'Sargentos Especialistas · Português, Matemática e Inglês'),

  ('Escola de Sargentos das Armas', 'ESA',
   'Formação de sargentos combatentes do Exército Brasileiro.',
   'medio', 'exercito', 'Praças do Exército · Português, Matemática, História e Geografia'),

  ('Escola de Aprendizes-Marinheiros', 'EAM',
   'Ingresso na Marinha como Praça. Nível fundamental/médio.',
   'fundamental', 'marinha', 'Praças da Marinha · Nível Fundamental/Médio'),

  ('Colégio Naval', 'CN',
   'Ensino médio na Marinha do Brasil. Ingresso pelo 9º ano.',
   'fundamental', 'marinha', '9º ano → Ensino Médio · Marinha do Brasil'),

  ('Escola Preparatória de Cadetes do Ar', 'EPCAR',
   'Ensino médio da Força Aérea Brasileira. Ingresso pelo 9º ano.',
   'fundamental', 'aeronautica', '9º ano → Ensino Médio · Força Aérea Brasileira'),

  ('Escola Preparatória de Cadetes do Exército', 'EsPCEx',
   'Formação de oficiais combatentes do Exército Brasileiro.',
   'medio', 'exercito', 'Oficial do Exército · Todas as disciplinas'),

  ('Escola de Formação de Oficiais da Marinha Mercante', 'EFOMM',
   'Oficial da Marinha Mercante com banca própria.',
   'medio', 'marinha', 'Oficial da Marinha Mercante · Banca própria'),

  ('Instituto Militar de Engenharia', 'IME',
   'Engenharia militar de alto nível. Provas discursivas complexas.',
   'avancado', 'exercito', 'Oficial de Engenharia · Nível avançado'),

  ('Exame Nacional do Ensino Médio', 'ENEM',
   'Exame para ingresso em universidades. 4 áreas + Redação.',
   'medio', 'enem', '4 áreas + Redação · Questões contextualizadas')
ON CONFLICT (sigla) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- MATÉRIAS (banco-mestre)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO materias (nome, descricao, icone_emoji) VALUES
  ('Português',           'Gramática, interpretação de texto, redação',  '📝'),
  ('Matemática',          'Álgebra, geometria, aritmética, funções',     '📐'),
  ('Física',              'Mecânica, termodinâmica, óptica, eletricidade', '⚡'),
  ('Química',             'Química geral, orgânica e inorgânica',        '🧪'),
  ('Biologia',            'Citologia, genética, ecologia, zoologia',     '🧬'),
  ('História do Brasil',  'Colonial, Imperial, República, contemporânea','📜'),
  ('História Geral',      'Antiga, Medieval, Moderna, Contemporânea',    '🌍'),
  ('Geografia do Brasil', 'Física, humana, econômica do Brasil',         '🗺️'),
  ('Geografia Geral',     'Geopolítica, climatologia, cartografia',      '🌐'),
  ('Inglês',              'Gramática, vocabulário, interpretação',        '🇬🇧'),
  ('Literatura',          'Escolas literárias, autores, obras',          '📖'),
  ('Redação',             'Dissertação argumentativa, narração',         '✍️'),
  ('Ciências da Natureza','Área integrada ENEM: Física+Química+Bio',     '🔬'),
  ('Ciências Humanas',    'Área integrada ENEM: Hist+Geo+Fil+Soc',      '🏛️'),
  ('Linguagens',          'Área integrada ENEM: Port+Lit+Ing+Artes',     '🗣️')
ON CONFLICT (nome) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- MAPEAMENTO CONCURSO → MATÉRIA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EEAR' AND m.nome IN ('Português', 'Matemática', 'Inglês')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'ESA' AND m.nome IN ('Português', 'Matemática', 'História do Brasil', 'Geografia do Brasil')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EAM' AND m.nome IN ('Português', 'Matemática', 'Física', 'Inglês')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'CN' AND m.nome IN ('Português', 'Matemática', 'Inglês', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EPCAR' AND m.nome IN ('Português', 'Matemática', 'Inglês', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EsPCEx' AND m.nome IN ('Português', 'Matemática', 'Física', 'Química', 'Inglês', 'História do Brasil', 'Geografia do Brasil', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'EFOMM' AND m.nome IN ('Português', 'Matemática', 'Física', 'Inglês', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'IME' AND m.nome IN ('Matemática', 'Física', 'Química', 'Inglês', 'Português', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

INSERT INTO concurso_materias (concurso_id, materia_id)
SELECT c.id, m.id FROM concursos c, materias m
WHERE c.sigla = 'ENEM' AND m.nome IN ('Ciências da Natureza', 'Ciências Humanas', 'Linguagens', 'Matemática', 'Redação')
ON CONFLICT (concurso_id, materia_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- ASSUNTOS DE EXEMPLO
-- ═══════════════════════════════════════════════════════════════

-- Português
INSERT INTO assuntos (materia_id, nome, ordem)
SELECT m.id, a.nome, a.ordem
FROM materias m
CROSS JOIN (VALUES
  ('Acentuação Gráfica', 1),
  ('Crase', 2),
  ('Concordância Verbal e Nominal', 3),
  ('Regência Verbal e Nominal', 4),
  ('Interpretação de Texto', 5),
  ('Classes de Palavras', 6),
  ('Ortografia', 7),
  ('Pontuação', 8),
  ('Vozes Verbais', 9),
  ('Figuras de Linguagem', 10)
) AS a(nome, ordem)
WHERE m.nome = 'Português'
AND NOT EXISTS (SELECT 1 FROM assuntos sub WHERE sub.materia_id = m.id AND sub.nome = a.nome);

-- Matemática
INSERT INTO assuntos (materia_id, nome, ordem)
SELECT m.id, a.nome, a.ordem
FROM materias m
CROSS JOIN (VALUES
  ('Equações do 1º e 2º Grau', 1),
  ('Razão e Proporção', 2),
  ('Porcentagem', 3),
  ('Regra de Três', 4),
  ('Geometria Plana', 5),
  ('Geometria Espacial', 6),
  ('Funções', 7),
  ('Trigonometria', 8),
  ('Progressões (PA e PG)', 9),
  ('Análise Combinatória e Probabilidade', 10)
) AS a(nome, ordem)
WHERE m.nome = 'Matemática'
AND NOT EXISTS (SELECT 1 FROM assuntos sub WHERE sub.materia_id = m.id AND sub.nome = a.nome);

-- ═══════════════════════════════════════════════════════════════
-- USUÁRIO ADMINISTRADOR PADRÃO (raf4biel.venafro@gmail.com)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO users (
  nome, apelido, email, senha_hash, email_verified, role, xp_total, nivel_atual, streak_dias, maior_combo_pessoal, bio
) VALUES (
  'Administrador BatCaverna',
  'AdminCaverna',
  'raf4biel.venafro@gmail.com',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  TRUE,
  'admin',
  25000,
  15,
  30,
  50,
  'Comandante Chefe da BatCaverna. Central de Operações de Concursos Militares.'
) ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- QUESTÕES DE EXEMPLO
-- ═══════════════════════════════════════════════════════════════

INSERT INTO questoes (
  concurso_id, materia_id, assunto_id, enunciado, alternativas, resposta_correta, explicacao, ano, banca, dificuldade
)
SELECT
  c.id, m.id, a.id,
  'Assinale a alternativa em que o uso do acento indicativo de crase é OBRIGATÓRIO:',
  '[{"letra": "A", "texto": "Fui a pé até a escola."}, {"letra": "B", "texto": "Entreguei o relatório à capitã."}, {"letra": "C", "texto": "Ele começou a falar sem parar."}, {"letra": "D", "texto": "Dirigi-me a ela com respeito."}]'::jsonb,
  'B',
  'A alternativa B está correta porque o verbo "entregar" rege a preposição "a" e "capitã" admite o artigo feminino "a", resultando em crase (à capitã). As demais são proibições: A (palavra masculina), C (antes de verbo), D (antes de pronome pessoal).',
  2023, 'Aeronáutica', 'medio'
FROM concursos c, materias m, assuntos a
WHERE c.sigla = 'EEAR' AND m.nome = 'Português' AND a.nome = 'Crase'
AND NOT EXISTS (SELECT 1 FROM questoes q WHERE q.concurso_id = c.id AND q.enunciado LIKE 'Assinale a alternativa em que o uso do acento indicativo de crase%');

INSERT INTO questoes (
  concurso_id, materia_id, assunto_id, enunciado, alternativas, resposta_correta, explicacao, ano, banca, dificuldade
)
SELECT
  c.id, m.id, a.id,
  'Na equação do segundo grau 3x² - 12x + 9 = 0, a soma das raízes é igual a:',
  '[{"letra": "A", "texto": "2"}, {"letra": "B", "texto": "3"}, {"letra": "C", "texto": "4"}, {"letra": "D", "texto": "12"}]'::jsonb,
  'C',
  'Pela relação de Girard, a soma das raízes de ax² + bx + c = 0 é dada por S = -b/a. Logo, S = -(-12)/3 = 12/3 = 4.',
  2023, 'Exército', 'facil'
FROM concursos c, materias m, assuntos a
WHERE c.sigla = 'ESA' AND m.nome = 'Matemática' AND a.nome = 'Equações do 1º e 2º Grau'
AND NOT EXISTS (SELECT 1 FROM questoes q WHERE q.concurso_id = c.id AND q.enunciado LIKE 'Na equação do segundo grau 3x² - 12x + 9 = 0%');
