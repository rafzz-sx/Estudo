import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/admin/atividade-usuarios — Usuários online em tempo real e sessões ativas
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const supabase = createServerSupabaseClient();

    // 1. Sessões ativas (não finalizadas ou com heartbeat recente nos últimos 10 minutos)
    const dezMinAtras = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: sessoesAtivas } = await supabase
      .from('study_sessions')
      .select(`
        id, user_id, dispositivo, iniciada_em, duracao_segundos,
        multiplicador_continuidade_atual, xp_ganho_na_sessao,
        user:users!user_id (id, nome, apelido, email, avatar_url, nivel_atual, streak_dias)
      `)
      .is('finalizada_em', null)
      .gte('iniciada_em', dezMinAtras)
      .order('iniciada_em', { ascending: false });

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
      .gte('respondida_em', hojeInicio.toISOString());

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
          dispositivo: s.dispositivo || 'web',
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
