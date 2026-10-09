/**
 * Envio de e-mail seguro para BatCaverna.
 *
 * Suporta:
 * 1. SMTP Direto (Gmail com Senha de Aplicativo, Hostinger, cPanel, Titan, Zoho)
 * 2. Provedores REST (Resend e Brevo) como contingência
 *
 * ESTE MÓDULO NUNCA LANÇA ERROS NÃO TRATADOS.
 * Quem chama recebe `{ ok: boolean, erro?: string, id?: string }` e decide o fluxo.
 */

import fs from 'fs';
import path from 'path';
import nodemailer, { type Transporter } from 'nodemailer';

const TIMEOUT_MS = 10000;

export interface ResultadoEmail {
  ok: boolean;
  erro?: string;
  id?: string;
}

/**
 * Confere se há algum meio de envio de e-mail configurado nesta instalação.
 */
export function temProvedorDeEmail(): boolean {
  const temSmtp = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
  const temResend = !!process.env.RESEND_API_KEY;
  const temBrevo = !!process.env.BREVO_API_KEY;

  return temSmtp || temResend || temBrevo;
}

/**
 * Obtém o remetente formatado a partir das variáveis de ambiente.
 */
function remetente(): string {
  const configurado = (
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.SMTP_USER
  )?.trim();

  if (!configurado) return 'BatCaverna <batcaverna.suporte@gmail.com>';
  return configurado.includes('<') ? configurado : `BatCaverna <${configurado}>`;
}

// ─── Cache do Transporter SMTP ─────────────────────────────────
let transporterCache: Transporter | null = null;

function obterTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return null;

  if (transporterCache) return transporterCache;

  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';

  // Remove espaços caso o usuário tenha colado a senha do Google com separadores (ex: "abcd efgh ijkl mnop")
  const senhaLimpa = host.includes('gmail') ? pass.replace(/\s+/g, '') : pass;

  transporterCache = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: senhaLimpa,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' && !process.env.SMTP_ALLOW_SELFSIGNED,
    },
  });

  return transporterCache;
}

let logoCache: Buffer | null = null;
function obterBufferLogo(): Buffer | null {
  if (logoCache) return logoCache;
  try {
    const caminhos = [
      path.join(process.cwd(), 'public/images/bat_logo_dark.png'),
      path.join(process.cwd(), 'apps/web/public/images/bat_logo_dark.png'),
      path.join(process.cwd(), 'public/images/bat_logo.png'),
      path.join(process.cwd(), 'apps/web/public/images/bat_logo.png'),
    ];
    for (const c of caminhos) {
      if (fs.existsSync(/*turbopackIgnore: true*/ c)) {
        logoCache = fs.readFileSync(/*turbopackIgnore: true*/ c);
        return logoCache;
      }
    }
  } catch {
    // Silencioso se houver restrição
  }
  return null;
}

/**
 * Obtém a URL base real do sistema na Vercel ou local
 */
export function obterAppUrl(): string {
  const custom = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  )?.trim();

  if (custom) {
    const comProtocolo = custom.startsWith('http') ? custom : `https://${custom}`;
    return comProtocolo.replace(/\/+$/, '');
  }

  return 'https://estudo-tan.vercel.app';
}

/**
 * Disparo primário via SMTP com fallback para API REST (Resend / Brevo)
 */
async function dispararEmail(corpo: {
  para: string;
  assunto: string;
  html: string;
  texto?: string;
}): Promise<ResultadoEmail> {
  const { para, assunto, html, texto } = corpo;
  const from = remetente();

  // 1. Tentar SMTP (Gmail ou Hospedagem)
  const transporter = obterTransporter();
  if (transporter) {
    try {
      const bufferLogo = obterBufferLogo();
      const attachments = bufferLogo
        ? [
            {
              filename: 'batcaverna_logo.png',
              content: bufferLogo,
              cid: 'bat_logo_inline',
              contentType: 'image/png',
            },
          ]
        : [];

      const info = await Promise.race([
        transporter.sendMail({
          from,
          to: para,
          replyTo: 'batcaverna.suporte@gmail.com',
          subject: assunto,
          html,
          text: texto || '',
          attachments,
          headers: {
            'X-Priority': '1',
            'Importance': 'high',
            'X-Entity-Ref-ID': `batcaverna-${Date.now()}`,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout SMTP após ${TIMEOUT_MS}ms`)), TIMEOUT_MS)
        ),
      ]);

      return { ok: true, id: info.messageId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[EMAIL] Falha no disparo via SMTP:', msg);
      // Se tiver outros provedores, tenta o fallback abaixo; senão retorna o erro
      if (!process.env.RESEND_API_KEY && !process.env.BREVO_API_KEY) {
        return { ok: false, erro: msg || 'Falha no envio via SMTP' };
      }
    }
  }

  // 2. Fallback: Resend via REST
  if (process.env.RESEND_API_KEY) {
    const chave = process.env.RESEND_API_KEY.trim();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${chave}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [para],
          subject: assunto,
          html,
          ...(texto ? { text: texto } : {}),
        }),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        return { ok: true, id: json?.id };
      }
      console.error('[EMAIL] Resend retornou erro:', json?.message || res.status);
    } catch (resendErr: unknown) {
      const msg = resendErr instanceof Error ? resendErr.message : String(resendErr);
      console.error('[EMAIL] Falha na requisição Resend:', msg);
    } finally {
      clearTimeout(timeout);
    }
  }

  // 3. Fallback: Brevo via REST
  if (process.env.BREVO_API_KEY) {
    const chave = process.env.BREVO_API_KEY.trim();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': chave,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'BatCaverna', email: from.match(/<([^>]+)>/)?.[1] || from },
          to: [{ email: para }],
          subject: assunto,
          htmlContent: html,
          ...(texto ? { textContent: texto } : {}),
        }),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        return { ok: true, id: json?.messageId };
      }
      console.error('[EMAIL] Brevo retornou erro:', json?.message || res.status);
    } catch (brevoErr: unknown) {
      const msg = brevoErr instanceof Error ? brevoErr.message : String(brevoErr);
      console.error('[EMAIL] Falha na requisição Brevo:', msg);
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    ok: false,
    erro: 'Nenhum serviço de envio de e-mail (SMTP/Resend/Brevo) disponível ou funcionando.',
  };
}

/**
 * Envia um e-mail de forma resiliente.
 */
export async function enviarEmail(params: {
  para: string;
  assunto: string;
  html: string;
  texto?: string;
}): Promise<ResultadoEmail> {
  const { para, assunto, html, texto } = params;

  if (!para?.trim()) {
    return { ok: false, erro: 'Destinatário não informado' };
  }

  return dispararEmail({
    para: para.trim().toLowerCase(),
    assunto,
    html,
    texto,
  });
}

// ══════════════════════════════════════════════════════════════════
// Modelos de E-mail
// ══════════════════════════════════════════════════════════════════

function moldura(titulo: string, miolo: string): string {
  const urlBase = obterAppUrl();
  const logoUrlFallback = `${urlBase}/images/bat_logo_dark.png`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:24px 12px;background:#07070A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;margin:0 auto;background:#111116;border:1px solid #23232C;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.6);">
    <!-- Linha Dourada Tática Superior -->
    <tr>
      <td style="height:4px;background:linear-gradient(90deg, #EAB308, #F5C518, #FFD700, #EAB308);"></td>
    </tr>
    <!-- Cabeçalho com Logo Oficial da BatCaverna -->
    <tr>
      <td style="padding:26px 28px 14px 28px;text-align:left;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="vertical-align:middle;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="cid:bat_logo_inline" onerror="this.onerror=null;this.src='${logoUrlFallback}';" width="54" height="32" alt="BatCaverna" style="display:block;max-height:36px;width:auto;object-fit:contain;border:0;">
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:20px;font-weight:900;letter-spacing:1.5px;color:#F5C518;display:block;line-height:1;">BATCAVERNA</span>
                    <span style="font-size:10px;font-weight:600;letter-spacing:1px;color:#8E8E98;text-transform:uppercase;display:block;margin-top:2px;">Plataforma Militar de Estudos</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align:right;vertical-align:middle;">
              <span style="display:inline-block;padding:4px 10px;background:rgba(245,197,24,0.12);border:1px solid rgba(245,197,24,0.3);border-radius:20px;font-size:11px;font-weight:bold;color:#F5C518;letter-spacing:0.5px;">SEGURANÇA</span>
            </td>
          </tr>
        </table>
        <h1 style="margin:18px 0 0 0;font-size:18px;color:#EDEDF0;font-weight:700;letter-spacing:-0.2px;">${titulo}</h1>
      </td>
    </tr>
    <!-- Conteúdo Principal -->
    <tr>
      <td style="padding:8px 28px 28px 28px;color:#B4B4BE;font-size:14px;line-height:1.65;">
        ${miolo}
      </td>
    </tr>
  </table>
  <!-- Rodapé com Informações de Segurança e Antispam -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:520px;margin:20px auto 0 auto;text-align:center;">
    <tr>
      <td style="color:#6B6B78;font-size:12px;line-height:1.5;padding:0 16px;">
        <p style="margin:0 0 4px 0;color:#8E8E98;font-weight:600;">BatCaverna — Preparação Tática Militar</p>
        <p style="margin:0 0 8px 0;">Porque é aqui, focado e em silêncio, que você constrói a sua aprovação.</p>
        <p style="margin:0;font-size:11px;color:#52525B;">
          Se este e-mail caiu na sua pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>, marque como <em>"Não é spam"</em> ou adicione <strong>batcaverna.suporte@gmail.com</strong> aos seus contatos confiáveis.
        </p>
      </td>
    </tr>
  </table>
</body></html>`;
}

/**
 * E-mail com Link de Redefinição Seguro e Código Alternativo de 6 dígitos
 */
export function modeloResetSenhaLinkECodigo(params: {
  token: string;
  codigo: string;
  minutos: number;
  email: string;
}) {
  const { token, codigo, minutos, email } = params;
  const urlBase = obterAppUrl();
  const link = `${urlBase}/auth/recuperar?token=${token}&email=${encodeURIComponent(email)}`;

  return {
    assunto: '🔐 Recuperação de Senha — BatCaverna',
    html: moldura(
      'Protocolo de Redefinição de Senha',
      `<p style="margin:0 0 16px 0;font-size:15px;color:#EDEDF0;">
         Saudações, <strong>Soldado</strong>!
       </p>
       <p style="margin:0 0 20px 0;">
         Recebemos uma solicitação para redefinir as credenciais de acesso da sua conta (<strong>${email}</strong>) na BatCaverna.
       </p>
       <p style="margin:0 0 24px 0;text-align:center;">
         <a href="${link}" style="display:inline-block;padding:15px 34px;background:linear-gradient(135deg, #F5C518 0%, #FFD700 50%, #EAB308 100%);color:#07070A;text-decoration:none;font-weight:800;font-size:15px;border-radius:12px;letter-spacing:0.5px;box-shadow:0 6px 20px rgba(245,197,24,0.35);">
           ⚡ REDEFINIR MINHA SENHA
         </a>
       </p>
       <p style="margin:0 0 12px 0;font-size:13px;color:#8E8E98;">
         Se preferir digitar o código diretamente na tela de recuperação da caverna, utilize seu código de autorização único:
       </p>
       <div style="margin:0 0 22px 0;padding:16px;background:#09090D;border:1px solid #23232C;border-radius:12px;text-align:center;">
         <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:32px;letter-spacing:10px;color:#F5C518;font-weight:900;text-shadow:0 0 12px rgba(245,197,24,0.4);">
           ${codigo}
         </span>
       </div>
       <div style="margin:0 0 16px 0;padding:12px 16px;background:rgba(245,197,24,0.06);border-left:3px solid #F5C518;border-radius:0 8px 8px 0;">
         <p style="margin:0;font-size:12px;color:#D4D4D8;">
           ⏱️ <strong>Validade do Protocolo:</strong> Este link e código expiram em <strong>${minutos} minutos</strong> e são de uso estritamente único.
         </p>
       </div>
       <p style="margin:0;font-size:12px;color:#71717A;">
         🛡️ Se você NÃO solicitou esta alteração, desconsidere esta mensagem. Sua senha atual continua blindada e nenhuma alteração foi realizada na sua conta.
       </p>`
    ),
    texto:
      `Recuperação de Senha — BatCaverna\n\n` +
      `Saudações, Soldado!\n` +
      `Recebemos uma solicitação de redefinição de senha para ${email}.\n\n` +
      `Para redefinir sua senha com segurança, acesse o link:\n${link}\n\n` +
      `Ou digite o código de autorização: ${codigo}\n\n` +
      `Validade: ${minutos} minutos (uso único).\n` +
      `Se você não solicitou, ignore esta mensagem. Suas credenciais continuam protegidas.`,
  };
}

/**
 * Notificação transacional enviada após a troca de senha bem-sucedida.
 */
export function modeloConfirmacaoSenhaAlterada(email: string) {
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date());

  return {
    assunto: '🛡️ Notificação de Segurança: Sua senha foi alterada na BatCaverna',
    html: moldura(
      'Senha Alterada com Sucesso',
      `<p style="margin:0 0 16px 0;font-size:15px;color:#EDEDF0;">
         Aviso de Segurança Operacional,
       </p>
       <p style="margin:0 0 16px 0;">
         Confirmamos que a senha da sua conta (<strong>${email}</strong>) na BatCaverna foi redefinida com sucesso em <strong>${dataFormatada}</strong>.
       </p>
       <div style="margin:0 0 20px 0;padding:14px 16px;background:#09090D;border:1px solid #10B981/30;border-radius:12px;">
         <p style="margin:0;font-size:13px;color:#34D399;font-weight:600;">
           ✓ Todas as sessões e dispositivos conectados anteriormente foram desconectados por precaução.
         </p>
       </div>
       <div style="margin:0;padding:14px 16px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;">
         <p style="margin:0 0 6px 0;font-size:13px;color:#F87171;font-weight:700;">
           Você NÃO reconhece esta alteração?
         </p>
         <p style="margin:0;font-size:12px;color:#A1A1AA;line-height:1.5;">
           Se você não realizou esta troca de senha, sua conta pode ter sido violada. Acesse imediatamente a página de recuperação ou entre em contato urgente com o suporte da BatCaverna (batcaverna.suporte@gmail.com).
         </p>
       </div>`
    ),
    texto:
      `Notificação de Segurança — BatCaverna\n\n` +
      `A senha da sua conta (${email}) foi redefinida com sucesso em ${dataFormatada}.\n` +
      `Todas as sessões anteriores foram encerradas.\n\n` +
      `Se você NÃO realizou essa alteração, contate o suporte urgente: batcaverna.suporte@gmail.com`,
  };
}

/** O código de 6 dígitos simples (retrocompatibilidade) */
export function modeloCodigoDeSenha(codigo: string, minutos: number) {
  return {
    assunto: '🔐 Recuperação de Senha — BatCaverna',
    html: moldura(
      'Redefinir sua senha',
      `<p style="margin:0 0 16px 0;">Use o código abaixo na tela de recuperação:</p>
       <p style="margin:0 0 16px 0;padding:14px;background:#0B0B0F;border:1px solid #2A2A33;border-radius:12px;text-align:center;
                 font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;letter-spacing:8px;color:#F5C518;font-weight:bold;">
         ${codigo}
       </p>
       <p style="margin:0;">Ele vale por <strong style="color:#EDEDF0;">${minutos} minutos</strong> e só pode ser usado uma vez.</p>`
    ),
    texto: `Seu código para redefinir a senha na BatCaverna: ${codigo}\nVale por ${minutos} minutos.`,
  };
}

/** E-mail de confirmação de cadastro com token */
export function modeloVerificacaoEmail(token: string, nome: string) {
  const urlBase = obterAppUrl();
  const link = `${urlBase}/verificar-email?token=${token}`;

  return {
    assunto: `Confirme seu e-mail na BatCaverna, ${nome}`,
    html: moldura(
      'Confirmação de e-mail',
      `<p style="margin:0 0 16px 0;">Olá, <strong>${nome}</strong>! Bem-vindo à BatCaverna.</p>
       <p style="margin:0 0 16px 0;">Para ativar seu acesso e validar seu endereço, clique no botão abaixo:</p>
       <p style="margin:0 0 20px 0;text-align:center;">
         <a href="${link}" style="display:inline-block;padding:12px 24px;background:#F5C518;color:#0B0B0F;text-decoration:none;font-weight:bold;border-radius:8px;">
           Confirmar meu e-mail
         </a>
       </p>
       <p style="margin:0;font-size:12px;color:#8E8E98;">Ou acesse diretamente: <a href="${link}" style="color:#F5C518;">${link}</a></p>`
    ),
    texto:
      `Olá, ${nome}! Bem-vindo à BatCaverna.\n\n` +
      `Para ativar sua conta e confirmar seu e-mail, acesse:\n${link}\n\n` +
      `Se você não criou esta conta, ignore esta mensagem.`,
  };
}
