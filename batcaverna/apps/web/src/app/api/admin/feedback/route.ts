import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/** GET /api/admin/feedback — feedbacks enviados pelos alunos. */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('feedback_plataforma')
      .select('*, users (apelido, avatar_url, nivel_atual)')
      .order('criado_em', { ascending: false })
      .limit(200);

    if (tipo && tipo !== 'todos') query = query.eq('tipo', tipo);

    const { data, error } = await query;
    if (error) throw error;

    const notas = (data ?? []).map((f) => f.nota).filter(Boolean) as number[];
    const media = notas.length
      ? Number((notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2))
      : null;

    return NextResponse.json({
      success: true,
      data: {
        itens: data ?? [],
        resumo: {
          total: (data ?? []).length,
          nao_lidos: (data ?? []).filter((f) => !f.lido_por_admin).length,
          nota_media: media,
          por_tipo: {
            opiniao: (data ?? []).filter((f) => f.tipo === 'opiniao').length,
            bug: (data ?? []).filter((f) => f.tipo === 'bug').length,
            ideia: (data ?? []).filter((f) => f.tipo === 'ideia').length,
          },
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar feedbacks' },
      { status: 500 }
    );
  }
}

/** PATCH /api/admin/feedback — marca feedbacks como lidos. */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const supabase = createServerSupabaseClient();

    if (body?.todos) {
      await supabase
        .from('feedback_plataforma')
        .update({ lido_por_admin: true })
        .eq('lido_por_admin', false);
    } else if (body?.id) {
      await supabase
        .from('feedback_plataforma')
        .update({ lido_por_admin: true })
        .eq('id', body.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/admin/feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao marcar feedback' },
      { status: 500 }
    );
  }
}
