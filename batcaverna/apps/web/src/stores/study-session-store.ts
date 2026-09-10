import { create } from 'zustand';
import { fetchWithAuth, useAuthStore } from './auth-store';
import { calcularNivel } from '@batcaverna/utils';

interface StudySessionState {
  isActive: boolean;
  isPaused: boolean;
  isManuallyPaused: boolean;
  sessionId: string | null;
  duracaoSegundos: number;
  tempoEstudoHoje: number;
  tempoEstudoTotal: number;
  xpGanhoNaSessao: number;
  multiplicador: number;
  isInitializing: boolean;

  // Actions
  initSession: () => Promise<void>;
  sendHeartbeat: (opcoes?: { keepalive?: boolean; forcar?: boolean }) => Promise<void>;
  pauseSession: (manual?: boolean) => void;
  resumeSession: () => void;
  stopSession: () => Promise<void>;
  tick: () => void;
}

/**
 * Última duração já confirmada ao servidor.
 *
 * O heartbeat disparava a cada 30 s mesmo com a aba escondida — e com a aba
 * escondida o `tick` não anda, então o valor era idêntico ao anterior. Eram
 * ~2.880 requisições por dia por aluno que não mudavam nada no banco. Fica
 * fora do estado do zustand de propósito: é detalhe de transporte, não algo
 * que a interface precise observar.
 */
let ultimaDuracaoEnviada = -1;

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
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const hr = h % 24;
    return hr > 0 ? `${d}d ${hr}h` : `${d}d`;
  }
  if (h > 0) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  return `${m}min`;
}

export const useStudySessionStore = create<StudySessionState>()((set, get) => ({
  isActive: false,
  isPaused: false,
  isManuallyPaused: false,
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
    // Sessão nova (ou adotada) recomeça a contagem do que já foi sincronizado.
    ultimaDuracaoEnviada = -1;

    try {
      // 1. Consultar status atual da sessão no Supabase
      const statusRes = await fetchWithAuth('/api/study-sessions/status');
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
              isPaused: false,
              isManuallyPaused: false,
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
      const startRes = await fetchWithAuth('/api/study-sessions/start', {
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
            isManuallyPaused: false,
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

  sendHeartbeat: async (opcoes) => {
    const { isActive, duracaoSegundos } = get();
    if (!isActive) return;

    // Nada andou desde o último envio (aba escondida, ou pausada): não há o
    // que sincronizar. `forcar` é para a saída da página, onde vale garantir
    // que os últimos segundos cheguem.
    if (!opcoes?.forcar && duracaoSegundos === ultimaDuracaoEnviada) return;
    ultimaDuracaoEnviada = duracaoSegundos;

    try {
      const res = await fetchWithAuth('/api/study-sessions/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `keepalive` deixa a requisição terminar mesmo com a aba fechando —
        // sem isso o navegador a cancela e o tempo do último intervalo some.
        keepalive: opcoes?.keepalive === true,
        body: JSON.stringify({ duracao_segundos: duracaoSegundos }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const {
            xp_ganho_total_sessao,
            multiplicador,
            xp_ganho_intervalo,
            // Vindos do servidor a partir da 2.1.0: são a verdade.
            xp_total: xpTotalServidor,
            nivel: nivelServidor,
            subiu_nivel: subiuNivelServidor,
          } = data.data;

          // Atualizar apenas métricas de gamificação sem alterar os segundos da tela
          set({
            xpGanhoNaSessao: xp_ganho_total_sessao,
            multiplicador,
          });

          // Se ganhou XP na sessão, atualizar auth store imediatamente e disparar toast
          if (xp_ganho_intervalo > 0) {
            const authUser = useAuthStore.getState().user;
            if (authUser) {
              const antigoXp = authUser.xp_total || 0;
              const nivelAntigo = authUser.nivel_atual || 1;

              // Preferimos SEMPRE o total que o servidor acabou de gravar.
              // Somar no cliente dessincroniza quando o aluno tem duas abas
              // abertas ou quando um heartbeat se perde — e era assim que o
              // XP "sumia" ao trocar de página.
              const novoXp = xpTotalServidor ?? antigoXp + xp_ganho_intervalo;
              const nivelInfo = nivelServidor ?? calcularNivel(novoXp);
              const subiu = subiuNivelServidor ?? nivelInfo.nivel > nivelAntigo;

              useAuthStore.getState().updateUser({
                xp_total: novoXp,
                nivel_atual: nivelInfo.nivel,
              });

              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("batcaverna_xp_ganho", {
                    detail: {
                      xp: xp_ganho_intervalo,
                      totalXp: novoXp,
                      motivo: "Dedicação de estudo contínuo na BatCaverna! ⚡",
                    },
                  })
                );

                if (subiu) {
                  window.dispatchEvent(
                    new CustomEvent("batcaverna_level_up", {
                      detail: {
                        novoNivel: nivelInfo.nivel,
                        titulo: nivelInfo.titulo,
                      },
                    })
                  );
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao enviar heartbeat de estudo:', e);
    }
  },

  tick: () => {
    const { isActive, isPaused, duracaoSegundos } = get();
    if (!isActive || isPaused) return;

    // Aba em segundo plano não conta. Sem esta trava, deixar a plataforma
    // aberta enquanto dorme daria 8 horas de "estudo" — e como o servidor
    // aceita a contagem que o cliente manda, isso iria direto para o XP e
    // para o ranking por tempo. O ConviteFeedback já aplica a mesma regra.
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

    const novaDuracao = duracaoSegundos + 1;

    set((state) => ({
      duracaoSegundos: novaDuracao,
      tempoEstudoHoje: state.tempoEstudoHoje + 1,
      tempoEstudoTotal: state.tempoEstudoTotal + 1,
    }));
  },

  pauseSession: (manual = true) => {
    set((state) => ({
      isPaused: true,
      isManuallyPaused: manual ? true : state.isManuallyPaused,
    }));
    // Pausa é fronteira: vale sincronizar mesmo que o valor não tenha mudado.
    get().sendHeartbeat({ forcar: true });
  },

  resumeSession: () => set({ isPaused: false, isManuallyPaused: false }),

  stopSession: async () => {
    // Grava o tempo restante antes de fechar. Reusa o próprio heartbeat em vez
    // de repetir a chamada aqui — era a mesma requisição escrita duas vezes.
    try {
      await get().sendHeartbeat({ forcar: true, keepalive: true });
      await fetchWithAuth('/api/study-sessions/stop', {
        method: 'POST',
        keepalive: true,
      });
    } catch (e) {
      console.warn('Erro ao finalizar sessão:', e);
    }
    ultimaDuracaoEnviada = -1;
    set({ isActive: false, isPaused: false, isManuallyPaused: false, sessionId: null, duracaoSegundos: 0 });
  },
}));
