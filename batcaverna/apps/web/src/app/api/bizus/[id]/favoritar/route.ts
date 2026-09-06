import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/** POST /api/bizus/[id]/favoritar — alterna o favorito. */
export async function POST(
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

    const { data: existente } = await supabase
      .from('favoritos')
      .select('item_id')
      .eq('user_id', user.id)
      .eq('tipo', 'bizu')
      .eq('item_id', id)
      .maybeSingle();

    if (existente) {
      await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('tipo', 'bizu')
        .eq('item_id', id);
      return NextResponse.json({ success: true, data: { favoritado: false } });
    }

    await supabase
      .from('favoritos')
      .insert({ user_id: user.id, tipo: 'bizu', item_id: id });

    return NextResponse.json({ success: true, data: { favoritado: true } });
  } catch (error) {
    console.error('POST /api/bizus/[id]/favoritar error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao favoritar bizu' },
      { status: 500 }
    );
  }
}
