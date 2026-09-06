import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { calcularNivel } from '@batcaverna/utils';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  return getAuthUserFromRequest(req);
}

// GET /api/usuarios/[id]/mini-perfil — Dados públicos para modal do ranking
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, nome, apelido, avatar_url, banner_url, banner_tipo, bio,
        xp_total, nivel_atual, maior_combo_pessoal, streak_dias, criado_em,
        user_concurso_favoritos (concursos (id, sigla)),
        user_categoria_escrita (texto)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    const nivelInfo = calcularNivel(user.xp_total || 0);

    // Verificar status de amizade com quem está visualizando
    const viewer = await getUserFromRequest(req);
    let amizade_status: string | null = null;
    let amizade_id: string | null = null;

    if (viewer && viewer.id !== id) {
      const { data: amizade } = await supabase
        .from('amizades')
        .select('id, status')
        .or(
          `and(user_id_solicitante.eq.${viewer.id},user_id_destinatario.eq.${id}),` +
          `and(user_id_solicitante.eq.${id},user_id_destinatario.eq.${viewer.id})`
        )
        .limit(1)
        .maybeSingle();

      if (amizade) {
        amizade_status = amizade.status;
        amizade_id = amizade.id;
      }
    }

    const siglasFavoritas: string[] = (user.user_concurso_favoritos || [])
      .map((cf: any) => cf.concursos?.sigla)
      .filter(Boolean);

    // ─── Insígnias escolhidas pelo dono do perfil ────────────
    const { data: badges } = await supabase
      .from('user_badges')
      .select('ordem_exibicao, badges (nome, icone, cor_hex, raridade, descricao)')
      .eq('user_id', id)
      .eq('exibir_no_perfil', true)
      .order('ordem_exibicao');

    const badgesExibidas = (badges ?? [])
      .map((b: any) => b.badges)
      .filter(Boolean);

    // ─── O que essa pessoa mais estuda na plataforma ─────────
    const { data: statsMateria } = await supabase
      .from('user_materia_stats')
      .select('questoes_respondidas, acertos, materias (nome, icone_emoji)')
      .eq('user_id', id)
      .order('questoes_respondidas', { ascending: false })
      .limit(1);

    const materiaTop = statsMateria?.[0]
      ? {
          nome: (statsMateria[0] as any).materias?.nome ?? null,
          emoji: (statsMateria[0] as any).materias?.icone_emoji ?? null,
          questoes: statsMateria[0].questoes_respondidas,
        }
      : null;

    // ─── Tempo total de estudo (dado público do perfil) ──────
    const { data: sessoes } = await supabase
      .from('study_sessions')
      .select('duracao_segundos')
      .eq('user_id', id);

    const tempoTotal = (sessoes ?? []).reduce(
      (a, s) => a + (s.duracao_segundos ?? 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        nome: user.nome,
        apelido: user.apelido,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        banner_tipo: user.banner_tipo,
        bio: user.bio,
        nivel_atual: user.nivel_atual,
        titulo_nivel: nivelInfo.titulo,
        xp_total: user.xp_total || 0,
        streak_dias: user.streak_dias || 0,
        maior_combo_pessoal: user.maior_combo_pessoal || 0,
        concursos_favoritos: siglasFavoritas,
        categoria_escrita: user.user_categoria_escrita?.[0]?.texto || null,
        badges: badgesExibidas,
        materia_mais_estudada: materiaTop,
        tempo_total_estudo: tempoTotal,
        membro_desde: user.criado_em,
        amizade_status,
        amizade_id,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/[id]/mini-perfil error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mini perfil' }, { status: 500 });
  }
}
