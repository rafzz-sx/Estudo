"use client";

import { useEffect } from "react";

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.warn("[BatCaverna] Erro interceptado na raiz da aplicação:", error?.message);

    const isAbort =
      error?.name === "AbortError" ||
      error?.message?.toLowerCase().includes("abort") ||
      error?.message?.toLowerCase().includes("cancelled");

    if (isAbort) {
      const timer = setTimeout(() => {
        try {
          reset();
        } catch {}
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [error, reset]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-bat-gold-400/30 bg-bat-gold-400/10 shadow-[0_0_35px_rgba(234,179,8,0.18)]">
        <span className="text-3xl">🦇</span>
      </div>

      <h2 className="mb-2 text-xl font-black text-bat-text sm:text-2xl">
        Ops! Algo não carregou como esperado
      </h2>
      <p className="mb-6 max-w-md text-xs sm:text-sm text-bat-text-secondary leading-relaxed">
        Houve uma transição rápida de rota ou instabilidade de rede.
        Clique abaixo para restabelecer a tela normalmente.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            try {
              reset();
            } catch {
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 rounded-xl bg-bat-gold-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-black transition-all hover:bg-bat-gold-300 active:scale-95 shadow-md shadow-bat-gold-400/20"
        >
          <span>🔄</span>
          <span>Tentar Novamente</span>
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="rounded-xl border border-bat-border bg-bat-bg-elevated px-5 py-2.5 text-xs sm:text-sm font-semibold text-bat-text transition-all hover:border-bat-gold-400/40 hover:text-bat-gold-400 active:scale-95"
        >
          Ir para o Início
        </button>
      </div>
    </div>
  );
}
