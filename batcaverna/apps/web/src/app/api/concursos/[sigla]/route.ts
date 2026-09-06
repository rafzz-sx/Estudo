import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { anosDisponiveis, contarPorId, contarQuestoes } from '@/lib/contagens';

/**
 * GET /api/concursos/[sigla]
 *
 * Tudo que a página do concurso precisa numa chamada só: metadados do
 * edital, matérias com contagem de questões, TAF (quando militar) e o
 * progresso pessoal de quem está olhando.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sigla: string }> }
) {
  try {
    const { sigla } = await params;
    const supabase = createServerSupabaseClient();

    const { data: concurso, error } = await supabase
      .from('concursos')
      .select(
        `id, nome, sigla, descricao, nivel_ensino, forca, emoji, cor_tema,
         tem_taf, orgao, escolaridade, faixa_etaria, duracao_curso,
         etapas, requisitos, edital_ano, edital_url, frase_curta_card,
         imagem_fundo_url, brasao_url`
      )
      .ilike('sigla', sigla)
      .maybeSingle();

    if (error || !concurso) {
      return NextResponse.json(
        { success: false, error: 'Concurso não encontrado' },
        { status: 404 }
      );
    }

    // ─── Matérias com contagem real de questões ──────────────
    const { data: vinculos } = await supabase
      .from('concurso_materias')
      .select('peso_na_prova, materias (id, nome, descricao, icone_emoji)')
      .eq('concurso_id', concurso.id);

    const idsMaterias = (vinculos ?? [])
      .map((v: any) => v.materias?.id)
      .filter(Boolean);

    const porMateria = await contarPorId(supabase, 'materia_id', idsMaterias, {
      concurso_id: concurso.id,
    });

    const materias = (vinculos ?? [])
      .map((v: any) => ({
        id: v.materias?.id,
        nome: v.materias?.nome,
        descricao: v.materias?.descricao,
        icone_emoji: v.materias?.icone_emoji,
        peso_na_prova: v.peso_na_prova,
        total_questoes: porMateria[v.materias?.id] ?? 0,
      }))
      .filter((m) => m.id)
      .sort((a, b) => b.total_questoes - a.total_questoes);

    const anos = await anosDisponiveis(supabase, concurso.id);
    const totalQuestoes = await contarQuestoes(supabase, {
      concurso_id: concurso.id,
    });

    // ─── TAF ─────────────────────────────────────────────────
    const { data: taf } = await supabase
      .from('taf_provas')
      .select('sexo, exercicio, unidade, minimo_aprovacao, faixa_etaria, observacao, ordem, ano_edital')
      .eq('concurso_id', concurso.id)
      .order('sexo')
      .order('ordem');

    // ─── Progresso de quem está vendo ────────────────────────
    let progresso: {
      respondidas: number;
      acertos: number;
      taxa: number;
      favoritado: boolean;
    } | null = null;

    const user = await getAuthUserFromRequest(req);
    if (user) {
      const { data: stats } = await supabase
        .from('user_materia_stats')
        .select('questoes_respondidas, acertos')
        .eq('user_id', user.id)
        .eq('concurso_id', concurso.id);

      const respondidas = (stats ?? []).reduce(
        (a, s) => a + (s.questoes_respondidas ?? 0),
        0
      );
      const acertos = (stats ?? []).reduce((a, s) => a + (s.acertos ?? 0), 0);

      const { data: fav } = await supabase
        .from('user_concurso_favoritos')
        .select('concurso_id')
        .eq('user_id', user.id)
        .eq('concurso_id', concurso.id)
        .maybeSingle();

      progresso = {
        respondidas,
        acertos,
        taxa: respondidas ? Number(((acertos / respondidas) * 100).toFixed(1)) : 0,
        favoritado: !!fav,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        ...concurso,
        materias,
        anos,
        total_questoes: totalQuestoes,
        taf: taf ?? [],
        progresso,
      },
    });
  } catch (error) {
    console.error('GET /api/concursos/[sigla] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar o concurso' },
      { status: 500 }
    );
  }
}
