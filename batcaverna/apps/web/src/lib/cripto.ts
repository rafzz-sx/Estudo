/**
 * Módulo de Criptografia Simétrica (AES-256-GCM) em Repouso
 *
 * Utiliza a Web Crypto API nativa (Edge & Node.js compatível).
 * Garante privacidade para dados sensíveis em repouso (mensagens de chat,
 * redações e suporte) sem quebrar o histórico:
 *
 * COMPATIBILIDADE COM HISTÓRICO:
 *   Qualquer dado que NÃO comece com o prefixo `aes256gcm$` é tratado como
 *   texto legado e retornado intacto. Nenhuma mensagem antiga é perdida ou corrompida.
 */

const ALGORITMO = 'AES-GCM';
const TAMANHO_IV_BYTES = 12; // 96 bits recomendado para AES-GCM

function paraHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function deHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/**
 * Deriva a CryptoKey de 256 bits a partir do segredo da aplicação.
 */
let chaveCache: CryptoKey | null = null;

async function obterChaveCriptografia(): Promise<CryptoKey> {
  if (chaveCache) return chaveCache;

  const segredo =
    process.env.ENCRYPTION_KEY?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    'batcaverna-secure-master-key-default-salt-2026';

  // Deriva 256 bits seguros via SHA-256 do segredo
  const hashKey = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(segredo + ':batcaverna:data-encryption')
  );

  chaveCache = await crypto.subtle.importKey(
    'raw',
    hashKey,
    { name: ALGORITMO },
    false,
    ['encrypt', 'decrypt']
  );

  return chaveCache;
}

/**
 * Encripta um texto puro para o formato seguro `aes256gcm$<iv_hex>$<cifrado_hex>`.
 * Retorna null se a entrada for vazia ou nula.
 */
export async function encriptarTexto(texto: string | null | undefined): Promise<string | null> {
  if (texto === null || texto === undefined || texto === '') return null;

  try {
    const chave = await obterChaveCriptografia();
    const iv = new Uint8Array(TAMANHO_IV_BYTES);
    crypto.getRandomValues(iv);

    const dados = new TextEncoder().encode(texto);
    const bufferCifrado = await crypto.subtle.encrypt(
      { name: ALGORITMO, iv },
      chave,
      dados
    );

    const cifradoHex = paraHex(new Uint8Array(bufferCifrado));
    const ivHex = paraHex(iv);

    return `aes256gcm$${ivHex}$${cifradoHex}`;
  } catch (err) {
    console.error('Erro ao encriptar texto:', err);
    // Em caso extremo de erro na API de criptografia, retorna o texto para não perder dados do usuário
    return texto;
  }
}

/**
 * Decripta um texto cifrado.
 * Se o texto NÃO estiver cifrado (dados legados/histórico), devolve o texto original sem alteração.
 */
export async function decriptarTexto(valor: string | null | undefined): Promise<string> {
  if (!valor) return '';

  // Se não começa com o marcador de AES-256-GCM, é histórico legível: retorna intacto
  if (!valor.startsWith('aes256gcm$')) {
    return valor;
  }

  try {
    const partes = valor.split('$');
    if (partes.length !== 3) return valor;

    const [, ivHex, cifradoHex] = partes;
    const iv = deHex(ivHex);
    const cifrado = deHex(cifradoHex);
    const chave = await obterChaveCriptografia();

    const bufferDecriptado = await crypto.subtle.decrypt(
      { name: ALGORITMO, iv: iv as unknown as BufferSource },
      chave,
      cifrado as unknown as BufferSource
    );

    return new TextDecoder().decode(bufferDecriptado);
  } catch (err) {
    console.warn('Aviso: falha ao decriptar payload (possível chave divergente):', err);
    return valor;
  }
}

/**
 * Gera um Blind Index determinístico (HMAC-SHA256) para possibilitar buscas exatas
 * em campos criptografados (ex: e-mail) sem revelar a informação original.
 */
export async function gerarBlindIndex(termo: string): Promise<string> {
  const normalizado = termo.trim().toLowerCase();
  const segredo =
    process.env.ENCRYPTION_KEY?.trim() ||
    process.env.JWT_SECRET?.trim() ||
    'batcaverna-blind-index-key-2026';

  const chaveHmac = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(segredo + ':blind-index'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const assinado = await crypto.subtle.sign(
    'HMAC',
    chaveHmac,
    new TextEncoder().encode(normalizado)
  );

  return paraHex(new Uint8Array(assinado));
}
