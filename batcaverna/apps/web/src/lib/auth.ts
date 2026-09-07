import { SignJWT, jwtVerify } from 'jose';

// O fallback 'dev-secret-change-me' está neste repositório, que é público:
// com ele qualquer pessoa assina um token de administrador. A remoção do
// fallback fica para quando JWT_SECRET estiver confirmado na Vercel (ver
// SEGURANCA-ACOES-MANUAIS.txt, item 0-A) — removê-lo antes derrubaria o
// login. Até lá, o servidor avisa em voz alta no log a cada boot.
if (!process.env.JWT_SECRET) {
  console.error(
    '[SEGURANÇA] JWT_SECRET não está definido. O segredo de assinatura do ' +
      'login é um valor PÚBLICO de desenvolvimento. Configure a variável ' +
      'imediatamente — qualquer pessoa pode forjar um token de admin.'
  );
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me'
);

// ─── Sessão Persistente de 10 Horas (36.000 segundos) — Seção 4.4 ──────
const ACCESS_EXPIRATION = parseInt(process.env.JWT_ACCESS_EXPIRATION || '36000'); // 10 horas
const REFRESH_EXPIRATION = parseInt(process.env.JWT_REFRESH_EXPIRATION || '36000'); // 10 horas

// ─── Gerar Access Token (10 horas de sessão ativa) ─────────────
export async function generateAccessToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_EXPIRATION}s`)
    .setIssuer('batcaverna')
    .sign(JWT_SECRET);
}

// ─── Gerar Refresh Token (Edge Compatible) ────────────────────
export function generateRefreshToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ─── Hash do refresh token (Edge Compatible SHA-256) ──────────
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Senha do usuário ────────────────────────────────────────
//
// A senha era guardada como `hashToken(senha)` — SHA-256 de UMA volta, sem
// sal. É adequado para o refresh token (que já é 256 bits de aleatoriedade),
// e é o pior caso possível para senha escolhida por gente:
//
//   • sem sal, senhas iguais viram hashes iguais, e uma tabela arco-íris
//     resolve as comuns instantaneamente;
//   • uma volta de SHA-256 é medida em BILHÕES por segundo numa GPU comum.
//
// Somado à chave `service_role` que esteve num repositório público, quem
// baixasse a tabela `users` quebraria a maior parte das senhas offline. E o
// público da plataforma é majoritariamente menor de idade.
//
// Agora é PBKDF2-HMAC-SHA256 com sal por usuário. A Web Crypto já traz o
// algoritmo: nenhuma dependência nova.
//
// ─── O formato guardado ─────────────────────────────────────────────────────
//
//     pbkdf2$<iteracoes>$<sal em hex>$<derivado em hex>
//
// Auto-descritivo de propósito: cabe na coluna `senha_hash` que já existe
// (VARCHAR), então NÃO PRECISA DE MIGRATION, e guarda o número de iterações
// junto — dá para aumentar o custo no futuro sem invalidar o que já existe.
//
// O hash antigo é reconhecível sem ambiguidade: 64 caracteres hexadecimais,
// sem `$`. A migração é transparente — ver `verificarSenha`.

/** Custo atual. Fica no hash, então pode subir depois sem quebrar nada. */
const PBKDF2_ITERACOES = 210_000;
const PBKDF2_BYTES = 32;

function paraHex(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view, (b) => b.toString(16).padStart(2, '0')).join('');
}

function deHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derivar(
  senha: string,
  sal: Uint8Array,
  iteracoes: number
): Promise<string> {
  const chave = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: sal as unknown as BufferSource, iterations: iteracoes, hash: 'SHA-256' },
    chave,
    PBKDF2_BYTES * 8
  );
  return paraHex(bits);
}

/**
 * Comparação em tempo constante.
 *
 * `a !== b` sai no primeiro byte diferente, e o tempo até sair conta quantos
 * bateram. Aqui os dois lados têm o mesmo comprimento e o laço percorre tudo.
 */
function iguaisEmTempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i++) {
    diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferenca === 0;
}

/** Gera o hash de uma senha nova, no formato atual. */
export async function hashSenha(senha: string): Promise<string> {
  const sal = new Uint8Array(16);
  crypto.getRandomValues(sal);
  const derivado = await derivar(senha, sal, PBKDF2_ITERACOES);
  return `pbkdf2$${PBKDF2_ITERACOES}$${paraHex(sal)}$${derivado}`;
}

/**
 * Confere a senha contra o que está guardado, aceitando os dois formatos.
 *
 * `precisaRehash` volta `true` quando a conta ainda está no formato antigo (ou
 * num custo menor que o atual): quem chamou deve regravar o hash novo depois
 * de um login bem-sucedido. É assim que a base migra sozinha, sem pedir nada
 * ao aluno e sem invalidar ninguém.
 */
export async function verificarSenha(
  senha: string,
  armazenado: string | null | undefined
): Promise<{ ok: boolean; precisaRehash: boolean }> {
  if (!armazenado) return { ok: false, precisaRehash: false };

  if (armazenado.startsWith('pbkdf2$')) {
    const [, iteracoesTexto, salHex, esperado] = armazenado.split('$');
    const iteracoes = Number(iteracoesTexto);

    if (!Number.isFinite(iteracoes) || iteracoes < 1 || !salHex || !esperado) {
      return { ok: false, precisaRehash: false };
    }

    const derivado = await derivar(senha, deHex(salHex), iteracoes);
    const ok = iguaisEmTempoConstante(derivado, esperado);
    return { ok, precisaRehash: ok && iteracoes < PBKDF2_ITERACOES };
  }

  // Formato antigo: SHA-256 de uma volta, sem sal.
  const antigo = await hashToken(senha);
  const ok = iguaisEmTempoConstante(antigo, armazenado);
  return { ok, precisaRehash: ok };
}

// ─── Verificar Access Token ──────────────────────────────────
export async function verifyAccessToken(token: string): Promise<{
  sub: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: 'batcaverna',
    });
    return { sub: payload.sub as string, role: payload.role as string };
  } catch {
    return null;
  }
}

// ─── Gerar token de verificação de e-mail (Edge Compatible) ───
export function generateEmailToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ─── Expiração do refresh token (10 horas) ───────────────────
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_EXPIRATION * 1000);
}

// ─── Expiração do token de verificação de e-mail (24h) ───────
export function getEmailTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

/**
 * Validade do código de REDEFINIÇÃO DE SENHA — 30 minutos.
 *
 * Não é a mesma da verificação de e-mail, e a diferença é o ponto. Confirmar
 * e-mail é uma conveniência: o link vale 24 h porque a pessoa pode abrir a
 * caixa de entrada só no dia seguinte, e quem interceptasse o link ganharia
 * pouco. Redefinir senha é uma tomada de conta: quem tiver o código troca a
 * senha e entra.
 *
 * O código tem 6 dígitos — 1 milhão de combinações. Cada hora de validade a
 * mais é uma hora a mais de tentativas para quem estiver adivinhando, e uma
 * hora a mais em que um código esquecido num e-mail aberto ainda abre a
 * conta. 30 minutos é tempo de sobra para quem pediu e está esperando.
 */
export const MINUTOS_DO_CODIGO = 30;

export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + MINUTOS_DO_CODIGO * 60 * 1000);
}

/**
 * Extrai e valida o usuário autenticado da requisição
 * Suporta tanto o header Authorization: Bearer <token> quanto o cookie bat_access_token
 */
export async function getAuthUserFromRequest(req: any): Promise<{
  id: string;
  role: string;
} | null> {
  let token: string | undefined;

  // 1. Tentar ler do Header Authorization
  const authHeader = req.headers?.get?.('Authorization') || req.headers?.get?.('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  }

  // 2. Tentar ler do Cookie bat_access_token
  if (!token) {
    if (typeof req.cookies?.get === 'function') {
      token = req.cookies.get('bat_access_token')?.value;
    }
    if (!token && req.headers?.get) {
      const cookieStr = req.headers.get('cookie') || '';
      const match = cookieStr.match(/bat_access_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) return null;

  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}
