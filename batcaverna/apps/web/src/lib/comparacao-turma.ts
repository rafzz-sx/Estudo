import type { SupabaseClient } from '@supabase/supabase-js';
import { lerTudo } from '@/lib/contagens';

/**
 * Comparação anônima com quem estuda mais.
 *
 * O ranking mostra ADVERSÁRIOS: quem está na sua frente e por quanto. Motiva
 * quem já está bem colocado e desanima o resto — que é a maioria, por
 * definição. Isto aqui mostra o ALVO: "quem resolveu 1.200+ questões de
 * Matemática acerta 78%; você está em 61%".
 *
 * A diferença prática é que o alvo é alcançável e diz o caminho (volume), em
 * vez de depender de os outros irem mal.
 *
 * ─── Privacidade ────────────────────────────────────────────────────────────
 * Nada aqui identifica ninguém: só médias de grupo, e um grupo só é publicado
 * a partir de `MINIMO_NO_GRUPO` alunos. Quem desligou "aparecer no ranking"
 * fica de fora também daqui — a pessoa disse que não quer que o desempenho
 * dela vire número para os outros, e agregado continua sendo desempenho dela.
 */

/** Quantas questões numa matéria para o aluno entrar no grupo dedicado. */
const VOLUME_DEDICADO = 150;

/** Abaixo disto o grupo não é publicado: nem é anônimo, nem significa nada. */
const MINIMO_NO_GRUPO = 5;

/** Quantas questões o próprio aluno precisa ter para a comparação ser justa. */
const MINIMO_DO_ALUNO = 20;

/** O agregado muda devagar; recalcular a cada visita seria desperdício. */
const CACHE_MS = 15 * 60 * 1000;

export interface ComparacaoMateria {
  materia_id: string;
  materia: string;
  emoji: string | null;
  /** Taxa do grupo que resolveu muito, de 0 a 100. */
  taxa_dedicados: number;
  /** Quantos alunos formam esse grupo. Nunca menor que MINIMO_NO_GRUPO. */
  alunos_no_grupo: number;
  /** Quantas questões, em média, o grupo resolveu nesta matéria. */
  media_questoes_grupo: number;
  /** Taxa do próprio aluno, de 0 a 100. */
  sua_taxa: number;
  suas_questoes: number;
  /** Positivo = o grupo está à frente. */
  diferenca: number;
}

interface LinhaStats {
  user_id: string;
  materia_id: string;
  questoes_respondidas: number | null;
  acertos: number | null;
}

interface Agregado {
  porMateria: Map<
    string,
    { alunos: number; questoes: number; acertos: number; volumeMedio: number }
  >;
  validoAte: number;
}

const cache = new Map<string, Agregado>();

/**
 * Média do grupo dedicado, por matéria, num concurso.
 *
 * O cache é por instância serverless. Várias instâncias significam várias
 * cópias do mesmo agregado — o que não é problema: é leitura, e uma diferença
 * de minutos entre instâncias não muda nada para o aluno.
 */
async function agregadoDoConcurso(
  supabase: SupabaseClient,
  concursoId: string
): Promise<Agregado['porMateria']> {
  const agora = Date.now();
  const guardado = cache.get(concursoId);
  if (guardado && guardado.validoAte > agora) return guardado.porMateria;

  // Quem pediu para não aparecer no ranking também não entra no agregado.
  const ocultos = new Set(
    (
      await lerTudo<{ user_id: string }>(() =>
        supabase
          .from('user_privacy_settings')
          .select('user_id')
          .eq('ocultar_do_ranking', true)
      )
    ).map((o) => o.user_id)
  );

  const linhas = await lerTudo<LinhaStats>(() =>
    supabase
      .from('user_materia_stats')
      .select('user_id, materia_id, questoes_respondidas, acertos')
      .eq('concurso_id', concursoId)
      .gte('questoes_respondidas', VOLUME_DEDICADO)
  );

  const porMateria = new Map<
    string,
    { alunos: number; questoes: number; acertos: number; volumeMedio: number }
  >();

  for (const l of linhas) {
    if (ocultos.has(l.user_id)) continue;
    const total = l.questoes_respondidas ?? 0;
    if (total < VOLUME_DEDICADO) continue;

    const atual =
      porMateria.get(l.materia_id) ??
      { alunos: 0, questoes: 0, acertos: 0, volumeMedio: 0 };

    porMateria.set(l.materia_id, {
      alunos: atual.alunos + 1,
      questoes: atual.questoes + total,
      acertos: atual.acertos + (l.acertos ?? 0),
      volumeMedio: 0,
    });
  }

  for (const [id, v] of porMateria) {
    if (v.alunos < MINIMO_NO_GRUPO) {
      porMateria.delete(id);
      continue;
    }
    v.volumeMedio = Math.round(v.questoes / v.alunos);
  }

  cache.set(concursoId, { porMateria, validoAte: agora + CACHE_MS });
  return porMateria;
}

/**
 * Compara o aluno com o grupo dedicado, matéria a matéria.
 *
 * Devolve lista vazia quando não há grupo publicável — plataforma nova, ou
 * concurso com poucos alunos. Nesse caso a tela não mostra a seção, em vez de
 * mostrar um comparativo inventado.
 */
export async function compararComTurma(
  supabase: SupabaseClient,
  userId: string,
  concursoId: string
): Promise<ComparacaoMateria[]> {
  const grupo = await agregadoDoConcurso(supabase, concursoId);
  if (grupo.size === 0) return [];

  const { data: meus } = await supabase
    .from('user_materia_stats')
    .select('materia_id, questoes_respondidas, acertos, materias (nome, icone_emoji)')
    .eq('user_id', userId)
    .eq('concurso_id', concursoId)
    .gte('questoes_respondidas', MINIMO_DO_ALUNO);

  const saida: ComparacaoMateria[] = [];

  for (const m of (meus ?? []) as any[]) {
    const g = grupo.get(m.materia_id);
    if (!g) continue;

    const minhas = m.questoes_respondidas ?? 0;
    if (minhas <= 0) continue;

    const suaTaxa = ((m.acertos ?? 0) / minhas) * 100;
    const taxaGrupo = (g.acertos / g.questoes) * 100;

    saida.push({
      materia_id: m.materia_id,
      materia: m.materias?.nome ?? 'Matéria',
      emoji: m.materias?.icone_emoji ?? null,
      taxa_dedicados: Number(taxaGrupo.toFixed(1)),
      alunos_no_grupo: g.alunos,
      media_questoes_grupo: g.volumeMedio,
      sua_taxa: Number(suaTaxa.toFixed(1)),
      suas_questoes: minhas,
      diferenca: Number((taxaGrupo - suaTaxa).toFixed(1)),
    });
  }

  // Maior distância primeiro: é onde há mais a ganhar.
  return saida.sort((a, b) => b.diferenca - a.diferenca);
}
