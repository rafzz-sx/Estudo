import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { decriptarTexto } from '@/lib/cripto';

async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

// GET /api/admin/conversas/[id]/mensagens — Ver mensagens de uma conversa para moderação
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data: mensagens, error } = await supabase
      .from('mensagem_chat')
      .select('*, autor:users!autor_id (id, nome, apelido, email)')
      .eq('conversa_id', id)
      .order('enviado_em', { ascending: true });

    if (error) throw error;

    const formatadas = await Promise.all(
      (mensagens || []).map(async (m: any) => ({
        ...m,
        conteudo_texto: await decriptarTexto(m.conteudo_texto),
      }))
    );

    return NextResponse.json({
      success: true,
      data: formatadas,
    });
  } catch (error) {
    console.error('GET /api/admin/conversas/[id]/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens para moderação' }, { status: 500 });
  }
}
