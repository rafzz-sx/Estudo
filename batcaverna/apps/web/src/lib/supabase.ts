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
function getUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  return envUrl.includes('bzrrbbaqzlfmertirbak') ? envUrl.trim() : SUPABASE_URL;
}

/**
 * Cliente Supabase para uso no servidor (API routes)
 * SEMPRE usa a service_role key para bypass de RLS
 */
export function createServerSupabaseClient(): SupabaseClient {
  // Usa a service key da env var SOMENTE se ela contiver "service_role" no JWT
  const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
  const key = envServiceKey.includes('service_role') ? envServiceKey : SUPABASE_SERVICE_KEY;

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
  const key = envKey.includes('anon') ? envKey : SUPABASE_ANON_KEY;

  return createClient(getUrl(), key);
}
