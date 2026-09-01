import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CORRECT_URL = 'https://bzrrbbaqzlfmertirbak.supabase.co';
const CORRECT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6cnJiYmFxemxmbWVydGlyYmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk1OTYzOCwiZXhwIjoyMTAzNTM1NjM4fQ.YfNFyyNHbjF9kYF48uNWchYvQuI_PGaIC-2LNE2UktE';

export async function GET(req: NextRequest) {
  const results: Record<string, any> = {};

  try {
    // Show what Vercel env vars contain
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '(not set)';
    const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '(not set)';
    
    results.env_url_raw = envUrl;
    results.env_url_correct = envUrl.includes('bzrrbbaqzlfmertirbak');
    results.using_url = CORRECT_URL;

    const supabase = createClient(CORRECT_URL, CORRECT_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Test 1: SELECT
    const { data: selectData, error: selectError } = await supabase
      .from('concursos')
      .select('id, sigla')
      .limit(2);
    results.select_test = { ok: !selectError, count: selectData?.length, error: selectError?.message };

    // Test 2: INSERT + DELETE
    const testEmail = `diag_${Date.now()}@test.com`;
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        nome: 'Diag Test',
        apelido: `diag_${Date.now()}`,
        email: testEmail,
        senha_hash: 'abcdef1234567890',
      })
      .select('id')
      .single();
    results.insert_test = { ok: !insertError, id: insertData?.id, error: insertError?.message };

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
