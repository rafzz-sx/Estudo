import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

// GET /api/admin/conversas — Lista todas as conversas entre usuários com mensagens sinalizadas
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const supabase = createServerSupabaseClient();

    const { data: conversas, error } = await supabase
      .from('conversas')
      .select(`
        id, criada_em, ultima_mensagem_em,
        userA:users!user_id_a (id, nome, apelido, email),
        userB:users!user_id_b (id, nome, apelido, email)
      `)
      .order('ultima_mensagem_em', { ascending: false })
      .limit(50);

    if (error) throw error;

    const conversaIds = (conversas || []).map((c: any) => c.id);
    const contagemPorConversa = new Map<string, { total: number; sinalizadas: number }>();

    if (conversaIds.length > 0) {
      // Busca somente flags booleanas e ID da conversa (evita trafegar conteúdo criptografado)
      const { data: msgsMeta, error: mErr } = await supabase
        .from('mensagem_chat')
        .select('conversa_id, sinalizada_para_revisao')
        .in('conversa_id', conversaIds);

      if (!mErr && msgsMeta) {
        for (const m of msgsMeta) {
          const acc = contagemPorConversa.get(m.conversa_id) ?? { total: 0, sinalizadas: 0 };
          acc.total += 1;
          if (m.sinalizada_para_revisao) acc.sinalizadas += 1;
          contagemPorConversa.set(m.conversa_id, acc);
        }
      }
    }

    const formatadas = (conversas || []).map((c: any) => {
      const stats = contagemPorConversa.get(c.id) ?? { total: 0, sinalizadas: 0 };

      return {
        id: c.id,
        user_a: c.userA,
        user_b: c.userB,
        total_mensagens: stats.total,
        mensagens_sinalizadas: stats.sinalizadas,
        ultima_mensagem_em: c.ultima_mensagem_em || c.criada_em,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatadas,
    });
  } catch (error) {
    console.error('GET /api/admin/conversas error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar conversas para moderação' }, { status: 500 });
  }
}
