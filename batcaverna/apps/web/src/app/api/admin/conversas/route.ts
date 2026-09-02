import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
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
        userB:users!user_id_b (id, nome, apelido, email),
        mensagens:mensagem_chat (id, conteudo_texto, tipo, enviado_em, sinalizada_para_revisao, autor_id)
      `)
      .order('ultima_mensagem_em', { ascending: false })
      .limit(50);

    if (error) throw error;

    const formatadas = (conversas || []).map((c: any) => {
      const msgs = c.mensagens || [];
      const sinalizadas = msgs.filter((m: any) => m.sinalizada_para_revisao).length;

      return {
        id: c.id,
        user_a: c.userA,
        user_b: c.userB,
        total_mensagens: msgs.length,
        mensagens_sinalizadas: sinalizadas,
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
