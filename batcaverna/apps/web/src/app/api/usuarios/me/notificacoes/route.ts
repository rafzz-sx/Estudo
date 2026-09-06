import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  return getAuthUserFromRequest(req);
}

// GET /api/usuarios/me/notificacoes — Lista notificações do usuário
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const apenasNaoLidas = searchParams.get('apenas_nao_lidas') === 'true';

    const supabase = createServerSupabaseClient();

    const agora = new Date().toISOString();

    let query = supabase
      .from('notificacoes')
      .select('*')
      .eq('user_id', user.id)
      // Avisos do admin têm prazo de validade: somem sozinhos quando expiram.
      .or(`expira_em.is.null,expira_em.gt.${agora}`)
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
      .eq('lida', false)
      .or(`expira_em.is.null,expira_em.gt.${agora}`);

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

// DELETE /api/usuarios/me/notificacoes — Esvazia a caixa do usuário.
// Por padrão apaga só as já lidas; ?tudo=1 apaga também as não lidas.
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const tudo = searchParams.get('tudo') === '1';

    const supabase = createServerSupabaseClient();

    let query = supabase.from('notificacoes').delete().eq('user_id', user.id);
    if (!tudo) query = query.eq('lida', true);

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: tudo
        ? 'Caixa de notificações esvaziada.'
        : 'Notificações lidas removidas.',
    });
  } catch (error) {
    console.error('DELETE /api/usuarios/me/notificacoes error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao limpar notificações' }, { status: 500 });
  }
}
