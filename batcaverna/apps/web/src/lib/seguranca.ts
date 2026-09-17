/**
 * Utilidades de segurança compartilhadas pelas API routes.
 *
 * Três problemas concretos que este módulo resolve:
 *
 * 1. **Injeção de filtro do PostgREST.** Vários endpoints montam
 *    `.or(\`apelido.ilike.%${termo}%\`)` com o termo digitado pelo usuário.
 *    Não é SQL, mas é a linguagem de filtro do PostgREST — e vírgula,
 *    parêntese e ponto são metacaracteres dela. Um termo como
 *    `a,role.eq.admin` sai do filtro pretendido e entra em outro.
 *
 * 2. **Ausência de limite de tentativa.** Login, cadastro e recuperação de
 *    senha aceitavam requisição sem nenhum teto. Dava para varrer senha por
 *    força bruta na velocidade da rede.
 *
 * 3. **Data URL sem validação.** Avatar e banner eram gravados crus, de
 *    qualquer tamanho e com qualquer prefixo — inclusive `javascript:`.
 */

// ═══════════════════════════════════════════════════════════════
// 1. Sanitização para filtros do PostgREST
// ═══════════════════════════════════════════════════════════════

/**
 * Limpa um termo de busca antes de entrar num `.or()` / `.ilike()`.
 *
 * Remove os metacaracteres da linguagem de filtro do PostgREST — vírgula
 * separa condições, parêntese agrupa, ponto separa coluna de operador — e
 * os curingas do LIKE, que um usuário mal-intencionado usaria para forçar
 * varredura completa da tabela.
 */
export function limparTermoBusca(bruto: unknown, maxLen = 60): string {
  if (typeof bruto !== 'string') return '';
  return bruto
    .replace(/[,().:*%_\\"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

const RE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True só para um UUID de verdade. Use antes de interpolar em filtro. */
export function ehUUID(valor: unknown): valor is string {
  return typeof valor === 'string' && RE_UUID.test(valor);
}

/**
 * Devolve o UUID se for válido; senão, null.
 * Interpolar um valor não validado num `.or()` deixa o filtro aberto.
 */
export function uuidOuNulo(valor: unknown): string | null {
  return ehUUID(valor) ? valor : null;
}

// ═══════════════════════════════════════════════════════════════
// 2. Rate limiting
// ═══════════════════════════════════════════════════════════════
//
// Implementação em memória, de propósito. O projeto não tem Redis, e o
// Upstash exigiria conta nova e variável de ambiente — coisa que só o dono
// da plataforma pode criar.
//
// LIMITAÇÃO HONESTA: na Vercel cada instância serverless tem a própria
// memória, e elas são recicladas. Isso barra o ataque comum (um script
// martelando o login) mas não um atacante distribuído. Quando houver
// Redis, troque `registrarTentativa` pela versão distribuída — o resto do
// código não muda.

interface Janela {
  contagem: number;
  reiniciaEm: number;
}

const janelas = new Map<string, Janela>();

// Sem faxina o Map cresce para sempre num processo de vida longa.
const LIMITE_DE_CHAVES = 10_000;

function faxina(agora: number) {
  if (janelas.size < LIMITE_DE_CHAVES) return;
  for (const [chave, janela] of janelas) {
    if (janela.reiniciaEm <= agora) janelas.delete(chave);
  }
}

export interface ResultadoLimite {
  permitido: boolean;
  restantes: number;
  reiniciaEmSegundos: number;
}

/**
 * Conta uma tentativa e diz se ela pode passar.
 *
 * @param chave       identificador do cliente (normalmente IP + rota)
 * @param maxTentativas quantas cabem na janela
 * @param janelaSegundos tamanho da janela
 */
export function registrarTentativa(
  chave: string,
  maxTentativas: number,
  janelaSegundos: number
): ResultadoLimite {
  const agora = Date.now();
  faxina(agora);

  const janela = janelas.get(chave);

  if (!janela || janela.reiniciaEm <= agora) {
    janelas.set(chave, {
      contagem: 1,
      reiniciaEm: agora + janelaSegundos * 1000,
    });
    return {
      permitido: true,
      restantes: maxTentativas - 1,
      reiniciaEmSegundos: janelaSegundos,
    };
  }

  janela.contagem += 1;
  const restantes = Math.max(0, maxTentativas - janela.contagem);

  return {
    permitido: janela.contagem <= maxTentativas,
    restantes,
    reiniciaEmSegundos: Math.ceil((janela.reiniciaEm - agora) / 1000),
  };
}

/**
 * Descobre o IP de quem chamou.
 *
 * Na Vercel o IP real vem em `x-forwarded-for`; o primeiro da lista é o
 * cliente e o resto são os proxies. Sem proxy conhecido, cai num rótulo
 * fixo — que faz o limite valer para todo mundo junto, o que é o lado
 * seguro de errar.
 */
export function ipDaRequisicao(req: Request): string {
  const encaminhado = req.headers.get('x-forwarded-for');
  if (encaminhado) return encaminhado.split(',')[0].trim();
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('cf-connecting-ip') ??
    'desconhecido'
  );
}

/**
 * Aplica o limite e devolve a resposta 429 pronta, ou null se pode seguir.
 *
 * Uso na rota:
 *   const bloqueio = aplicarLimite(req, 'login', 8, 300);
 *   if (bloqueio) return bloqueio;
 */
export function aplicarLimite(
  req: Request,
  rotulo: string,
  maxTentativas: number,
  janelaSegundos: number
): Response | null {
  const chave = `${rotulo}:${ipDaRequisicao(req)}`;
  const r = registrarTentativa(chave, maxTentativas, janelaSegundos);

  if (r.permitido) return null;

  return new Response(
    JSON.stringify({
      success: false,
      error: `Muitas tentativas. Tente de novo em ${r.reiniciaEmSegundos}s.`,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(r.reiniciaEmSegundos),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. Validação de data URL (avatar e banner)
// ═══════════════════════════════════════════════════════════════

const TIPOS_IMAGEM = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const TIPOS_VIDEO = new Set(['video/mp4', 'video/webm']);

const TIPOS_AUDIO = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/opus',
  'audio/weba',
  'audio/3gpp',
  'audio/3gpp2',
  'audio/x-wav',
  'audio/flac',
]);

/** ~4 MB de base64 ≈ 3 MB de arquivo. */
export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
/** Banner aceita vídeo curto, então tem folga maior. */
export const MAX_BANNER_BYTES = 16 * 1024 * 1024;

export interface ResultadoMidia {
  ok: boolean;
  erro?: string;
  tipo?: 'imagem' | 'gif' | 'video' | 'audio';
}

/**
 * Confere que o valor é mesmo uma imagem, áudio ou vídeo, e não outra coisa.
 */
export function validarDataUrlMidia(
  valor: unknown,
  opcoes: { permitirVideo?: boolean; permitirAudio?: boolean; maxBytes?: number } = {}
): ResultadoMidia {
  const { permitirVideo = false, permitirAudio = false, maxBytes = MAX_AVATAR_BYTES } = opcoes;

  if (valor === null || valor === '') return { ok: true }; // remover é válido

  if (typeof valor !== 'string') {
    return { ok: false, erro: 'Formato inválido.' };
  }

  // Também aceitamos URL http(s) — útil se um dia migrar para Storage.
  if (/^https:\/\//i.test(valor)) {
    if (valor.length > 2048) {
      return { ok: false, erro: 'Endereço da imagem longo demais.' };
    }
    return { ok: true, tipo: 'imagem' };
  }

  const cabecalho = valor.slice(0, 128).toLowerCase();
  if (!cabecalho.startsWith('data:')) {
    return {
      ok: false,
      erro: 'Envie um arquivo de imagem, áudio ou vídeo, ou um endereço https.',
    };
  }

  // Aceita parâmetros de MIME comuns em gravação de áudio (ex: data:audio/webm;codecs=opus;base64,...)
  const m = valor.match(/^data:([a-z0-9.+/-]+)(?:;[a-z0-9.+=/-]+)*;base64,/i);
  if (!m) {
    return { ok: false, erro: 'Arquivo não reconhecido.' };
  }

  const mime = m[1].toLowerCase();
  const ehImagem = TIPOS_IMAGEM.has(mime);
  const ehVideo = TIPOS_VIDEO.has(mime);
  const ehAudio = TIPOS_AUDIO.has(mime);

  if (!ehImagem && !(permitirVideo && ehVideo) && !(permitirAudio && ehAudio)) {
    return {
      ok: false,
      erro: 'Formato de mídia não suportado. Use PNG, JPG, WebP, GIF, MP4, WebM ou áudio.',
    };
  }

  if (valor.length > maxBytes) {
    const mb = Math.floor(maxBytes / 1024 / 1024);
    return { ok: false, erro: `Arquivo maior que o limite de ${mb} MB.` };
  }

  // O corpo tem que ser base64 de verdade.
  const corpo = valor.slice(m[0].length);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(corpo.slice(0, 512))) {
    return { ok: false, erro: 'Conteúdo do arquivo inválido.' };
  }

  return {
    ok: true,
    tipo: ehAudio ? 'audio' : ehVideo ? 'video' : mime === 'image/gif' ? 'gif' : 'imagem',
  };
}

/**
 * Valida mídia seja como URL HTTPS (ex: Supabase Storage) ou Data URL (base64 legado).
 * Detecta se é imagem, vídeo, gif ou áudio pela extensão ou cabeçalho MIME.
 */
export function validarMidiaUrl(
  valor: unknown,
  opcoes: { permitirVideo?: boolean; permitirAudio?: boolean; maxBytes?: number } = {}
): ResultadoMidia {
  const { permitirVideo = false, permitirAudio = false } = opcoes;

  if (valor === null || valor === '') return { ok: true };
  if (typeof valor !== 'string') return { ok: false, erro: 'Formato inválido.' };

  // URL HTTPS (ex: Supabase Storage ou CDN)
  if (/^https:\/\//i.test(valor)) {
    if (valor.length > 2048) {
      return { ok: false, erro: 'Endereço da mídia longo demais.' };
    }

    const urlSemQuery = valor.split('?')[0];
    const ext = urlSemQuery.split('.').pop()?.toLowerCase() || '';

    const ehVideo = ['mp4', 'webm', 'mov', 'm4v', 'ogv', 'quicktime'].includes(ext);
    const ehAudio = ['mp3', 'ogg', 'wav', 'aac', 'm4a', 'weba', 'opus', 'flac', '3gp'].includes(ext);
    const ehGif = ext === 'gif';

    if (ehVideo && !permitirVideo) {
      return { ok: false, erro: 'Vídeos não são permitidos para este campo.' };
    }
    if (ehAudio && !permitirAudio) {
      return { ok: false, erro: 'Áudios não são permitidos para este campo.' };
    }

    const tipo: 'imagem' | 'gif' | 'video' | 'audio' = ehVideo
      ? 'video'
      : ehAudio
      ? 'audio'
      : ehGif
      ? 'gif'
      : 'imagem';

    return { ok: true, tipo };
  }

  // Se for data URL, valida normalmente
  return validarDataUrlMidia(valor, opcoes);
}

// ═══════════════════════════════════════════════════════════════
// 4. Texto vindo do usuário
// ═══════════════════════════════════════════════════════════════

/**
 * Normaliza texto livre: corta no limite e remove caracteres de controle.
 *
 * Não escapamos HTML aqui de propósito — o React já escapa tudo que passa
 * por JSX. Escapar duas vezes faria o aluno ver `&amp;lt;` na tela. O que
 * removemos são caracteres invisíveis de controle, que servem para
 * disfarçar conteúdo e bagunçar a renderização.
 */
export function limparTexto(bruto: unknown, maxLen: number): string | null {
  if (bruto === null || bruto === undefined) return null;
  if (typeof bruto !== 'string') return null;

  const limpo = bruto
    // Caracteres de controle C0/C1 e o BOM: servem para disfarcar
    // conteudo e baguncar a renderizacao. Nenhum texto legitimo usa.
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFEFF]/g, '')
    .trim()
    .slice(0, maxLen);

  return limpo.length ? limpo : null;
}

/** Número dentro de uma faixa, com padrão. Evita NaN e valor absurdo. */
export function inteiroNaFaixa(
  bruto: unknown,
  min: number,
  max: number,
  padrao: number
): number {
  const n = Number(bruto);
  if (!Number.isFinite(n)) return padrao;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
