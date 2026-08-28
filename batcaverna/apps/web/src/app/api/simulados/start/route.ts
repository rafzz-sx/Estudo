import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/simulados/start
// Body: { concurso_id: string, quantidade?: number }
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { concurso_id, quantidade = 20 } = body;

    const supabase = createServerSupabaseClient();

    // 1. Buscar questões aleatórias para o simulado
    let query = supabase.from('questoes').select('id');
    if (concurso_id && concurso_id !== 'todos') {
      query = query.eq('concurso_id', concurso_id);
    }

    const { data: questoesDisponiveis, error: qErr } = await query.limit(100);

    if (qErr || !questoesDisponiveis || questoesDisponiveis.length === 0) {
      return NextResponse.json({ success: false, error: 'Não há questões suficientes cadastradas para este concurso.' }, { status: 400 });
    }

    // Embaralhar e selecionar X questões
    const questoesIds = questoesDisponiveis
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(quantidade, questoesDisponiveis.length))
      .map(q => q.id);

    // 2. Criar registro do simulado
    const { data: simulado, error: sErr } = await supabase
      .from('simulados')
      .insert({
        user_id: userId,
        concurso_id: (concurso_id && concurso_id !== 'todos') ? concurso_id : null,
        questoes_ids: questoesIds,
        total_questoes: questoesIds.length,
        iniciado_em: new Date().toISOString(),
      })
      .select('id, total_questoes, iniciado_em')
      .single();

    if (sErr) throw sErr;

    // 3. Buscar detalhes completos das questões selecionadas (sem resposta correta para não vazar no client)
    const { data: questoesDetalhadas } = await supabase
      .from('questoes')
      .select(`
        id,
        enunciado,
        alternativas,
        ano,
        banca,
        dificuldade,
        materias (nome),
        assuntos (nome)
      `)
      .in('id', questoesIds);

    return NextResponse.json({
      success: true,
      data: {
        simulado_id: simulado.id,
        total_questoes: simulado.total_questoes,
        iniciado_em: simulado.iniciado_em,
        questoes: questoesDetalhadas || [],
      },
    });
  } catch (error) {
    console.error('POST /api/simulados/start error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar simulado' }, { status: 500 });
  }
}
