import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Valores CORRETOS do projeto BatCaverna no Supabase ──────
// Hardcoded para garantir que a Vercel sempre conecte ao projeto certo
const SUPABASE_URL = 'https://bzrrbbaqzlfmertirbak.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NTk2MzgsImV4cCI6MjEwMzUzNTYzOH0.3jFVGn0QskUYNL2iLCglw6SOxW0SDX8Plo0jLWrx7XE';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

/**
 * Retorna a URL correta do Supabase.
 * Valida se a env var contém o ref correto do projeto.
 */
/**
 * A variável de ambiente, quando existe, MANDA. O valor fixo é só reserva.
 *
 * A versão anterior exigia que a env var contivesse o ref deste projeto —
 * o que prendia a plataforma a ele: apontar para outro projeto Supabase
 * era impossível sem editar código.
 */
function getUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(envUrl) ? envUrl : SUPABASE_URL;
}

/**
 * Uma chave do Supabase é um JWT (`eyJ...`) ou, no formato novo, `sb_...`.
 * A versão anterior testava `envKey.includes('service_role')` — mas num JWT
 * esse texto fica em base64 e NUNCA aparece legível. A condição era sempre
 * falsa, a env var era ignorada e o código usava sempre a chave do arquivo.
 *
 * Consequência prática que isso causava: rotacionar a chave no Supabase
 * derrubava a plataforma, porque o código continuava enviando a antiga.
 */
function pareceChave(valor: string): boolean {
  return valor.length >= 40 && (/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(valor) || /^sb_[\w-]+$/.test(valor));
}

/**
 * Cliente Supabase para uso no servidor (API routes)
 * SEMPRE usa a service_role key para bypass de RLS
 */
export function createServerSupabaseClient(): SupabaseClient {
  // Env var válida tem precedência. O valor fixo só entra quando ela está
  // ausente — e isso será removido quando as variáveis estiverem
  // confirmadas na Vercel (ver SEGURANCA-ACOES-MANUAIS.txt, item 0-C).
  const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
  const key = pareceChave(envServiceKey) ? envServiceKey : SUPABASE_SERVICE_KEY;

  return createClient(getUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Cliente Supabase para uso no browser (client-side)
 * Usa a anon key (com RLS)
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '';
  const key = pareceChave(envKey) ? envKey : SUPABASE_ANON_KEY;

  return createClient(getUrl(), key);
}
