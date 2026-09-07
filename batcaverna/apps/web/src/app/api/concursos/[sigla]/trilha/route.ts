import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/concursos/[sigla]/trilha
 *
 * Monta a trilha de estudos do concurso: matérias na ordem de peso, e dentro
 * de cada uma os temas com teoria escrita, vídeo-aulas e quantas questões
 * existem para praticar. A trilha antes vinha de um objeto fixo no código
 * com quatro matérias inventadas.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sigla: string }> }
) {
  try {
    const { sigla } = await params;
    const supabase = createServerSupabaseClient();

    const { data: concurso } = await supabase
      .from('concursos')
      .select('id, sigla, nome, emoji, cor_tema, forca, etapas')
      .ilike('sigla', sigla)
      .maybeSingle();

    if (!concurso) {
      return NextResponse.json(
        { success: false, error: 'Concurso não encontrado' },
        { status: 404 }
      );
    }

    // ─── Questões deste concurso, para contar por matéria/assunto ──
    // O PostgREST corta em 1.000 linhas por requisição; aqui precisamos de
    // todas para agrupar por assunto, então paginamos explicitamente.
    const porMateria: Record<string, number> = {};
    const porAssunto: Record<string, number> = {};
    let totalQuestoes = 0;

    const PAGINA = 1000;
    for (let inicio = 0; inicio < 30000; inicio += PAGINA) {
      const { data: fatia } = await supabase
        .from('questoes')
        .select('materia_id, assunto_id')
        .eq('concurso_id', concurso.id)
        .eq('ativa', true)
        .range(inicio, inicio + PAGINA - 1);

      if (!fatia?.length) break;

      for (const q of fatia) {
        totalQuestoes++;
        if (q.materia_id) {
          porMateria[q.materia_id] = (porMateria[q.materia_id] ?? 0) + 1;
        }
        if (q.assunto_id) {
          porAssunto[q.assunto_id] = (porAssunto[q.assunto_id] ?? 0) + 1;
        }
      }

      if (fatia.length < PAGINA) break;
    }

    const materiaIds = Object.keys(porMateria);
    if (materiaIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { concurso, materias: [], total_questoes: 0 },
      });
    }

    const { data: materias } = await supabase
      .from('materias')
      .select('id, nome, descricao, icone_emoji')
      .in('id', materiaIds);

    // ─── Teoria e vídeo-aulas por matéria ────────────────────
    const { data: teorias } = await supabase
      .from('teoria_conteudo')
      .select('id, materia_id, tema, titulo, resumo, nivel, tempo_leitura_min, ordem')
      .in('materia_id', materiaIds)
      .order('ordem');

    const { data: videos } = await supabase
      .from('videoaulas')
      .select('id, materia_id, tema, titulo, descricao, provedor, video_id, canal, duracao_segundos, ordem')
      .in('materia_id', materiaIds)
      .eq('ativa', true)
      .order('ordem');

    // ─── Assuntos mais cobrados por matéria ──────────────────
    const assuntoIds = Object.keys(porAssunto);
    const { data: assuntos } = assuntoIds.length
      ? await supabase
          .from('assuntos')
          .select('id, materia_id, nome')
          .in('id', assuntoIds.slice(0, 1000))
      : { data: [] as any[] };

    // ─── Progresso do aluno ──────────────────────────────────
    const user = await getAuthUserFromRequest(req);
    const progressoPorMateria: Record<string, { respondidas: number; taxa: number }> = {};
    let teoriasConcluidas: string[] = [];

    if (user) {
      const { data: stats } = await supabase
        .from('user_materia_stats')
        .select('materia_id, questoes_respondidas, acertos')
        .eq('user_id', user.id)
        .eq('concurso_id', concurso.id);

      for (const s of stats ?? []) {
        const total = s.questoes_respondidas ?? 0;
        progressoPorMateria[s.materia_id] = {
          respondidas: total,
          taxa: total ? Number((((s.acertos ?? 0) / total) * 100).toFixed(1)) : 0,
        };
      }

      const { data: lidas } = await supabase
        .from('user_teoria_progresso')
        .select('teoria_id')
        .eq('user_id', user.id)
        .eq('concluido', true);
      teoriasConcluidas = (lidas ?? []).map((l) => l.teoria_id);
    }

    // ─── Montagem ────────────────────────────────────────────
    const resultado = (materias ?? [])
      .map((m) => {
        const temasDaMateria = new Map<
          string,
          { tema: string; teoria: any[]; videos: any[] }
        >();

        for (const t of teorias ?? []) {
          if (t.materia_id !== m.id) continue;
          const entrada = temasDaMateria.get(t.tema) ?? {
            tema: t.tema,
            teoria: [],
            videos: [],
          };
          entrada.teoria.push({
            ...t,
            concluido: teoriasConcluidas.includes(t.id),
          });
          temasDaMateria.set(t.tema, entrada);
        }

        for (const v of videos ?? []) {
          if (v.materia_id !== m.id || !v.tema) continue;
          const entrada = temasDaMateria.get(v.tema) ?? {
            tema: v.tema,
            teoria: [],
            videos: [],
          };
          entrada.videos.push(v);
          temasDaMateria.set(v.tema, entrada);
        }

        const assuntosDaMateria = (assuntos ?? [])
          .filter((a) => a.materia_id === m.id)
          .map((a) => ({ ...a, total_questoes: porAssunto[a.id] ?? 0 }))
          .sort((a, b) => b.total_questoes - a.total_questoes)
          .slice(0, 20);

        return {
          ...m,
          total_questoes: porMateria[m.id] ?? 0,
          progresso: progressoPorMateria[m.id] ?? { respondidas: 0, taxa: 0 },
          temas: [...temasDaMateria.values()],
          assuntos_mais_cobrados: assuntosDaMateria,
        };
      })
      .sort((a, b) => b.total_questoes - a.total_questoes);

    return NextResponse.json({
      success: true,
      data: {
        concurso,
        materias: resultado,
        // Era `questoes?.length` — variável que não existe neste escopo. A
        // contagem real vem do laço que pagina as questões acima. Além de
        // quebrar a compilação, o número certo é este: `questoes` seria no
        // máximo uma fatia de 1.000.
        total_questoes: totalQuestoes,
      },
    });
  } catch (error) {
    console.error('GET /api/concursos/[sigla]/trilha error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar a trilha' },
      { status: 500 }
    );
  }
}
