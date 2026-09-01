import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CORRECT_URL = 'https://bzrrbbaqzlfmertirbak.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {};

  try {
    // Check ALL env vars related to supabase
    results.env_vars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '(not set)',
      SUPABASE_URL: process.env.SUPABASE_URL || '(not set)',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...)` : '(not set)',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...)` : '(not set)',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : '(not set)',
    };

    // Test with hardcoded SERVICE key (bypasses RLS)
    const supabase = createClient(CORRECT_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Test INSERT with service key
    const testEmail = `diag2_${Date.now()}@test.com`;
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        nome: 'Diag2 Test',
        apelido: `diag2_${Date.now()}`,
        email: testEmail,
        senha_hash: 'abcdef1234567890',
      })
      .select('id')
      .single();
    results.insert_with_service_key = { ok: !insertError, id: insertData?.id, error: insertError?.message };

    // Cleanup
    if (insertData?.id) {
      await supabase.from('users').delete().eq('id', insertData.id);
      results.cleanup = 'done';
    }

    return NextResponse.json(results);
  } catch (error: any) {
    results.catch_error = error?.message;
    return NextResponse.json(results, { status: 500 });
  }
}
