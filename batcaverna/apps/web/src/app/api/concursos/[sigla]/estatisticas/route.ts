import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/concursos/[sigla]/estatisticas
 *
 * Desempenho do aluno dentro de um concurso: acerto por matéria, evolução
 * nos últimos dias e as matérias que mais derrubam. É o que alimenta o card
 * "Minhas Estatísticas no X", que antes era um link morto para o dashboard.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sigla: string }> }
) {
  try {
    const { sigla } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: concurso } = await supabase
      .from('concursos')
      .select('id, sigla, nome, emoji, cor_tema')
      .ilike('sigla', sigla)
      .maybeSingle();

    if (!concurso) {
      return NextResponse.json(
        { success: false, error: 'Concurso não encontrado' },
        { status: 404 }
      );
    }

    // ─── Desempenho por matéria ──────────────────────────────
    const { data: stats } = await supabase
      .from('user_materia_stats')
      .select('questoes_respondidas, acertos, tempo_segundos, materias (id, nome, icone_emoji)')
      .eq('user_id', user.id)
      .eq('concurso_id', concurso.id);

    const porMateria = (stats ?? [])
      .map((s: any) => {
        const total = s.questoes_respondidas ?? 0;
        return {
          materia: s.materias?.nome ?? '—',
          emoji: s.materias?.icone_emoji ?? '📚',
          respondidas: total,
          acertos: s.acertos ?? 0,
          taxa: total ? Number((((s.acertos ?? 0) / total) * 100).toFixed(1)) : 0,
          tempo_segundos: s.tempo_segundos ?? 0,
        };
      })
      .sort((a, b) => b.respondidas - a.respondidas);

    const respondidas = porMateria.reduce((a, m) => a + m.respondidas, 0);
    const acertos = porMateria.reduce((a, m) => a + m.acertos, 0);

    // ─── Total disponível, para mostrar o quanto já foi coberto ──
    const { count: totalDisponivel } = await supabase
      .from('questoes')
      .select('id', { count: 'exact', head: true })
      .eq('concurso_id', concurso.id)
      .eq('ativa', true);

    // ─── Evolução dos últimos 30 dias ────────────────────────
    const desde = new Date(Date.now() - 30 * 86_400_000).toISOString();

    const { data: questoesDoConcurso } = await supabase
      .from('questoes')
      .select('id')
      .eq('concurso_id', concurso.id)
      .limit(20000);

    const idsConcurso = new Set((questoesDoConcurso ?? []).map((q) => q.id));

    const { data: respostas } = await supabase
      .from('user_questao_respostas')
      .select('questao_id, correta, respondido_em')
      .eq('user_id', user.id)
      .gte('respondido_em', desde)
      .order('respondido_em', { ascending: true })
      .limit(5000);

    const porDia: Record<string, { total: number; acertos: number }> = {};
    for (const r of respostas ?? []) {
      if (!idsConcurso.has(r.questao_id)) continue;
      const dia = String(r.respondido_em).slice(0, 10);
      porDia[dia] ??= { total: 0, acertos: 0 };
      porDia[dia].total += 1;
      if (r.correta) porDia[dia].acertos += 1;
    }

    const evolucao = Object.entries(porDia)
      .map(([dia, v]) => ({
        dia,
        total: v.total,
        acertos: v.acertos,
        taxa: Number(((v.acertos / v.total) * 100).toFixed(1)),
      }))
      .sort((a, b) => a.dia.localeCompare(b.dia));

    // Uma matéria só entra em "pontos fracos" com amostra mínima —
    // 40% de acerto em 3 questões não significa nada.
    const pontosFracos = porMateria
      .filter((m) => m.respondidas >= 10 && m.taxa < 60)
      .sort((a, b) => a.taxa - b.taxa)
      .slice(0, 3);

    const pontosFortes = porMateria
      .filter((m) => m.respondidas >= 10 && m.taxa >= 75)
      .sort((a, b) => b.taxa - a.taxa)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        concurso,
        resumo: {
          respondidas,
          acertos,
          erros: respondidas - acertos,
          taxa: respondidas
            ? Number(((acertos / respondidas) * 100).toFixed(1))
            : 0,
          total_disponivel: totalDisponivel ?? 0,
          cobertura: totalDisponivel
            ? Number(((respondidas / totalDisponivel) * 100).toFixed(1))
            : 0,
        },
        por_materia: porMateria,
        evolucao,
        pontos_fracos: pontosFracos,
        pontos_fortes: pontosFortes,
      },
    });
  } catch (error) {
    console.error('GET /api/concursos/[sigla]/estatisticas error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    );
  }
}
