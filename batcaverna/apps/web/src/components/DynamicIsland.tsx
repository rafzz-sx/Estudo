"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  usePlayerStore,
  formatarTempoMusica,
} from "@/stores/player-store";

/**
 * Dynamic Island do player.
 *
 * Acompanha o aluno por toda a plataforma e muda de cor conforme a capa da
 * música que está tocando — as cores não são fixas, são extraídas da arte de
 * cada faixa (com piso de contraste, ver abaixo).
 *
 * Três estados:
 *   • normal     capa, título e play/pause
 *   • expandido  controles completos e barra de progresso arrastável
 *   • recolhido  pastilha pequena; a música continua e a fila é preservada
 *
 * Posição: rodapé no celular, topo no desktop. No celular a ilha é fixa e não
 * empurra o conteúdo — no topo ela cobria o começo do enunciado justamente
 * quando o aluno rolava para cima para reler a questão.
 */

/**
 * Piso de contraste das cores extraídas da capa.
 *
 * O gradiente da ilha vem das duas cores dominantes da arte, e todo o texto
 * por cima é BRANCO. Numa capa clara — fundo bege, foto estourada, ilustração
 * pastel — a cor dominante saía clara e o resultado era branco sobre quase
 * branco: título, artista e tempo ficavam ilegíveis. Não havia nenhuma trava.
 *
 * O teto é de LUMINÂNCIA RELATIVA (WCAG), não de luminosidade HSL. A diferença
 * importa: amarelo e verde-oliva são percebidos como muito mais claros que
 * azul com o mesmo L do HSL. Travando por L, um oliva escuro passava com
 * 3,9:1 — abaixo do mínimo legível. Travando por luminância, todo matiz chega
 * ao mesmo contraste real.
 *
 *   contraste = (1,05) / (luminância + 0,05)
 *   para 4,5:1  ->  luminância <= 1,05/4,5 - 0,05 = 0,1833
 *
 * A identidade da capa é preservada: matiz e saturação ficam intactos, só a
 * luminosidade desce — e desce o mínimo necessário, por busca binária.
 */
/** Teto de luminância do fundo: garante 4,5:1 com texto branco. */
const LUZ_MAX_FUNDO = 0.18;
/** O destaque (borda e brilho) não recebe texto, então pode ser mais vivo. */
const LUZ_MAX_DESTAQUE = 0.45;

function rgbParaHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;

  return [h, s, l];
}

function hslParaRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const canal = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  return [
    Math.round(canal(h + 1 / 3) * 255),
    Math.round(canal(h) * 255),
    Math.round(canal(h - 1 / 3) * 255),
  ];
}

/** Luminância relativa da WCAG 2.1. */
function luminancia([r, g, b]: [number, number, number]): number {
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/**
 * Escurece a cor até caber no teto de luminância, mexendo SÓ na luminosidade.
 *
 * Busca binária porque a relação entre L do HSL e luminância não é linear e
 * muda com o matiz — não dá para calcular o L alvo direto. 24 passos levam a
 * precisão bem além do que 8 bits por canal conseguem representar.
 */
function comContraste(
  rgb: [number, number, number],
  tetoLuz: number
): [number, number, number] {
  if (luminancia(rgb) <= tetoLuz) return rgb;

  const [h, s, l] = rgbParaHsl(rgb[0], rgb[1], rgb[2]);

  let baixo = 0;
  let alto = l;
  let melhor: [number, number, number] = hslParaRgb(h, s, 0);

  for (let i = 0; i < 24; i++) {
    const meio = (baixo + alto) / 2;
    const tentativa = hslParaRgb(h, s, meio);
    if (luminancia(tentativa) <= tetoLuz) {
      melhor = tentativa;
      baixo = meio;
    } else {
      alto = meio;
    }
  }

  return melhor;
}

function hex([r, g, b]: [number, number, number]): string {
  return (
    "#" +
    [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")
  );
}

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

        const media = (c: { n: number; r: number; g: number; b: number }) =>
          [
            Math.round(c.r / c.n),
            Math.round(c.g / c.n),
            Math.round(c.b / c.n),
          ] as [number, number, number];

        resolve({
          primaria: hex(comContraste(media(ordenadas[0]), LUZ_MAX_DESTAQUE)),
          secundaria: hex(
            comContraste(media(ordenadas[1] ?? ordenadas[0]), LUZ_MAX_FUNDO)
          ),
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
  const minimizado = usePlayerStore((s) => s.minimizado);
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
  const alternarMinimizado = usePlayerStore((s) => s.alternarMinimizado);
  const definirCores = usePlayerStore((s) => s.definirCores);
  const fechar = usePlayerStore((s) => s.fechar);

  const musica = fila[indice];
  const capaProcessada = useRef<string | null>(null);
  const [arrastando, setArrastando] = useState<number | null>(null);

  // O `onMouseUp`/`onTouchEnd` ficava só no <input>. Quem arrastava e soltava
  // o dedo fora da barra — o normal num celular, a barra tem 4px de altura —
  // nunca disparava o evento: a posição congelava no valor arrastado e a
  // música seguia tocando em outro ponto. Ouvir no documento resolve, porque
  // o ponteiro sempre é solto em algum lugar.
  const soltar = useCallback(() => {
    setArrastando((v) => {
      if (v != null) irPara(v);
      return null;
    });
  }, [irPara]);

  useEffect(() => {
    if (arrastando == null) return;
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, [arrastando, soltar]);

  // Espaço e setas controlam o player de qualquer tela — desde que o aluno
  // não esteja digitando num campo (senão a barra de espaço pausaria a
  // música no meio de uma mensagem do chat).
  //
  // DUAS TRAVAS que faltavam, e as duas valiam para a plataforma inteira:
  //
  //   1. O atalho era registrado MESMO SEM MÚSICA. O `if (!musica) return
  //      null` fica depois dos efeitos, então o ouvinte existia em toda tela
  //      logada, tocando ou não. Com `preventDefault()` no Espaço, rolar a
  //      página com a barra de espaço — comportamento padrão do navegador —
  //      parava de funcionar em todo o site.
  //
  //   2. Espaço também ATIVA um botão em foco. Como <button> não é INPUT
  //      nem TEXTAREA, o atalho engolia a tecla: quem navega por teclado não
  //      conseguia marcar alternativa, entregar simulado nem abrir menu
  //      nenhum. São 151 botões na plataforma.
  useEffect(() => {
    if (!musica) return;

    const atalho = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (!alvo) return;

      // Campo de digitação: a tecla é do aluno, não do player.
      if (
        alvo.tagName === "INPUT" ||
        alvo.tagName === "TEXTAREA" ||
        alvo.tagName === "SELECT" ||
        alvo.isContentEditable
      ) {
        return;
      }

      // Elemento que o próprio navegador aciona com Espaço/Enter.
      if (alvo.closest("button, a, summary, [role='button'], [tabindex]")) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        alternarPlay();
      } else if (e.code === "ArrowRight" && e.shiftKey) {
        e.preventDefault();
        proxima();
      } else if (e.code === "ArrowLeft" && e.shiftKey) {
        e.preventDefault();
        anterior();
      }
    };

    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [musica, alternarPlay, proxima, anterior]);

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

  // ═══ PASTILHA RECOLHIDA ═══
  //
  // Antes só existiam dois estados: aberto ou FECHADO. Quem queria a tela
  // livre para ler um enunciado tinha de fechar o player — e perdia a fila
  // inteira, tendo de remontá-la depois. Agora recolhe para uma pastilha que
  // continua tocando e volta com um toque.
  if (minimizado) {
    return (
      <div className="fixed bottom-4 right-4 z-40 lg:bottom-auto lg:right-6 lg:top-4">
        <button
          onClick={alternarMinimizado}
          className="flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 shadow-2xl backdrop-blur-xl transition-transform hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${corPrimaria}33, ${corSecundaria}f5)`,
            borderColor: `${corPrimaria}55`,
          }}
          aria-label={`Reabrir o player — tocando ${musica.titulo}`}
          title={`${musica.titulo}${musica.artista ? ` — ${musica.artista}` : ""}`}
        >
          <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-black/30">
            {musica.capa_url ? (
              <img
                src={musica.capa_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-sm">
                🎵
              </span>
            )}
          </span>
          {/* O ▶/⏸ aqui é indicador de estado, não botão: a pastilha inteira
              reabre o player. Ter dois alvos de toque num alvo de 40px seria
              impossível de acertar no celular. */}
          <span className="text-xs font-bold text-white/90">
            {tocando ? "▶" : "⏸"}
          </span>
        </button>
      </div>
    );
  }

  return (
    // Posição:
    //   • No MOBILE fica no RODAPÉ. Antes era `top-[3.75rem]`, logo abaixo da
    //     topbar — e como a ilha é fixa e não empurra nada, ela cobria o
    //     começo do enunciado justamente quando o aluno rolava para cima para
    //     reler a questão. O rodapé está livre (não há barra de navegação
    //     inferior) e é onde todo player de música fica no celular.
    //   • No DESKTOP continua no topo: lá a navegação é a barra lateral e o
    //     conteúdo tem margem de sobra.
    <div
      className={`fixed bottom-4 left-1/2 z-40 -translate-x-1/2 transition-all duration-500 ease-out lg:bottom-auto lg:top-4 ${
        expandido ? "w-[min(94vw,26rem)]" : "w-[min(90vw,22rem)]"
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
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-base transition-transform hover:scale-105 active:scale-95 sm:h-9 sm:w-9 sm:text-sm"
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
                onPointerUp={soltar}
                onKeyUp={soltar}
                className="w-full cursor-pointer appearance-none rounded-full bg-white/15 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
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

              <Link
                href="/musica"
                onClick={() => definirExpandido(false)}
                className="cursor-pointer rounded-lg px-2 py-1 text-xs text-white/40 no-underline transition-colors hover:text-white"
                aria-label="Abrir a sala de música"
                title="Abrir a sala de música"
              >
                🎵
              </Link>

              {/* Recolher fica ANTES de fechar, e com rótulo que diz a
                  diferença: fechar apaga a fila, recolher não. Era essa a
                  escolha que faltava — antes, quem queria a tela livre só
                  tinha o ✕ e perdia tudo. */}
              <button
                onClick={alternarMinimizado}
                className="cursor-pointer rounded-lg px-2 py-1 text-xs text-white/40 transition-colors hover:text-white"
                aria-label="Recolher o player, sem perder a fila"
                title="Recolher (a música continua)"
              >
                ⌄
              </button>

              <button
                onClick={fechar}
                className="cursor-pointer rounded-lg px-2 py-1 text-xs text-white/40 transition-colors hover:text-white"
                aria-label="Fechar o player e limpar a fila"
                title="Fechar (perde a fila)"
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
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20 sm:h-8 sm:w-8 sm:text-xs"
      aria-label={rotulo}
    >
      {children}
    </button>
  );
}
