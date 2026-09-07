import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';

/**
 * Mensagens do formulário público `/contato`.
 *
 * A tabela `contatos_publicos` era ESCRITA E NUNCA LIDA. A mensagem chegava
 * inteira ao banco (até 4.000 caracteres), mas a única coisa que o
 * administrador via era a notificação — que corta em 139 caracteres. Uma
 * proposta de parceria ou um relato de bug detalhado só era legível pelo SQL
 * Editor do Supabase. Na prática o canal continuava sem resposta.
 *
 * As colunas `lido_por_admin` e `respondido_em` e o índice parcial sobre as
 * não lidas já existiam na migration 015, sem ninguém para escrevê-las.
 */

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

interface ContatoLinha {
  id: string;
  nome: string;
  email: string;
  assunto: string;
  mensagem: string;
  user_id: string | null;
  lido_por_admin: boolean | null;
  respondido_em: string | null;
  criado_em: string;
}

/** GET /api/admin/contatos?filtro=nao_lidos|todos */
export async function GET(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();
    const filtro = new URL(req.url).searchParams.get('filtro') ?? 'todos';

    // Sem paginação a leitura pararia nas 1.000 do teto do PostgREST — o
    // mesmo defeito que já custou caro em quatro rotas do admin.
    const contatos = await lerTudo<ContatoLinha>(() =>
      supabase
        .from('contatos_publicos')
        .select(
          'id, nome, email, assunto, mensagem, user_id, lido_por_admin, respondido_em, criado_em'
        )
        .order('criado_em', { ascending: false })
    );

    const lista =
      filtro === 'nao_lidos' ? contatos.filter((c) => !c.lido_por_admin) : contatos;

    return NextResponse.json({
      success: true,
      data: {
        contatos: lista,
        resumo: {
          total: contatos.length,
          nao_lidos: contatos.filter((c) => !c.lido_por_admin).length,
          respondidos: contatos.filter((c) => c.respondido_em).length,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/contatos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar as mensagens de contato' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/contatos
 * Body: { id, acao: 'marcar_lida' | 'marcar_nao_lida' | 'marcar_respondida' | 'desmarcar_respondida' }
 *
 * Só muda o estado de acompanhamento. A mensagem em si nunca é alterada nem
 * apagada: é registro de quem escreveu, não conteúdo editável.
 */
export async function PATCH(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = uuidOuNulo(body?.id);
    const acao = String(body?.acao ?? '');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 }
      );
    }

    const mudancas: Record<string, unknown> = {};
    if (acao === 'marcar_lida') mudancas.lido_por_admin = true;
    else if (acao === 'marcar_nao_lida') mudancas.lido_por_admin = false;
    else if (acao === 'marcar_respondida') {
      mudancas.respondido_em = new Date().toISOString();
      mudancas.lido_por_admin = true;
    } else if (acao === 'desmarcar_respondida') mudancas.respondido_em = null;
    else {
      return NextResponse.json(
        { success: false, error: 'Ação desconhecida' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('contatos_publicos')
      .update(mudancas)
      .eq('id', id)
      .select('id, lido_por_admin, respondido_em')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Mensagem não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PATCH /api/admin/contatos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar a mensagem' },
      { status: 500 }
    );
  }
}
