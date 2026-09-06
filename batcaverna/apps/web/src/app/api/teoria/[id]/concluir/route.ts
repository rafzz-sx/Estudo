import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';

/**
 * POST /api/teoria/[id]/concluir
 * Marca um conteúdo teórico como estudado e concede XP — mas só na primeira
 * vez, para não virar um botão de farmar XP.
 */
const XP_POR_LEITURA = 25;

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

    const { data: jaLido } = await supabase
      .from('user_teoria_progresso')
      .select('concluido')
      .eq('user_id', user.id)
      .eq('teoria_id', id)
      .maybeSingle();

    const primeiraVez = !jaLido?.concluido;

    await supabase.from('user_teoria_progresso').upsert(
      {
        user_id: user.id,
        teoria_id: id,
        concluido: true,
        visto_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,teoria_id' }
    );

    if (!primeiraVez) {
      return NextResponse.json({
        success: true,
        data: { xp_ganho: 0, ja_concluido: true },
      });
    }

    const { data: dados } = await supabase
      .from('users')
      .select('xp_total')
      .eq('id', user.id)
      .single();

    const xpDepois = (dados?.xp_total ?? 0) + XP_POR_LEITURA;
    const nivel = calcularNivel(xpDepois);

    await supabase
      .from('users')
      .update({ xp_total: xpDepois, nivel_atual: nivel.nivel })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      data: { xp_ganho: XP_POR_LEITURA, xp_total: xpDepois, nivel },
    });
  } catch (error) {
    console.error('POST /api/teoria/[id]/concluir error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar leitura' },
      { status: 500 }
    );
  }
}
