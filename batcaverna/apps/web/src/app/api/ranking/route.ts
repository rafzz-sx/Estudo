import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { NIVEIS_GAMIFICACAO } from '@batcaverna/ui';

// GET /api/ranking?tipo=tempo_estudo|questoes_respondidas&periodo=semanal|mensal|geral&concurso_id=X&limit=50
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || 'tempo_estudo';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const supabase = createServerSupabaseClient();

    // Buscar usuários ordenados por xp_total / tempo_estudo
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        apelido,
        avatar_url,
        banner_url,
        banner_tipo,
        bio,
        xp_total,
        nivel_atual,
        maior_combo_pessoal,
        user_privacy_settings (ocultar_do_ranking)
      `)
      .order('xp_total', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Filtrar usuários que optaram por ocultar do ranking
    const publicUsers = (users || []).filter(
      (u: any) => !u.user_privacy_settings?.[0]?.ocultar_do_ranking
    );

    const ranking = publicUsers.map((u: any, idx: number) => {
      const nivelInfo = NIVEIS_GAMIFICACAO.find(n => n.nivel === u.nivel_atual) || NIVEIS_GAMIFICACAO[0];
      return {
        posicao: idx + 1,
        user_id: u.id,
        apelido: u.apelido,
        avatar_url: u.avatar_url,
        nivel_atual: u.nivel_atual,
        titulo_nivel: nivelInfo.titulo,
        valor: tipo === 'tempo_estudo' ? Math.round(u.xp_total * 60) : Math.round(u.xp_total / 15), // estimativas baseadas em XP
        percentual_acerto: 75.0, // fallback
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tipo,
        ranking,
      },
    });
  } catch (error) {
    console.error('GET /api/ranking error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar ranking' }, { status: 500 });
  }
}
