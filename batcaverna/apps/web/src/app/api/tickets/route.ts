import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * Aceita cookie (navegador) e header Bearer (app/mobile).
 *
 * Devolvia só o `id` (`Promise<string | null>`), mas TODO este arquivo usa o
 * retorno como objeto: `user.id`, `user.role`. Em TypeScript isso é erro de
 * compilação — o build do Vercel não passaria. Em execução, `user.id` seria
 * `undefined` e a rota quebraria por inteiro.
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
    let query = supabase.from('tickets').select('*, users (apelido)');

    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('atualizado_em', { ascending: false });
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

    const supabase = createServerSupabaseClient();

    // 1. Criar ticket
    const { data: ticket, error: tErr } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
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
      autor_role: user.role === 'admin' ? 'admin' : 'usuario',
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
