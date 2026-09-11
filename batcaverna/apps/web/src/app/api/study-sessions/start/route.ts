import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
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

// POST /api/study-sessions/start — Iniciar sessão de estudo automática (limite 8h)
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dispositivo = body.dispositivo || 'web';

    const supabase = createServerSupabaseClient();

    // Sessão ativa, se houver — já encerrada por `buscarSessaoAtiva` quando
    // passou das 8 h ou virou o dia. A regra vive agora em `lib/sessao-estudo`
    // e é a mesma usada por `/status` e `/heartbeat`; antes existia só aqui, e
    // como o store só chama esta rota quando `/status` não devolve sessão, ela
    // deixava de ser aplicada logo na segunda visita do aluno.
    const existingSession = await buscarSessaoAtiva(supabase, userId);

    if (existingSession) {
      return NextResponse.json({
        success: true,
        data: {
          session_id: existingSession.id,
          duracao_segundos: existingSession.duracao_segundos || 0,
          multiplicador: existingSession.multiplicador_continuidade_atual || 1.0,
          xp_ganho_na_sessao: existingSession.xp_ganho_na_sessao || 0,
          tempo_restante_8h_segundos: Math.max(0, LIMITE_MAXIMO_SESSAO_SEGUNDOS - (existingSession.duracao_segundos || 0)),
          limite_8h_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
        },
        message: 'Sessão de estudo ativa recuperada!',
      });
    }

    // Criar nova sessão com limite de 8h
    const { data: newSession, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        dispositivo_origem: dispositivo,
        duracao_segundos: 0,
        blocos_continuos_completados: 0,
        multiplicador_continuidade_atual: 1.0,
        xp_ganho_na_sessao: 0,
        iniciada_em: new Date().toISOString(),
        ultima_atividade_em: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    // A notificação de amigo estudando agora é disparada em /heartbeat
    // após o aluno acumular pelo menos 2 minutos (120s) de estudo real,
    // garantindo o filtro anti-falso disparo solicitado.

    return NextResponse.json({
      success: true,
      data: {
        session_id: newSession.id,
        duracao_segundos: 0,
        multiplicador: 1.0,
        xp_ganho_na_sessao: 0,
        tempo_restante_8h_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
        limite_8h_segundos: LIMITE_MAXIMO_SESSAO_SEGUNDOS,
      },
      message: 'Sessão automática de estudo iniciada (limite 8h)!',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/study-sessions/start error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao iniciar sessão' }, { status: 500 });
  }
}
