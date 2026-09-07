import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { REFERENCIA_APROVACAO } from '@/lib/distribuicao-prova';

/**
 * GET /api/simulados/historico?concurso=EEAR
 *
 * A tabela `simulados` guarda cada prova feita desde sempre e NADA na
 * plataforma mostrava a série. O resultado de hoje, sozinho, num dia ruim só
 * machuca; "sua nota subiu de 42 para 61 em três meses" é o que sustenta um
 * ano de preparação.
 *
 * Devolve também a comparação com a nota de corte — o único número que o
 * candidato realmente quer saber.
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
    const sigla = searchParams.get('concurso');
    const supabase = createServerSupabaseClient();

    let concursoId: string | null = null;
    if (sigla && sigla.toLowerCase() !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', sigla)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({
          success: true,
          data: { provas: [], resumo: null },
        });
      }
      concursoId = data.id;
    }

    let query = supabase
      .from('simulados')
      .select(
        `id, tipo, total_questoes, acertos, pontuacao, duracao_minutos,
         tempo_gasto_segundos, iniciado_em, finalizado_em,
         concursos (sigla, emoji, cor_tema)`
      )
      .eq('user_id', user.id)
      .not('finalizado_em', 'is', null)
      // Prova iniciada e nunca entregue não é resultado, é uma aba fechada.
      .or('abandonado.is.null,abandonado.eq.false')
      .order('finalizado_em', { ascending: false })
      .limit(60);

    if (concursoId) query = query.eq('concurso_id', concursoId);

    const { data, error } = await query;
    if (error) throw error;

    const provas = (data ?? []).map((s: any) => {
      const taxa =
        s.total_questoes > 0
          ? Math.round((s.acertos / s.total_questoes) * 100)
          : 0;
      const ref = REFERENCIA_APROVACAO[s.concursos?.sigla?.toUpperCase() ?? ''];

      return {
        id: s.id,
        tipo: s.tipo,
        sigla: s.concursos?.sigla ?? null,
        emoji: s.concursos?.emoji ?? null,
        cor: s.concursos?.cor_tema ?? null,
        total_questoes: s.total_questoes,
        acertos: s.acertos,
        taxa,
        tempo_gasto_segundos: s.tempo_gasto_segundos,
        finalizado_em: s.finalizado_em,
        referencia: ref?.percentual ?? null,
        referencia_nota: ref?.nota ?? null,
        // `null` quando não há referência para o concurso — melhor não
        // responder do que responder errado sobre aprovação.
        passaria: ref ? taxa >= ref.percentual : null,
      };
    });

    // Ordem cronológica para o gráfico; a lista fica ao contrário na tela.
    const cronologico = [...provas].reverse();

    const resumo =
      provas.length > 0
        ? {
            total: provas.length,
            melhor: Math.max(...provas.map((p) => p.taxa)),
            media: Math.round(
              provas.reduce((a, p) => a + p.taxa, 0) / provas.length
            ),
            ultima: provas[0].taxa,
            primeira: cronologico[0].taxa,
            evolucao: provas[0].taxa - cronologico[0].taxa,
            // Só conta como "passaria" o que tem referência cadastrada.
            aprovacoes: provas.filter((p) => p.passaria === true).length,
            com_referencia: provas.filter((p) => p.passaria !== null).length,
          }
        : null;

    return NextResponse.json({
      success: true,
      data: { provas, cronologico, resumo },
    });
  } catch (error) {
    console.error('GET /api/simulados/historico error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar seu histórico de simulados' },
      { status: 500 }
    );
  }
}
