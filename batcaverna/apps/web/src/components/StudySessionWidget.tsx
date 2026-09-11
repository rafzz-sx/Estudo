"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useStudySessionStore,
  formatarSegundosParaTimer,
} from "@/stores/study-session-store";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Verifica se a rota atual é uma trilha de concurso ou área ativa de estudo.
 * Proteção anti-fraude: o tempo de estudo e XP só são contabilizados dentro destas rotas.
 */
export function isRotaDeEstudo(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.includes("/trilha") ||
    pathname.includes("/assuntos") ||
    pathname.startsWith("/questoes") ||
    pathname.startsWith("/simulado") ||
    pathname.startsWith("/revisoes") ||
    pathname.startsWith("/caderno") ||
    pathname.startsWith("/redacao") ||
    pathname.startsWith("/teoria")
  );
}

/**
 * TEMPO OCIOSO MÁXIMO (ms) antes de pausar automaticamente o cronômetro.
 * 2 minutos sem interação = o aluno provavelmente não está estudando.
 */
const IDLE_TIMEOUT_MS = 2 * 60 * 1000;

export function StudySessionTracker() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const {
    isActive,
    isPaused,
    isManuallyPaused,
    initSession,
    sendHeartbeat,
    tick,
    pauseSession,
    resumeSession,
  } = useStudySessionStore();

  const emRota = isRotaDeEstudo(pathname);

  // ─── Sinal de atividade real de estudo ───────────────────────
  // As páginas de trilha, questões e simulado disparam o evento
  // `batcaverna_study_activity` quando o aluno está efetivamente
  // estudando (abrindo teoria, respondendo questão, simulado ativo).
  // Sem esse sinal, o cronômetro NÃO inicia.
  const [estudoAtivo, setEstudoAtivo] = useState(false);
  const estudoAtivoRef = useRef(false);

  useEffect(() => {
    const handler = () => {
      setEstudoAtivo(true);
      estudoAtivoRef.current = true;
    };
    window.addEventListener("batcaverna_study_activity", handler);
    return () => window.removeEventListener("batcaverna_study_activity", handler);
  }, []);

  // Quando o aluno sai da rota de estudo, desativa o sinal.
  useEffect(() => {
    if (!emRota) {
      setEstudoAtivo(false);
      estudoAtivoRef.current = false;
    }
  }, [emRota]);

  // ─── Detecção de ociosidade (idle 2 min) ────────────────────
  const [ocioso, setOcioso] = useState(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!emRota || !estudoAtivo) return;

    const resetIdle = () => {
      if (ocioso) {
        setOcioso(false);
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setOcioso(true);
      }, IDLE_TIMEOUT_MS);
    };

    // Qualquer interação reseta o contador de ociosidade
    const eventos = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    eventos.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }));

    // Iniciar o timer de idle imediatamente
    resetIdle();

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [emRota, estudoAtivo, ocioso]);

  // ─── Pausar/despausar por ociosidade ────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    if (ocioso && isActive && !isPaused) {
      pauseSession(false); // pausa automática por idle
    } else if (!ocioso && isActive && isPaused && !isManuallyPaused) {
      resumeSession();
    }
  }, [ocioso, isActive, isPaused, isManuallyPaused, user?.id, pauseSession, resumeSession]);

  // 1. Iniciar ou Retomar sessão SOMENTE quando o aluno estiver
  //    numa rota de estudo E com atividade real confirmada.
  useEffect(() => {
    if (!user?.id) return;

    if (emRota && estudoAtivo && !ocioso) {
      if (!isActive && !isPaused && !isManuallyPaused) {
        initSession();
      } else if (isActive && isPaused && !isManuallyPaused) {
        // Só despausa automaticamente se não tiver sido pausado manualmente pelo aluno!
        resumeSession();
      }
    } else if (!emRota && isActive && !isPaused) {
      // Saiu da trilha para dashboard, chat, ranking, perfil: pausa automaticamente para evitar fraudes!
      pauseSession(false);
    }
  }, [user?.id, emRota, estudoAtivo, ocioso, isActive, isPaused, isManuallyPaused, initSession, resumeSession, pauseSession]);

  // 2. Cronômetro de 1 segundo: SÓ avança se estiver na trilha, ativo e com aba visível
  useEffect(() => {
    if (!emRota || isPaused || !isActive || ocioso) return;

    const timerInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        tick();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [emRota, isPaused, isActive, ocioso, tick]);

  // 3. Heartbeat a cada 30 segundos: SÓ envia se estiver em rota de estudo ativa
  useEffect(() => {
    if (!emRota || isPaused || !isActive || ocioso) return;

    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [emRota, isPaused, isActive, ocioso, sendHeartbeat]);

  // 4. Ao sair da página/fechar a aba enquanto estuda, grava o intervalo pendente
  useEffect(() => {
    const aoSair = () => {
      if (emRota && isActive && !isPaused) {
        sendHeartbeat({ forcar: true, keepalive: true });
      }
    };
    window.addEventListener("pagehide", aoSair);
    return () => window.removeEventListener("pagehide", aoSair);
  }, [emRota, isActive, isPaused, sendHeartbeat]);

  return null;
}

export function StudySessionBadge({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const pathname = usePathname();
  const emRota = isRotaDeEstudo(pathname);
  const {
    isActive,
    isPaused,
    duracaoSegundos,
    xpGanhoNaSessao,
    multiplicador,
    sincroniaEsquadrao,
    amigosSincronia,
    pauseSession,
    resumeSession,
  } = useStudySessionStore();

  const [isOpen, setIsOpen] = useState(false);

  // Se não há sessão ativa nem pausada:
  if (!isActive && !isPaused) {
    return (
      <Link
        href="/concursos"
        className="flex items-center gap-2 bg-bat-bg-secondary hover:bg-bat-bg-elevated border border-bat-border hover:border-bat-gold-400/40 rounded-xl px-3 py-1.5 text-xs text-bat-text transition-all cursor-pointer no-underline"
        title="Escolha um concurso e entre na trilha para iniciar a contagem"
      >
        <span>⚡</span>
        <span className="font-semibold text-bat-gold-400">Ir para Trilha</span>
      </Link>
    );
  }

  const pausadoPorEstarForaDaTrilha = isActive && !emRota;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 rounded-xl border transition-all cursor-pointer px-3 py-1.5 ${
          isPaused || pausadoPorEstarForaDaTrilha
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-500/50"
            : sincroniaEsquadrao
            ? "bg-bat-gold-400/15 border-bat-gold-400/40 text-bat-gold-400 hover:border-bat-gold-400/60 shadow-[0_0_15px_rgba(245,197,24,0.25)]"
            : "bg-bat-success/10 border-bat-success/30 text-bat-success hover:border-bat-success/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
        }`}
        title={
          pausadoPorEstarForaDaTrilha
            ? "Cronômetro pausado: você está fora de uma trilha de estudos"
            : isPaused
            ? "Sessão pausada"
            : sincroniaEsquadrao
            ? "⚔️ Sincronia de Esquadrão Ativa (+10% XP) estudando junto com amigos!"
            : "Sessão de estudo ativa na trilha"
        }
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isPaused || pausadoPorEstarForaDaTrilha
              ? "bg-amber-400"
              : sincroniaEsquadrao
              ? "bg-bat-gold-400 animate-pulse shadow-[0_0_8px_rgba(245,197,24,0.8)]"
              : "bg-bat-success animate-pulse"
          }`}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold tracking-wider">
            {formatarSegundosParaTimer(duracaoSegundos)}
          </span>
          {pausadoPorEstarForaDaTrilha ? (
            <span className="text-[10px] text-amber-300/80 border-l border-current/30 pl-1.5 hidden sm:inline">
              fora da trilha
            </span>
          ) : sincroniaEsquadrao ? (
            <span className="text-[10px] font-extrabold bg-bat-gold-400 text-black px-1.5 py-0.2 rounded shadow-[0_0_8px_rgba(245,197,24,0.6)] flex items-center gap-1">
              <span>⚔️</span>
              <span className="hidden sm:inline">Sincronia</span> {multiplicador}x
            </span>
          ) : multiplicador > 1 ? (
            <span className="text-[10px] font-bold bg-bat-gold-400 text-black px-1.5 py-0.2 rounded shadow-sm">
              {multiplicador}x XP
            </span>
          ) : null}
        </div>
      </button>

      {/* ═══ POPOVER DE DETALHES DA SESSÃO ═══ */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-3 top-16 sm:top-auto sm:inset-x-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1.5rem)] bg-bat-bg-card border border-bat-border rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-bat-border/50 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <div>
                  <h4 className="heading text-sm text-bat-text font-bold">Tempo de Estudo Real</h4>
                  <p className="text-[10px] text-bat-text-muted">Proteção anti-fraude ativa</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pausadoPorEstarForaDaTrilha || isPaused
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-bat-success/20 text-bat-success"
                  }`}
                >
                  {pausadoPorEstarForaDaTrilha ? "Fora da Trilha" : isPaused ? "Pausado" : "Ativo na Trilha"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-lg bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text flex items-center justify-center text-xs transition cursor-pointer"
                  aria-label="Fechar detalhes"
                >
                  ✕
                </button>
              </div>
            </div>

            {pausadoPorEstarForaDaTrilha && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 mb-3 leading-relaxed">
                🛡️ O cronômetro pausa automaticamente fora das trilhas, questões e simulados para registrar com precisão apenas o seu tempo real de estudo.
              </div>
            )}

            {sincroniaEsquadrao && (
              <div className="p-2.5 rounded-xl bg-bat-gold-400/10 border border-bat-gold-400/30 text-[11px] text-bat-gold-300 mb-3 leading-relaxed flex items-start gap-2 shadow-[0_0_15px_rgba(245,197,24,0.1)]">
                <span className="text-base shrink-0">⚔️</span>
                <div>
                  <span className="font-bold text-bat-gold-400">Sincronia de Esquadrão Ativa (+10% XP)!</span>
                  <p className="text-[10px] text-bat-text-secondary mt-0.5">
                    Você e {amigosSincronia.length > 0 ? amigosSincronia.map((a) => a.apelido).join(", ") : "seu amigo"} estão combatendo juntos e ganhando bônus simultâneo de XP.
                  </p>
                </div>
              </div>
            )}

            {/* Cronômetro */}
            <div className="text-center py-2.5 bg-bat-bg-secondary rounded-xl border border-bat-border/50 mb-3">
              <p className="text-[11px] text-bat-text-muted mb-0.5">Tempo Registrado na Trilha</p>
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
                <p className="text-[10px] text-bat-text-muted">Multiplicador</p>
                <p className="heading text-sm font-bold text-bat-gold-400">{multiplicador}x XP</p>
              </div>
            </div>

            <p className="text-[10px] text-bat-text-muted leading-tight mb-3">
              💡 Estude continuamente nas trilhas e questões para ganhar bônus de XP de até 1.5x.
            </p>

            {/* Ações */}
            <div className="flex gap-2">
              {!emRota ? (
                <Link
                  href="/concursos"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold text-center no-underline cursor-pointer active:scale-95"
                >
                  🎯 Ir para uma Trilha
                </Link>
              ) : isPaused ? (
                <button
                  type="button"
                  onClick={() => resumeSession()}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold cursor-pointer active:scale-95 transition-transform"
                >
                  ▶️ Retomar Estudo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => pauseSession(true)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-bat-bg-secondary border border-bat-border hover:bg-bat-bg-elevated text-bat-text transition-colors cursor-pointer active:scale-95"
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
