"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  usePlayerStore,
  extrairVideoIdYouTube,
  registrarControladorYouTube,
  type ControladorYouTubeBridge,
} from "@/stores/player-store";

/**
 * YouTubeGlobalPlayer — Motor de áudio em segundo plano para o Dynamic Island.
 *
 * Características:
 * 1. Fica montado no AppShell, persistente entre trocas de página.
 * 2. Mantém o iframe do YouTube em segundo plano (invisível na tela, sem qualquer widget no canto),
 *    permitindo que a experiência visual seja 100% focada no Dynamic Island.
 * 3. Ponte bidirecional via HTML5 postMessage (comandos de play/pause/seek/volume).
 */
export function YouTubeGlobalPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentVideoIdRef = useRef<string | null>(null);

  const fila = usePlayerStore((s) => s.fila);
  const indice = usePlayerStore((s) => s.indice);
  const tocando = usePlayerStore((s) => s.tocando);
  const volume = usePlayerStore((s) => s.volume);

  const musicaAtual = fila[indice];
  const videoIdAtual = musicaAtual
    ? musicaAtual.fonte === "youtube" && musicaAtual.fonte_id
      ? musicaAtual.fonte_id
      : extrairVideoIdYouTube(musicaAtual.fonte_id || musicaAtual.audio_url)
    : null;

  const ehYouTube = Boolean(videoIdAtual);

  /** Dispara comando via postMessage para o iframe do YouTube */
  const postYT = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      } catch (err) {
        console.warn("[YouTubeGlobalPlayer] Falha ao enviar comando postMessage:", err);
      }
    }
  }, []);

  /** Carrega ou troca o vídeo do YouTube */
  const carregarVideo = useCallback(
    (videoId: string, vol: number, startSeconds = 0) => {
      currentVideoIdRef.current = videoId;

      if (!iframeRef.current) return;

      const originParam = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
      const novoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1&controls=0&rel=0&start=${Math.floor(
        startSeconds
      )}&origin=${originParam}`;

      // Se já está no mesmo vídeo, apenas executa playVideo
      if (iframeRef.current.src && iframeRef.current.src.includes(videoId)) {
        postYT("unMute");
        postYT("setVolume", [Math.round(vol * 100)]);
        postYT("playVideo");
        return;
      }

      // Troca a URL do iframe
      iframeRef.current.src = novoSrc;

      // Envia comandos após carregar
      iframeRef.current.onload = () => {
        postYT("unMute");
        postYT("setVolume", [Math.round(vol * 100)]);
        postYT("playVideo");
        postYT("listening");
      };
    },
    [postYT]
  );

  /** Registra o controlador no singleton do player-store */
  useEffect(() => {
    const controlador: ControladorYouTubeBridge = {
      tocar: (videoId: string, vol: number, pos = 0) => {
        carregarVideo(videoId, vol, pos);
      },
      pausar: () => {
        postYT("pauseVideo");
      },
      retomar: () => {
        postYT("playVideo");
      },
      buscar: (segundos: number) => {
        postYT("seekTo", [segundos, true]);
      },
      definirVolume: (vol: number) => {
        postYT("setVolume", [Math.round(vol * 100)]);
        postYT("unMute");
      },
      estaPronto: () => true,
    };

    registrarControladorYouTube(controlador);

    return () => {
      registrarControladorYouTube(null);
    };
  }, [carregarVideo, postYT]);

  /** Escuta eventos vindos do iframe do YouTube para sincronizar término e estado */
  useEffect(() => {
    const tratarMensagem = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;

      try {
        const dados = JSON.parse(event.data);

        // Atualização de tempo e duração direta do player do YouTube
        if (dados.event === "infoDelivery" && dados.info) {
          const { currentTime, duration, playerState } = dados.info;

          if (typeof currentTime === "number") {
            usePlayerStore.getState()._sincronizar(currentTime, duration || 0);
          }

          if (playerState === 1 && !usePlayerStore.getState().tocando) {
            usePlayerStore.setState({ tocando: true });
          } else if (playerState === 2 && usePlayerStore.getState().tocando) {
            usePlayerStore.setState({ tocando: false });
          } else if (playerState === 0) {
            usePlayerStore.getState()._aoTerminar();
          }
        }

        // Mudança de estado (1: tocando, 2: pausado, 0: finalizado)
        if (dados.event === "onStateChange") {
          const estado = dados.info;
          if (estado === 1) {
            usePlayerStore.setState({ tocando: true });
          } else if (estado === 2) {
            usePlayerStore.setState({ tocando: false });
          } else if (estado === 0) {
            usePlayerStore.getState()._aoTerminar();
          }
        }

        // Falha no YouTube (vídeo privado ou bloqueado para embed)
        if (dados.event === "onError") {
          const codigoErro = dados.info;
          console.warn("[YouTubeGlobalPlayer] Erro emitido pelo YouTube:", codigoErro);
          if (codigoErro === 101 || codigoErro === 150) {
            setTimeout(() => {
              if (usePlayerStore.getState().fila.length > 1) {
                usePlayerStore.getState().proxima();
              }
            }, 1500);
          }
        }
      } catch {
        // Ignora mensagens não-JSON
      }
    };

    window.addEventListener("message", tratarMensagem);
    return () => {
      window.removeEventListener("message", tratarMensagem);
    };
  }, []);

  // Se a faixa for trocada via fila, carrega o novo vídeo
  useEffect(() => {
    if (ehYouTube && videoIdAtual && videoIdAtual !== currentVideoIdRef.current) {
      carregarVideo(videoIdAtual, volume, 0);
    }
  }, [ehYouTube, videoIdAtual, volume, carregarVideo]);

  return (
    <div
      id="batcaverna-youtube-bg-engine"
      aria-hidden="true"
      className="fixed -bottom-96 -right-96 w-64 h-48 opacity-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -100 }}
    >
      <iframe
        ref={iframeRef}
        id="batcaverna-youtube-active-frame"
        title="BatCaverna YouTube Engine"
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    </div>
  );
}
