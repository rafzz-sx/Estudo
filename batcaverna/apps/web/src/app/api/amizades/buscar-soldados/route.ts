import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';
import { calcularNivel } from '@batcaverna/utils';

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload ? { id: payload.sub, role: payload.role } : null;
}

// GET /api/amizades/buscar-soldados?apelido=nome
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const termo = searchParams.get('apelido')?.trim();

    if (!termo || termo.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabase = createServerSupabaseClient();

    // 1. Buscar soldados por apelido ou nome
    const { data: usuarios, error } = await supabase
      .from('users')
      .select(`
        id, nome, apelido, avatar_url, xp_total, nivel_atual,
        user_concurso_favoritos (concursos (sigla))
      `)
      .or(`apelido.ilike.%${termo}%,nome.ilike.%${termo}%`)
      .limit(10);

    if (error) {
      console.error('Erro na busca de soldados:', error);
      return NextResponse.json({ success: false, error: 'Erro ao buscar soldados' }, { status: 500 });
    }

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const userIds = usuarios.map((u) => u.id);

    // 2. Buscar amizades existentes com esses usuários
    const { data: amizadesExistentes } = await supabase
      .from('amizades')
      .select('id, status, user_id_solicitante, user_id_destinatario')
      .or(
        `and(user_id_solicitante.eq.${user.id},user_id_destinatario.in.(${userIds.join(',')})),` +
        `and(user_id_destinatario.eq.${user.id},user_id_solicitante.in.(${userIds.join(',')}))`
      );

    const mapAmizades = new Map<string, { status: string; id: string; solicitante: string }>();
    (amizadesExistentes || []).forEach((amz) => {
      const outroId = amz.user_id_solicitante === user.id ? amz.user_id_destinatario : amz.user_id_solicitante;
      mapAmizades.set(outroId, {
        status: amz.status,
        id: amz.id,
        solicitante: amz.user_id_solicitante,
      });
    });

    // 3. Montar resultado formatado com títulos e status de amizade
    const resultado = usuarios.map((u) => {
      const nivelInfo = calcularNivel(u.xp_total || 0);
      const amizade = mapAmizades.get(u.id);
      const ehVoceMesmo = u.id === user.id;

      return {
        id: u.id,
        nome: u.nome,
        apelido: u.apelido,
        avatar_url: u.avatar_url,
        nivel_atual: nivelInfo.nivel,
        titulo_nivel: nivelInfo.titulo,
        concursos: (u.user_concurso_favoritos || [])
          .map((cf: any) => cf.concursos?.sigla)
          .filter(Boolean),
        amizade_status: amizade ? amizade.status : null,
        amizade_id: amizade ? amizade.id : null,
        sou_solicitante: amizade ? amizade.solicitante === user.id : false,
        eh_voce_mesmo: ehVoceMesmo,
      };
    });

    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    console.error('GET /api/amizades/buscar-soldados error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno ao processar busca' }, { status: 500 });
  }
}
