import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me'
);

const ACCESS_EXPIRATION = parseInt(process.env.JWT_ACCESS_EXPIRATION || '900');
const REFRESH_EXPIRATION = parseInt(process.env.JWT_REFRESH_EXPIRATION || '36000');

// ─── Gerar Access Token (15min) ──────────────────────────────
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

// ─── Expiração do refresh token ──────────────────────────────
export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_EXPIRATION * 1000);
}

// ─── Expiração do token de verificação de e-mail (24h) ───────
export function getEmailTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}
