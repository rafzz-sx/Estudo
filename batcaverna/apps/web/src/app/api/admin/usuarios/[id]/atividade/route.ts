import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/admin/usuarios/[id]/atividade — Linha do tempo de atividades de um usuário específico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // 1. Sessões de estudo recentes
    const { data: sessoes } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', id)
      .order('iniciada_em', { ascending: false })
      .limit(10);

    // 2. Respostas de questões recentes
    const { data: respostas } = await supabase
      .from('user_questao_respostas')
      .select('*, questoes (enunciado, alternativa_correta, banca, ano)')
      .eq('user_id', id)
      .order('respondida_em', { ascending: false })
      .limit(10);

    // 3. Simulados realizados
    const { data: simulados } = await supabase
      .from('simulados')
      .select('*')
      .eq('user_id', id)
      .order('iniciado_em', { ascending: false })
      .limit(5);

    // 4. Tickets criados pelo usuário
    const { data: tickets } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', id)
      .order('criado_em', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        sessoes_estudo: sessoes || [],
        ultimas_questoes: respostas || [],
        simulados: simulados || [],
        tickets: tickets || [],
      },
    });
  } catch (error) {
    console.error('GET /api/admin/usuarios/[id]/atividade error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar linha do tempo do usuário' }, { status: 500 });
  }
}
