import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import {
  parsearProvaTxt,
  type QuestaoImportada,
} from '@/lib/importador-questoes';

/**
 * POST /api/admin/questoes/importar
 *
 * Importa uma prova inteira a partir do .txt, direto do painel — sem
 * precisar de Python, sem gerar SQL, sem colar nada no Supabase.
 *
 * Body:
 *   {
 *     modo: 'preview' | 'confirmar',
 *     texto: "<conteúdo do .txt>",
 *     concurso_sigla: "EEAR",
 *     dia_prova?: "CFS 1"
 *   }
 *
 * O fluxo é sempre em DOIS passos, de propósito: `preview` mostra o que
 * entraria e o que seria recusado (com o motivo de cada recusa) sem tocar
 * no banco. Só depois de olhar isso é que se manda `confirmar`. Importar
 * 96 questões às cegas e descobrir o estrago depois é caro demais.
 *
 * A deduplicação usa o mesmo SHA-256 do pipeline Python
 * (scripts/parse_questoes.py), conferido por
 * scripts/checar_paridade_hash.py — então uma prova já importada pelo
 * terminal não entra de novo por aqui.
 */

const LIMITE_CARACTERES = 3_000_000; // ~3 MB de texto; a maior prova tem 170 KB

async function exigirAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

export async function POST(req: NextRequest) {
  const inicio = Date.now();

  try {
    const admin = await exigirAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito ao administrador.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const modo: string = body?.modo === 'confirmar' ? 'confirmar' : 'preview';
    const texto: string = String(body?.texto ?? '');
    const siglaBruta: string = String(body?.concurso_sigla ?? '').trim();
    const diaProva: string | null = body?.dia_prova
      ? String(body.dia_prova).slice(0, 24)
      : null;

    if (!texto.trim()) {
      return NextResponse.json(
        { success: false, error: 'Cole o conteúdo do arquivo .txt da prova.' },
        { status: 400 }
      );
    }
    if (texto.length > LIMITE_CARACTERES) {
      return NextResponse.json(
        { success: false, error: 'Arquivo grande demais. Divida a prova.' },
        { status: 413 }
      );
    }
    if (!siglaBruta) {
      return NextResponse.json(
        { success: false, error: 'Escolha o concurso da prova.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // O concurso precisa existir: é ele que amarra a questão ao card.
    const { data: concurso } = await supabase
      .from('concursos')
      .select('id, sigla, nome')
      .ilike('sigla', siglaBruta)
      .maybeSingle();

    if (!concurso) {
      return NextResponse.json(
        {
          success: false,
          error: `Concurso "${siglaBruta}" não existe no banco. Cadastre-o antes de importar.`,
        },
        { status: 404 }
      );
    }

    // ─── 1. Ler o .txt ──────────────────────────────────────
    const parse = await parsearProvaTxt(texto, {
      concurso_sigla: concurso.sigla,
      dia_prova: diaProva,
    });

    if (parse.resumo.blocos_encontrados === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Não encontrei nenhum bloco "[QUESTÃO n]" neste arquivo. ' +
            'Confira se é o .txt da prova no formato do extrator.',
        },
        { status: 422 }
      );
    }

    // ─── 2. Quais já existem no banco ───────────────────────
    const hashes = parse.questoes.map((q) => q.hash_conteudo);
    const jaExistem = new Set<string>();

    // O PostgREST corta em 1.000 linhas: consulta em blocos.
    for (let i = 0; i < hashes.length; i += 500) {
      const { data } = await supabase
        .from('questoes')
        .select('hash_conteudo')
        .in('hash_conteudo', hashes.slice(i, i + 500));
      (data ?? []).forEach((r) => jaExistem.add(r.hash_conteudo));
    }

    const novas = parse.questoes.filter(
      (q) => !jaExistem.has(q.hash_conteudo)
    );

    // Duplicata DENTRO do próprio arquivo (a mesma questão em dois blocos).
    const vistos = new Set<string>();
    const paraInserir: QuestaoImportada[] = [];
    for (const q of novas) {
      if (vistos.has(q.hash_conteudo)) continue;
      vistos.add(q.hash_conteudo);
      paraInserir.push(q);
    }

    const porMateria: Record<string, number> = {};
    for (const q of paraInserir) {
      porMateria[q.materia] = (porMateria[q.materia] ?? 0) + 1;
    }

    const diagnostico = {
      concurso_nome: concurso.nome,
      ...parse.resumo,
      concurso: concurso.sigla,
      ja_no_banco: parse.questoes.length - novas.length,
      a_inserir: paraInserir.length,
      por_materia: porMateria,
      anos: [...new Set(paraInserir.map((q) => q.ano).filter(Boolean))],
    };

    // ─── 3. Preview: mostra e para aqui ─────────────────────
    if (modo === 'preview') {
      return NextResponse.json({
        success: true,
        data: {
          modo: 'preview',
          diagnostico,
          rejeitadas: parse.rejeitadas.slice(0, 40),
          // Três exemplos para conferir a olho se a extração ficou boa.
          amostra: paraInserir.slice(0, 3).map((q) => ({
            numero_original: q.numero_original,
            materia: q.materia,
            assunto: q.assunto,
            texto_base: q.texto_base?.slice(0, 400) ?? null,
            enunciado: q.enunciado.slice(0, 600),
            alternativas: q.alternativas,
            resposta_correta: q.resposta_correta,
            explicacao: q.explicacao?.slice(0, 400) ?? null,
            anulada: q.anulada,
          })),
        },
      });
    }

    // ─── 4. Confirmar: grava ────────────────────────────────
    if (paraInserir.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          modo: 'confirmar',
          diagnostico,
          inseridas: 0,
          mensagem: 'Nada novo: todas essas questões já estavam no banco.',
        },
      });
    }

    // 4.1 Matérias que ainda não existem
    const materiasNecessarias = [...new Set(paraInserir.map((q) => q.materia))];
    const { data: materiasExistentes } = await supabase
      .from('materias')
      .select('id, nome')
      .in('nome', materiasNecessarias);

    const mapaMateria = new Map<string, string>(
      (materiasExistentes ?? []).map((m) => [m.nome, m.id])
    );

    const faltando = materiasNecessarias.filter((n) => !mapaMateria.has(n));
    if (faltando.length) {
      const { data: criadas } = await supabase
        .from('materias')
        .insert(
          faltando.map((nome) => ({
            nome,
            descricao: 'Criada pela importação de prova no painel',
            icone_emoji: '📚',
          }))
        )
        .select('id, nome');
      (criadas ?? []).forEach((m) => mapaMateria.set(m.nome, m.id));
    }

    // 4.2 Vincula a matéria ao concurso — é isso que alimenta o filtro
    //     da tela de questões e o card do concurso.
    const { data: vinculos } = await supabase
      .from('concurso_materias')
      .select('materia_id')
      .eq('concurso_id', concurso.id);

    const jaVinculadas = new Set((vinculos ?? []).map((v) => v.materia_id));
    const novosVinculos = [...mapaMateria.values()]
      .filter((id) => !jaVinculadas.has(id))
      .map((materia_id) => ({ concurso_id: concurso.id, materia_id }));

    if (novosVinculos.length) {
      await supabase.from('concurso_materias').insert(novosVinculos);
    }

    // 4.3 Assuntos
    const paresAssunto = [
      ...new Set(paraInserir.map((q) => `${q.materia}||${q.assunto}`)),
    ];
    const mapaAssunto = new Map<string, string>();

    for (const par of paresAssunto) {
      const [materia, assunto] = par.split('||');
      const materiaId = mapaMateria.get(materia);
      if (!materiaId) continue;

      const { data: existente } = await supabase
        .from('assuntos')
        .select('id')
        .eq('materia_id', materiaId)
        .eq('nome', assunto)
        .maybeSingle();

      if (existente) {
        mapaAssunto.set(par, existente.id);
        continue;
      }

      const { data: criado } = await supabase
        .from('assuntos')
        .insert({ materia_id: materiaId, nome: assunto, ordem: 0 })
        .select('id')
        .single();

      if (criado) mapaAssunto.set(par, criado.id);
    }

    // 4.4 As questões, em lotes
    const linhas = paraInserir.map((q) => ({
      concurso_id: concurso.id,
      materia_id: mapaMateria.get(q.materia) ?? null,
      assunto_id: mapaAssunto.get(`${q.materia}||${q.assunto}`) ?? null,
      enunciado: q.enunciado,
      texto_base: q.texto_base,
      alternativas: q.alternativas,
      resposta_correta: q.resposta_correta,
      explicacao: q.explicacao,
      ano: q.ano,
      banca: q.banca,
      dificuldade: q.dificuldade,
      dia_prova: q.dia_prova,
      numero_ordem: q.numero_ordem,
      numero_original: q.numero_original,
      figura_descricao: q.figura_descricao,
      anulada: q.anulada,
      // Sem explicação oficial não há como derivar passos honestos; a
      // questão entra como 'pendente' e aparece na fila de revisão do
      // painel para alguém escrever a resolução.
      resolucao_status: q.explicacao ? 'resumida' : 'pendente',
      hash_conteudo: q.hash_conteudo,
      arquivo_origem: `painel:${concurso.sigla}${diaProva ? `-${diaProva}` : ''}`,
      ativa: true,
    }));

    let inseridas = 0;
    const falhas: string[] = [];

    for (let i = 0; i < linhas.length; i += 100) {
      const lote = linhas.slice(i, i + 100);
      const { data, error } = await supabase
        .from('questoes')
        .insert(lote)
        .select('id, hash_conteudo');

      if (error) {
        falhas.push(error.message);
        continue;
      }

      inseridas += data?.length ?? 0;

      // Registro no armazém, para o histórico de importações.
      if (data?.length) {
        await supabase.from('questao_importadas').insert(
          data.map((q) => ({
            hash_conteudo: q.hash_conteudo,
            questao_id: q.id,
            arquivo_origem: `painel:${concurso.sigla}`,
            status: 'aceita',
          }))
        );
      }
    }

    const duracao = Math.max(1, Math.round((Date.now() - inicio) / 1000));

    await supabase.from('importacao_logs').insert({
      arquivos_encontrados: 1,
      questoes_aceitas: inseridas,
      questoes_ignoradas_duplicadas: diagnostico.ja_no_banco,
      questoes_com_erro: parse.rejeitadas.length + falhas.length,
      duracao_segundos: duracao,
    });

    await supabase.from('admin_audit_log').insert({
      admin_id: admin.id,
      acao: 'importar_prova',
      entidade_afetada: 'questoes',
      detalhes: {
        concurso: concurso.sigla,
        dia_prova: diaProva,
        inseridas,
        ja_no_banco: diagnostico.ja_no_banco,
        rejeitadas: parse.rejeitadas.length,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        modo: 'confirmar',
        diagnostico,
        inseridas,
        falhas,
        duracao_segundos: duracao,
        mensagem:
          `${inseridas} questões de ${concurso.sigla} entraram no banco.` +
          (diagnostico.ja_no_banco
            ? ` ${diagnostico.ja_no_banco} já existiam e foram ignoradas.`
            : ''),
      },
    });
  } catch (error) {
    console.error('POST /api/admin/questoes/importar error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao importar a prova.' },
      { status: 500 }
    );
  }
}
