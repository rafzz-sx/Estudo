import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { aplicarLimite } from '@/lib/seguranca';

export const dynamic = 'force-dynamic';

const FORMATOS_AVATAR = new Set(['png', 'jpeg', 'jpg', 'webp', 'gif', 'avif']);
const FORMATOS_AUDIO = new Set(['webm', 'mp4', 'ogg', 'opus', 'mp3', 'wav', 'aac', 'm4a', 'weba']);
const FORMATOS_BANNER = new Set([
  'png',
  'jpeg',
  'jpg',
  'webp',
  'gif',
  'avif',
  'mp4',
  'webm',
  'mov',
  'quicktime',
  'm4v',
]);

/**
 * POST /api/upload/signed-url
 *
 * Gera uma URL assinada para upload direto do navegador ao Supabase Storage.
 * Com isso:
 * 1. O arquivo binário NÃO passa pelo servidor Vercel (eliminando o limite de 4.5 MB no body).
 * 2. Suporta arquivos de vídeo de até 50 MB e áudio comprimido de voz instantâneo.
 * 3. O banco de dados salva apenas a URL pública final (~100 bytes ao invés de megabytes em base64).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limiting: no máximo 20 gerações de upload por minuto por IP
    const bloqueio = aplicarLimite(req, 'upload-signed-url', 20, 60);
    if (bloqueio) return bloqueio;

    const body = await req.json().catch(() => ({}));
    const { tipo, nomeArquivo, contentType } = body;

    if (tipo !== 'banner' && tipo !== 'avatar' && tipo !== 'audio-chat') {
      return NextResponse.json(
        { success: false, error: 'Tipo de mídia inválido. Use "banner", "avatar" ou "audio-chat".' },
        { status: 400 }
      );
    }

    if (!nomeArquivo || typeof nomeArquivo !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nome de arquivo inválido.' },
        { status: 400 }
      );
    }

    // Extrair extensão
    const ext = nomeArquivo.split('.').pop()?.toLowerCase() || '';
    const formatosPermitidos =
      tipo === 'avatar'
        ? FORMATOS_AVATAR
        : tipo === 'audio-chat'
        ? FORMATOS_AUDIO
        : FORMATOS_BANNER;

    if (!formatosPermitidos.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Formato de arquivo ".${ext}" não suportado. Use ${Array.from(formatosPermitidos).join(', ')}.`,
        },
        { status: 400 }
      );
    }

    // Identificar tipo de mídia
    const ehAudio = tipo === 'audio-chat' || FORMATOS_AUDIO.has(ext) || String(contentType).startsWith('audio/');
    const ehVideo = !ehAudio && (['mp4', 'webm', 'mov', 'quicktime', 'm4v'].includes(ext) || String(contentType).startsWith('video/'));
    const ehGif = !ehAudio && (ext === 'gif' || contentType === 'image/gif');
    const midiaTipo: 'video' | 'gif' | 'imagem' | 'audio' = ehAudio ? 'audio' : ehVideo ? 'video' : ehGif ? 'gif' : 'imagem';

    // Gerar caminho limpo e isolado por usuário
    const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
    const prefixoPasta = tipo === 'audio-chat' ? 'audios' : `${tipo}s`;
    const path = `${prefixoPasta}/${user.id}/${Date.now()}-${randomId}.${ext}`;

    const supabase = createServerSupabaseClient();

    // Garantir que o bucket 'media' existe (cria se ainda não existir)
    const { data: bucketInfo, error: getBucketErr } = await supabase.storage.getBucket('media');
    if (getBucketErr || !bucketInfo) {
      await supabase.storage.createBucket('media', {
        public: true,
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
          'image/gif',
          'image/avif',
          'video/mp4',
          'video/webm',
          'video/quicktime',
          'video/x-m4v',
          'audio/webm',
          'audio/mp4',
          'audio/ogg',
          'audio/opus',
          'audio/mpeg',
          'audio/wav',
          'audio/aac',
          'audio/x-m4a',
        ],
      });
    }

    // Criar a signed upload URL
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('media')
      .createSignedUploadUrl(path);

    if (uploadErr || !uploadData) {
      console.error('Erro ao gerar signed upload URL:', uploadErr);
      return NextResponse.json(
        { success: false, error: uploadErr?.message || 'Falha ao preparar upload no storage.' },
        { status: 500 }
      );
    }

    // URL pública definitiva
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      signedUrl: uploadData.signedUrl,
      token: uploadData.token,
      path: uploadData.path,
      publicUrl,
      midiaTipo,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/upload/signed-url:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Erro interno ao processar upload.' },
      { status: 500 }
    );
  }
}
