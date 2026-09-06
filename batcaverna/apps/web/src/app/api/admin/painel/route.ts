import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/**
 * GET /api/admin/painel
 *
 * Visão consolidada para o administrador: métricas da plataforma, lista de
 * usuários com o tempo restante da sessão automática, e o feedback recebido.
 * Substitui três chamadas separadas que a tela fazia.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();
    const agora = Date.now();

    // ─── Usuários ────────────────────────────────────────────
    const { data: usuarios } = await supabase
      .from('users')
      .select(
        `id, nome, apelido, email, role, xp_total, nivel_atual, streak_dias,
         combo_atual, maior_combo_pessoal, total_questoes_respondidas,
         total_acertos, criado_em, ultimo_login_em, sessao_expira_em,
         ultimo_dia_estudado, email_verified`
      )
      .order('criado_em', { ascending: false })
      .limit(500);

    const { data: temposUso } = await supabase
      .from('user_tempo_uso')
      .select('user_id, segundos_totais');

    const usoPorUser = new Map(
      (temposUso ?? []).map((t) => [t.user_id, t.segundos_totais ?? 0])
    );

    const { data: sessoes } = await supabase
      .from('study_sessions')
      .select('user_id, duracao_segundos, finalizada_em, ultima_atividade_em');

    const estudoPorUser = new Map<string, number>();
    for (const s of sessoes ?? []) {
      estudoPorUser.set(
        s.user_id,
        (estudoPorUser.get(s.user_id) ?? 0) + (s.duracao_segundos ?? 0)
      );
    }

    // Considera "online" quem teve atividade nos últimos 5 minutos.
    const online = new Set(
      (sessoes ?? [])
        .filter(
          (s) =>
            !s.finalizada_em &&
            s.ultima_atividade_em &&
            agora - new Date(s.ultima_atividade_em).getTime() < 5 * 60_000
        )
        .map((s) => s.user_id)
    );

    const listaUsuarios = (usuarios ?? []).map((u) => {
      const expira = u.sessao_expira_em
        ? new Date(u.sessao_expira_em).getTime()
        : null;

      // Quanto falta para o login automático expirar. Negativo = já expirou.
      const segundosRestantes = expira
        ? Math.round((expira - agora) / 1000)
        : null;

      const respondidas = u.total_questoes_respondidas ?? 0;

      return {
        ...u,
        online: online.has(u.id),
        tempo_uso_plataforma: usoPorUser.get(u.id) ?? 0,
        tempo_estudo: estudoPorUser.get(u.id) ?? 0,
        taxa_acerto: respondidas
          ? Number((((u.total_acertos ?? 0) / respondidas) * 100).toFixed(1))
          : 0,
        sessao_segundos_restantes: segundosRestantes,
        sessao_expirada: segundosRestantes !== null && segundosRestantes <= 0,
      };
    });

    // ─── Métricas da plataforma ──────────────────────────────
    const { count: totalQuestoes } = await supabase
      .from('questoes')
      .select('id', { count: 'exact', head: true })
      .eq('ativa', true);

    const { count: totalRespostas } = await supabase
      .from('user_questao_respostas')
      .select('id', { count: 'exact', head: true });

    const { count: ticketsAbertos } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'aberto');

    const { count: feedbacksNovos } = await supabase
      .from('feedback_plataforma')
      .select('id', { count: 'exact', head: true })
      .eq('lido_por_admin', false);

    const ontem = new Date(agora - 86_400_000).toISOString();
    const { count: novosUsuarios24h } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('criado_em', ontem);

    return NextResponse.json({
      success: true,
      data: {
        metricas: {
          total_usuarios: listaUsuarios.length,
          online_agora: online.size,
          novos_24h: novosUsuarios24h ?? 0,
          total_questoes: totalQuestoes ?? 0,
          total_respostas: totalRespostas ?? 0,
          tickets_abertos: ticketsAbertos ?? 0,
          feedbacks_novos: feedbacksNovos ?? 0,
          sessoes_ativas: online.size,
        },
        usuarios: listaUsuarios,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/painel error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar o painel' },
      { status: 500 }
    );
  }
}
