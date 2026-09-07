-- ============================================================================
-- BatCaverna — Registro de treino do TAF (versão 2.4.0)
-- ============================================================================
-- Em concurso militar o TAF ELIMINA. Um candidato que gabarita a prova
-- escrita e não faz a corrida de 12 minutos não entra.
--
-- Na plataforma, o TAF era uma tabela estática: os índices mínimos, e só.
-- Isso informa; não treina. A diferença entre saber que precisa correr 2.400
-- metros e saber que hoje você correu 2.180 — 220 a menos, mas 300 a mais que
-- há dois meses — é a diferença entre uma tabela e um preparo.
--
-- Esta migration guarda o treino. Uma linha por marca registrada.
--
-- Idempotente.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS taf_registros (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concurso_id  UUID NOT NULL REFERENCES concursos(id) ON DELETE CASCADE,

  -- Guardamos o NOME do exercício, não o id da linha de `taf_provas`.
  -- Motivo: `taf_provas` é recriada a cada edital novo, e o histórico de
  -- treino do aluno não pode sumir junto. "Corrida de 12 minutos" continua
  -- sendo a mesma corrida em 2027.
  exercicio    VARCHAR(80) NOT NULL,
  unidade      VARCHAR(24) NOT NULL,

  -- NUMERIC e não texto: é o que permite comparar, ordenar e desenhar a
  -- curva. `minimo_aprovacao` em `taf_provas` é texto porque às vezes é
  -- "APTO/INAPTO" ou uma faixa; aqui é sempre uma marca medida.
  valor        NUMERIC(8,2) NOT NULL,

  -- Em quase tudo (flexões, metros) mais é melhor. Em prova de tempo
  -- (corrida de 100 m, natação) MENOS é melhor, e sem esta coluna a tela
  -- desenharia a evolução ao contrário.
  maior_melhor BOOLEAN NOT NULL DEFAULT TRUE,

  data_treino  DATE NOT NULL DEFAULT CURRENT_DATE,
  observacao   VARCHAR(280),
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taf_registros_serie
  ON taf_registros(user_id, concurso_id, exercicio, data_treino DESC);

-- Marca negativa não existe, e um número absurdo estraga a escala do
-- gráfico para sempre. 100.000 cobre metros de corrida com folga.
ALTER TABLE taf_registros
  DROP CONSTRAINT IF EXISTS taf_registros_valor_valido;
ALTER TABLE taf_registros
  ADD CONSTRAINT taf_registros_valor_valido
    CHECK (valor >= 0 AND valor <= 100000);

-- O aluno não pode registrar treino no futuro: mediria expectativa, não
-- desempenho.
ALTER TABLE taf_registros
  DROP CONSTRAINT IF EXISTS taf_registros_data_valida;
ALTER TABLE taf_registros
  ADD CONSTRAINT taf_registros_data_valida
    CHECK (data_treino <= CURRENT_DATE + 1);

COMMENT ON TABLE taf_registros IS
  'Marcas de treino físico do aluno. Guarda o NOME do exercício (não o id de '
  '`taf_provas`) para o histórico sobreviver à troca de edital.';

-- RLS ligado com negativa por padrão, como as demais tabelas de dados
-- pessoais: as rotas usam a chave de serviço e conferem o dono no código.
ALTER TABLE taf_registros ENABLE ROW LEVEL SECURITY;

COMMIT;


-- ════════════════════════════════════════════════════════════════════
-- Conferência
-- ════════════════════════════════════════════════════════════════════

SELECT COUNT(*) AS registros_de_taf FROM taf_registros;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'taf_registros';
