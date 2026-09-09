import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/questoes/do-dia
 *
 * Sorteia uma questão do dia. O sorteio é determinístico por (dia, usuário):
 * a mesma pessoa vê a mesma questão o dia inteiro, e pessoas diferentes veem
 * questões diferentes. Prioriza os concursos que o aluno marcou como alvo.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const user = await getAuthUserFromRequest(req);

    // Restringe aos concursos favoritos, se houver algum.
    let concursoIds: string[] = [];
    if (user) {
      const { data } = await supabase
        .from('user_concurso_favoritos')
        .select('concurso_id')
        .eq('user_id', user.id);
      concursoIds = (data ?? []).map((f) => f.concurso_id);
    }

    let contagem = supabase
      .from('questoes')
      .select('id', { count: 'exact', head: true });
    if (concursoIds.length) contagem = contagem.in('concurso_id', concursoIds);

    const { count } = await contagem;
    if (!count) {
      return NextResponse.json({ success: true, data: null });
    }

    // Semente estável: muda a cada dia e a cada usuário.
    const hoje = new Date().toISOString().slice(0, 10);
    const semente = [...`${hoje}|${user?.id ?? 'anonimo'}`].reduce(
      (acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 2_147_483_647,
      7
    );
    const offset = semente % count;

    let query = supabase
      .from('questoes')
      .select(
        `id, enunciado, ano,
         concursos (sigla), materias (nome), assuntos (nome)`
      )
      // Sem ORDER BY, o Postgres não garante ordem estável entre execuções —
      // ela muda com atualização, VACUUM ou plano diferente. O `offset` abaixo
      // é determinístico, mas caía numa linha diferente ao longo do dia, e a
      // promessa de "a mesma questão o dia inteiro" não se sustentava.
      .order('id', { ascending: true });

    if (concursoIds.length) query = query.in('concurso_id', concursoIds);

    const { data } = await query.range(offset, offset).limit(1);

    return NextResponse.json({ success: true, data: data?.[0] ?? null });
  } catch (error) {
    console.error('GET /api/questoes/do-dia error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao sortear a questão do dia' },
      { status: 500 }
    );
  }
}
