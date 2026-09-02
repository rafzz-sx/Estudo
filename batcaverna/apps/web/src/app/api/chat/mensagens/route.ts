import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// Termos ofensivos para flag automática de moderação (Seção 15)
const TERMOS_OFENSIVOS = [
  'lixo', 'idiota', 'otario', 'imbecil', 'merda', 'caralho', 'puta',
  'vagabundo', 'corno', 'arrombado', 'desgracado', 'foder',
];

function contemTermoOfensivo(texto: string): boolean {
  if (!texto) return false;
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return TERMOS_OFENSIVOS.some((termo) => normalizado.includes(termo));
}

// GET /api/chat/mensagens?conversa_id=xyz — Lista mensagens de uma conversa
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conversaId = searchParams.get('conversa_id');

    if (!conversaId) {
      return NextResponse.json({ success: false, error: 'conversa_id obrigatório' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Marcar mensagens recebidas como lidas
    await supabase
      .from('mensagem_chat')
      .update({ lida: true })
      .eq('conversa_id', conversaId)
      .neq('autor_id', user.id)
      .eq('lida', false);

    const { data: mensagens, error } = await supabase
      .from('mensagem_chat')
      .select('*, autor:users!autor_id (id, apelido, avatar_url)')
      .eq('conversa_id', conversaId)
      .order('enviado_em', { ascending: true })
      .limit(100);

    if (error) throw error;

    const formatadas = (mensagens || []).map((m: any) => ({
      id: m.id,
      conversa_id: m.conversa_id,
      remetente_id: m.autor_id,
      tipo: m.tipo,
      conteudo: m.conteudo_texto,
      midia_url: m.midia_url,
      duracao_segundos: m.duracao_segundos,
      enviado_em: m.enviado_em,
      lida: m.lida,
      sinalizada_para_revisao: m.sinalizada_para_revisao,
      remetente: {
        id: m.autor?.id,
        apelido: m.autor?.apelido || 'Soldado',
        avatar_url: m.autor?.avatar_url,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formatadas,
    });
  } catch (error) {
    console.error('GET /api/chat/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}

// POST /api/chat/mensagens — Envia uma nova mensagem (texto, áudio ou imagem)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { conversa_id, conteudo, tipo = 'texto', midia_url, duracao_segundos } = body;

    if (!conversa_id || (!conteudo?.trim() && !midia_url)) {
      return NextResponse.json({ success: false, error: 'Dados da mensagem incompletos' }, { status: 400 });
    }

    const textoFinal = conteudo?.trim() || null;
    const sinalizada = textoFinal ? contemTermoOfensivo(textoFinal) : false;

    const supabase = createServerSupabaseClient();

    const { data: novaMsg, error: mErr } = await supabase
      .from('mensagem_chat')
      .insert({
        conversa_id,
        autor_id: user.id,
        conteudo_texto: textoFinal,
        tipo,
        midia_url: midia_url || null,
        duracao_segundos: duracao_segundos || null,
        sinalizada_para_revisao: sinalizada,
      })
      .select('*, autor:users!autor_id (id, apelido, avatar_url)')
      .single();

    if (mErr) throw mErr;

    // Atualizar timestamp da conversa
    await supabase
      .from('conversas')
      .update({ ultima_mensagem_em: new Date().toISOString() })
      .eq('id', conversa_id);

    return NextResponse.json({
      success: true,
      data: {
        id: novaMsg.id,
        conversa_id: novaMsg.conversa_id,
        remetente_id: novaMsg.autor_id,
        tipo: novaMsg.tipo,
        conteudo: novaMsg.conteudo_texto,
        midia_url: novaMsg.midia_url,
        duracao_segundos: novaMsg.duracao_segundos,
        enviado_em: novaMsg.enviado_em,
        remetente: {
          id: novaMsg.autor?.id,
          apelido: novaMsg.autor?.apelido || 'Você',
          avatar_url: novaMsg.autor?.avatar_url,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/chat/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
