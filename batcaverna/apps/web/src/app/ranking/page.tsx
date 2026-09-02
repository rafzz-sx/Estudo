"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { MiniPerfilModal } from "@/components/MiniPerfilModal";

type TabTipo = "tempo_estudo" | "questoes";
type PeriodoTipo = "semanal" | "mensal" | "geral";

interface RankingItem {
  posicao: number;
  user_id: string;
  apelido: string;
  avatar_url: string | null;
  nivel_atual: number;
  titulo_nivel: string;
  valor: number;
  percentual_acerto: number;
}

const CONCURSOS_OPCOES = [
  { valor: "todos", label: "Todos os Concursos" },
  { valor: "EEAR", label: "✈️ EEAR" },
  { valor: "ESA", label: "⭐ ESA" },
  { valor: "EAM", label: "⚓ EAM" },
  { valor: "CN", label: "🚢 CN" },
  { valor: "EPCAR", label: "🛩️ EPCAR" },
  { valor: "ESPCEX", label: "🎖️ EsPCEx" },
  { valor: "EFOMM", label: "🌊 EFOMM" },
  { valor: "IME", label: "🔬 IME" },
  { valor: "ENEM", label: "📚 ENEM" },
];

function formatarTempo(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const hr = h % 24;
    return hr > 0 ? `${d}d ${hr}h` : `${d}d`;
  }
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m}min`;
}

function getMedalha(pos: number): string {
  if (pos === 1) return "🥇";
  if (pos === 2) return "🥈";
  if (pos === 3) return "🥉";
  return `#${pos}`;
}

export default function RankingPage() {
  const [tab, setTab] = useState<TabTipo>("tempo_estudo");
  const [periodo, setPeriodo] = useState<PeriodoTipo>("geral");
  const [concursoFiltro, setConcursoFiltro] = useState("todos");
  const [visible, setVisible] = useState(false);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalUserId, setModalUserId] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  const carregarRanking = async () => {
    setLoading(true);
    try {
      const url = `/api/ranking?tipo=${tab}&periodo=${periodo}${
        concursoFiltro !== "todos" ? `&concurso=${concursoFiltro}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.ranking)) {
          setRanking(json.data.ranking);
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar ranking:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    carregarRanking();
  }, [tab, periodo, concursoFiltro]);

  // Verificar posição do usuário logado
  const minhaPosicao = ranking.find((r) => r.user_id === user?.id);

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ MODAL MINI PERFIL ═══ */}
      {modalUserId && (
        <MiniPerfilModal
          userId={modalUserId}
          onClose={() => setModalUserId(null)}
        />
      )}

      {/* ═══ CABEÇALHO ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="heading text-3xl text-bat-text mb-2">🏆 Ranking da BatCaverna</h1>
          <p className="text-bat-text-secondary">
            Os melhores soldados da caverna classificados por dedicação e precisão tática.
          </p>
        </div>

        {/* Link para configurações de privacidade */}
        <Link
          href="/perfil"
          className="text-xs text-bat-text-muted hover:text-bat-gold-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto bg-bat-bg-card border border-bat-border px-3 py-2 rounded-xl"
        >
          <span>⚙️</span>
          <span>Privacidade no Ranking</span>
        </Link>
      </div>

      {/* ═══ FILTROS E ABAS ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        {/* Abas: Tempo de Estudo / Questões */}
        <div className="flex bg-bat-bg-card border border-bat-border rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("tempo_estudo")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === "tempo_estudo"
                ? "bg-bat-gold-400 text-black shadow-[0_0_15px_rgba(245,197,24,0.35)]"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            ⏱️ Tempo de Estudo Real
          </button>
          <button
            onClick={() => setTab("questoes")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === "questoes"
                ? "bg-bat-gold-400 text-black shadow-[0_0_15px_rgba(245,197,24,0.35)]"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            ❓ Questões & Precisão
          </button>
        </div>

        {/* Filtros de Concurso e Período */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Concurso */}
          <select
            value={concursoFiltro}
            onChange={(e) => setConcursoFiltro(e.target.value)}
            className="bg-bat-bg-card border border-bat-border text-bat-text text-xs rounded-xl px-3 py-2 focus:border-bat-gold-400 focus:outline-none cursor-pointer"
          >
            {CONCURSOS_OPCOES.map((c) => (
              <option key={c.valor} value={c.valor} className="bg-bat-bg-card text-bat-text">
                {c.label}
              </option>
            ))}
          </select>

          {/* Período */}
          <div className="flex gap-1 bg-bat-bg-card border border-bat-border rounded-xl p-1">
            {(["semanal", "mensal", "geral"] as PeriodoTipo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  periodo === p
                    ? "bg-bat-gold-400/20 text-bat-gold-400 font-bold border border-bat-gold-400/30"
                    : "text-bat-text-muted hover:text-bat-text border border-transparent"
                }`}
              >
                {p === "semanal" ? "Semanal" : p === "mensal" ? "Mensal" : "Geral"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CONTEÚDO DO RANKING ═══ */}
      {loading ? (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-12 text-center">
          <span className="text-4xl block mb-2 animate-pulse">🦇</span>
          <p className="text-bat-text-muted text-sm">Carregando classificação dos soldados...</p>
        </div>
      ) : ranking.length === 0 ? (
        /* Estado Vazio */
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-10 text-center">
          <div className="text-6xl mb-4">🦇</div>
          <h2 className="heading text-xl text-bat-text mb-2">O ranking está pronto para ser conquistado</h2>
          <p className="text-bat-text-secondary text-sm max-w-md mx-auto mb-6">
            O tempo de estudo registrado enquanto você resolve trilhas de concurso pontuará diretamente aqui.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/concursos"
              className="btn-primary inline-block py-2.5 px-6 text-sm no-underline"
            >
              Iniciar Trilha de Concurso ⚡
            </Link>
          </div>
        </div>
      ) : (
        /* Tabela e Top 3 */
        <div className="space-y-6">
          {/* Top 3 Pódium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ranking.slice(0, 3).map((r) => (
              <div
                key={r.user_id}
                onClick={() => setModalUserId(r.user_id)}
                className="bg-bat-bg-card border border-bat-gold-400/30 rounded-2xl p-5 text-center shadow-lg relative cursor-pointer hover:border-bat-gold-400/70 hover:shadow-[0_0_20px_rgba(245,197,24,0.2)] transition-all group"
              >
                <span className="text-3xl mb-2 block">{getMedalha(r.posicao)}</span>
                <div className="w-14 h-14 rounded-full bg-bat-gold-400/20 border-2 border-bat-gold-400/40 flex items-center justify-center text-bat-gold-400 text-xl font-bold mx-auto mb-2 overflow-hidden group-hover:scale-105 transition-transform">
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    r.apelido[0]?.toUpperCase()
                  )}
                </div>
                <p className="heading text-bat-text font-bold text-base truncate group-hover:text-bat-gold-400 transition-colors">
                  {r.apelido}
                </p>
                <p className="text-bat-text-muted text-xs">Nv. {r.nivel_atual} · {r.titulo_nivel}</p>
                
                <p className="heading text-bat-gold-400 text-lg font-bold mt-2">
                  {tab === "tempo_estudo" ? formatarTempo(r.valor) : `${r.valor} questões`}
                </p>

                {tab === "questoes" && r.percentual_acerto !== undefined && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    🎯 {r.percentual_acerto}% de acerto
                  </p>
                )}

                <span className="text-[10px] text-bat-text-muted mt-2 block opacity-0 group-hover:opacity-100 transition-opacity">
                  Clique para ver Mini Perfil 👤
                </span>
              </div>
            ))}
          </div>

          {/* Tabela Geral */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[340px] sm:min-w-full">
              <thead>
                <tr className="border-b border-bat-border text-bat-text-muted text-[11px] sm:text-xs uppercase tracking-wider bg-bat-bg-secondary/40">
                  <th className="px-3 sm:px-5 py-3">Posição</th>
                  <th className="px-3 sm:px-5 py-3">Soldado</th>
                  <th className="px-2 sm:px-5 py-3 text-center">Nível</th>
                  <th className="px-3 sm:px-5 py-3 text-right">
                    {tab === "tempo_estudo" ? "Tempo Estudado" : "Questões / Acerto"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bat-border/50 text-xs sm:text-sm">
                {ranking.map((r) => {
                  const isMe = r.user_id === user?.id;
                  return (
                    <tr
                      key={r.user_id}
                      onClick={() => setModalUserId(r.user_id)}
                      className={`hover:bg-bat-bg-elevated transition-colors cursor-pointer ${
                        isMe ? "bg-bat-gold-400/10 font-semibold" : ""
                      }`}
                    >
                      <td className="px-3 sm:px-5 py-3 font-bold text-bat-gold-400">
                        {getMedalha(r.posicao)}
                      </td>
                      <td className="px-3 sm:px-5 py-3">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bat-gold-400/15 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-xs font-bold overflow-hidden flex-shrink-0">
                            {r.avatar_url ? (
                              <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              r.apelido[0]?.toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-bat-text font-medium truncate block max-w-[120px] sm:max-w-none hover:text-bat-gold-400">
                              {r.apelido}
                            </span>
                            {isMe && (
                              <span className="text-[9px] sm:text-[10px] text-bat-gold-400 font-bold bg-bat-gold-400/20 px-1 py-0.2 rounded inline-block">
                                VOCÊ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-5 py-3 text-center text-bat-text-secondary text-xs">
                        Nv. {r.nivel_atual}
                      </td>
                      <td className="px-3 sm:px-5 py-3 text-right heading text-bat-gold-400 text-xs sm:text-sm font-bold whitespace-nowrap">
                        {tab === "tempo_estudo" ? (
                          formatarTempo(r.valor)
                        ) : (
                          <div>
                            <span>{r.valor} questões</span>
                            {r.percentual_acerto !== undefined && (
                              <span className="text-[10px] text-emerald-400 block font-normal font-sans">
                                {r.percentual_acerto}% acerto
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ SUA POSIÇÃO FIXA NO RODAPÉ ═══ */}
      {user && (
        <div className="mt-6 bg-bat-gold-400/10 border border-bat-gold-400/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="heading text-xl font-bold text-bat-gold-400">
              {minhaPosicao ? `#${minhaPosicao.posicao}` : "—"}
            </span>
            <div className="w-9 h-9 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-sm font-bold overflow-hidden flex-shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user.apelido?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div>
              <p className="text-bat-text text-sm font-medium">{user.apelido} <span className="text-bat-text-muted text-xs">(você)</span></p>
              <p className="text-bat-text-muted text-xs">Nv. {user.nivel_atual || 1}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="heading text-bat-gold-400 font-bold">
              {minhaPosicao
                ? tab === "tempo_estudo"
                  ? formatarTempo(minhaPosicao.valor)
                  : `${minhaPosicao.valor} questões`
                : "Sem tempo registrado ainda"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
