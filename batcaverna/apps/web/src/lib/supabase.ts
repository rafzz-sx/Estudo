import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Valores CORRETOS do projeto BatCaverna no Supabase ──────
// Hardcoded para evitar erros de digitação nas env vars da Vercel
const SUPABASE_URL = 'https://bzrrbbaqzlfmertirbak.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NTk2MzgsImV4cCI6MjEwMzUzNTYzOH0.3jFVGn0QskUYNL2iLCglw6SOxW0SDX8Plo0jLWrx7XE';
const SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

/**
 * Cliente Supabase para uso no servidor (API routes)
 * Usa a service_role key para bypass de RLS quando necessário
 */
export function createServerSupabaseClient(): SupabaseClient {
  // Usa env var APENAS se contiver o ref correto "bzrrbbaqzlfmertirbak"
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const url = envUrl.includes('bzrrbbaqzlfmertirbak') ? envUrl.trim() : SUPABASE_URL;

  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = envKey.length > 50 ? envKey.trim() : SUPABASE_SERVICE_KEY;

  return createClient(url, key, {
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
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const url = envUrl.includes('bzrrbbaqzlfmertirbak') ? envUrl.trim() : SUPABASE_URL;

  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = envKey.length > 50 ? envKey.trim() : SUPABASE_ANON_KEY;

  return createClient(url, key);
}
