import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// PUT /api/amizades/[id]/responder — Aceitar ou recusar solicitação de amizade
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { id } = await params;
    const { acao } = await req.json(); // 'aceitar' | 'recusar'

    if (!['aceitar', 'recusar'].includes(acao)) {
      return NextResponse.json({ success: false, error: 'Ação inválida (aceitar/recusar)' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Verificar que a solicitação existe e é para o usuário logado
    const { data: amizade, error: fetchErr } = await supabase
      .from('amizades')
      .select('*')
      .eq('id', id)
      .eq('user_id_destinatario', user.id)
      .eq('status', 'pendente')
      .single();

    if (fetchErr || !amizade) {
      return NextResponse.json({ success: false, error: 'Solicitação não encontrada' }, { status: 404 });
    }

    const novoStatus = acao === 'aceitar' ? 'aceita' : 'recusada';

    const { error: updateErr } = await supabase
      .from('amizades')
      .update({ status: novoStatus, respondido_em: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Se aceitou, criar a conversa automaticamente
    if (acao === 'aceitar') {
      const [u_a, u_b] = [amizade.user_id_solicitante, user.id].sort();

      // Verificar se conversa já existe
      const { data: conversaExistente } = await supabase
        .from('conversas')
        .select('id')
        .eq('amizade_id', id)
        .maybeSingle();

      if (!conversaExistente) {
        await supabase.from('conversas').insert({
          amizade_id: id,
          user_id_a: u_a,
          user_id_b: u_b,
        });
      }

      // Notificar o solicitante
      await supabase.from('notificacoes').insert({
        user_id: amizade.user_id_solicitante,
        tipo: 'solicitacao_amizade',
        titulo: 'Solicitação aceita!',
        mensagem: 'Sua solicitação de amizade foi aceita! Vocês já podem conversar.',
        dados_extra: { amizade_id: id },
      });
    }

    return NextResponse.json({
      success: true,
      data: { status: novoStatus },
      message: acao === 'aceitar' ? 'Amizade aceita! Conversa criada.' : 'Solicitação recusada.',
    });
  } catch (error) {
    console.error('PUT /api/amizades/[id]/responder error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao responder solicitação' }, { status: 500 });
  }
}
