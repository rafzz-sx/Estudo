import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// POST /api/amizades/solicitar-por-apelido
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { apelido } = await req.json();
    const apelidoTrim = apelido?.trim();

    if (!apelidoTrim) {
      return NextResponse.json(
        { success: false, error: 'Informe o apelido do soldado' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 1. Buscar usuário pelo apelido (case-insensitive)
    const { data: target, error: searchErr } = await supabase
      .from('users')
      .select('id, nome, apelido, avatar_url, nivel_atual')
      .ilike('apelido', apelidoTrim)
      .maybeSingle();

    if (searchErr || !target) {
      return NextResponse.json(
        { success: false, error: `Soldado com apelido "${apelidoTrim}" não foi encontrado.` },
        { status: 404 }
      );
    }

    // 2. Não permitir adicionar a si mesmo
    if (target.id === user.id) {
      return NextResponse.json(
        { success: false, error: 'Você não pode enviar solicitação de amizade para si mesmo.' },
        { status: 400 }
      );
    }

    // 3. Verificar se já existe amizade em qualquer direção
    const { data: existente } = await supabase
      .from('amizades')
      .select('id, status, user_id_solicitante')
      .or(
        `and(user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${target.id}),` +
        `and(user_id_solicitante.eq.${target.id},user_id_destinatario.eq.${user.id})`
      )
      .maybeSingle();

    if (existente) {
      if (existente.status === 'aceita') {
        return NextResponse.json(
          { success: false, error: `Você e ${target.apelido} já são amigos!` },
          { status: 409 }
        );
      }
      if (existente.status === 'pendente') {
        const quemEnviou = existente.user_id_solicitante === user.id ? 'Você já enviou' : `${target.apelido} já enviou`;
        return NextResponse.json(
          { success: false, error: `${quemEnviou} uma solicitação de amizade pendente.` },
          { status: 409 }
        );
      }
      if (existente.status === 'bloqueada') {
        return NextResponse.json(
          { success: false, error: 'Não é possível enviar solicitação para este usuário.' },
          { status: 403 }
        );
      }
    }

    // 4. Criar solicitação de amizade
    const { data: novaAmizade, error: insertErr } = await supabase
      .from('amizades')
      .insert({
        user_id_solicitante: user.id,
        user_id_destinatario: target.id,
        status: 'pendente',
      })
      .select('*')
      .single();

    if (insertErr) throw insertErr;

    // 5. Buscar apelido de quem está enviando para a notificação
    const { data: remetente } = await supabase
      .from('users')
      .select('apelido')
      .eq('id', user.id)
      .single();

    // 6. Criar notificação para o destinatário
    await supabase.from('notificacoes').insert({
      user_id: target.id,
      tipo: 'solicitacao_amizade',
      titulo: 'Nova solicitação de amizade',
      mensagem: `${remetente?.apelido || 'Um soldado'} enviou uma solicitação de amizade para você!`,
      dados_extra: { amizade_id: novaAmizade.id, solicitante_id: user.id },
    });

    return NextResponse.json({
      success: true,
      message: `Solicitação de amizade enviada com sucesso para ${target.apelido}!`,
      data: target,
    });
  } catch (error) {
    console.error('POST /api/amizades/solicitar-por-apelido error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação de amizade' },
      { status: 500 }
    );
  }
}
