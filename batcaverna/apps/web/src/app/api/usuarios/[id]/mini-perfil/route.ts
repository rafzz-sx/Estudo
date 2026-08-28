import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { calcularNivel } from '@batcaverna/utils';

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
        id, apelido, avatar_url, banner_url, banner_tipo, bio,
        xp_total, nivel_atual, maior_combo_pessoal,
        user_concurso_favoritos (concursos (id, sigla, brasao_url)),
        user_categoria_escrita (texto)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    const nivelInfo = calcularNivel(user.xp_total || 0);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        apelido: user.apelido,
        avatar_url: user.avatar_url,
        banner_url: user.banner_url,
        banner_tipo: user.banner_tipo,
        bio: user.bio,
        nivel_atual: user.nivel_atual,
        titulo_nivel: nivelInfo.titulo,
        xp_total: user.xp_total,
        maior_combo_pessoal: user.maior_combo_pessoal,
        concursos_favoritos: (user.user_concurso_favoritos || []).map((cf: any) => ({
          sigla: cf.concursos?.sigla,
          brasao_url: cf.concursos?.brasao_url,
        })),
        categoria_escrita: user.user_categoria_escrita?.[0]?.texto || null,
      },
    });
  } catch (error) {
    console.error('GET /api/usuarios/[id]/mini-perfil error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mini perfil' }, { status: 500 });
  }
}
