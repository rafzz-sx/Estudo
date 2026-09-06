import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { INTERVALOS_DIAS } from '@/lib/revisao-espacada';

/**
 * GET /api/revisoes
 *
 * Fila de repetição espaçada: as questões erradas que venceram e precisam
 * voltar hoje. Devolve a questão completa (sem gabarito — ela vai ser
 * respondida de novo) e o histórico de erros da pessoa nela.
 *
 * ?futuras=1 inclui as que ainda não venceram, para a pessoa ver a agenda.
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

    const { searchParams } = new URL(req.url);
    const incluirFuturas = searchParams.get('futuras') === '1';
    const limite = Math.min(50, Math.max(1, parseInt(searchParams.get('limite') || '20')));

    const supabase = createServerSupabaseClient();
    const hoje = new Date().toISOString().slice(0, 10);

    let query = supabase
      .from('revisoes_agendadas')
      .select('id, questao_id, etapa, agendada_para, total_erros, total_revisoes')
      .eq('user_id', user.id)
      .eq('ativa', true)
      .order('agendada_para')
      .limit(limite);

    if (!incluirFuturas) query = query.lte('agendada_para', hoje);

    const { data: agendadas } = await query;

    if (!agendadas?.length) {
      return NextResponse.json({
        success: true,
        data: { itens: [], vencidas: 0, agendadas_futuras: 0, aprendidas: 0 },
      });
    }

    const { data: questoes } = await supabase
      .from('questoes')
      .select(
        `id, texto_base, enunciado, alternativas, ano, banca, dificuldade,
         dia_prova, numero_original, figura_descricao, figura_svg,
         precisa_resolucao, anulada,
         concursos (sigla, nome, emoji, cor_tema),
         materias (nome, icone_emoji),
         assuntos (nome)`
      )
      .in(
        'id',
        agendadas.map((a) => a.questao_id)
      );

    const porId = new Map((questoes ?? []).map((q) => [q.id, q]));

    const itens = agendadas
      .map((a) => {
        const questao = porId.get(a.questao_id);
        if (!questao) return null;
        return {
          ...questao,
          revisao: {
            etapa: a.etapa,
            agendada_para: a.agendada_para,
            vencida: a.agendada_para <= hoje,
            total_erros: a.total_erros,
            total_revisoes: a.total_revisoes,
            intervalo_atual: INTERVALOS_DIAS[a.etapa] ?? null,
          },
        };
      })
      .filter(Boolean);

    // ─── Contadores para o painel ────────────────────────────
    const { count: vencidas } = await supabase
      .from('revisoes_agendadas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('ativa', true)
      .lte('agendada_para', hoje);

    const { count: futuras } = await supabase
      .from('revisoes_agendadas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('ativa', true)
      .gt('agendada_para', hoje);

    const { count: aprendidas } = await supabase
      .from('revisoes_agendadas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('ativa', false)
      .not('aprendida_em', 'is', null);

    return NextResponse.json({
      success: true,
      data: {
        itens,
        vencidas: vencidas ?? 0,
        agendadas_futuras: futuras ?? 0,
        aprendidas: aprendidas ?? 0,
      },
    });
  } catch (error) {
    console.error('GET /api/revisoes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar as revisões' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/revisoes?questao_id=...
 * Tira uma questão do ciclo ("já sei essa, não precisa voltar").
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const questaoId = new URL(req.url).searchParams.get('questao_id');
    if (!questaoId) {
      return NextResponse.json(
        { success: false, error: 'Informe a questão.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    await supabase
      .from('revisoes_agendadas')
      .update({ ativa: false, aprendida_em: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('questao_id', questaoId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/revisoes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao remover da fila' },
      { status: 500 }
    );
  }
}
