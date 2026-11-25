import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { lerTudo } from '@/lib/contagens';

/**
 * GET /api/admin/questoes/mapa-calor
 * Retorna matriz de estoque de questões ativas agrupada por Concurso × Matéria
 * para que o administrador identifique lacunas críticas com 1 olhar.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    const [{ data: concursos }, { data: materias }, questoes] = await Promise.all([
      supabase
        .from('concursos')
        .select('id, sigla, nome, emoji, ordem_exibicao')
        .order('ordem_exibicao', { ascending: true })
        .order('sigla', { ascending: true }),
      supabase
        .from('materias')
        .select('id, nome, icone_emoji')
        .order('nome', { ascending: true }),
      lerTudo<{ concurso_id: string | null; materia_id: string | null }>(() =>
        supabase
          .from('questoes')
          .select('concurso_id, materia_id')
          .eq('ativa', true)
      ),
    ]);

    const matriz = new Map<string, number>();
    const totalConcurso = new Map<string, number>();
    const totalMateria = new Map<string, number>();

    for (const q of questoes) {
      if (!q.concurso_id || !q.materia_id) continue;
      const chave = `${q.concurso_id}:${q.materia_id}`;
      matriz.set(chave, (matriz.get(chave) ?? 0) + 1);
      totalConcurso.set(q.concurso_id, (totalConcurso.get(q.concurso_id) ?? 0) + 1);
      totalMateria.set(q.materia_id, (totalMateria.get(q.materia_id) ?? 0) + 1);
    }

    const materiasAtivas = (materias ?? []).filter((m) => (totalMateria.get(m.id) ?? 0) > 0);
    const linhas = (concursos ?? []).map((c) => {
      const celulas: Record<string, number> = {};
      for (const m of materiasAtivas) {
        celulas[m.id] = matriz.get(`${c.id}:${m.id}`) ?? 0;
      }
      return {
        concurso_id: c.id,
        sigla: c.sigla,
        nome: c.nome,
        emoji: c.emoji,
        total: totalConcurso.get(c.id) ?? 0,
        celulas,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        materias: materiasAtivas,
        linhas,
        total_geral: questoes.length,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/questoes/mapa-calor error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar mapa de calor do estoque' },
      { status: 500 }
    );
  }
}
