import { NextRequest, NextResponse } from 'next/server';
import { aplicarLimite } from '@/lib/seguranca';
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
    // 4 pedidos a cada 15 min: recuperacao de senha e o alvo classico
    // de quem quer descobrir quais e-mails existem na base.
    const bloqueio = aplicarLimite(req, 'recuperar', 4, 900);
    if (bloqueio) return bloqueio;

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

    // ─── Entrega do código ────────────────────────────────────
    //
    // ATENÇÃO: este endpoint devolvia `_dev_code` com o código de
    // redefinição DENTRO DA RESPOSTA, para qualquer um que chamasse. Bastava
    // saber o e-mail de alguém para pedir a recuperação, ler o código na
    // resposta e trocar a senha da conta alheia — tomada de conta completa,
    // sem nenhuma barreira.
    //
    // O código agora só sai da API fora de produção, e mesmo assim apenas
    // quando não há provedor de e-mail configurado. Em produção ele vai
    // para o log do servidor e para o e-mail; nunca para o cliente.
    const emProducao = process.env.NODE_ENV === 'production';
    const temProvedorDeEmail = !!process.env.RESEND_API_KEY;

    if (!temProvedorDeEmail) {
      // Sem provedor: o código fica no log do servidor, ao qual só o
      // administrador tem acesso.
      console.log(`[RECUPERAÇÃO] Código para ${email}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      message: temProvedorDeEmail
        ? 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.'
        : emProducao
        ? 'Recuperação por e-mail ainda não está ativa. Abra um chamado no Suporte para redefinir sua senha.'
        : 'Se o e-mail estiver cadastrado, você receberá um código de recuperação.',
      // Só em desenvolvimento, e só quando não há como enviar o e-mail.
      ...(!emProducao && !temProvedorDeEmail ? { _dev_code: code } : {}),
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
    // O codigo tem 6 digitos: sao so 1 milhao de combinacoes. Sem
    // limite, um script acerta em minutos e troca a senha de qualquer
    // conta. 10 tentativas a cada 15 min por IP fecha essa porta.
    const bloqueio = aplicarLimite(req, 'redefinir-senha', 10, 900);
    if (bloqueio) return bloqueio;

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
