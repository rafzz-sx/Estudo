import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Endpoint de monitoramento e Guardião Anti-Pausa 24/7.
 * Realiza um round-trip real e leve no PostgreSQL para:
 * 1. Manter a conexão ativa no Supabase/Neon e evitar pausas por inatividade.
 * 2. Responder status para o UptimeRobot / Cron-job.org / GitHub Actions.
 * 3. Medir a latência exata entre o servidor Next.js e o banco de dados.
 */
export async function GET() {
  const inicio = Date.now();

  try {
    const supabase = createServerSupabaseClient();

    // Consulta ultraleve de validação (1 linha, 1 coluna)
    const { data, error } = await supabase
      .from('concursos')
      .select('sigla')
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const latencia = Date.now() - inicio;

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        latency_ms: latencia,
        timestamp: new Date().toISOString(),
        uptime_guard: 'active',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    const latencia = Date.now() - inicio;
    console.error('[HEALTH CHECK] Falha ao conectar no banco:', err);

    return NextResponse.json(
      {
        status: 'degraded',
        database: 'unreachable',
        error: err?.message || 'Database connection failed',
        latency_ms: latencia,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
