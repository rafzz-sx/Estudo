import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * Gestão de contas pelo painel admin.
 *
 * O GET listava, mas a tela era só leitura: não havia como promover um
 * moderador nem suspender quem estivesse abusando do chat. A única saída
 * era editar a linha na mão no Supabase. O PATCH abaixo resolve isso.
 */

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

// ─── GET: lista de contas ────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    if (!(await exigirAdmin(req))) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    // `banner_url` saiu do select: é uma imagem em base64 de até 16 MB
    // guardada na própria linha, e a listagem não a exibe. Com algumas
    // dezenas de banners grandes a resposta passava de 100 MB. E a leitura
    // passou a paginar — o PostgREST corta em 1.000 linhas.
    let users: any[];
    try {
      users = await lerTudo<any>(() =>
        supabase
          .from('users')
          .select(
            `id, nome, apelido, email, email_verified, role, xp_total, nivel_atual,
             streak_dias, avatar_url, criado_em, ultimo_login_em,
             ativo, suspenso_ate, motivo_suspensao,
             total_questoes_respondidas, total_acertos`
          )
          .order('criado_em', { ascending: false })
      );
    } catch (uErr) {
      console.error('Erro ao buscar usuários no admin:', uErr);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuários' },
        { status: 500 }
      );
    }

    // Histórico de trocas de apelido.
    //
    // Isto aqui consultava `admin_audit_logs` (com "s") e as colunas
    // `alvo_id` / `detalhes_json`. A tabela chama `admin_audit_log` e as
    // colunas são `entidade_id` / `detalhes` — a consulta falhava calada e
    // o histórico voltava sempre vazio, sem nunca dar erro na tela.
    const { data: auditoria } = await supabase
      .from('admin_audit_log')
      .select('entidade_id, detalhes, criado_em')
      .eq('acao', 'troca_apelido')
      .order('criado_em', { ascending: true });

    const historico: Record<string, { apelido: string; data: string }[]> = {};

    for (const log of auditoria ?? []) {
      const alvo = log.entidade_id;
      const anterior = (log.detalhes as Record<string, unknown> | null)
        ?.apelido_antigo;
      if (!alvo || !anterior) continue;
      (historico[alvo] ??= []).push({
        apelido: String(anterior),
        data: log.criado_em,
      });
    }

    const agora = Date.now();

    const lista = (users ?? []).map((u) => {
      const suspenso =
        !!u.suspenso_ate && new Date(u.suspenso_ate).getTime() > agora;
      return {
        ...u,
        apelidos_antigos: (historico[u.id] ?? []).map((h) => h.apelido),
        historico_detalhado: historico[u.id] ?? [],
        // Estado já resolvido, para a tela não repetir a regra.
        situacao: u.ativo === false ? 'desativada' : suspenso ? 'suspensa' : 'ativa',
      };
    });

    return NextResponse.json({
      success: true,
      data: lista,
      total: lista.length,
    });
  } catch (error) {
    console.error('GET /api/admin/usuarios error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// ─── PATCH: moderação de conta ───────────────────────────────
/**
 * Body: { user_id, acao, dias?, motivo? }
 *
 * acao:
 *   'promover'   -> vira admin
 *   'rebaixar'   -> volta a user
 *   'suspender'  -> bloqueia por `dias` (padrão 7)
 *   'liberar'    -> tira suspensão e reativa
 *   'desativar'  -> bloqueia sem prazo
 */
const ACOES = new Set([
  'promover',
  'rebaixar',
  'suspender',
  'liberar',
  'desativar',
]);

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
    const userId: string = String(body?.user_id ?? '');
    const acao: string = String(body?.acao ?? '');
    const motivo: string | null = body?.motivo
      ? String(body.motivo).slice(0, 300)
      : null;
    const dias = Math.min(365, Math.max(1, Number(body?.dias) || 7));

    if (!userId || !ACOES.has(acao)) {
      return NextResponse.json(
        { success: false, error: 'Informe o usuário e uma ação válida.' },
        { status: 400 }
      );
    }

    // Um admin não se rebaixa nem se suspende sozinho: seria a forma mais
    // fácil de ficar sem nenhum administrador na plataforma.
    if (userId === admin.id && acao !== 'liberar') {
      return NextResponse.json(
        {
          success: false,
          error: 'Você não pode aplicar esta ação na sua própria conta.',
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: alvo } = await supabase
      .from('users')
      .select('id, apelido, role')
      .eq('id', userId)
      .maybeSingle();

    if (!alvo) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Rebaixar o último admin deixaria o painel inacessível para sempre.
    if (acao === 'rebaixar' && alvo.role === 'admin') {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Este é o único administrador. Promova outro antes.',
          },
          { status: 400 }
        );
      }
    }

    const agora = new Date().toISOString();
    let mudanca: Record<string, unknown> = { moderado_em: agora };
    let mensagem = '';

    switch (acao) {
      case 'promover':
        mudanca = { ...mudanca, role: 'admin' };
        mensagem = `${alvo.apelido} agora é administrador.`;
        break;

      case 'rebaixar':
        mudanca = { ...mudanca, role: 'user' };
        mensagem = `${alvo.apelido} voltou a ser usuário comum.`;
        break;

      case 'suspender': {
        const ate = new Date(Date.now() + dias * 86_400_000).toISOString();
        mudanca = {
          ...mudanca,
          suspenso_ate: ate,
          motivo_suspensao: motivo,
          suspenso_por: admin.id,
        };
        mensagem = `${alvo.apelido} suspenso por ${dias} dia(s).`;
        break;
      }

      case 'desativar':
        mudanca = {
          ...mudanca,
          ativo: false,
          motivo_suspensao: motivo,
          suspenso_por: admin.id,
        };
        mensagem = `A conta de ${alvo.apelido} foi desativada.`;
        break;

      case 'liberar':
        mudanca = {
          ...mudanca,
          ativo: true,
          suspenso_ate: null,
          motivo_suspensao: null,
          suspenso_por: null,
        };
        mensagem = `${alvo.apelido} está liberado.`;
        break;
    }

    const { data, error } = await supabase
      .from('users')
      .update(mudanca)
      .eq('id', userId)
      .select('id, apelido, role, ativo, suspenso_ate, motivo_suspensao')
      .single();

    if (error) throw error;

    // Suspender ou desativar deve derrubar a sessão em curso: sem isso o
    // token de 10 horas continuaria valendo até expirar sozinho.
    if (['suspender', 'desativar'].includes(acao)) {
      await supabase.from('refresh_tokens').delete().eq('user_id', userId);
      await supabase
        .from('users')
        .update({ sessao_expira_em: agora })
        .eq('id', userId);
    }

    // O usuário precisa saber o que aconteceu com a conta dele.
    await supabase.from('notificacoes').insert({
      user_id: userId,
      tipo: 'sistema',
      titulo:
        acao === 'promover'
          ? 'Você virou administrador'
          : acao === 'liberar'
          ? 'Sua conta foi liberada'
          : acao === 'rebaixar'
          ? 'Suas permissões mudaram'
          : 'Sua conta foi restringida',
      mensagem: motivo ?? mensagem,
    });

    await supabase.from('admin_audit_log').insert({
      admin_id: admin.id,
      acao: `conta_${acao}`,
      entidade_afetada: 'users',
      entidade_id: userId,
      detalhes: { apelido: alvo.apelido, motivo, dias: acao === 'suspender' ? dias : null },
    });

    return NextResponse.json({ success: true, data, mensagem });
  } catch (error) {
    console.error('PATCH /api/admin/usuarios error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao aplicar a ação na conta.' },
      { status: 500 }
    );
  }
}
