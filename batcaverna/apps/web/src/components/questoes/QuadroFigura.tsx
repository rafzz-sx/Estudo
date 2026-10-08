"use client";

import { useState } from "react";
import { DiagramaQuestao } from "./DiagramaQuestao";
import { MathText } from "@/components/MathText";

/**
 * Quadro de Figuras e Gráficos da questão.
 *
 * Renderiza:
 * 1. SVGs oficiais quando cadastrados no banco;
 * 2. Diagramas técnicos e gráficos gerados dinamicamente (lançamento de vetores,
 *    colunas/barras, campos eletromagnéticos, geometria plana, tirinhas) a partir
 *    da descrição da figura;
 * 3. A descrição textual oficial formatada com KaTeX (MathText).
 */
export function QuadroFigura({
  descricao,
  svg,
  titulo = "Figura da questão",
}: {
  descricao?: string | null;
  svg?: string | null;
  titulo?: string;
}) {
  const [modo, setModo] = useState<"diagrama" | "texto">("diagrama");
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  if (!descricao && !svg) return null;

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      {/* Moldura do quadro com controles */}
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-bat-border bg-bat-bg-secondary px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">📐</span>
          <span className="text-xs font-bold uppercase tracking-wider text-bat-gold-400">
            {titulo}
          </span>
        </div>

        {/* Alternador de visualização se não tiver SVG pré-definido */}
        {!svg && descricao && (
          <div className="flex items-center gap-1 rounded-lg bg-neutral-900/60 p-1 border border-neutral-800">
            <button
              type="button"
              onClick={() => setModo("diagrama")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                modo === "diagrama"
                  ? "bg-bat-gold-400 text-black shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              📊 Gráfico / Diagrama
            </button>
            <button
              type="button"
              onClick={() => setModo("texto")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                modo === "texto"
                  ? "bg-bat-gold-400 text-black shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              📝 Descrição Textual
            </button>
          </div>
        )}
      </figcaption>

      <div className="p-4 sm:p-5">
        {svg ? (
          <div
            className="flex w-full justify-center [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : modo === "diagrama" && descricao ? (
          <div className="space-y-4">
            <DiagramaQuestao descricao={descricao} />

            {/* Expansor opcional para ver o texto exato da prova */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setMostrarDetalhes((prev) => !prev)}
                className="text-xs font-medium text-bat-text-muted hover:text-bat-gold-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{mostrarDetalhes ? "Ocultar" : "Ver"} transcrição do enunciado da imagem</span>
                <span className="text-[10px]">{mostrarDetalhes ? "▲" : "▼"}</span>
              </button>

              {mostrarDetalhes && (
                <div className="mt-3 rounded-xl border border-bat-border/60 bg-bat-bg-elevated/40 p-3.5 text-left text-xs leading-relaxed text-bat-text-secondary">
                  <MathText>{descricao}</MathText>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-bat-border bg-bat-bg-elevated/40 p-4 font-mono text-sm leading-relaxed text-bat-text-secondary">
            <MathText>{descricao}</MathText>
          </div>
        )}
      </div>
    </figure>
  );
}
