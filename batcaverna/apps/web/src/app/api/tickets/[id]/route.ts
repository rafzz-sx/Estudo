import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';
import { decriptarTexto } from '@/lib/cripto';

/**
 * GET /api/tickets/[id] — um chamado com a conversa inteira.
 *
 * ESTA ROTA NÃO EXISTIA. A pasta `[id]/` tinha só `mensagens/`, e o histórico
 * do git confirma que o arquivo nunca foi criado. Quatro pontos do front a
 * chamavam:
 *
 *   (privado)/tickets/page.tsx:85    — o aluno abrindo o próprio chamado
 *   (privado)/admin/page.tsx:204     — o admin abrindo um chamado
 *   (privado)/admin/page.tsx:267     — o admin recarregando após responder
 *
 * Todos recebiam 404. Como a tela do aluno só testa `if (res.ok)` e a do admin
 * faz `.then(r => r.json())` sem `.catch()`, a falha era silenciosa:
 * `ticketDetalhe` ficava `null` para sempre. E como a caixa de resposta vive
 * DENTRO do bloco condicionado a `ticketDetalhe`, ninguém — nem aluno, nem
 * admin — conseguia responder um chamado. O suporte aceitava só a abertura.
 *
 * `GET /api/tickets` (a listagem) não resolve: ela seleciona
 * `'*, users (apelido)'`, sem as mensagens.
 *
 * A permissão é a mesma da rota irmã `[id]/mensagens`: dono ou admin. Aqui ela
 * sai de graça — o ticket já precisa ser lido para ser devolvido, então o
 * `user_id` vem na mesma consulta em vez de numa segunda.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // UUID conferido antes de virar filtro: texto solto faz o PostgREST
    // devolver 22P02 e a tela quebra por causa de um link ruim.
    const ticketId = uuidOuNulo(id);
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    const supabase = createServerSupabaseClient();

    let ticket: any = null;
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('*, users:users!tickets_user_id_fkey (id, nome, apelido, email, avatar_url, nivel_atual, role, xp_total, streak_dias, concurso_alvo, situacao)')
      .eq('id', ticketId)
      .maybeSingle();

    if (ticketError) {
      const { data: ticketSimples, error: errSimples } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .maybeSingle();

      if (errSimples || !ticketSimples) throw (errSimples || ticketError);
      ticket = ticketSimples;
    } else {
      ticket = ticketData;
    }

    // Mesma resposta para "não existe" e "não é seu": quem tenta adivinhar
    // UUID não descobre quais existem.
    if (!ticket || (user.role !== 'admin' && ticket.user_id !== user.id)) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    let mensagens: any[] = [];
    const { data: msgsComUser, error: errMsgs } = await supabase
      .from('ticket_mensagens')
      .select('id, autor_id, autor_role, conteudo, enviado_em, users (id, nome, apelido, avatar_url, role)')
      .eq('ticket_id', ticketId)
      .order('enviado_em', { ascending: true });

    if (errMsgs || !msgsComUser) {
      const { data: msgsSimples } = await supabase
        .from('ticket_mensagens')
        .select('id, autor_id, autor_role, conteudo, enviado_em')
        .eq('ticket_id', ticketId)
        .order('enviado_em', { ascending: true });
      mensagens = msgsSimples || [];
    } else {
      mensagens = msgsComUser;
    }

    const mensagensFormatadas = await Promise.all(
      (mensagens || []).map(async (m: any) => ({
        ...m,
        conteudo: await decriptarTexto(m.conteudo),
      }))
    );

    return NextResponse.json({
      success: true,
      data: { ...ticket, mensagens: mensagensFormatadas },
    });
  } catch (error) {
    console.error('GET /api/tickets/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar o chamado' },
      { status: 500 }
    );
  }
}

/** PATCH /api/tickets/[id] — atualiza status do ticket. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const ticketId = uuidOuNulo(id);
    if (!ticketId) {
      return NextResponse.json({ success: false, error: 'Chamado não encontrado' }, { status: 404 });
    }

    const supabase = createServerSupabaseClient();
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, user_id, status')
      .eq('id', ticketId)
      .maybeSingle();

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Chamado não encontrado' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const statusPermitidos = ['aberto', 'em_andamento', 'respondido', 'resolvido', 'fechado', 'finalizado'];
    const novoStatus = body?.status;

    if (!novoStatus || !statusPermitidos.includes(novoStatus)) {
      return NextResponse.json({ success: false, error: 'Status inválido' }, { status: 400 });
    }

    // Apenas admin pode alterar status para qualquer um; aluno pode fechar o seu
    if (user.role !== 'admin' && ticket.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Permissão negada' }, { status: 403 });
    }

    const { data: atualizado, error } = await supabase
      .from('tickets')
      .update({
        status: novoStatus,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: atualizado });
  } catch (error) {
    console.error('PATCH /api/tickets/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar status do chamado' },
      { status: 500 }
    );
  }
}
