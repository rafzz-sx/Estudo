/**
 * Envio de e-mail.
 *
 * ─── Por que pelo HTTP e não por uma biblioteca ───────────────────────────
 *
 * O Resend tem API REST, então `fetch` resolve. Instalar o SDK acrescentaria
 * uma dependência ao projeto para fazer exatamente o POST que está aqui —
 * e a máquina onde este código foi escrito não tinha como instalar nem como
 * testar pacote nenhum. Menos dependência, menos coisa para atualizar, e
 * nada aqui depende de versão de terceiro.
 *
 * Trocar de provedor é reescrever `dispararNoProvedor` e mais nada: quem
 * chama só conhece `enviarEmail`.
 *
 * ─── Regra que vale para todo mundo que chamar daqui ──────────────────────
 *
 * ESTE MÓDULO NUNCA LANÇA. E-mail é entrega de terceiro: cai, expira, o
 * domínio deixa de estar verificado, a cota acaba. Nenhuma dessas coisas
 * pode derrubar o cadastro de um aluno nem a redefinição de senha dele.
 * Quem chama recebe `{ ok: false, erro }` e decide o que fazer.
 */

/** Tempo máximo esperando o provedor. Além disso, a requisição do aluno trava. */
const TIMEOUT_MS = 8000;

const ENDPOINT = 'https://api.resend.com/emails';

/**
 * Há como enviar e-mail nesta instalação?
 *
 * As rotas usam isto para ser HONESTAS com o aluno em vez de fingir que
 * enviaram. Foi a falta dessa distinção que deixou a tela de recuperação
 * mostrando "não está ativa" com ✓ verde de sucesso, acima de um campo
 * pedindo o código que nunca ia chegar.
 */
export function temProvedorDeEmail(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Remetente. Precisa ser de um domínio verificado no Resend.
 *
 * `onboarding@resend.dev` é o remetente de teste do próprio Resend: funciona
 * sem verificar domínio nenhum, mas SÓ entrega para o e-mail dono da conta.
 * Serve para conferir que a integração está de pé, não para atender aluno.
 */
function remetente(): string {
  // `EMAIL_FROM` é o nome que o .env.example já documentava antes deste
  // módulo existir. Aceita "fulano@dominio" ou "Nome <fulano@dominio>".
  const configurado = process.env.EMAIL_FROM?.trim();
  if (!configurado) return 'BatCaverna <onboarding@resend.dev>';
  return configurado.includes('<') ? configurado : `BatCaverna <${configurado}>`;
}

export interface ResultadoEmail {
  ok: boolean;
  erro?: string;
  id?: string;
}

async function dispararNoProvedor(corpo: Record<string, unknown>): Promise<ResultadoEmail> {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) return { ok: false, erro: 'RESEND_API_KEY não está configurada' };

  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${chave}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(corpo),
      signal: controle.signal,
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      // A mensagem do provedor vai para o log do servidor, nunca para o
      // cliente: ela pode citar domínio, cota e configuração da conta.
      const detalhe =
        (dados as { message?: string }).message ?? `HTTP ${resposta.status}`;
      console.error('[EMAIL] provedor recusou:', detalhe);
      return { ok: false, erro: detalhe };
    }

    return { ok: true, id: (dados as { id?: string }).id };
  } catch (erro) {
    const motivo =
      erro instanceof Error && erro.name === 'AbortError'
        ? `sem resposta em ${TIMEOUT_MS}ms`
        : String(erro);
    console.error('[EMAIL] falha ao enviar:', motivo);
    return { ok: false, erro: motivo };
  } finally {
    clearTimeout(relogio);
  }
}

/**
 * Envia um e-mail. Não lança nunca — veja o cabeçalho deste arquivo.
 */
export async function enviarEmail(params: {
  para: string;
  assunto: string;
  html: string;
  /** Versão em texto puro. Alguns clientes e filtros de spam pedem. */
  texto?: string;
}): Promise<ResultadoEmail> {
  const { para, assunto, html, texto } = params;

  if (!para?.trim()) return { ok: false, erro: 'destinatário vazio' };

  return dispararNoProvedor({
    from: remetente(),
    to: [para.trim()],
    subject: assunto,
    html,
    ...(texto ? { text: texto } : {}),
  });
}

// ══════════════════════════════════════════════════════════════════
// Modelos
// ══════════════════════════════════════════════════════════════════
//
// HTML de e-mail é o que é: tabela, estilo em atributo, nada de classe.
// Cliente de e-mail ignora <style> no <head> com frequência, e o Gmail
// remove o que não entende. O que está aqui é o subconjunto que passa.

function moldura(titulo: string, miolo: string): string {
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:24px;background:#0B0B0F;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;margin:0 auto;background:#15151B;border:1px solid #2A2A33;border-radius:16px;">
    <tr><td style="padding:28px 28px 8px 28px;">
      <p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#F5C518;">🦇 BatCaverna</p>
      <h1 style="margin:0;font-size:17px;color:#EDEDF0;">${titulo}</h1>
    </td></tr>
    <tr><td style="padding:8px 28px 28px 28px;color:#B4B4BE;font-size:14px;line-height:1.6;">
      ${miolo}
    </td></tr>
  </table>
  <p style="max-width:480px;margin:16px auto 0 auto;color:#6B6B78;font-size:11px;text-align:center;">
    Se você não pediu isto, ignore esta mensagem — nada muda na sua conta.
  </p>
</body></html>`;
}

/** O código de 6 dígitos da redefinição de senha. */
export function modeloCodigoDeSenha(codigo: string, minutos: number) {
  return {
    assunto: `${codigo} é o seu código para redefinir a senha`,
    html: moldura(
      'Redefinir sua senha',
      `<p style="margin:0 0 16px 0;">Use o código abaixo na tela de recuperação:</p>
       <p style="margin:0 0 16px 0;padding:14px;background:#0B0B0F;border:1px solid #2A2A33;border-radius:12px;text-align:center;
                 font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:30px;letter-spacing:8px;color:#F5C518;font-weight:bold;">
         ${codigo}
       </p>
       <p style="margin:0;">Ele vale por <strong style="color:#EDEDF0;">${minutos} minutos</strong> e só pode ser usado uma vez.
       Pedir um código novo cancela este.</p>`
    ),
    texto:
      `Seu código para redefinir a senha na BatCaverna: ${codigo}\n\n` +
      `Vale por ${minutos} minutos e só pode ser usado uma vez. ` +
      `Pedir um código novo cancela este.\n\n` +
      `Se você não pediu isto, ignore esta mensagem.`,
  };
}
