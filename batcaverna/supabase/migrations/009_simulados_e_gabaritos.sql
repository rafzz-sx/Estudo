-- ============================================================================
-- BatCaverna — Simulados ajustáveis, gabarito comentado e edital (v2.2.0)
-- ============================================================================
-- Quatro lacunas fechadas aqui, todas encontradas na varredura de 06/09/2026:
--
--   1. Não havia como a plataforma saber, sem ler a `explicacao` inteira, se
--      uma questão tem gabarito comentado. A tela de questões precisa dessa
--      informação para filtrar e para avisar o aluno ANTES dele responder —
--      mas não pode receber a `explicacao`, senão bastava abrir o DevTools.
--   2. `concursos.edital_ano` existia como coluna e estava NULA nos nove.
--      O card do concurso prometia "baseado no edital atual" sem mostrar
--      nenhuma data.
--   3. `frases_motivacionais` tinha 60 frases de erro (ótimo) mas só 3 de
--      combo quebrado — e é justo quem vinha de 5, 10, 20 acertos seguidos
--      que mais precisa de variedade. Na terceira sessão o aluno já sabia
--      as três de cor.
--   4. Faltava índice para os dois filtros novos da tela de questões.
--
-- Idempotente: rodar de novo não duplica nada.
-- ============================================================================


-- ════════════════════════════════════════════════════════════════════
-- 1. `tem_comentario` — coluna derivada, segura de expor ao cliente
-- ════════════════════════════════════════════════════════════════════
-- GENERATED ALWAYS ... STORED: o Postgres mantém sincronizada sozinho. Se
-- amanhã o admin escrever a resolução pela Fila de Resolução, a coluna vira
-- TRUE na mesma transação — não existe estado intermediário mentindo.
--
-- O corte em 20 caracteres não é arbitrário: o parser às vezes recuperava
-- migalhas como "Letra C." que não explicam nada e só fariam o aluno abrir
-- o gabarito para se frustrar.

ALTER TABLE questoes
  ADD COLUMN IF NOT EXISTS tem_comentario BOOLEAN
  GENERATED ALWAYS AS (
    explicacao IS NOT NULL AND length(btrim(explicacao)) > 20
  ) STORED;

COMMENT ON COLUMN questoes.tem_comentario IS
  'Derivada de `explicacao`. Existe para a API poder dizer "esta questão tem '
  'comentário" sem enviar o comentário (que entregaria o gabarito) a quem '
  'ainda não respondeu.';

CREATE INDEX IF NOT EXISTS idx_questoes_comentadas
  ON questoes(concurso_id, tem_comentario)
  WHERE ativa = TRUE;


-- ════════════════════════════════════════════════════════════════════
-- 2. `edital_ano` — o ano da prova mais recente que está no acervo
-- ════════════════════════════════════════════════════════════════════
-- LEIA ANTES DE MUDAR: este campo NÃO é "o ano do edital publicado". É o ano
-- da prova oficial mais recente que a plataforma tem daquele concurso, e é
-- assim que a tela o rotula ("Base: provas oficiais até 2026").
--
-- A diferença importa. O ano do edital eu teria de afirmar de fora; este eu
-- calculo do próprio banco e ele se corrige sozinho toda vez que o admin
-- importa uma prova nova pelo painel. Um número que se mantém verdadeiro
-- sem ninguém lembrar de atualizar vale mais que um número mais bonito que
-- envelhece calado.
--
-- Concurso sem questão cadastrada fica NULO de propósito: a tela então não
-- mostra o selo, em vez de mostrar um selo vazio.

UPDATE concursos c
SET edital_ano = sub.ultimo_ano
FROM (
  SELECT concurso_id, MAX(ano) AS ultimo_ano
  FROM questoes
  WHERE ativa = TRUE AND ano IS NOT NULL
  GROUP BY concurso_id
) sub
WHERE c.id = sub.concurso_id
  AND (c.edital_ano IS DISTINCT FROM sub.ultimo_ano);

COMMENT ON COLUMN concursos.edital_ano IS
  'Ano da prova oficial mais recente no acervo deste concurso (derivado de '
  '`questoes`, atualizado pela migration 009). NÃO é o ano do edital '
  'publicado — a tela rotula como "provas oficiais até AAAA".';


-- ════════════════════════════════════════════════════════════════════
-- 3. Frases motivacionais — variedade onde faltava
-- ════════════════════════════════════════════════════════════════════
-- As 60 de 'erro' continuam de pé (migration 004). O que entra aqui:
--
--   • combo_quebrado: de 3 para 15. Esta é a categoria que aparece quando o
--     aluno errou vindo de 5+ acertos seguidos — o momento de maior risco de
--     ele fechar a aba. Três frases em rodízio viravam ruído na segunda
--     sessão.
--   • acerto: de 5 para 15. Dispara a cada 10 acertos do combo.
--   • retorno: de 2 para 10. Primeira tela de quem voltou depois de sumir.

INSERT INTO frases_motivacionais (texto, categoria)
SELECT v.texto, v.categoria FROM (VALUES
  -- ── Combo quebrado (vinha de 5 ou mais acertos seguidos) ──
  ('Caiu de uma sequência boa — e sequência boa não se perde, se recomeça. O que você aprendeu continua aí.', 'combo_quebrado'),
  ('O combo zerou. Seu repertório não. Uma coisa é placar, a outra é preparo.', 'combo_quebrado'),
  ('Você chegou longe nessa corrente. Agora descubra o que quebrou ela — é isso que vale a sessão inteira.', 'combo_quebrado'),
  ('Toda sequência tem um fim. A pergunta que importa é: quanto tempo até a próxima começar?', 'combo_quebrado'),
  ('Sequência interrompida. Respira, lê a resolução e recomeça — você já provou que consegue emendar acertos.', 'combo_quebrado'),
  ('Foi um tropeço, não uma queda. Quem vinha nesse ritmo volta rápido.', 'combo_quebrado'),
  ('Perdeu o combo numa questão que te ensinou algo. Esse é o melhor jeito de perder.', 'combo_quebrado'),
  ('A corrente arrebentou no elo mais fraco. Achou o elo. Agora reforça.', 'combo_quebrado'),
  ('Ninguém acerta tudo até o fim. Nem na prova. O que conta é o total.', 'combo_quebrado'),
  ('Zerou a contagem, não o seu nível. Bora reconstruir maior.', 'combo_quebrado'),
  ('Você estava embalado — e questão difícil aparece justamente quando você sobe de patamar.', 'combo_quebrado'),
  ('Combo quebrado é sinal de que você não estava só chutando fácil. Estava avançando.', 'combo_quebrado'),
  ('Guarde o assunto dessa. É o único que resistiu à sua sequência.', 'combo_quebrado'),
  ('A sequência era boa, a próxima vai ser melhor — porque agora você tem uma armadilha a menos pela frente.', 'combo_quebrado'),
  ('Não deixa a sequência quebrada virar sessão encerrada. Próxima questão.', 'combo_quebrado'),

  -- ── Acerto (a cada 10 do combo) ──
  ('Dez seguidas. Isso não é sorte, é padrão — e padrão é o que a banca cobra.', 'acerto'),
  ('Ritmo de aprovado. Segura essa concentração.', 'acerto'),
  ('Você está lendo o enunciado do jeito certo. Continua assim.', 'acerto'),
  ('Consistência é o que separa quem passa de quem quase passa. Você está construindo a sua.', 'acerto'),
  ('Sequência limpa. Esse é o estado em que você quer chegar no dia da prova.', 'acerto'),
  ('Mais uma leva sem errar. Seu tempo de estudo está virando resultado.', 'acerto'),
  ('Essa matéria virou território seu. Aproveita o embalo e ataca a que você foge.', 'acerto'),
  ('Acertar em sequência treina algo que a prova cobra e ninguém ensina: manter a cabeça fria.', 'acerto'),
  ('Você está resolvendo no automático — e é isso que sobra de energia para as difíceis.', 'acerto'),
  ('Placar limpo. Agora tenta subir a dificuldade e ver até onde vai.', 'acerto'),

  -- ── Retorno (voltou depois de um tempo sumido) ──
  ('Voltou. É só isso que a maioria não faz — e é por isso que a maioria não passa.', 'retorno'),
  ('A caverna estava esperando. Retomamos de onde você parou.', 'retorno'),
  ('Sumir acontece. Voltar é escolha. Boa escolha.', 'retorno'),
  ('Sua sequência de dias pode ter caído, mas o que você estudou continua na sua cabeça.', 'retorno'),
  ('Começa devagar hoje: dez questões já recolocam você no ritmo.', 'retorno'),
  ('Bem-vindo de volta, soldado. Vamos revisar o que ficou pendente.', 'retorno'),
  ('O plano de estudo não te cobra o tempo perdido. Ele só quer você aqui hoje.', 'retorno'),
  ('Quem volta depois de parar é quem chega. Sem drama, bora estudar.', 'retorno')
) AS v(texto, categoria)
WHERE NOT EXISTS (
  SELECT 1 FROM frases_motivacionais f WHERE f.texto = v.texto
);


-- ════════════════════════════════════════════════════════════════════
-- 4. Conferência
-- ════════════════════════════════════════════════════════════════════

-- Quantas questões o aluno vê com e sem comentário escrito.
SELECT
  tem_comentario,
  COUNT(*) AS questoes
FROM questoes
WHERE ativa = TRUE
GROUP BY tem_comentario
ORDER BY tem_comentario DESC NULLS LAST;

-- Ano-base de cada concurso (NULO = sem questão cadastrada ainda).
SELECT sigla, edital_ano, edital_url IS NOT NULL AS tem_link
FROM concursos
ORDER BY ordem_exibicao;

-- Variedade das frases: erro 60, combo_quebrado 18, acerto 15, retorno 10.
SELECT categoria, COUNT(*) AS frases
FROM frases_motivacionais
WHERE ativa
GROUP BY categoria
ORDER BY categoria;
