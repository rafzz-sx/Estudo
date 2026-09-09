import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest, hashSenha } from '@/lib/auth';
import { aplicarLimite } from '@/lib/seguranca';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// GET  /api/admin/reset-senha — Lista solicitações pendentes
// POST /api/admin/reset-senha — Admin redefine senha de um aluno
// ═══════════════════════════════════════════════════════════════

async function verificarAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  if (!user) return null;

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!data || data.role !== 'admin') return null;
  return data;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await verificarAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado: administrador obrigatório' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: solicitacoes, error } = await supabase
      .from('solicitacoes_reset_senha')
      .select(`
        id,
        motivo,
        status,
        criado_em,
        resolvida_em,
        users!solicitacoes_reset_senha_user_id_fkey (
          id,
          nome,
          apelido,
          email
        )
      `)
      .order('criado_em', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erro ao buscar solicitações de reset:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar solicitações' },
        { status: 500 }
      );
    }

    const formatadas = (solicitacoes || []).map((s: any) => ({
      id: s.id,
      motivo: s.motivo,
      status: s.status,
      criado_em: s.criado_em,
      resolvida_em: s.resolvida_em,
      user_nome: s.users?.nome || 'Desconhecido',
      user_apelido: s.users?.apelido || '',
      user_email: s.users?.email || '',
      user_id: s.users?.id || '',
    }));

    return NextResponse.json({ success: true, data: formatadas });
  } catch (error: any) {
    console.error('Erro em GET /api/admin/reset-senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const bloqueio = aplicarLimite(req, 'admin-reset', 20, 300);
    if (bloqueio) return bloqueio;

    const admin = await verificarAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado: administrador obrigatório' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { solicitacao_id, user_id } = body;

    if (!solicitacao_id && !user_id) {
      return NextResponse.json(
        { success: false, error: 'ID da solicitação ou do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Determinar o user_id alvo
    let targetUserId = user_id;
    if (solicitacao_id && !user_id) {
      const { data: sol } = await supabase
        .from('solicitacoes_reset_senha')
        .select('user_id')
        .eq('id', solicitacao_id)
        .single();

      if (!sol) {
        return NextResponse.json(
          { success: false, error: 'Solicitação não encontrada' },
          { status: 404 }
        );
      }
      targetUserId = sol.user_id;
    }

    // Gerar senha temporária segura (8 caracteres legíveis)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
    let senhaTemporaria = '';
    const randomBytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      senhaTemporaria += chars[randomBytes[i] % chars.length];
    }

    // Hash PBKDF2 da nova senha
    const novoHash = await hashSenha(senhaTemporaria);

    // Atualizar senha do usuário
    const { error: updateErr } = await supabase
      .from('users')
      .update({ senha_hash: novoHash })
      .eq('id', targetUserId);

    if (updateErr) {
      console.error('Erro ao atualizar senha:', updateErr);
      return NextResponse.json(
        { success: false, error: 'Erro ao redefinir a senha' },
        { status: 500 }
      );
    }

    // Marcar solicitação como resolvida (se houver)
    if (solicitacao_id) {
      await supabase
        .from('solicitacoes_reset_senha')
        .update({
          status: 'resolvida',
          resolvida_por: admin.id,
          resolvida_em: new Date().toISOString(),
        })
        .eq('id', solicitacao_id);
    }

    // Buscar info do usuário para exibir ao admin
    const { data: userInfo } = await supabase
      .from('users')
      .select('nome, apelido, email')
      .eq('id', targetUserId)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        senha_temporaria: senhaTemporaria,
        user_nome: userInfo?.nome || '',
        user_email: userInfo?.email || '',
      },
      message: `✅ Senha redefinida! Envie a senha temporária para o aluno: ${senhaTemporaria}`,
    });
  } catch (error: any) {
    console.error('Erro em POST /api/admin/reset-senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
