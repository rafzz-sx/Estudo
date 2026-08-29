import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload?.sub || null;
}

// GET /api/usuarios/me — Retorna perfil completo do usuário autenticado
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();

    // 1. Dados do usuário
    const { data: user, error: uErr } = await supabase
      .from('users')
      .select(`
        id, nome, apelido, email, email_verified,
        avatar_url, banner_url, banner_tipo, bio,
        data_nascimento, role, xp_total, nivel_atual,
        maior_combo_pessoal, streak_dias, ultimo_dia_estudado, criado_em,
        user_concurso_favoritos (concursos (id, sigla, nome, icone_url, brasao_url)),
        user_categoria_escrita (texto),
        user_badges (badges (id, nome, descricao, icone))
      `)
      .eq('id', userId)
      .single();

    if (uErr || !user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 2. Calcular nível exato e progresso de XP
    const nivelCalculado = calcularNivel(user.xp_total || 0);

    // 3. Buscar tempo total de estudo
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('duracao_segundos')
      .eq('user_id', userId);

    const tempoTotalEstudo = (sessions || []).reduce((acc, s) => acc + (s.duracao_segundos || 0), 0);

    // 4. Buscar total de respostas e precisão
    const { data: respostas } = await supabase
      .from('user_questao_respostas')
      .select('correta')
      .eq('user_id', userId);

    const totalQuestoes = (respostas || []).length;
    const acertos = (respostas || []).filter(r => r.correta).length;
    const taxaAcerto = totalQuestoes > 0 ? Number(((acertos / totalQuestoes) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        nivel_info: nivelCalculado,
        tempo_total_estudo: tempoTotalEstudo,
        questoes_respondidas: totalQuestoes,
        taxa_acerto: taxaAcerto,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/me error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

// PATCH /api/usuarios/me — Atualiza dados do perfil (apelido, nome, bio, banner, avatar)
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json();
    const { nome, apelido, bio, banner_url, banner_tipo, avatar_url } = body;

    const supabase = createServerSupabaseClient();

    // 1. Buscar dados atuais do usuário
    const { data: currentUser, error: getErr } = await supabase
      .from('users')
      .select('id, nome, apelido, email')
      .eq('id', userId)
      .single();

    if (getErr || !currentUser) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    const updates: Record<string, any> = {};
    if (nome !== undefined) updates.nome = nome.trim();
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (banner_url !== undefined) updates.banner_url = banner_url;
    if (banner_tipo !== undefined) updates.banner_tipo = banner_tipo;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    // 2. Se for trocar o apelido:
    if (apelido && apelido.trim() !== currentUser.apelido) {
      const novoApelido = apelido.trim();
      if (novoApelido.length < 3 || novoApelido.length > 20) {
        return NextResponse.json({ success: false, error: 'Apelido deve ter entre 3 e 20 caracteres' }, { status: 400 });
      }

      // Verificar se já existe outro usuário com esse apelido
      const { data: exist } = await supabase
        .from('users')
        .select('id')
        .eq('apelido', novoApelido)
        .neq('id', userId)
        .single();

      if (exist) {
        return NextResponse.json({ success: false, error: 'Este apelido já está em uso por outro aluno' }, { status: 409 });
      }

      updates.apelido = novoApelido;

      // Registrar no log de auditoria o apelido antigo para histórico do admin
      await supabase.from('admin_audit_logs').insert({
        admin_id: userId,
        alvo_tipo: 'user',
        alvo_id: userId,
        acao: 'troca_apelido',
        detalhes_json: {
          apelido_antigo: currentUser.apelido,
          apelido_novo: novoApelido,
          data: new Date().toISOString(),
        },
      });
    }

    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, nome, apelido, email, bio, avatar_url, banner_url, banner_tipo, role, xp_total, nivel_atual')
      .single();

    if (updateErr) {
      console.error('Error updating user profile:', updateErr);
      return NextResponse.json({ success: false, error: 'Erro ao atualizar perfil' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Perfil atualizado com sucesso!',
    });
  } catch (error) {
    console.error('PATCH /api/usuarios/me error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao salvar perfil' }, { status: 500 });
  }
}
