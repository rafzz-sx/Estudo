-- ============================================================================
-- BatCaverna — Conteúdo teórico: CIÊNCIAS HUMANAS
-- ============================================================================
-- História, Geografia, Filosofia e Sociologia: as quatro matérias que tinham
-- questão no banco (151, 124, 46 e 64 respectivamente) e nenhuma teoria.
--
-- Os TEMAS batem exatamente com os de `videoaulas` (seed videoaulas_01.sql).
-- É esse casamento por `tema` que faz a trilha mostrar texto e vídeo do
-- mesmo assunto lado a lado.
--
-- Idempotente: a UNIQUE (materia_id, tema, nivel) impede duplicata.
-- Strings usam dollar-quoting ($md$...$md$) para o Markdown poder conter
-- aspas, apóstrofos e barras sem escape.
-- ============================================================================

BEGIN;

-- ════════════════════════════════════════════════════════════════════
-- HISTÓRIA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('República Velha',
 'República Velha (1889–1930): o Brasil dos coronéis e do café',
 'Da Proclamação a 1930: política dos governadores, café com leite, coronelismo, as revoltas e o esgotamento que abre caminho para Vargas.',
 $md$
A República Velha é o período mais cobrado de História do Brasil nos concursos militares e no ENEM. E quase sempre pelo mesmo ângulo: **quem mandava, como se mantinha no poder, e quem reagiu**.

## A linha do tempo em cinco marcos

| Ano | O que aconteceu | Por que importa |
| --- | --- | --- |
| 1889 | Proclamação da República | Golpe militar, sem participação popular. "O povo assistiu bestializado" (Aristides Lobo) |
| 1889–1894 | **República da Espada** | Deodoro e Floriano: militares no poder |
| 1894–1930 | **República Oligárquica** | Civis paulistas e mineiros assumem |
| 1922 | Semana de Arte Moderna + Revolta do Forte de Copacabana | O ano em que a contestação vira cultural E militar |
| 1930 | Revolução de 1930 | Vargas assume, fim do período |

> **Pegadinha clássica:** "República Velha" e "Primeira República" são o mesmo período. A prova alterna os dois nomes de propósito.

## O tripé que sustentava o sistema

Entenda os três e você resolve a maioria das questões:

### 1. Política dos Governadores (Campos Sales, 1898)
O presidente apoia o candidato oficial de cada estado; em troca, as bancadas estaduais aprovam tudo no Congresso. É uma **troca de favores institucionalizada**: o poder federal não briga com o poder estadual.

### 2. Coronelismo
No município, o "coronel" (grande proprietário de terra, título herdado da Guarda Nacional) controla o voto. Ferramentas:
- **Voto de cabresto** — o eleitor vota sob pressão econômica ou física
- **Voto aberto** — não havia urna secreta, então dava para conferir
- **Comissão de Verificação de Poderes** — o Congresso simplesmente *anulava* a eleição de quem não era do grupo. Ficou conhecida como **"degola"**

### 3. Política do Café com Leite
Alternância na presidência entre **São Paulo** (café) e **Minas Gerais** (leite/gado). Funcionou porque os dois estados tinham juntos a maior população, a maior economia e as maiores bancadas.

> Como isso cai: a questão descreve uma dessas três engrenagens sem nomear e pede o nome. Ou dá o nome e pede o mecanismo. Saiba os dois sentidos.

## A economia: café e o Convênio de Taubaté (1906)

O café era ~70% das exportações. Quando a superprodução derrubou o preço internacional, os cafeicultores não aceitaram perder:

**Convênio de Taubaté** — o governo compra o excedente com empréstimo estrangeiro, estoca (ou queima) e segura o preço.

É o exemplo mais citado de **socialização do prejuízo**: o lucro fica privado, a dívida vira pública. Questão de ENEM adora esse enquadramento.

## Quem reagiu — as revoltas

Decore por **causa**, não por data:

| Revolta | Onde | Causa central |
| --- | --- | --- |
| **Canudos** (1896–97) | Sertão da Bahia | Miséria + messianismo (Antônio Conselheiro). O Estado leu como monarquismo |
| **Contestado** (1912–16) | Fronteira SC/PR | Disputa de terra com a ferrovia + messianismo |
| **Vacina Obrigatória** (1904) | Rio de Janeiro | Vacinação imposta sem explicação + reforma urbana que expulsou pobres |
| **Chibata** (1910) | Rio de Janeiro | Castigo físico em marinheiros negros. Liderada por João Cândido |
| **Tenentismo** (1922–27) | Vários | Militares de baixa patente contra a fraude eleitoral. Pedem voto secreto |

> **Fio condutor que a banca cobra:** Canudos e Contestado são o **campo** reagindo à exclusão; Vacina e Chibata são a **cidade**; o Tenentismo é a **caserna**. Três frentes, mesmo diagnóstico — o sistema só representava a elite agrária.

## Por que 1930 acontece

Três coisas se somam:

1. **Crise de 1929** — o café perde o comprador americano. O tripé econômico racha.
2. **Ruptura do café com leite** — Washington Luís (SP) indica outro paulista, Júlio Prestes, em vez do mineiro. Minas se sente traída.
3. **Aliança Liberal** — Minas + Rio Grande do Sul + Paraíba lançam **Getúlio Vargas**. Ele perde a eleição; o assassinato de **João Pessoa** (seu vice) vira o estopim.

Em outubro de 1930, os gaúchos "amarram os cavalos no obelisco" e Vargas assume.

## Estratégia de prova

1. **Se a questão fala em fraude eleitoral, pense no tripé.** Coronelismo → voto de cabresto → degola.
2. **Se fala em café, pense em Taubaté** e no argumento da socialização do prejuízo.
3. **Nas revoltas, procure a palavra-chave**: "messiânico" → Canudos ou Contestado; "sanitarismo" → Vacina; "castigo físico" → Chibata; "voto secreto" → Tenentismo.
4. **Cuidado com o anacronismo.** A prova adora afirmar que os revoltosos queriam "democracia" no sentido atual. Quase nunca queriam.
$md$, 14, 1),

-- ══════════════════════════════════════════════════════════════
('Era Vargas',
 'Era Vargas (1930–1945): Estado Novo, trabalhismo e o Brasil industrial',
 'Os três tempos de Vargas, a Constituição de 1934, o golpe de 1937, a CLT e por que ele volta pelo voto em 1951.',
 $md$
Getúlio Vargas manda no Brasil por **15 anos seguidos** (1930–1945) e volta eleito em 1951. Nenhuma figura aparece mais em prova de História do Brasil.

## Os três tempos — a divisão que a prova exige

| Fase | Anos | Como governa |
| --- | --- | --- |
| **Governo Provisório** | 1930–1934 | Por decreto. Sem Congresso, sem Constituição |
| **Governo Constitucional** | 1934–1937 | Eleito indiretamente sob a Constituição de 1934 |
| **Estado Novo** | 1937–1945 | Ditadura declarada, Constituição outorgada |

> Errar essa divisão é o erro mais caro do assunto. Uma medida de 1943 (CLT) é do **Estado Novo**, não do Governo Provisório.

## Governo Provisório: o que muda de cara

- **Ministério do Trabalho, Indústria e Comércio** (1930) — o Estado passa a mediar a relação capital/trabalho
- **Interventores** substituem os governadores eleitos — atinge em cheio a autonomia paulista
- **Revolução Constitucionalista de 1932 (SP)** — São Paulo pega em armas exigindo Constituição. **Perde militarmente, mas ganha politicamente**: a Constituinte é convocada

> Esse paradoxo — perdeu a guerra, ganhou a pauta — é pergunta certa.

## Constituição de 1934: as conquistas

Inspirada na de Weimar (alemã), é a primeira a tratar de direitos sociais:
- **Voto feminino** (já garantido no Código Eleitoral de 1932)
- **Voto secreto** e Justiça Eleitoral
- Jornada de **8 horas**, salário mínimo, descanso semanal
- Proibição de diferença salarial por sexo, idade ou estado civil

## 1937: o golpe e o Plano Cohen

Vargas alega que existe um plano comunista para tomar o país — o **Plano Cohen**, documento **forjado** por um oficial integralista. Com isso decreta estado de guerra, fecha o Congresso e outorga a Constituição de 1937 (a **"Polaca"**, inspirada na polonesa autoritária).

### Os dois extremos que ele usa e descarta

| Movimento | Ideologia | Fim |
| --- | --- | --- |
| **ANL** (Aliança Nacional Libertadora) | Esquerda, liderada por Prestes | Intentona Comunista (1935) → repressão brutal |
| **AIB** (Ação Integralista Brasileira) | Extrema-direita, Plínio Salgado | Apoia o golpe, tenta tomar o poder em 1938 → também é dissolvida |

> **A lógica de Vargas:** usa o medo do comunismo para justificar o golpe, e depois elimina também o aliado de direita. Ele não é de nenhum dos dois lados — é do próprio poder.

## Estado Novo: trabalhismo e propaganda

### O que ele dá ao trabalhador
- **CLT (1943)** — consolida a legislação trabalhista num único código
- Carteira de trabalho, férias, aposentadoria
- Salário mínimo efetivado (1940)

### O que ele cobra em troca
- **Sindicato atrelado ao Estado** (imposto sindical, unicidade sindical, pelego)
- **Greve proibida**
- **DIP** (Departamento de Imprensa e Propaganda) — censura e constrói a imagem de "pai dos pobres"

> **A tese que a prova quer:** os direitos não foram conquistados na rua, foram **outorgados de cima**. Isso é o que se chama de **populismo** ou **trabalhismo getulista** — o trabalhador recebe direitos e, em troca, entrega autonomia política.

## Industrialização e a barganha da guerra

- **CSN — Companhia Siderúrgica Nacional (Volta Redonda, 1941)**
- Vale do Rio Doce, Fábrica Nacional de Motores

O financiamento vem dos EUA em troca de bases militares no Nordeste. Vargas negocia entre Alemanha e EUA até o último minuto — é a **"equidistância pragmática"**.

## A queda — e a ironia final

O Brasil manda a **FEB** lutar contra o fascismo na Itália. Fica insustentável: um país que combate ditadura fora e vive sob ditadura dentro. Em 1945 os militares depõem Vargas.

Mas antes ele cria o **PTB** e o **PSD**. Em **1951 volta eleito pelo voto popular**, e em **1954**, cercado, se mata deixando a Carta Testamento.

## Estratégia de prova

1. **Datou? Situe a fase primeiro.** Provisório / Constitucional / Estado Novo.
2. **"Pai dos pobres" nunca é elogio na resposta certa.** A alternativa correta costuma apontar o custo político do benefício.
3. **Plano Cohen = documento falso.** Se a alternativa o trata como real, está errada.
4. **CLT é 1943**, não 1930 nem 1937.
$md$, 15, 2)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'História'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- GEOGRAFIA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Climatologia',
 'Climatologia: fatores, tipos climáticos e a leitura de climogramas',
 'A diferença entre tempo e clima, os seis fatores climáticos, os climas do Brasil e como ler um climograma sem errar.',
 $md$
Climatologia é a parte de Geografia Física que mais cai — e quase sempre com **gráfico**. Quem sabe ler climograma resolve em 30 segundos.

## Tempo ≠ Clima

- **Tempo**: estado da atmosfera **agora**, num lugar. Muda em horas.
- **Clima**: **padrão** desses estados ao longo de ~30 anos.

> "Choveu muito hoje" é tempo. "Chove muito em janeiro" é clima. A prova troca os dois de propósito.

## Elementos × Fatores — não confunda

| | O que é | Exemplos |
| --- | --- | --- |
| **Elementos** | O que se **mede** | Temperatura, umidade, pressão, precipitação, ventos |
| **Fatores** | O que **causa** a variação | Latitude, altitude, maritimidade, correntes, relevo, vegetação |

### Os seis fatores, com o efeito de cada um

1. **Latitude** — quanto mais longe do Equador, menor a temperatura média. É o fator mais forte.
2. **Altitude** — sobe ~100 m, cai ~0,6 °C. Explica por que Campos do Jordão é frio na mesma latitude de São Paulo.
3. **Maritimidade × Continentalidade** — a água demora a esquentar e a esfriar (alto calor específico). Litoral tem **amplitude térmica baixa**; interior, alta.
4. **Correntes marítimas** — quentes aumentam evaporação e chuva; frias inibem. A **Corrente de Humboldt** (fria) é a razão do Deserto do Atacama.
5. **Relevo** — barreira orográfica: o ar sobe, esfria, chove na encosta a barlavento; desce seco a sotavento. Isso gera a **chuva orográfica** e o **deserto de sombra de chuva**.
6. **Vegetação e urbanização** — a **ilha de calor urbana** vem da substituição de vegetação por asfalto e concreto (baixo albedo, alta condutividade).

## Os climas do Brasil

| Clima | Onde | Marca registrada |
| --- | --- | --- |
| **Equatorial** | Amazônia | Quente e úmido o ano todo. Amplitude térmica baixíssima |
| **Tropical** | Centro-Oeste, Sudeste | **Duas estações**: verão chuvoso, inverno seco |
| **Tropical de Altitude** | Serras do Sudeste | Tropical, mas com temperaturas menores |
| **Tropical Atlântico (litorâneo úmido)** | Litoral leste | Chuva bem distribuída, influência da maritimidade |
| **Semiárido** | Sertão nordestino | Chuva escassa e **irregular**; a irregularidade pesa mais que o total |
| **Subtropical** | Sul | Única com **as quatro estações** e chuva o ano todo |

> **Pegadinha do semiárido:** não é o menor volume absoluto de chuva do país que define o problema, é a **má distribuição** e a alta evaporação.

## Como ler um climograma

O gráfico traz **barras = chuva (mm)** e **linha = temperatura (°C)**. Roteiro:

1. **Olhe a amplitude térmica** (maior menos menor temperatura).
   - Menos de 5 °C → equatorial
   - Muito alta com meses abaixo de 15 °C → subtropical
2. **Procure o mês mais seco.**
   - Nenhum mês seco → equatorial ou subtropical
   - Seca marcada no inverno → tropical
3. **Confira o hemisfério.** Se o mês mais quente é **janeiro**, é hemisfério Sul. Se é **julho**, hemisfério Norte.

> O passo 3 é o que mais elimina alternativa. A banca coloca um climograma do hemisfério Norte e oferece "clima tropical brasileiro" como isca.

## Fenômenos que caem muito

- **El Niño** — aquecimento anormal do Pacífico equatorial. No Brasil: **seca no Norte/Nordeste, chuva excessiva no Sul**.
- **La Niña** — o inverso.
- **Inversão térmica** — camada de ar frio presa sob ar quente; o poluente não dispersa. Comum em São Paulo no inverno.
- **Chuva ácida** — SO₂ e NOₓ industriais reagem com vapor d'água.
- **Efeito estufa** — natural e necessário; o problema é a **intensificação** por emissão antrópica. A alternativa que trata o efeito estufa como algo em si ruim está errada.

## Estratégia de prova

1. **Tem gráfico? Comece pela amplitude térmica.** Ela sozinha corta metade das alternativas.
2. **Mês quente = janeiro → Brasil.** Mês quente = julho → hemisfério Norte.
3. **"Irregularidade" é a palavra do semiárido**, não "ausência".
4. **Efeito estufa natural é bom.** Só a intensificação é problema.
$md$, 13, 1),

-- ══════════════════════════════════════════════════════════════
('Geopolítica',
 'Geopolítica: da Guerra Fria à ordem multipolar',
 'Mundo bipolar, descolonização, a nova ordem após 1991, blocos econômicos e os conflitos que a prova cobra.',
 $md$
Geopolítica é onde Geografia e História se encontram. A prova quase sempre parte de um mapa, uma charge ou uma notícia e pede a **lógica** por trás.

## Guerra Fria (1947–1991): a lógica bipolar

Dois blocos, nenhum confronto direto entre as superpotências:

| | EUA | URSS |
| --- | --- | --- |
| Economia | Capitalismo de mercado | Economia planificada |
| Aliança militar | **OTAN** (1949) | **Pacto de Varsóvia** (1955) |
| Economia do bloco | **Plano Marshall** | **COMECON** |

**Por que "fria":** o confronto direto era inviável pela **MAD** (destruição mútua assegurada) — ambos tinham arsenal nuclear suficiente para aniquilar o outro mesmo depois de atacados. A disputa vira **indireta**: conflitos periféricos (Coreia, Vietnã, Afeganistão), corrida espacial, espionagem, propaganda.

> **Conceito-chave:** *guerra por procuração* (proxy war). As superpotências financiam lados opostos num terceiro país.

## Descolonização e Terceiro Mundo

Ásia e África se independizam entre 1945 e 1975. Marcos:

- **Conferência de Bandung (1955)** — nasce o **Movimento dos Não Alinhados**: nem EUA, nem URSS
- Fronteiras herdadas do colonialismo, traçadas com régua, ignoram etnias → base de vários conflitos atuais (Ruanda, Sudão, Nigéria)

> A questão costuma ligar **fronteira artificial → conflito étnico contemporâneo**. Esse é o raciocínio esperado.

## 1991: o que muda

Com o fim da URSS, o mundo deixa de ser bipolar. E vira o quê? Depende do critério — e a prova cobra exatamente isso:

| Critério | Configuração |
| --- | --- |
| **Militar** | **Unipolar** — os EUA sem rival |
| **Econômico** | **Multipolar** — EUA, União Europeia, China, Japão |
| **Síntese usada em prova** | **"Unimultipolar"** ou multipolaridade em construção |

## Blocos econômicos — os quatro graus

Saiba a escada, porque a banca troca os nomes:

1. **Zona de Livre Comércio** — sem tarifas entre membros (ex.: USMCA/NAFTA)
2. **União Aduaneira** — o acima + **Tarifa Externa Comum** (ex.: **Mercosul**)
3. **Mercado Comum** — o acima + livre circulação de pessoas, capital e serviços
4. **União Econômica e Monetária** — o acima + moeda e política econômica únicas (**União Europeia** / Zona do Euro)

> **Erro clássico:** dizer que o Mercosul é mercado comum. Na prática ele é **união aduaneira imperfeita** (há exceções à TEC).

## Globalização — e suas críticas

- **Fluxos**: mercadorias, capital, informação e — com muito mais barreira — pessoas
- **Desigualdade do fluxo**: capital circula livre, trabalhador não. Essa assimetria é a crítica mais cobrada
- **Milton Santos** — o geógrafo brasileiro mais citado no ENEM. Fala em **"globalização perversa"** e propõe "uma outra globalização"
- **Meio técnico-científico-informacional** — o conceito de Milton Santos para o espaço geográfico atual, onde ciência, técnica e informação estão incorporadas ao território

## Conflitos que caem

| Conflito | Raiz |
| --- | --- |
| **Israel × Palestina** | Partilha da ONU (1947), território, Jerusalém, refugiados |
| **Ucrânia × Rússia** | Expansão da OTAN, russófonos no leste, Crimeia (2014) |
| **Curdos** | Povo sem Estado, dividido entre Turquia, Iraque, Irã e Síria |
| **Caxemira** | Índia × Paquistão, herança da partilha de 1947 |

> **Curdos é o exemplo padrão** de "nação sem Estado" — o conceito de nação (identidade compartilhada) descolado do de Estado (poder soberano sobre território).

## Estratégia de prova

1. **Separe Estado, nação e território.** A maioria das questões conceituais mora aí.
2. **Guerra Fria: procure o "indireto".** Se a alternativa fala em confronto militar direto EUA×URSS, está errada.
3. **Bloco econômico: identifique o grau pela descrição**, não pelo nome.
4. **Milton Santos aparece? A resposta costuma criticar a desigualdade da globalização**, não celebrá-la.
$md$, 14, 2)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Geografia'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- FILOSOFIA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Panorama para a prova',
 'Filosofia: os autores que realmente caem e o que cada um defende',
 'De Sócrates a Foucault, em blocos: o que cada filósofo respondeu, com a frase-chave que identifica o autor na alternativa.',
 $md$
Filosofia em prova de múltipla escolha não pede erudição — pede que você **reconheça a tese pelo vocabulário**. Este é o mapa.

## Antiguidade

| Filósofo | Tese central | Palavra que denuncia o autor |
| --- | --- | --- |
| **Sócrates** | O saber começa no reconhecimento da ignorância | maiêutica, "só sei que nada sei", exame de si |
| **Platão** | O mundo sensível é cópia imperfeita do mundo das Ideias | caverna, Ideia/Forma, dualismo, reminiscência |
| **Aristóteles** | O conhecimento parte da experiência; a virtude é o meio-termo | substância, potência e ato, **mediania**, teleologia |
| **Epicuro** | Prazer é ausência de dor e perturbação | ataraxia, prazeres necessários |
| **Estoicos** | Viver conforme a natureza e a razão; aceitar o que não se controla | apatheia, destino, autodomínio |

> **Platão × Aristóteles é a comparação mais cobrada.** Platão: verdade **fora** do mundo sensível. Aristóteles: verdade **no** mundo sensível, alcançada por abstração.

## Medieval

- **Santo Agostinho** — platônico. Fé ilumina a razão. "Crer para entender."
- **São Tomás de Aquino** — aristotélico. Fé e razão são caminhos distintos que não se contradizem.

## Moderna: como conhecemos?

Esta é a divisão que estrutura o período:

| Corrente | Origem do conhecimento | Autores |
| --- | --- | --- |
| **Racionalismo** | A **razão**; os sentidos enganam | Descartes, Espinosa, Leibniz |
| **Empirismo** | A **experiência**; a mente nasce em branco | Bacon, Locke, Hume |
| **Criticismo** | Os dois: a experiência dá o conteúdo, a razão dá a forma | **Kant** |

- **Descartes** — dúvida metódica → *cogito, ergo sum*. O pensamento é a única certeza inicial.
- **Locke** — *tabula rasa*. Nada há no intelecto que não tenha passado pelos sentidos.
- **Hume** — nem causalidade é dada pela experiência; é **hábito**. Ceticismo.
- **Kant** — "**pensamentos sem conteúdo são vazios; intuições sem conceitos são cegas**". Sintetiza os dois lados. Na ética: **imperativo categórico** — aja de modo que sua máxima possa virar lei universal. A ação moral vale pelo **dever**, não pelo resultado.

## Política moderna: o contrato social

Os três aparecem juntos numa mesma questão o tempo todo:

| Autor | Estado de natureza | Contrato gera | Fica famoso por |
| --- | --- | --- | --- |
| **Hobbes** | Guerra de todos contra todos | Soberano absoluto | "O homem é o lobo do homem"; *Leviatã* |
| **Locke** | Já há direitos naturais (vida, liberdade, **propriedade**) | Estado limitado, com direito de resistência | Pai do liberalismo |
| **Rousseau** | Homem naturalmente bom; a sociedade o corrompe | **Vontade geral** | "O homem nasce livre e por toda parte está a ferros" |

> **Pegadinha:** Rousseau NÃO defende voltar ao estado de natureza. Ele propõe um contrato legítimo.

## Contemporânea

- **Marx** — o ser social determina a consciência. **Materialismo histórico**, luta de classes, **alienação** do trabalhador em relação ao produto do seu trabalho, mais-valia.
- **Nietzsche** — crítica à moral cristã como **moral de rebanho**; vontade de potência; "Deus está morto" significa o colapso dos fundamentos absolutos, não uma tese teológica.
- **Sartre** — "a **existência precede a essência**". Não há natureza humana prévia: somos o que fazemos. Daí a **liberdade como condenação** e a responsabilidade total.
- **Hannah Arendt** — **banalidade do mal**: o mal extremo pode vir da irreflexão burocrática, não de monstruosidade. Distingue **labor / trabalho / ação**.
- **Foucault** — poder não é só repressão, é **produção** de saberes e de sujeitos. **Poder disciplinar**, panóptico, biopoder.
- **Escola de Frankfurt** (Adorno, Horkheimer) — **indústria cultural**: a cultura vira mercadoria padronizada e desmobiliza a crítica. **Razão instrumental**.

## Estratégia de prova

1. **Leia o texto de apoio procurando o vocabulário-chave** da tabela. Ele entrega o autor.
2. **"Existência precede a essência" → Sartre.** "Banalidade do mal" → Arendt. "Indústria cultural" → Frankfurt. "Panóptico" → Foucault. Isso resolve muita questão sozinho.
3. **Cuidado com o senso comum.** A alternativa que "soa bonita" e genérica quase nunca é a certa; a certa é a que usa o conceito técnico.
4. **Nietzsche não prega niilismo** — ele o diagnostica e quer superá-lo.
$md$, 15, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Filosofia'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;


-- ════════════════════════════════════════════════════════════════════
-- SOCIOLOGIA
-- ════════════════════════════════════════════════════════════════════

INSERT INTO teoria_conteudo (materia_id, tema, titulo, resumo, corpo_markdown, nivel, tempo_leitura_min, ordem)
SELECT m.id, v.tema, v.titulo, v.resumo, v.corpo, 'base', v.minutos, v.ordem
FROM materias m
JOIN (VALUES

-- ══════════════════════════════════════════════════════════════
('Panorama para a prova',
 'Sociologia: os três clássicos, cultura, trabalho e cidadania',
 'Durkheim, Weber e Marx lado a lado, mais os temas brasileiros que a banca cobra: cultura, desigualdade, movimentos sociais e cidadania.',
 $md$
Sociologia no ENEM e nos concursos cobra duas coisas: **os três clássicos** e a **aplicação a um problema brasileiro atual**.

## Os três clássicos, comparados

Esta tabela resolve a maior parte das questões teóricas:

| | **Durkheim** | **Weber** | **Marx** |
| --- | --- | --- | --- |
| Objeto | **Fato social** | **Ação social** | **Modo de produção** |
| Ponto de partida | A sociedade molda o indivíduo | O indivíduo age dando **sentido** | As relações materiais determinam |
| Método | Tratar o fato social "como coisa" | **Compreensão** (*Verstehen*), tipos ideais | Materialismo histórico-dialético |
| Conceitos | Coesão, anomia, solidariedade mecânica/orgânica, consciência coletiva | Racionalização, desencantamento, burocracia, dominação (tradicional/carismática/racional-legal) | Classe, mais-valia, alienação, ideologia, infra/superestrutura |
| Vê a sociedade como | **Organismo** que busca equilíbrio | Teia de sentidos e disputas | **Conflito** entre classes |

### As três marcas do fato social (Durkheim)
1. **Exterioridade** — existe fora do indivíduo
2. **Coercitividade** — se impõe (você sente ao desobedecer)
3. **Generalidade** — vale para o grupo todo

> **Anomia** é ausência ou enfraquecimento de normas — não é "falta de lei" no sentido jurídico, é perda de referência normativa.

### Weber: a burocracia e a "jaula de ferro"
A modernidade avança pela **racionalização**: cálculo, previsibilidade, regras impessoais. O ganho é eficiência; o custo é o **desencantamento do mundo** e a sensação de aprisionamento na engrenagem burocrática.

### Marx: alienação em quatro níveis
O trabalhador se aliena (1) do **produto**, (2) do **processo** de trabalho, (3) de **si mesmo** e (4) dos **outros**.

## Cultura — os conceitos que caem

- **Cultura** — tudo que é aprendido e compartilhado socialmente. Não é biológico.
- **Etnocentrismo** — julgar o outro pelos próprios valores. É o vilão da questão.
- **Relativismo cultural** — compreender a prática dentro do seu próprio contexto.
- **Aculturação / hibridismo cultural** — contato e mistura entre culturas.
- **Indústria cultural** (Adorno e Horkheimer) — a cultura produzida como mercadoria em série.
- **Diversidade × desigualdade** — diversidade é **diferença**; desigualdade é **hierarquia de acesso**. A prova adora confundir os dois: reconhecer diversidade não resolve desigualdade.

## Trabalho: as três formas de organização

| Modelo | Marca |
| --- | --- |
| **Taylorismo** | Tempo cronometrado, separação entre quem pensa e quem executa |
| **Fordismo** | Linha de montagem, produção em massa para consumo em massa, estoque alto |
| **Toyotismo** | Produção **flexível**, *just in time*, estoque mínimo, trabalhador multifuncional |

> Toyotismo aparece ligado a **precarização** e **uberização**: flexibilidade para a empresa, insegurança para o trabalhador.

## Cidadania no Brasil

**T. H. Marshall** divide os direitos em três gerações:
1. **Civis** — liberdade, propriedade, ir e vir
2. **Políticos** — votar e ser votado
3. **Sociais** — saúde, educação, trabalho, previdência

> **A tese brasileira que a prova quer (José Murilo de Carvalho):** aqui a ordem se **inverteu**. Os direitos sociais vieram primeiro, outorgados por Vargas, antes da consolidação dos direitos civis e políticos. Isso produz o que ele chama de **"cidadania de estadania"** — a cidadania passa a depender do Estado em vez de limitá-lo.

## Movimentos sociais

- **Clássicos** — sindicatos, movimento operário. Pauta: distribuição de renda.
- **Novos movimentos sociais** — feminista, negro, LGBTQIA+, ambiental, indígena. Pauta: **reconhecimento e identidade**, não só redistribuição.
- **MST** — reforma agrária, um dos mais citados em prova brasileira.

## Estratégia de prova

1. **Identifique o clássico pelo conceito.** "Fato social" → Durkheim. "Ação social / burocracia" → Weber. "Classe / mais-valia" → Marx.
2. **Etnocentrismo é sempre a postura criticada**, nunca a resposta certa.
3. **Diversidade não é sinônimo de desigualdade.** Leia com atenção qual dos dois a questão pede.
4. **Se cair cidadania no Brasil, lembre da inversão** dos direitos sociais antes dos civis.
$md$, 15, 1)

) AS v(tema, titulo, resumo, corpo, minutos, ordem) ON m.nome = 'Sociologia'
ON CONFLICT (materia_id, tema, nivel) DO NOTHING;

COMMIT;

SELECT m.nome AS materia, COUNT(*) AS temas_de_teoria
FROM teoria_conteudo t
JOIN materias m ON m.id = t.materia_id
WHERE m.nome IN ('História', 'Geografia', 'Filosofia', 'Sociologia')
GROUP BY m.nome
ORDER BY m.nome;
