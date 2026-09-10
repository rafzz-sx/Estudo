import type { SupabaseClient } from '@supabase/supabase-js';
import { lerTudo } from '@/lib/contagens';

/**
 * Como a prova de cada banca se reparte entre as matérias.
 *
 * O simulado "Formato da banca" acertava a QUANTIDADE e a DURAÇÃO (60 questões
 * em 240 minutos, para a EEAR) e sorteava as questões uniformemente do
 * concurso inteiro. Só que nenhuma banca distribui uniformemente: a EEAR cobra
 * Matemática e Física em proporções específicas, e um sorteio uniforme entrega
 * uma prova que não se parece com a prova.
 *
 * Duas fontes, nesta ordem:
 *
 *   1. `concurso_materias.peso_na_prova` — o peso declarado do edital, quando
 *      alguém o cadastrou. É a verdade, quando existe.
 *   2. a distribuição REAL das provas oficiais já importadas. É o mesmo
 *      princípio que o resto da plataforma usa ("Base: provas oficiais"):
 *      em vez de afirmar o que não se pode verificar, conta o que de fato
 *      caiu. Se a EEAR cobrou 22 de Matemática em 60 nos últimos anos, é essa
 *      a proporção.
 *
 * A fonte usada volta em `origem`, para a tela poder ser honesta sobre de onde
 * o número veio.
 */

export interface FatiaMateria {
  materia_id: string;
  nome: string;
  emoji: string | null;
  /** Quantas questões desta matéria existem no banco, para este concurso. */
  disponiveis: number;
  /** Fração da prova, de 0 a 1. Somadas, as fatias dão 1. */
  peso: number;
  origem: 'edital' | 'banco';
}

interface LinhaQuestao {
  materia_id: string | null;
}

interface LinhaMateria {
  materia_id: string;
  peso_na_prova: number | null;
  materias: { id: string; nome: string; icone_emoji: string | null } | null;
}

/**
 * Distribuição da prova por matéria, já normalizada (as frações somam 1).
 *
 * Matéria sem nenhuma questão no banco fica de fora: não adianta reservar 12
 * vagas de Física numa prova se não há Física cadastrada — o sorteio devolveria
 * menos questões que o prometido.
 */
/**
 * Cache da distribuição, por concurso.
 *
 * A conta varre TODAS as questões do concurso — 1.656 no ENEM, duas páginas
 * de 1.000 no PostgREST — e ela é pedida em dois caminhos quentes: a cada
 * carga do dashboard (via `projetarNota`) e a cada simulado no formato da
 * banca. Sem cache, seriam duas viagens ao banco por visita ao dashboard,
 * para um número que só muda quando alguém importa uma prova nova.
 *
 * 30 minutos: importar prova é evento raro, e meia hora de defasagem não
 * muda nada para o aluno. Cache por instância serverless, como o das frases
 * motivacionais — é leitura, várias cópias não fazem mal.
 */
const CACHE_MS = 30 * 60 * 1000;
const cacheDistribuicao = new Map<
  string,
  { fatias: FatiaMateria[]; validoAte: number }
>();

export async function distribuicaoDaProva(
  supabase: SupabaseClient,
  concursoId: string
): Promise<FatiaMateria[]> {
  const agora = Date.now();
  const guardado = cacheDistribuicao.get(concursoId);
  if (guardado && guardado.validoAte > agora) return guardado.fatias;

  const fatias = await calcularDistribuicao(supabase, concursoId);

  // Só guarda resultado útil: um erro passageiro de rede não pode deixar o
  // concurso sem distribuição por meia hora.
  if (fatias.length > 0) {
    cacheDistribuicao.set(concursoId, { fatias, validoAte: agora + CACHE_MS });
  }

  return fatias;
}

async function calcularDistribuicao(
  supabase: SupabaseClient,
  concursoId: string
): Promise<FatiaMateria[]> {
  // ─── Quantas questões existem por matéria ────────────────
  const questoes = await lerTudo<LinhaQuestao>(() =>
    supabase
      .from('questoes')
      .select('materia_id')
      .eq('concurso_id', concursoId)
      .eq('ativa', true)
  );

  const disponiveis = new Map<string, number>();
  for (const q of questoes) {
    if (!q.materia_id) continue;
    disponiveis.set(q.materia_id, (disponiveis.get(q.materia_id) ?? 0) + 1);
  }

  if (disponiveis.size === 0) return [];

  // ─── Pesos declarados, se houver ─────────────────────────
  const { data: vinculos } = await supabase
    .from('concurso_materias')
    .select('materia_id, peso_na_prova, materias (id, nome, icone_emoji)')
    .eq('concurso_id', concursoId);

  const linhas = (vinculos ?? []) as unknown as LinhaMateria[];
  const info = new Map<string, { nome: string; emoji: string | null }>();
  for (const v of linhas) {
    if (v.materias) {
      info.set(v.materia_id, {
        nome: v.materias.nome,
        emoji: v.materias.icone_emoji,
      });
    }
  }

  // Só vale como "edital" se houver peso para TODAS as matérias que têm
  // questão. Um peso pela metade misturaria as duas fontes e daria uma
  // distribuição que não é nem a do edital nem a das provas.
  const pesoDeclarado = new Map<string, number>();
  for (const v of linhas) {
    if (v.peso_na_prova != null && v.peso_na_prova > 0 && disponiveis.has(v.materia_id)) {
      pesoDeclarado.set(v.materia_id, Number(v.peso_na_prova));
    }
  }

  const usarEdital = pesoDeclarado.size === disponiveis.size;
  const origem: FatiaMateria['origem'] = usarEdital ? 'edital' : 'banco';

  const bruto = new Map<string, number>();
  for (const [materiaId, quantas] of disponiveis) {
    bruto.set(materiaId, usarEdital ? (pesoDeclarado.get(materiaId) ?? 0) : quantas);
  }

  const soma = [...bruto.values()].reduce((a, b) => a + b, 0);
  if (soma <= 0) return [];

  // Faltando o nome (matéria com questão mas sem vínculo em
  // `concurso_materias`), buscamos direto — melhor que exibir "—".
  const semNome = [...disponiveis.keys()].filter((id) => !info.has(id));
  if (semNome.length) {
    const { data } = await supabase
      .from('materias')
      .select('id, nome, icone_emoji')
      .in('id', semNome);

    for (const m of data ?? []) {
      info.set(m.id, { nome: m.nome, emoji: m.icone_emoji });
    }
  }

  return [...bruto.entries()]
    .map(([materiaId, valor]) => ({
      materia_id: materiaId,
      nome: info.get(materiaId)?.nome ?? 'Outros',
      emoji: info.get(materiaId)?.emoji ?? null,
      disponiveis: disponiveis.get(materiaId) ?? 0,
      peso: valor / soma,
      origem,
    }))
    .sort((a, b) => b.peso - a.peso);
}

/**
 * Nota de corte de referência, em percentual de acerto.
 *
 * ─── LEIA ANTES DE USAR ESTE NÚMERO ──────────────────────────────────────
 * Nota de corte NÃO é fixa. Ela muda todo ano, muda por especialidade e, em
 * vários desses concursos, é definida pela classificação e pelo número de
 * vagas — não por um mínimo absoluto. Um ano com prova difícil derruba o
 * corte; uma especialidade concorrida sobe.
 *
 * O que está aqui é uma FAIXA DE REFERÊNCIA histórica, para o aluno ter um
 * alvo em vez de um número solto. As telas dizem isso com todas as letras.
 *
 * Vivia dentro de `api/simulados/historico/route.ts`. Passou para cá quando a
 * projeção de nota passou a precisar do mesmo número: duas cópias de uma
 * tabela dessas divergem na primeira vez que alguém corrigir só uma.
 */
export const REFERENCIA_APROVACAO: Record<
  string,
  { percentual: number; nota: string }
> = {
  ESA: { percentual: 80, nota: 'ampla concorrência geral (~78% a 84%, média ~8.0)' },
  EEAR: { percentual: 78, nota: 'corte real (~74% não-BCT a 85% BCT)' },
  ESPCEX: { percentual: 75, nota: 'ampla concorrência (~72% Masc / ~80% Fem)' },
  EPCAR: { percentual: 78, nota: 'alta concorrência (~76% a 82%)' },
  CN: { percentual: 68, nota: 'prova de alto nível técnico (~65% a 72%)' },
  EFOMM: { percentual: 70, nota: 'CIAGA e CIABA (~68% a 75%)' },
  EAM: { percentual: 65, nota: 'média de corte por Distrito Naval (~62% a 70%)' },
  IME: { percentual: 62, nota: '1ª fase objetiva (~60% a 66% + mín. 50% por matéria)' },
  ENEM: { percentual: 72, nota: 'ampla em cursos concorridos (~70% a 76%+ acertos)' },
};

/**
 * Reparte `total` vagas entre as fatias, respeitando os pesos.
 *
 * Usa o método do MAIOR RESTO (Hare-Niemeyer, o mesmo das eleições
 * proporcionais): distribui a parte inteira e depois entrega as vagas que
 * sobraram às maiores frações. Arredondar cada fatia por conta própria daria
 * 59 ou 61 questões numa prova de 60 — e uma prova de 61 questões não é a
 * prova da banca.
 *
 * Nunca pede de uma matéria mais questões do que existem: o excedente volta
 * para a repartição entre as demais.
 */
export function repartirVagas(
  total: number,
  fatias: FatiaMateria[]
): Map<string, number> {
  const vagas = new Map<string, number>();
  if (total <= 0 || fatias.length === 0) return vagas;

  // ─── 1. Trava quem não cabe, uma matéria de cada vez ─────
  //
  // Uma matéria cuja fatia ideal passa do que ela tem no banco é fixada no
  // estoque dela e sai da divisão; o que sobra é redividido entre as demais.
  // Repete até ninguém mais estourar.
  //
  // A primeira versão fazia passadas de resto-maior sucessivas em vez disto,
  // e tinha um viés que o teste pegou: matéria de peso mínimo com estoque
  // ganhava +1 a cada passada, tirando da matéria de maior peso — num caso
  // real, a principal recebia 34 onde devia receber 35,6.
  let restante = total;
  let pool = fatias.filter((f) => f.disponiveis > 0);

  for (;;) {
    const somaPeso = pool.reduce((a, f) => a + f.peso, 0);
    if (somaPeso <= 0 || pool.length === 0 || restante <= 0) break;

    const estouraram = pool.filter(
      (f) => (f.peso / somaPeso) * restante >= f.disponiveis
    );
    if (estouraram.length === 0) break;

    for (const f of estouraram) {
      vagas.set(f.materia_id, f.disponiveis);
      restante -= f.disponiveis;
    }
    pool = pool.filter((f) => !estouraram.includes(f));
  }

  // ─── 2. Resto maior entre quem sobrou ────────────────────
  //
  // Aqui ninguém mais estoura o próprio estoque, então uma única rodada de
  // Hare-Niemeyer basta — e o desvio de cada matéria fica abaixo de 1 vaga,
  // que é o mínimo possível com números inteiros.
  const somaPeso = pool.reduce((a, f) => a + f.peso, 0);

  if (restante > 0 && somaPeso > 0) {
    const exatos = pool.map((f) => {
      const ideal = (f.peso / somaPeso) * restante;
      return { f, ideal, base: Math.floor(ideal) };
    });

    let usadas = 0;
    for (const e of exatos) {
      if (e.base > 0) {
        vagas.set(e.f.materia_id, (vagas.get(e.f.materia_id) ?? 0) + e.base);
        usadas += e.base;
      }
    }

    let sobra = restante - usadas;
    const porResto = [...exatos].sort(
      (a, b) => b.ideal - b.base - (a.ideal - a.base)
    );

    // Pode dar mais de uma volta quando há mais sobras que matérias.
    while (sobra > 0) {
      let deu = false;
      for (const e of porResto) {
        if (sobra <= 0) break;
        const atual = vagas.get(e.f.materia_id) ?? 0;
        if (atual >= e.f.disponiveis) continue;
        vagas.set(e.f.materia_id, atual + 1);
        sobra -= 1;
        deu = true;
      }
      if (!deu) break; // ninguém tem mais estoque: o banco acabou
    }
  }

  // Quem ficou com zero sai: quem chama itera sobre o mapa.
  for (const [id, n] of [...vagas]) {
    if (n <= 0) vagas.delete(id);
  }

  return vagas;
}
