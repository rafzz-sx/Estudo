import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';
import { avaliarStreak } from '@/lib/gamificacao';
import { buscarSessaoAtiva, duracaoAceita } from '@/lib/sessao-estudo';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
}

// POST /api/study-sessions/heartbeat — Heartbeat sincronizado com precisão exata de segundos
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const supabase = createServerSupabaseClient();

    const agora = new Date();

    // Encerra a sessão vencida (8 h ou virada de dia) antes de devolvê-la.
    const session = await buscarSessaoAtiva(supabase, userId, agora);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Nenhuma sessão ativa' }, { status: 404 });
    }

    const duracaoAtualBanco = session.duracao_segundos || 0;

    // O cronômetro da tela é mais preciso que a conta do servidor — só conta
    // com a aba visível — mas não é confiável: era aceito sem teto nenhum, e
    // uma requisição forjada virava milhões de XP. `duracaoAceita` corta no
    // tempo que o relógio realmente andou desde a última gravação.
    const novaDuracao = duracaoAceita(session, body.duracao_segundos, agora);

    // Delta de segundos estudados desde a última atualização no banco
    const diffSegundos = Math.max(0, novaDuracao - duracaoAtualBanco);

    // Calcular blocos de 15min contínuos (900s)
    const blocos15Min = Math.floor(novaDuracao / 900);
    const novosBlocos = Math.max(0, blocos15Min - (session.blocos_continuos_completados || 0));

    // Multiplicador de continuidade: +10% a cada 15min, até +50% (1.5x)
    const multiplicador = Math.min(1 + blocos15Min * 0.1, 1.5);

    // XP: 1 XP por minuto de estudo x multiplicador
    const xpGanhoNesteIntervalo = Math.max(0, Math.round((diffSegundos / 60) * multiplicador));
    const novoXpSessao = (session.xp_ganho_na_sessao || 0) + xpGanhoNesteIntervalo;

    const updatePayload: Record<string, any> = {
      ultima_atividade_em: agora.toISOString(),
      duracao_segundos: novaDuracao,
      blocos_continuos_completados: blocos15Min,
      multiplicador_continuidade_atual: multiplicador,
      xp_ganho_na_sessao: novoXpSessao,
    };

    // Atualizar sessão no Supabase
    await supabase
      .from('study_sessions')
      .update(updatePayload)
      .eq('id', session.id);

    // Atualizar XP total, NÍVEL e streak do usuário.
    //
    // O nível precisa ser recalculado aqui como já é em /questoes/responder,
    // /simulados/finalizar e /teoria/concluir. Sem isso, quem sobe de nível
    // só estudando no cronômetro continuava com `nivel_atual` antigo no
    // banco — e como o AppShell lê o nível do banco, a patente do aluno
    // ficava congelada até ele responder uma questão.
    let nivelDepois = calcularNivel(0);
    let subiuNivel = false;
    let xpTotalDepois = 0;

    if (xpGanhoNesteIntervalo > 0) {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('xp_total, streak_dias, maior_streak, ultimo_dia_estudado, escudos_streak, escudo_recarregado_em, escudos_usados_total')
          .eq('id', userId)
          .single();

        const xpAtual = userData?.xp_total || 0;
        xpTotalDepois = xpAtual + xpGanhoNesteIntervalo;

        const nivelAntes = calcularNivel(xpAtual);
        nivelDepois = calcularNivel(xpTotalDepois);
        subiuNivel = nivelDepois.nivel > nivelAntes.nivel;

        // Estudar no cronômetro também mantém a corrente de dias viva.
        const hoje = agora.toISOString().split('T')[0];
        // O escudo vale em TODO caminho que mexe na sequência. Sem isto,
        // quem estudou só no cronômetro naquele dia perderia a corrente
        // mesmo tendo escudo disponível.
        const resStreak = avaliarStreak({
          ultimoDiaEstudado: userData?.ultimo_dia_estudado ?? null,
          hoje,
          streakAtual: userData?.streak_dias ?? 0,
          escudos: userData?.escudos_streak,
          recarregadoEm: userData?.escudo_recarregado_em,
        });
        const streak = resStreak.streak;

        await supabase
          .from('users')
          .update({
            xp_total: xpTotalDepois,
            nivel_atual: nivelDepois.nivel,
            streak_dias: streak,
            maior_streak: Math.max(userData?.maior_streak ?? 0, streak),
            escudos_streak: resStreak.escudos,
            escudo_recarregado_em: resStreak.recarregado_em,
            escudos_usados_total:
              (userData?.escudos_usados_total ?? 0) +
              (resStreak.usou_escudo ? 1 : 0),
            ultimo_dia_estudado: hoje,
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Aviso ao atualizar XP do usuário:', err);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.id,
        duracao_segundos: novaDuracao,
        xp_ganho_intervalo: xpGanhoNesteIntervalo,
        xp_ganho_total_sessao: novoXpSessao,
        multiplicador,
        blocos_completados: blocos15Min,
        novos_blocos: novosBlocos,
        // O store precisa disso para atualizar a patente na topbar e
        // disparar a animação de level up sem esperar um refresh.
        xp_total: xpTotalDepois || null,
        nivel: xpGanhoNesteIntervalo > 0 ? nivelDepois : null,
        subiu_nivel: subiuNivel,
      },
    });
  } catch (error) {
    console.error('POST /api/study-sessions/heartbeat error:', error);
    return NextResponse.json({ success: false, error: 'Erro no heartbeat' }, { status: 500 });
  }
}
