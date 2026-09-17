import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { limparTexto, uuidOuNulo } from '@/lib/seguranca';
import { contarPalavras, estimarLinhas, degrauValido } from '@/lib/redacao';

/**
 * GET  /api/redacao  — temas disponíveis + as redações do aluno
 * POST /api/redacao  — grava uma redação nova
 * PATCH /api/redacao — grava a autoavaliação de uma redação existente
 *
 * A plataforma NÃO corrige a redação. A nota é a autoavaliação do aluno,
 * feita com o descritor oficial de cada competência na frente — ver
 * `lib/redacao.ts` para o porquê dessa escolha.
 */

const MAX_TEXTO = 20_000;
const MIN_TEXTO = 200;

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const supabase = createServerSupabaseClient();

    let temasData: any[] = [];
    let minhasData: any[] = [];

    const temasRes = await supabase
      .from('redacao_temas')
      .select('id, titulo, ano, origem, textos_apoio, fonte_url, concurso_id')
      .eq('ativo', true)
      .order('ano', { ascending: false, nullsFirst: false })
      .limit(100);

    temasData = temasRes.data ?? [];

    // Tenta buscar com matriz_id, com fallback caso a coluna ainda não tenha sido criada
    const minhasResComMatriz = await supabase
      .from('redacoes')
      .select(
        'id, tema_id, tema_titulo, matriz_id, palavras, linhas, c1, c2, c3, c4, c5, nota_total, avaliada_em, anotacoes, criado_em'
      )
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(50);

    if (minhasResComMatriz.error && (minhasResComMatriz.error.code === '42703' || minhasResComMatriz.error.message?.includes('matriz_id'))) {
      const minhasResBase = await supabase
        .from('redacoes')
        .select(
          'id, tema_id, tema_titulo, palavras, linhas, c1, c2, c3, c4, c5, nota_total, avaliada_em, anotacoes, criado_em'
        )
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(50);
      minhasData = (minhasResBase.data ?? []).map((r: any) => ({ ...r, matriz_id: 'enem' }));
    } else {
      minhasData = minhasResComMatriz.data ?? [];
    }

    return NextResponse.json({
      success: true,
      data: {
        temas: temasData,
        minhas: minhasData,
      },
    });
  } catch (error) {
    console.error('GET /api/redacao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar as redações' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const texto = limparTexto(body?.texto, MAX_TEXTO);

    if (!texto || texto.length < MIN_TEXTO) {
      return NextResponse.json(
        {
          success: false,
          error: `A redação precisa ter pelo menos ${MIN_TEXTO} caracteres. Uma dissertação de 30 linhas tem bem mais que isso.`,
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const temaId = uuidOuNulo(body?.tema_id);
    const matrizId = ['enem', 'militar', 'cebraspe'].includes(body?.matriz_id)
      ? body.matriz_id
      : 'enem';

    // O título fica gravado na própria redação: sem isso, apagar um tema
    // deixaria o histórico do aluno sem saber sobre o que ele escreveu.
    let titulo = limparTexto(body?.tema_titulo, 500) ?? '';

    if (temaId) {
      const { data: tema } = await supabase
        .from('redacao_temas')
        .select('titulo')
        .eq('id', temaId)
        .maybeSingle();
      if (tema?.titulo) titulo = tema.titulo;
    }

    if (!titulo) {
      return NextResponse.json(
        { success: false, error: 'Escolha um tema antes de enviar.' },
        { status: 400 }
      );
    }

    const tempo = Number(body?.tempo_segundos);

    const basePayload = {
      user_id: user.id,
      tema_id: temaId,
      tema_titulo: titulo,
      texto,
      palavras: contarPalavras(texto),
      linhas: estimarLinhas(texto),
      tempo_segundos: Number.isFinite(tempo) && tempo > 0 ? Math.floor(tempo) : null,
    };

    let data: any = null;

    // Tentativa 1: Inserir com matriz_id
    const resComMatriz = await supabase
      .from('redacoes')
      .insert({ ...basePayload, matriz_id: matrizId })
      .select(
        'id, tema_id, tema_titulo, matriz_id, palavras, linhas, c1, c2, c3, c4, c5, nota_total, avaliada_em, criado_em'
      )
      .single();

    if (resComMatriz.error && (resComMatriz.error.code === '42703' || resComMatriz.error.message?.includes('matriz_id'))) {
      // Fallback: se a coluna matriz_id ainda não existir no banco
      const resBase = await supabase
        .from('redacoes')
        .insert(basePayload)
        .select(
          'id, tema_id, tema_titulo, palavras, linhas, c1, c2, c3, c4, c5, nota_total, avaliada_em, criado_em'
        )
        .single();

      if (resBase.error) throw resBase.error;
      data = { ...resBase.data, matriz_id: matrizId };
    } else if (resComMatriz.error) {
      throw resComMatriz.error;
    } else {
      data = resComMatriz.data;
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/redacao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gravar a redação' },
      { status: 500 }
    );
  }
}

/**
 * PATCH — a autoavaliação.
 *
 * Cada competência aceita apenas os degraus oficiais (0/40/80/120/160/200).
 * O banco tem a mesma trava num CHECK: um cliente falando direto com ele não
 * grava 137 e não suja o histórico com número que a rubrica não tem.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const id = uuidOuNulo(body?.id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Redação não encontrada' },
        { status: 404 }
      );
    }

    const notas = {
      c1: degrauValido(body?.c1),
      c2: degrauValido(body?.c2),
      c3: degrauValido(body?.c3),
      c4: degrauValido(body?.c4),
      c5: degrauValido(body?.c5),
    };

    const faltando = Object.entries(notas)
      .filter(([, v]) => v === null)
      .map(([k]) => k.toUpperCase());

    if (faltando.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Avalie todas as competências, usando os degraus oficiais (0, 40, 80, 120, 160, 200). Falta: ${faltando.join(', ')}.`,
        },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('redacoes')
      .update({
        ...notas,
        anotacoes: limparTexto(body?.anotacoes, 4000),
        avaliada_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      // Amarra ao dono na própria consulta: a redação de outra pessoa não é
      // encontrada, em vez de ser encontrada e recusada depois.
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, c1, c2, c3, c4, c5, nota_total, avaliada_em, anotacoes')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Redação não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PATCH /api/redacao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gravar a avaliação' },
      { status: 500 }
    );
  }
}
