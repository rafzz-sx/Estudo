import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

// GET /api/estudo/amigos-estudando — Retorna amigos estudando ao vivo (Radar da Dashboard)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const agora = new Date();
    const tresMinAtrasISO = new Date(agora.getTime() - 3 * 60 * 1000).toISOString();

    // 1. Checar se o próprio usuário logado está com sessão de estudo ativa
    const { data: minhaSessao } = await supabase
      .from('study_sessions')
      .select('id, duracao_segundos')
      .eq('user_id', user.id)
      .is('finalizada_em', null)
      .gte('ultima_atividade_em', tresMinAtrasISO)
      .maybeSingle();

    const usuarioEstudando = !!minhaSessao;

    // 2. Buscar amigos confirmados
    const { data: amizades } = await supabase
      .from('amizades')
      .select('user_id_solicitante, user_id_destinatario')
      .or(`user_id_solicitante.eq.${user.id},user_id_destinatario.eq.${user.id}`)
      .eq('status', 'aceita');

    if (!amizades || amizades.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          amigos: [],
          total: 0,
          usuario_estudando: usuarioEstudando,
          sincronia_ativa: false,
        },
      });
    }

    const amigoIds = amizades.map((a) =>
      a.user_id_solicitante === user.id ? a.user_id_destinatario : a.user_id_solicitante
    );

    // 3. Buscar sessões ativas dos amigos nos últimos 3 minutos
    const { data: sessoesAtivas, error } = await supabase
      .from('study_sessions')
      .select(`
        id, user_id, duracao_segundos, iniciada_em, ultima_atividade_em,
        users:users!user_id (
          id, apelido, avatar_url,
          user_concurso_favoritos (concursos (sigla))
        )
      `)
      .in('user_id', amigoIds)
      .is('finalizada_em', null)
      .gte('ultima_atividade_em', tresMinAtrasISO)
      .order('iniciada_em', { ascending: true });

    if (error) throw error;

    const amigosFormatados = (sessoesAtivas || []).map((s: any) => {
      const u = s.users;
      const concursoSigla =
        u?.user_concurso_favoritos?.[0]?.concursos?.sigla || null;
      const duracaoSegs = s.duracao_segundos || 0;
      const minutos = Math.max(1, Math.floor(duracaoSegs / 60));

      return {
        id: s.user_id,
        apelido: u?.apelido || 'Soldado',
        avatar_url: u?.avatar_url || null,
        concurso: concursoSigla,
        duracao_segundos: duracaoSegs,
        minutos_estudo: minutos,
        iniciada_em: s.iniciada_em,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        amigos: amigosFormatados,
        total: amigosFormatados.length,
        usuario_estudando: usuarioEstudando,
        sincronia_ativa: usuarioEstudando && amigosFormatados.length > 0,
      },
    });
  } catch (error) {
    console.error('GET /api/estudo/amigos-estudando error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar radar de amigos estudando' },
      { status: 500 }
    );
  }
}
