import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';
import { decriptarTexto } from '@/lib/cripto';

/**
 * GET /api/tickets/[id] — um chamado com a conversa inteira.
 * Apenas o proprietário do chamado ou administradores têm permissão para ler.
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

    const ticketId = uuidOuNulo(id);
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 1. Confirmação estrita de cargo no banco (blindagem contra spoofing de claims de token)
    const { data: usuarioDb } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const ehAdmin = usuarioDb?.role === 'admin';

    let ticket: any = null;

    if (ehAdmin) {
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*, users:users!tickets_user_id_fkey (id, nome, apelido, email, avatar_url, nivel_atual, role, xp_total, streak_dias, concurso_alvo, situacao)')
        .eq('id', ticketId)
        .maybeSingle();

      if (ticketError) {
        const { data: ticketSimples } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .maybeSingle();
        ticket = ticketSimples;
      } else {
        ticket = ticketData;
      }
    } else {
      // Aluno: busca estritamente se o ticket é dele (evita vazar existência de tickets alheios)
      const { data: ticketAluno } = await supabase
        .from('tickets')
        .select('id, user_id, titulo, motivo, status, criado_em, atualizado_em')
        .eq('id', ticketId)
        .eq('user_id', user.id)
        .maybeSingle();

      ticket = ticketAluno;
    }

    // Mesma resposta para "não existe" e "não é seu": quem tenta adivinhar UUID não descobre quais existem
    if (!ticket) {
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

    // 1. Confirmação de permissão no banco
    const { data: usuarioDb } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const ehAdmin = usuarioDb?.role === 'admin';

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

    // Apenas admin pode alterar status para qualquer um; aluno pode fechar o seu próprio chamado
    if (!ehAdmin && ticket.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Chamado não encontrado' }, { status: 404 });
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
