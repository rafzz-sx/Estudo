import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { hashToken } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/logout
// Recebe { refresh_token } e revoga o token no banco
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

    // ─── Revogar o refresh token ──────────────────────────────
    await supabase
      .from('refresh_tokens')
      .update({ revogado: true })
      .eq('token_hash', tokenHash);

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso.',
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
