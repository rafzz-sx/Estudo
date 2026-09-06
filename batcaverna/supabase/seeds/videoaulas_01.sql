-- ============================================================================
-- BatCaverna - Video-aulas da trilha de estudo
-- ============================================================================
-- Gerado por scripts/gerar_videoaulas.py - NAO EDITE A MAO.
--
-- Todo ID aqui foi conferido no oEmbed do YouTube no momento da geracao:
-- titulo e canal sao os que o proprio YouTube devolveu. Video removido ou
-- privado nao entra no seed.
--
-- O aluno assiste DENTRO da plataforma (VideoAulaPlayer usa o dominio
-- youtube-nocookie), sem ser deslocado para a fonte do video.
--
-- Para revalidar depois que algum video sair do ar:
--     python scripts/gerar_videoaulas.py
--
-- Videos conferidos: 72   |   Descartados: 2
-- Idempotente: a chave e (video_id, tema).
-- ============================================================================

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS idx_videoaulas_unica
  ON videoaulas(video_id, tema);

INSERT INTO videoaulas (materia_id, tema, titulo, video_id, canal, ordem)
SELECT m.id, v.tema, v.titulo, v.video_id, v.canal, v.ordem
FROM materias m
JOIN (VALUES
  ('Matemática', 'Geometria Plana', '[enem 2021] Geometria Plana. Como calcular áreas de figuras planas nas questões do enem.', '0MN8kItqCAo', 'Só números', 1),
  ('Matemática', 'Geometria Plana', 'TUDO de Geometria Plana e Trigonometria para o ENEM – O Código ENEM #4', 'UHdqX2LDVpQ', 'Principia Matemática', 2),
  ('Matemática', 'Geometria Espacial', 'Geometria Espacial: Fórmulas e Questões', 'OYVDBSzW_Dw', 'Descomplica', 2),
  ('Matemática', 'Geometria Espacial', 'Geometria Espacial: Revisão para o ENEM', 'ufA5Vkc2aDM', 'Descomplica', 3),
  ('Matemática', 'Trigonometria', 'Razões trigonométricas no triângulo retângulo', 'UWt_mc84t38', 'Professor Ferretto | ENEM e Vestibulares', 1),
  ('Matemática', 'Trigonometria', 'AULÃO AO VIVO: TRIGONOMETRIA: LEI DOS SENOS E LEI DOS COSSENOS - ENEM 2020 - Aula #17', 'qZtwJEhjg_4', 'Professor Ferretto | ENEM e Vestibulares', 2),
  ('Matemática', 'Trigonometria', 'AULÃO AO VIVO: FUNÇÕES TRIGONOMÉTRICAS: SENO E COSSENO - ENEM 2020 - Aula #16', 'n4g7t_znphc', 'Professor Ferretto | ENEM e Vestibulares', 3),
  ('Matemática', 'Análise Combinatória', 'Mega Revisão de Análise Combinatória para o ENEM 2025 | Rumo aos 900+', 's18ewjNfvZE', 'Mente Matemática com Prof. Fredão', 2),
  ('Matemática', 'Análise Combinatória', 'Análise Combinatória: Entenda de Forma Simples e Prática 🔢', '8JNrS7KApGs', 'Toda Matéria', 3),
  ('Matemática', 'Probabilidade', 'Probabilidade e Análise Combinatória', 'g1nDzBRiF34', 'Descomplica', 1),
  ('Matemática', 'Probabilidade', 'Análise Combinatória e Probabilidade no ENEM. I Semana Cai no ENEM.', '2NdVRpF3jB0', 'Matemática Pra Passar', 2),
  ('Matemática', 'Probabilidade', 'Matemática: Probabilidade e Geometria Plana - ENEM', '_3T0xg8IN9I', 'Portal do Enem', 3),
  ('Matemática', 'Estatística', 'ESTATÍSTICA ENEM I MÉDIA, MODA e MEDIANA', 'X5BUC6Lc8gw', 'Dicasdemat Sandro Curió', 1),
  ('Matemática', 'Estatística', 'A Questão que SEMPRE CAI no ENEM: Média, Moda e Mediana (Gabarite Estatística!)', 'WHcjT4d6aPc', 'Piá da Matemática - Profº Marcelo Pinheiro', 2),
  ('Matemática', 'Estatística', '3 Questões de Média, Mediana e Moda – Revisão ENEM Matemática e Estatística', '-OS5zcbcW2w', 'Educador Interativo', 3),
  ('Matemática', 'Funções', 'Função Quadrática no ENEM | Questões resolvidas', 'Eo9QT4_TjUo', 'Escola de Números com Thyago Araujo', 1),
  ('Matemática', 'Razão e Proporção', 'Questões de Média, Moda e Mediana no ENEM que Você NÃO PODE ERRAR!', 'ekzNBFOrfrc', 'xequemat enem', 1),
  ('Português', 'Gramática', 'CRASE ESQUEMATIZADA || Português para Concursos', 'uGDJj-dKnSw', 'Português para Concursos - com Diego Pureza', 1),
  ('Português', 'Gramática', '🟣 CRASE || Aula de Português da Prof. Letícia | Português do Zero', 'bOwq8PFHuKU', 'Português com Letícia', 2),
  ('Português', 'Gramática', 'EXERCÍCIOS RESOLVIDOS DE CRASE (Gramática para Concursos) - Professora Pamba', 'vUI3Vxbk3fI', 'Professora Pamba', 3),
  ('Português', 'Sintaxe', 'SINTAXE da ORAÇÃO - Conceitos mais cobrados em concurso público (teoria + questões)', 'ZVfeDI6gPb0', 'Prof. Álvaro Ferreira', 1),
  ('Português', 'Sintaxe', 'ANÁLISE SINTÁTICA para CONCURSO: Entenda a oração (do zero)', 'pp-QLuf0w3Y', 'Prof. Álvaro Ferreira', 2),
  ('Português', 'Sintaxe', 'SINTAXE - Entenda de uma vez por todas!', 'WZwRBcuf4hQ', 'Prof. Álvaro Ferreira', 3),
  ('Português', 'Interpretação de Texto', 'Compreensão e Interpretação de Texto – Revisão ENEM [Prof. Noslen]', 'XsN0e_xPyNI', 'Professor Noslen', 1),
  ('Português', 'Interpretação de Texto', 'Compreensão x Interpretação no ENEM [Prof. Noslen] #professornoslen #enem', 'rf1lg2foSG4', 'Professor Noslen', 2),
  ('Português', 'Interpretação de Texto', 'Exercícios de INTERPRETAÇÃO DE TEXTO para o ENEM | Prof. Noslen Borges', 'X6g5caxEAvE', 'Professor Noslen', 3),
  ('Português', 'Figuras de Linguagem', 'FIGURAS DE LINGUAGEM | Resumo de Literatura para o Enem', 'wp0yyCn4WHI', 'Curso Enem Gratuito', 1),
  ('Português', 'Figuras de Linguagem', 'O que São Figuras de Linguagem (Aula com Exemplos)', 'BjnvRDzqCgg', 'Português sem Enrolação - Professora Lis', 2),
  ('Português', 'Figuras de Linguagem', 'Enem | Exercícios de Figuras de Linguagem - [Professor Noslen] #professornoslen #enem', 'dyhSYWyQ0Vg', 'Professor Noslen', 3),
  ('Inglês', 'Compreensão e Interpretação de Texto', 'Inglês no Enem: Técnica de Leitura e Interpretação de Texto - Brasil Escola', 'WOR5hbFIoSI', 'Brasil Escola Oficial', 1),
  ('Inglês', 'Compreensão e Interpretação de Texto', 'TÉCNICAS DE INTERPRETAÇÃO DE TEXTOS EM INGLÊS | ENEM - Prof. Rodrigo', 'TG9DjhSwT2k', 'Curso Enem Gratuito', 2),
  ('Inglês', 'Compreensão e Interpretação de Texto', 'GANHE TEMPO NA INTERPRETAÇÃO DE TEXTO | Resumo de Inglês para o Enem', '0oNeqpLPJjU', 'Curso Enem Gratuito', 3),
  ('Inglês', 'Compreensão e Interpretação de Texto', 'Inglês no Enem: como interpretar textos | English in Brazil', 'jBkRAG8L12o', 'English in Brazil by Carina Fragozo', 4),
  ('Física', 'Cinemática', 'Cinemática: MRU e MRUV - Aula completa', 'nguH7yHaZHU', 'FisicaInterativa.Com', 1),
  ('Física', 'Cinemática', 'Aula especial de Física: Cinemática - MRU e MRUV', '-dFigm9iM3w', 'Estratégia Militares', 2),
  ('Física', 'Cinemática', 'MOVIMENTO RETÍLINEO UNIFORMENTE VARIADO (M.R.U.V.) | Resumo de Física para o Enem', '65hJ7p9ggQw', 'Curso Enem Gratuito', 3),
  ('Física', 'Cinemática', 'Física para o ENEM - Gráficos do MRU e MRUV', 'uQwUTLgSWhM', 'Proenem - Enem 2026', 4),
  ('Física', 'Ondulatória', 'ONDULATÓRIA: principais características das ondas | RESUMO DE FÍSICA PARA O ENEM', 'Rmgqv8ETn6o', 'Curso Enem Gratuito', 1),
  ('Física', 'Ondulatória', 'Equação fundamental da ondulatória | aula completa | ENEM e vestibulares', 'C5Th5FIYMoU', 'FISICATOTAL', 2),
  ('Física', 'Ondulatória', '📡 Oscilações (2/4): Ondas (ondulatória) - Física - ENEM', 'OIdPQDsetDk', 'MundoEdu ENEM', 3),
  ('Física', 'Ondulatória', 'ONDAS: EXERCÍCIOS RESOLVIDOS (FREQUÊNCIA E VELOCIDADE) | Física para o Enem', 'aDVhkTD1rPY', 'Curso Enem Gratuito', 4),
  ('Química', 'Química Orgânica', 'FUNÇÕES ORGÂNICAS | Resumo de Química Orgânica para o Enem', 'XbPuaJjhSm0', 'Curso Enem Gratuito', 1),
  ('Química', 'Química Orgânica', 'QUÍMICA ORGÂNICA: Tudo sobre Cadeias Carbônicas e Funções Orgânicas | ENEM e Vestibular', 'WQBpu-IbFKw', 'Toda Matéria', 2),
  ('Química', 'Química Orgânica', '🆘 A QUÍMICA ORGÂNICA COMPLETA!! CARBONO, HIBRIDIZAÇÃO, CADEIA CARBÔNICA, RADICAIS, ETC. ETC. ETC.', 'I_Wm0nhOGNc', 'Umberto Mannarino - Mestres do ENEM', 3),
  ('Química', 'Química Orgânica', 'QUÍMICA ORGÂNICA | Química | Quer Que Desenhe | Descomplica', 'Q_5rB0iF6oI', 'Descomplica', 4),
  ('Biologia', 'Ecologia', 'Tudo sobre ECOLOGIA para o ENEM | Prof. Paulo Jubilut', 'Rr-zQYqRCzo', 'Paulo Jubilut', 1),
  ('Biologia', 'Ecologia', 'Conceitos Básicos da ECOLOGIA | Prof. Paulo Jubilut', 'XvdePktAui8', 'Paulo Jubilut', 2),
  ('Biologia', 'Ecologia', '(AO VIVO) Como Ecologia é Cobrada no ENEM - Prof. Paulo Jubilut', 'OCeQiOxqabo', 'Paulo Jubilut', 3),
  ('História', 'Era Vargas', 'HISTÓRIA DO BRASIL: ERA VARGAS (1930-1945) | AULA COMPLETA', 'Bhl0k8aQYQU', 'Logos vestibulares', 1),
  ('História', 'Era Vargas', 'TUDO QUE VOCÊ PRECISA SABER SOBRE A ERA VARGAS: tá longo, mas vale a pena! (Débora Aladim)', 'jQU6Ojetq8M', 'Débora Aladim', 2),
  ('História', 'Era Vargas', 'ESTADO NOVO (Era Vargas) | Resumo de História do Brasil para o Enem', 'Biv7yyLtKwg', 'Curso Enem Gratuito', 3),
  ('História', 'República Velha', 'REPÚBLICA VELHA PARA O ENEM', '8PAMZzDvN1A', 'Parabólica', 1),
  ('História', 'República Velha', '🗡️ Revoltas da República Velha (Resumo) - História - ENEM', 'AJRPQCzAv_4', 'MundoEdu ENEM', 2),
  ('História', 'República Velha', 'República Velha / Lista / História do Brasil / (Testes: ENEM, Unesp, Unicamp...)', 'hOJC0uC7K_Y', 'Prof. Bruno Medeiros - História', 3),
  ('Geografia', 'Climatologia', 'Climatologia - Aula 2 - semana de Geografia Fisica ENEM', 'MqNjYKEJjGc', 'Professor Ricardo Marcílio', 1),
  ('Geografia', 'Climatologia', 'Clima: elementos e fatores | Geografia | Enem', '7mkEkg3QozA', 'Descomplica', 2),
  ('Geografia', 'Geopolítica', 'GEOPOLÍTICA: ANÁLISE DAS RELAÇÕES GLOBAIS | Resumo de Geografia para o Enem', '2uXUSLF10R0', 'Curso Enem Gratuito', 1),
  ('Geografia', 'Geopolítica', 'GEOPOLÍTICA: conceito, campos e ordem mundial | Cortes dos Aulões do Enem | Geografia | Raphael', 'cl7zXfiNB8g', 'Curso Enem Gratuito', 2),
  ('Geografia', 'Geopolítica', 'A GEOPOLÍTICA DA GUERRA FRIA: Entenda o Mundo Bipolar | Aula de Geografia para o Enem', 'Tf6A7TiSr9Y', 'Curso Enem Gratuito', 3),
  ('Literatura', 'Modernismo', 'PRIMEIRA GERAÇÃO DO MODERNISMO | Resumo de Literatura para o Enem', 'SAYjnqQkcVE', 'Curso Enem Gratuito', 1),
  ('Literatura', 'Modernismo', 'MODERNISMO NO ENEM: como resolver questões de literatura', 'W3avnAUJcRY', 'Curso Enem Gratuito', 2),
  ('Literatura', 'Modernismo', 'Literatura no Enem: 1ª Fase do Modernismo (Parte 1) - Brasil Escola', 'EidWKUcxEi4', 'Brasil Escola Oficial', 3),
  ('Filosofia', 'Panorama para a prova', 'Revisão completa de Filosofia e Sociologia para o Enem 2023 | ProEnem', 'j1FP-cqSti8', 'Proenem - Enem 2026', 1),
  ('Filosofia', 'Panorama para a prova', 'Tudo o que mais cai em Filosofia e Sociologia no Enem (MARATONA 1º DIA ENEM)', 'vP7KgUbDDRg', 'Repertório ENEM', 2),
  ('Sociologia', 'Panorama para a prova', 'RESUMÃO: Sociologia + Filosofia | SIMULADÃO ENEM 2021 | Me Salva! ENEM | #simuladaomesalva', 'y0q9z6OS9CU', 'Me Salva! ENEM', 1),
  ('Sociologia', 'Panorama para a prova', 'Super-revisão de Filosofia e Sociologia para o Enem 2025 I Reta Final Proenem', 'Z-t23NMfelM', 'Proenem - Enem 2026', 2),
  ('Redação', 'Estrutura da Redação', 'Como fazer uma Redação do ENEM (atualizado para 2026)', 'IiwOLOVk4Jk', 'Profinho', 1),
  ('Redação', 'Estrutura da Redação', 'Como elaborar CADA PARTE da sua redação do ENEM #NoENEMComNoslen | Professor Noslen', 'MeKHJVPNV30', 'Professor Noslen', 2),
  ('Redação', 'Estrutura da Redação', 'ESTRUTURA DO TEXTO DA REDAÇÃO DO ENEM: introdução, desenvolvimento e conclusão | COMEÇANDO DO ZERO', '4HOUuVdxx3s', 'Curso Enem Gratuito', 3),
  ('Redação', 'As 5 Competências', 'O guia das 5 COMPETÊNCIAS da REDAÇÃO do ENEM 2024', 'F7lbKl7_o2w', 'Luma e ponto', 1),
  ('Redação', 'As 5 Competências', '5 competências da redação do ENEM: domine os critérios da correção', 'TCdiXzPI8UI', 'Toda Matéria', 2),
  ('Redação', 'As 5 Competências', 'AULA 03: TUDO SOBRE AS 5 COMPETÊNCIAS DA REDAÇÃO ENEM l POXALULU', 'HjVoc_Q7v70', 'Poxalulu', 3)
) AS v(materia_nome, tema, titulo, video_id, canal, ordem)
  ON m.nome = v.materia_nome
ON CONFLICT (video_id, tema) DO UPDATE
  SET titulo = EXCLUDED.titulo,
      canal  = EXCLUDED.canal,
      ativa  = TRUE;

COMMIT;

SELECT m.nome AS materia, v.tema, COUNT(*) AS videos
FROM videoaulas v
JOIN materias m ON m.id = v.materia_id
GROUP BY m.nome, v.tema
ORDER BY m.nome, v.tema;
