import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getAuthUserFromRequest } from '@/lib/auth';
import {
  inteiroNaFaixa,
  limparTexto,
  uuidOuNulo,
  validarDataUrlMidia,
} from '@/lib/seguranca';
import {
  analisarMensagem,
  ROTULO_CATEGORIA,
  ROTULO_GRAVIDADE,
  trechoParaAlerta,
  type ResultadoModeracao,
} from '@/lib/moderacao';

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
}

/**
 * Avisa a moderação. Roda depois de a mensagem já estar gravada — se falhar,
 * a mensagem não é perdida, só o aviso; e o registro continua na fila do
 * painel de qualquer forma.
 *
 * O alerta responde as três perguntas de quem modera: QUEM escreveu, O QUE
 * escreveu e PARA QUEM. Sem o "para quem" o admin precisava abrir a conversa
 * para saber se era briga entre dois amigos ou alguém de fora incomodando.
 */
async function avisarModeracao(
  supabase: SupabaseClient,
  dados: {
    analise: ResultadoModeracao;
    mensagemId: string;
    conversaId: string;
    autorId: string;
    destinatarioId: string | null;
    texto: string;
  }
): Promise<void> {
  const { analise, mensagemId, conversaId, autorId, destinatarioId, texto } = dados;

  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .eq('ativo', true);

  if (!admins?.length) return;

  const [autor, destinatario] = await Promise.all([
    supabase.from('users').select('apelido, nome').eq('id', autorId).maybeSingle(),
    destinatarioId
      ? supabase.from('users').select('apelido, nome').eq('id', destinatarioId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const quem = autor.data?.apelido ?? 'Alguém';
  const paraQuem = destinatario.data?.apelido ?? 'outro aluno';
  const categorias = analise.categorias.map((c) => ROTULO_CATEGORIA[c]).join(', ');
  const gravidade = analise.gravidade ? ROTULO_GRAVIDADE[analise.gravidade] : 'Baixa';

  const emoji = analise.gravidade === 'critica' ? '🚨' : '⚠️';

  await supabase.from('notificacoes').insert(
    admins.map((a) => ({
      user_id: a.id,
      tipo: 'moderacao',
      titulo: `${emoji} ${gravidade} · ${categorias}`,
      // O trecho vai na própria notificação: o admin decide se precisa abrir
      // a conversa sem ter de abrir a conversa para decidir.
      mensagem: `${quem} → ${paraQuem}: "${trechoParaAlerta(texto)}"`,
      dados_extra: {
        mensagem_id: mensagemId,
        conversa_id: conversaId,
        autor_id: autorId,
        autor_apelido: quem,
        destinatario_id: destinatarioId,
        destinatario_apelido: paraQuem,
        gravidade: analise.gravidade,
        categorias: analise.categorias,
        termos: analise.ocorrencias.map((o) => o.trecho),
      },
    }))
  );
}

/** Tipos que a coluna `tipo` (enum `mensagem_chat_tipo`) aceita. */
const TIPOS_VALIDOS = new Set(['texto', 'audio', 'imagem']);

/** ~8 MB de base64 ≈ 6 MB de arquivo: cabe foto e áudio de voz. */
const MAX_MIDIA_CHAT = 8 * 1024 * 1024;

/**
 * Confere que o usuário é um dos dois lados da conversa.
 *
 * ISTO NÃO EXISTIA. Nem no GET nem no POST: bastava trocar o `conversa_id`
 * na requisição para LER a conversa privada de dois estranhos — e ainda
 * marcá-la como lida, entregando o dedo — ou para ESCREVER dentro dela como
 * se fosse um dos dois. Como todas as rotas usam a chave de serviço, o RLS
 * do banco não barra nada aqui: quem precisa conferir é este código.
 *
 * A política de privacidade promete que a conversa é privada entre os dois,
 * e há menores de idade na plataforma.
 */
async function participaDaConversa(
  supabase: SupabaseClient,
  conversaId: string,
  userId: string
): Promise<{ participa: boolean; outroId: string | null; ehGrupo?: boolean }> {
  const { data } = await supabase
    .from('conversas')
    .select('user_id_a, user_id_b, tipo, criador_id, amizade_id')
    .eq('id', conversaId)
    .maybeSingle();

  if (!data) return { participa: false, outroId: null };

  const ehGrupo = data.tipo === 'grupo' || !data.amizade_id;

  // 1. Se o usuário está diretamente na tabela conversas (criador ou pontas da conversa)
  if (data.user_id_a === userId || data.user_id_b === userId || data.criador_id === userId) {
    const outroId = ehGrupo ? null : (data.user_id_a === userId ? data.user_id_b : data.user_id_a);
    // Se for grupo e o criador ainda não tem linha em conversa_participantes, insere em segundo plano
    if (ehGrupo) {
      supabase.from('conversa_participantes').upsert(
        { conversa_id: conversaId, user_id: userId },
        { onConflict: 'conversa_id,user_id' }
      ).then();
    }
    return { participa: true, outroId, ehGrupo };
  }

  // 2. Se for grupo, verificar na tabela de participantes
  if (ehGrupo) {
    const { data: part } = await supabase
      .from('conversa_participantes')
      .select('id')
      .eq('conversa_id', conversaId)
      .eq('user_id', userId)
      .maybeSingle();
    if (part) {
      return { participa: true, outroId: null, ehGrupo: true };
    }
  }

  return { participa: false, outroId: null };
}

// GET /api/chat/mensagens?conversa_id=xyz — Lista mensagens de uma conversa
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conversaId = uuidOuNulo(searchParams.get('conversa_id'));

    if (!conversaId) {
      return NextResponse.json({ success: false, error: 'conversa_id obrigatório' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // A checagem vem antes do UPDATE de "lida": marcar como lida a conversa
    // dos outros já seria, por si só, vazar que alguém entrou nela.
    const acesso = await participaDaConversa(supabase, conversaId, user.id);
    if (!acesso.participa) {
      return NextResponse.json(
        { success: false, error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Marcar mensagens recebidas como lidas
    await supabase
      .from('mensagem_chat')
      .update({ lida: true })
      .eq('conversa_id', conversaId)
      .neq('autor_id', user.id)
      .eq('lida', false);

    const { data: mensagens, error } = await supabase
      .from('mensagem_chat')
      .select('*, autor:users!autor_id (id, apelido, avatar_url)')
      .eq('conversa_id', conversaId)
      .order('enviado_em', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Inverte para exibir em ordem cronológica as 100 mensagens mais recentes
    const ordenadas = (mensagens || []).reverse();

    const formatadas = ordenadas.map((m: any) => ({
      id: m.id,
      conversa_id: m.conversa_id,
      remetente_id: m.autor_id,
      tipo: m.tipo,
      conteudo: m.conteudo_texto,
      midia_url: m.midia_url,
      duracao_segundos: m.duracao_segundos,
      enviado_em: m.enviado_em,
      lida: m.lida,
      sinalizada_para_revisao: m.sinalizada_para_revisao,
      remetente: {
        id: m.autor?.id,
        apelido: m.autor?.apelido || 'Soldado',
        avatar_url: m.autor?.avatar_url,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formatadas,
    });
  } catch (error) {
    console.error('GET /api/chat/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}

// POST /api/chat/mensagens — Envia uma nova mensagem (texto, áudio ou imagem)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { conteudo, midia_url, duracao_segundos } = body;

    const conversaId = uuidOuNulo(body?.conversa_id);
    if (!conversaId) {
      return NextResponse.json(
        { success: false, error: 'Dados da mensagem incompletos' },
        { status: 400 }
      );
    }

    // O texto entra limpo e com teto — o mesmo limite do CHECK no banco, para
    // a pessoa receber um aviso em vez de um erro do Postgres.
    const textoFinal = limparTexto(conteudo, 2000);

    if (!textoFinal && !midia_url) {
      return NextResponse.json(
        { success: false, error: 'Dados da mensagem incompletos' },
        { status: 400 }
      );
    }

    // `tipo` cai num enum do Postgres: valor fora da lista derruba o INSERT
    // com uma mensagem que entrega o nome do enum.
    const tipo = TIPOS_VALIDOS.has(body?.tipo) ? body.tipo : 'texto';

    // A mídia chega como data URL e é gravada na própria linha.
    if (midia_url) {
      const midia = validarDataUrlMidia(midia_url, {
        permitirVideo: true,
        permitirAudio: true,
        maxBytes: MAX_MIDIA_CHAT,
      });
      if (!midia.ok) {
        return NextResponse.json(
          { success: false, error: midia.erro ?? 'Anexo inválido.' },
          { status: 400 }
        );
      }
    }

    // Áudio de voz: 10 minutos é generoso e impede estourar o INTEGER.
    const duracao = inteiroNaFaixa(duracao_segundos, 0, 600, 0);

    const supabase = createServerSupabaseClient();

    const acesso = await participaDaConversa(supabase, conversaId, user.id);
    if (!acesso.participa) {
      return NextResponse.json(
        { success: false, error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Para conversas diretas, conferir se a amizade ainda está ativa. Grupos não têm amizade_id.
    if (!acesso.ehGrupo) {
      const { data: convInfo } = await supabase
        .from('conversas')
        .select('amizade_id')
        .eq('id', conversaId)
        .maybeSingle();

      if (!convInfo?.amizade_id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Esta amizade foi desfeita. O chat está disponível apenas para leitura do histórico.',
          },
          { status: 403 }
        );
      }

      const { data: amizadeInfo } = await supabase
        .from('amizades')
        .select('status')
        .eq('id', convInfo.amizade_id)
        .maybeSingle();

      if (!amizadeInfo || amizadeInfo.status !== 'aceita') {
        return NextResponse.json(
          {
            success: false,
            error: 'Não é possível enviar mensagens: esta amizade não está ativa.',
          },
          { status: 403 }
        );
      }
    }

    const analise = analisarMensagem(textoFinal);

    let novaMsg: any = null;
    let mErr: any = null;

    // Tentativa 1: Inserir com colunas estendidas de moderação
    const insertPayload: Record<string, any> = {
      conversa_id: conversaId,
      autor_id: user.id,
      conteudo_texto: textoFinal,
      tipo,
      midia_url: midia_url || null,
      duracao_segundos: duracao,
      sinalizada_para_revisao: analise.sinalizada,
    };
    if (analise.gravidade) insertPayload.gravidade_moderacao = analise.gravidade;
    if (analise.categorias.length) insertPayload.categorias_moderacao = analise.categorias;
    if (analise.ocorrencias.length) {
      insertPayload.termos_detectados = analise.ocorrencias.map((o) => o.trecho);
    }

    const resComModeracao = await supabase
      .from('mensagem_chat')
      .insert(insertPayload)
      .select('*, autor:users!autor_id (id, apelido, avatar_url)')
      .single();

    if (resComModeracao.error) {
      // Se a tabela ainda não tiver as colunas de moderação no banco, insere com os campos base
      const erroColuna =
        resComModeracao.error.code === '42703' ||
        resComModeracao.error.message?.includes('gravidade_moderacao') ||
        resComModeracao.error.message?.includes('schema cache');

      if (erroColuna) {
        const resBase = await supabase
          .from('mensagem_chat')
          .insert({
            conversa_id: conversaId,
            autor_id: user.id,
            conteudo_texto: textoFinal,
            tipo,
            midia_url: midia_url || null,
            duracao_segundos: duracao,
            sinalizada_para_revisao: analise.sinalizada,
          })
          .select('*, autor:users!autor_id (id, apelido, avatar_url)')
          .single();

        if (resBase.error) throw resBase.error;
        novaMsg = resBase.data;
      } else {
        throw resComModeracao.error;
      }
    } else {
      novaMsg = resComModeracao.data;
    }

    // Atualizar timestamp da conversa
    await supabase
      .from('conversas')
      .update({ ultima_mensagem_em: new Date().toISOString() })
      .eq('id', conversaId);

    // Alerta ao vivo para a moderação. Só o que for grave o bastante — o
    // palavrão solto fica na fila do painel e espera. Um sino que toca a
    // cada "que prova do caralho" é um sino que o admin desliga na
    // primeira semana, e aí a ameaça de verdade passa junto.
    if (analise.alertaImediato && textoFinal) {
      try {
        await avisarModeracao(supabase, {
          analise,
          mensagemId: novaMsg.id,
          conversaId,
          autorId: user.id,
          destinatarioId: acesso.outroId,
          texto: textoFinal,
        });
      } catch (e) {
        // A mensagem já está gravada e sinalizada; o painel mostra de
        // qualquer jeito. Falhar aqui não pode derrubar o envio.
        console.error('Falha ao notificar moderação:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: novaMsg.id,
        conversa_id: novaMsg.conversa_id,
        remetente_id: novaMsg.autor_id,
        tipo: novaMsg.tipo,
        conteudo: novaMsg.conteudo_texto,
        midia_url: novaMsg.midia_url,
        duracao_segundos: novaMsg.duracao_segundos,
        enviado_em: novaMsg.enviado_em,
        remetente: {
          id: novaMsg.autor?.id,
          apelido: novaMsg.autor?.apelido || 'Você',
          avatar_url: novaMsg.autor?.avatar_url,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/chat/mensagens error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
