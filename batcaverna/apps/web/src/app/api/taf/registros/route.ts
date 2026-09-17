import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { limparTexto, uuidOuNulo } from '@/lib/seguranca';

/**
 * Registro de treino do TAF.
 *
 * Em concurso militar o TAF elimina: quem gabarita a escrita e não faz a
 * corrida de 12 minutos não entra. A plataforma mostrava só a tabela de
 * índices mínimos — isso informa, não treina.
 *
 * GET  /api/taf/registros?concurso=EEAR   → série do aluno, por exercício
 * POST /api/taf/registros                 → grava uma marca
 * DELETE /api/taf/registros?id=<uuid>     → apaga uma marca própria
 */

/** Uma marca por dia por exercício já é bastante; mais que isso é engano. */
const MAX_REGISTROS = 400;

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sigla = searchParams.get('concurso');
    const supabase = createServerSupabaseClient();

    let concursoId: string | null = null;
    if (sigla) {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', sigla)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({ success: true, data: { series: [] } });
      }
      concursoId = data.id;
    }

    let query = supabase
      .from('taf_registros')
      .select('id, exercicio, unidade, valor, maior_melhor, data_treino, observacao')
      .eq('user_id', user.id)
      .order('data_treino', { ascending: true })
      .limit(MAX_REGISTROS);

    if (concursoId) query = query.eq('concurso_id', concursoId);

    const { data, error } = await query;
    if (error) throw error;

    // Agrupa por exercício: é assim que a tela desenha, uma curva por prova.
    const porExercicio = new Map<
      string,
      {
        exercicio: string;
        unidade: string;
        maior_melhor: boolean;
        marcas: {
          id: string;
          valor: number;
          data_treino: string;
          observacao: string | null;
        }[];
      }
    >();

    for (const r of data ?? []) {
      const grupo = porExercicio.get(r.exercicio) ?? {
        exercicio: r.exercicio,
        unidade: r.unidade,
        maior_melhor: r.maior_melhor,
        marcas: [] as any[],
      };
      grupo.marcas.push({
        id: r.id,
        valor: Number(r.valor),
        data_treino: r.data_treino,
        observacao: r.observacao,
      });
      porExercicio.set(r.exercicio, grupo);
    }

    const series = [...porExercicio.values()].map((g) => {
      const valores = g.marcas.map((m) => m.valor);
      const melhor = g.maior_melhor ? Math.max(...valores) : Math.min(...valores);
      const primeira = valores[0];
      const ultima = valores[valores.length - 1];

      return {
        ...g,
        melhor,
        primeira,
        ultima,
        // Positivo = melhorou, sempre — mesmo em prova de tempo, onde o
        // número cai quando o desempenho sobe. Deixar o sinal cru aqui faria
        // a tela mostrar "-12s" como piora.
        evolucao: g.maior_melhor ? ultima - primeira : primeira - ultima,
        total: g.marcas.length,
      };
    });

    return NextResponse.json({ success: true, data: { series } });
  } catch (error) {
    console.error('GET /api/taf/registros error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar seus treinos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const supabase = createServerSupabaseClient();

    // O concurso pode vir por id ou por sigla — a tela do TAF tem a sigla.
    let concursoId = uuidOuNulo(body?.concurso_id);
    if (!concursoId && body?.concurso) {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', String(body.concurso))
        .maybeSingle();
      concursoId = data?.id ?? null;
    }

    const exercicio = limparTexto(body?.exercicio, 80);
    const unidade = limparTexto(body?.unidade, 24);
    const valor = Number(body?.valor);

    if (!concursoId || !exercicio || !unidade) {
      return NextResponse.json(
        { success: false, error: 'Informe o concurso, o exercício e a unidade.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(valor) || valor < 0 || valor > 100_000) {
      return NextResponse.json(
        { success: false, error: 'Marca inválida.' },
        { status: 400 }
      );
    }

    // Data no futuro mediria expectativa, não desempenho.
    const hoje = new Date().toISOString().slice(0, 10);
    const dataTreino =
      typeof body?.data_treino === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.data_treino) &&
      body.data_treino <= hoje
        ? body.data_treino
        : hoje;

    const { data, error } = await supabase
      .from('taf_registros')
      .insert({
        user_id: user.id,
        concurso_id: concursoId,
        exercicio,
        unidade,
        valor,
        maior_melhor: body?.maior_melhor !== false,
        data_treino: dataTreino,
        observacao: limparTexto(body?.observacao, 280),
      })
      .select('id, exercicio, unidade, valor, data_treino')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/taf/registros error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar o treino' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const id = uuidOuNulo(new URL(req.url).searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ success: false, error: 'Registro inválido' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // O filtro por user_id é o que impede apagar o treino de outra pessoa.
    const { error } = await supabase
      .from('taf_registros')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/taf/registros error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao apagar o registro' },
      { status: 500 }
    );
  }
}
