"use client";

import { useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [tentando, setTentando] = useState(false);

  const handleRetry = () => {
    setTentando(true);
    try {
      reset();
    } catch {}
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#07090e] p-6 text-center text-white font-sans">
        <div className="max-w-md rounded-2xl border border-yellow-500/30 bg-[#0d121f] p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/10 text-3xl border border-yellow-500/20">
            🦇
          </div>
          <h2 className="mb-2 text-xl font-bold">BatCaverna</h2>
          <p className="mb-6 text-sm text-neutral-400">
            Houve uma falha na transição da página. Clique abaixo para restabelecer a navegação.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRetry}
              disabled={tentando}
              className="flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-yellow-300 disabled:opacity-80"
            >
              <span className={tentando ? "animate-spin" : ""}>🔄</span>
              <span>{tentando ? "Recarregando..." : "Recarregar"}</span>
            </button>
            <button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-700"
            >
              Início
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

