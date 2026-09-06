import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * POST /api/feedback
 * Body: { tipo, nota?, mensagem, marco_horas? }
 *   ou  { acao: "adiar" | "nunca_mais", marco_horas? }
 */
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

    const tipo = ['opiniao', 'bug', 'ideia'].includes(body?.tipo)
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
