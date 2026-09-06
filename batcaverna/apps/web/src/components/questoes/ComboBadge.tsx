"use client";

/**
 * Patamares de combo.
 *
 * Espelha `combo_patamares` no banco e `PATAMARES_COMBO` em lib/gamificacao.
 * Passando de 10 acertos seguidos o rótulo deixa de ser "COMBO" e vira
 * INSANO x11; passando de 20, BRUTA x21; e assim por diante.
 *
 * Mantido em duplicata de propósito: a tela precisa do rótulo antes da
 * resposta do servidor chegar, para o banner não piscar.
 */
export interface Patamar {
  minimo: number;
  rotulo: string;
  cor: string;
  emoji: string;
}

export const PATAMARES: Patamar[] = [
  { minimo: 201, rotulo: "IMORTAL", cor: "#10B981", emoji: "☠️" },
  { minimo: 151, rotulo: "MORCEGO-REI", cor: "#F5C518", emoji: "👑" },
  { minimo: 101, rotulo: "DIVINO", cor: "#FFFFFF", emoji: "🦇" },
  { minimo: 76, rotulo: "SOBRENATURAL", cor: "#06B6D4", emoji: "🌌" },
  { minimo: 51, rotulo: "IMPARÁVEL", cor: "#EC4899", emoji: "🚀" },
  { minimo: 31, rotulo: "LENDÁRIO", cor: "#A855F7", emoji: "👑" },
  { minimo: 21, rotulo: "BRUTA", cor: "#EF4444", emoji: "💥" },
  { minimo: 11, rotulo: "INSANO", cor: "#F97316", emoji: "⚡" },
  { minimo: 5, rotulo: "EM CHAMAS", cor: "#F5C518", emoji: "🔥" },
  { minimo: 3, rotulo: "COMBO", cor: "#22C55E", emoji: "🔥" },
];

export function patamarDe(combo: number): Patamar | null {
  return PATAMARES.find((p) => combo >= p.minimo) ?? null;
}

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
