import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/** POST /api/musicas/[id]/favoritar — alterna o favorito da faixa. */
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
      .from('user_musicas_favoritas')
      .select('musica_id')
      .eq('user_id', user.id)
      .eq('musica_id', id)
      .maybeSingle();

    if (existente) {
      await supabase
        .from('user_musicas_favoritas')
        .delete()
        .eq('user_id', user.id)
        .eq('musica_id', id);
      return NextResponse.json({ success: true, data: { favorita: false } });
    }

    await supabase
      .from('user_musicas_favoritas')
      .insert({ user_id: user.id, musica_id: id });

    return NextResponse.json({ success: true, data: { favorita: true } });
  } catch (error) {
    console.error('POST /api/musicas/[id]/favoritar error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao favoritar' },
      { status: 500 }
    );
  }
}
