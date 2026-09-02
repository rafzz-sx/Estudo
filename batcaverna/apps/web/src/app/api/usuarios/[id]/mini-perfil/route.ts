import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { calcularNivel } from '@batcaverna/utils';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
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
        amizade_status,
        amizade_id,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/[id]/mini-perfil error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mini perfil' }, { status: 500 });
  }
}
