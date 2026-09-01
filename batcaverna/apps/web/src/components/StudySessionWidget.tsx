"use client";

import { useEffect, useState } from "react";
import {
  useStudySessionStore,
  formatarSegundosParaTimer,
  formatarTempoLegivel,
  LIMITE_MAXIMO_8H_SEGUNDOS,
} from "@/stores/study-session-store";
import { useAuthStore } from "@/stores/auth-store";

export function StudySessionTracker() {
  const user = useAuthStore((state) => state.user);
  const { initSession, sendHeartbeat, tick } = useStudySessionStore();

  // 1. Inicializar sessão automática quando o usuário estiver autenticado
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

  // 3. Heartbeat a cada 30 segundos com o backend
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [sendHeartbeat]);

  return <StudySessionModal8h />;
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

  const progresso8h = Math.min(100, (duracaoSegundos / LIMITE_MAXIMO_8H_SEGUNDOS) * 100);
  const tempoRestanteSegundos = Math.max(0, LIMITE_MAXIMO_8H_SEGUNDOS - duracaoSegundos);

  if (!isActive && !isPaused) {
    return (
      <button
        onClick={() => initSession()}
        className="flex items-center gap-2 bg-bat-bg-secondary hover:bg-bat-bg-elevated border border-bat-border hover:border-bat-gold-400/40 rounded-xl px-3 py-1.5 text-xs text-bat-text transition-all cursor-pointer"
        title="Iniciar Sessão de Estudo (Limite 8h)"
      >
        <span>⚡</span>
        <span className="font-semibold text-bat-gold-400">Iniciar Sessão 8h</span>
      </button>
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
        title="Clique para ver detalhes da sessão de estudo automática (limite 8h)"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-bat-success animate-pulse"}`} />
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold tracking-wider">
            {formatarSegundosParaTimer(duracaoSegundos)}
          </span>
          <span className="text-[10px] opacity-70 border-l border-current/30 pl-1.5">
            8h máx
          </span>
          {multiplicador > 1 && (
            <span className="text-[10px] font-bold bg-bat-gold-400 text-black px-1 rounded">
              {multiplicador}x
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
                  <h4 className="heading text-sm text-bat-text font-bold">Sessão Automática</h4>
                  <p className="text-[10px] text-bat-text-muted">Limite de até 8 horas por sessão</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPaused ? "bg-amber-500/20 text-amber-300" : "bg-bat-success/20 text-bat-success"
              }`}>
                {isPaused ? "Pausada" : "Ativa"}
              </span>
            </div>

            {/* Cronômetro Gigante */}
            <div className="text-center py-2 bg-bat-bg-secondary rounded-xl border border-bat-border/50 mb-3">
              <p className="text-[11px] text-bat-text-muted mb-0.5">Tempo Estudado Nesta Sessão</p>
              <p className="heading text-2xl font-mono font-bold text-bat-gold-400">
                {formatarSegundosParaTimer(duracaoSegundos)}
              </p>
              <p className="text-[10px] text-bat-text-muted mt-0.5">
                Restam {formatarTempoLegivel(tempoRestanteSegundos)} para o limite de 8h
              </p>
            </div>

            {/* Barra de Progresso das 8h */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-bat-text-muted mb-1">
                <span>Progresso das 8h</span>
                <span>{Math.round(progresso8h)}%</span>
              </div>
              <div className="w-full h-2 bg-bat-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-bat-gold-500 to-amber-400"
                  style={{ width: `${progresso8h}%` }}
                />
              </div>
            </div>

            {/* Estatísticas da Sessão */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-center">
              <div className="bg-bat-bg-secondary/60 border border-bat-border/40 rounded-xl p-2">
                <p className="text-[10px] text-bat-text-muted">XP Acumulado</p>
                <p className="heading text-sm font-bold text-bat-text">+{xpGanhoNaSessao} XP</p>
              </div>
              <div className="bg-bat-bg-secondary/60 border border-bat-border/40 rounded-xl p-2">
                <p className="text-[10px] text-bat-text-muted">Bônus Multiplicador</p>
                <p className="heading text-sm font-bold text-bat-gold-400">{multiplicador}x XP</p>
              </div>
            </div>

            <p className="text-[10px] text-bat-text-muted leading-tight mb-3">
              💡 A cada 15 min contínuos você ganha +10% de bônus de XP (até 1.5x). A sessão fecha automaticamente ao atingir 8 horas.
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

export function StudySessionModal8h() {
  const { modal8hAberto, close8hModal, xpGanhoNaSessao, initSession } = useStudySessionStore();

  if (!modal8hAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bat-bg-card border-2 border-bat-gold-400 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,197,24,0.3)] text-center">
        <span className="text-6xl block mb-3 animate-bounce">🦇</span>
        <h2 className="heading text-2xl font-bold text-bat-gold-400 mb-2">
          Limite de 8 Horas Concluído!
        </h2>
        <p className="text-bat-text text-sm mb-4 leading-relaxed">
          Parabéns, soldado! Você completou uma sessão contínua de <strong>8 horas</strong> de estudo na BatCaverna.
        </p>
        <div className="bg-bat-gold-400/10 border border-bat-gold-400/30 rounded-2xl p-4 mb-5">
          <p className="text-xs text-bat-text-muted mb-1">XP Total Conquistado</p>
          <p className="heading text-3xl font-bold text-bat-gold-400">+{xpGanhoNaSessao} XP</p>
        </div>
        <p className="text-bat-text-muted text-xs mb-6">
          Descanse a mente e os olhos para consolidar a memória. Quando estiver pronto, você pode iniciar uma nova sessão.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => close8hModal()}
            className="flex-1 py-3 rounded-xl bg-bat-bg-secondary border border-bat-border hover:bg-bat-bg-elevated text-bat-text text-sm font-semibold transition-colors cursor-pointer"
          >
            Descansar Agora
          </button>
          <button
            onClick={() => {
              close8hModal();
              initSession();
            }}
            className="btn-primary flex-1 py-3 text-sm font-bold"
          >
            Nova Sessão ⚡
          </button>
        </div>
      </div>
    </div>
  );
}
