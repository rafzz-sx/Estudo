"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PrivadoErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log técnico discreto
    console.warn("[BatCaverna] Transição de rota interceptada pelo ErrorBoundary:", error?.message);

    // Se o erro foi cancelamento de requisição (troca rápida de página / AbortError),
    // tenta recuperação suave e instantânea.
    const isAbort =
      error?.name === "AbortError" ||
      error?.message?.toLowerCase().includes("abort") ||
      error?.message?.toLowerCase().includes("cancelled") ||
      error?.message?.toLowerCase().includes("fetch");

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
    <div className="flex min-h-[65vh] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-bat-gold-400/30 bg-bat-gold-400/10 shadow-[0_0_35px_rgba(234,179,8,0.18)]">
        <span className="text-3xl">⚡</span>
      </div>

      <h2 className="mb-2 text-xl font-black text-bat-text sm:text-2xl">
        Transição de Tela Interrompida
      </h2>
      <p className="mb-6 max-w-md text-xs sm:text-sm text-bat-text-secondary leading-relaxed">
        Você trocou de tela muito rápido ou a conexão oscilou brevemente.
        Seus dados e progresso estão 100% seguros na BatCaverna.
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
          Ir para o Painel
        </button>
      </div>
    </div>
  );
}
