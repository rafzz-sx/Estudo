import { createClient, SupabaseClient } from '@supabase/supabase-js';

// URL padrão do projeto Supabase
const SUPABASE_DEFAULT_URL = 'https://bzrrbbaqzlfmertirbak.supabase.co';

function getUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(envUrl) ? envUrl : SUPABASE_DEFAULT_URL;
}

/**
 * Valida o formato de uma chave de API do Supabase (JWT 'eyJ...' ou formato moderno 'sb_...').
 */
function pareceChave(valor: string): boolean {
  return valor.length >= 40 && (/^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(valor) || /^sb_[\w-]+$/.test(valor));
}

/**
 * Cliente Supabase para uso no servidor (API routes).
 * Requer SUPABASE_SERVICE_ROLE_KEY configurada no ambiente.
 */
export function createServerSupabaseClient(): SupabaseClient {
  const envServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!pareceChave(envServiceKey)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[SEGURANÇA CRÍTICA] SUPABASE_SERVICE_ROLE_KEY não está definida nas variáveis de ambiente da produção.'
      );
    }
    console.warn(
      '[AVISO DEV] SUPABASE_SERVICE_ROLE_KEY ausente ou inválida. Configure seu arquivo .env.local.'
    );
  }

  return createClient(getUrl(), envServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Cliente Supabase para uso no browser (client-side).
 * Requer NEXT_PUBLIC_SUPABASE_ANON_KEY configurada no ambiente.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

  if (!pareceChave(envKey)) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[SEGURANÇA CRÍTICA] NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida no ambiente de produção.'
      );
    } else {
      console.warn(
        '[AVISO DEV] NEXT_PUBLIC_SUPABASE_ANON_KEY ausente ou inválida. Configure seu arquivo .env.local.'
      );
    }
  }

  return createClient(getUrl(), envKey);
}
