"use client";

import { useState, useEffect } from "react";

// ─── Dados mock do ranking ───────────────────────────────────
const mockRankingTempo = [
  { posicao: 1, apelido: "SombraNoturna", avatar: null, nivel: 14, titulo: "Cavaleiro de Gotham", valor: 360000, percentual_acerto: 89.2 },
  { posicao: 2, apelido: "GuerreiroDark", avatar: null, nivel: 12, titulo: "Protetor Noturno", valor: 324000, percentual_acerto: 85.1 },
  { posicao: 3, apelido: "BatStudy", avatar: null, nivel: 11, titulo: "O Implacável", valor: 288000, percentual_acerto: 82.7 },
  { posicao: 4, apelido: "FocoTotal", avatar: null, nivel: 10, titulo: "Lenda em Ascensão", valor: 252000, percentual_acerto: 78.5 },
  { posicao: 5, apelido: "MenteAfiada", avatar: null, nivel: 9, titulo: "Guardião da Caverna", valor: 216000, percentual_acerto: 76.3 },
  { posicao: 6, apelido: "CaveStudies", avatar: null, nivel: 8, titulo: "Caçador de Questões", valor: 180000, percentual_acerto: 74.1 },
  { posicao: 7, apelido: "EstudanteX", avatar: null, nivel: 7, titulo: "Sombra de Gotham", valor: 144000, percentual_acerto: 71.9 },
  { posicao: 8, apelido: "NightOwl", avatar: null, nivel: 6, titulo: "Estrategista Sombrio", valor: 108000, percentual_acerto: 69.5 },
  { posicao: 9, apelido: "DarkBrain", avatar: null, nivel: 5, titulo: "Predador da Noite", valor: 72000, percentual_acerto: 67.2 },
  { posicao: 10, apelido: "CavernaStudy", avatar: null, nivel: 4, titulo: "Rastreador de Pistas", valor: 36000, percentual_acerto: 65.0 },
];

const mockMinhaPos = { posicao: 42, apelido: "Soldado", nivel: 3, titulo: "Vigia Noturno", valor: 108000, percentual_acerto: 72.3 };

function formatarTempo(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  if (h >= 24) { const d = Math.floor(h / 24); const hr = h % 24; return hr > 0 ? `${d}d ${hr}h` : `${d}d`; }
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function getMedalha(pos: number): string {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return `${pos}`;
}

function getMedalhaGlow(pos: number): string {
  if (pos === 1) return "shadow-[0_0_20px_rgba(255,215,0,0.4)] border-bat-gold/40";
  if (pos === 2) return "shadow-[0_0_20px_rgba(192,192,192,0.3)] border-bat-silver/40";
  if (pos === 3) return "shadow-[0_0_20px_rgba(205,127,50,0.3)] border-bat-bronze/40";
  return "";
}

type TabTipo = "tempo_estudo" | "questoes";
type PeriodoTipo = "semanal" | "mensal" | "geral";

export default function RankingPage() {
  const [tab, setTab] = useState<TabTipo>("tempo_estudo");
  const [periodo, setPeriodo] = useState<PeriodoTipo>("geral");
  const [visible, setVisible] = useState(false);
  const [showMiniPerfil, setShowMiniPerfil] = useState<number | null>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const ranking = mockRankingTempo;

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
              tab === "tempo_estudo" ? "bg-bat-purple-500 text-white glow-purple" : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            ⏱️ Tempo de Estudo
          </button>
          <button
            onClick={() => setTab("questoes")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              tab === "questoes" ? "bg-bat-purple-500 text-white glow-purple" : "text-bat-text-muted hover:text-bat-text"
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
                  ? "bg-bat-purple-500/15 border-bat-purple-500/30 text-bat-purple-300"
                  : "bg-bat-bg-card border-bat-border text-bat-text-muted hover:text-bat-text"
              }`}
            >
              {p === "semanal" ? "Semanal" : p === "mensal" ? "Mensal" : "Geral"}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TOP 3 (Cards destacados) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {ranking.slice(0, 3).map((r) => (
          <div
            key={r.posicao}
            className={`relative bg-bat-bg-card border rounded-2xl p-5 text-center transition-all duration-300 cursor-pointer hover:scale-[1.02] ${getMedalhaGlow(r.posicao)}`}
            onClick={() => setShowMiniPerfil(showMiniPerfil === r.posicao ? null : r.posicao)}
          >
            <span className="text-4xl mb-2 block">{getMedalha(r.posicao)}</span>
            <div className="w-14 h-14 rounded-full bg-bat-purple-500/20 border-2 border-bat-purple-500/30 flex items-center justify-center text-bat-purple-300 text-xl font-bold mx-auto mb-2">
              {r.apelido[0]}
            </div>
            <p className="heading text-bat-text font-bold">{r.apelido}</p>
            <p className="text-bat-text-muted text-xs mt-0.5">Nv. {r.nivel} · {r.titulo}</p>
            <p className="heading text-bat-purple-400 text-lg font-bold mt-2">
              {tab === "tempo_estudo" ? formatarTempo(r.valor) : `${r.valor} questões`}
            </p>
            <p className="text-bat-text-muted text-xs">{r.percentual_acerto}% acerto</p>
          </div>
        ))}
      </div>

      {/* ═══ TABELA DO RANKING (posições 4-10+) ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bat-border text-bat-text-muted text-xs uppercase">
              <th className="px-4 py-3 text-left w-12">#</th>
              <th className="px-4 py-3 text-left">Jogador</th>
              <th className="px-4 py-3 text-right">Nível</th>
              <th className="px-4 py-3 text-right">{tab === "tempo_estudo" ? "Tempo" : "Questões"}</th>
              <th className="px-4 py-3 text-right hidden sm:table-cell">Acerto</th>
            </tr>
          </thead>
          <tbody>
            {ranking.slice(3).map((r) => (
              <tr
                key={r.posicao}
                className="border-b border-bat-border/50 hover:bg-bat-bg-elevated/50 transition-colors cursor-pointer"
                onClick={() => setShowMiniPerfil(showMiniPerfil === r.posicao ? null : r.posicao)}
              >
                <td className="px-4 py-3 text-bat-text-secondary text-sm font-bold">{r.posicao}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-bat-purple-500/15 border border-bat-purple-500/20 flex items-center justify-center text-bat-purple-300 text-xs font-bold">
                      {r.apelido[0]}
                    </div>
                    <div>
                      <p className="text-bat-text text-sm font-medium">{r.apelido}</p>
                      <p className="text-bat-text-muted text-xs">{r.titulo}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-bat-text-secondary text-sm">{r.nivel}</td>
                <td className="px-4 py-3 text-right heading text-bat-purple-400 text-sm font-bold">
                  {tab === "tempo_estudo" ? formatarTempo(r.valor) : r.valor}
                </td>
                <td className="px-4 py-3 text-right text-bat-text-secondary text-sm hidden sm:table-cell">
                  {r.percentual_acerto}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ SUA POSIÇÃO (fixo no rodapé) ═══ */}
      <div className="mt-4 bg-bat-purple-500/10 border border-bat-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="heading text-bat-gold-400 text-lg font-bold">#{mockMinhaPos.posicao}</span>
          <div className="w-9 h-9 rounded-full bg-bat-purple-500/20 border border-bat-purple-500/30 flex items-center justify-center text-bat-purple-300 text-sm font-bold">
            {mockMinhaPos.apelido[0]}
          </div>
          <div>
            <p className="text-bat-text text-sm font-medium">{mockMinhaPos.apelido} <span className="text-bat-text-muted text-xs">(você)</span></p>
            <p className="text-bat-text-muted text-xs">Nv. {mockMinhaPos.nivel} · {mockMinhaPos.titulo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="heading text-bat-purple-400 font-bold">
            {tab === "tempo_estudo" ? formatarTempo(mockMinhaPos.valor) : `${mockMinhaPos.valor} questões`}
          </p>
          <p className="text-bat-text-muted text-xs">{mockMinhaPos.percentual_acerto}% acerto</p>
        </div>
      </div>
    </div>
  );
}
