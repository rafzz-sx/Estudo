import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// Rotação segura de Refresh Token (RFC 6749 / OWASP ASVS)
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawToken =
      body?.refresh_token ||
      req.cookies.get('bat_refresh_token')?.value;

    if (!rawToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const tokenHash = await hashToken(rawToken);

    // ─── 1. Buscar refresh token no banco ────────────────────────
    const { data: storedToken, error } = await supabase
      .from('refresh_tokens')
      .select('*, users!inner(id, role)')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error || !storedToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // ─── 2. Detecção de Replay / Reuso de Token Vazado ──────────
    // Se o token já foi revogado e alguém tenta reutilizá-lo, é indício
    // de roubo de sessão. Revoga preventivamente todas as sessões do usuário.
    if (storedToken.revogado) {
      console.warn(
        `[SEGURANÇA] Tentativa de reuso de refresh token revogado para o usuário ${storedToken.user_id}. Revogando sessões ativas.`
      );
      await supabase
        .from('refresh_tokens')
        .update({ revogado: true })
        .eq('user_id', storedToken.user_id);

      const resp = NextResponse.json(
        { success: false, error: 'Sessão comprometida ou expirada. Faça login novamente.' },
        { status: 401 }
      );
      resp.cookies.delete('bat_access_token');
      resp.cookies.delete('bat_refresh_token');
      return resp;
    }

    // ─── 3. Verificar expiração ──────────────────────────────────
    if (new Date(storedToken.expira_em) < new Date()) {
      await supabase
        .from('refresh_tokens')
        .update({ revogado: true })
        .eq('id', storedToken.id);

      return NextResponse.json(
        { success: false, error: 'Refresh token expirado. Faça login novamente.' },
        { status: 401 }
      );
    }

    // ─── 4. Revogar o token atual (Uso Único) ────────────────────
    await supabase
      .from('refresh_tokens')
      .update({ revogado: true })
      .eq('id', storedToken.id);

    // ─── 5. Emitir novo Access Token e novo Refresh Token (Rotação) ─
    const user = storedToken.users;
    const newAccessToken = await generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken();
    const newHashedRefresh = await hashToken(newRefreshToken);

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: newHashedRefresh,
      dispositivo: storedToken.dispositivo || 'web',
      expira_em: getRefreshTokenExpiry().toISOString(),
      revogado: false,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });

    // ─── 6. Atualizar Cookies Seguros ─────────────────────────────
    const maxAge = parseInt(process.env.JWT_ACCESS_EXPIRATION || '36000');
    response.cookies.set('bat_access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    response.cookies.set('bat_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return response;

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
