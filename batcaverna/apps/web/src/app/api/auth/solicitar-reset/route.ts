import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { aplicarLimite } from '@/lib/seguranca';

// ═══════════════════════════════════════════════════════════════
// POST /api/auth/solicitar-reset — Aluno solicita redefinição de senha
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    // 3 solicitações a cada 30 min
    const bloqueio = aplicarLimite(req, 'solicitar-reset', 3, 1800);
    if (bloqueio) return bloqueio;

    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Faça login para solicitar redefinição de senha' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const motivo = String(body?.motivo ?? '').trim().slice(0, 500);

    const supabase = createServerSupabaseClient();

    // Verificar se já tem solicitação pendente
    const { data: pendente } = await supabase
      .from('solicitacoes_reset_senha')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pendente')
      .limit(1);

    if (pendente && pendente.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Você já tem uma solicitação de redefinição pendente. Aguarde o administrador processar.' },
        { status: 409 }
      );
    }

    // Criar solicitação
    const { error } = await supabase
      .from('solicitacoes_reset_senha')
      .insert({
        user_id: user.id,
        motivo: motivo || null,
        status: 'pendente',
      });

    if (error) {
      console.error('Erro ao criar solicitação de reset:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao criar solicitação. Tente novamente.' },
        { status: 500 }
      );
    }

    // Notificar admins
    try {
      const { data: userInfo } = await supabase
        .from('users')
        .select('nome, apelido, email')
        .eq('id', user.id)
        .single();

      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const nome = userInfo?.nome || userInfo?.apelido || 'Um aluno';
        const notificacoes = admins.map((admin: any) => ({
          user_id: admin.id,
          tipo: 'sistema',
          titulo: '🔑 Solicitação de redefinição de senha',
          mensagem: `${nome} (${userInfo?.email || ''}) solicitou redefinição de senha.${motivo ? ` Motivo: ${motivo}` : ''}`,
          lida: false,
        }));

        await supabase.from('notificacoes').insert(notificacoes);
      }
    } catch (notifErr) {
      console.warn('Erro ao notificar admin sobre reset:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: '✅ Solicitação enviada! O administrador será notificado e processará sua redefinição em breve.',
    });
  } catch (error: any) {
    console.error('Erro em POST /api/auth/solicitar-reset:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
