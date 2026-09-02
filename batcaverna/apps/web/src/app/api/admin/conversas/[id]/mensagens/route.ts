import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
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

    return NextResponse.json({
      success: true,
      data: mensagens || [],
    });
  } catch (error) {
    console.error('GET /api/admin/conversas/[id]/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens para moderação' }, { status: 500 });
  }
}
