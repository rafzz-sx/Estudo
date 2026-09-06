"use client";

import { useState } from "react";

/**
 * Player de vídeo-aula embutido.
 *
 * O aluno assiste dentro da plataforma — não é redirecionado para o YouTube,
 * onde perderia a sessão de estudo e cairia nos vídeos recomendados.
 *
 * A thumbnail carrega antes do iframe (fachada): o embed do YouTube pesa e
 * roda scripts de tracking em toda visita. Só montamos o iframe quando o
 * aluno realmente aperta o play, e usamos o domínio nocookie.
 */
export interface VideoAula {
  id: string;
  titulo: string;
  descricao?: string | null;
  provedor: string;
  video_id: string;
  canal?: string | null;
  duracao_segundos?: number | null;
}

function formatarDuracao(segundos?: number | null): string | null {
  if (!segundos) return null;
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VideoAulaPlayer({ video }: { video: VideoAula }) {
  const [tocando, setTocando] = useState(false);
  const duracao = formatarDuracao(video.duracao_segundos);

  const thumb = `https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`;
  const embed = `https://www.youtube-nocookie.com/embed/${video.video_id}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <article className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card">
      <div className="relative aspect-video w-full bg-black">
        {tocando ? (
          <iframe
            src={embed}
            title={video.titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            onClick={() => setTocando(true)}
            className="group absolute inset-0 h-full w-full cursor-pointer"
            aria-label={`Assistir: ${video.titulo}`}
          >
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-90"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bat-gold-400 text-2xl text-black shadow-[0_0_30px_rgba(245,197,24,0.5)] transition-transform group-hover:scale-110">
                ▶
              </span>
            </span>
            {duracao && (
              <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                {duracao}
              </span>
            )}
          </button>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-sm font-bold leading-snug text-bat-text">
          {video.titulo}
        </h4>
        {video.canal && (
          <p className="mt-1 text-[11px] text-bat-text-muted">{video.canal}</p>
        )}
        {video.descricao && (
          <p className="mt-2 text-xs leading-relaxed text-bat-text-secondary">
            {video.descricao}
          </p>
        )}
      </div>
    </article>
  );
}
