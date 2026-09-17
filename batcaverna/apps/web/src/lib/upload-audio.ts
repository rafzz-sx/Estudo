/**
 * Helper de áudio para o Chat da BatCaverna.
 *
 * Princípios (Skills: react-patterns, supabase-postgres-best-practices):
 * 1. Upload direto ao Supabase Storage via signed URL (evita Base64 no banco e limite de 4.5MB da Vercel).
 * 2. Cálculo rápido e confiável de duração em segundos.
 * 3. Fallback inteligente para Data URL em caso de falha de conexão/storage.
 */

export async function obterDuracaoAudio(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') {
        resolve(1);
        return;
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.preload = 'metadata';

      const timeout = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(1);
      }, 3000);

      audio.onloadedmetadata = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        const dur = Math.round(audio.duration);
        resolve(isNaN(dur) || dur <= 0 ? 1 : Math.min(dur, 600));
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
        resolve(1);
      };

      audio.src = url;
    } catch {
      resolve(1);
    }
  });
}

export function converterBlobParaDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Falha ao ler blob como Data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Erro na leitura do blob'));
    reader.readAsDataURL(blob);
  });
}

export async function uploadAudioChat(
  audioBlob: Blob,
  fetchAuth: (url: string, init?: RequestInit) => Promise<Response>
): Promise<{ publicUrl: string; duracao: number }> {
  const duracao = await obterDuracaoAudio(audioBlob);

  // Determinar extensão a partir do tipo MIME
  const mimeType = audioBlob.type || 'audio/webm';
  let ext = 'webm';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'mp4';
  else if (mimeType.includes('ogg') || mimeType.includes('opus')) ext = 'ogg';
  else if (mimeType.includes('aac')) ext = 'aac';
  else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) ext = 'mp3';
  else if (mimeType.includes('wav')) ext = 'wav';

  try {
    // 1. Obter signed URL do backend
    const res = await fetchAuth('/api/upload/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'audio-chat',
        nomeArquivo: `audio-${Date.now()}.${ext}`,
        contentType: mimeType,
      }),
    });

    if (!res.ok) {
      throw new Error(`Servidor recusou signed URL (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (!data.success || !data.signedUrl || !data.publicUrl) {
      throw new Error(data.error || 'Resposta inválida do gerador de signed URL');
    }

    // 2. Upload direto do binário para o Supabase Storage via PUT
    const uploadRes = await fetch(data.signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
      },
      body: audioBlob,
    });

    if (!uploadRes.ok) {
      throw new Error(`Falha no upload para Storage (HTTP ${uploadRes.status})`);
    }

    return {
      publicUrl: data.publicUrl,
      duracao,
    };
  } catch (err) {
    console.warn('[upload-audio] Falha no upload para Storage, acionando fallback Data URL:', err);
    // Fallback: se o Storage falhar, converte para Data URL para nunca perder a mensagem do usuário
    const dataUrl = await converterBlobParaDataUrl(audioBlob);
    return {
      publicUrl: dataUrl,
      duracao,
    };
  }
}
