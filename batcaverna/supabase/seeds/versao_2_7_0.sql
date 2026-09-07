-- ============================================================================
-- BatCaverna — Registro da versão 2.7.0
-- ============================================================================
-- Rode POR ÚLTIMO, depois de todas as migrations e seeds.
--
-- >> ESTA VERSÃO TRAZ UMA MIGRATION NOVA: 016_redacao.sql
--    Rode-a ANTES deste arquivo. É aditiva e não destrutiva: só cria as duas
--    tabelas do módulo de redação.
--
-- ─── Dynamic Island ────────────────────────────────────────────────────────
--   • as cores do gradiente vinham da capa sem nenhum piso de contraste, e
--     capa clara gerava texto branco sobre fundo quase branco. Agora a cor é
--     escurecida até caber num teto de LUMINÂNCIA (WCAG), preservando matiz e
--     saturação: o pior caso passou de 1,0:1 para 4,57:1
--   • no celular foi para o RODAPÉ: no topo ela cobria o começo do enunciado
--     justamente quando o aluno rolava para cima para reler a questão
--   • dá para RECOLHER sem perder a fila. Antes só havia aberto ou fechado, e
--     fechar apagava a fila inteira
--   • correção à parte: o atalho de teclado engolia a barra de espaço em TODA
--     a plataforma, mesmo sem música — quebrava a rolagem da página e a
--     ativação de qualquer botão pelo teclado
--
-- ─── Simulado no peso da banca ─────────────────────────────────────────────
--   • "Formato da banca" acertava a quantidade e a duração e sorteava
--     uniformemente do concurso inteiro. Nenhuma banca distribui
--     uniformemente. Agora a prova é repartida por matéria — pelo peso do
--     edital quando cadastrado, senão pela distribuição real das provas já
--     importadas — e a tela mostra a repartição antes da primeira questão
--
-- ─── Quanto falta para o corte ─────────────────────────────────────────────
--   • as três peças já existiam e ninguém as cruzava: desempenho por matéria,
--     peso de cada matéria e a faixa histórica de aprovação. A nota projetada
--     é ponderada pelo peso da prova, não a média simples, e a tela decompõe
--     os pontos perdidos por matéria — "os 7 pontos estão em Matemática"
--
-- ─── Reta final ────────────────────────────────────────────────────────────
--   • a data da prova estava no banco e a tela só a contava para trás. A
--     menos de 30 dias o plano muda de objetivo: consolidar e simular, em vez
--     de abrir assunto novo
--
-- ─── Comparação anônima ────────────────────────────────────────────────────
--   • o ranking mostra adversários; isto mostra o alvo, e o alvo é definido
--     por VOLUME de questões. Só médias de grupo, nunca nomes, e nenhum grupo
--     com menos de 5 alunos. Quem desligou "aparecer no ranking" fica de fora
--
-- ─── Fila de Teoria (admin) ────────────────────────────────────────────────
--   • 57% das questões não têm texto vinculado. A fila ordena os assuntos sem
--     teoria por FREQUÊNCIA × ERRO COLETIVO: dez textos bem escolhidos
--     alcançam mais aluno que cinquenta aleatórios
--
-- ─── Redação (módulo novo) ─────────────────────────────────────────────────
--   • a maior lacuna da plataforma: vale 1.000 pontos no ENEM, é eliminatória
--     em vários concursos militares, e não havia nada
--   • temas reais, rubrica oficial das 5 competências com os 6 níveis de
--     cada, autoavaliação guiada e evolução por competência
--   • NÃO corrige automaticamente, de propósito: nota inventada por regra
--     seria pior que nota nenhuma
-- ============================================================================

DELETE FROM app_info;

INSERT INTO app_info (versao_atual, atualizado_em)
VALUES ('2.7.0', date_trunc('hour', NOW()));

SELECT
  versao_atual,
  to_char(atualizado_em, 'DD/MM/YYYY') || ' às ' ||
    to_char(atualizado_em, 'HH24') || 'h' AS exibido_no_rodape
FROM app_info;
