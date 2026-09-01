import { create } from 'zustand';
import { useAuthStore } from './auth-store';

interface StudySessionState {
  isActive: boolean;
  isPaused: boolean;
  sessionId: string | null;
  duracaoSegundos: number;
  tempoEstudoHoje: number;
  tempoEstudoTotal: number;
  xpGanhoNaSessao: number;
  multiplicador: number;
  isInitializing: boolean;

  // Actions
  initSession: () => Promise<void>;
  sendHeartbeat: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => Promise<void>;
  tick: () => void;
}

export function formatarSegundosParaTimer(totalSegundos: number): string {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const hStr = horas.toString().padStart(2, '0');
  const mStr = minutos.toString().padStart(2, '0');
  const sStr = segundos.toString().padStart(2, '0');

  return `${hStr}:${mStr}:${sStr}`;
}

export function formatarTempoLegivel(totalSegundos: number): string {
  if (totalSegundos <= 0) return '0min';
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m}min`;
}

export const useStudySessionStore = create<StudySessionState>()((set, get) => ({
  isActive: false,
  isPaused: false,
  sessionId: null,
  duracaoSegundos: 0,
  tempoEstudoHoje: 0,
  tempoEstudoTotal: 0,
  xpGanhoNaSessao: 0,
  multiplicador: 1.0,
  isInitializing: false,

  initSession: async () => {
    if (get().isInitializing) return;
    set({ isInitializing: true });

    try {
      // 1. Consultar status atual da sessão
      const statusRes = await fetch('/api/study-sessions/status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.success && statusData.data) {
          const { sessao_ativa, tempo_estudo_hoje_segundos, tempo_estudo_total_segundos } = statusData.data;

          set({
            tempoEstudoHoje: tempo_estudo_hoje_segundos || 0,
            tempoEstudoTotal: tempo_estudo_total_segundos || 0,
          });

          if (sessao_ativa) {
            set({
              isActive: true,
              sessionId: sessao_ativa.id,
              duracaoSegundos: sessao_ativa.duracao_segundos || 0,
              multiplicador: sessao_ativa.multiplicador || 1.0,
              xpGanhoNaSessao: sessao_ativa.xp_ganho_na_sessao || 0,
              isInitializing: false,
            });
            return;
          }
        }
      }

      // 2. Se não tem sessão ativa, iniciar nova sessão
      const startRes = await fetch('/api/study-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispositivo: 'web' }),
      });

      if (startRes.ok) {
        const startData = await startRes.json();
        if (startData.success && startData.data) {
          set({
            isActive: true,
            isPaused: false,
            sessionId: startData.data.session_id,
            duracaoSegundos: startData.data.duracao_segundos || 0,
            multiplicador: startData.data.multiplicador || 1.0,
            xpGanhoNaSessao: startData.data.xp_ganho_na_sessao || 0,
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao inicializar sessão de estudo:', e);
    } finally {
      set({ isInitializing: false });
    }
  },

  sendHeartbeat: async () => {
    const { isActive, isPaused } = get();
    if (!isActive || isPaused) return;

    try {
      const res = await fetch('/api/study-sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const { duracao_segundos, xp_ganho_total_sessao, multiplicador, xp_ganho_intervalo } = data.data;

          set((state) => ({
            duracaoSegundos: duracao_segundos,
            xpGanhoNaSessao: xp_ganho_total_sessao,
            multiplicador,
            tempoEstudoHoje: state.tempoEstudoHoje + (xp_ganho_intervalo ? 30 : 0),
            tempoEstudoTotal: state.tempoEstudoTotal + (xp_ganho_intervalo ? 30 : 0),
          }));

          // Se ganhou XP na sessão, atualizar auth store imediatamente
          if (xp_ganho_intervalo > 0) {
            const authUser = useAuthStore.getState().user;
            if (authUser) {
              useAuthStore.getState().updateUser({
                xp_total: (authUser.xp_total || 0) + xp_ganho_intervalo,
              });
            }
          }
        }
      } else if (res.status === 410 || res.status === 404) {
        set({ isActive: false });
      }
    } catch (e) {
      console.warn('Erro ao enviar heartbeat de estudo:', e);
    }
  },

  tick: () => {
    const { isActive, isPaused, duracaoSegundos } = get();
    if (!isActive || isPaused) return;

    const novaDuracao = duracaoSegundos + 1;

    set((state) => ({
      duracaoSegundos: novaDuracao,
      tempoEstudoHoje: state.tempoEstudoHoje + 1,
      tempoEstudoTotal: state.tempoEstudoTotal + 1,
    }));
  },

  pauseSession: () => set({ isPaused: true }),
  resumeSession: () => set({ isPaused: false }),

  stopSession: async () => {
    try {
      await fetch('/api/study-sessions/stop', { method: 'POST' });
    } catch (e) {
      console.warn('Erro ao finalizar sessão:', e);
    }
    set({ isActive: false, isPaused: false, sessionId: null });
  },
}));
