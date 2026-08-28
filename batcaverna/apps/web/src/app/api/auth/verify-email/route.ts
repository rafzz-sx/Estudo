import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/verify-email
// Recebe { token } e marca o e-mail como verificado
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ─── Buscar token ─────────────────────────────────────────
    const { data: tokenData, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('usado', false)
      .single();

    if (error || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou já utilizado' },
        { status: 400 }
      );
    }

    // ─── Verificar expiração ──────────────────────────────────
    if (new Date(tokenData.expira_em) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token expirado. Solicite um novo.' },
        { status: 400 }
      );
    }

    // ─── Marcar e-mail como verificado ────────────────────────
    await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', tokenData.user_id);

    // ─── Marcar token como usado ──────────────────────────────
    await supabase
      .from('email_verification_tokens')
      .update({ usado: true })
      .eq('id', tokenData.id);

    return NextResponse.json({
      success: true,
      message: 'E-mail verificado com sucesso! Bem-vindo à BatCaverna.',
    });

  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
