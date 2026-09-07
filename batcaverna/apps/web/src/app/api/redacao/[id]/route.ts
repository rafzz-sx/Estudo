import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';

/**
 * GET /api/redacao/[id] — uma redação com o texto inteiro.
 *
 * A listagem em `/api/redacao` NÃO traz o campo `texto`: são até 20.000
 * caracteres por redação, e carregar 50 delas só para desenhar a lista seria
 * o mesmo erro do banner em base64 no `/api/usuarios/me`.
 *
 * Redação é texto pessoal: a consulta amarra ao dono. Nem o admin lê daqui —
 * se um dia for preciso, isso vira uma rota de admin, explícita e auditada.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const redacaoId = uuidOuNulo(id);
    if (!redacaoId) {
      return NextResponse.json(
        { success: false, error: 'Redação não encontrada' },
        { status: 404 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('redacoes')
      .select(
        'id, tema_id, tema_titulo, texto, palavras, linhas, tempo_segundos, c1, c2, c3, c4, c5, nota_total, avaliada_em, anotacoes, criado_em'
      )
      .eq('id', redacaoId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Redação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('GET /api/redacao/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar a redação' },
      { status: 500 }
    );
  }
}

/** DELETE /api/redacao/[id] — o aluno apaga a própria redação. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const redacaoId = uuidOuNulo(id);
    if (!redacaoId) {
      return NextResponse.json(
        { success: false, error: 'Redação não encontrada' },
        { status: 404 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('redacoes')
      .delete()
      .eq('id', redacaoId)
      .eq('user_id', user.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Redação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id: data.id } });
  } catch (error) {
    console.error('DELETE /api/redacao/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao apagar a redação' },
      { status: 500 }
    );
  }
}
