import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import {
  radarDeFraqueza,
  evolucaoSemanal,
  errosEmAberto,
} from '@/lib/diagnostico';
import { projetarNota } from '@/lib/projecao-nota';

/**
 * GET /api/estudo/painel?concurso=EEAR
 *
 * Tudo que a tela inicial precisa para responder "o que eu estudo agora".
 *
 * A tela inicial anterior mostrava Streak, Tempo Total, Questões e Maior
 * Combo. É uma vitrine de troféus: conta o que o aluno já fez e nunca o que
 * fazer em seguida. Os números para orientar sempre existiram no banco —
 * ninguém os cruzava.
 *
 * Devolve, em uma requisição:
 *   • o concurso em foco e quantos dias faltam para a prova
 *   • as revisões vencidas hoje (repetição espaçada)
 *   • os erros ainda não refeitos
 *   • o radar de fraqueza: onde a próxima hora rende mais ponto
 *   • a evolução semanal
 *   • a ação recomendada, já com o link pronto
 */

export interface AcaoRecomendada {
  chave: string;
  titulo: string;
  descricao: string;
  href: string;
  emoji: string;
  urgencia: 'alta' | 'media' | 'baixa';
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();

    // ─── 1. Concurso em foco ─────────────────────────────────
    // Prioridade: o que veio na URL > o primeiro favorito > nenhum.
    const sigla = searchParams.get('concurso');
    let concurso: {
      id: string;
      sigla: string;
      nome: string;
      emoji: string | null;
      cor_tema: string | null;
    } | null = null;

    if (sigla && sigla.toLowerCase() !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id, sigla, nome, emoji, cor_tema')
        .ilike('sigla', sigla)
        .maybeSingle();
      concurso = data;
    }

    if (!concurso) {
      const { data: fav } = await supabase
        .from('user_concurso_favoritos')
        .select('concursos (id, sigla, nome, emoji, cor_tema)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      concurso = (fav as any)?.concursos ?? null;
    }

    // Sem concurso favoritado não há o que orientar: a tela mostra o convite
    // para escolher um, e isso é a resposta certa — não um painel vazio.
    if (!concurso) {
      return NextResponse.json({
        success: true,
        data: {
          concurso: null,
          acoes: [
            {
              chave: 'escolher_concurso',
              titulo: 'Escolha seu concurso',
              descricao:
                'A caverna se organiza em volta de um alvo. Escolha o seu para eu montar o plano.',
              href: '/concursos',
              emoji: '🎯',
              urgencia: 'alta',
            },
          ],
        },
      });
    }

    // ─── 2. Plano ativo e contagem regressiva ────────────────
    const { data: plano } = await supabase
      .from('planos_estudo')
      .select('id, nome, data_prova, horas_por_semana')
      .eq('user_id', user.id)
      .eq('concurso_id', concurso.id)
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    let diasParaProva: number | null = null;
    if (plano?.data_prova) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const alvo = new Date(`${plano.data_prova}T00:00:00`);
      diasParaProva = Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
    }

    // ─── 3. Revisões vencidas ────────────────────────────────
    const hojeISO = new Date().toISOString().slice(0, 10);
    const { count: revisoesHoje } = await supabase
      .from('revisoes_agendadas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('ativa', true)
      .lte('agendada_para', hojeISO);

    // ─── 4. Erros ainda não refeitos ─────────────────────────
    // Não existe tabela de caderno de erros: a lista é derivada da última
    // resposta de cada questão. A regra mora em `diagnostico.ts` para esta
    // tela e /caderno nunca divergirem.
    const erros = await errosEmAberto(supabase, user.id, concurso.id);
    const errosAbertos = erros.total;

    // ─── 5. Radar e evolução ─────────────────────────────────
    const [radar, evolucao] = await Promise.all([
      radarDeFraqueza(supabase, user.id, concurso.id),
      evolucaoSemanal(supabase, user.id, 12, concurso.id),
    ]);

    const fracos = radar
      .filter((a) => a.situacao === 'critico' || a.situacao === 'atencao')
      .slice(0, 8);
    const pontosCegos = radar
      .filter((a) => a.situacao === 'nao_testado' && a.questoes_no_concurso >= 5)
      .slice(0, 5);
    const dominados = radar.filter((a) => a.situacao === 'dominado').length;

    const respondidasNoConcurso = radar.reduce((a, r) => a + r.respondidas, 0);
    const acertosNoConcurso = radar.reduce((a, r) => a + r.acertos, 0);

    // ─── 6. Ação recomendada ─────────────────────────────────
    // A ordem abaixo É a recomendação. Rever o que já errou rende mais que
    // resolver questão nova — e é o que o aluno menos faz sozinho, porque
    // dói mais.
    const acoes: AcaoRecomendada[] = [];

    // ─── RETA FINAL ──────────────────────────────────────────
    //
    // A data da prova estava no banco (`planos_estudo.data_prova`), a tela
    // mostrava a contagem regressiva, e NADA mudava por causa dela. Faltando
    // um mês, a prioridade deixa de ser aprender assunto novo: o que rende é
    // consolidar o que já foi visto e treinar no formato e no ritmo da banca.
    //
    // Por isso estas ações vêm ANTES de todas as outras quando o prazo aperta
    // — inclusive antes das revisões vencidas, que continuam logo abaixo.
    const retaFinal = diasParaProva !== null && diasParaProva >= 0 && diasParaProva <= 30;

    if (retaFinal) {
      acoes.push({
        chave: 'reta_final_simulado',
        titulo:
          diasParaProva! <= 7
            ? `Faltam ${diasParaProva} ${diasParaProva === 1 ? 'dia' : 'dias'}: simule a prova inteira`
            : `Reta final: simulado no formato do ${concurso.sigla}`,
        descricao:
          'Prova completa, no formato e na duração da banca, com as matérias no peso certo. Nesta altura, o que falta treinar é ritmo e resistência.',
        href: `/simulado?concurso=${concurso.sigla}&tipo=oficial&auto=1`,
        emoji: '⏱️',
        urgencia: 'alta',
      });

      if (errosAbertos > 0) {
        acoes.push({
          chave: 'reta_final_erros',
          titulo: `Fechar ${errosAbertos} ${errosAbertos === 1 ? 'erro em aberto' : 'erros em aberto'}`,
          descricao:
            'Na reta final, erro em aberto vale mais que assunto novo: já está meio aprendido e custa pouco para virar acerto.',
          href: `/simulado?concurso=${concurso.sigla}&tipo=erros&auto=1`,
          emoji: '🎯',
          urgencia: 'alta',
        });
      }
    }

    if ((revisoesHoje ?? 0) > 0) {
      acoes.push({
        chave: 'revisoes',
        titulo: `${revisoesHoje} ${revisoesHoje === 1 ? 'revisão vencida' : 'revisões vencidas'}`,
        descricao:
          'Questões que você errou e o sistema agendou para hoje. É a hora em que o assunto gruda.',
        href: '/revisoes',
        emoji: '🔁',
        urgencia: 'alta',
      });
    }

    if (errosAbertos >= 5 && !retaFinal) {
      acoes.push({
        chave: 'refazer_erros',
        titulo: `Refazer ${errosAbertos} erros`,
        descricao:
          'Um simulado montado só com o que você já errou. É o treino de maior rendimento que existe aqui.',
        href: `/simulado?concurso=${concurso.sigla}&tipo=erros&auto=1`,
        emoji: '🎯',
        urgencia: 'alta',
      });
    }

    if (fracos.length > 0) {
      const alvo = fracos[0];
      acoes.push({
        chave: 'assunto_fraco',
        titulo: `Atacar ${alvo.assunto}`,
        descricao:
          alvo.respondidas > 0
            ? `Você acerta ${alvo.taxa}% e este assunto tem ${alvo.questoes_no_concurso} questões no ${concurso.sigla}.`
            : `${alvo.questoes_no_concurso} questões no ${concurso.sigla} e você ainda não testou.`,
        href: `/questoes?concurso=${concurso.sigla}&assunto_id=${alvo.assunto_id}`,
        emoji: '⚔️',
        urgencia: 'media',
      });
    }

    if (pontosCegos.length > 0) {
      acoes.push({
        chave: 'ponto_cego',
        titulo: `${pontosCegos.length} assuntos que você nunca abriu`,
        descricao: `A começar por ${pontosCegos[0].assunto}, com ${pontosCegos[0].questoes_no_concurso} questões na prova.`,
        href: `/concursos/${concurso.sigla.toLowerCase()}/assuntos`,
        emoji: '🕳️',
        urgencia: 'media',
      });
    }

    if (!plano) {
      acoes.push({
        chave: 'criar_plano',
        titulo: 'Definir a data da sua prova',
        descricao:
          'Com a data eu monto o cronograma e passo a mostrar quanto tempo falta.',
        href: '/cronograma',
        emoji: '📅',
        urgencia: 'media',
      });
    }

    if (acoes.length === 0) {
      acoes.push({
        chave: 'seguir',
        titulo: 'Nada vencido. Bora avançar',
        descricao: `Sem revisão pendente e sem erro em aberto. Continue resolvendo questões do ${concurso.sigla}.`,
        href: `/questoes?concurso=${concurso.sigla}&nao_respondidas=1`,
        emoji: '🚀',
        urgencia: 'baixa',
      });
    }

    // A projeção é a última coisa a ser calculada e a mais tolerante a
    // falha: ela é um extra da tela, e o painel precisa abrir mesmo sem ela.
    let projecao = null;
    try {
      projecao = await projetarNota(supabase, user.id, concurso.id, concurso.sigla);
    } catch (e) {
      console.warn('Aviso: projeção de nota indisponível:', e);
    }

    return NextResponse.json({
      success: true,
      data: {
        concurso,
        plano: plano
          ? { id: plano.id, nome: plano.nome, data_prova: plano.data_prova }
          : null,
        dias_para_prova: diasParaProva,
        // A menos de 30 dias a prioridade muda: consolidar e simular, em vez
        // de abrir assunto novo. A tela troca o tom por causa disto.
        reta_final: retaFinal,
        revisoes_hoje: revisoesHoje ?? 0,
        erros_abertos: errosAbertos,
        acoes,
        radar: {
          fracos,
          pontos_cegos: pontosCegos,
          total_assuntos: radar.length,
          dominados,
          respondidas: respondidasNoConcurso,
          acertos: acertosNoConcurso,
          taxa:
            respondidasNoConcurso > 0
              ? Math.round((acertosNoConcurso / respondidasNoConcurso) * 100)
              : 0,
        },
        evolucao,
        // Quanto falta para a faixa de aprovação, e em que matérias os
        // pontos estão sendo perdidos. `null` quando não dá para projetar
        // honestamente (concurso sem questões, ou sem corte de referência).
        projecao,
      },
    });
  } catch (error) {
    console.error('GET /api/estudo/painel error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao montar seu painel' },
      { status: 500 }
    );
  }
}
