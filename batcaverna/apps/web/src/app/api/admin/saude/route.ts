import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * GET /api/admin/saude — diagnóstico da instalação.
 *
 * Existe por causa de um padrão que se repetiu três vezes nesta plataforma:
 * uma migration não rodou (ou abortou no meio), a tela ficou vazia, o `catch`
 * da rota engoliu o erro e ninguém soube por semanas.
 *
 * Foi assim com a aba "Usuários Online" (coluna com nome errado), com o
 * ranking semanal (idem) e com a própria migration 008, que abortava na
 * última linha e deixava TODAS as políticas de segurança sem efeito — com
 * uma mensagem de erro que parecia detalhe.
 *
 * Esta rota responde, numa página, "o que está no ar está inteiro?".
 * Use depois de cada deploy e depois de rodar migration.
 *
 * Não substitui monitoramento de verdade (Sentry, que precisa de instalação
 * e está no relatório de ações manuais). Mas roda hoje, sem instalar nada.
 */

interface Checagem {
  nome: string;
  ok: boolean;
  detalhe: string;
  critico: boolean;
}

/** Conta linhas de uma tabela; devolve null se a tabela/coluna não existe. */
async function contar(
  supabase: any,
  tabela: string,
  filtros: Record<string, unknown> = {}
): Promise<number | null> {
  let q = supabase.from(tabela).select('*', { count: 'exact', head: true });
  for (const [col, val] of Object.entries(filtros)) q = q.eq(col, val);
  const { count, error } = await q;
  return error ? null : count ?? 0;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado: administrador obrigatório' },
        { status: 403 }
      );
    }

    const supabase = createServerSupabaseClient();
    const checagens: Checagem[] = [];

    const add = (nome: string, ok: boolean, detalhe: string, critico = true) =>
      checagens.push({ nome, ok, detalhe, critico });

    // ─── Banco de questões ───────────────────────────────────
    const questoes = await contar(supabase, 'questoes', { ativa: true });
    add(
      'Banco de questões',
      (questoes ?? 0) >= 3000,
      questoes === null
        ? 'tabela `questoes` inacessível'
        : `${questoes.toLocaleString('pt-BR')} questões ativas (esperado ~3.247)`
    );

    // ─── migration 009: coluna gerada ────────────────────────
    const { error: errComentario } = await supabase
      .from('questoes')
      .select('tem_comentario')
      .limit(1);
    add(
      'migration 009 · tem_comentario',
      !errComentario,
      errComentario ? 'coluna ausente — a 009 não rodou' : 'coluna presente'
    );

    // ─── migration 011: taxonomia ────────────────────────────
    const assuntos = await contar(supabase, 'assuntos');
    add(
      'migration 011 · taxonomia de assuntos',
      assuntos !== null && assuntos < 1200,
      assuntos === null
        ? 'tabela `assuntos` inacessível'
        : assuntos < 1200
        ? `${assuntos} assuntos (unificados)`
        : `${assuntos} assuntos — a 011 NÃO rodou (eram 2.452 antes)`
    );

    // ─── migration 010: moderação ────────────────────────────
    const { error: errFila } = await supabase
      .from('moderacao_fila')
      .select('mensagem_id')
      .limit(1);
    add(
      'migration 010 · fila de moderação',
      !errFila,
      errFila ? 'view `moderacao_fila` ausente — a 010 não rodou' : 'view presente'
    );

    // ─── migration 012: escudo ───────────────────────────────
    const { error: errEscudo } = await supabase
      .from('users')
      .select('escudos_streak')
      .limit(1);
    add(
      'migration 012 · escudo de sequência',
      !errEscudo,
      errEscudo ? 'coluna ausente — a 012 não rodou' : 'coluna presente'
    );

    // ─── migration 013: treino do TAF ────────────────────────
    const treinos = await contar(supabase, 'taf_registros');
    add(
      'migration 013 · treino do TAF',
      treinos !== null,
      treinos === null
        ? 'tabela `taf_registros` ausente — a 013 não rodou'
        : `${treinos} marcas registradas`
    );

    // ─── migration 014: teoria ligada ao assunto ─────────────
    const { count: teoriaTotal } = await supabase
      .from('teoria_conteudo')
      .select('*', { count: 'exact', head: true });
    const { count: teoriaLigada } = await supabase
      .from('teoria_conteudo')
      .select('*', { count: 'exact', head: true })
      .not('assunto_id', 'is', null);

    add(
      'migration 014 · teoria ligada ao assunto',
      (teoriaLigada ?? 0) > 0,
      `${teoriaLigada ?? 0} de ${teoriaTotal ?? 0} textos ligados a um assunto`
    );

    // ─── migration 037: isolamento de músicas por aluno ───────
    const { error: errMusicasUserId } = await supabase
      .from('musicas')
      .select('user_id')
      .limit(1);
    add(
      'migration 037 · privacidade de músicas (user_id)',
      !errMusicasUserId,
      errMusicasUserId
        ? 'coluna ausente — execute 037_musicas_user_id_e_privacidade.sql no Supabase'
        : 'coluna presente (músicas privadas ativadas)'
    );

    // ─── Conteúdo ────────────────────────────────────────────
    const [videos, musicas, bizus, frases] = await Promise.all([
      contar(supabase, 'videoaulas', { ativa: true }),
      contar(supabase, 'musicas'),
      contar(supabase, 'bizus'),
      contar(supabase, 'frases_motivacionais', { ativa: true }),
    ]);

    add('Vídeo-aulas', (videos ?? 0) > 0, `${videos ?? 0} ativas`, false);
    add('Músicas', (musicas ?? 0) > 0, `${musicas ?? 0} faixas`, false);
    add('Bizus', (bizus ?? 0) > 0, `${bizus ?? 0} macetes`, false);
    add(
      'Frases motivacionais',
      (frases ?? 0) >= 100,
      `${frases ?? 0} frases (esperado 103 após a 009)`,
      false
    );

    // ─── Versão ──────────────────────────────────────────────
    const { data: versao } = await supabase
      .from('app_info')
      .select('versao_atual, atualizado_em')
      .order('atualizado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    add(
      'Versão registrada',
      !!versao,
      versao
        ? `${versao.versao_atual} · ${new Date(versao.atualizado_em).toLocaleDateString('pt-BR')} às ${new Date(versao.atualizado_em).getHours()}h`
        : 'nenhuma — rode o seed de versão',
      false
    );

    // ─── Combo ───────────────────────────────────────────────
    const { data: patamares } = await supabase
      .from('combo_patamares')
      .select('minimo')
      .order('minimo');

    const pisos = (patamares ?? []).map((p: any) => p.minimo);
    add(
      'Patamares de combo',
      pisos.includes(11) && pisos.includes(21),
      pisos.length
        ? `pisos: ${pisos.join(', ')}`
        : 'nenhum patamar — rode a migration 004'
    );

    const criticosQuebrados = checagens.filter((c) => c.critico && !c.ok);

    // ─── Telemetria e Métricas ao Vivo (Tempo Real) ───────────
    const t0 = performance.now();
    await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
    const latenciaDbMs = Math.round(performance.now() - t0);

    const agora = Date.now();
    const cincoMinAtras = new Date(agora - 5 * 60_000).toISOString();
    const quinzeMinAtras = new Date(agora - 15 * 60_000).toISOString();
    const umDiaAtras = new Date(agora - 24 * 60 * 60_000).toISOString();

    const [
      { count: sessoesAtivas },
      { count: respostasHoje },
      { count: usuariosOnline },
      { count: ticketsAbertosTotal },
      { count: feedbacksPendentesTotal },
      { count: usuariosTotal },
      { data: errosFrontendRecentes },
    ] = await Promise.all([
      supabase
        .from('study_sessions')
        .select('id', { count: 'exact', head: true })
        .is('finalizada_em', null)
        .gte('ultima_atividade_em', cincoMinAtras),
      supabase
        .from('user_questao_respostas')
        .select('id', { count: 'exact', head: true })
        .gte('respondido_em', umDiaAtras),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .gte('ultimo_login_em', cincoMinAtras),
      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'aberto'),
      supabase
        .from('feedback_plataforma')
        .select('id', { count: 'exact', head: true })
        .eq('lido_por_admin', false),
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
      supabase
        .from('admin_audit_log')
        .select('detalhes, criado_em')
        .eq('acao', 'erro_frontend')
        .gte('criado_em', quinzeMinAtras)
        .order('criado_em', { ascending: false })
        .limit(5),
    ]);

    const errosFrontend = (errosFrontendRecentes ?? []).map((e: any) => ({
      mensagem: String(e.detalhes?.mensagem ?? 'Erro de interface'),
      rota: String(e.detalhes?.rota ?? ''),
      criado_em: e.criado_em,
    }));

    const telemetriaAoVivo = {
      latencia_db_ms: latenciaDbMs,
      status_latencia: latenciaDbMs < 100 ? 'excelente' : latenciaDbMs < 300 ? 'estavel' : 'lenta',
      sessoes_ativas: sessoesAtivas ?? 0,
      usuarios_online: usuariosOnline ?? 0,
      respostas_24h: respostasHoje ?? 0,
      tickets_abertos: ticketsAbertosTotal ?? 0,
      feedbacks_pendentes: feedbacksPendentesTotal ?? 0,
      usuarios_total: usuariosTotal ?? 0,
      questoes_total: questoes ?? 0,
      erros_frontend_15m: errosFrontend.length,
      erros_frontend_recentes: errosFrontend,
      memoria_heap_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptime_segundos: Math.round(process.uptime()),
    };

    return NextResponse.json({
      success: true,
      data: {
        saudavel: criticosQuebrados.length === 0,
        problemas_criticos: criticosQuebrados.length,
        checagens,
        telemetria: telemetriaAoVivo,
        verificado_em: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/saude error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao rodar o diagnóstico' },
      { status: 500 }
    );
  }
}
