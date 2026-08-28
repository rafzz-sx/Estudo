import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/study-sessions/heartbeat — Heartbeat a cada 30-60s
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // Buscar sessão ativa
    const { data: session, error: sessErr } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('finalizada_em', null)
      .single();

    if (sessErr || !session) {
      return NextResponse.json({ success: false, error: 'Nenhuma sessão ativa' }, { status: 404 });
    }

    // Verificar inatividade (5 min sem heartbeat → pausar)
    const agora = new Date();
    const ultimaAtividade = new Date(session.ultima_atividade_em);
    const diffSegundos = Math.floor((agora.getTime() - ultimaAtividade.getTime()) / 1000);

    if (diffSegundos > 300) {
      // Inativo por 5+ min → finalizar sessão automaticamente
      await supabase
        .from('study_sessions')
        .update({
          finalizada_em: ultimaAtividade.toISOString(),
          duracao_segundos: session.duracao_segundos,
        })
        .eq('id', session.id);

      return NextResponse.json({
        success: false,
        error: 'Sessão finalizada por inatividade',
        data: { duracao_segundos: session.duracao_segundos },
      }, { status: 410 });
    }

    // Calcular nova duração
    const novaDuracao = session.duracao_segundos + diffSegundos;

    // Calcular blocos de 15min contínuos
    const blocos15Min = Math.floor(novaDuracao / 900);
    const novosBlocos = blocos15Min - session.blocos_continuos_completados;

    // Multiplicador de continuidade (seção 8.2): +10% a cada 15min, até +50%
    const multiplicador = Math.min(1 + blocos15Min * 0.1, 1.5);

    // XP base: 1 XP por minuto de estudo × multiplicador
    const xpGanho = Math.floor((diffSegundos / 60) * multiplicador);
    const novoXpSessao = session.xp_ganho_na_sessao + xpGanho;

    // Atualizar sessão
    await supabase
      .from('study_sessions')
      .update({
        ultima_atividade_em: agora.toISOString(),
        duracao_segundos: novaDuracao,
        blocos_continuos_completados: blocos15Min,
        multiplicador_continuidade_atual: multiplicador,
        xp_ganho_na_sessao: novoXpSessao,
      })
      .eq('id', session.id);

    // Atualizar XP total do usuário
    if (xpGanho > 0) {
      try {
        await supabase.rpc('increment_user_xp', {
          p_user_id: userId,
          p_xp: xpGanho,
        });
      } catch {
        // Fallback se a RPC não existir
        await supabase
          .from('users')
          .update({ xp_total: session.xp_ganho_na_sessao + xpGanho })
          .eq('id', userId);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        duracao_segundos: novaDuracao,
        xp_ganho: xpGanho,
        multiplicador,
        blocos_completados: blocos15Min,
        novos_blocos: novosBlocos,
      },
    });
  } catch (error) {
    console.error('POST /api/study-sessions/heartbeat error:', error);
    return NextResponse.json({ success: false, error: 'Erro no heartbeat' }, { status: 500 });
  }
}
