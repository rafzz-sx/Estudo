import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET   /api/admin/contestacoes — a fila de questões que os alunos dizem
 *                                 estar erradas, agrupada por questão.
 * PATCH /api/admin/contestacoes — julga um caso.
 *
 * ─── Por que agrupar por questão e não listar caso a caso ───────────────
 *
 * O número que decide o que olhar primeiro não é "quantas contestações
 * existem", é "quantas pessoas DIFERENTES resolveram esta questão e
 * discordaram do mesmo jeito". Um aluno sozinho contestando é quase sempre
 * um aluno que errou. Cinco alunos apontando a MESMA letra alternativa é
 * outra coisa — e é isso que a coluna `consenso` mostra.
 *
 * Um gabarito de verdade errado tende a produzir exatamente essa assinatura:
 * várias pessoas independentes chegando à mesma resposta diferente.
 *
 * Query: ?status=aberta&page=1
 */

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

const STATUS_VALIDOS = new Set(['aberta', 'procede', 'improcede', 'duplicada']);

/** Rede de segurança: a tabela cresce com o uso, mas devagar. */
const TETO = 5_000;

interface LinhaContestacao {
  id: string;
  questao_id: string;
  user_id: string;
  tipo: string;
  motivo: string;
  alternativa_sugerida: string | null;
  status: string;
  resposta_admin: string | null;
  criado_em: string;
  users: { apelido: string; avatar_url: string | null } | null;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? 'aberta';

    const supabase = createServerSupabaseClient();

    const contestacoes = await lerTudo<LinhaContestacao>(
      () => {
        const q = supabase
          .from('questao_contestacoes')
          .select(
            `id, questao_id, user_id, tipo, motivo, alternativa_sugerida,
             status, resposta_admin, criado_em,
             users ( apelido, avatar_url )`
          )
          .order('criado_em', { ascending: false });
        return status === 'todas' ? q : q.eq('status', status);
      },
      TETO
    );

    if (contestacoes.length === 0) {
      return NextResponse.json({
        success: true,
        data: { grupos: [], resumo: { abertas: 0, questoes: 0 } },
      });
    }

    // ─── Dados das questões contestadas ──────────────────────
    const ids = [...new Set(contestacoes.map((c) => c.questao_id))];
    const questoes = new Map<string, Record<string, unknown>>();

    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await supabase
        .from('questoes')
        .select(
          `id, enunciado, alternativas, resposta_correta, explicacao, anulada,
           ano, numero_original, figura_descricao, figura_svg,
           vezes_respondida, vezes_acertada,
           concursos ( sigla ), materias ( nome, icone_emoji ), assuntos ( nome )`
        )
        .in('id', ids.slice(i, i + 200));

      for (const q of (data ?? []) as Record<string, unknown>[]) {
        questoes.set(q.id as string, q);
      }
    }

    // ─── Agrupa ──────────────────────────────────────────────
    const porQuestao = new Map<string, LinhaContestacao[]>();
    for (const c of contestacoes) {
      const lista = porQuestao.get(c.questao_id) ?? [];
      lista.push(c);
      porQuestao.set(c.questao_id, lista);
    }

    const grupos = [];
    for (const [questaoId, casos] of porQuestao) {
      const questao = questoes.get(questaoId);
      if (!questao) continue; // questão apagada; o CASCADE já limpou

      // Quantos apontam a MESMA letra. É a assinatura de um gabarito errado
      // de verdade: gente independente chegando à mesma resposta diferente.
      const votos = new Map<string, number>();
      for (const c of casos) {
        if (!c.alternativa_sugerida) continue;
        votos.set(
          c.alternativa_sugerida,
          (votos.get(c.alternativa_sugerida) ?? 0) + 1
        );
      }

      let consensoLetra: string | null = null;
      let consensoVotos = 0;
      for (const [letra, n] of votos) {
        if (n > consensoVotos) {
          consensoLetra = letra;
          consensoVotos = n;
        }
      }

      grupos.push({
        questao,
        casos: casos.map((c) => ({
          id: c.id,
          tipo: c.tipo,
          motivo: c.motivo,
          alternativa_sugerida: c.alternativa_sugerida,
          status: c.status,
          resposta_admin: c.resposta_admin,
          criado_em: c.criado_em,
          apelido: c.users?.apelido ?? '—',
          avatar_url: c.users?.avatar_url ?? null,
        })),
        total: casos.length,
        // Só é consenso se mais de um aluno apontou a mesma letra E ela é
        // diferente do gabarito atual. Um voto sozinho não é sinal.
        consenso:
          consensoVotos >= 2 && consensoLetra !== questao.resposta_correta
            ? { letra: consensoLetra, votos: consensoVotos }
            : null,
      });
    }

    // Consenso primeiro, depois volume. É a ordem de quem tem mais chance de
    // ser erro de verdade.
    grupos.sort((a, b) => {
      const ca = a.consenso ? a.consenso.votos : 0;
      const cb = b.consenso ? b.consenso.votos : 0;
      if (cb !== ca) return cb - ca;
      return b.total - a.total;
    });

    return NextResponse.json({
      success: true,
      data: {
        grupos,
        resumo: {
          abertas: contestacoes.filter((c) => c.status === 'aberta').length,
          questoes: grupos.length,
          amostra_truncada: contestacoes.length >= TETO,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/contestacoes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar a fila de contestações' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — julga um caso.
 * Body: { id, status, resposta_admin?, anular_questao?, novo_gabarito? }
 *
 * `anular_questao` e `novo_gabarito` são o ponto perigoso desta rota, e por
 * isso são EXPLÍCITOS: nada aqui muda a questão como efeito colateral de
 * marcar "procede". Quem corrige um gabarito precisa dizer que está
 * corrigindo um gabarito.
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
    const id = String(body?.id ?? '');
    const status = String(body?.status ?? '');

    if (!id || !STATUS_VALIDOS.has(status)) {
      return NextResponse.json(
        { success: false, error: 'Caso ou status inválido.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: caso } = await supabase
      .from('questao_contestacoes')
      .select('id, questao_id')
      .eq('id', id)
      .maybeSingle();

    if (!caso) {
      return NextResponse.json(
        { success: false, error: 'Contestação não encontrada' },
        { status: 404 }
      );
    }

    // ─── Mexer na questão, quando pedido de forma explícita ──
    const novoGabarito = String(body?.novo_gabarito ?? '').trim().toUpperCase();

    if (novoGabarito) {
      if (!/^[A-E]$/.test(novoGabarito)) {
        return NextResponse.json(
          { success: false, error: 'O novo gabarito precisa ser de A a E.' },
          { status: 400 }
        );
      }
      const { error } = await supabase
        .from('questoes')
        .update({ resposta_correta: novoGabarito })
        .eq('id', caso.questao_id);
      if (error) throw error;
    }

    if (body?.anular_questao === true) {
      const { error } = await supabase
        .from('questoes')
        .update({ anulada: true })
        .eq('id', caso.questao_id);
      if (error) throw error;
    }

    const { data, error } = await supabase
      .from('questao_contestacoes')
      .update({
        status,
        resposta_admin: String(body?.resposta_admin ?? '').trim() || null,
        resolvido_em: status === 'aberta' ? null : new Date().toISOString(),
        resolvido_por: status === 'aberta' ? null : admin.id,
      })
      .eq('id', id)
      .select('id, status, resposta_admin, resolvido_em')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PATCH /api/admin/contestacoes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao julgar a contestação' },
      { status: 500 }
    );
  }
}
