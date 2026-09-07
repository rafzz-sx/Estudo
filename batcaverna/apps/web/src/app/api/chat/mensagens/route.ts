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

async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  // Aceita cookie (navegador) e header Bearer (app/mobile).
  const user = await getAuthUserFromRequest(req);
  return user?.id ?? null;
}

// Termos ofensivos para flag automática de moderação (Seção 15)
const TERMOS_OFENSIVOS = [
  'lixo', 'idiota', 'otario', 'imbecil', 'merda', 'caralho', 'puta',
  'vagabundo', 'corno', 'arrombado', 'desgracado', 'foder',
];

function contemTermoOfensivo(texto: string): boolean {
  if (!texto) return false;
  const normalizado = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return TERMOS_OFENSIVOS.some((termo) => normalizado.includes(termo));
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
): Promise<boolean> {
  const { data } = await supabase
    .from('conversas')
    .select('user_id_a, user_id_b')
    .eq('id', conversaId)
    .maybeSingle();

  if (!data) return false;
  return data.user_id_a === userId || data.user_id_b === userId;
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
    if (!(await participaDaConversa(supabase, conversaId, user))) {
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
      .neq('autor_id', user)
      .eq('lida', false);

    const { data: mensagens, error } = await supabase
      .from('mensagem_chat')
      .select('*, autor:users!autor_id (id, apelido, avatar_url)')
      .eq('conversa_id', conversaId)
      .order('enviado_em', { ascending: true })
      .limit(100);

    if (error) throw error;

    const formatadas = (mensagens || []).map((m: any) => ({
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

    // A mídia chega como data URL e é gravada na própria linha. Sem conferir,
    // o campo aceitava `data:text/html,<script>` e qualquer tamanho.
    if (midia_url) {
      const midia = validarDataUrlMidia(midia_url, {
        permitirVideo: true,
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
    const duracao = inteiroNaFaixa(duracao_segundos, 0, 600);

    const supabase = createServerSupabaseClient();

    if (!(await participaDaConversa(supabase, conversaId, user))) {
      return NextResponse.json(
        { success: false, error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    const sinalizada = textoFinal ? contemTermoOfensivo(textoFinal) : false;

    const { data: novaMsg, error: mErr } = await supabase
      .from('mensagem_chat')
      .insert({
        conversa_id: conversaId,
        autor_id: user,
        conteudo_texto: textoFinal,
        tipo,
        midia_url: midia_url || null,
        duracao_segundos: duracao,
        sinalizada_para_revisao: sinalizada,
      })
      .select('*, autor:users!autor_id (id, apelido, avatar_url)')
      .single();

    if (mErr) throw mErr;

    // Atualizar timestamp da conversa
    await supabase
      .from('conversas')
      .update({ ultima_mensagem_em: new Date().toISOString() })
      .eq('id', conversaId);

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
