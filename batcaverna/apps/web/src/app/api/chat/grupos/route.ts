import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

// POST /api/chat/grupos — Criar um grupo de estudo
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { nome, participante_ids } = body as {
      nome?: string;
      participante_ids?: string[];
    };

    if (!nome?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome do grupo é obrigatório' },
        { status: 400 }
      );
    }

    if (!participante_ids || participante_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Adicione pelo menos 1 amigo ao grupo' },
        { status: 400 }
      );
    }

    if (participante_ids.length > 49) {
      return NextResponse.json(
        { success: false, error: 'Máximo de 50 participantes por grupo' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verificar se todos os IDs são amigos aceitos do criador
    const { data: amizades } = await supabase
      .from('amizades')
      .select('user_id_solicitante, user_id_destinatario')
      .or(`user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user.id}`)
      .eq('status', 'aceita');

    const amigosIds = new Set(
      (amizades || []).map((a) =>
        a.user_id_solicitante === user.id
          ? a.user_id_destinatario
          : a.user_id_solicitante
      )
    );

    const naoAmigos = participante_ids.filter((id) => !amigosIds.has(id));
    if (naoAmigos.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Só é possível adicionar amigos aceitos ao grupo' },
        { status: 400 }
      );
    }

    // 1. Criar a conversa do tipo 'grupo'
    const { data: conversa, error: errConv } = await supabase
      .from('conversas')
      .insert({
        user_id_a: user.id,
        user_id_b: participante_ids[0] || user.id, // satisfaz a foreign key/not null no schema original
        tipo: 'grupo',
        nome_grupo: nome.trim().slice(0, 100),
        criador_id: user.id,
      })
      .select('id')
      .single();

    if (errConv || !conversa) {
      console.error('Erro ao criar conversa de grupo:', errConv);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar o grupo' },
        { status: 500 }
      );
    }

    // 2. Inserir todos os participantes (incluindo o criador)
    const todosIds = [user.id, ...participante_ids];
    const registros = todosIds.map((uid) => ({
      conversa_id: conversa.id,
      user_id: uid,
    }));

    const { error: errPart } = await supabase
      .from('conversa_participantes')
      .insert(registros);

    if (errPart) {
      console.error('Erro ao inserir participantes:', errPart);
      // Grupo foi criado mas participantes falharam; limpar
      await supabase.from('conversas').delete().eq('id', conversa.id);
      return NextResponse.json(
        { success: false, error: 'Erro ao adicionar participantes' },
        { status: 500 }
      );
    }

    // 3. Mensagem do sistema no grupo
    await supabase.from('mensagem_chat').insert({
      conversa_id: conversa.id,
      autor_id: user.id,
      tipo: 'texto',
      conteudo_texto: `📢 Grupo "${nome.trim()}" criado! Bora estudar juntos! ⚔️`,
    });

    return NextResponse.json({
      success: true,
      data: { conversa_id: conversa.id, nome: nome.trim() },
    }, { status: 201 });
  } catch (err) {
    console.error('POST /api/chat/grupos error:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao criar grupo' },
      { status: 500 }
    );
  }
}
