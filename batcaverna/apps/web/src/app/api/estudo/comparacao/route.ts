import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { compararComTurma } from '@/lib/comparacao-turma';

/**
 * GET /api/estudo/comparacao?concurso=EEAR
 *
 * Como o aluno está em relação a quem resolveu muito da mesma matéria, no
 * mesmo concurso. Só médias de grupo, nunca nomes — ver `comparacao-turma.ts`.
 *
 * Rota separada do painel de propósito: o painel responde "o que eu faço
 * agora" e precisa ser rápido; isto é contexto de acompanhamento, vive na
 * tela de progresso e pode custar um pouco mais.
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

    const sigla = new URL(req.url).searchParams.get('concurso');
    const supabase = createServerSupabaseClient();

    let concurso: { id: string; sigla: string } | null = null;

    if (sigla && sigla.toLowerCase() !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id, sigla')
        .ilike('sigla', sigla)
        .maybeSingle();
      concurso = data;
    }

    if (!concurso) {
      const { data: fav } = await supabase
        .from('user_concurso_favoritos')
        .select('concursos (id, sigla)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      concurso = (fav as any)?.concursos ?? null;
    }

    if (!concurso) {
      return NextResponse.json({
        success: true,
        data: { concurso: null, materias: [] },
      });
    }

    const materias = await compararComTurma(supabase, user.id, concurso.id);

    return NextResponse.json({
      success: true,
      data: { concurso, materias },
    });
  } catch (error) {
    console.error('GET /api/estudo/comparacao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao montar a comparação' },
      { status: 500 }
    );
  }
}
