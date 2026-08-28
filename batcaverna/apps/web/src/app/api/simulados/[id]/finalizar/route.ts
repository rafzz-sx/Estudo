import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// POST /api/simulados/[id]/finalizar
// Body: { respostas: Record<string, string> } (mapa questao_id -> letra_escolhida)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: simuladoId } = await params;
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { respostas = {} } = body;

    const supabase = createServerSupabaseClient();

    // 1. Buscar simulado
    const { data: simulado, error: sErr } = await supabase
      .from('simulados')
      .select('*')
      .eq('id', simuladoId)
      .eq('user_id', userId)
      .single();

    if (sErr || !simulado) {
      return NextResponse.json({ success: false, error: 'Simulado não encontrado' }, { status: 404 });
    }

    if (simulado.finalizado_em) {
      return NextResponse.json({ success: false, error: 'Este simulado já foi finalizado.' }, { status: 400 });
    }

    // 2. Buscar gabarito oficial das questões do simulado
    const { data: gabarito, error: gErr } = await supabase
      .from('questoes')
      .select('id, resposta_correta, explicacao')
      .in('id', simulado.questoes_ids);

    if (gErr || !gabarito) {
      return NextResponse.json({ success: false, error: 'Erro ao validar gabarito' }, { status: 500 });
    }

    // 3. Corrigir e calcular acertos
    let acertos = 0;
    const detalhesGabarito = gabarito.map((q) => {
      const respDada = (respostas[q.id] || '').trim().toUpperCase();
      const correta = respDada === q.resposta_correta.trim().toUpperCase();
      if (correta) acertos++;

      return {
        questao_id: q.id,
        resposta_dada: respDada,
        resposta_correta: q.resposta_correta,
        correta,
        explicacao: q.explicacao,
      };
    });

    const total = simulado.total_questoes;
    const pontuacao = total > 0 ? Number(((acertos / total) * 100).toFixed(1)) : 0;
    const xpGanho = acertos * 20 + 50; // 20 XP por acerto + 50 XP bônus por finalizar simulado

    // 4. Salvar resultado
    await supabase
      .from('simulados')
      .update({
        acertos,
        pontuacao,
        finalizado_em: new Date().toISOString(),
      })
      .eq('id', simuladoId);

    // 5. Atualizar XP do usuário
    const { data: user } = await supabase
      .from('users')
      .select('xp_total')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({
          xp_total: (user.xp_total || 0) + xpGanho,
        })
        .eq('id', userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        simulado_id: simuladoId,
        total_questoes: total,
        acertos,
        pontuacao,
        xp_ganho: xpGanho,
        detalhes: detalhesGabarito,
      },
    });
  } catch (error) {
    console.error('POST /api/simulados/[id]/finalizar error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao finalizar simulado' }, { status: 500 });
  }
}
