import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { hashToken, generateEmailToken, getEmailTokenExpiry } from '@/lib/auth';

function getSupabase() {
  return createServerSupabaseClient();
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/recuperar — Solicitar recuperação de senha
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buscar usuário pelo e-mail
    const { data: user } = await supabase
      .from('users')
      .select('id, nome, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    // Sempre retorna sucesso por segurança (evita enumerar e-mails)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.',
      });
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await hashToken(code);

    // Salvar token de recuperação na tabela email_verification_tokens
    // Reutilizamos a tabela existente com um prefixo para distinguir
    await supabase.from('email_verification_tokens').insert({
      user_id: user.id,
      token: `reset_${codeHash}`,
      expira_em: getEmailTokenExpiry().toISOString(),
      usado: false,
    });

    // Em produção enviaria e-mail. Por ora, logamos no console e retornamos o código
    console.log(`[RECUPERAÇÃO] Código para ${email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.',
      // TODO: remover em produção — apenas para dev/demo
      _dev_code: code,
    });

  } catch (error: any) {
    console.error('Recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT /api/auth/recuperar — Redefinir senha com código
// ═══════════════════════════════════════════════════════════════
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, nova_senha } = body;

    if (!email?.trim() || !code?.trim() || !nova_senha) {
      return NextResponse.json(
        { success: false, error: 'E-mail, código e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar nova senha
    if (nova_senha.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(nova_senha)) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter pelo menos uma letra maiúscula' },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(nova_senha)) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter pelo menos um número' },
        { status: 400 }
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(nova_senha)) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter pelo menos um caractere especial' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buscar usuário
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar código
    const codeHash = await hashToken(code.trim());
    const { data: token } = await supabase
      .from('email_verification_tokens')
      .select('id, expira_em, usado')
      .eq('user_id', user.id)
      .eq('token', `reset_${codeHash}`)
      .eq('usado', false)
      .single();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Código inválido ou expirado' },
        { status: 400 }
      );
    }

    // Verificar expiração
    if (new Date(token.expira_em) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Código expirado. Solicite um novo.' },
        { status: 400 }
      );
    }

    // Atualizar senha
    const novaSenhaHash = await hashToken(nova_senha);
    const { error: updateError } = await supabase
      .from('users')
      .update({ senha_hash: novaSenhaHash })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar senha' },
        { status: 500 }
      );
    }

    // Marcar token como usado
    await supabase
      .from('email_verification_tokens')
      .update({ usado: true })
      .eq('id', token.id);

    // Invalidar todos os refresh tokens do usuário (forçar re-login)
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
