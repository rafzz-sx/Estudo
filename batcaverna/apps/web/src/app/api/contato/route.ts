import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { aplicarLimite, ipDaRequisicao, limparTexto } from '@/lib/seguranca';
import { validarEmail } from '@batcaverna/utils';

/**
 * POST /api/contato — formulário público da página /contato.
 *
 * A página tinha o formulário inteiro e um `setTimeout(800)` no lugar da
 * requisição. Mostrava "encaminhada com sucesso para o comando" e descartava
 * a mensagem. Esta rota é o que faltava.
 *
 * É pública de propósito: quem quer perguntar antes de se cadastrar não tem
 * conta. Por isso três defesas que uma rota logada não precisaria:
 *
 *   • limite por IP (3 mensagens a cada 15 min);
 *   • campo-armadilha `site`: fica invisível na tela, e robô que preenche
 *     tudo cai nele — a resposta é "sucesso" para não ensinar o robô, mas
 *     nada é gravado;
 *   • tamanhos validados aqui E no CHECK da tabela.
 *
 * Não há tela nova no admin: cada mensagem vira uma notificação para os
 * administradores, na caixa que eles já abrem. A linha fica em
 * `contatos_publicos` como registro.
 */

const ASSUNTOS = new Set(['duvida', 'bizu', 'bug', 'parceria', 'outro']);

const ROTULO_ASSUNTO: Record<string, string> = {
  duvida: 'Dúvida',
  bizu: 'Sugestão de conteúdo',
  bug: 'Relato de erro',
  parceria: 'Parceria',
  outro: 'Contato',
};

export async function POST(req: NextRequest) {
  try {
    const bloqueio = aplicarLimite(req, 'contato', 3, 900);
    if (bloqueio) return bloqueio;

    const body = await req.json().catch(() => ({}));

    // Campo-armadilha. Humano nunca vê; robô preenche. Respondemos sucesso
    // para não revelar a defesa, e não gravamos nada.
    if (typeof body?.site === 'string' && body.site.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    const nome = limparTexto(body?.nome, 100);
    const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 255);
    const mensagem = limparTexto(body?.mensagem, 4000);
    const assunto = ASSUNTOS.has(body?.assunto) ? body.assunto : 'outro';

    if (!nome || nome.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Informe seu nome.' },
        { status: 400 }
      );
    }
    if (!validarEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Informe um e-mail válido para a resposta.' },
        { status: 400 }
      );
    }
    if (!mensagem || mensagem.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Escreva pelo menos algumas palavras.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Se estava logado, guardamos o vínculo. Não é obrigatório.
    const user = await getAuthUserFromRequest(req);

    const { data: registro, error } = await supabase
      .from('contatos_publicos')
      .insert({
        nome,
        email,
        assunto,
        mensagem,
        user_id: user?.id ?? null,
        ip_origem: ipDaRequisicao(req).slice(0, 64),
      })
      .select('id')
      .single();

    if (error) throw error;

    // ─── Avisar os administradores ───────────────────────────
    // Reaproveita a caixa de notificações que o admin já lê. Falhar aqui não
    // pode falhar o envio: a mensagem já está gravada.
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .eq('ativo', true);

      if (admins?.length) {
        const trecho =
          mensagem.length > 140 ? `${mensagem.slice(0, 139)}…` : mensagem;

        await supabase.from('notificacoes').insert(
          admins.map((a) => ({
            user_id: a.id,
            tipo: 'sistema',
            titulo: `📨 ${ROTULO_ASSUNTO[assunto]} pelo formulário de contato`,
            mensagem: `${nome} <${email}>: "${trecho}"`,
            dados_extra: {
              contato_id: registro.id,
              assunto,
              email,
              nome,
            },
          }))
        );
      }
    } catch (e) {
      console.error('Falha ao notificar admins sobre contato:', e);
    }

    return NextResponse.json({ success: true, data: { id: registro.id } });
  } catch (error) {
    console.error('POST /api/contato error:', error);
    return NextResponse.json(
      { success: false, error: 'Não consegui enviar agora. Tente de novo em instantes.' },
      { status: 500 }
    );
  }
}
