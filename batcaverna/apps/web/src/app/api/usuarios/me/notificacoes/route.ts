import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/usuarios/me/notificacoes — Lista notificações do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const apenasNaoLidas = searchParams.get('apenas_nao_lidas') === 'true';

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', user.id)
      .order('criada_em', { ascending: false })
      .limit(50);

    if (apenasNaoLidas) {
      query = query.eq('lida', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Contar não lidas
    const { count } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('lida', false);

    return NextResponse.json({
      success: true,
      data: {
        notificacoes: data || [],
        nao_lidas: count || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/notificacoes error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar notificações' }, { status: 500 });
  }
}

// PUT /api/usuarios/me/notificacoes — Marca todas como lidas
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', user.id)
      .eq('lida', false);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('PUT /api/usuarios/me/notificacoes error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao marcar notificações como lidas' }, { status: 500 });
  }
}
