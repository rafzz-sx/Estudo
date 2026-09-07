import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * POST /api/questoes/[id]/contestar — o aluno diz que a questão está errada.
 * GET  /api/questoes/[id]/contestar — o que ESTE aluno já contestou aqui.
 *
 * As 3.247 questões vieram de extração automática de PDF. A régua de
 * aceitação é boa, mas extração de PDF erra — e gabarito errado é o pior
 * defeito que uma plataforma de estudo pode ter. Questão ausente o aluno não
 * estuda; gabarito errado ele ESTUDA, e aprende errado com a confiança de
 * quem foi conferir a resposta.
 *
 * Quem resolve a questão com atenção e discorda é o melhor detector de erro
 * que existe aqui. Até esta rota, esse sinal era descartado inteiro.
 *
 * Body:
 *   {
 *     tipo?: 'gabarito' | 'enunciado' | 'alternativa' | 'figura' | 'explicacao',
 *     motivo: string,               // >= 15 caracteres
 *     alternativa_sugerida?: 'A'..'E'
 *   }
 *
 * DUAS TRAVAS, e as duas existem por um motivo:
 *
 *   1. só contesta quem RESPONDEU a questão. Sem isso, a fila enche de quem
 *      passou o olho, e o número perde justamente o que o torna útil — ele
 *      precisa significar "gente que resolveu isto e discorda".
 *
 *   2. um aluno, uma contestação por questão (índice único na 017). Sem isso,
 *      quem insiste pesa mais que quem tem razão, e a fila mede teimosia.
 *
 * Contestar NÃO muda o gabarito. Abre um caso para um humano decidir: aluno
 * errar e achar que a prova está errada é o caso comum, não a exceção.
 */

const TIPOS = new Set([
  'gabarito',
  'enunciado',
  'alternativa',
  'figura',
  'explicacao',
]);

/** Curto demais não ajuda ninguém a julgar nada. Espelha o CHECK da 017. */
const MOTIVO_MINIMO = 15;
const MOTIVO_MAXIMO = 1500;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questaoId } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const tipo = TIPOS.has(body?.tipo) ? body.tipo : 'gabarito';
    const motivo = String(body?.motivo ?? '').trim();

    if (motivo.length < MOTIVO_MINIMO) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Explique em pelo menos ${MOTIVO_MINIMO} caracteres o que está ` +
            'errado. Quanto mais preciso, mais rápido a gente confere.',
        },
        { status: 400 }
      );
    }

    const sugerida = String(body?.alternativa_sugerida ?? '')
      .trim()
      .toUpperCase();
    if (sugerida && !/^[A-E]$/.test(sugerida)) {
      return NextResponse.json(
        { success: false, error: 'A alternativa sugerida precisa ser de A a E.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ─── A questão existe? ───────────────────────────────────
    const { data: questao } = await supabase
      .from('questoes')
      .select('id, anulada')
      .eq('id', questaoId)
      .maybeSingle();

    if (!questao) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada' },
        { status: 404 }
      );
    }

    if (questao.anulada) {
      return NextResponse.json(
        {
          success: false,
          error: 'Esta questão já está marcada como anulada pela banca.',
        },
        { status: 409 }
      );
    }

    // ─── Trava 1: respondeu? ─────────────────────────────────
    const { count: respondeu } = await supabase
      .from('user_questao_respostas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('questao_id', questaoId);

    if (!respondeu) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Responda a questão antes de contestar. A fila precisa significar ' +
            '"gente que resolveu isto e discorda".',
        },
        { status: 409 }
      );
    }

    // ─── Trava 2: já contestou? ──────────────────────────────
    const { data: jaTem } = await supabase
      .from('questao_contestacoes')
      .select('id, status, resposta_admin')
      .eq('user_id', user.id)
      .eq('questao_id', questaoId)
      .maybeSingle();

    if (jaTem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Você já contestou esta questão. Ela está na fila.',
          data: { status: jaTem.status, resposta_admin: jaTem.resposta_admin },
        },
        { status: 409 }
      );
    }

    const { data: criada, error } = await supabase
      .from('questao_contestacoes')
      .insert({
        questao_id: questaoId,
        user_id: user.id,
        tipo,
        motivo: motivo.slice(0, MOTIVO_MAXIMO),
        alternativa_sugerida: sugerida || null,
      })
      .select('id, status, criado_em')
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: criada,
      message:
        'Contestação registrada. Se procedente, a questão é corrigida ou ' +
        'anulada e você recebe a resposta aqui mesmo.',
    });
  } catch (error) {
    console.error('POST /api/questoes/[id]/contestar error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar a contestação' },
      { status: 500 }
    );
  }
}

/** O que este aluno já contestou nesta questão — para a tela não oferecer duas vezes. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questaoId } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('questao_contestacoes')
      .select('id, tipo, motivo, alternativa_sugerida, status, resposta_admin, criado_em')
      .eq('user_id', user.id)
      .eq('questao_id', questaoId)
      .maybeSingle();

    return NextResponse.json({ success: true, data: data ?? null });
  } catch (error) {
    console.error('GET /api/questoes/[id]/contestar error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao ler a contestação' },
      { status: 500 }
    );
  }
}
