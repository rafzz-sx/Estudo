import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateAccessToken, hashToken } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/refresh
// Recebe { refresh_token } e retorna novo access_token
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Refresh token é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const tokenHash = await hashToken(refresh_token);

    // ─── Buscar refresh token no banco ────────────────────────
    const { data: storedToken, error } = await supabase
      .from('refresh_tokens')
      .select('*, users!inner(id, role)')
      .eq('token_hash', tokenHash)
      .eq('revogado', false)
      .single();

    if (error || !storedToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token inválido' },
        { status: 401 }
      );
    }

    // ─── Verificar expiração ──────────────────────────────────
    if (new Date(storedToken.expira_em) < new Date()) {
      // Revogar token expirado
      await supabase
        .from('refresh_tokens')
        .update({ revogado: true })
        .eq('id', storedToken.id);

      return NextResponse.json(
        { success: false, error: 'Refresh token expirado. Faça login novamente.' },
        { status: 401 }
      );
    }

    // ─── Gerar novo access token ──────────────────────────────
    const user = storedToken.users;
    const newAccessToken = await generateAccessToken(user.id, user.role);

    return NextResponse.json({
      success: true,
      data: {
        access_token: newAccessToken,
      },
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
