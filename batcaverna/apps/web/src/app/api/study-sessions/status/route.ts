import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';
import {
  LIMITE_MAXIMO_SESSAO_SEGUNDOS,
  buscarSessaoAtiva,
} from '@/lib/sessao-estudo';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
}

// GET /api/study-sessions/status — Obter status da sessão ativa e tempo total acumulado
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // 1. Sessão ativa — encerrando antes a que já venceu (8 h ou virada de
    //    dia). Esta rota não aplicava regra nenhuma, e como o store retorna
    //    cedo quando encontra sessão ativa, `/start` (o único lugar que tinha
    //    a regra) nunca mais era chamado: a mesma linha vivia para sempre.
    const activeSession = await buscarSessaoAtiva(supabase, userId);

    // 2. Tempo de hoje (sessões iniciadas hoje)
    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);

    const todaySessions = await lerTudo<{ duracao_segundos: number | null }>(() =>
      supabase
        .from('study_sessions')
        .select('duracao_segundos')
        .eq('user_id', userId)
        .gte('iniciada_em', inicioDoDia.toISOString())
    );

    const tempoEstudoHoje = todaySessions.reduce((acc, s) => acc + (s.duracao_segundos || 0), 0);

    // 3. Tempo total histórico
    // `lerTudo` porque `study_sessions` passou a ter UMA LINHA POR DIA por
    // usuário (a virada de dia é o que faz "tempo de hoje" funcionar). Sem
    // paginação, o total de estudo pararia de crescer calado ao passar das
    // 1.000 do teto do PostgREST — cerca de três anos de uso diário.
    const allSessions = await lerTudo<{ duracao_segundos: number | null }>(() =>
      supabase
        .from('study_sessions')
        .select('duracao_segundos')
        .eq('user_id', userId)
    );

    const tempoEstudoTotal = allSessions.reduce((acc, s) => acc + (s.duracao_segundos || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        sessao_ativa: activeSession ? {
          id: activeSession.id,
          duracao_segundos: activeSession.duracao_segundos || 0,
          multiplicador: activeSession.multiplicador_continuidade_atual || 1.0,
          xp_ganho_na_sessao: activeSession.xp_ganho_na_sessao || 0,
          tempo_restante_8h_segundos: Math.max(0, LIMITE_MAXIMO_SESSAO_SEGUNDOS - (activeSession.duracao_segundos || 0)),
          iniciada_em: activeSession.iniciada_em,
        } : null,
        tempo_estudo_hoje_segundos: tempoEstudoHoje,
        tempo_estudo_total_segundos: tempoEstudoTotal,
        limite_maximo_sessao_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
      },
    });
  } catch (error) {
    console.error('GET /api/study-sessions/status error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao consultar status' }, { status: 500 });
  }
}
