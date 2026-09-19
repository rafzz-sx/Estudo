import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { limparTermoBusca, uuidOuNulo } from '@/lib/seguranca';

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/**
 * GET /api/admin/questoes
 *
 * Listagem completa para o administrador:
 *   - page, per_page (padrão 20, máx 50)
 *   - busca (texto no enunciado)
 *   - concurso_id (UUID) ou concurso (sigla)
 *   - materia_id (UUID)
 *   - ano (número)
 *   - status: 'todas' | 'ativas' | 'anuladas' | 'sem_explicacao' | 'com_figura'
 *   - ordem: 'recentes' | 'antigas' | 'mais_respondidas' | 'mais_erros'
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('per_page') || '20'))
    );
    const offset = (page - 1) * perPage;

    // Concurso
    let concursoId = uuidOuNulo(searchParams.get('concurso_id'));
    const concursoSigla = searchParams.get('concurso');
    if (!concursoId && concursoSigla && concursoSigla.toLowerCase() !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', concursoSigla)
        .maybeSingle();
      if (data) concursoId = data.id;
    }

    const materiaId = uuidOuNulo(searchParams.get('materia_id'));
    const ano = searchParams.get('ano');
    const status = searchParams.get('status') || 'todas';
    const ordem = searchParams.get('ordem') || 'recentes';
    const busca = limparTermoBusca(searchParams.get('busca'), 80);

    let query = supabase
      .from('questoes')
      .select(
        `
        id, concurso_id, materia_id, assunto_id,
        enunciado, alternativas, resposta_correta,
        explicacao, resolucao_passos, resolucao_status,
        precisa_resolucao, anulada,
        ano, banca, dificuldade, texto_base, numero_original,
        figura_descricao, figura_svg,
        vezes_respondida, vezes_acertada,
        criado_em,
        concursos (id, sigla, nome),
        materias  (id, nome, icone_emoji),
        assuntos  (id, nome)
      `,
        { count: 'exact' }
      );

    if (concursoId) query = query.eq('concurso_id', concursoId);
    if (materiaId) query = query.eq('materia_id', materiaId);
    if (ano && ano !== 'todos') query = query.eq('ano', parseInt(ano));

    if (busca.length >= 2) {
      query = query.ilike('enunciado', `%${busca}%`);
    }

    // Filtros de status
    if (status === 'ativas') {
      query = query.or('anulada.is.null,anulada.eq.false');
    } else if (status === 'anuladas') {
      query = query.eq('anulada', true);
    } else if (status === 'sem_explicacao') {
      query = query.is('explicacao', null);
    } else if (status === 'com_figura') {
      query = query.or('figura_svg.not.is.null,figura_descricao.not.is.null');
    }

    // Ordenação
    if (ordem === 'antigas') {
      query = query
        .order('ano', { ascending: true, nullsFirst: false })
        .order('criado_em', { ascending: true });
    } else if (ordem === 'mais_respondidas') {
      query = query.order('vezes_respondida', { ascending: false, nullsFirst: false });
    } else if (ordem === 'mais_erros') {
      query = query
        .order('vezes_respondida', { ascending: false, nullsFirst: false })
        .order('vezes_acertada', { ascending: true, nullsFirst: false });
    } else {
      query = query
        .order('ano', { ascending: false, nullsFirst: false })
        .order('criado_em', { ascending: false });
    }

    const { data: items, count, error } = await query.range(offset, offset + perPage - 1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / perPage);

    return NextResponse.json({
      success: true,
      data: {
        items: items ?? [],
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/questoes
 *
 * Atualiza campos de uma questão:
 *   - id (UUID obrigatório)
 *   - enunciado (string)
 *   - alternativas ({ letra, texto }[])
 *   - resposta_correta (string 'A', 'B', 'C', etc.)
 *   - explicacao (string)
 *   - anulada (boolean)
 *   - banca, ano, dificuldade, texto_base
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = uuidOuNulo(body.id);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da questão inválido ou não informado.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const dadosAtualizacao: Record<string, any> = {};

    if (typeof body.enunciado === 'string' && body.enunciado.trim().length > 0) {
      dadosAtualizacao.enunciado = body.enunciado.trim();
    }

    if (Array.isArray(body.alternativas) && body.alternativas.length >= 2) {
      dadosAtualizacao.alternativas = body.alternativas;
    }

    if (typeof body.resposta_correta === 'string' && body.resposta_correta.trim().length > 0) {
      dadosAtualizacao.resposta_correta = body.resposta_correta.trim().toUpperCase();
    }

    if (body.explicacao !== undefined) {
      dadosAtualizacao.explicacao =
        typeof body.explicacao === 'string' && body.explicacao.trim().length > 0
          ? body.explicacao.trim()
          : null;
    }

    if (typeof body.anulada === 'boolean') {
      dadosAtualizacao.anulada = body.anulada;
    }

    if (typeof body.ano === 'number') {
      dadosAtualizacao.ano = body.ano;
    }

    if (typeof body.banca === 'string') {
      dadosAtualizacao.banca = body.banca.trim();
    }

    if (typeof body.dificuldade === 'string') {
      dadosAtualizacao.dificuldade = body.dificuldade.trim().toLowerCase();
    }

    if (body.texto_base !== undefined) {
      dadosAtualizacao.texto_base =
        typeof body.texto_base === 'string' && body.texto_base.trim().length > 0
          ? body.texto_base.trim()
          : null;
    }

    if (body.figura_descricao !== undefined) {
      dadosAtualizacao.figura_descricao =
        typeof body.figura_descricao === 'string' && body.figura_descricao.trim().length > 0
          ? body.figura_descricao.trim()
          : null;
    }

    if (Object.keys(dadosAtualizacao).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum campo válido para atualização.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('questoes')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select(
        `
        id, concurso_id, materia_id, assunto_id,
        enunciado, alternativas, resposta_correta,
        explicacao, anulada, ano, banca, dificuldade,
        texto_base, numero_original, figura_descricao, figura_svg,
        concursos (id, sigla, nome),
        materias  (id, nome, icone_emoji),
        assuntos  (id, nome)
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Log de auditoria opcional
    try {
      await supabase.from('audit_logs').insert({
        user_id: admin.id,
        acao: 'editar_questao',
        entidade_afetada: `questao:${id}`,
        detalhes: { campos: Object.keys(dadosAtualizacao) },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data,
      mensagem: 'Questão atualizada com sucesso.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao atualizar questão.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/questoes
 *
 * Remove uma questão fisicamente do banco, limpando dependências diretas.
 */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = uuidOuNulo(searchParams.get('id'));

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da questão não informado.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // 1. Limpa de questao_importadas para evitar trava de FK
    await supabase.from('questao_importadas').delete().eq('questao_id', id);

    // 2. Exclui de questoes
    const { error } = await supabase.from('questoes').delete().eq('id', id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Log de auditoria
    try {
      await supabase.from('audit_logs').insert({
        user_id: admin.id,
        acao: 'excluir_questao',
        entidade_afetada: `questao:${id}`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      mensagem: 'Questão excluída com sucesso.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao excluir questão.' },
      { status: 500 }
    );
  }
}
