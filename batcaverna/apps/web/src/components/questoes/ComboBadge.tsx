"use client";

import {
  PATAMARES_COMBO,
  patamarDoCombo,
  type PatamarCombo,
} from "@batcaverna/utils";

/**
 * Patamares de combo.
 *
 * A lista vive em @batcaverna/utils e é a MESMA que o servidor usa em
 * lib/gamificacao.ts — antes eram duas cópias mantidas "iguais" na mão, e
 * uma terceira na tabela `combo_patamares` do banco. Passando de 10 acertos
 * seguidos o rótulo deixa de ser "COMBO" e vira INSANO x11; passando de 20,
 * BRUTA x21; e assim por diante.
 *
 * A tela precisa do rótulo antes da resposta do servidor chegar, para o
 * banner não piscar — por isso o cálculo continua acontecendo no cliente,
 * mas com a mesma tabela.
 */
export type Patamar = PatamarCombo;
export const PATAMARES = PATAMARES_COMBO;
export const patamarDe = patamarDoCombo;

/** Faixa larga exibida no topo da questão enquanto o combo está ativo. */
export function ComboBanner({
  combo,
  destaque = false,
}: {
  combo: number;
  destaque?: boolean;
}) {
  const patamar = patamarDe(combo);
  if (!patamar) return null;

  return (
    <div
      className={`mb-4 flex items-center justify-center gap-3 rounded-2xl border px-4 py-2.5 transition-all ${
        destaque ? "scale-[1.02] animate-pulse" : ""
      }`}
      style={{
        background: `${patamar.cor}18`,
        borderColor: `${patamar.cor}55`,
        boxShadow: `0 0 22px ${patamar.cor}33`,
      }}
      role="status"
      aria-live="polite"
    >
      <span className="text-xl">{patamar.emoji}</span>
      <span
        className="heading text-lg font-extrabold tracking-wide"
        style={{ color: patamar.cor }}
      >
        {patamar.rotulo} x{combo}
      </span>
      {destaque && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
          novo patamar
        </span>
      )}
    </div>
  );
}

/** Versão compacta, para a barra lateral de estatísticas. */
export function ComboCompacto({ combo }: { combo: number }) {
  const patamar = patamarDe(combo);

  if (!patamar) {
    return (
      <span
        className={combo > 0 ? "font-bold text-bat-success" : "text-bat-text-muted"}
      >
        {combo > 0 ? `x${combo}` : "—"}
      </span>
    );
  }

  return (
    <span className="font-extrabold" style={{ color: patamar.cor }}>
      {patamar.emoji} {patamar.rotulo} x{combo}
    </span>
  );
}
