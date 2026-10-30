"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  usePlayerStore,
  extrairVideoIdYouTube,
  registrarControladorYouTube,
  type ControladorYouTubeBridge,
  formatarTempoMusica,
} from "@/stores/player-store";

/**
 * YouTubeGlobalPlayer — Motor definitivo e ininterrupto para reprodução de faixas do YouTube.
 *
 * Características críticas de engenharia:
 * 1. Vive no AppShell (fora da árvore de páginas), garantindo que a música continue tocando
 *    sem recarregar quando o aluno navega entre Simulado, Questões, Ranking, etc.
 * 2. Mantém o <iframe> nativo sempre montado com dimensões válidas (>= 200px) e visibilidade real,
 *    evitando bloqueios de autoplay e throttling anti-fraude do Chromium/Safari/WebView.
 * 3. Ponte bidirecional via HTML5 postMessage (independe de scripts externos pesados como iframe_api).
 * 4. Mini-player flutuante Picture-in-Picture estilo BatCaverna com botões de controle,
 *    minimizar e alternar vídeo.
 */
export function YouTubeGlobalPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const intervalSyncRef = useRef<any>(null);

  const fila = usePlayerStore((s) => s.fila);
  const indice = usePlayerStore((s) => s.indice);
  const tocando = usePlayerStore((s) => s.tocando);
  const volume = usePlayerStore((s) => s.volume);
  const videoVisivel = usePlayerStore((s) => s.videoVisivel);
  const posicao = usePlayerStore((s) => s.posicao);
  const duracao = usePlayerStore((s) => s.duracao);

  const alternarPlay = usePlayerStore((s) => s.alternarPlay);
  const proxima = usePlayerStore((s) => s.proxima);
  const anterior = usePlayerStore((s) => s.anterior);
  const alternarVideoVisivel = usePlayerStore((s) => s.alternarVideoVisivel);

  const [minizado, setMinimizado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [origemAtual, setOrigemAtual] = useState<string>("");

  const musicaAtual = fila[indice];
  const videoIdAtual = musicaAtual
    ? musicaAtual.fonte === "youtube" && musicaAtual.fonte_id
      ? musicaAtual.fonte_id
      : extrairVideoIdYouTube(musicaAtual.fonte_id || musicaAtual.audio_url)
    : null;

  const ehYouTube = Boolean(videoIdAtual);

  // Define origem do host para postMessage seguro
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigemAtual(window.location.origin);
    }
  }, []);

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
      setAviso(null);

      if (!iframeRef.current) return;

      const originParam = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : "";
      const novoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&playsinline=1&controls=1&rel=0&start=${Math.floor(
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

      // Envia comando após o iframe carregar
      const onIframeLoad = () => {
        postYT("unMute");
        postYT("setVolume", [Math.round(vol * 100)]);
        postYT("playVideo");
      };

      iframeRef.current.onload = onIframeLoad;
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

  /** Sincronização e escuta de eventos vindos do iframe do YouTube */
  useEffect(() => {
    const tratarMensagem = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;

      try {
        const dados = JSON.parse(event.data);

        // Atualização contínua de tempo e duração
        if (dados.event === "infoDelivery" && dados.info) {
          const { currentTime, duration, playerState } = dados.info;

          if (typeof currentTime === "number" && typeof duration === "number") {
            usePlayerStore.getState()._sincronizar(currentTime, duration);
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

        // Tratamento de erros do player
        if (dados.event === "onError") {
          const codigoErro = dados.info;
          console.warn("[YouTubeGlobalPlayer] Erro emitido pelo YouTube:", codigoErro);
          if (codigoErro === 101 || codigoErro === 150) {
            setAviso("⚠️ Este vídeo possui restrição de reprodução externa imposta pelo canal.");
            setTimeout(() => {
              if (usePlayerStore.getState().fila.length > 1) {
                usePlayerStore.getState().proxima();
              }
            }, 3000);
          }
        }
      } catch {
        // Ignora mensagens que não sejam JSON do YouTube
      }
    };

    window.addEventListener("message", tratarMensagem);
    return () => {
      window.removeEventListener("message", tratarMensagem);
    };
  }, []);

  /** Polling leve para sincronizar o progresso do scrubber quando tocando */
  useEffect(() => {
    if (tocando && ehYouTube) {
      if (!intervalSyncRef.current) {
        intervalSyncRef.current = setInterval(() => {
          postYT("listening");
        }, 1000);
      }
    } else {
      if (intervalSyncRef.current) {
        clearInterval(intervalSyncRef.current);
        intervalSyncRef.current = null;
      }
    }

    return () => {
      if (intervalSyncRef.current) {
        clearInterval(intervalSyncRef.current);
        intervalSyncRef.current = null;
      }
    };
  }, [tocando, ehYouTube, postYT]);

  // Se a faixa atual for trocada via fila, atualiza
  useEffect(() => {
    if (ehYouTube && videoIdAtual && videoIdAtual !== currentVideoIdRef.current) {
      carregarVideo(videoIdAtual, volume, 0);
    }
  }, [ehYouTube, videoIdAtual, volume, carregarVideo]);

  const progressoPct = duracao > 0 ? (posicao / duracao) * 100 : 0;

  return (
    <>
      {/* 
        Container do Iframe: Sempre presente no DOM para evitar remontagem.
        Quando não há YouTube tocando ou vídeo visível desativado, fica posicionado 
        como um elemento invisível porém com tamanho suficiente para evitar penalização do navegador.
      */}
      <div
        id="batcaverna-youtube-engine-wrapper"
        className={`transition-all duration-300 ${
          ehYouTube && videoVisivel
            ? "fixed bottom-20 sm:bottom-5 right-3 sm:right-6 z-40"
            : "fixed -bottom-96 -right-96 z-0 pointer-events-none opacity-0"
        }`}
        style={{
          width: ehYouTube && videoVisivel ? (minizado ? "260px" : "320px") : "220px",
        }}
      >
        <div className="overflow-hidden rounded-2xl border border-bat-gold-400/40 bg-bat-bg-card/95 shadow-2xl backdrop-blur-xl">
          {/* Barra de Título do Mini Player */}
          <div className="flex items-center justify-between border-b border-bat-border/60 bg-bat-bg-secondary/80 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              <span className="font-bold text-bat-text truncate text-[11px]">
                {musicaAtual?.titulo || "YouTube Player"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setMinimizado(!minizado)}
                className="cursor-pointer rounded p-1 text-bat-text-muted hover:bg-bat-bg-elevated hover:text-white transition-colors"
                title={minizado ? "Expandir vídeo" : "Minimizar"}
              >
                {minizado ? "▢" : "—"}
              </button>
              <button
                onClick={alternarVideoVisivel}
                className="cursor-pointer rounded p-1 text-bat-text-muted hover:bg-bat-bg-elevated hover:text-red-400 transition-colors"
                title="Ocultar janela de vídeo (áudio continua tocando)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Player de Vídeo Nativo */}
          <div
            className={`relative bg-black transition-all ${
              minizado ? "h-28" : "h-44 sm:h-48"
            } w-full`}
          >
            <iframe
              ref={iframeRef}
              id="batcaverna-youtube-active-frame"
              title="BatCaverna YouTube Player"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Controles Compactos do Mini-Player */}
          <div className="p-2.5 bg-bat-bg-card border-t border-bat-border/60">
            {aviso && (
              <p className="mb-2 text-[10px] font-bold text-bat-gold-400 bg-bat-gold-400/10 p-1.5 rounded-lg border border-bat-gold-400/20">
                {aviso}
              </p>
            )}

            {/* Linha de progresso sutil */}
            <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-bat-border/60">
              <div
                className="h-full bg-bat-gold-400 transition-all duration-300"
                style={{ width: `${progressoPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <p className="truncate font-bold text-bat-text text-[11px]">
                  {musicaAtual?.artista || "BatCaverna Squad"}
                </p>
                <p className="text-[10px] text-bat-text-muted">
                  {formatarTempoMusica(posicao)} / {formatarTempoMusica(duracao)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={anterior}
                  className="cursor-pointer rounded-lg p-1.5 text-bat-text-secondary hover:bg-bat-bg-secondary hover:text-white"
                  title="Anterior"
                >
                  ⏮
                </button>
                <button
                  onClick={alternarPlay}
                  className="cursor-pointer rounded-lg bg-bat-gold-400/20 px-2.5 py-1 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400/30 border border-bat-gold-400/40"
                  title={tocando ? "Pausar" : "Tocar"}
                >
                  {tocando ? "⏸" : "▶"}
                </button>
                <button
                  onClick={proxima}
                  className="cursor-pointer rounded-lg p-1.5 text-bat-text-secondary hover:bg-bat-bg-secondary hover:text-white"
                  title="Próxima"
                >
                  ⏭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

