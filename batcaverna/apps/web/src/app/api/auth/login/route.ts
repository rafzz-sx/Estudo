import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from '@/lib/auth';

function getSupabase() {
  return createServerSupabaseClient();
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/login
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, senha } = body;

    if (!email?.trim() || !senha) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // ─── Buscar usuário ───────────────────────────────────────
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // ─── Verificar senha ──────────────────────────────────────
    const senhaHash = await hashToken(senha);
    if (user.senha_hash !== senhaHash) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // ─── Gerar tokens ─────────────────────────────────────────
    const accessToken = await generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken();
    const hashedRefresh = await hashToken(refreshToken);

    await supabase.from('refresh_tokens').insert({
      user_id: user.id,
      token_hash: hashedRefresh,
      dispositivo: 'web',
      expira_em: getRefreshTokenExpiry().toISOString(),
    });

    // ─── Retornar dados do usuário (sem senha) e SETAR COOKIES 
    const { senha_hash: _, ...userData } = user;

    const response = NextResponse.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userData,
      },
    });

    response.cookies.set('bat_access_token', accessToken, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('bat_refresh_token', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      secure: process.env.NODE_ENV === 'production',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'desconhecido'}` },
      { status: 500 }
    );
  }
}
