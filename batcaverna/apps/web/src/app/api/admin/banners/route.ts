import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/**
 * GET /api/admin/banners
 * Lista os banners e imagens de fundo dos concursos para gestão administrativa.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('concursos')
      .select('id, sigla, nome, forca, imagem_fundo_url, frase_curta_card, cor_tema, emoji')
      .order('sigla', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao carregar banners.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/banners
 * Atualiza o banner / imagem de fundo ou frase de um concurso.
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = uuidOuNulo(body.id);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID do concurso inválido.' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (typeof body.imagem_fundo_url === 'string') {
      updates.imagem_fundo_url = body.imagem_fundo_url.trim() || null;
    }
    if (typeof body.frase_curta_card === 'string') {
      updates.frase_curta_card = body.frase_curta_card.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum campo válido para atualização.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('concursos')
      .update(updates)
      .eq('id', id)
      .select('id, sigla, nome, forca, imagem_fundo_url, frase_curta_card, cor_tema, emoji')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Auditoria
    try {
      await supabase.from('admin_audit_log').insert({
        admin_id: admin.id,
        acao: 'atualizar_banner_concurso',
        entidade_afetada: 'concursos',
        entidade_id: id,
        detalhes: {
          concurso_sigla: data?.sigla,
          imagem_fundo_url: updates.imagem_fundo_url,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data,
      mensagem: `Banner de ${data?.sigla} atualizado com sucesso!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao atualizar banner.' },
      { status: 500 }
    );
  }
}

