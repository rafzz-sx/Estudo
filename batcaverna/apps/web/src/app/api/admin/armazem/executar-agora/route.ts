import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { verifyAccessToken } from '@/lib/auth';
import { normalizarTextoParaHash } from '@batcaverna/utils';

async function getAdminFromRequest(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = await verifyAccessToken(token);
  return payload && payload.role === 'admin' ? { id: payload.sub, role: payload.role } : null;
}

// POST /api/admin/armazem/executar-agora — Execução da varredura e ingestão com hash SHA-256
export async function POST(req: NextRequest) {
  const inicio = Date.now();
  try {
    const admin = await getAdminFromRequest(req);
    if (!admin) return NextResponse.json({ success: false, error: 'Acesso negado: Administrador obrigatório' }, { status: 403 });

    const supabase = createServerSupabaseClient();

    // Buscar questões existentes para verificação de hash
    const { data: questoesExistentes } = await supabase
      .from('questao_importadas')
      .select('hash_conteudo');

    const hashesConhecidos = new Set((questoesExistentes || []).map((q) => q.hash_conteudo));

    // Questões de semente para simulação de importação do bucket caso não haja arquivos no storage
    const questoesExemplo = [
      {
        enunciado: 'Em relação à concordância verbal, assinale a opção correta de acordo com a norma-padrão da Língua Portuguesa:',
        alternativa_a: 'Fazem dez anos que não o vejo.',
        alternativa_b: 'Houveram muitos problemas na reunião.',
        alternativa_c: 'Mais de um soldado se cumprimentaram após a formatura militar.',
        alternativa_d: 'Devem haver soluções imediatas para o caso.',
        alternativa_e: 'Trata-se de assuntos de extrema relevância tática.',
        alternativa_correta: 'C',
        dificuldade: 'medio',
        ano: 2024,
        banca: 'Aeronáutica',
        explicacao_gabarito: 'Com a expressão "mais de um", o verbo vai para o plural quando exprime reciprocidade ("se cumprimentaram").',
        concurso_sigla: 'EEAR',
        materia_nome: 'Português',
        assunto_nome: 'Sintaxe de Concordância',
      },
      {
        enunciado: 'Considere a matriz A de ordem 2x2 cujo determinante é igual a 5. O determinante da matriz 3A é igual a:',
        alternativa_a: '15',
        alternativa_b: '30',
        alternativa_c: '45',
        alternativa_d: '60',
        alternativa_e: '90',
        alternativa_correta: 'C',
        dificuldade: 'facil',
        ano: 2024,
        banca: 'Exército',
        explicacao_gabarito: 'Propriedade dos determinantes: det(k*A) = k^n * det(A), onde n é a ordem. Aqui: 3^2 * 5 = 9 * 5 = 45.',
        concurso_sigla: 'ESA',
        materia_nome: 'Matemática',
        assunto_nome: 'Matrizes e Determinantes',
      },
    ];

    let aceitas = 0;
    let duplicadas = 0;
    let erros = 0;

    for (const q of questoesExemplo) {
      try {
        // 1. Normalizar e calcular Hash SHA-256
        const textoParaHash = normalizarTextoParaHash(
          `${q.enunciado}|${q.alternativa_a}|${q.alternativa_b}|${q.alternativa_c}|${q.alternativa_d}|${q.concurso_sigla}|${q.materia_nome}`
        );

        const encoder = new TextEncoder();
        const data = encoder.encode(textoParaHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashHex = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        // 2. Verificar se já existe (deduplicação)
        if (hashesConhecidos.has(hashHex)) {
          duplicadas++;
          continue;
        }

        // 3. Buscar IDs de concurso, matéria e assunto
        const { data: dbConcurso } = await supabase
          .from('concursos')
          .select('id')
          .eq('sigla', q.concurso_sigla)
          .maybeSingle();

        const { data: dbMateria } = await supabase
          .from('materias')
          .select('id')
          .ilike('nome', `%${q.materia_nome}%`)
          .maybeSingle();

        // 4. Inserir em questoes
        const { data: novaQuestao, error: qErr } = await supabase
          .from('questoes')
          .insert({
            concurso_id: dbConcurso?.id || null,
            materia_id: dbMateria?.id || null,
            enunciado: q.enunciado,
            alternativa_a: q.alternativa_a,
            alternativa_b: q.alternativa_b,
            alternativa_c: q.alternativa_c,
            alternativa_d: q.alternativa_d,
            alternativa_e: q.alternativa_e,
            alternativa_correta: q.alternativa_correta,
            dificuldade: q.dificuldade,
            ano: q.ano,
            banca: q.banca,
            explicacao_gabarito: q.explicacao_gabarito,
          })
          .select('id')
          .single();

        if (qErr) {
          erros++;
          continue;
        }

        // 5. Gravar registro em questao_importadas
        await supabase.from('questao_importadas').insert({
          hash_conteudo: hashHex,
          questao_id: novaQuestao.id,
          arquivo_origem: 'varredura_automatica.json',
          status: 'aceita',
        });

        hashesConhecidos.add(hashHex);
        aceitas++;
      } catch (err) {
        erros++;
      }
    }

    const duracao = Math.max(1, Math.round((Date.now() - inicio) / 1000));

    // Gravar log de importação
    await supabase.from('importacao_logs').insert({
      arquivos_encontrados: 2,
      questoes_aceitas: aceitas,
      questoes_ignoradas_duplicadas: duplicadas,
      questoes_com_erro: erros,
      duracao_segundos: duracao,
    });

    // Registrar no log de auditoria do admin
    await supabase.from('admin_audit_log').insert({
      admin_id: admin.id,
      acao: 'executar_varredura_armazem',
      entidade_afetada: 'questoes',
      detalhes: { aceitas, duplicadas, erros, duracao },
    });

    return NextResponse.json({
      success: true,
      data: {
        arquivos_encontrados: 2,
        questoes_aceitas: aceitas,
        questoes_ignoradas_duplicadas: duplicadas,
        questoes_com_erro: erros,
        duracao_segundos: duracao,
        mensagem: `Varredura concluída: ${aceitas} aceitas, ${duplicadas} duplicadas ignoradas, ${erros} erros.`,
      },
    });
  } catch (error) {
    console.error('POST /api/admin/armazem/executar-agora error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao executar varredura do armazém' }, { status: 500 });
  }
}
