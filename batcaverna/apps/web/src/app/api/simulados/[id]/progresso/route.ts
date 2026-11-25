import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo } from '@/lib/seguranca';

/**
 * PATCH /api/simulados/[id]/progresso
 * Salva respostas parciais do simulado em andamento no banco (auto-save silencioso),
 * protegendo contra perda de bateria, limpeza de cache ou troca de aba no celular.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const simuladoId = uuidOuNulo(id);
    if (!simuladoId) {
      return NextResponse.json(
        { success: false, error: 'Simulado inválido' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const respostasBrutas = body?.respostas;
    if (!respostasBrutas || typeof respostasBrutas !== 'object' || Array.isArray(respostasBrutas)) {
      return NextResponse.json(
        { success: false, error: 'Formato de respostas inválido' },
        { status: 400 }
      );
    }

    // Sanitiza para guardar apenas mapa { questao_id: "A".."E" }
    const respostasLimpas: Record<string, string> = {};
    for (const [k, v] of Object.entries(respostasBrutas)) {
      const qId = uuidOuNulo(k);
      const letra = String(v ?? '').trim().toUpperCase();
      if (qId && /^[A-E]$/.test(letra)) {
        respostasLimpas[qId] = letra;
      }
    }

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('simulados')
      .update({ respostas: respostasLimpas })
      .eq('id', simuladoId)
      .eq('user_id', user.id)
      .is('finalizado_em', null);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      salvas: Object.keys(respostasLimpas).length,
    });
  } catch (error) {
    console.error('PATCH /api/simulados/[id]/progresso error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar progresso parcial' },
      { status: 500 }
    );
  }
}
