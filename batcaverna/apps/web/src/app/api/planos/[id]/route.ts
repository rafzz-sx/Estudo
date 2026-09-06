import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function meuPlano(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  planoId: string,
  userId: string
) {
  const { data } = await supabase
    .from('planos_estudo')
    .select('id')
    .eq('id', planoId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

/**
 * PATCH /api/planos/[id]
 * Body: { item_id, concluido }  — marca uma tarefa do cronograma
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    if (!(await meuPlano(supabase, id, user.id))) {
      return NextResponse.json(
        { success: false, error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const itemId = String(body?.item_id ?? '');
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Informe a tarefa.' },
        { status: 400 }
      );
    }

    const concluido = !!body?.concluido;

    await supabase
      .from('plano_itens')
      .update({
        concluido,
        concluido_em: concluido ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .eq('plano_id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/planos/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar a tarefa' },
      { status: 500 }
    );
  }
}

/** DELETE /api/planos/[id] — arquiva o cronograma. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    if (!(await meuPlano(supabase, id, user.id))) {
      return NextResponse.json(
        { success: false, error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    await supabase.from('planos_estudo').update({ ativo: false }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/planos/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao arquivar o cronograma' },
      { status: 500 }
    );
  }
}
