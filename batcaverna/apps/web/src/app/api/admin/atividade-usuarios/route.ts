import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

// GET /api/admin/atividade-usuarios — Usuários online em tempo real e sessões ativas
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const supabase = createServerSupabaseClient();

    // 1. Sessões ativas (não finalizadas ou com heartbeat recente nos últimos 10 minutos)
    const dezMinAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // `study_sessions` tem uma linha por sessão de cada usuário: passa das
    // 1.000 do teto do PostgREST muito antes de haver 1.000 contas, e a aba
    // passava a mostrar um recorte arbitrário como se fosse o total. As outras
    // três rotas do admin já haviam sido corrigidas; esta ficou de fora.
    const sessoesAtivas = await lerTudo<{
      id: string;
      user_id: string;
      dispositivo_origem: string | null;
      iniciada_em: string;
      duracao_segundos: number | null;
      multiplicador_continuidade_atual: number | null;
      xp_ganho_na_sessao: number | null;
      user: unknown;
    }>(() =>
      supabase
        .from('study_sessions')
        .select(`
          id, user_id, dispositivo_origem, iniciada_em, duracao_segundos,
          multiplicador_continuidade_atual, xp_ganho_na_sessao,
          user:users!user_id (id, nome, apelido, email, avatar_url, nivel_atual, streak_dias)
        `)
        .is('finalizada_em', null)
        .gte('iniciada_em', dezMinAtras)
        .order('iniciada_em', { ascending: false })
    );

    // 2. Total de usuários registrados
    const { count: totalUsuarios } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 3. Questões respondidas hoje
    const hojeInicio = new Date();
    hojeInicio.setHours(0, 0, 0, 0);

    const { count: questoesHoje } = await supabase
      .from('user_questao_respostas')
      .select('*', { count: 'exact', head: true })
      // `respondida_em` não existe: a coluna é `respondido_em`. A contagem
      // de questões respondidas hoje voltava indefinida, calada.
      .gte('respondido_em', hojeInicio.toISOString());

    return NextResponse.json({
      success: true,
      data: {
        usuarios_online: (sessoesAtivas || []).map((s: any) => ({
          sessao_id: s.id,
          user_id: s.user_id,
          nome: s.user?.nome,
          apelido: s.user?.apelido,
          email: s.user?.email,
          avatar_url: s.user?.avatar_url,
          nivel_atual: s.user?.nivel_atual || 1,
          streak_dias: s.user?.streak_dias || 0,
          // A coluna chama `dispositivo_origem`. Pedindo `dispositivo`, o
          // PostgREST recusava a consulta INTEIRA e a aba "Usuários Online
          // Agora" mostrava sempre lista vazia — parecia que ninguém estava
          // estudando.
          dispositivo: s.dispositivo_origem || 'web',
          iniciada_em: s.iniciada_em,
          duracao_segundos: s.duracao_segundos || 0,
          multiplicador: s.multiplicador_continuidade_atual || 1.0,
          xp_ganho: s.xp_ganho_na_sessao || 0,
        })),
        estatisticas_tempo_real: {
          total_usuarios: totalUsuarios || 0,
          usuarios_online_agora: (sessoesAtivas || []).length,
          questoes_respondidas_hoje: questoesHoje || 0,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/atividade-usuarios error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar atividade em tempo real' }, { status: 500 });
  }
}
