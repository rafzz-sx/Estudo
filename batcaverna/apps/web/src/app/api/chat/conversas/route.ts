import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/chat/conversas — Lista todas as conversas ativas do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    const { data: conversas, error } = await supabase
      .from('conversas')
      .select(`
        id, amizade_id, user_id_a, user_id_b, criada_em, ultima_mensagem_em,
        userA:users!user_id_a (id, nome, apelido, avatar_url, nivel_atual),
        userB:users!user_id_b (id, nome, apelido, avatar_url, nivel_atual),
        mensagens:mensagem_chat (id, conteudo_texto, midia_url, tipo, enviado_em, lida, autor_id)
      `)
      .or(`user_id_a.eq.${user.id},user_id_b.eq.${user.id}`)
      .order('ultima_mensagem_em', { ascending: false });

    if (error) throw error;

    // Formatar conversas trazendo o outro_usuario e a ultima_mensagem
    const formatadas = (conversas || []).map((c: any) => {
      const outro = c.user_id_a === user.id ? c.userB : c.userA;
      const msgs = (c.mensagens || []).sort(
        (a: any, b: any) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime()
      );
      const ultimaMsg = msgs[0];
      const naoLidas = msgs.filter((m: any) => !m.lida && m.autor_id !== user.id).length;

      return {
        id: c.id,
        amizade_id: c.amizade_id,
        user_1_id: c.user_id_a,
        user_2_id: c.user_id_b,
        atualizado_em: c.ultima_mensagem_em || c.criada_em,
        outro_usuario: {
          id: outro?.id,
          nome: outro?.nome,
          apelido: outro?.apelido,
          avatar_url: outro?.avatar_url,
          nivel_atual: outro?.nivel_atual || 1,
          online: true,
          concurso: 'Geral',
        },
        ultima_mensagem: ultimaMsg
          ? ultimaMsg.tipo === 'audio'
            ? '🎤 Mensagem de voz'
            : ultimaMsg.tipo === 'imagem'
            ? '📷 Foto'
            : ultimaMsg.conteudo_texto
          : 'Conversa iniciada',
        nao_lidas: naoLidas,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatadas,
    });
  } catch (error) {
    console.error('GET /api/chat/conversas error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar conversas' }, { status: 500 });
  }
}

// POST /api/chat/conversas — Inicia ou recupera uma conversa entre dois amigos
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { target_user_id } = await req.json();
    if (!target_user_id || target_user_id === user.id) {
      return NextResponse.json({ success: false, error: 'Usuário de destino inválido' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Verificar se são amigos aceitos
    const { data: amizade } = await supabase
      .from('amizades')
      .select('id, status')
      .or(
        `and(user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${target_user_id}),` +
        `and(user_id_solicitante.eq.${target_user_id},user_id_destinatario.eq.${user.id})`
      )
      .eq('status', 'aceita')
      .maybeSingle();

    if (!amizade) {
      return NextResponse.json(
        { success: false, error: 'O chat só é desbloqueado entre amigos confirmados.' },
        { status: 403 }
      );
    }

    // 2. Ordenar IDs
    const [u1, u2] = [user.id, target_user_id].sort();

    const { data: existing } = await supabase
      .from('conversas')
      .select('*')
      .eq('user_id_a', u1)
      .eq('user_id_b', u2)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const { data: novaConversa, error: cErr } = await supabase
      .from('conversas')
      .insert({
        amizade_id: amizade.id,
        user_id_a: u1,
        user_id_b: u2,
      })
      .select('*')
      .single();

    if (cErr) throw cErr;

    return NextResponse.json({ success: true, data: novaConversa }, { status: 201 });
  } catch (error) {
    console.error('POST /api/chat/conversas error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar conversa' }, { status: 500 });
  }
}
