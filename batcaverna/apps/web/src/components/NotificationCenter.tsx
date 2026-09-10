"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface NotificacaoItem {
  id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  dados_extra?: any;
  lida: boolean;
  criada_em: string;
}

interface Props {
  align?: "left" | "right" | "auto";
}

export function NotificationCenter({ align = "auto" }: Props) {
  const [aberto, setAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const carregarNotificacoes = async () => {
    try {
      const res = await fetchWithAuth("/api/usuarios/me/notificacoes");
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

    // Aba escondida não consulta. O chat e o cronômetro de estudo já aplicam
    // esta regra; o sino ficara de fora e consultava a cada 30 s para sempre —
    // 2.880 requisições por dia por aluno com a aba aberta em segundo plano.
    // E como o AppShell agora é montado uma vez para toda a área logada, o
    // intervalo vive enquanto a sessão durar.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") carregarNotificacoes();
    }, 30000);

    // Ao voltar para a aba, atualiza na hora em vez de esperar o próximo ciclo.
    const aoVoltar = () => {
      if (document.visibilityState === "visible") carregarNotificacoes();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
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

  // Ao ganhar XP ou subir de nível, atualiza a lista de notificações no sino
  useEffect(() => {
    const handleAtualizacao = () => {
      carregarNotificacoes();
    };

    window.addEventListener("batcaverna_xp_ganho" as any, handleAtualizacao);
    window.addEventListener("batcaverna_level_up" as any, handleAtualizacao);

    return () => {
      window.removeEventListener("batcaverna_xp_ganho" as any, handleAtualizacao);
      window.removeEventListener("batcaverna_level_up" as any, handleAtualizacao);
    };
  }, []);

  const handleMarcarTodasLidas = async () => {
    try {
      await fetchWithAuth("/api/usuarios/me/notificacoes", { method: "PUT" });
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
      setNaoLidas(0);
    } catch {}
  };

  const handleMarcarLida = async (id: string) => {
    try {
      await fetchWithAuth(`/api/usuarios/me/notificacoes/${id}/marcar-lida`, { method: "PUT" });
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
      setNaoLidas((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const handleApagar = async (id: string, estavaNaoLida: boolean) => {
    // Some da tela na hora; se o servidor falhar, o próximo refresh a traz de volta.
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    if (estavaNaoLida) setNaoLidas((prev) => Math.max(0, prev - 1));
    try {
      await fetchWithAuth(`/api/usuarios/me/notificacoes/${id}`, {
        method: "DELETE",
      });
    } catch {}
  };

  const handleLimparTudo = async () => {
    setNotificacoes([]);
    setNaoLidas(0);
    try {
      await fetchWithAuth("/api/usuarios/me/notificacoes?tudo=1", {
        method: "DELETE",
      });
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
      // Alerta de moderação: só o admin recebe, e a cor do sino não muda —
      // quem precisa se destacar é a linha, dentro da lista.
      case "moderacao": return "🛡️";
      case "sistema": return "📢";
      case "amigo_estudando": return "⚔️";
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

      {/* ═══ DROPDOWN PANEL (Responsivo para telas mobile/APK e Desktop) ═══ */}
      {aberto && (
        <div
          className={`fixed inset-x-3 top-16 sm:absolute sm:top-full sm:mt-2 sm:w-96 max-w-[calc(100vw-24px)] bg-bat-bg-card border border-bat-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            align === "left" ? "sm:left-0 sm:right-auto" : "sm:right-0 sm:left-auto"
          }`}
        >
          <div className="p-4 border-b border-bat-border flex items-center justify-between bg-bat-bg-secondary/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-bat-text">Central de Notificações</span>
              {naoLidas > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/40 text-bat-gold-400 text-[10px] font-bold">
                  {naoLidas} nova{naoLidas !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              {naoLidas > 0 && (
                <button
                  onClick={handleMarcarTodasLidas}
                  className="text-[11px] text-bat-gold-400 hover:underline cursor-pointer font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
              {notificacoes.length > 0 && (
                <button
                  onClick={handleLimparTudo}
                  className="text-[11px] text-bat-text-muted hover:text-bat-error hover:underline cursor-pointer font-medium"
                  title="Apagar todas as notificações"
                >
                  Limpar tudo
                </button>
              )}
            </div>
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
                  className={`group p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    n.lida ? "opacity-60 hover:opacity-100" : "bg-bat-gold-400/5 hover:bg-bat-gold-400/10"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center text-base flex-shrink-0">
                    {getIcone(n.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-bat-text truncate">{n.titulo}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!n.lida && (
                          <span className="w-2 h-2 rounded-full bg-bat-gold-400" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApagar(n.id, !n.lida);
                          }}
                          className="text-bat-text-muted hover:text-bat-error transition-colors cursor-pointer opacity-0 group-hover:opacity-100 text-[13px] leading-none"
                          aria-label="Apagar notificação"
                          title="Apagar"
                        >
                          ✕
                        </button>
                      </div>
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
    </div>
  );
}
