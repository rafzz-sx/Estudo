-- ============================================================================
-- BatCaverna — Conteúdo teórico: HISTÓRIA, ARTES, ED. FÍSICA e ATUALIDADES
-- ============================================================================
-- História tinha 151 questões e dois textos ("República Velha", "Era Vargas")
-- cujos nomes não batiam com nenhum assunto canônico — na prática, cobertura
-- zero. Artes (54), Educação Física (29) e Atualidades (11) não tinham nada.
--
-- Os nomes dos temas são IGUAIS aos assuntos canônicos (migration 011): é o
-- que permite o radar de fraqueza levar o aluno da questão errada ao texto.
-- ============================================================================

BEGIN;

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════ HISTÓRIA
('Brasil República',
 'Brasil República: de 1889 aos dias de hoje',
 'O assunto mais cobrado de História — os períodos, o que define cada um e as datas que a banca exige.',
 $md$
33 questões neste banco. É o assunto nº 1 de História, e cai em todos os concursos militares e no ENEM.

## A linha do tempo que resolve

| Período | Anos | O que define |
| --- | --- | --- |
| **República da Espada** | 1889–1894 | Militares no poder: Deodoro e Floriano |
| **República Velha (Oligárquica)** | 1894–1930 | Café com leite, coronelismo, voto de cabresto |
| **Era Vargas** | 1930–1945 | Governo Provisório → Constitucional → **Estado Novo** (1937) |
| **República Populista** | 1946–1964 | Dutra, Vargas eleito, JK, Jânio, Jango |
| **Ditadura Militar** | 1964–1985 | AI-5 (1968), milagre econômico, abertura "lenta e gradual" |
| **Nova República** | 1985–hoje | Constituição de 1988, Plano Real, redemocratização |

## O que a banca cobra de cada um

### República Velha
- **Política dos governadores** (Campos Sales) — o governo federal apoia a oligarquia estadual, que garante deputados alinhados
- **Café com leite** — alternância SP (café) e MG (leite). Quebrou em 1929, quando Washington Luís indicou outro paulista
- **Coronelismo e voto de cabresto** — voto aberto, controlado pelo coronel local
- Revoltas: Canudos (1897), Contestado, Vacina (1904), Chibata (1910), Tenentismo e a **Coluna Prestes** (1925-27)

### Era Vargas
- **1930** — a Revolução que põe fim à República Velha
- **1932** — Revolução Constitucionalista de SP, que **perde** militarmente mas conquista a Constituição de 1934
- **1937** — golpe do Estado Novo, com o falso **Plano Cohen** como pretexto
- Legado trabalhista: CLT (1943), salário mínimo, carteira de trabalho — e o conceito de **cidadania regulada**
- **Populismo**: relação direta líder-massa, por cima dos partidos

### Ditadura Militar
- **1964** — golpe contra Jango, com apoio de setores civis, da Igreja e da imprensa
- **AI-5 (1968)** — o mais duro: fecha o Congresso, suspende habeas corpus, institucionaliza a censura
- **Milagre econômico (1969-73)** — crescimento alto com concentração de renda ("o bolo cresce primeiro")
- **Abertura** — Geisel e Golbery, "lenta, gradual e segura". Anistia (1979), Diretas Já (1984, **derrotada**), Tancredo eleito indiretamente

> **A pegadinha das Diretas Já:** a emenda Dante de Oliveira **não passou**. Tancredo Neves foi eleito pelo Colégio Eleitoral, indiretamente. Muita alternativa erra de propósito nesse ponto.
$md$, 12, 1),

-- ══════════════════════════════════════════════
('Brasil Império',
 'Brasil Império: 1822 a 1889',
 'Primeiro Reinado, Regência e Segundo Reinado — as revoltas, a escravidão e a queda da monarquia.',
 $md$
## Os três blocos

| Fase | Anos | Marca |
| --- | --- | --- |
| **Primeiro Reinado** | 1822–1831 | D. Pedro I. Constituição outorgada de 1824 |
| **Período Regencial** | 1831–1840 | O mais turbulento. Revoltas em todo o país |
| **Segundo Reinado** | 1840–1889 | D. Pedro II. Café, Guerra do Paraguai, abolição |

## Primeiro Reinado

- **Constituição de 1824** — **outorgada** (imposta), não votada. Cria o **Poder Moderador**, exclusivo do imperador, acima dos outros três
- **Confederação do Equador (1824)** — PE, republicana e separatista, esmagada
- Desgaste: Guerra da Cisplatina (perdida), morte de Líbero Badaró, e a abdicação em 1831

## Regência

Governo em nome de Pedro II, ainda criança. As revoltas caem sempre:

| Revolta | Onde | Motivo |
| --- | --- | --- |
| **Cabanagem** | Pará | A única com poder popular efetivo |
| **Balaiada** | Maranhão | Sertanejos e escravizados |
| **Sabinada** | Bahia | Republicana, urbana |
| **Farroupilha** | RS | A mais longa (10 anos), republicana |
| **Malê** | Bahia (1835) | Revolta de africanos muçulmanos escravizados |

- **Ato Adicional (1834)** — descentraliza, cria assembleias provinciais
- **Golpe da Maioridade (1840)** — antecipam a coroação de Pedro II, com 14 anos, para conter as revoltas

## Segundo Reinado

**Economia:** o café do Vale do Paraíba e depois do Oeste Paulista financia tudo.

**Fim da escravidão, em etapas:**

| Ano | Lei | O que fez |
| --- | --- | --- |
| 1831 | "Lei para inglês ver" | Proibia o tráfico — e não foi cumprida |
| 1850 | **Eusébio de Queirós** | Proíbe o tráfico de fato |
| 1871 | **Ventre Livre** | Filho de escravizada nasce livre — mas fica com o senhor até os 21 |
| 1885 | **Sexagenários** | Liberta com 60 anos — idade que poucos alcançavam |
| 1888 | **Lei Áurea** | Abolição, sem nenhuma política de integração |

> As leis de 1871 e 1885 são cobradas como **medidas paliativas**: libertavam quem tinha pouca ou nenhuma capacidade de trabalho, adiando a abolição real.

**Queda da monarquia:** Guerra do Paraguai fortalece o Exército; a Questão Militar e a Questão Religiosa afastam apoios; a abolição rompe com os fazendeiros escravistas. Em 1889, a monarquia estava sem base social.
$md$, 10, 2),

-- ══════════════════════════════════════════════
('Brasil Colônia',
 'Brasil Colônia: 1500 a 1822',
 'Os ciclos econômicos, a administração colonial e a escravidão — a base de tudo que vem depois.',
 $md$
## Os ciclos econômicos

| Ciclo | Quando | Onde | Como funcionava |
| --- | --- | --- | --- |
| **Pau-brasil** | 1500–1530 | Litoral | Escambo com indígenas, feitorias |
| **Açúcar** | 1530–1650 | Zona da Mata NE | *Plantation*: latifúndio, monocultura, escravidão, exportação |
| **Mineração** | 1690–1780 | MG, GO, MT | Urbanização, controle fiscal pesado |
| **Café** (já no fim) | a partir de 1800 | Vale do Paraíba | Sustenta o Império |

> **Plantation** é a palavra que a banca quer: latifúndio + monocultura + trabalho escravizado + voltado à exportação. Os quatro elementos juntos.

## Administração

- **Capitanias hereditárias (1534)** — divisão em 15 lotes doados a donatários. Só duas prosperaram: Pernambuco e São Vicente
- **Governo-Geral (1549)** — centraliza. Tomé de Sousa, Salvador como capital
- **Câmaras Municipais** — o poder local, nas mãos dos "homens bons" (proprietários)
- **Pacto colonial / exclusivo metropolitano** — a colônia só comercia com a metrópole

## Mineração e revoltas

O ouro trouxe fiscalização dura:
- **Quinto** — 20% para a Coroa
- **Casas de fundição (1720)** — todo ouro fundido em barras marcadas
- **Derrama** — cobrança forçada do atraso do quinto. Foi o estopim da **Inconfidência Mineira (1789)**

| Movimento | Ano | Caráter |
| --- | --- | --- |
| **Inconfidência Mineira** | 1789 | Elite letrada, separatista, sem projeto popular |
| **Conjuração Baiana** | 1798 | Popular, com participação negra, propunha fim da escravidão |

> A comparação entre as duas é questão garantida: a Mineira era **elitista**; a Baiana, **popular e abolicionista**.

## Escravidão

- Indígena primeiro, africana depois — por resistência indígena, mortalidade por doenças e pelo lucro do tráfico
- **Quilombos** como resistência organizada. Palmares durou quase um século
- Outras formas: fuga, revolta, sabotagem, suicídio, aborto, preservação cultural (capoeira, religiões)

## Invasões

- **Holandeses em Pernambuco (1630-1654)** — Nassau moderniza o Recife; expulsos após Guararapes, batalha considerada marco da identidade militar brasileira
- **Franceses** — França Antártica (RJ) e França Equinocial (MA)
$md$, 10, 3),

-- ══════════════════════════════════════════════ ARTES
('Movimentos Artísticos',
 'Movimentos Artísticos: das vanguardas ao modernismo brasileiro',
 'As vanguardas europeias e a Semana de 22 — o que cada movimento defendia e como reconhecê-lo numa imagem.',
 $md$
Questão de Artes quase sempre traz uma **imagem** e pede o movimento. Reconhecer pelo traço vale mais que decorar data.

## As vanguardas europeias

| Movimento | Como reconhecer | Nomes |
| --- | --- | --- |
| **Impressionismo** | Luz, pincelada solta, cena ao ar livre | Monet, Renoir, Degas |
| **Expressionismo** | Cor distorcida, angústia, deformação | Munch, Van Gogh |
| **Cubismo** | Figura decomposta em formas geométricas, vários ângulos ao mesmo tempo | Picasso, Braque |
| **Futurismo** | Velocidade, máquina, movimento | Boccioni, Marinetti |
| **Dadaísmo** | Absurdo, provocação, anti-arte | Duchamp (o urinol) |
| **Surrealismo** | Sonho, inconsciente, imagem impossível | Dalí, Magritte |
| **Abstracionismo** | Sem figura reconhecível | Kandinsky, Mondrian |

> **Dadaísmo × Surrealismo:** o dadaísmo quer **destruir** o conceito de arte pelo absurdo; o surrealismo quer **explorar o inconsciente**. Duchamp provoca; Dalí sonha.

## Modernismo brasileiro

**Semana de Arte Moderna — 1922, Teatro Municipal de São Paulo.** Foi vaiada, e era o que se queria: romper com o academicismo.

**Três fases:**

| Fase | Anos | Marca |
| --- | --- | --- |
| **Heroica** | 1922–1930 | Ruptura, nacionalismo, humor. *Antropofagia* |
| **Consolidação** | 1930–1945 | Romance social, denúncia, regionalismo |
| **Pós-45** | 1945–1960 | Concretismo, experimentação formal |

**Antropofagia (Oswald de Andrade, 1928)** — "devorar" a cultura estrangeira e transformá-la em algo brasileiro, em vez de copiá-la ou recusá-la. É o conceito mais cobrado.

**Artistas para reconhecer:**
- **Tarsila do Amaral** — *Abaporu*, *Operários*. Cores vivas, formas arredondadas, pés e mãos grandes
- **Anita Malfatti** — a exposição de 1917 que provocou a crítica de Monteiro Lobato e detonou o movimento
- **Di Cavalcanti** — mulatas, samba, o povo brasileiro
- **Candido Portinari** — *Os Retirantes*, *Guerra e Paz*. Denúncia social

## Arte contemporânea

O que a define não é o estilo, é a **atitude**: a obra pode ser uma performance, uma instalação, uma ideia. Frequentemente o público faz parte dela.

- **Hélio Oiticica** — *Parangolés*: capas para vestir e dançar. A obra só existe com o corpo
- **Lygia Clark** — *Bichos*: o espectador manipula
- **Arte urbana** — grafite, intervenção. Questiona o museu como único lugar da arte
$md$, 10, 1),

-- ══════════════════════════════════════════════
('Patrimônio e Cultura Popular',
 'Patrimônio e Cultura Popular brasileira',
 'Material e imaterial, as manifestações regionais e o conceito de identidade cultural.',
 $md$
## Patrimônio: as duas naturezas

| Tipo | O que é | Exemplos brasileiros |
| --- | --- | --- |
| **Material** | Edificações, sítios, objetos | Ouro Preto, Congonhas, centro histórico de Olinda |
| **Imaterial** | Saberes, celebrações, formas de expressão | Samba de roda, frevo, capoeira, ofício das baianas |

O **IPHAN** é o órgão federal responsável. O reconhecimento do imaterial é recente (2000) e mudou a ideia do que merece ser preservado: não só a pedra, mas o **saber fazer**.

## Manifestações por região

- **Norte** — Boi-bumbá (Parintins), carimbó
- **Nordeste** — Frevo, maracatu, bumba meu boi, cordel, forró, capoeira
- **Centro-Oeste** — Congada, cavalhadas, siriri
- **Sudeste** — Samba, congado, folia de reis
- **Sul** — Fandango, chula, tradições açorianas e gaúchas

## Conceitos que a banca cobra

- **Identidade cultural** — o que um grupo reconhece como seu
- **Hibridismo cultural** — a mistura que produz algo novo (o samba é africano, europeu e urbano ao mesmo tempo)
- **Indústria cultural** (Adorno e Horkheimer) — a cultura vira mercadoria produzida em série; padroniza o gosto e transforma o público em consumidor passivo
- **Apropriação cultural** — usar elemento de uma cultura minorizada sem seu contexto, geralmente com lucro para quem se apropria

> A questão típica: um texto sobre uma manifestação popular e a alternativa correta é a que reconhece **resistência cultural** ou **hibridismo** — não a que trata a manifestação como folclore congelado no passado.
$md$, 8, 2),

-- ══════════════════════════════════════════════ EDUCAÇÃO FÍSICA
('Esporte e Prática Esportiva',
 'Esporte: dimensões, regras e o que a prova cobra',
 'As três dimensões do esporte, os sistemas de disputa e os temas sociais que a banca associa à prática esportiva.',
 $md$
## As três dimensões do esporte

| Dimensão | Objetivo | Onde acontece |
| --- | --- | --- |
| **Educacional** | Formar, incluir, cooperar | Escola |
| **Participação / lazer** | Bem-estar, convívio | Comunidade, clube |
| **Rendimento** | Resultado, competição, recorde | Alto nível, profissional |

> A confusão que a banca explora: tratar o esporte **escolar** com lógica de **rendimento** — selecionar os melhores e excluir o resto. A resposta correta costuma ser a que defende a inclusão de todos.

## Esporte e sociedade

- **Doping** — não é só trapaça: é problema de saúde pública e de pressão por resultado. O controle é da WADA / ABCD
- **Esporte e mídia** — a transmissão molda o próprio esporte (horários, regras, duração)
- **Gênero no esporte** — participação feminina foi proibida ou restringida por décadas; questões cobram a desigualdade de investimento e visibilidade
- **Esporte paralímpico** — classificação funcional, tecnologia assistiva, e o conceito de **equidade** (tratar diferente para dar chance igual)
- **Megaeventos** — legado prometido × custo real; remoções e obras subutilizadas

## Fisiologia básica

| Sistema | Duração | Intensidade | Exemplo |
| --- | --- | --- | --- |
| **ATP-CP (anaeróbio alático)** | até ~10 s | máxima | Arranque de 100 m |
| **Glicolítico (anaeróbio lático)** | 10 s a ~2 min | alta | 400 m rasos |
| **Aeróbio** | acima de ~2 min | moderada | Corrida de 12 minutos |

- **VO₂ máx** — volume máximo de oxigênio consumido. Principal indicador de condicionamento aeróbio
- **Frequência cardíaca máxima** — estimada por 220 − idade. Usada para definir zonas de treino
- **Princípios do treinamento** — sobrecarga progressiva, especificidade, individualidade, reversibilidade

> Para o TAF: corrida de 12 minutos é **aeróbia**; barra fixa e flexão são **anaeróbias**. Treinar só um dos dois deixa metade da prova descoberta.
$md$, 8, 1),

-- ══════════════════════════════════════════════
('Saúde e Qualidade de Vida',
 'Saúde e Qualidade de Vida',
 'Sedentarismo, composição corporal e as recomendações que a prova cobra.',
 $md$
## Saúde não é ausência de doença

A definição da OMS é **bem-estar físico, mental e social**. Questão que trata saúde só como "não estar doente" costuma ser a alternativa errada.

## Sedentarismo

É fator de risco para hipertensão, diabetes tipo 2, obesidade, doenças cardiovasculares e depressão.

**Recomendação da OMS para adultos:** pelo menos **150 minutos por semana** de atividade moderada, ou 75 de vigorosa, mais dois dias de fortalecimento muscular.

> Atividade física ≠ exercício físico. **Atividade** é qualquer movimento que gasta energia (subir escada, caminhar até o ponto). **Exercício** é planejado, estruturado e repetitivo, com objetivo. Todo exercício é atividade; nem toda atividade é exercício.

## Composição corporal

- **IMC** = peso ÷ altura². Simples, mas grosseiro: não distingue músculo de gordura, e classifica atleta como obeso
- **Percentual de gordura** e **relação cintura-quadril** medem melhor o risco

## Capacidades físicas

| Capacidade | O que é |
| --- | --- |
| **Resistência aeróbia** | Sustentar esforço prolongado |
| **Força** | Vencer resistência |
| **Velocidade** | Deslocar-se rápido |
| **Flexibilidade** | Amplitude da articulação |
| **Agilidade** | Mudar de direção rápido |
| **Coordenação** | Organizar o movimento |

## Alimentação e desempenho

- **Carboidrato** — principal combustível do exercício
- **Proteína** — reparo e construção muscular
- **Hidratação** — perda de 2% do peso em água já reduz o desempenho
- Suplemento não substitui alimentação. Anabolizante sem prescrição é risco sério: efeitos hepáticos, cardíacos e hormonais

> Tema recorrente: **culto ao corpo e vigorexia** — a busca da estética acima da saúde, alimentada por mídia e redes sociais. A alternativa correta costuma criticar o padrão estético, não a prática esportiva.
$md$, 7, 2),

-- ══════════════════════════════════════════════ ATUALIDADES
('Meio Ambiente e Clima',
 'Meio Ambiente e Clima: a pauta que cai todo ano',
 'Acordos climáticos, os conceitos que a prova exige e o recorte brasileiro.',
 $md$
## Os acordos

| Acordo | Ano | O que estabeleceu |
| --- | --- | --- |
| **Eco-92 (Rio)** | 1992 | Agenda 21, convenções do clima e da biodiversidade |
| **Protocolo de Kyoto** | 1997 | Metas obrigatórias só para países desenvolvidos |
| **Acordo de Paris** | 2015 | Metas voluntárias para TODOS; limitar o aquecimento a 1,5–2 °C |
| **COPs** | anuais | Conferências de acompanhamento |

> **Kyoto × Paris:** Kyoto obrigava só os desenvolvidos, com base na "responsabilidade comum mas diferenciada". Paris incluiu todos, mas com metas que cada país define. É a comparação mais cobrada.

## Conceitos

- **Efeito estufa** — natural e necessário. O problema é a **intensificação** por gases de origem humana
- **Aquecimento global × mudança climática** — o segundo é mais amplo: inclui eventos extremos, secas e enchentes, não só temperatura média
- **Pegada de carbono** — emissões atribuíveis a uma pessoa, produto ou país
- **Desenvolvimento sustentável** — atender o presente sem comprometer as gerações futuras (Relatório Brundtland, 1987)
- **ODS** — 17 Objetivos de Desenvolvimento Sustentável da ONU, agenda 2030

## O recorte brasileiro

- **Amazônia** — desmatamento por pecuária, grilagem, garimpo. Conceito de **ponto de não retorno**: a floresta deixaria de gerar a própria chuva
- **Rios voadores** — a umidade que a Amazônia lança na atmosfera e que abastece a chuva no Centro-Sul
- **Cerrado** — o bioma que mais perde área, e é o "berço das águas" de três grandes bacias
- **Matriz energética** — o Brasil tem uma das mais limpas do mundo (hidrelétrica + renováveis), mas com problemas próprios: alagamento de áreas, deslocamento de populações, dependência de chuva
- **Crise hídrica** — não é só falta de chuva: é desmatamento, desperdício e gestão

> A questão típica traz um texto sobre desmatamento e pede a relação com o clima. A resposta liga desmatamento → menos evapotranspiração → menos chuva → mais seca → mais incêndio — o ciclo que se retroalimenta.
$md$, 8, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem)
  ON m.nome = CASE
    WHEN v.tema IN ('Brasil República', 'Brasil Império', 'Brasil Colônia') THEN 'História'
    WHEN v.tema IN ('Movimentos Artísticos', 'Patrimônio e Cultura Popular') THEN 'Artes'
    WHEN v.tema IN ('Esporte e Prática Esportiva', 'Saúde e Qualidade de Vida') THEN 'Educação Física'
    ELSE 'Atualidades'
  END
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

-- Conferência: História 3, Artes 2, Educação Física 2, Atualidades 1.
SELECT m.nome AS materia, COUNT(*) AS temas
FROM teoria_conteudo t JOIN materias m ON m.id = t.materia_id
WHERE m.nome IN ('História', 'Artes', 'Educação Física', 'Atualidades')
GROUP BY m.nome ORDER BY m.nome;
