import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getAdminFromRequest(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/** GET /api/admin/avisos — histórico de avisos disparados. */
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data } = await supabase
      .from('avisos_globais')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(50);

    const agora = new Date();
    return NextResponse.json({
      success: true,
      data: (data ?? []).map((a) => ({
        ...a,
        expirado: !!a.expira_em && new Date(a.expira_em) < agora,
      })),
    });
  } catch (error) {
    console.error('GET /api/admin/avisos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar avisos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/avisos — dispara um aviso para TODOS os usuários.
 * Body: { titulo, mensagem, tipo, duracao_horas }
 *
 * Cria uma linha em `avisos_globais` (o registro do disparo) e uma
 * notificação individual por usuário, com a mesma data de expiração —
 * assim cada pessoa pode marcar como lida e apagar a sua.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const titulo = String(body?.titulo ?? '').trim();
    const mensagem = String(body?.mensagem ?? '').trim();
    const tipo = ['info', 'alerta', 'sucesso', 'manutencao', 'atualizacao'].includes(
      body?.tipo
    )
      ? body.tipo
      : 'info';

    if (titulo.length < 3 || mensagem.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Preencha título e mensagem.' },
        { status: 400 }
      );
    }

    // Duração em horas; 0 ou ausente = permanente até o usuário apagar.
    const duracaoHoras = Math.max(0, Math.min(8760, Number(body?.duracao_horas) || 0));
    const expiraEm =
      duracaoHoras > 0
        ? new Date(Date.now() + duracaoHoras * 3_600_000).toISOString()
        : null;

    const supabase = createServerSupabaseClient();

    // Sem paginar, o PostgREST devolvia só as 1.000 primeiras linhas: acima
    // disso o aviso "para todos" chegava a uma parte, e o contador de
    // destinatários registrava o número errado.
    const destinatarios = await lerTudo<{ id: string }>(() =>
      supabase.from('users').select('id').eq('ativo', true)
    );

    const { data: aviso, error: avisoErr } = await supabase
      .from('avisos_globais')
      .insert({
        titulo: titulo.slice(0, 200),
        mensagem,
        tipo,
        criado_por_admin_id: admin.id,
        expira_em: expiraEm,
        total_destinatarios: destinatarios.length,
      })
      .select()
      .single();

    if (avisoErr) throw avisoErr;

    // Insere em lotes: um INSERT com milhares de linhas estoura o limite.
    const LOTE = 500;
    for (let i = 0; i < destinatarios.length; i += LOTE) {
      const fatia = destinatarios.slice(i, i + LOTE);
      await supabase.from('notificacoes').insert(
        fatia.map((u) => ({
          user_id: u.id,
          tipo: 'atualizacao_plataforma',
          titulo: titulo.slice(0, 200),
          mensagem,
          dados_extra: { aviso_tipo: tipo },
          aviso_id: aviso.id,
          expira_em: expiraEm,
        }))
      );
    }

    await supabase.from('admin_audit_log').insert({
      admin_id: admin.id,
      acao: 'aviso_global',
      detalhes: {
        aviso_id: aviso.id,
        titulo,
        destinatarios: destinatarios.length,
        expira_em: expiraEm,
      },
    });

    return NextResponse.json({
      success: true,
      data: { aviso, enviados: destinatarios.length },
      message: `Aviso enviado para ${destinatarios.length} usuário(s).`,
    });
  } catch (error) {
    console.error('POST /api/admin/avisos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar aviso' },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/avisos?id=... — revoga um aviso e some da caixa de todos. */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Informe o aviso.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    await supabase.from('notificacoes').delete().eq('aviso_id', id);
    await supabase.from('avisos_globais').update({ ativo: false }).eq('id', id);

    return NextResponse.json({ success: true, message: 'Aviso revogado.' });
  } catch (error) {
    console.error('DELETE /api/admin/avisos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao revogar aviso' },
      { status: 500 }
    );
  }
}
