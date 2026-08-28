import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
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

    const body = await req.json();
    const { motivo, titulo, descricao } = body;

    if (!motivo || !titulo?.trim() || !descricao?.trim()) {
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
