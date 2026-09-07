import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';

async function getUserFromRequest(req: NextRequest) {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  return getAuthUserFromRequest(req);
}

// GET /api/usuarios/me/concursos-favoritos
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from('user_concurso_favoritos')
      .select('concurso_id, ordem, concursos (id, sigla)')
      .eq('user_id', user.id)
      .order('ordem', { ascending: true });

    return NextResponse.json({
      success: true,
      data: (data || []).map((d: any) => d.concursos?.sigla).filter(Boolean),
    });
  } catch (error) {
    console.error('GET /api/usuarios/me/concursos-favoritos error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar favoritos' }, { status: 500 });
  }
}

// PUT /api/usuarios/me/concursos-favoritos — Salvar seleção de concursos favoritos
export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const siglas: unknown = body?.concursos;
    if (!Array.isArray(siglas) || siglas.some((s) => typeof s !== 'string')) {
      return NextResponse.json({ success: false, error: 'Lista de concursos inválida' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // ─── 1. Resolver sigla -> id, SEM diferenciar maiúsculas ─────
    // A versão anterior fazia `.in('sigla', siglas.map(toUpperCase))`. O
    // `.in()` compara igualdade exata, e no banco a sigla é 'EsPCEx' — a
    // única com minúsculas. 'ESPCEX' nunca casava: o EsPCEx era o único
    // concurso que NUNCA conseguia ser favoritado. E a rota devolvia a lista
    // enviada como se tivesse gravado, então a tela comemorava.
    //
    // São 9 concursos: trazer todos e casar em memória é mais barato que uma
    // consulta por sigla, e funciona para qualquer grafia.
    const { data: todos } = await supabase.from('concursos').select('id, sigla');
    const porSigla = new Map(
      (todos ?? []).map((c) => [String(c.sigla).toUpperCase(), c])
    );

    const escolhidos: { id: string; sigla: string }[] = [];
    const desconhecidas: string[] = [];
    for (const s of siglas as string[]) {
      const c = porSigla.get(s.trim().toUpperCase());
      if (c && !escolhidos.some((e) => e.id === c.id)) escolhidos.push(c);
      else if (!c) desconhecidas.push(s);
    }

    // Lista não vazia que não resolveu NENHUM concurso é entrada ruim, não
    // um pedido de "apagar tudo". Antes, isso apagava todos os favoritos.
    if (siglas.length > 0 && escolhidos.length === 0) {
      return NextResponse.json(
        { success: false, error: `Concurso não reconhecido: ${desconhecidas.join(', ')}` },
        { status: 400 }
      );
    }

    // ─── 2. Aplicar só a DIFERENÇA ───────────────────────────────
    // O supabase-js não tem transação. Apagar tudo e inserir de novo deixava
    // uma janela em que, se o insert falhasse, o aluno perdia todos os
    // favoritos. Calculando o delta, o pior caso é ficar com um a mais ou a
    // menos — nunca com zero.
    const { data: atuais } = await supabase
      .from('user_concurso_favoritos')
      .select('concurso_id')
      .eq('user_id', user.id);

    const idsAtuais = new Set((atuais ?? []).map((a) => a.concurso_id));
    const idsNovos = new Set(escolhidos.map((c) => c.id));

    const remover = [...idsAtuais].filter((id) => !idsNovos.has(id));
    if (remover.length) {
      const { error } = await supabase
        .from('user_concurso_favoritos')
        .delete()
        .eq('user_id', user.id)
        .in('concurso_id', remover);
      if (error) throw error;
    }

    // Upsert cobre os dois casos: entra o que faltava e reordena o que já
    // estava (a ordem é a da lista enviada).
    if (escolhidos.length) {
      const { error } = await supabase.from('user_concurso_favoritos').upsert(
        escolhidos.map((c, index) => ({
          user_id: user.id,
          concurso_id: c.id,
          ordem: index,
        })),
        { onConflict: 'user_id,concurso_id' }
      );
      if (error) throw error;
    }

    // ─── 3. Devolver o que FOI GRAVADO, não o que foi enviado ────
    return NextResponse.json({
      success: true,
      data: escolhidos.map((c) => c.sigla),
      ...(desconhecidas.length ? { ignoradas: desconhecidas } : {}),
    });
  } catch (error) {
    console.error('PUT /api/usuarios/me/concursos-favoritos error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar favoritos' }, { status: 500 });
  }
}
