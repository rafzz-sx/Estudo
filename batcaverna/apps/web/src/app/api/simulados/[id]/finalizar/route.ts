import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';
import { conferirBadges, avaliarStreak } from '@/lib/gamificacao';
import { REFERENCIA_APROVACAO } from '@/lib/distribuicao-prova';
import {
  calcularTRIEnem,
  type ItemTRI,
  type ResultadoTRI,
} from '@/lib/tri-enem';

/**
 * POST /api/simulados/[id]/finalizar
 * Body: { respostas: { "<questao_id>": "B", ... }, tempo_gasto_segundos?: number }
 *
 * Corrige o simulado e consolida todo o desempenho (por matéria, por dificuldade,
 * histórico do usuário, XP e streak).
 *
 * Todas essas métricas de desempenho SÓ são calculadas e reveladas agora,
 * após o término oficial da prova.
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
      .select('*, concursos (sigla, nome)')
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
         materia_id, concurso_id, enunciado, dificuldade,
         materias (id, nome, icone_emoji)`
      )
      .in('id', simulado.questoes_ids);

    if (!gabarito) {
      return NextResponse.json(
        { success: false, error: 'Erro ao validar gabarito' },
        { status: 500 }
      );
    }

    // ─── Correção e Consolidação de Desempenho ──────────────
    const total = simulado.total_questoes || gabarito.length;
    const tempoPorQuestao = total > 0 ? Math.round(tempoGasto / total) : 0;

    let acertos = 0;
    const detalhes = [];
    const linhasHistorico = [];

    const statsMateriaMap: Record<
      string,
      { nome: string; emoji: string | null; total: number; acertos: number }
    > = {};

    const statsDificuldade: Record<string, { total: number; acertos: number }> = {
      facil: { total: 0, acertos: 0 },
      medio: { total: 0, acertos: 0 },
      dificil: { total: 0, acertos: 0 },
    };

    for (const q of gabarito) {
      const dada = (respostas[q.id] ?? '').trim().toUpperCase();
      const correta = !!dada && dada === q.resposta_correta.trim().toUpperCase();
      if (correta) acertos++;

      const diff = q.dificuldade === 'facil' || q.dificuldade === 'dificil' ? q.dificuldade : 'medio';
      statsDificuldade[diff].total += 1;
      if (correta) statsDificuldade[diff].acertos += 1;

      const mat = q.materias as any;
      if (q.materia_id && mat) {
        if (!statsMateriaMap[q.materia_id]) {
          statsMateriaMap[q.materia_id] = {
            nome: mat.nome,
            emoji: mat.icone_emoji,
            total: 0,
            acertos: 0,
          };
        }
        statsMateriaMap[q.materia_id].total += 1;
        if (correta) statsMateriaMap[q.materia_id].acertos += 1;
      }

      detalhes.push({
        questao_id: q.id,
        enunciado: q.enunciado,
        dificuldade: diff,
        materia_nome: mat?.nome ?? null,
        resposta_dada: dada || null,
        resposta_correta: q.resposta_correta,
        correta,
        explicacao: q.explicacao,
        resolucao_passos: q.resolucao_passos,
        figura_descricao: q.figura_descricao,
      });

      // Questão respondida vai para histórico do aluno
      if (dada) {
        linhasHistorico.push({
          user_id: user.id,
          questao_id: q.id,
          resposta_dada: dada.slice(0, 2),
          correta,
          tempo_gasto_segundos: tempoPorQuestao,
          combo_no_momento: 0,
        });
      }
    }

    const respondidas = linhasHistorico.length;
    const pontuacao = total > 0 ? Number(((acertos / total) * 100).toFixed(1)) : 0;
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

    // Atualiza estatísticas por matéria
    for (const [materiaId, v] of Object.entries(statsMateriaMap)) {
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
          tempo_segundos: (stat?.tempo_segundos ?? 0) + tempoPorQuestao * v.total,
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
      streak_dias: streak,
      tempo_estudo_total_segundos: dadosUser?.tempo_estudo_total_segundos ?? 0,
      usou_escudo: false,
      escudos_restantes: dadosUser?.escudos_streak ?? 0,
      era_revisao: false,
    });

    const siglaConcurso = (simulado.concursos as any)?.sigla?.toUpperCase();
    const referenciaCorte = siglaConcurso ? REFERENCIA_APROVACAO[siglaConcurso] ?? null : null;

    // ─── Teoria de Resposta ao Item (TRI) para ENEM ──────────
    let resultadoTRI: ResultadoTRI | null = null;
    if (siglaConcurso === 'ENEM') {
      const itensTRI: ItemTRI[] = gabarito.map((q) => {
        const dada = (respostas[q.id] ?? '').trim().toUpperCase();
        const correta = !!dada && dada === q.resposta_correta.trim().toUpperCase();
        const diff =
          q.dificuldade === 'facil' || q.dificuldade === 'dificil'
            ? q.dificuldade
            : 'medio';
        const mat = q.materias as any;
        return {
          questaoId: q.id,
          materiaNome: mat?.nome ?? null,
          dificuldade: diff,
          correta,
        };
      });
      resultadoTRI = calcularTRIEnem(itensTRI);
    }

    const desempenhoDificuldade = [
      {
        tipo: 'Fácil',
        chave: 'facil',
        total: statsDificuldade.facil.total,
        acertos: statsDificuldade.facil.acertos,
        taxa:
          statsDificuldade.facil.total > 0
            ? Math.round((statsDificuldade.facil.acertos / statsDificuldade.facil.total) * 100)
            : 0,
      },
      {
        tipo: 'Média',
        chave: 'medio',
        total: statsDificuldade.medio.total,
        acertos: statsDificuldade.medio.acertos,
        taxa:
          statsDificuldade.medio.total > 0
            ? Math.round((statsDificuldade.medio.acertos / statsDificuldade.medio.total) * 100)
            : 0,
      },
      {
        tipo: 'Difícil',
        chave: 'dificil',
        total: statsDificuldade.dificil.total,
        acertos: statsDificuldade.dificil.acertos,
        taxa:
          statsDificuldade.dificil.total > 0
            ? Math.round((statsDificuldade.dificil.acertos / statsDificuldade.dificil.total) * 100)
            : 0,
      },
    ];

    const desempenhoMaterias = Object.entries(statsMateriaMap).map(([id, val]) => ({
      materia_id: id,
      nome: val.nome,
      emoji: val.emoji,
      total: val.total,
      acertos: val.acertos,
      taxa: val.total > 0 ? Math.round((val.acertos / val.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

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
        desempenho_dificuldade: desempenhoDificuldade,
        desempenho_materias: desempenhoMaterias,
        resultado_tri: resultadoTRI,
        referencia_corte: referenciaCorte,
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
