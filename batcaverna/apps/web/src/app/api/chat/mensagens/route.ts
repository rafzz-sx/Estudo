import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/chat/mensagens?conversa_id=xyz — Lista mensagens de uma conversa
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const conversaId = searchParams.get('conversa_id');

    if (!conversaId) {
      return NextResponse.json({ success: false, error: 'conversa_id obrigatório' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: mensagens, error } = await supabase
      .from('mensagem_chat')
      .select('*, remetente:users!remetente_id (id, apelido, avatar_url)')
      .eq('conversa_id', conversaId)
      .order('enviado_em', { ascending: true })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: mensagens || [],
    });
  } catch (error) {
    console.error('GET /api/chat/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}

// POST /api/chat/mensagens — Envia uma nova mensagem
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { conversa_id, conteudo, tipo = 'texto', midia_url } = body;

    if (!conversa_id || (!conteudo?.trim() && !midia_url)) {
      return NextResponse.json({ success: false, error: 'Dados da mensagem incompletos' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data: novaMsg, error: mErr } = await supabase
      .from('mensagem_chat')
      .insert({
        conversa_id,
        remetente_id: user.id,
        conteudo: conteudo?.trim() || null,
        tipo,
        midia_url: midia_url || null,
      })
      .select('*, remetente:users!remetente_id (id, apelido, avatar_url)')
      .single();

    if (mErr) throw mErr;

    // Atualizar timestamp da conversa
    await supabase
      .from('conversas')
      .update({ atualizado_em: new Date().toISOString() })
      .eq('id', conversa_id);

    return NextResponse.json({ success: true, data: novaMsg }, { status: 201 });
  } catch (error) {
    console.error('POST /api/chat/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
