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

    // ─── Registrar o login e quando a sessão automática expira ──
    // O painel admin mostra quanto tempo falta para cada usuário precisar
    // relogar; sem gravar isso, não havia como saber.
    const duracaoAcesso = parseInt(process.env.JWT_ACCESS_EXPIRATION || '36000');
    const expiraEm = new Date(Date.now() + duracaoAcesso * 1000);

    await supabase
      .from('users')
      .update({
        ultimo_login_em: new Date().toISOString(),
        sessao_expira_em: expiraEm.toISOString(),
      })
      .eq('id', user.id);

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

    // O cookie precisa durar o mesmo que o JWT. Antes eram 8h de cookie
    // para um token de 10h: a sessão "morria" duas horas antes da hora.
    // httpOnly porque nenhum código do navegador lê este cookie — o token
    // que o front usa fica no store, e deixá-lo acessível a JS só ampliaria
    // o estrago de um eventual XSS.
    response.cookies.set('bat_access_token', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: duracaoAcesso,
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('bat_refresh_token', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias para persistência de refresh
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
