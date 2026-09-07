import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import { aplicarLimite } from '@/lib/seguranca';
import { lerTudo } from '@/lib/contagens';
import { calcularNivel } from '@batcaverna/utils';

/**
 * GET /api/ranking?tipo=tempo_estudo|questoes&periodo=semanal|mensal|geral
 *                 &concurso=EEAR&limit=50
 *
 * Reescrita completa. A versão anterior tinha seis defeitos, e os dois
 * primeiros são graves:
 *
 *  1. IGNORAVA `user_privacy_settings.ocultar_do_ranking`. A tela de perfil
 *     salvava a preferência, a política de privacidade prometia "você pode
 *     sair do ranking a qualquer momento" — e o ranking continuava listando
 *     a pessoa. Promessa quebrada, com adolescentes na base.
 *  2. Não exigia login: qualquer um na internet baixava apelido, avatar,
 *     nível e XP de toda a base numa requisição.
 *  3. Ignorava o parâmetro `concurso`, que a tela manda a cada clique no
 *     seletor. O aluno filtrava por EEAR e via exatamente a mesma lista.
 *  4. Filtrava respostas por `respondida_em`; a coluna chama `respondido_em`.
 *     O ranking semanal e mensal de questões vinha sempre vazio, calado.
 *  5. O PostgREST devolve no máximo 1.000 linhas por requisição. As somas
 *     eram feitas sobre essa primeira fatia, então o ranking passaria a
 *     MENTIR assim que a plataforma tivesse uso de verdade.
 *  6. Trazia `banner_url` — imagem em base64 de até 16 MB guardada na linha
 *     do usuário — e nunca usava.
 */

interface UsuarioRanking {
  id: string;
  nome: string | null;
  apelido: string | null;
  avatar_url: string | null;
  nivel_atual: number | null;
  xp_total: number | null;
  ativo: boolean | null;
  suspenso_ate: string | null;
  /** Contadores mantidos a cada resposta em `gamificacao.ts`. */
  total_questoes_respondidas: number | null;
  total_acertos: number | null;
}

export async function GET(req: NextRequest) {
  try {
    // O ranking é uma tela de dentro da plataforma. Exigir login aqui é o
    // que impede que os dados dos alunos sejam raspados de fora.
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // A rota agrega três tabelas; sem teto, recarregar sem parar derruba o
    // banco. 30 leituras a cada 5 min sobra para navegar entre as abas.
    const bloqueio = aplicarLimite(req, 'ranking', 30, 300);
    if (bloqueio) return bloqueio;

    const { searchParams } = new URL(req.url);

    const tipo =
      searchParams.get('tipo') === 'questoes' ? 'questoes' : 'tempo_estudo';

    const periodoBruto = searchParams.get('periodo') || 'geral';
    const periodo = ['semanal', 'mensal', 'geral'].includes(periodoBruto)
      ? periodoBruto
      : 'geral';

    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '50', 10) || 50, 1),
      100
    );
    const concurso = searchParams.get('concurso');

    const supabase = createServerSupabaseClient();

    let dataCorte: Date | null = null;
    if (periodo === 'semanal') dataCorte = new Date(Date.now() - 7 * 86_400_000);
    else if (periodo === 'mensal') dataCorte = new Date(Date.now() - 30 * 86_400_000);

    // ─── 1. Quem pediu para não aparecer ─────────────────────
    const { data: ocultos } = await supabase
      .from('user_privacy_settings')
      .select('user_id')
      .eq('ocultar_do_ranking', true);

    const escondidos = new Set((ocultos ?? []).map((o) => o.user_id));

    // ─── 2. Filtro por concurso favoritado ───────────────────
    // A tela manda `concurso=EEAR`. Traduzimos para o conjunto de quem
    // favoritou aquele concurso; sem isso o seletor era decorativo.
    let doConcurso: Set<string> | null = null;
    if (concurso && concurso.toLowerCase() !== 'todos') {
      const { data: c } = await supabase
        .from('concursos')
        .select('id')
        .ilike('sigla', concurso)
        .maybeSingle();

      // Sigla inexistente devolve lista vazia — melhor que ranking errado.
      if (!c) {
        return NextResponse.json({
          success: true,
          data: { tipo, periodo, concurso, ranking: [] },
        });
      }

      const favoritos = await lerTudo<{ user_id: string }>(() =>
        supabase
          .from('user_concurso_favoritos')
          .select('user_id')
          .eq('concurso_id', c.id)
      );
      doConcurso = new Set(favoritos.map((f) => f.user_id));
    }

    // ─── 3. Participantes elegíveis ──────────────────────────
    // Conta suspensa ou desativada sai do pódio: quem foi removido da
    // comunidade não continua ocupando o topo dela.
    const usuarios = await lerTudo<UsuarioRanking>(() =>
      supabase
        .from('users')
        .select(
          `id, nome, apelido, avatar_url, nivel_atual, xp_total, ativo, suspenso_ate,
           total_questoes_respondidas, total_acertos`
        )
    );

    const agora = Date.now();
    const elegiveis = usuarios.filter((u) => {
      if (escondidos.has(u.id)) return false;
      if (doConcurso && !doConcurso.has(u.id)) return false;
      if (u.ativo === false) return false;
      if (u.suspenso_ate && new Date(u.suspenso_ate).getTime() > agora) return false;
      return true;
    });

    const idsElegiveis = new Set(elegiveis.map((u) => u.id));

    // ─── 4. Métrica escolhida ────────────────────────────────
    const valorPorUsuario: Record<string, number> = {};
    const acertoPorUsuario: Record<string, { total: number; acertos: number }> = {};

    if (tipo === 'tempo_estudo') {
      const sessoes = await lerTudo<{
        user_id: string | null;
        duracao_segundos: number | null;
      }>(() => {
        const q = supabase
          .from('study_sessions')
          .select('user_id, duracao_segundos');
        return dataCorte ? q.gte('iniciada_em', dataCorte.toISOString()) : q;
      });

      for (const s of sessoes) {
        if (!s.user_id || !idsElegiveis.has(s.user_id)) continue;
        valorPorUsuario[s.user_id] =
          (valorPorUsuario[s.user_id] ?? 0) + (s.duracao_segundos ?? 0);
      }
    } else if (!dataCorte) {
      // ─── Geral: os contadores já existem ──────────────────
      //
      // `users.total_questoes_respondidas` e `total_acertos` são
      // incrementados a cada resposta em `gamificacao.ts`. O ranking geral
      // varria `user_questao_respostas` INTEIRA para recalcular o que já
      // estava somado — uma tabela que cresce com o produto (alunos ×
      // questões respondidas). Com cem mil respostas eram cem viagens ao
      // banco, na aba que abre por padrão.
      //
      // Os números vêm na mesma consulta que já carrega os usuários: zero
      // requisição a mais.
      for (const u of elegiveis) {
        const total = u.total_questoes_respondidas ?? 0;
        if (total <= 0) continue;
        acertoPorUsuario[u.id] = { total, acertos: u.total_acertos ?? 0 };
        valorPorUsuario[u.id] = total;
      }
    } else {
      // ─── Semanal e mensal: precisa da data ────────────────
      // O contador é acumulado desde sempre; recorte por período só sai da
      // tabela de respostas. O filtro de data limita a leitura.
      const respostas = await lerTudo<{
        user_id: string | null;
        correta: boolean | null;
      }>(() =>
        supabase
          .from('user_questao_respostas')
          .select('user_id, correta')
          .gte('respondido_em', dataCorte.toISOString())
      );

      for (const r of respostas) {
        if (!r.user_id || !idsElegiveis.has(r.user_id)) continue;
        const atual = acertoPorUsuario[r.user_id] ?? { total: 0, acertos: 0 };
        atual.total += 1;
        if (r.correta) atual.acertos += 1;
        acertoPorUsuario[r.user_id] = atual;
        valorPorUsuario[r.user_id] = atual.total;
      }
    }

    // ─── 5. Monta o pódio ────────────────────────────────────
    const ranking = elegiveis
      .map((u) => {
        const stats = acertoPorUsuario[u.id];
        // O título vem do mesmo `calcularNivel` que a plataforma inteira usa.
        // Estava reescrito na mão aqui, com faixas diferentes em cada aba: o
        // mesmo aluno era "Cabo" no ranking de tempo e "Recruta" no de
        // questões.
        const nivel = calcularNivel(u.xp_total ?? 0);

        return {
          user_id: u.id,
          apelido: u.apelido || u.nome || 'Soldado',
          avatar_url: u.avatar_url,
          nivel_atual: nivel.nivel,
          titulo_nivel: nivel.titulo,
          valor: valorPorUsuario[u.id] ?? 0,
          percentual_acerto:
            stats && stats.total > 0
              ? Number(((stats.acertos / stats.total) * 100).toFixed(1))
              : 0,
        };
      })
      .filter((item) => item.valor > 0)
      .sort(
        (a, b) => b.valor - a.valor || b.percentual_acerto - a.percentual_acerto
      )
      .slice(0, limit)
      .map((item, index) => ({ ...item, posicao: index + 1 }));

    return NextResponse.json({
      success: true,
      data: { tipo, periodo, concurso: concurso ?? 'todos', ranking },
    });
  } catch (error) {
    console.error('GET /api/ranking error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao montar o ranking' },
      { status: 500 }
    );
  }
}
