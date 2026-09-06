import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import {
  validarDataUrlMidia,
  limparTexto,
  MAX_AVATAR_BYTES,
  MAX_BANNER_BYTES,
} from '@/lib/seguranca';
import { calcularNivel } from '@batcaverna/utils';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
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
        maior_combo_pessoal, combo_atual, combo_atualizado_em,
        streak_dias, maior_streak, ultimo_dia_estudado, criado_em,
        total_questoes_respondidas, total_acertos,
        tempo_estudo_total_segundos, ultimo_login_em, sessao_expira_em
      `)
      .eq('id', userId)
      .single();

    if (uErr || !user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    // 2. Calcular nível exato e progresso de XP
    const nivelCalculado = calcularNivel(user.xp_total || 0);

    // 3. Tempo total de estudo
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('duracao_segundos')
      .eq('user_id', userId);

    const tempoTotalEstudo = (sessions || []).reduce(
      (acc, s) => acc + (s.duracao_segundos || 0),
      0
    );

    // 4. Questões e precisão — usa os contadores persistidos (migration 004)
    //    e só varre a tabela de respostas se eles ainda não existirem.
    let totalQuestoes = user.total_questoes_respondidas ?? 0;
    let acertos = user.total_acertos ?? 0;

    if (totalQuestoes === 0) {
      const { count } = await supabase
        .from('user_questao_respostas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count && count > 0) {
        const { count: countAcertos } = await supabase
          .from('user_questao_respostas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('correta', true);

        totalQuestoes = count;
        acertos = countAcertos ?? 0;

        // Reconcilia o contador para as próximas leituras saírem diretas.
        await supabase
          .from('users')
          .update({
            total_questoes_respondidas: totalQuestoes,
            total_acertos: acertos,
          })
          .eq('id', userId);
      }
    }

    const taxaAcerto =
      totalQuestoes > 0
        ? Number(((acertos / totalQuestoes) * 100).toFixed(1))
        : 0;

    // 5. Matéria mais estudada — alimenta o mini-perfil
    const { data: statsMateria } = await supabase
      .from('user_materia_stats')
      .select('questoes_respondidas, acertos, materias (nome, icone_emoji)')
      .eq('user_id', userId)
      .order('questoes_respondidas', { ascending: false })
      .limit(1);

    const materiaTop = statsMateria?.[0]
      ? {
          nome: (statsMateria[0] as any).materias?.nome ?? null,
          emoji: (statsMateria[0] as any).materias?.icone_emoji ?? null,
          questoes: statsMateria[0].questoes_respondidas,
        }
      : null;

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        nivel_info: nivelCalculado,
        tempo_total_estudo: tempoTotalEstudo,
        questoes_respondidas: totalQuestoes,
        total_acertos: acertos,
        taxa_acerto: taxaAcerto,
        materia_mais_estudada: materiaTop,
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

    const updates: Record<string, any> = {
      atualizado_em: new Date().toISOString(),
    };

    // ─── Validação do que vem do usuário ────────────────────
    //
    // Antes, avatar_url e banner_url eram gravados CRUS: qualquer string,
    // de qualquer tamanho, com qualquer prefixo. O limite de 15 MB existia
    // só no navegador — quem chamasse a API direto passava por cima dele e
    // podia gravar 200 MB de lixo, ou um `javascript:` no lugar da imagem.

    if (nome !== undefined && nome !== null) {
      const limpo = limparTexto(nome, 100);
      if (!limpo || limpo.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Nome deve ter entre 2 e 100 caracteres.' },
          { status: 400 }
        );
      }
      updates.nome = limpo;
    }

    if (bio !== undefined) {
      updates.bio = bio ? limparTexto(bio, 150) : null;
    }

    if (avatar_url !== undefined) {
      const v = validarDataUrlMidia(avatar_url, { maxBytes: MAX_AVATAR_BYTES });
      if (!v.ok) {
        return NextResponse.json(
          { success: false, error: v.erro },
          { status: 400 }
        );
      }
      updates.avatar_url = avatar_url || null;
    }

    if (banner_url !== undefined) {
      const v = validarDataUrlMidia(banner_url, {
        permitirVideo: true,
        maxBytes: MAX_BANNER_BYTES,
      });
      if (!v.ok) {
        return NextResponse.json(
          { success: false, error: v.erro },
          { status: 400 }
        );
      }
      updates.banner_url = banner_url || null;
      // O tipo vem do conteúdo real do arquivo, não do que o cliente disse.
      if (v.tipo) updates.banner_tipo = v.tipo;
    }

    // banner_tipo só é aceito do cliente quando não veio banner novo, e
    // ainda assim restrito ao conjunto que o enum do banco conhece.
    if (banner_tipo !== undefined && banner_url === undefined) {
      if (['imagem', 'gif', 'video'].includes(banner_tipo)) {
        updates.banner_tipo = banner_tipo;
      }
    }

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
        .maybeSingle();

      if (exist) {
        return NextResponse.json({ success: false, error: 'Este apelido já está em uso por outro aluno' }, { status: 409 });
      }

      updates.apelido = novoApelido;
    }

    const { data: updatedUser, error: updateErr } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, nome, apelido, email, bio, avatar_url, banner_url, banner_tipo, role, xp_total, nivel_atual, streak_dias, maior_combo_pessoal')
      .single();

    if (updateErr) {
      console.error('Error updating user profile in Supabase:', updateErr);
      return NextResponse.json({ success: false, error: 'Erro ao salvar perfil no banco' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Perfil atualizado e salvo com sucesso!',
    });
  } catch (error) {
    console.error('PATCH /api/usuarios/me error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao salvar perfil' }, { status: 500 });
  }
}
