import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// POST /api/amizades/solicitar — Enviar solicitação de amizade
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { user_id_destinatario } = await req.json();

    if (!user_id_destinatario || user_id_destinatario === user.id) {
      return NextResponse.json({ success: false, error: 'Destinatário inválido' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Verificar se já existe amizade (em qualquer direção)
    const { data: existente } = await supabase
      .from('amizades')
      .select('id, status')
      .or(
        `and(user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user_id_destinatario}),` +
        `and(user_id_solicitante.eq.${user_id_destinatario},user_id_destinatario.eq.${user.id})`
      )
      .limit(1)
      .maybeSingle();

    if (existente) {
      if (existente.status === 'aceita') {
        return NextResponse.json({ success: false, error: 'Vocês já são amigos' }, { status: 409 });
      }
      if (existente.status === 'pendente') {
        return NextResponse.json({ success: false, error: 'Solicitação já enviada' }, { status: 409 });
      }
      if (existente.status === 'bloqueada') {
        return NextResponse.json({ success: false, error: 'Usuário bloqueado' }, { status: 403 });
      }
    }

    // Criar solicitação
    const { data: amizade, error } = await supabase
      .from('amizades')
      .insert({
        user_id_solicitante: user.id,
        user_id_destinatario: user_id_destinatario,
        status: 'pendente',
      })
      .select('*')
      .single();

    if (error) throw error;

    // Criar notificação para o destinatário
    await supabase.from('notificacoes').insert({
      user_id: user_id_destinatario,
      tipo: 'solicitacao_amizade',
      titulo: 'Nova solicitação de amizade',
      mensagem: 'Alguém quer se conectar com você!',
      dados_extra: { amizade_id: amizade.id, solicitante_id: user.id },
    });

    return NextResponse.json({ success: true, data: amizade }, { status: 201 });
  } catch (error) {
    console.error('POST /api/amizades/solicitar error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao solicitar amizade' }, { status: 500 });
  }
}
