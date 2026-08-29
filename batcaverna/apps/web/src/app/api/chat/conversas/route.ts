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
    const userId = user?.id || 'mock-user';

    const supabase = createServerSupabaseClient();

    const { data: conversas, error } = await supabase
      .from('conversas')
      .select(`
        id, user_1_id, user_2_id, atualizado_em,
        user1:users!user_1_id (id, nome, apelido, avatar_url, nivel_atual),
        user2:users!user_2_id (id, nome, apelido, avatar_url, nivel_atual)
      `)
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .order('atualizado_em', { ascending: false });

    return NextResponse.json({
      success: true,
      data: conversas || [],
    });
  } catch (error) {
    console.error('GET /api/chat/conversas error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar conversas' }, { status: 500 });
  }
}

// POST /api/chat/conversas — Inicia uma nova conversa entre dois usuários
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { target_user_id } = await req.json();
    if (!target_user_id || target_user_id === user.id) {
      return NextResponse.json({ success: false, error: 'Usuário de destino inválido' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Ordenar IDs para manter unicidade
    const [u1, u2] = [user.id, target_user_id].sort();

    const { data: existing } = await supabase
      .from('conversas')
      .select('*')
      .eq('user_1_id', u1)
      .eq('user_2_id', u2)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const { data: novaConversa, error: cErr } = await supabase
      .from('conversas')
      .insert({ user_1_id: u1, user_2_id: u2 })
      .select('*')
      .single();

    if (cErr) throw cErr;

    return NextResponse.json({ success: true, data: novaConversa }, { status: 201 });
  } catch (error) {
    console.error('POST /api/chat/conversas error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar conversa' }, { status: 500 });
  }
}
