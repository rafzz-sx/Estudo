import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/usuarios/me/amigos — Lista amigos, solicitações pendentes recebidas e enviadas
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // Amigos confirmados
    const { data: amizadesAceitas } = await supabase
      .from('amizades')
      .select(`
        id, user_id_solicitante, user_id_destinatario, criado_em,
        solicitante:users!user_id_solicitante (id, nome, apelido, avatar_url, nivel_atual),
        destinatario:users!user_id_destinatario (id, nome, apelido, avatar_url, nivel_atual)
      `)
      .or(`user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user.id}`)
      .eq('status', 'aceita');

    // Solicitações recebidas pendentes
    const { data: pendentesRecebidas } = await supabase
      .from('amizades')
      .select(`
        id, user_id_solicitante, criado_em,
        solicitante:users!user_id_solicitante (id, nome, apelido, avatar_url, nivel_atual)
      `)
      .eq('user_id_destinatario', user.id)
      .eq('status', 'pendente');

    // Solicitações enviadas pendentes
    const { data: pendentesEnviadas } = await supabase
      .from('amizades')
      .select(`
        id, user_id_destinatario, criado_em,
        destinatario:users!user_id_destinatario (id, nome, apelido, avatar_url, nivel_atual)
      `)
      .eq('user_id_solicitante', user.id)
      .eq('status', 'pendente');

    // Formatar amigos (retornar sempre o OUTRO usuário)
    const amigos = (amizadesAceitas || []).map((a) => {
      const outro = a.user_id_solicitante === user.id ? a.destinatario : a.solicitante;
      return {
        amizade_id: a.id,
        usuario: outro,
        desde: a.criado_em,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        amigos,
        pendentes_recebidas: (pendentesRecebidas || []).map((p) => ({
          amizade_id: p.id,
          usuario: p.solicitante,
          enviado_em: p.criado_em,
        })),
        pendentes_enviadas: (pendentesEnviadas || []).map((p) => ({
          amizade_id: p.id,
          usuario: p.destinatario,
          enviado_em: p.criado_em,
        })),
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/amigos error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar amigos' }, { status: 500 });
  }
}
