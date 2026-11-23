"use client";

import { useState } from "react";
import { MathText } from "@/components/MathText";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface TextoBaseCardProps {
  texto: string | null | undefined;
  titulo?: string;
  className?: string;
}

/**
 * Componente unificado para renderizar Texto Base de questões.
 *
 * Garante:
 * - Tipografia legível e confortável (text-[15px] sm:text-base) sem cansar a vista;
 * - Contraste aprimorado com text-bat-text/95 e entrelinha relaxada;
 * - Altura contida com rolagem suave em textos longos para não empurrar
 *   o enunciado e as alternativas da questão;
 * - Opção de expandir ou recolher a visão completa a qualquer momento.
 */
export function TextoBaseCard({
  texto,
  titulo = "Texto base",
  className = "",
}: TextoBaseCardProps) {
  const [expandido, setExpandido] = useState(false);

  if (!texto || !texto.trim()) return null;

  const textoLimpo = texto.trim();
  const linhasAproximadas = textoLimpo.split("\n").length;
  const ehLongo = textoLimpo.length > 320 || linhasAproximadas > 7;

  return (
    <div
      className={`mb-5 rounded-2xl border-l-4 border-bat-gold-400 border-y border-r border-bat-border/60 bg-bat-bg-secondary/45 p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-bat-border/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-bat-gold-400/15 text-bat-gold-400 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-bat-gold-400">
            {titulo}
          </span>
        </div>

        {ehLongo && (
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-1 text-[11px] font-medium text-bat-text-muted hover:text-bat-gold-400 transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-bat-bg-secondary"
            title={expandido ? "Encolher visão para caixa rolável" : "Expandir para ver o texto por inteiro"}
          >
            <span>{expandido ? "Encolher visão" : "Ver texto completo"}</span>
            {expandido ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      <div
        className={`whitespace-pre-line text-[15px] sm:text-base leading-relaxed text-bat-text/95 font-normal transition-all ${
          ehLongo && !expandido
            ? "max-h-72 sm:max-h-80 overflow-y-auto pr-2.5 [scrollbar-width:thin] [scrollbar-color:rgba(212,175,55,0.4)_transparent]"
            : ""
        }`}
      >
        <MathText>{textoLimpo}</MathText>
      </div>

      {ehLongo && !expandido && (
        <div className="mt-2.5 flex items-center justify-between border-t border-bat-border/20 pt-1.5 text-[11px] text-bat-text-muted">
          <span>📜 Role a caixa para ler o restante do texto</span>
          <button
            type="button"
            onClick={() => setExpandido(true)}
            className="text-bat-gold-400 hover:text-bat-gold-300 font-semibold cursor-pointer transition-colors"
          >
            Expandir tudo
          </button>
        </div>
      )}
    </div>
  );
}
