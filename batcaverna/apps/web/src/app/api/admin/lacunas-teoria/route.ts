import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { lerTudo } from '@/lib/contagens';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/admin/lacunas-teoria — onde escrever teoria rende mais.
 *
 * 57% das questões não têm texto de teoria vinculado. Escrever tudo é
 * inviável, e escrever na ordem alfabética ou "por onde der vontade" é
 * desperdício: dez textos bem escolhidos alcançam mais aluno que cinquenta
 * aleatórios.
 *
 * A régua é FREQUÊNCIA × ERRO COLETIVO:
 *
 *   • frequência — quantas questões daquele assunto existem no banco. É o
 *     quanto o assunto cai de verdade nas provas oficiais.
 *   • erro coletivo — quanto TODOS os alunos erram nele. Um assunto que cai
 *     muito e que todo mundo acerta não precisa de texto; um que cai muito e
 *     derruba geral é exatamente onde falta explicação.
 *
 * Assunto que já tem teoria não aparece: a fila é do que falta escrever.
 *
 * O mesmo princípio da Fila de Resolução (que ordena os gabaritos por quanto
 * a questão derruba aluno), aplicado à teoria.
 */

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/** Suavização: assunto com pouquíssima resposta não sobe ao topo por acaso. */
const K_SUAVIZACAO = 20;

/** Abaixo disto o assunto é pequeno demais para valer um texto. */
const MINIMO_QUESTOES = 5;

interface LinhaQuestao {
  id: string;
  assunto_id: string | null;
}

interface LinhaResposta {
  correta: boolean | null;
  questoes: { assunto_id: string | null } | null;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito a administradores' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();

    // ─── 1. Quantas questões por assunto ─────────────────────
    const questoes = await lerTudo<LinhaQuestao>(() =>
      supabase.from('questoes').select('id, assunto_id').eq('ativa', true)
    );

    const porAssunto = new Map<string, number>();
    for (const q of questoes) {
      if (!q.assunto_id) continue;
      porAssunto.set(q.assunto_id, (porAssunto.get(q.assunto_id) ?? 0) + 1);
    }

    if (porAssunto.size === 0) {
      return NextResponse.json({
        success: true,
        data: { lacunas: [], resumo: { com_teoria: 0, sem_teoria: 0, cobertura: 0 } },
      });
    }

    // ─── 2. Erro coletivo por assunto ────────────────────────
    const respostas = await lerTudo<LinhaResposta>(() =>
      supabase
        .from('user_questao_respostas')
        .select('correta, questoes!inner (assunto_id)')
    );

    const desempenho = new Map<string, { total: number; acertos: number }>();
    let totalGeral = 0;
    let acertosGeral = 0;

    for (const r of respostas) {
      const id = r.questoes?.assunto_id;
      if (!id) continue;
      const d = desempenho.get(id) ?? { total: 0, acertos: 0 };
      d.total += 1;
      if (r.correta) d.acertos += 1;
      desempenho.set(id, d);
      totalGeral += 1;
      if (r.correta) acertosGeral += 1;
    }

    const mediaPlataforma = totalGeral > 0 ? acertosGeral / totalGeral : 0.5;

    // ─── 3. Quem já tem teoria ───────────────────────────────
    // Dois caminhos, como no radar de fraqueza: o vínculo formal
    // (`assunto_id`, criado pela migration 014) e o casamento por NOME do
    // tema — o texto de Ecologia está sob "Biologia", e as matérias
    // guarda-chuva do ENEM têm assuntos próprios.
    const teorias = await lerTudo<{ assunto_id: string | null; tema: string | null }>(
      () => supabase.from('teoria_conteudo').select('assunto_id, tema')
    );

    const comTeoriaPorId = new Set(
      teorias.map((t) => t.assunto_id).filter(Boolean) as string[]
    );
    const temasCobertos = new Set(
      teorias.map((t) => (t.tema ?? '').trim().toLowerCase()).filter(Boolean)
    );

    // ─── 4. Nome e matéria de cada assunto ───────────────────
    const ids = [...porAssunto.keys()];
    const nomes = new Map<
      string,
      { nome: string; materia: string; emoji: string | null }
    >();

    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await supabase
        .from('assuntos')
        .select('id, nome, materias (nome, icone_emoji)')
        .in('id', ids.slice(i, i + 200));

      for (const a of (data ?? []) as any[]) {
        nomes.set(a.id, {
          nome: a.nome,
          materia: a.materias?.nome ?? '—',
          emoji: a.materias?.icone_emoji ?? null,
        });
      }
    }

    // ─── 5. Prioridade ───────────────────────────────────────
    const maxQuestoes = Math.max(...porAssunto.values());
    const lacunas = [];
    let comTeoria = 0;

    for (const [assuntoId, quantas] of porAssunto) {
      const info = nomes.get(assuntoId);
      if (!info) continue;

      const temTeoria =
        comTeoriaPorId.has(assuntoId) ||
        temasCobertos.has(info.nome.trim().toLowerCase());

      if (temTeoria) {
        comTeoria += 1;
        continue;
      }

      if (quantas < MINIMO_QUESTOES) continue;

      const d = desempenho.get(assuntoId) ?? { total: 0, acertos: 0 };
      const taxa =
        (d.acertos + K_SUAVIZACAO * mediaPlataforma) / (d.total + K_SUAVIZACAO);

      // Raiz na frequência pelo mesmo motivo do radar: sem ela, um assunto de
      // 134 questões esmaga um de 30 mesmo com o segundo derrubando muito mais.
      const peso = Math.sqrt(quantas / maxQuestoes);
      const prioridade = Math.round(peso * (1 - taxa) * 100);

      lacunas.push({
        assunto_id: assuntoId,
        assunto: info.nome,
        materia: info.materia,
        emoji: info.emoji,
        questoes: quantas,
        respostas: d.total,
        taxa_acerto: d.total > 0 ? Number(((d.acertos / d.total) * 100).toFixed(1)) : null,
        prioridade,
        // Quantos alunos-questão passam por aqui sem ter onde ler. É o número
        // que responde "quantas pessoas este texto ajudaria".
        alcance: d.total,
      });
    }

    lacunas.sort((a, b) => b.prioridade - a.prioridade);

    const semTeoria = lacunas.length;
    const totalConsiderado = comTeoria + semTeoria;

    return NextResponse.json({
      success: true,
      data: {
        lacunas: lacunas.slice(0, 60),
        resumo: {
          com_teoria: comTeoria,
          sem_teoria: semTeoria,
          cobertura:
            totalConsiderado > 0
              ? Number(((comTeoria / totalConsiderado) * 100).toFixed(1))
              : 0,
        },
      },
    });
  } catch (error) {
    console.error('GET /api/admin/lacunas-teoria error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao montar a fila de teoria' },
      { status: 500 }
    );
  }
}
