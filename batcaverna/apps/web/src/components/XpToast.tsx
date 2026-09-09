"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { calcularNivel } from "@batcaverna/utils";

interface ToastData {
  titulo: string;
  mensagem: string;
  tipo: "xp" | "level_up";
  xpGanho?: number;
  xpTotal?: number;
}

export function XpToast() {
  const [toastAtivo, setToastAtivo] = useState<ToastData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleXpGanho = (e: CustomEvent<{ xp: number; totalXp: number; motivo: string }>) => {
      const { xp, totalXp, motivo } = e.detail;
      clearTimeout(timer);
      setToastAtivo({
        tipo: "xp",
        titulo: `+${xp} XP Conquistado! ⚡`,
        mensagem: motivo || "Você acertou uma questão e ganhou experiência de combate!",
        xpGanho: xp,
        xpTotal: totalXp,
      });

      timer = setTimeout(() => setToastAtivo(null), 4500);
    };

    const handleLevelUp = (e: CustomEvent<{ novoNivel: number; titulo: string }>) => {
      const { novoNivel, titulo } = e.detail;
      clearTimeout(timer);
      setToastAtivo({
        tipo: "level_up",
        titulo: `🎉 SUBIDA DE NÍVEL: Nível ${novoNivel}!`,
        mensagem: `Você foi promovido a "${titulo}". Continue sua jornada na BatCaverna!`,
      });

      timer = setTimeout(() => setToastAtivo(null), 6000);
    };

    window.addEventListener("batcaverna_xp_ganho" as any, handleXpGanho);
    window.addEventListener("batcaverna_level_up" as any, handleLevelUp);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("batcaverna_xp_ganho" as any, handleXpGanho);
      window.removeEventListener("batcaverna_level_up" as any, handleLevelUp);
    };
  }, []);

  if (!mounted || !toastAtivo) return null;

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 sm:max-w-sm z-[9999] bg-bat-bg-card border-2 border-bat-gold-400/80 rounded-2xl p-4 shadow-[0_0_35px_rgba(245,197,24,0.35)] animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl select-none" aria-hidden="true">
          {toastAtivo.tipo === "level_up" ? "🏆" : "⚡"}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-bat-gold-400 truncate">
            {toastAtivo.titulo}
          </h4>
          <p className="text-xs text-bat-text-secondary mt-1 leading-relaxed">
            {toastAtivo.mensagem}
          </p>

          {toastAtivo.xpTotal !== undefined && (
            <div className="mt-2.5">
              {(() => {
                const info = calcularNivel(toastAtivo.xpTotal);
                return (
                  <div>
                    <div className="flex justify-between text-[10px] text-bat-text-muted mb-1 font-medium">
                      <span>Progresso Nv. {info.nivel}</span>
                      <span>
                        {info.xp_atual_no_nivel} / {info.xp_necessario_proximo} XP
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-bat-bg-primary rounded-full overflow-hidden border border-bat-border/50">
                      <div
                        className="h-full bg-gradient-to-r from-bat-gold-400 to-amber-300 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, info.progresso_percentual))}%` }}
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
          className="text-bat-text-muted hover:text-bat-text text-xs p-1 -mr-1 -mt-1 rounded-lg hover:bg-bat-bg-elevated transition cursor-pointer"
          aria-label="Fechar notificação"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}
