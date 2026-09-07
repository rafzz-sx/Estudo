/**
 * Importador de provas — o mesmo trabalho que `scripts/parse_questoes.py`
 * faz no terminal, agora dentro da plataforma.
 *
 * Motivo de existir: até aqui, acrescentar uma prova nova exigia rodar
 * Python na máquina certa, gerar SQL e colar no SQL Editor do Supabase.
 * O "Armazém" do painel admin fingia fazer isso — inseria duas questões de
 * exemplo escritas no código, em colunas que nem existem mais no schema.
 *
 * Este módulo lê o .txt da prova exatamente como ele sai do extrator e
 * devolve as questões prontas, com o MESMO hash SHA-256 do pipeline Python
 * (então uma prova já importada pelo terminal não entra duas vezes).
 *
 * A régua de aceitação também é a mesma de `publicavel()` no gerador de
 * seeds: só entra o que o aluno consegue de fato responder.
 *
 * O ASSUNTO passa pela taxonomia canônica, igual ao pipeline Python. Antes
 * não passava: este módulo canonizava matéria e dificuldade e gravava o
 * assunto exatamente como a banca escreveu. Como o importador cria em
 * `assuntos` o que não existe, cada prova trazida pela tela abria rótulos
 * novos — "Geometria Plana (Triângulo Equilátero e Radiciação)" virava uma
 * linha própria — e refragmentava a taxonomia que a migration 011 tinha
 * acabado de unificar (2.452 rótulos em 529). O caminho que o
 * INSTRUCOES-DEPLOY.txt chama de "recomendado" era o que desfazia o
 * trabalho, sem dar erro nenhum.
 */

import { canonizarAssunto } from '@/lib/taxonomia';

// ─── Contratos ───────────────────────────────────────────────
export interface AlternativaImportada {
  letra: string;
  texto: string;
}

export interface QuestaoImportada {
  concurso_sigla: string;
  ano: number | null;
  dia_prova: string | null;
  banca: string | null;
  numero_ordem: number;
  numero_original: string | null;
  materia: string;
  assunto: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  texto_base: string | null;
  enunciado: string;
  alternativas: AlternativaImportada[];
  resposta_correta: string | null;
  explicacao: string | null;
  figura_descricao: string | null;
  anulada: boolean;
  hash_conteudo: string;
}

export interface QuestaoRejeitada {
  numero: string;
  motivo: string;
  trecho: string;
}

export interface ResultadoParse {
  questoes: QuestaoImportada[];
  rejeitadas: QuestaoRejeitada[];
  resumo: {
    blocos_encontrados: number;
    aceitas: number;
    rejeitadas: number;
    com_gabarito: number;
    com_explicacao: number;
    com_texto_base: number;
    anuladas: number;
    concurso: string;
    ano: number | null;
  };
}

// ─── Normalização de matéria ─────────────────────────────────
// Os .txt usam nomes livres ("LÍNGUA INGLESA", "Lingua Portuguesa e
// Literatura"); a plataforma usa um conjunto fechado (tabela `materias`).
const MATERIAS_CANONICAS: Record<string, string> = {
  matematica: 'Matemática',
  portugues: 'Português',
  'lingua portuguesa': 'Português',
  'lingua portuguesa e literatura': 'Português',
  gramatica: 'Português',
  redacao: 'Redação',
  literatura: 'Literatura',
  ingles: 'Inglês',
  'lingua inglesa': 'Inglês',
  'lingua estrangeira': 'Inglês',
  espanhol: 'Espanhol',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biologia',
  historia: 'História',
  'historia do brasil': 'História',
  'historia geral': 'História',
  geografia: 'Geografia',
  filosofia: 'Filosofia',
  sociologia: 'Sociologia',
  artes: 'Artes',
  'educacao fisica': 'Educação Física',
  atualidades: 'Atualidades',
  informatica: 'Informática',
};

/** Casamento por termo contido, quando o nome exato não bate. */
const MATERIA_POR_TERMO: [string, string][] = [
  ['geografia', 'Geografia'],
  ['sociologia', 'Sociologia'],
  ['filosofia', 'Filosofia'],
  ['historia', 'História'],
  ['literatura', 'Literatura'],
  ['ingles', 'Inglês'],
  ['espanhol', 'Espanhol'],
  ['portugues', 'Português'],
  ['gramatica', 'Português'],
  ['redacao', 'Redação'],
  ['matematica', 'Matemática'],
  ['fisica', 'Física'],
  ['quimica', 'Química'],
  ['biologia', 'Biologia'],
  ['artes', 'Artes'],
];

/** Tira acento mantendo a letra base: "ção" -> "cao". */
function semAcento(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function canonizarMateria(bruta: string): string {
  const chave = semAcento((bruta || '').trim().toLowerCase()).replace(
    /\s+/g,
    ' '
  );
  if (!chave) return 'Geral';
  if (MATERIAS_CANONICAS[chave]) return MATERIAS_CANONICAS[chave];
  for (const [termo, canonica] of MATERIA_POR_TERMO) {
    if (chave.includes(termo)) return canonica;
  }
  // Title case: preserva um nome novo em vez de jogar tudo em "Geral".
  return bruta
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function canonizarDificuldade(bruta: string): 'facil' | 'medio' | 'dificil' {
  const c = semAcento((bruta || '').trim().toLowerCase());
  if (c.startsWith('facil')) return 'facil';
  if (c.startsWith('dificil') || c.includes('muito dificil')) return 'dificil';
  return 'medio';
}

// ─── Limpeza ─────────────────────────────────────────────────
// Mesma régua de PDF que sujava 94% do banco na importação anterior.
const RE_REGUA = /[-=_·—–]{6,}|\.{8,}/g;

function ehRegua(linha: string): boolean {
  return /^\s*(?:[-=_·—–]{4,}|\.{6,})[\s\-=_·—–.]*$/.test(linha);
}

export function limpar(texto: string | null | undefined): string {
  if (!texto) return '';
  let t = texto.replace(/\[cite[^\]]*\]/g, '');
  t = t.replace(/^[-=_·—–]{4,}\s*$/gm, '');
  t = t.replace(RE_REGUA, ' ');
  t = t
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n');
  // Colapsa espaço duplo só no MEIO da linha: a indentação de poema fica.
  t = t.replace(/(\S)[ \t]{2,}(\S)/g, '$1 $2');
  t = t.replace(/\n{3,}/g, '\n\n');
  t = t.replace(/\s+([,;.])/g, '$1');
  t = t.replace(/^\s*(?:[-=_·—–]{2,}|[-=_·—–]\s)\s*/, '');
  t = t.replace(/[\s\-=_·—–]+$/, '');
  return t.trim();
}

function vazioOuNA(texto: string): boolean {
  const t = limpar(texto).toLowerCase().replace(/\.$/, '').trim();
  return ['', 'n/a', 'na', 'nao ha', 'não há', 'nenhum', '-', '—'].includes(t);
}

// ─── Hash SHA-256, idêntico ao do pipeline Python ────────────
//
// A paridade aqui NÃO é detalhe: é o que impede uma prova já importada
// pelo terminal de entrar de novo pela tela. O Python faz
// `unicodedata.normalize("NFD", t).encode("ascii", "ignore")`, que remove
// o acento E descarta qualquer caractere que não seja ASCII (π, —, ², ✓).
// O `.replace(/[^\x00-\x7F]/g, '')` abaixo é o equivalente exato disso —
// sem ele, "π" sobreviveria e o hash sairia diferente do gerado no
// pipeline para a mesma questão.
function normalizarParaHash(texto: string): string {
  return semAcento(texto.toLowerCase())
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function hashConteudo(
  concurso: string,
  ano: number | null,
  enunciado: string
): Promise<string> {
  const base = `${concurso}|${ano ?? 'None'}|${normalizarParaHash(enunciado)}`;
  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(base)
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Campos do cabeçalho de cada bloco ───────────────────────
const CAMPOS = {
  concurso: /^\s*Concurso\s*:\s*(.+)$/im,
  ano: /^\s*Ano\s*:\s*(\d{4}(?:\s*\/\s*\d{4})?)/im,
  banca: /^\s*Banca(?:\s+organizadora)?\s*:\s*(.+)$/im,
  original: /^\s*N[ºo°]?\s*original[^:]*:\s*(.+)$/im,
  materia: /^\s*Mat[ée]ria\s*:\s*(.+)$/im,
  assunto: /^\s*Assunto\s*:\s*(.+)$/im,
  dificuldade: /^\s*Dificuldade\s*:\s*(.+)$/im,
};

const RE_TEXTO_BASE = /^\s*TEXTO\s+BASE[^\n:]*:\s*$/im;
const RE_ENUNCIADO = /^\s*ENUNCIADO\s*:\s*$/im;
const RE_ALTERNATIVAS = /^\s*ALTERNATIVAS\s*:\s*$/im;
const RE_ALT_LINHA = /^\s*(?:\(\s*([A-Ea-e])\s*\)|([A-Ea-e])\s*[)\.:\-–—])\s*(.*)$/;
const RE_IMAGEM = /\[?\s*(?:DESCRI[ÇC][ÃA]O\s+DA\s+)?IMAGEM\s*:\s*([^\]\n]+)\]?/i;

// ─── Seção de gabarito no fim do arquivo ─────────────────────
const RE_GAB_LINHA =
  /^\s*Quest[ãa]o\s+(\d{1,3})\s*[—–-]\s*Gabarito\s*:\s*\(?([A-Ea-e]|Anulada[^\n]*)\)?/gim;
// O qualificador precisa ser livre: "Explicação resumida:", "Explicação
// detalhada:", "Justificativa:", "Comentário:", "Resolução:". Fixá-lo em
// "resumida" descartava em silêncio 98 explicações de ESA 2024 e EPCAR 2022.
const RE_EXPLICACAO =
  /^\s*(?:Explica[çc][ãa]o(?:\s+\w+)?|Justificativa|Coment[áa]rio|Resolu[çc][ãa]o)\s*:\s*([\s\S]+?)(?=\n\s*\n|\n\s*Quest[ãa]o\s+\d|$)/im;

// Layout em que o comentário vem no parágrafo logo abaixo da linha de
// gabarito, sem rótulo nenhum (enem-2018-dia1).
const RE_EXPLICACAO_SOLTA =
  /^\s*\n(?!\s*(?:Explica|Justificativa|Coment|Resolu|Quest[ãa]o\s+\d|={4}))([\s\S]+?)(?=\n\s*\n|\n\s*Quest[ãa]o\s+\d|$)/i;

interface GabaritoLido {
  letra: string | null;
  explicacao: string | null;
  anulada: boolean;
}

/** Lê a seção "GABARITO COMENTADO" e indexa por número de questão. */
export function extrairGabaritos(texto: string): Map<number, GabaritoLido> {
  const mapa = new Map<number, GabaritoLido>();

  const marcaSecao = texto.search(/^\s*GABARITO(?:\s+COMENTADO)?\s*$/im);
  const trecho = marcaSecao >= 0 ? texto.slice(marcaSecao) : texto;

  const ocorrencias = [...trecho.matchAll(RE_GAB_LINHA)];

  ocorrencias.forEach((m, i) => {
    const numero = parseInt(m[1], 10);
    const bruto = (m[2] || '').trim();
    const anulada = /anulada/i.test(bruto);
    const letra = anulada ? null : bruto.slice(0, 1).toUpperCase();

    // A explicação vive entre esta linha de gabarito e a próxima.
    const inicio = m.index! + m[0].length;
    const fim =
      i + 1 < ocorrencias.length ? ocorrencias[i + 1].index! : trecho.length;
    const corpo = trecho.slice(inicio, fim);

    // 1ª tentativa: com rótulo. 2ª: o parágrafo solto logo abaixo.
    const mExp = corpo.match(RE_EXPLICACAO);
    let explicacao = mExp ? limpar(mExp[1]) : null;

    if (!explicacao) {
      const mSolta = corpo.match(RE_EXPLICACAO_SOLTA);
      const candidata = mSolta ? limpar(mSolta[1]) : '';
      // Um comentário de verdade tem corpo; um resto de linha, não.
      if (candidata.length >= 40) explicacao = candidata;
    }

    // Um mesmo número pode reaparecer quando a prova tem dois dias; a
    // primeira leitura vence, que é a ordem em que os blocos aparecem.
    if (!mapa.has(numero)) {
      mapa.set(numero, { letra, explicacao, anulada });
    }
  });

  return mapa;
}

// ─── Alternativas ────────────────────────────────────────────
function extrairAlternativas(trecho: string): AlternativaImportada[] {
  const alternativas: AlternativaImportada[] = [];
  let atual: AlternativaImportada | null = null;

  for (const linha of trecho.split('\n')) {
    // A régua fecha o bloco. Sem isso ela era concatenada na última
    // alternativa — foi o que sujou 3.102 questões na importação anterior.
    if (ehRegua(linha)) {
      atual = null;
      continue;
    }

    const m = linha.match(RE_ALT_LINHA);
    if (m) {
      const letra = (m[1] || m[2]).toUpperCase();
      const esperada = String.fromCharCode(65 + alternativas.length);
      // Só aceita a próxima letra da sequência: evita capturar um "A)" que
      // apareça dentro do corpo de outra alternativa.
      if (letra === esperada) {
        atual = { letra, texto: (m[3] || '').trim() };
        alternativas.push(atual);
        continue;
      }
    }

    if (atual && linha.trim()) {
      atual.texto = `${atual.texto} ${linha.trim()}`.trim();
    }
  }

  return alternativas.map((a) => ({ ...a, texto: limpar(a.texto) }));
}

// ─── Fatiar um bloco em TEXTO BASE / ENUNCIADO / ALTERNATIVAS ─
function fatiarBloco(bloco: string): {
  cabecalho: string;
  texto_base: string;
  enunciado: string;
  alternativas: string;
} {
  const marcas: { nome: string; inicio: number; fim: number }[] = [];

  for (const [nome, rx] of [
    ['texto_base', RE_TEXTO_BASE],
    ['enunciado', RE_ENUNCIADO],
    ['alternativas', RE_ALTERNATIVAS],
  ] as const) {
    const m = bloco.match(rx);
    if (m && m.index !== undefined) {
      marcas.push({ nome, inicio: m.index, fim: m.index + m[0].length });
    }
  }

  marcas.sort((a, b) => a.inicio - b.inicio);

  const secoes: Record<string, string> = {
    cabecalho: marcas.length ? bloco.slice(0, marcas[0].inicio) : bloco,
    texto_base: '',
    enunciado: '',
    alternativas: '',
  };

  marcas.forEach((marca, i) => {
    const fim = i + 1 < marcas.length ? marcas[i + 1].inicio : bloco.length;
    secoes[marca.nome] = bloco.slice(marca.fim, fim);
  });

  return secoes as {
    cabecalho: string;
    texto_base: string;
    enunciado: string;
    alternativas: string;
  };
}

// ─── Aceitação: a mesma régua do gerador de seeds ────────────
export function motivoDeRejeicao(q: {
  resposta_correta: string | null;
  alternativas: AlternativaImportada[];
  enunciado: string;
  texto_base: string | null;
}): string | null {
  if (!q.resposta_correta) return 'sem gabarito na seção de respostas';

  const comTexto = q.alternativas.filter((a) => a.texto.trim());
  if (comTexto.length < 2) return 'alternativas vazias na extração';

  const letras = new Set(comTexto.map((a) => a.letra));
  if (!letras.has(q.resposta_correta))
    return 'gabarito aponta para letra inexistente';

  const textos = comTexto.map((a) => a.texto.trim());
  if (new Set(textos).size !== textos.length)
    return 'alternativas duplicadas na extração';

  if (q.enunciado.trim().length < 25 && !q.texto_base?.trim())
    return 'enunciado sem o texto de apoio';

  return null;
}

// ─── Entrada principal ───────────────────────────────────────
const RE_INICIO_BLOCO = /^\[QUEST[ÃA]O\s+(?:N[ºo°]\s*)?(\d+)[^\]]*\]/gim;

export async function parsearProvaTxt(
  texto: string,
  opcoes: { concurso_sigla: string; ano?: number | null; dia_prova?: string | null }
): Promise<ResultadoParse> {
  const gabaritos = extrairGabaritos(texto);

  // Corta fora a seção de gabarito antes de procurar blocos de questão,
  // senão os comentários entram como se fossem enunciado.
  const marcaGabarito = texto.search(/^\s*GABARITO(?:\s+COMENTADO)?\s*$/im);
  const corpo = marcaGabarito >= 0 ? texto.slice(0, marcaGabarito) : texto;

  const inicios = [...corpo.matchAll(RE_INICIO_BLOCO)];

  const questoes: QuestaoImportada[] = [];
  const rejeitadas: QuestaoRejeitada[] = [];

  for (let i = 0; i < inicios.length; i++) {
    const m = inicios[i];
    const numeroBloco = parseInt(m[1], 10);
    const inicio = m.index!;
    const fim = i + 1 < inicios.length ? inicios[i + 1].index! : corpo.length;
    const bloco = corpo.slice(inicio, fim);

    const secoes = fatiarBloco(bloco);
    const cabecalho = secoes.cabecalho || bloco;

    const campo = (rx: RegExp): string => {
      const achado = cabecalho.match(rx) || bloco.match(rx);
      return achado ? limpar(achado[1]) : '';
    };

    const anoBruto = campo(CAMPOS.ano);
    const anos = anoBruto.match(/\d{4}/g);
    // "2018/2019" -> vale o ano de ingresso (o último).
    const ano = anos ? parseInt(anos[anos.length - 1], 10) : opcoes.ano ?? null;

    let enunciado = limpar(secoes.enunciado);
    let textoBase = vazioOuNA(secoes.texto_base)
      ? null
      : limpar(secoes.texto_base);
    let alternativas = extrairAlternativas(secoes.alternativas);

    // Layout sem rótulo "ALTERNATIVAS:": as opções vêm logo após o texto.
    if (alternativas.length === 0 && enunciado) {
      const posA = enunciado.split('\n').findIndex((l) => {
        const mm = l.match(RE_ALT_LINHA);
        return mm && (mm[1] || mm[2]).toUpperCase() === 'A';
      });
      if (posA >= 0) {
        const linhas = enunciado.split('\n');
        alternativas = extrairAlternativas(linhas.slice(posA).join('\n'));
        enunciado = limpar(linhas.slice(0, posA).join('\n'));
      }
    }

    // Alguns layouts juntam texto base e enunciado no mesmo campo.
    if (!enunciado && textoBase) {
      enunciado = textoBase;
      textoBase = null;
    }

    const gab = gabaritos.get(numeroBloco);
    const respostaCorreta = gab?.letra ?? null;

    const fonteFigura = `${textoBase ?? ''}\n${enunciado}`;
    const mImg = fonteFigura.match(RE_IMAGEM);
    const figura = mImg ? limpar(mImg[1]) : null;

    const motivo = motivoDeRejeicao({
      resposta_correta: respostaCorreta,
      alternativas,
      enunciado,
      texto_base: textoBase,
    });

    if (motivo) {
      rejeitadas.push({
        numero: campo(CAMPOS.original) || String(numeroBloco),
        motivo,
        trecho: enunciado.slice(0, 140) || bloco.slice(0, 140),
      });
      continue;
    }

    const materia = canonizarMateria(campo(CAMPOS.materia));

    questoes.push({
      concurso_sigla: opcoes.concurso_sigla,
      ano,
      dia_prova: opcoes.dia_prova ?? null,
      banca: campo(CAMPOS.banca)?.slice(0, 80) || null,
      numero_ordem: numeroBloco,
      numero_original: campo(CAMPOS.original)?.slice(0, 20) || String(numeroBloco),
      materia,
      // Canoniza igual ao Python. Sem isto, o rótulo livre da banca virava
      // um assunto novo em `assuntos` a cada importação pela tela.
      assunto: canonizarAssunto(
        materia,
        campo(CAMPOS.assunto)
      ).assunto.slice(0, 150),
      dificuldade: canonizarDificuldade(campo(CAMPOS.dificuldade)),
      texto_base: textoBase,
      enunciado,
      alternativas,
      resposta_correta: respostaCorreta,
      explicacao: gab?.explicacao ?? null,
      figura_descricao: figura,
      anulada: gab?.anulada ?? false,
      hash_conteudo: await hashConteudo(opcoes.concurso_sigla, ano, enunciado),
    });
  }

  return {
    questoes,
    rejeitadas,
    resumo: {
      blocos_encontrados: inicios.length,
      aceitas: questoes.length,
      rejeitadas: rejeitadas.length,
      com_gabarito: questoes.filter((q) => q.resposta_correta).length,
      com_explicacao: questoes.filter((q) => q.explicacao).length,
      com_texto_base: questoes.filter((q) => q.texto_base).length,
      anuladas: questoes.filter((q) => q.anulada).length,
      concurso: opcoes.concurso_sigla,
      ano: questoes[0]?.ano ?? opcoes.ano ?? null,
    },
  };
}
