"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useStudySessionStore,
  formatarSegundosParaTimer,
  formatarTempoLegivel,
} from "@/stores/study-session-store";
import { useAuthStore } from "@/stores/auth-store";

export function StudySessionTracker() {
  const user = useAuthStore((state) => state.user);
  const { initSession, sendHeartbeat, tick } = useStudySessionStore();

  // 1. Inicializar sessão de estudo quando o usuário estiver autenticado
  useEffect(() => {
    if (user?.id) {
      initSession();
    }
  }, [user?.id, initSession]);

  // 2. Cronômetro de 1 segundo (tick suave no client)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [tick]);

  // 3. Heartbeat a cada 30 segundos com o backend para sincronizar XP e continuidade
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [sendHeartbeat]);

  return null;
}

export function StudySessionBadge({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const {
    isActive,
    isPaused,
    duracaoSegundos,
    xpGanhoNaSessao,
    multiplicador,
    pauseSession,
    resumeSession,
    initSession,
  } = useStudySessionStore();

  const [isOpen, setIsOpen] = useState(false);

  if (!isActive && !isPaused) {
    return (
      <Link
        href="/concursos"
        onClick={() => initSession()}
        className="flex items-center gap-2 bg-bat-bg-secondary hover:bg-bat-bg-elevated border border-bat-border hover:border-bat-gold-400/40 rounded-xl px-3 py-1.5 text-xs text-bat-text transition-all cursor-pointer no-underline"
        title="Ir para Concursos e Iniciar Sessão de Estudo"
      >
        <span>⚡</span>
        <span className="font-semibold text-bat-gold-400">Estudar Agora</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 rounded-xl border transition-all cursor-pointer px-3 py-1.5 ${
          isPaused
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-500/50"
            : "bg-bat-success/10 border-bat-success/30 text-bat-success hover:border-bat-success/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
        }`}
        title="Clique para ver detalhes do tempo de estudo e bônus de XP"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-bat-success animate-pulse"}`} />
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold tracking-wider">
            {formatarSegundosParaTimer(duracaoSegundos)}
          </span>
          {multiplicador > 1 && (
            <span className="text-[10px] font-bold bg-bat-gold-400 text-black px-1.5 py-0.2 rounded shadow-sm">
              {multiplicador}x XP
            </span>
          )}
        </div>
      </button>

      {/* ═══ POPOVER DE DETALHES DA SESSÃO ═══ */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-bat-bg-card border border-bat-border rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-bat-border/50 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <div>
                  <h4 className="heading text-sm text-bat-text font-bold">Tempo de Estudo</h4>
                  <p className="text-[10px] text-bat-text-muted">Ganhando XP e bônus contínuo</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPaused ? "bg-amber-500/20 text-amber-300" : "bg-bat-success/20 text-bat-success"
              }`}>
                {isPaused ? "Pausado" : "Ativo"}
              </span>
            </div>

            {/* Cronômetro */}
            <div className="text-center py-2.5 bg-bat-bg-secondary rounded-xl border border-bat-border/50 mb-3">
              <p className="text-[11px] text-bat-text-muted mb-0.5">Tempo Estudado Nesta Sessão</p>
              <p className="heading text-2xl font-mono font-bold text-bat-gold-400">
                {formatarSegundosParaTimer(duracaoSegundos)}
              </p>
            </div>

            {/* Estatísticas da Sessão */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-center">
              <div className="bg-bat-bg-secondary/60 border border-bat-border/40 rounded-xl p-2.5">
                <p className="text-[10px] text-bat-text-muted">XP Acumulado</p>
                <p className="heading text-sm font-bold text-bat-text">+{xpGanhoNaSessao} XP</p>
              </div>
              <div className="bg-bat-bg-secondary/60 border border-bat-border/40 rounded-xl p-2.5">
                <p className="text-[10px] text-bat-text-muted">Bônus de Continuidade</p>
                <p className="heading text-sm font-bold text-bat-gold-400">{multiplicador}x XP</p>
              </div>
            </div>

            <p className="text-[10px] text-bat-text-muted leading-tight mb-3">
              💡 A cada 15 min contínuos de estudo você ganha +10% de bônus de XP (até 1.5x / +50%).
            </p>

            {/* Ações */}
            <div className="flex gap-2">
              {isPaused ? (
                <button
                  onClick={() => resumeSession()}
                  className="btn-primary flex-1 py-2 text-xs font-bold"
                >
                  ▶️ Retomar Estudo
                </button>
              ) : (
                <button
                  onClick={() => pauseSession()}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-bat-bg-secondary border border-bat-border hover:bg-bat-bg-elevated text-bat-text transition-colors cursor-pointer"
                >
                  ⏸️ Pausar
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
