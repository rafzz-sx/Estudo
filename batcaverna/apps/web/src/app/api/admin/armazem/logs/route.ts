import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
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
