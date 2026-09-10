import { NextRequest, NextResponse } from 'next/server';
import { GET as getAmigos } from '@/app/api/usuarios/me/amigos/route';

/**
 * GET /api/amizades
 * Proxy amigável para /api/usuarios/me/amigos
 */
export async function GET(req: NextRequest) {
  return getAmigos(req);
}
