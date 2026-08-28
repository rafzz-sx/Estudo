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
