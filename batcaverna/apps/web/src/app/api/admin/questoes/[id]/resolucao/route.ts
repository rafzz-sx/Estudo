import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

/**
 * PATCH /api/admin/questoes/[id]/resolucao
 *
 * Escreve o gabarito comentado e a resolução passo a passo de uma questão,
 * direto do painel.
 *
 * Existe porque 540 questões entraram de provas cujo .txt não trazia a
 * seção de explicação. Sem esta tela, a única saída seria editar SQL à mão
 * — e a promessa da plataforma ("a pessoa não pode só ver o gabarito") ia
 * ficar quebrada para 1 em cada 6 questões.
 *
 * Body:
 *   {
 *     explicacao?: string,
 *     passos?: [{ titulo, conteudo, formula? }],
 *     figura_svg?: string,
 *     figura_descricao?: string,
 *     status?: 'pendente' | 'resumida' | 'revisada'
 *   }
 */

const STATUS_VALIDOS = new Set(['pendente', 'resumida', 'revisada']);
const MAX_PASSOS = 12;

// SVG cadastrado pelo admin é renderizado com dangerouslySetInnerHTML no
// quadro branco da questão. Barramos aqui o que poderia executar script —
// o admin é confiável, mas um copiar-e-colar de SVG da internet não é.
const SVG_PERIGOSO =
  /<\s*script|<\s*foreignObject|\son\w+\s*=|javascript:|<\s*iframe|<\s*use[^>]+href\s*=\s*["']?https?:/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const admin = await getAuthUserFromRequest(req);
    if (admin?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito ao administrador.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const atualizacao: Record<string, unknown> = {};

    // ─── Explicação ─────────────────────────────────────────
    if (typeof body.explicacao === 'string') {
      const texto = body.explicacao.trim();
      atualizacao.explicacao = texto || null;
    }

    // ─── Passos ─────────────────────────────────────────────
    if (body.passos !== undefined) {
      if (body.passos === null) {
        atualizacao.resolucao_passos = null;
      } else if (!Array.isArray(body.passos)) {
        return NextResponse.json(
          { success: false, error: 'Os passos precisam vir em uma lista.' },
          { status: 400 }
        );
      } else {
        const passos = body.passos
          .filter(
            (p: unknown): p is Record<string, unknown> =>
              !!p && typeof p === 'object'
          )
          .map((p: any) => ({
            titulo: String(p.titulo ?? '').trim().slice(0, 80) || 'Passo',
            conteudo: String(p.conteudo ?? '').trim().slice(0, 2000),
            formula: p.formula ? String(p.formula).trim().slice(0, 500) : null,
          }))
          // Passo sem conteúdo é linha em branco na tela do aluno.
          .filter((p: any) => p.conteudo);

        if (passos.length > MAX_PASSOS) {
          return NextResponse.json(
            {
              success: false,
              error: `No máximo ${MAX_PASSOS} passos. Mais que isso vira texto corrido disfarçado.`,
            },
            { status: 400 }
          );
        }

        atualizacao.resolucao_passos = passos.length ? passos : null;
      }
    }

    // ─── Figura ─────────────────────────────────────────────
    if (typeof body.figura_descricao === 'string') {
      atualizacao.figura_descricao = body.figura_descricao.trim() || null;
    }

    if (typeof body.figura_svg === 'string') {
      const svg = body.figura_svg.trim();
      if (svg) {
        if (SVG_PERIGOSO.test(svg)) {
          return NextResponse.json(
            {
              success: false,
              error:
                'Esse SVG contém script, evento inline ou referência externa. Cole um desenho estático.',
            },
            { status: 400 }
          );
        }
        if (!/^<\s*svg[\s>]/i.test(svg)) {
          return NextResponse.json(
            { success: false, error: 'O conteúdo precisa começar com <svg>.' },
            { status: 400 }
          );
        }
      }
      atualizacao.figura_svg = svg || null;
    }

    // ─── Status ─────────────────────────────────────────────
    if (typeof body.status === 'string') {
      if (!STATUS_VALIDOS.has(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Status inválido.' },
          { status: 400 }
        );
      }
      atualizacao.resolucao_status = body.status;
    } else if (atualizacao.explicacao || atualizacao.resolucao_passos) {
      // Escreveu à mão e não disse o status: é revisada por gente.
      atualizacao.resolucao_status = 'revisada';
    }

    if (Object.keys(atualizacao).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nada para salvar.' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('questoes')
      .update(atualizacao)
      .eq('id', id)
      .select(
        'id, explicacao, resolucao_passos, resolucao_status, figura_svg, figura_descricao'
      )
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada.' },
        { status: 404 }
      );
    }

    await supabase.from('admin_audit_log').insert({
      admin_id: admin.id,
      acao: 'escrever_resolucao',
      entidade_afetada: 'questoes',
      entidade_id: id,
      detalhes: {
        status: data.resolucao_status,
        passos: Array.isArray(data.resolucao_passos)
          ? data.resolucao_passos.length
          : 0,
        tem_explicacao: !!data.explicacao,
        tem_svg: !!data.figura_svg,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PATCH /api/admin/questoes/[id]/resolucao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar a resolução.' },
      { status: 500 }
    );
  }
}
