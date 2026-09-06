import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { contarPorId } from '@/lib/contagens';

/**
 * Cronograma de estudos por edital.
 *
 * O peso de cada matéria não é arbitrado: é a fração que ela ocupa no banco
 * de questões oficiais daquele concurso. Se Matemática é 30% da prova da
 * EEAR, ela recebe 30% das horas do plano.
 */

/** Distribui minutos entre matérias pelo peso, sem perder nem inventar tempo. */
function distribuirMinutos(
  pesos: { id: string; peso: number }[],
  minutosTotais: number
): Record<string, number> {
  const somaPesos = pesos.reduce((a, p) => a + p.peso, 0) || 1;

  const bruto = pesos.map((p) => ({
    id: p.id,
    exato: (p.peso / somaPesos) * minutosTotais,
  }));

  // Arredonda para baixo e devolve o resto para quem tem a maior fração
  // perdida — assim a soma bate exatamente com o total planejado.
  const resultado: Record<string, number> = {};
  let distribuido = 0;
  for (const b of bruto) {
    resultado[b.id] = Math.floor(b.exato);
    distribuido += resultado[b.id];
  }

  const sobra = minutosTotais - distribuido;
  const porFracao = [...bruto].sort(
    (a, b) => (b.exato % 1) - (a.exato % 1)
  );
  for (let i = 0; i < sobra && i < porFracao.length; i++) {
    resultado[porFracao[i].id] += 1;
  }

  return resultado;
}

/** GET /api/planos — planos do usuário com os itens da semana atual. */
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

    const { data: planos } = await supabase
      .from('planos_estudo')
      .select('*, concursos (sigla, nome, emoji, cor_tema)')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .order('criado_em', { ascending: false });

    if (!planos?.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: itens } = await supabase
      .from('plano_itens')
      .select('*, materias (nome, icone_emoji)')
      .in(
        'plano_id',
        planos.map((p) => p.id)
      )
      .order('semana')
      .order('ordem');

    const hoje = new Date().toISOString().slice(0, 10);

    const resultado = planos.map((p) => {
      const meus = (itens ?? []).filter((i) => i.plano_id === p.id);
      const concluidos = meus.filter((i) => i.concluido).length;

      const diasRestantes = Math.max(
        0,
        Math.ceil(
          (new Date(`${p.data_prova}T00:00:00`).getTime() -
            new Date(`${hoje}T00:00:00`).getTime()) /
            86_400_000
        )
      );

      return {
        ...p,
        itens: meus,
        total_itens: meus.length,
        concluidos,
        progresso: meus.length
          ? Number(((concluidos / meus.length) * 100).toFixed(1))
          : 0,
        dias_restantes: diasRestantes,
        atrasados: meus.filter((i) => !i.concluido && i.data_alvo < hoje).length,
        hoje: meus.filter((i) => i.data_alvo === hoje),
      };
    });

    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    console.error('GET /api/planos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar os planos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/planos — gera um cronograma.
 * Body: { concurso, data_prova, horas_por_semana, dias_semana? }
 */
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
    const supabase = createServerSupabaseClient();

    // ─── Concurso ────────────────────────────────────────────
    const { data: concurso } = await supabase
      .from('concursos')
      .select('id, sigla, nome')
      .ilike('sigla', String(body?.concurso ?? ''))
      .maybeSingle();

    if (!concurso) {
      return NextResponse.json(
        { success: false, error: 'Concurso não encontrado.' },
        { status: 400 }
      );
    }

    // ─── Datas ───────────────────────────────────────────────
    const dataProva = String(body?.data_prova ?? '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataProva)) {
      return NextResponse.json(
        { success: false, error: 'Informe a data da prova.' },
        { status: 400 }
      );
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prova = new Date(`${dataProva}T00:00:00`);
    const diasAte = Math.ceil((prova.getTime() - hoje.getTime()) / 86_400_000);

    if (diasAte < 7) {
      return NextResponse.json(
        {
          success: false,
          error:
            'A prova precisa estar a pelo menos uma semana de distância para valer a pena montar um cronograma.',
        },
        { status: 400 }
      );
    }

    const semanas = Math.floor(diasAte / 7);
    const horasSemana = Math.max(1, Math.min(60, Number(body?.horas_por_semana) || 10));
    const diasSemana: number[] = Array.isArray(body?.dias_semana) && body.dias_semana.length
      ? body.dias_semana.map(Number).filter((d: number) => d >= 0 && d <= 6)
      : [1, 2, 3, 4, 5];

    // ─── Peso das matérias = frequência real na prova ────────
    const { data: vinculos } = await supabase
      .from('concurso_materias')
      .select('materias (id, nome, icone_emoji)')
      .eq('concurso_id', concurso.id);

    const materias = (vinculos ?? [])
      .map((v: any) => v.materias)
      .filter(Boolean);

    if (!materias.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Este concurso ainda não tem matérias com questões cadastradas.',
        },
        { status: 400 }
      );
    }

    const contagem = await contarPorId(
      supabase,
      'materia_id',
      materias.map((m: any) => m.id),
      { concurso_id: concurso.id }
    );

    const comPeso = materias
      .map((m: any) => ({ ...m, peso: contagem[m.id] ?? 0 }))
      .filter((m: any) => m.peso > 0);

    if (!comPeso.length) {
      return NextResponse.json(
        { success: false, error: 'Não há questões cadastradas para este concurso.' },
        { status: 400 }
      );
    }

    // ─── Cria o plano ────────────────────────────────────────
    const { data: plano, error: planoErr } = await supabase
      .from('planos_estudo')
      .insert({
        user_id: user.id,
        concurso_id: concurso.id,
        nome: body?.nome
          ? String(body.nome).slice(0, 120)
          : `Rumo à aprovação — ${concurso.sigla}`,
        data_prova: dataProva,
        horas_por_semana: horasSemana,
        dias_semana: diasSemana,
      })
      .select()
      .single();

    if (planoErr) throw planoErr;

    // ─── Gera os itens semana a semana ───────────────────────
    const minutosSemana = horasSemana * 60;
    const distribuicao = distribuirMinutos(
      comPeso.map((m: any) => ({ id: m.id, peso: m.peso })),
      minutosSemana
    );

    // Assuntos mais cobrados de cada matéria, para dar nome ao item
    const assuntosPorMateria: Record<string, string[]> = {};
    for (const m of comPeso) {
      const { data: assuntos } = await supabase
        .from('assuntos')
        .select('nome')
        .eq('materia_id', m.id)
        .limit(40);
      assuntosPorMateria[m.id] = (assuntos ?? []).map((a) => a.nome);
    }

    const itens: any[] = [];
    // A última semana é de revisão e simulado, não de conteúdo novo.
    const semanasConteudo = Math.max(1, semanas - 1);

    for (let semana = 1; semana <= semanas; semana++) {
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(inicioSemana.getDate() + (semana - 1) * 7);

      // Semana final: reta de chegada
      if (semana === semanas && semanas > 1) {
        const dataAlvo = new Date(inicioSemana);
        dataAlvo.setDate(dataAlvo.getDate() + diasSemana[0]);

        itens.push({
          plano_id: plano.id,
          materia_id: null,
          titulo: 'Simulado completo em condições de prova',
          semana,
          data_alvo: dataAlvo.toISOString().slice(0, 10),
          minutos_alvo: 180,
          tipo: 'simulado',
          peso: 1,
          ordem: 0,
        });

        const dataRevisao = new Date(inicioSemana);
        dataRevisao.setDate(dataRevisao.getDate() + (diasSemana[1] ?? 2));

        itens.push({
          plano_id: plano.id,
          materia_id: null,
          titulo: 'Revisar o caderno de erros inteiro',
          semana,
          data_alvo: dataRevisao.toISOString().slice(0, 10),
          minutos_alvo: 120,
          tipo: 'revisar',
          peso: 1,
          ordem: 1,
        });
        continue;
      }

      let ordem = 0;
      for (const m of comPeso) {
        const minutos = distribuicao[m.id] ?? 0;
        if (minutos < 20) continue; // menos que isso não vira sessão de estudo

        const dia = diasSemana[ordem % diasSemana.length];
        const dataAlvo = new Date(inicioSemana);
        dataAlvo.setDate(dataAlvo.getDate() + dia);

        // Alterna teoria e questões; o assunto gira a cada semana para
        // cobrir a ementa em vez de repetir sempre o primeiro tópico.
        const assuntos = assuntosPorMateria[m.id] ?? [];
        const assunto = assuntos.length
          ? assuntos[(semana - 1) % assuntos.length]
          : null;

        const ehTeoria = semana % 3 === 1;

        itens.push({
          plano_id: plano.id,
          materia_id: m.id,
          titulo: assunto
            ? `${m.nome}: ${assunto}`
            : `${m.nome} — bateria de questões`,
          semana,
          data_alvo: dataAlvo.toISOString().slice(0, 10),
          minutos_alvo: minutos,
          tipo: ehTeoria ? 'estudar_teoria' : 'resolver_questoes',
          peso: Number(((m.peso / comPeso.reduce((a: number, x: any) => a + x.peso, 0)) * 100).toFixed(2)),
          ordem: ordem++,
        });
      }
    }

    // Insere em lotes
    for (let i = 0; i < itens.length; i += 500) {
      await supabase.from('plano_itens').insert(itens.slice(i, i + 500));
    }

    return NextResponse.json({
      success: true,
      data: {
        plano_id: plano.id,
        semanas,
        total_itens: itens.length,
        distribuicao: comPeso.map((m: any) => ({
          materia: m.nome,
          emoji: m.icone_emoji,
          questoes: m.peso,
          minutos_semana: distribuicao[m.id] ?? 0,
        })),
      },
      message: `Cronograma de ${semanas} semanas criado para ${concurso.sigla}.`,
    });
  } catch (error) {
    console.error('POST /api/planos error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar o cronograma' },
      { status: 500 }
    );
  }
}
