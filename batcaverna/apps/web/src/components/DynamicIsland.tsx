"use client";

import { useEffect, useRef, useState } from "react";
import {
  usePlayerStore,
  formatarTempoMusica,
} from "@/stores/player-store";

/**
 * Dynamic Island do player.
 *
 * Fica fixo no topo, acompanha o aluno por toda a plataforma e muda de cor
 * conforme a capa da música que está tocando — as cores não são fixas, são
 * extraídas da arte de cada faixa.
 *
 * Recolhido: capa, título e play/pause.
 * Expandido: controles completos e barra de progresso arrastável.
 */

/** Extrai as duas cores dominantes da capa, para o gradiente do widget. */
function extrairCores(
  url: string
): Promise<{ primaria: string; secundaria: string } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const tamanho = 32; // amostra pequena basta e é rápida
        canvas.width = tamanho;
        canvas.height = tamanho;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, tamanho, tamanho);
        const { data } = ctx.getImageData(0, 0, tamanho, tamanho);

        // Agrupa em blocos de cor para achar as duas famílias dominantes.
        const contagem = new Map<string, { n: number; r: number; g: number; b: number }>();

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue; // ignora transparência

          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Descarta quase-preto e quase-branco: não geram gradiente legível.
          const luz = (r + g + b) / 3;
          if (luz < 25 || luz > 235) continue;

          const chave = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const atual = contagem.get(chave) ?? { n: 0, r: 0, g: 0, b: 0 };
          contagem.set(chave, {
            n: atual.n + 1,
            r: atual.r + r,
            g: atual.g + g,
            b: atual.b + b,
          });
        }

        const ordenadas = [...contagem.values()].sort((a, b) => b.n - a.n);
        if (!ordenadas.length) return resolve(null);

        const hex = (c: { n: number; r: number; g: number; b: number }) =>
          "#" +
          [c.r, c.g, c.b]
            .map((v) =>
              Math.round(v / c.n)
                .toString(16)
                .padStart(2, "0")
            )
            .join("");

        resolve({
          primaria: hex(ordenadas[0]),
          secundaria: hex(ordenadas[1] ?? ordenadas[0]),
        });
      } catch {
        // Capa de outro domínio sem CORS "suja" o canvas e bloqueia a leitura.
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function DynamicIsland() {
  const fila = usePlayerStore((s) => s.fila);
  const indice = usePlayerStore((s) => s.indice);
  const tocando = usePlayerStore((s) => s.tocando);
  const posicao = usePlayerStore((s) => s.posicao);
  const duracao = usePlayerStore((s) => s.duracao);
  const volume = usePlayerStore((s) => s.volume);
  const aleatorio = usePlayerStore((s) => s.aleatorio);
  const repetir = usePlayerStore((s) => s.repetir);
  const expandido = usePlayerStore((s) => s.expandido);
  const corPrimaria = usePlayerStore((s) => s.corPrimaria);
  const corSecundaria = usePlayerStore((s) => s.corSecundaria);

  const alternarPlay = usePlayerStore((s) => s.alternarPlay);
  const proxima = usePlayerStore((s) => s.proxima);
  const anterior = usePlayerStore((s) => s.anterior);
  const irPara = usePlayerStore((s) => s.irPara);
  const definirVolume = usePlayerStore((s) => s.definirVolume);
  const alternarAleatorio = usePlayerStore((s) => s.alternarAleatorio);
  const alternarRepetir = usePlayerStore((s) => s.alternarRepetir);
  const definirExpandido = usePlayerStore((s) => s.definirExpandido);
  const definirCores = usePlayerStore((s) => s.definirCores);
  const fechar = usePlayerStore((s) => s.fechar);

  const musica = fila[indice];
  const capaProcessada = useRef<string | null>(null);
  const [arrastando, setArrastando] = useState<number | null>(null);

  // Recalcula as cores sempre que a capa muda.
  useEffect(() => {
    if (!musica?.capa_url || capaProcessada.current === musica.capa_url) return;
    capaProcessada.current = musica.capa_url;

    extrairCores(musica.capa_url).then((cores) => {
      if (cores) definirCores(cores.primaria, cores.secundaria);
    });
  }, [musica?.capa_url, definirCores]);

  if (!musica) return null;

  const progresso = duracao > 0 ? ((arrastando ?? posicao) / duracao) * 100 : 0;

  return (
    // No mobile a AppShell tem uma topbar fixa de ~56px: o player desce para
    // baixo dela. No desktop a navegação é a sidebar lateral, então ele pode
    // ficar colado no topo.
    <div
      className={`fixed left-1/2 top-[3.75rem] z-40 -translate-x-1/2 transition-all duration-500 ease-out lg:top-4 ${
        expandido ? "w-[min(92vw,26rem)]" : "w-[min(88vw,22rem)]"
      }`}
    >
      <div
        className="overflow-hidden rounded-[1.75rem] border shadow-2xl backdrop-blur-xl transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${corPrimaria}26, ${corSecundaria}f2 55%, ${corSecundaria}fa)`,
          borderColor: `${corPrimaria}44`,
          boxShadow: `0 8px 32px ${corPrimaria}30, 0 2px 8px rgba(0,0,0,0.5)`,
        }}
      >
        {/* ═══ BARRA RECOLHIDA ═══ */}
        <div className="flex items-center gap-3 px-3 py-2">
          <button
            onClick={() => definirExpandido(!expandido)}
            className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-black/30"
            aria-label={expandido ? "Recolher player" : "Expandir player"}
          >
            {musica.capa_url ? (
              <img
                src={musica.capa_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg">
                🎵
              </span>
            )}
          </button>

          <button
            onClick={() => definirExpandido(!expandido)}
            className="min-w-0 flex-1 cursor-pointer text-left"
          >
            <p className="truncate text-xs font-bold text-white">
              {musica.titulo}
            </p>
            <p className="truncate text-[11px] text-white/60">
              {musica.artista ?? "Desconhecido"}
            </p>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <Botao onClick={anterior} rotulo="Faixa anterior">
              ⏮
            </Botao>
            <button
              onClick={alternarPlay}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm transition-transform hover:scale-105"
              style={{ background: corPrimaria, color: "#0B0B0F" }}
              aria-label={tocando ? "Pausar" : "Tocar"}
            >
              {tocando ? "⏸" : "▶"}
            </button>
            <Botao onClick={proxima} rotulo="Próxima faixa">
              ⏭
            </Botao>
          </div>
        </div>

        {/* Progresso fino quando recolhido */}
        {!expandido && (
          <div className="h-0.5 w-full bg-white/10">
            <div
              className="h-full transition-all"
              style={{ width: `${progresso}%`, background: corPrimaria }}
            />
          </div>
        )}

        {/* ═══ PAINEL EXPANDIDO ═══ */}
        {expandido && (
          <div className="px-4 pb-4">
            {/* Barra de progresso arrastável */}
            <div className="mb-1 mt-1">
              <input
                type="range"
                min={0}
                max={Math.max(duracao, 1)}
                step={0.5}
                value={arrastando ?? posicao}
                onChange={(e) => setArrastando(Number(e.target.value))}
                onMouseUp={() => {
                  if (arrastando != null) irPara(arrastando);
                  setArrastando(null);
                }}
                onTouchEnd={() => {
                  if (arrastando != null) irPara(arrastando);
                  setArrastando(null);
                }}
                className="w-full cursor-pointer appearance-none rounded-full bg-white/15 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full"
                style={{
                  height: 4,
                  accentColor: corPrimaria,
                }}
                aria-label="Posição da música"
              />
              <div className="mt-1 flex justify-between text-[10px] text-white/50">
                <span>{formatarTempoMusica(arrastando ?? posicao)}</span>
                <span>{formatarTempoMusica(duracao)}</span>
              </div>
            </div>

            {/* Controles secundários */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={alternarAleatorio}
                className={`cursor-pointer rounded-lg px-2 py-1 text-xs transition-colors ${
                  aleatorio ? "text-white" : "text-white/40"
                }`}
                style={aleatorio ? { background: `${corPrimaria}33` } : undefined}
                aria-label="Modo aleatório"
                title="Aleatório"
              >
                🔀
              </button>

              <button
                onClick={alternarRepetir}
                className={`cursor-pointer rounded-lg px-2 py-1 text-xs transition-colors ${
                  repetir !== "nao" ? "text-white" : "text-white/40"
                }`}
                style={
                  repetir !== "nao" ? { background: `${corPrimaria}33` } : undefined
                }
                aria-label="Modo de repetição"
                title={
                  repetir === "uma"
                    ? "Repetir a faixa atual"
                    : repetir === "todas"
                    ? "Repetir a fila"
                    : "Sem repetição"
                }
              >
                {repetir === "uma" ? "🔂" : "🔁"}
              </button>

              <div className="flex flex-1 items-center gap-2 px-2">
                <span className="text-xs text-white/40">🔈</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => definirVolume(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ height: 3, accentColor: corPrimaria }}
                  aria-label="Volume"
                />
              </div>

              <span className="text-[10px] text-white/40">
                {indice + 1}/{fila.length}
              </span>

              <button
                onClick={fechar}
                className="cursor-pointer rounded-lg px-2 py-1 text-xs text-white/40 transition-colors hover:text-white"
                aria-label="Fechar player"
                title="Fechar player"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Botao({
  onClick,
  children,
  rotulo,
}: {
  onClick: () => void;
  children: React.ReactNode;
  rotulo: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      aria-label={rotulo}
    >
      {children}
    </button>
  );
}
