import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * Versão de reserva, usada só quando `app_info` está vazia.
 * Mantenha em sincronia com o último seed `versao_*.sql`.
 */
const VERSAO_APP = '2.9.0';

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
      // Data truncada na hora (SOMENTE A HORA SEM OS MINUTOS)
      const dataHoraCheia = new Date();
      dataHoraCheia.setMinutes(0, 0, 0);

      return NextResponse.json({
        success: true,
        data: {
          versao_atual: VERSAO_APP,
          atualizado_em: dataHoraCheia.toISOString(),
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
