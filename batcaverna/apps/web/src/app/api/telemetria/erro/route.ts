import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * POST /api/telemetria/erro
 * Telemetria leve e gratuita de erros inesperados do cliente (Error Boundary).
 * Registra em `admin_audit_log` para visibilidade imediata na aba Saúde do Admin.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const mensagem = String(body?.mensagem ?? 'Erro desconhecido').slice(0, 220);
    const rota = String(body?.rota ?? '').slice(0, 120);
    const digest = body?.digest ? String(body.digest).slice(0, 64) : null;
    const ua = String(req.headers.get('user-agent') ?? '').slice(0, 180);

    if (user?.id) {
      const supabase = createServerSupabaseClient();
      await supabase.from('admin_audit_log').insert({
        admin_id: user.id,
        acao: 'erro_frontend',
        entidade_afetada: 'frontend',
        entidade_id: user.id,
        detalhes: {
          mensagem,
          rota,
          digest,
          ua,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    // Nunca propaga erro de telemetria
    return NextResponse.json({ success: true });
  }
}
