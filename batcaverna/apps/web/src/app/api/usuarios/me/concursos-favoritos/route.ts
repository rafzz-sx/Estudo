import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/usuarios/me/concursos-favoritos
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('user_concurso_favoritos')
      .select('concurso_id, ordem, concursos (id, sigla)')
      .eq('user_id', user.id)
      .order('ordem', { ascending: true });

    return NextResponse.json({
      success: true,
      data: (data || []).map((d: any) => d.concursos?.sigla).filter(Boolean),
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/concursos-favoritos error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar favoritos' }, { status: 500 });
  }
}

// PUT /api/usuarios/me/concursos-favoritos — Salvar seleção de concursos favoritos
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { concursos: siglas } = await req.json(); // string[]
    if (!Array.isArray(siglas)) {
      return NextResponse.json({ success: false, error: 'Lista de concursos inválida' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Remover todos os favoritos atuais
    await supabase
      .from('user_concurso_favoritos')
      .delete()
      .eq('user_id', user.id);

    // Buscar IDs dos concursos pelas siglas
    if (siglas.length > 0) {
      const { data: dbConcursos } = await supabase
        .from('concursos')
        .select('id, sigla')
        .in('sigla', siglas.map((s: string) => s.toUpperCase()));

      if (dbConcursos && dbConcursos.length > 0) {
        const rows = dbConcursos.map((c: any, index: number) => ({
          user_id: user.id,
          concurso_id: c.id,
          ordem: index,
        }));

        const { error } = await supabase
          .from('user_concurso_favoritos')
          .insert(rows);

        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true, data: siglas });
  } catch (error) {
    console.error('PUT /api/usuarios/me/concursos-favoritos error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar favoritos' }, { status: 500 });
  }
}
