-- ============================================================================
-- BatCaverna — Temas Oficiais de Redação de Concursos Militares
-- ============================================================================
-- Temas das provas da ESA, EsPCEx, AFA, EPCAR e Colégio Naval (2021 a 2024).
-- Idempotente via verificação de existência por título e ano.
-- ============================================================================

INSERT INTO redacao_temas (titulo, ano, origem, texto_motivador, ativo)
VALUES
  ('A importância da empatia nas relações interpessoais para a construção de uma sociedade mais justa', 2024, 'ESA', 'Textos motivadores sobre solidariedade, convivência pacífica e respeito às diferenças no convívio social e profissional.', true),
  ('O papel do patriotismo na formação do cidadão contemporâneo', 2023, 'ESA', 'Coletânea sobre a evolução do conceito de pátria, dever cívico e cooperação nacional em um mundo globalizado.', true),
  ('A persistência do desperdício de alimentos no Brasil e suas consequências', 2022, 'ESA', 'Artigos de apoio abordando a segurança alimentar, perdas na cadeia logística e responsabilidade ética e social.', true),
  ('A relevância da liderança ética em tempos de transformação tecnológica e inteligência artificial', 2024, 'EsPCEx', 'Reflexões sobre a conduta moral dos líderes, tomada de decisão algorítmica e o fator humano nas instituições de defesa.', true),
  ('O impacto da desinformação e das fake news na soberania e segurança nacional', 2023, 'EsPCEx', 'Análises táticas sobre guerras híbridas, manipulação de opinião pública e a preservação da verdade factual.', true),
  ('A ciência e a tecnologia como pilares estratégicos do desenvolvimento do Brasil', 2022, 'EsPCEx', 'Visões históricas e contemporâneas sobre independência tecnológica, inovação aeroespacial e defesa de fronteiras.', true),
  ('A coragem moral como fundamento primordial para a tomada de decisões difíceis', 2024, 'AFA', 'Dissertação argumentativa sobre valores morais, liderança militar, dilemas humanos e firmeza de princípios na aviação e na vida.', true),
  ('A importância da disciplina e da autogestão na juventude conectada', 2024, 'EPCAR', 'Reflexão sobre os desafios da concentração e foco diante do bombardeio constante de estímulos e redes sociais.', true),
  ('O mar como patrimônio estratégico e a mentalidade marítima brasileira', 2024, 'Colégio Naval', 'Textos sobre a Amazônia Azul, proteção de recursos costeiros e a importância geopolítica do mar para o futuro do Brasil.', true),
  ('A valorização do professor e da educação pública como esteio da soberania nacional', 2021, 'ESA', 'Textos sobre a dignidade docente e o impacto da instrução primária na emancipação social e cívica.', true),
  ('A cooperação internacional e os desafios humanitários contemporâneos', 2021, 'EsPCEx', 'Análise sobre missões de paz (MINUSTAH), acolhimento de refugiados e o papel diplomático e militar do Brasil.', true)
ON CONFLICT DO NOTHING;
