import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/admin/auditoria — Lista logs de auditoria de ações administrativas
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const supabase = createServerSupabaseClient();

    const { data: logs, error } = await supabase
      .from('admin_audit_log')
      .select('*, admin:users!admin_id (id, nome, apelido, email)')
      .order('criado_em', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: logs || [],
    });
  } catch (error) {
    console.error('GET /api/admin/auditoria error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar logs de auditoria' }, { status: 500 });
  }
}

// POST /api/admin/auditoria — Registrar uma ação administrativa no log de auditoria
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const body = await req.json();
    const { acao, entidade_afetada, entidade_id, detalhes } = body;

    if (!acao) {
      return NextResponse.json({ success: false, error: 'Ação obrigatória' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: admin.id,
        acao,
        entidade_afetada: entidade_afetada || null,
        entidade_id: entidade_id || null,
        detalhes: detalhes || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/auditoria error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao registrar log de auditoria' }, { status: 500 });
  }
}
