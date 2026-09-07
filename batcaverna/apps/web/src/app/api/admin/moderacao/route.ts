import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { uuidOuNulo, limparTexto } from '@/lib/seguranca';

/**
 * Fila de moderação do chat.
 *
 * A aba de moderação que existia listava as 50 conversas MAIS RECENTES e
 * mostrava um contador de bandeiras em cada uma. Duas consequências:
 *
 *  • uma ameaça de três meses atrás ficava na página 51, invisível — ordenar
 *    fila de moderação por recência é o contrário do que ela precisa;
 *  • para saber o que tinha acontecido, o admin abria conversa por conversa.
 *
 * Aqui a unidade é a MENSAGEM sinalizada, não a conversa, e ela vem com as
 * três respostas que o moderador precisa: quem escreveu, o que escreveu e
 * para quem. Mais a reincidência do autor, que é o número que separa um
 * escorregão de um padrão.
 */

async function getAdmin(req: NextRequest) {
  const user = await getAuthUserFromRequest(req);
  return user?.role === 'admin' ? user : null;
}

/** Crítica primeiro. O Postgres não ordena texto por gravidade sozinho. */
const PESO: Record<string, number> = { critica: 4, alta: 3, media: 2, baixa: 1 };

// ═══════════════════════════════════════════════════════════════
// GET /api/admin/moderacao?estado=pendentes|revisadas|todas&gravidade=critica
// ═══════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  try {
    const admin = await getAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado: administrador obrigatório' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const estado = searchParams.get('estado') || 'pendentes';
    const gravidade = searchParams.get('gravidade');

    const supabase = createServerSupabaseClient();

    let query = supabase.from('moderacao_fila').select('*');

    if (estado === 'pendentes') query = query.is('revisada_em', null);
    else if (estado === 'revisadas') query = query.not('revisada_em', 'is', null);

    if (gravidade && PESO[gravidade]) {
      query = query.eq('gravidade_moderacao', gravidade);
    }

    const { data, error } = await query
      .order('enviado_em', { ascending: false })
      .limit(300);

    if (error) throw error;

    // Ordena por gravidade no servidor: 'critica' < 'alta' em ordem
    // alfabética, então deixar isso para o banco colocaria "alta" na frente
    // de "crítica" — exatamente ao contrário.
    const fila = (data ?? []).sort((a: any, b: any) => {
      const peso = (PESO[b.gravidade_moderacao] ?? 0) - (PESO[a.gravidade_moderacao] ?? 0);
      if (peso !== 0) return peso;
      return new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime();
    });

    const resumo = {
      pendentes: fila.filter((m: any) => !m.revisada_em).length,
      criticas: fila.filter((m: any) => m.gravidade_moderacao === 'critica' && !m.revisada_em).length,
      altas: fila.filter((m: any) => m.gravidade_moderacao === 'alta' && !m.revisada_em).length,
    };

    return NextResponse.json({ success: true, data: { fila, resumo } });
  } catch (error) {
    console.error('GET /api/admin/moderacao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar a fila de moderação' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// PUT /api/admin/moderacao — registrar a decisão sobre uma mensagem
// Body: { mensagem_id, decisao, observacao? }
// ═══════════════════════════════════════════════════════════════
export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado: administrador obrigatório' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const mensagemId = uuidOuNulo(body?.mensagem_id);
    const decisao = body?.decisao;

    const DECISOES = ['sem_problema', 'advertido', 'suspenso', 'em_apuracao'];
    if (!mensagemId || !DECISOES.includes(decisao)) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // "sem_problema" tira a bandeira: se o filtro errou, a mensagem volta a
    // ser uma mensagem comum. Deixar a marca vermelha em algo já apurado só
    // faz a próxima pessoa reabrir o mesmo caso.
    const { error } = await supabase
      .from('mensagem_chat')
      .update({
        decisao_moderacao: decisao,
        revisada_em: new Date().toISOString(),
        revisada_por: admin.id,
        ...(decisao === 'sem_problema' ? { sinalizada_para_revisao: false } : {}),
      })
      .eq('id', mensagemId);

    if (error) throw error;

    // Toda decisão de moderação fica no log: é o que permite responder
    // "por que essa conta foi suspensa?" seis meses depois.
    await supabase.from('admin_audit_log').insert({
      admin_id: admin.id,
      acao: 'moderacao_decisao',
      entidade_afetada: 'mensagem_chat',
      entidade_id: mensagemId,
      detalhes: {
        decisao,
        observacao: limparTexto(body?.observacao, 500),
      },
    });

    return NextResponse.json({ success: true, data: { decisao } });
  } catch (error) {
    console.error('PUT /api/admin/moderacao error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar a decisão' },
      { status: 500 }
    );
  }
}
