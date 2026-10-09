import { NextRequest, NextResponse } from 'next/server';
import { aplicarLimiteAsync } from '@/lib/seguranca';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  hashToken,
  hashSenha,
  getResetTokenExpiry,
  generatePasswordResetTokens,
  MINUTOS_DO_CODIGO,
} from '@/lib/auth';
import {
  enviarEmail,
  modeloResetSenhaLinkECodigo,
  modeloConfirmacaoSenhaAlterada,
  temProvedorDeEmail,
} from '@/lib/email';
import { isStrongPassword } from '@/lib/validators';

function getSupabase() {
  return createServerSupabaseClient();
}

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/recuperar — Solicitar recuperação de senha
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    // Rate-limiting duplo: por IP e por conta de e-mail (4 pedidos / 15 min)
    const bloqueio = await aplicarLimiteAsync(req, 'recuperar', 4, 900, email);
    if (bloqueio) return bloqueio;

    const supabase = getSupabase();

    // Buscar usuário pelo e-mail
    const { data: user } = await supabase
      .from('users')
      .select('id, nome, email, role')
      .eq('email', email)
      .single();

    // Sempre retorna mensagem genérica por segurança (evita enumeração de e-mails)
    if (!user) {
      return NextResponse.json({
        success: true,
        codigo_enviado: true,
        message: 'Se o e-mail estiver cadastrado, as instruções e o link de recuperação foram enviados.',
      });
    }

    // Gerar token de link (64 hex chars) e código numérico (6 dígitos) seguros
    const { token, code } = generatePasswordResetTokens();
    const tokenHash = await hashToken(token);
    const codeHash = await hashToken(code);
    const expiraEm = getResetTokenExpiry().toISOString();

    // ─── 1. Invalida tokens anteriores pendentes do usuário ───
    try {
      await supabase
        .from('password_reset_tokens')
        .update({ usado: true })
        .eq('user_id', user.id)
        .eq('usado', false);
    } catch {
      // Ignora se tabela ainda não existir
    }

    try {
      await supabase
        .from('email_verification_tokens')
        .update({ usado: true })
        .eq('user_id', user.id)
        .eq('usado', false)
        .like('token', 'reset_%');
    } catch {
      // Ignora
    }

    // ─── 2. Salvar novos tokens (tabela dedicada com fallback resiliente) ─
    let salvouNaTabelaDedicada = false;
    try {
      const { error: insErr } = await supabase.from('password_reset_tokens').insert([
        {
          user_id: user.id,
          token_hash: tokenHash,
          tipo: 'link',
          expira_em: expiraEm,
          usado: false,
        },
        {
          user_id: user.id,
          token_hash: codeHash,
          tipo: 'codigo',
          expira_em: expiraEm,
          usado: false,
        },
      ]);
      if (!insErr) {
        salvouNaTabelaDedicada = true;
      }
    } catch {
      salvouNaTabelaDedicada = false;
    }

    // Fallback: se a tabela password_reset_tokens ainda não estiver migrada
    if (!salvouNaTabelaDedicada) {
      await supabase.from('email_verification_tokens').insert([
        {
          user_id: user.id,
          token: `reset_${tokenHash}`,
          expira_em: expiraEm,
          usado: false,
        },
        {
          user_id: user.id,
          token: `reset_${codeHash}`,
          expira_em: expiraEm,
          usado: false,
        },
      ]);
    }

    // ─── 3. Disparo do E-mail ──────────────────────────────────
    const emProducao = process.env.NODE_ENV === 'production';
    const temProvedor = temProvedorDeEmail();
    let entregue = false;

    if (temProvedor) {
      const modelo = modeloResetSenhaLinkECodigo({
        token,
        codigo: code,
        minutos: MINUTOS_DO_CODIGO,
        email: user.email,
      });

      const envio = await enviarEmail({
        para: user.email,
        assunto: modelo.assunto,
        html: modelo.html,
        texto: modelo.texto,
      });

      entregue = envio.ok;

      if (!envio.ok) {
        console.error(`[RECUPERAÇÃO] Falha ao enviar e-mail para ${email}: ${envio.erro}`);
      }
    } else {
      console.warn(`[RECUPERAÇÃO] Nenhum serviço de e-mail ativo (SMTP/Resend/Brevo) para ${email}.`);
    }

    const codigoEnviado = entregue || !emProducao;

    return NextResponse.json({
      success: true,
      codigo_enviado: codigoEnviado,
      message: codigoEnviado
        ? 'Se o e-mail estiver cadastrado, as instruções e o link de recuperação foram enviados.'
        : temProvedor
          ? 'Não foi possível enviar o e-mail agora. Verifique as configurações de SMTP ou tente novamente.'
          : 'O serviço de envio de e-mail ainda não está configurado. O administrador pode redefinir o acesso via terminal (npm run admin:rescue).',
    });

  } catch (error: unknown) {
    console.error('Recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT /api/auth/recuperar — Redefinir senha com token, código ou recovery code
// ═══════════════════════════════════════════════════════════════
export async function PUT(req: NextRequest) {
  try {
    // 10 tentativas a cada 15 min por IP para evitar força bruta
    const bloqueio = await aplicarLimiteAsync(req, 'redefinir-senha', 10, 900);
    if (bloqueio) return bloqueio;

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').toLowerCase().trim();
    const tokenInformado = String(body?.token ?? '').trim();
    const codeInformado = String(body?.code ?? '').trim();
    const recoveryCodeInformado = String(body?.recovery_code ?? '').trim().toUpperCase();
    const novaSenha = String(body?.nova_senha ?? '');

    if (!email || (!tokenInformado && !codeInformado && !recoveryCodeInformado) || !novaSenha) {
      return NextResponse.json(
        { success: false, error: 'E-mail, credencial de recuperação e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar força da nova senha
    const forca = isStrongPassword(novaSenha);
    if (!forca.valid) {
      return NextResponse.json(
        { success: false, error: `A nova senha precisa de: ${forca.errors.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buscar usuário
    const { data: user } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Código ou token inválido ou expirado' },
        { status: 400 }
      );
    }

    let tokenValidoId: string | null = null;
    let tabelaTokenUsada: 'password_reset_tokens' | 'email_verification_tokens' | 'admin_recovery_codes' | null = null;

    // ─── 1. Fluxo de Código de Contingência do Admin (Break-Glass) ─
    if (recoveryCodeInformado) {
      // Regra de segurança: Apenas administradores podem usar recovery codes
      if (user.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado: Código de contingência exclusivo para administradores.' },
          { status: 403 }
        );
      }

      const recHash = await hashToken(recoveryCodeInformado);

      const { data: recCode } = await supabase
        .from('admin_recovery_codes')
        .select('id, usado')
        .eq('admin_id', user.id)
        .eq('codigo_hash', recHash)
        .eq('usado', false)
        .single();

      if (!recCode) {
        return NextResponse.json(
          { success: false, error: 'Código de contingência inválido ou já utilizado.' },
          { status: 400 }
        );
      }

      tokenValidoId = recCode.id;
      tabelaTokenUsada = 'admin_recovery_codes';
    } else {
      // ─── 2. Fluxo Normal: Token de Link (64 chars) ou Código (6 dígitos) ──
      const valorBruto = tokenInformado || codeInformado;
      const hashEsperado = await hashToken(valorBruto);

      // Tenta primeiro na tabela dedicada
      try {
        const { data: tokenDedicado } = await supabase
          .from('password_reset_tokens')
          .select('id, expira_em, usado')
          .eq('user_id', user.id)
          .eq('token_hash', hashEsperado)
          .eq('usado', false)
          .single();

        if (tokenDedicado) {
          if (new Date(tokenDedicado.expira_em) < new Date()) {
            return NextResponse.json(
              { success: false, error: 'Link ou código expirado. Solicite uma nova recuperação.' },
              { status: 400 }
            );
          }
          tokenValidoId = tokenDedicado.id;
          tabelaTokenUsada = 'password_reset_tokens';
        }
      } catch {
        // Ignora caso tabela não exista
      }

      // Se não encontrou, tenta fallback na tabela email_verification_tokens
      if (!tokenValidoId) {
        const { data: tokenFallback } = await supabase
          .from('email_verification_tokens')
          .select('id, expira_em, usado')
          .eq('user_id', user.id)
          .eq('token', `reset_${hashEsperado}`)
          .eq('usado', false)
          .single();

        if (tokenFallback) {
          if (new Date(tokenFallback.expira_em) < new Date()) {
            return NextResponse.json(
              { success: false, error: 'Link ou código expirado. Solicite uma nova recuperação.' },
              { status: 400 }
            );
          }
          tokenValidoId = tokenFallback.id;
          tabelaTokenUsada = 'email_verification_tokens';
        }
      }
    }

    if (!tokenValidoId || !tabelaTokenUsada) {
      return NextResponse.json(
        { success: false, error: 'Link, código ou credencial inválida ou já utilizada.' },
        { status: 400 }
      );
    }

    // ─── 3. Atualizar Senha com PBKDF2 e Desbloquear Conta ───
    const novaSenhaHash = await hashSenha(novaSenha);
    const { error: updateError } = await supabase
      .from('users')
      .update({
        senha_hash: novaSenhaHash,
        tentativas_login_falhas: 0,
        bloqueado_ate: null,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erro ao atualizar senha no banco:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao salvar nova senha' },
        { status: 500 }
      );
    }

    // ─── 4. Marcar o Token / Código como Usado ───────────────
    if (tabelaTokenUsada === 'admin_recovery_codes') {
      await supabase
        .from('admin_recovery_codes')
        .update({ usado: true, usado_em: new Date().toISOString() })
        .eq('id', tokenValidoId);

      // Registrar na trilha de auditoria
      try {
        await supabase.from('admin_audit_log').insert({
          admin_id: user.id,
          acao: 'recuperacao_admin_via_codigo_contingencia',
          entidade_afetada: 'users',
          entidade_id: user.id,
          detalhes: { data: new Date().toISOString() },
        });
      } catch (auditErr) {
        console.warn('Aviso: falha ao registrar log de auditoria:', auditErr);
      }
    } else if (tabelaTokenUsada === 'password_reset_tokens') {
      await supabase
        .from('password_reset_tokens')
        .update({ usado: true, usado_em: new Date().toISOString() })
        .eq('id', tokenValidoId);
    } else {
      await supabase
        .from('email_verification_tokens')
        .update({ usado: true })
        .eq('id', tokenValidoId);
    }

    // ─── 5. Invalidar Todas as Sessões Ativas (Revogação) ─────
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', user.id);

    // ─── 6. Enviar Notificação Transacional de Segurança ──────
    if (temProvedorDeEmail()) {
      const modelo = modeloConfirmacaoSenhaAlterada(user.email);
      enviarEmail({
        para: user.email,
        assunto: modelo.assunto,
        html: modelo.html,
        texto: modelo.texto,
      }).catch((emailErr) => {
        console.warn('Aviso: falha ao enviar e-mail de confirmação de senha:', emailErr);
      });
    }

    // ─── 7. Resposta e Limpeza de Cookies ─────────────────────
    const response = NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
    });

    response.cookies.delete('bat_access_token');
    response.cookies.delete('bat_refresh_token');

    return response;

  } catch (error: unknown) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
