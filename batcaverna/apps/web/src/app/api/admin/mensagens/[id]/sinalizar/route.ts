import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

// PUT /api/admin/mensagens/[id]/sinalizar — Alternar flag de sinalização/moderação
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const { id } = await params;
    const { sinalizada } = await req.json();

    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('mensagem_chat')
      .update({ sinalizada_para_revisao: !!sinalizada })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: sinalizada ? 'Mensagem sinalizada para revisão.' : 'Sinalização removida.',
    });
  } catch (error) {
    console.error('PUT /api/admin/mensagens/[id]/sinalizar error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao sinalizar mensagem' }, { status: 500 });
  }
}
