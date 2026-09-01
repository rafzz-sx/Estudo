import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bzrrbbaqzlfmertirbak.supabase.co';
const DEFAULT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NTk2MzgsImV4cCI6MjEwMzUzNTYzOH0.3jFVGn0QskUYNL2iLCglw6SOxW0SDX8Plo0jLWrx7XE';
const DEFAULT_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

function sanitize(val?: string): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
}

/**
 * Cliente Supabase para uso no servidor (API routes)
 * Usa a service_role key para bypass de RLS quando necessário
 */
export function createServerSupabaseClient(): SupabaseClient {
  const supabaseUrl =
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    sanitize(process.env.SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  const supabaseServiceKey =
    sanitize(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) ||
    sanitize(process.env.SUPABASE_SERVICE_KEY) ||
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    sanitize(process.env.SUPABASE_ANON_KEY) ||
    DEFAULT_SERVICE_KEY;

  return createClient(supabaseUrl, supabaseServiceKey, {
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
  const supabaseUrl =
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    sanitize(process.env.SUPABASE_URL) ||
    DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    sanitize(process.env.SUPABASE_ANON_KEY) ||
    DEFAULT_ANON_KEY;

  return createClient(supabaseUrl, supabaseAnonKey);
}
