import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/tickets/[id]/mensagens
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    const { data: mensagens, error } = await supabase
      .from('ticket_mensagens')
      .select('*, users (apelido, avatar_url)')
      .eq('ticket_id', ticketId)
      .order('enviado_em', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: mensagens || [] });
  } catch (error) {
    console.error('GET /api/tickets/[id]/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}

// POST /api/tickets/[id]/mensagens
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { conteudo } = body;

    if (!conteudo?.trim()) {
      return NextResponse.json({ success: false, error: 'Mensagem vazia' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Inserir mensagem
    const { data: novaMsg, error: mErr } = await supabase
      .from('ticket_mensagens')
      .insert({
        ticket_id: ticketId,
        autor_id: user.id,
        autor_role: user.role === 'admin' ? 'admin' : 'usuario',
        conteudo: conteudo.trim(),
      })
      .select('*')
      .single();

    if (mErr) throw mErr;

    // Se admin respondeu, atualizar status para 'respondido'
    if (user.role === 'admin') {
      await supabase
        .from('tickets')
        .update({ status: 'respondido' })
        .eq('id', ticketId);
    }

    return NextResponse.json({ success: true, data: novaMsg }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tickets/[id]/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
