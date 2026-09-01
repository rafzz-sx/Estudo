import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { hashToken } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/logout
// Recebe { refresh_token } e revoga o token no banco
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { refresh_token } = body;

    if (refresh_token) {
      try {
        const supabase = createServerSupabaseClient();
        const tokenHash = await hashToken(refresh_token);

        await supabase
          .from('refresh_tokens')
          .update({ revogado: true })
          .eq('token_hash', tokenHash);
      } catch (dbErr) {
        console.warn('Error revoking refresh token:', dbErr);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso.',
    });

    // Limpar cookies de autenticação
    response.cookies.delete('bat_access_token');
    response.cookies.delete('bat_refresh_token');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
