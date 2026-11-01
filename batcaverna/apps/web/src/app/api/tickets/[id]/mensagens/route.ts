import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { limparTexto, uuidOuNulo } from '@/lib/seguranca';
import { encriptarTexto, decriptarTexto } from '@/lib/cripto';

/**
 * Aceita cookie (navegador) e header Bearer (app/mobile).
 */
async function getUserFromRequest(
  req: NextRequest
): Promise<{ id: string; role: string } | null> {
  return getAuthUserFromRequest(req);
}

/**
 * O ticket é do usuário, ou quem pergunta é administrador verificado?
 */
async function podeVerTicket(
  supabase: SupabaseClient,
  ticketId: string,
  userId: string
): Promise<{ permitido: boolean; ehAdmin: boolean }> {
  // Confirmação estrita de cargo no banco (blindagem contra spoofing de claims de token)
  const { data: usuarioDb } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  const ehAdmin = usuarioDb?.role === 'admin';
  if (ehAdmin) return { permitido: true, ehAdmin: true };

  const { data } = await supabase
    .from('tickets')
    .select('user_id')
    .eq('id', ticketId)
    .maybeSingle();

  return { permitido: data?.user_id === userId, ehAdmin: false };
}

// GET /api/tickets/[id]/mensagens
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const ticketId = uuidOuNulo(id);
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { permitido } = await podeVerTicket(supabase, ticketId, user.id);

    if (!permitido) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    const { data: mensagens, error } = await supabase
      .from('ticket_mensagens')
      .select('*, users (apelido, avatar_url)')
      .eq('ticket_id', ticketId)
      .order('enviado_em', { ascending: true });

    if (error) throw error;

    const formatadas = await Promise.all(
      (mensagens || []).map(async (m: any) => ({
        ...m,
        conteudo: await decriptarTexto(m.conteudo),
      }))
    );

    return NextResponse.json({ success: true, data: formatadas });
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
    const { id } = await params;
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const ticketId = uuidOuNulo(id);
    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const texto = limparTexto(body?.conteudo, 4000);

    if (!texto) {
      return NextResponse.json({ success: false, error: 'Mensagem vazia' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { permitido, ehAdmin } = await podeVerTicket(supabase, ticketId, user.id);

    if (!permitido) {
      return NextResponse.json(
        { success: false, error: 'Chamado não encontrado' },
        { status: 404 }
      );
    }

    // Inserir mensagem criptografada em repouso
    const textoCifrado = await encriptarTexto(texto);
    const { data: novaMsg, error: mErr } = await supabase
      .from('ticket_mensagens')
      .insert({
        ticket_id: ticketId,
        autor_id: user.id,
        autor_role: ehAdmin ? 'admin' : 'usuario',
        conteudo: textoCifrado || texto,
      })
      .select('*')
      .single();

    if (mErr) throw mErr;

    // Se admin respondeu, atualizar status para 'respondido'
    if (ehAdmin) {
      await supabase
        .from('tickets')
        .update({ status: 'respondido' })
        .eq('id', ticketId);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...novaMsg,
        conteudo: texto, // Devolve texto limpo para quem enviou
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/tickets/[id]/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
