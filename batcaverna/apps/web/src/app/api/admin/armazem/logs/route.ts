import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/admin/armazem/logs — Histórico de execuções da varredura
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const supabase = createServerSupabaseClient();

    const { data: logs, error } = await supabase
      .from('importacao_logs')
      .select('*')
      .order('executado_em', { ascending: false })
      .limit(30);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: logs || [],
    });
  } catch (error) {
    console.error('GET /api/admin/armazem/logs error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar logs do armazém' }, { status: 500 });
  }
}
