import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * Aceita cookie (navegador) e header Bearer (app/mobile).
 */
async function getUserFromRequest(
  req: NextRequest
): Promise<{ id: string; role: string } | null> {
  return getAuthUserFromRequest(req);
}

// GET /api/tickets — Lista tickets do usuário (ou todos se for admin)
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // 1. Confirma o papel do usuário diretamente no banco de dados (blindagem contra spoofing de token)
    const { data: usuarioDb } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const ehAdmin = usuarioDb?.role === 'admin';

    // 2. Administradores veem todos os tickets com dados do autor.
    // Alunos veem estritamente seus próprios tickets sem expor dados ou tickets de terceiros.
    let query = supabase.from('tickets');

    if (ehAdmin) {
      query = query
        .select('*, users:users!tickets_user_id_fkey (id, nome, apelido, email, avatar_url, nivel_atual, role)')
        .order('atualizado_em', { ascending: false });
    } else {
      query = query
        .select('id, user_id, titulo, motivo, status, criado_em, atualizado_em')
        .eq('user_id', user.id)
        .order('atualizado_em', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('GET /api/tickets error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar tickets' }, { status: 500 });
  }
}

// POST /api/tickets — Cria um novo ticket com a mensagem inicial
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // Confirma cargo no banco de dados
    const { data: usuarioDb } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const ehAdmin = usuarioDb?.role === 'admin';

    const body = await req.json().catch(() => ({}));
    const motivo = body?.motivo;
    const titulo = typeof body?.titulo === 'string' ? body.titulo.trim() : '';
    const descricao = (
      typeof body?.descricao === 'string'
        ? body.descricao
        : typeof body?.mensagem_inicial === 'string'
        ? body.mensagem_inicial
        : ''
    ).trim();

    if (!motivo || !titulo || !descricao) {
      return NextResponse.json({ success: false, error: 'Motivo, título e descrição são obrigatórios' }, { status: 400 });
    }

    // Se não for admin no banco, força o id do próprio aluno solicitante
    const donoTicketId = (ehAdmin && body?.user_id) ? body.user_id : user.id;

    // 1. Criar ticket
    const { data: ticket, error: tErr } = await supabase
      .from('tickets')
      .insert({
        user_id: donoTicketId,
        motivo,
        titulo: titulo.trim(),
        status: 'aberto',
      })
      .select('id, titulo, status, criado_em')
      .single();

    if (tErr || !ticket) throw tErr;

    // 2. Criar primeira mensagem
    await supabase.from('ticket_mensagens').insert({
      ticket_id: ticket.id,
      autor_id: user.id,
      autor_role: ehAdmin ? 'admin' : 'usuario',
      conteudo: descricao.trim(),
    });

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Ticket criado com sucesso!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tickets error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar ticket' }, { status: 500 });
  }
}
