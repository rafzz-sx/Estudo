import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { limparTermoBusca, uuidOuNulo } from '@/lib/seguranca';

const EMOJIS_CONCURSO: Record<string, string> = {
  EEAR: '✈️',
  ESA: '⭐',
  EAM: '⚓',
  CN: '🚢',
  EPCAR: '🛩️',
  ESPCEX: '🎖️',
  EFOMM: '🌊',
  IME: '🔬',
  ENEM: '📚',
};

const CORES_CONCURSO: Record<string, string> = {
  EEAR: '#0284c7',
  ESA: '#16a34a',
  EAM: '#2563eb',
  CN: '#0d9488',
  EPCAR: '#3b82f6',
  ESPCEX: '#b45309',
  EFOMM: '#0891b2',
  IME: '#dc2626',
  ENEM: '#eab308',
};

/**
 * GET /api/questoes
 *
 * Filtros (todos opcionais e combináveis):
 *   concurso      sigla, ex.: EEAR   (os cards de concurso linkam por sigla)
 *   concurso_id   UUID
 *   materia       nome, ex.: Matemática
 *   materia_id    UUID
 *   assunto       nome
 *   assunto_id    UUID
 *   ano           2025
 *   dificuldade   facil | medio | dificil
 *   busca         texto livre no enunciado
 *   nao_respondidas=1   esconde o que o usuário já respondeu
 *   comentadas=1        só as que têm gabarito comentado escrito
 *   ordem         recentes | antigas | aleatoria
 *   page, per_page
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supabase = createServerSupabaseClient();

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const perPage = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get('per_page') || '10'))
    );

    // ─── Resolve siglas/nomes para UUID ──────────────────────
    let concursoId = searchParams.get('concurso_id');
    const concursoSigla = searchParams.get('concurso');
    if (!concursoId && concursoSigla && concursoSigla.toLowerCase() !== 'todos') {
      const { data } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', concursoSigla)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({
          success: true,
          data: { items: [], total: 0, page, per_page: perPage, total_pages: 0 },
        });
      }
      concursoId = data.id;
    }

    let materiaId = searchParams.get('materia_id');
    const materiaNome = searchParams.get('materia');
    if (!materiaId && materiaNome && materiaNome.toLowerCase() !== 'todas') {
      const { data } = await supabase
        .from('materias')
        .select('id')
        .ilike('nome', materiaNome)
        .maybeSingle();
      if (!data) {
        return NextResponse.json({
          success: true,
          data: { items: [], total: 0, page, per_page: perPage, total_pages: 0 },
        });
      }
      materiaId = data.id;
    }

    // ─── Monta a consulta ────────────────────────────────────
    let query = supabase
      .from('questoes')
      .select(
        `
        id, concurso_id, materia_id, assunto_id,
        enunciado, alternativas,
        ano, banca, dificuldade, explicacao, criado_em,
        concursos (id, sigla, nome),
        materias  (id, nome, icone_emoji),
        assuntos  (id, nome)
      `,
        { count: 'exact' }
      );

    if (concursoId) query = query.eq('concurso_id', concursoId);
    if (materiaId) query = query.eq('materia_id', materiaId);

    const assuntoId = uuidOuNulo(searchParams.get('assunto_id'));
    if (assuntoId) query = query.eq('assunto_id', assuntoId);

    const ano = searchParams.get('ano');
    if (ano && ano !== 'todos') query = query.eq('ano', parseInt(ano));

    const dificuldade = searchParams.get('dificuldade');
    if (dificuldade && dificuldade !== 'todas') {
      query = query.eq('dificuldade', dificuldade.toLowerCase());
    }

    const busca = limparTermoBusca(searchParams.get('busca'), 80);
    if (busca.length >= 3) {
      query = query.ilike('enunciado', `%${busca}%`);
    }

    if (searchParams.get('comentadas') === '1') {
      query = query.not('explicacao', 'is', null);
    }

    // ─── Esconde o que o usuário já respondeu ────────────────
    const user = await getAuthUserFromRequest(req);
    if (user && searchParams.get('nao_respondidas') === '1') {
      const LIMITE_EXCLUSAO = 200;

      const { data: respondidas } = await supabase
        .from('user_questao_respostas')
        .select('questao_id')
        .eq('user_id', user.id)
        .order('respondido_em', { ascending: false })
        .limit(LIMITE_EXCLUSAO);

      const ids = [...new Set((respondidas ?? []).map((r: any) => r.questao_id))];
      if (ids.length) query = query.not('id', 'in', `(${ids.join(',')})`);
    }

    // ─── Ordenação ───────────────────────────────────────────
    const ordem = searchParams.get('ordem') || 'recentes';
    if (ordem === 'antigas') {
      query = query
        .order('ano', { ascending: true, nullsFirst: false })
        .order('criado_em', { ascending: true });
    } else {
      query = query
        .order('ano', { ascending: false, nullsFirst: false })
        .order('criado_em', { ascending: false });
    }

    const offset = (page - 1) * perPage;
    const { data, count, error } = await query.range(offset, offset + perPage - 1);
    if (error) throw error;

    // Formatar itens para atender com precisão o contrato esperado pelo frontend
    const formatados = (data ?? []).map((q: any) => {
      const sigla = (q.concursos?.sigla || '').toUpperCase();
      return {
        id: q.id,
        texto_base: q.texto_base ?? null,
        enunciado: q.enunciado,
        alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
        ano: q.ano ?? null,
        banca: q.banca ?? null,
        dificuldade: q.dificuldade ?? 'medio',
        dia_prova: q.dia_prova ?? null,
        numero_ordem: q.numero_ordem ?? null,
        numero_original: q.numero_original ?? null,
        figura_descricao: q.figura_descricao ?? null,
        figura_svg: q.figura_svg ?? null,
        precisa_resolucao: q.precisa_resolucao ?? false,
        anulada: q.anulada ?? false,
        tem_comentario: q.tem_comentario ?? Boolean(q.explicacao),
        vezes_respondida: q.vezes_respondida ?? 0,
        vezes_acertada: q.vezes_acertada ?? 0,
        concursos: q.concursos
          ? {
              id: q.concursos.id,
              sigla: q.concursos.sigla,
              nome: q.concursos.nome,
              emoji: q.concursos.emoji ?? EMOJIS_CONCURSO[sigla] ?? '🎯',
              cor_tema: q.concursos.cor_tema ?? CORES_CONCURSO[sigla] ?? '#F5C518',
            }
          : null,
        materias: q.materias
          ? {
              id: q.materias.id,
              nome: q.materias.nome,
              icone_emoji: q.materias.icone_emoji ?? '📚',
            }
          : null,
        assuntos: q.assuntos
          ? {
              id: q.assuntos.id,
              nome: q.assuntos.nome,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: formatados,
        total: count ?? 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count ?? 0) / perPage),
      },
    });
  } catch (error) {
    console.error('GET /api/questoes error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar questões' },
      { status: 500 }
    );
  }
}
