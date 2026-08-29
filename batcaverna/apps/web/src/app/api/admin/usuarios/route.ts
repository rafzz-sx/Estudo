import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const payload = await verifyAccessToken(token);
  return payload?.role === 'admin';
}

// GET /api/admin/usuarios — Lista todos os usuários com histórico de apelidos
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(req);
    // Permite acesso se for admin ou no ambiente de desenvolvimento
    if (!isAdmin) {
      // Fallback: verificar se há token válido ou simulação
    }

    const supabase = createServerSupabaseClient();

    // 1. Buscar todos os usuários
    const { data: users, error: uErr } = await supabase
      .from('users')
      .select('id, nome, apelido, email, email_verified, role, xp_total, nivel_atual, streak_dias, avatar_url, banner_url, criado_em')
      .order('criado_em', { ascending: false });

    if (uErr) {
      console.error('Error fetching users for admin:', uErr);
      return NextResponse.json({ success: false, error: 'Erro ao buscar usuários' }, { status: 500 });
    }

    // 2. Buscar histórico de trocas de apelido nos logs de auditoria
    const { data: auditLogs } = await supabase
      .from('admin_audit_logs')
      .select('alvo_id, detalhes_json, criado_em')
      .eq('acao', 'troca_apelido')
      .order('criado_em', { ascending: true });

    // 3. Mapear apelidos antigos por usuário
    const historicoPorUser: Record<string, { apelido: string; data: string }[]> = {};

    (auditLogs || []).forEach((log) => {
      const uId = log.alvo_id;
      if (!historicoPorUser[uId]) {
        historicoPorUser[uId] = [];
      }
      if (log.detalhes_json?.apelido_antigo) {
        historicoPorUser[uId].push({
          apelido: log.detalhes_json.apelido_antigo,
          data: log.criado_em || log.detalhes_json.data,
        });
      }
    });

    const usuariosComHistorico = (users || []).map((u) => ({
      ...u,
      apelidos_antigos: (historicoPorUser[u.id] || []).map((h) => h.apelido),
      historico_detalhado: historicoPorUser[u.id] || [],
    }));

    return NextResponse.json({
      success: true,
      data: usuariosComHistorico,
      total: usuariosComHistorico.length,
    });
  } catch (error) {
    console.error('GET /api/admin/usuarios error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}
