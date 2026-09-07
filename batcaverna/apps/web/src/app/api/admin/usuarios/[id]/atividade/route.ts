import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
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
      // Era `alternativa_correta`, coluna do schema 1.x que não existe mais:
      // o PostgREST recusava a consulta inteira e a aba de atividade do
      // usuário voltava vazia no painel.
      .select('*, questoes (enunciado, resposta_correta, banca, ano)')
      .eq('user_id', id)
      // Mesmo caso do `alternativa_correta` acima, e no mesmo arquivo: a
      // coluna é `respondido_em`. Com o nome errado no ORDER, o PostgREST
      // recusa a consulta e a aba de atividade continuava vazia mesmo depois
      // da correção do select.
      .order('respondido_em', { ascending: false })
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
