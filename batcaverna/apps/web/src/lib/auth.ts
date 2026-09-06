import { SignJWT, jwtVerify } from 'jose';

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
