"use client";

import { useState, useEffect, useRef } from "react";
import { calcularNivel } from "@batcaverna/utils";

interface NotificacaoItem {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  dados_extra?: any;
  lida: boolean;
  criada_em: string;
}

export function NotificationCenter() {
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [toastAtivo, setToastAtivo] = useState<{
    titulo: string;
    mensagem: string;
    tipo: string;
    xpGanho?: number;
    xpTotal?: number;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const carregarNotificacoes = async () => {
    try {
      const res = await fetch("/api/usuarios/me/notificacoes");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotificacoes(json.data.notificacoes || []);
          setNaoLidas(json.data.nao_lidas || 0);
        }
      }
    } catch (e) {
      // Silencioso em caso de offline
    }
  };

  useEffect(() => {
    carregarNotificacoes();
    const interval = setInterval(carregarNotificacoes, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Escutar eventos de XP ganho e level-up disparados na aplicação
  useEffect(() => {
    const handleXpGanho = (e: CustomEvent<{ xp: number; totalXp: number; motivo: string }>) => {
      const { xp, totalXp, motivo } = e.detail;
      setToastAtivo({
        tipo: "xp",
        titulo: `+${xp} XP Conquistado! ⚡`,
        mensagem: motivo || "Você acertou uma questão e ganhou experiência de combate!",
        xpGanho: xp,
        xpTotal: totalXp,
      });

      setTimeout(() => setToastAtivo(null), 4500);
      carregarNotificacoes();
    };

    const handleLevelUp = (e: CustomEvent<{ novoNivel: number; titulo: string }>) => {
      const { novoNivel, titulo } = e.detail;
      setToastAtivo({
        tipo: "level_up",
        titulo: `🎉 SUBIDA DE NÍVEL: Nível ${novoNivel}!`,
        mensagem: `Você foi promovido a "${titulo}". Continue sua jornada na BatCaverna!`,
      });

      setTimeout(() => setToastAtivo(null), 6000);
      carregarNotificacoes();
    };

    window.addEventListener("batcaverna_xp_ganho" as any, handleXpGanho);
    window.addEventListener("batcaverna_level_up" as any, handleLevelUp);

    return () => {
      window.removeEventListener("batcaverna_xp_ganho" as any, handleXpGanho);
      window.removeEventListener("batcaverna_level_up" as any, handleLevelUp);
    };
  }, []);

  const handleMarcarTodasLidas = async () => {
    try {
      await fetch("/api/usuarios/me/notificacoes", { method: "PUT" });
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch {}
  };

  const handleMarcarLida = async (id: string) => {
    try {
      await fetch(`/api/usuarios/me/notificacoes/${id}/marcar-lida`, { method: "PUT" });
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setNaoLidas((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case "xp_ganho": return "⚡";
      case "subiu_nivel": return "🏆";
      case "mensagem_motivacional": return "🦇";
      case "atualizacao_plataforma": return "🚀";
      case "resposta_ticket": return "🎫";
      case "solicitacao_amizade": return "👥";
      case "streak": return "🔥";
      default: return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ═══ BOTÃO SINO ═══ */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-xl bg-bat-bg-secondary/80 border border-bat-border hover:border-bat-gold-400/40 text-bat-text transition-all cursor-pointer flex items-center justify-center"
        aria-label="Notificações"
      >
        <span className="text-base">🔔</span>
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-bat-gold-400 text-black text-[10px] font-extrabold flex items-center justify-center shadow-[0_0_8px_rgba(245,197,24,0.6)]">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {/* ═══ DROPDOWN PANEL ═══ */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bat-bg-card border border-bat-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-bat-border flex items-center justify-between bg-bat-bg-secondary/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-bat-text">Central de Notificações</span>
              {naoLidas > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/40 text-bat-gold-400 text-[10px] font-bold">
                  {naoLidas} nova{naoLidas !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {naoLidas > 0 && (
              <button
                onClick={handleMarcarTodasLidas}
                className="text-[11px] text-bat-gold-400 hover:underline cursor-pointer font-medium"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-bat-border/40">
            {notificacoes.length === 0 ? (
              <div className="p-8 text-center text-bat-text-muted text-xs">
                <span className="text-3xl block mb-2">🦇</span>
                Nenhuma notificação por enquanto. Continue estudando!
              </div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.lida && handleMarcarLida(n.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    n.lida ? "opacity-60 hover:opacity-100" : "bg-bat-gold-400/5 hover:bg-bat-gold-400/10"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center text-base flex-shrink-0">
                    {getIcone(n.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-bat-text truncate">{n.titulo}</p>
                      {!n.lida && (
                        <span className="w-2 h-2 rounded-full bg-bat-gold-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-bat-text-secondary mt-0.5 leading-relaxed">{n.mensagem}</p>
                    <span className="text-[10px] text-bat-text-muted mt-1 block">
                      {new Date(n.criada_em).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═══ TOAST FLUTUANTE DE XP / LEVEL UP ═══ */}
      {toastAtivo && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-bat-bg-card border-2 border-bat-gold-400/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,197,24,0.3)] animate-in slide-in-from-bottom-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {toastAtivo.tipo === "level_up" ? "🏆" : "⚡"}
            </span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-bat-gold-400">{toastAtivo.titulo}</h4>
              <p className="text-xs text-bat-text-secondary mt-1">{toastAtivo.mensagem}</p>

              {toastAtivo.xpTotal !== undefined && (
                <div className="mt-2.5">
                  {(() => {
                    const info = calcularNivel(toastAtivo.xpTotal);
                    return (
                      <div>
                        <div className="flex justify-between text-[10px] text-bat-text-muted mb-1">
                          <span>Progresso Nv. {info.nivel}</span>
                          <span>{info.xp_atual_no_nivel} / {info.xp_necessario_proximo} XP</span>
                        </div>
                        <div className="w-full h-1.5 bg-bat-bg-primary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-bat-gold-400 to-amber-300 rounded-full transition-all duration-700"
                            style={{ width: `${info.progresso_percentual}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <button
              onClick={() => setToastAtivo(null)}
              className="text-bat-text-muted hover:text-bat-text text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
