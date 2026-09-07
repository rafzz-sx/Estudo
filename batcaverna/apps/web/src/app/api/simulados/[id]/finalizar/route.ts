import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';
import { conferirBadges, avaliarStreak } from '@/lib/gamificacao';

/**
 * POST /api/simulados/[id]/finalizar
 * Body: { respostas: { "<questao_id>": "B", ... }, tempo_gasto_segundos?: number }
 *
 * Além de corrigir, agora grava cada resposta em `user_questao_respostas` e
 * atualiza as estatísticas por matéria. Antes, o que era respondido em
 * simulado não contava em lugar nenhum: o aluno fazia 45 questões e o
 * perfil continuava dizendo que ele não tinha respondido nada.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: simuladoId } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const respostas: Record<string, string> = body?.respostas ?? {};
    const tempoGasto = Math.max(0, Number(body?.tempo_gasto_segundos) || 0);

    const supabase = createServerSupabaseClient();

    const { data: simulado, error: sErr } = await supabase
      .from('simulados')
      .select('*')
      .eq('id', simuladoId)
      .eq('user_id', user.id)
      .single();

    if (sErr || !simulado) {
      return NextResponse.json(
        { success: false, error: 'Simulado não encontrado' },
        { status: 404 }
      );
    }

    if (simulado.finalizado_em) {
      return NextResponse.json(
        { success: false, error: 'Este simulado já foi finalizado.' },
        { status: 400 }
      );
    }

    // ─── Gabarito oficial (só aqui ele é lido) ───────────────
    const { data: gabarito } = await supabase
      .from('questoes')
      .select(
        `id, resposta_correta, explicacao, resolucao_passos, figura_descricao,
         materia_id, concurso_id, enunciado`
      )
      .in('id', simulado.questoes_ids);

    if (!gabarito) {
      return NextResponse.json(
        { success: false, error: 'Erro ao validar gabarito' },
        { status: 500 }
      );
    }

    // ─── Correção ────────────────────────────────────────────
    const total = simulado.total_questoes || gabarito.length;
    const tempoPorQuestao = total > 0 ? Math.round(tempoGasto / total) : 0;

    let acertos = 0;
    const detalhes = [];
    const linhasHistorico = [];
    const porMateria: Record<string, { total: number; acertos: number }> = {};

    for (const q of gabarito) {
      const dada = (respostas[q.id] ?? '').trim().toUpperCase();
      const correta = !!dada && dada === q.resposta_correta.trim().toUpperCase();
      if (correta) acertos++;

      detalhes.push({
        questao_id: q.id,
        enunciado: q.enunciado,
        resposta_dada: dada || null,
        resposta_correta: q.resposta_correta,
        correta,
        explicacao: q.explicacao,
        resolucao_passos: q.resolucao_passos,
        figura_descricao: q.figura_descricao,
      });

      // Questão em branco não vira histórico — o aluno não respondeu.
      if (dada) {
        linhasHistorico.push({
          user_id: user.id,
          questao_id: q.id,
          resposta_dada: dada.slice(0, 2),
          correta,
          tempo_gasto_segundos: tempoPorQuestao,
          combo_no_momento: 0, // simulado não alimenta o combo do banco de questões
        });

        if (q.materia_id) {
          porMateria[q.materia_id] ??= { total: 0, acertos: 0 };
          porMateria[q.materia_id].total += 1;
          if (correta) porMateria[q.materia_id].acertos += 1;
        }
      }
    }

    const respondidas = linhasHistorico.length;
    const pontuacao = total > 0 ? Number(((acertos / total) * 100).toFixed(1)) : 0;
    // 20 XP por acerto + 50 de bônus por concluir a prova inteira
    const xpGanho = acertos * 20 + 50;

    // ─── Persistência ────────────────────────────────────────
    if (linhasHistorico.length) {
      await supabase.from('user_questao_respostas').insert(linhasHistorico);
    }

    await supabase
      .from('simulados')
      .update({
        acertos,
        pontuacao,
        respostas,
        tempo_gasto_segundos: tempoGasto,
        finalizado_em: new Date().toISOString(),
      })
      .eq('id', simuladoId);

    const { data: dadosUser } = await supabase
      .from('users')
      .select(
        `xp_total, total_questoes_respondidas, total_acertos, streak_dias,
         maior_streak, ultimo_dia_estudado, maior_combo_pessoal,
         escudos_streak, escudo_recarregado_em, escudos_usados_total,
         tempo_estudo_total_segundos`
      )
      .eq('id', user.id)
      .single();

    const xpAntes = dadosUser?.xp_total ?? 0;
    const xpDepois = xpAntes + xpGanho;
    const nivelAntes = calcularNivel(xpAntes);
    const nivelDepois = calcularNivel(xpDepois);

    // Antes, este bloco gravava `ultimo_dia_estudado = hoje` mas NÃO mexia
    // em `streak_dias`. O efeito era pior que não contar: no dia seguinte,
    // o cálculo do streak em /questoes/responder via que o aluno "já tinha
    // estudado hoje" e devolvia o streak parado. Fazer simulado congelava a
    // corrente de dias.
    const hoje = new Date().toISOString().slice(0, 10);
    const resStreak = avaliarStreak({
      ultimoDiaEstudado: dadosUser?.ultimo_dia_estudado ?? null,
      hoje,
      streakAtual: dadosUser?.streak_dias ?? 0,
      escudos: dadosUser?.escudos_streak,
      recarregadoEm: dadosUser?.escudo_recarregado_em,
    });
    const streak = resStreak.streak;

    await supabase
      .from('users')
      .update({
        xp_total: xpDepois,
        nivel_atual: nivelDepois.nivel,
        total_questoes_respondidas:
          (dadosUser?.total_questoes_respondidas ?? 0) + respondidas,
        total_acertos: (dadosUser?.total_acertos ?? 0) + acertos,
        streak_dias: streak,
        maior_streak: Math.max(dadosUser?.maior_streak ?? 0, streak),
        escudos_streak: resStreak.escudos,
        escudo_recarregado_em: resStreak.recarregado_em,
        escudos_usados_total:
          (dadosUser?.escudos_usados_total ?? 0) + (resStreak.usou_escudo ? 1 : 0),
        ultimo_dia_estudado: hoje,
      })
      .eq('id', user.id);

    // Estatística por matéria
    for (const [materiaId, v] of Object.entries(porMateria)) {
      const { data: stat } = await supabase
        .from('user_materia_stats')
        .select('questoes_respondidas, acertos, tempo_segundos')
        .eq('user_id', user.id)
        .eq('materia_id', materiaId)
        .eq('concurso_id', simulado.concurso_id)
        .maybeSingle();

      await supabase.from('user_materia_stats').upsert(
        {
          user_id: user.id,
          materia_id: materiaId,
          concurso_id: simulado.concurso_id,
          questoes_respondidas: (stat?.questoes_respondidas ?? 0) + v.total,
          acertos: (stat?.acertos ?? 0) + v.acertos,
          tempo_segundos:
            (stat?.tempo_segundos ?? 0) + tempoPorQuestao * v.total,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'user_id,materia_id,concurso_id' }
      );
    }

    const badgesNovas = await conferirBadges(supabase, user.id, {
      xp_total: xpDepois,
      total_questoes_respondidas:
        (dadosUser?.total_questoes_respondidas ?? 0) + respondidas,
      maior_combo_pessoal: dadosUser?.maior_combo_pessoal ?? 0,
      // O streak recém-calculado, não o antigo: a insígnia de corrente de
      // dias tem de poder cair no mesmo simulado que fechou a corrente.
      streak_dias: streak,
      tempo_estudo_total_segundos: dadosUser?.tempo_estudo_total_segundos ?? 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        simulado_id: simuladoId,
        total_questoes: total,
        respondidas,
        em_branco: total - respondidas,
        acertos,
        erros: respondidas - acertos,
        pontuacao,
        tempo_gasto_segundos: tempoGasto,
        xp_ganho: xpGanho,
        xp_total: xpDepois,
        nivel: nivelDepois,
        subiu_nivel: nivelDepois.nivel > nivelAntes.nivel,
        badges_novas: badgesNovas,
        detalhes,
      },
    });
  } catch (error) {
    console.error('POST /api/simulados/[id]/finalizar error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao finalizar simulado' },
      { status: 500 }
    );
  }
}
