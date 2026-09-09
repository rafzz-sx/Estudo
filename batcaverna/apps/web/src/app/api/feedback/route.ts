import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

// ═══════════════════════════════════════════════════════════════
// GET /api/feedback — Retorna depoimentos aprovados para a vitrine (público)
// ═══════════════════════════════════════════════════════════════
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: depoimentos, error } = await supabase
      .from('feedback_plataforma')
      .select(`
        id,
        nota,
        mensagem,
        criado_em,
        users!inner (
          nome,
          apelido,
          avatar_url
        )
      `)
      .eq('aprovado_para_vitrine', true)
      .order('criado_em', { ascending: false })
      .limit(12);

    if (error) {
      console.error('Erro ao buscar depoimentos:', error);
      return NextResponse.json(
        { success: true, data: [] }
      );
    }

    // Formatar para o frontend
    const formatados = (depoimentos || []).map((d: any) => ({
      id: d.id,
      nota: d.nota,
      mensagem: d.mensagem,
      criado_em: d.criado_em,
      autor_nome: d.users?.nome || 'Aluno BatCaverna',
      autor_apelido: d.users?.apelido || '',
      autor_avatar: d.users?.avatar_url || null,
    }));

    return NextResponse.json({ success: true, data: formatados });
  } catch (error: any) {
    console.error('Erro em GET /api/feedback:', error);
    // Retorna array vazio para não quebrar a landing page
    return NextResponse.json({ success: true, data: [] });
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/feedback
// Body: { tipo, nota?, mensagem, marco_horas? }
//   ou  { acao: "adiar" | "nunca_mais", marco_horas? }
// ═══════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const supabase = createServerSupabaseClient();
    const marco = Number(body?.marco_horas) || null;

    // ─── Adiar ou dispensar para sempre ──────────────────────
    if (body?.acao === 'adiar' || body?.acao === 'nunca_mais') {
      const patch: Record<string, unknown> = {
        user_id: user.id,
        atualizado_em: new Date().toISOString(),
      };

      if (body.acao === 'nunca_mais') {
        patch.nunca_mais = true;
      } else {
        // "Mais tarde" = volta a perguntar em 3 dias.
        patch.adiado_ate = new Date(Date.now() + 3 * 86_400_000).toISOString();
        // Marca o marco como visto, para não reaparecer assim que passar o prazo.
        if (marco) patch.ultimo_marco_horas = marco;
      }

      await supabase.from('user_tempo_uso').upsert(patch, { onConflict: 'user_id' });
      return NextResponse.json({ success: true, data: { acao: body.acao } });
    }

    // ─── Envio do feedback ───────────────────────────────────
    const mensagem = String(body?.mensagem ?? '').trim();
    if (mensagem.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Escreva um pouco mais para podermos entender.' },
        { status: 400 }
      );
    }

    const tipo = ['opiniao', 'bug', 'ideia', 'depoimento'].includes(body?.tipo)
      ? body.tipo
      : 'opiniao';
    const nota = Number(body?.nota);

    const { error } = await supabase.from('feedback_plataforma').insert({
      user_id: user.id,
      tipo,
      nota: nota >= 1 && nota <= 5 ? nota : null,
      mensagem: mensagem.slice(0, 4000),
      marco_horas: marco,
    });

    if (error) throw error;

    // Registra o marco para não perguntar de novo no mesmo patamar.
    if (marco) {
      await supabase.from('user_tempo_uso').upsert(
        {
          user_id: user.id,
          ultimo_marco_horas: marco,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }

    // Notificar admins sobre novo feedback (best-effort)
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const notificacoes = admins.map((admin: any) => ({
          user_id: admin.id,
          tipo: 'sistema',
          titulo: '📝 Novo feedback recebido',
          mensagem: `Um aluno enviou um novo ${tipo}${nota >= 1 ? ` (nota: ${nota}/5)` : ''}.`,
          lida: false,
        }));

        await supabase.from('notificacoes').insert(notificacoes);
      }
    } catch (notifErr) {
      console.warn('Erro ao notificar admin sobre feedback:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Obrigado! Seu retorno vai direto para quem cuida da plataforma.',
    });
  } catch (error) {
    console.error('POST /api/feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar feedback' },
      { status: 500 }
    );
  }
}
