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

    // ─── Notificação "amigo estudando" — 1ª sessão do dia ─────
    // Fire-and-forget: não bloqueia o início da sessão do aluno.
    notificarAmigosEstudando(supabase, userId).catch((e) =>
      console.warn('Erro ao notificar amigos estudando:', e)
    );

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

/**
 * Notifica todos os amigos aceitos que o aluno começou a estudar hoje.
 * Só dispara se ainda NÃO enviou essa notificação HOJE (fuso BRT -03:00).
 */
async function notificarAmigosEstudando(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
) {
  // Início do dia em BRT (UTC-3)
  const agora = new Date();
  const hojeInicioBRT = new Date(agora);
  hojeInicioBRT.setHours(hojeInicioBRT.getHours() - 3); // ajusta para BRT
  hojeInicioBRT.setHours(0, 0, 0, 0);
  hojeInicioBRT.setHours(hojeInicioBRT.getHours() + 3); // volta para UTC
  const hojeInicioISO = hojeInicioBRT.toISOString();

  // Já notificou hoje?
  const { data: jaNotificou } = await supabase
    .from('notificacoes')
    .select('id')
    .eq('tipo', 'amigo_estudando')
    .eq('referencia_id', userId)
    .gte('criada_em', hojeInicioISO)
    .limit(1);

  if (jaNotificou && jaNotificou.length > 0) return; // já enviou hoje

  // Buscar o apelido do aluno
  const { data: perfil } = await supabase
    .from('users')
    .select('apelido')
    .eq('id', userId)
    .single();

  const apelido = perfil?.apelido ?? 'Um amigo';

  // Buscar amigos aceitos
  const { data: amizades } = await supabase
    .from('amizades')
    .select('user_id_solicitante, user_id_destinatario')
    .or(`user_id_solicitante.eq.${userId},user_id_destinatario.eq.${userId}`)
    .eq('status', 'aceita');

  if (!amizades || amizades.length === 0) return;

  const amigoIds = amizades.map((a) =>
    a.user_id_solicitante === userId ? a.user_id_destinatario : a.user_id_solicitante
  );

  // Inserir notificação para cada amigo
  const notificacoes = amigoIds.map((amigoId) => ({
    user_id: amigoId,
    tipo: 'amigo_estudando',
    titulo: '⚔️ Amigo em Ação!',
    mensagem: `${apelido} começou a estudar hoje! Que tal entrar no combate também?`,
    referencia_id: userId,
    lida: false,
  }));

  await supabase.from('notificacoes').insert(notificacoes);
}
