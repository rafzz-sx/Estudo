import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/app-info — Retorna versão atual e data de atualização
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('app_info')
      .select('versao_atual, atualizado_em')
      .order('atualizado_em', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // Fallback se não houver registro na tabela
      return NextResponse.json({
        success: true,
        data: {
          versao_atual: '1.1.0',
          atualizado_em: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/app-info error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar informações do app' },
      { status: 500 }
    );
  }
}
