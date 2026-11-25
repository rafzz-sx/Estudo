import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/simulados/em-andamento
 *
 * Recupera um simulado ainda não finalizado do aluno (salvo via auto-save em nuvem)
 * caso o cache local tenha sido apagado ou o usuário tenha trocado de dispositivo.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: simulado, error: sErr } = await supabase
      .from('simulados')
      .select(
        'id, tipo, questoes_ids, respostas, total_questoes, duracao_minutos, iniciado_em, concursos (sigla, nome)'
      )
      .eq('user_id', user.id)
      .is('finalizado_em', null)
      .order('iniciado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sErr) throw sErr;

    if (!simulado || !Array.isArray(simulado.questoes_ids) || simulado.questoes_ids.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    // Ignora simulados abandonados há muito tempo (> duração + 30 min de tolerância)
    const iniciadoMs = new Date(simulado.iniciado_em).getTime();
    const toleranciaMs = (Number(simulado.duracao_minutos || 60) + 30) * 60_000;
    if (!Number.isFinite(iniciadoMs) || Date.now() - iniciadoMs > toleranciaMs) {
      return NextResponse.json({ success: true, data: null });
    }

    const { data: questoes, error: qErr } = await supabase
      .from('questoes')
      .select(
        `id, texto_base, enunciado, alternativas, ano, banca, dificuldade,
         figura_descricao, figura_svg, numero_original,
         concursos (sigla, emoji), materias (nome, icone_emoji), assuntos (nome)`
      )
      .in('id', simulado.questoes_ids);

    if (qErr) throw qErr;

    const porId = new Map((questoes ?? []).map((q: any) => [q.id, q]));
    const ordenadas = simulado.questoes_ids
      .map((id: string) => {
        const q = porId.get(id);
        if (!q) return null;
        return {
          ...q,
          area_conhecimento: q.materias?.nome ?? 'Geral',
        };
      })
      .filter(Boolean);

    if (ordenadas.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const respostasSalvas =
      simulado.respostas && typeof simulado.respostas === 'object' && !Array.isArray(simulado.respostas)
        ? (simulado.respostas as Record<string, string>)
        : {};

    const sigla = (simulado.concursos as any)?.sigla ?? '';

    return NextResponse.json({
      success: true,
      data: {
        simulado_id: simulado.id,
        tipo: simulado.tipo,
        total_questoes: simulado.total_questoes,
        duracao_minutos: simulado.duracao_minutos,
        iniciado_em: simulado.iniciado_em,
        questoes: ordenadas,
        respostas: respostasSalvas,
        aplica_tri: sigla === 'ENEM' && simulado.tipo !== 'erros',
      },
    });
  } catch (error) {
    console.error('GET /api/simulados/em-andamento error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar simulado em andamento' },
      { status: 500 }
    );
  }
}
