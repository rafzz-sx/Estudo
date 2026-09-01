import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/ranking?tipo=tempo_estudo|questoes&periodo=semanal|mensal|geral&limit=50
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || 'tempo_estudo';
    const periodo = searchParams.get('periodo') || 'geral';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    const supabase = createServerSupabaseClient();

    // 1. Determinar filtro de data com base no período
    let dataCorte: Date | null = null;
    if (periodo === 'semanal') {
      dataCorte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodo === 'mensal') {
      dataCorte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // 2. Buscar usuários cadastrados
    const { data: users, error: uErr } = await supabase
      .from('users')
      .select('id, nome, apelido, avatar_url, banner_url, nivel_atual, xp_total');

    if (uErr || !users) {
      return NextResponse.json({ success: true, data: { tipo, ranking: [] } });
    }

    if (tipo === 'tempo_estudo') {
      // 3. Buscar todas as sessões de estudo reais da trilha
      let query = supabase
        .from('study_sessions')
        .select('user_id, duracao_segundos, iniciada_em');

      if (dataCorte) {
        query = query.gte('iniciada_em', dataCorte.toISOString());
      }

      const { data: sessions } = await query;

      // Agrupar duração de estudo por usuário
      const tempoPorUsuario: Record<string, number> = {};
      (sessions || []).forEach((s: any) => {
        if (!s.user_id) return;
        tempoPorUsuario[s.user_id] = (tempoPorUsuario[s.user_id] || 0) + (s.duracao_segundos || 0);
      });

      // Mapear e filtrar apenas quem tem tempo > 0 (ou ordenar todos)
      const listaRankeada = users
        .map((u) => {
          const segundos = tempoPorUsuario[u.id] || 0;
          return {
            user_id: u.id,
            apelido: u.apelido || u.nome || 'Soldado',
            avatar_url: u.avatar_url,
            nivel_atual: u.nivel_atual || 1,
            titulo_nivel: (u.nivel_atual || 1) >= 15 ? 'Rei da Batcaverna' : (u.nivel_atual || 1) >= 10 ? 'General' : (u.nivel_atual || 1) >= 5 ? 'Cabo' : 'Recruta',
            valor: segundos,
            percentual_acerto: 0,
          };
        })
        .filter((item) => item.valor > 0)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, limit)
        .map((item, index) => ({
          ...item,
          posicao: index + 1,
        }));

      return NextResponse.json({
        success: true,
        data: {
          tipo,
          periodo,
          ranking: listaRankeada,
        },
      });
    } else {
      // 4. Ranking de Questões
      let query = supabase
        .from('user_questao_respostas')
        .select('user_id, correta, respondida_em');

      if (dataCorte) {
        query = query.gte('respondida_em', dataCorte.toISOString());
      }

      const { data: respostas } = await query;

      const questoesPorUsuario: Record<string, { total: number; acertos: number }> = {};
      (respostas || []).forEach((r: any) => {
        if (!r.user_id) return;
        if (!questoesPorUsuario[r.user_id]) {
          questoesPorUsuario[r.user_id] = { total: 0, acertos: 0 };
        }
        questoesPorUsuario[r.user_id].total += 1;
        if (r.correta) questoesPorUsuario[r.user_id].acertos += 1;
      });

      const listaRankeada = users
        .map((u) => {
          const stats = questoesPorUsuario[u.id] || { total: 0, acertos: 0 };
          const percentual = stats.total > 0 ? Number(((stats.acertos / stats.total) * 100).toFixed(1)) : 0;
          return {
            user_id: u.id,
            apelido: u.apelido || u.nome || 'Soldado',
            avatar_url: u.avatar_url,
            nivel_atual: u.nivel_atual || 1,
            titulo_nivel: (u.nivel_atual || 1) >= 15 ? 'Rei da Batcaverna' : (u.nivel_atual || 1) >= 10 ? 'General' : 'Recruta',
            valor: stats.total,
            percentual_acerto: percentual,
          };
        })
        .filter((item) => item.valor > 0)
        .sort((a, b) => b.valor - a.valor)
        .slice(0, limit)
        .map((item, index) => ({
          ...item,
          posicao: index + 1,
        }));

      return NextResponse.json({
        success: true,
        data: {
          tipo,
          periodo,
          ranking: listaRankeada,
        },
      });
    }
  } catch (error) {
    console.error('GET /api/ranking error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar ranking' }, { status: 500 });
  }
}
