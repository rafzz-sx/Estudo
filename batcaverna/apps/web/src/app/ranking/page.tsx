"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

type TabTipo = "tempo_estudo" | "questoes";
type PeriodoTipo = "semanal" | "mensal" | "geral";

export default function RankingPage() {
  const [tab, setTab] = useState<TabTipo>("tempo_estudo");
  const [periodo, setPeriodo] = useState<PeriodoTipo>("geral");
  const [visible, setVisible] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="mb-6">
        <h1 className="heading text-3xl text-bat-text mb-2">🏆 Ranking</h1>
        <p className="text-bat-text-secondary">Os guerreiros mais dedicados da Caverna.</p>
      </div>

      {/* ═══ ABAS: Tempo / Questões ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex bg-bat-bg-card border border-bat-border rounded-xl p-1">
          <button
            onClick={() => setTab("tempo_estudo")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              tab === "tempo_estudo" ? "bg-bat-gold-400 text-black shadow-[0_0_15px_rgba(245,197,24,0.35)]" : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            ⏱️ Tempo de Estudo
          </button>
          <button
            onClick={() => setTab("questoes")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              tab === "questoes" ? "bg-bat-gold-400 text-black shadow-[0_0_15px_rgba(245,197,24,0.35)]" : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            ❓ Questões
          </button>
        </div>

        {/* Filtro período */}
        <div className="flex gap-2">
          {(["semanal", "mensal", "geral"] as PeriodoTipo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                periodo === p
                  ? "bg-bat-gold-400/15 border-bat-gold-400/30 text-bat-gold-400"
                  : "bg-bat-bg-card border-bat-border text-bat-text-muted hover:text-bat-text"
              }`}
            >
              {p === "semanal" ? "Semanal" : p === "mensal" ? "Mensal" : "Geral"}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ ESTADO VAZIO: Sem dados de ranking ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-10 text-center">
        <div className="text-6xl mb-4">🦇</div>
        <h2 className="heading text-xl text-bat-text mb-2">O ranking está vazio por enquanto</h2>
        <p className="text-bat-text-secondary text-sm max-w-md mx-auto mb-6">
          Quando os soldados começarem a estudar, resolver questões e acumular tempo de estudo, 
          o ranking será preenchido automaticamente com dados reais.
        </p>
        <p className="text-bat-text-muted text-xs mb-6">
          Seja o primeiro a aparecer aqui! Comece uma sessão de estudo ou resolva questões.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/questoes"
            className="btn-primary inline-block py-2.5 px-5 text-sm no-underline"
          >
            Resolver questões
          </Link>
          <Link
            href="/concursos"
            className="inline-block py-2.5 px-5 text-sm no-underline bg-bat-bg-secondary border border-bat-border text-bat-text rounded-xl hover:border-bat-gold-400/40 transition-colors"
          >
            Ver concursos
          </Link>
        </div>
      </div>

      {/* ═══ SUA POSIÇÃO ═══ */}
      {user && (
        <div className="mt-4 bg-bat-gold-400/10 border border-bat-gold-400/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="heading text-xl font-bold text-bat-gold-400">—</span>
            <div className="w-9 h-9 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-sm font-bold">
              {user.apelido?.[0] || "?"}
            </div>
            <div>
              <p className="text-bat-text text-sm font-medium">{user.apelido} <span className="text-bat-text-muted text-xs">(você)</span></p>
              <p className="text-bat-text-muted text-xs">Nv. {user.nivel_atual || 1} · {user.nivel_atual >= 5 ? "Cabo de Operações" : "Recruta da Caverna"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-bat-text-muted text-sm">Sem dados ainda</p>
          </div>
        </div>
      )}
    </div>
  );
}
