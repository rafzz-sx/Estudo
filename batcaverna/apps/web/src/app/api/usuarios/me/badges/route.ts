import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/** Quantas insígnias cabem no mini-perfil. */
const MAX_EXIBIDAS = 3;

/**
 * GET /api/usuarios/me/badges
 * Lista todas as insígnias do catálogo, marcando quais o usuário conquistou
 * e quais ele escolheu exibir no mini-perfil.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: catalogo } = await supabase
      .from('badges')
      .select('id, nome, descricao, icone, criterio, cor_hex, raridade, criterio_tipo, criterio_valor')
      .order('criterio_valor', { ascending: true, nullsFirst: false });

    const { data: minhas } = await supabase
      .from('user_badges')
      .select('badge_id, conquistado_em, exibir_no_perfil, ordem_exibicao')
      .eq('user_id', user.id);

    // Buscar dados do usuário logado para verificar conta exclusiva de fundador
    const { data: usuarioAtual } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .maybeSingle();

    const ehFundadorExclusivo = !!(usuarioAtual?.email && usuarioAtual.email.toLowerCase().startsWith('raf4biel.venafro'));
    const badgeFundador = (catalogo ?? []).find((b) => b.nome === 'Fundador');

    const porId = new Map((minhas ?? []).map((b) => [b.badge_id, b]));

    if (ehFundadorExclusivo && badgeFundador) {
      // Garante a insígnia Fundador automaticamente para a conta do fundador
      if (!porId.has(badgeFundador.id)) {
        await supabase.from('user_badges').upsert({
          user_id: user.id,
          badge_id: badgeFundador.id,
          conquistado_em: new Date().toISOString(),
          exibir_no_perfil: true,
          ordem_exibicao: 1,
        }, { onConflict: 'user_id,badge_id' });

        porId.set(badgeFundador.id, {
          badge_id: badgeFundador.id,
          conquistado_em: new Date().toISOString(),
          exibir_no_perfil: true,
          ordem_exibicao: 1,
        });
      }
    } else if (!ehFundadorExclusivo && badgeFundador && porId.has(badgeFundador.id)) {
      // Se outro usuário tinha a insígnia Fundador, remove para manter exclusividade
      porId.delete(badgeFundador.id);
      await supabase.from('user_badges').delete().eq('user_id', user.id).eq('badge_id', badgeFundador.id);
    }

    const itens = (catalogo ?? []).map((b) => {
      const minha = porId.get(b.id);
      return {
        ...b,
        conquistada: !!minha,
        conquistado_em: minha?.conquistado_em ?? null,
        exibir_no_perfil: minha?.exibir_no_perfil ?? false,
        ordem_exibicao: minha?.ordem_exibicao ?? 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        badges: itens,
        total_conquistadas: (minhas ?? []).length,
        total_catalogo: (catalogo ?? []).length,
        max_exibidas: MAX_EXIBIDAS,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/badges error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar insígnias' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/usuarios/me/badges
 * Body: { exibir: ["<badge_id>", ...] }  — na ordem desejada
 *
 * Define quais insígnias aparecem no mini-perfil. Só aceita insígnias que o
 * usuário realmente conquistou (senão bastaria mandar qualquer id).
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const pedidas: string[] = Array.isArray(body?.exibir) ? body.exibir : [];

    if (pedidas.length > MAX_EXIBIDAS) {
      return NextResponse.json(
        {
          success: false,
          error: `Você pode exibir no máximo ${MAX_EXIBIDAS} insígnias no mini-perfil.`,
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: minhas } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user.id);

    const conquistadas = new Set((minhas ?? []).map((b) => b.badge_id));
    const invalidas = pedidas.filter((id) => !conquistadas.has(id));

    if (invalidas.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Você só pode exibir insígnias que já conquistou.',
        },
        { status: 400 }
      );
    }

    // Zera todas e regrava só as escolhidas, preservando a ordem enviada.
    await supabase
      .from('user_badges')
      .update({ exibir_no_perfil: false, ordem_exibicao: 0 })
      .eq('user_id', user.id);

    for (let i = 0; i < pedidas.length; i++) {
      await supabase
        .from('user_badges')
        .update({ exibir_no_perfil: true, ordem_exibicao: i })
        .eq('user_id', user.id)
        .eq('badge_id', pedidas[i]);
    }

    return NextResponse.json({
      success: true,
      data: { exibindo: pedidas.length },
      message: 'Insígnias do mini-perfil atualizadas.',
    });
  } catch (error) {
    console.error('PATCH /api/usuarios/me/badges error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar insígnias' },
      { status: 500 }
    );
  }
}
