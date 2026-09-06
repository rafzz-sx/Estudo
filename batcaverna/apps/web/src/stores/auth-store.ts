import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Tipo do usuário no client ───────────────────────────────
interface AuthUser {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  email_verified: boolean;
  avatar_url: string | null;
  banner_url: string | null;
  banner_tipo?: 'imagem' | 'gif' | 'video' | null;
  bio: string | null;
  role: 'user' | 'admin';
  xp_total: number;
  nivel_atual: number;
  streak_dias: number;
  maior_combo_pessoal: number;
  // Combo persistido no banco: sobrevive à troca de página e ao refresh.
  combo_atual?: number;
  maior_streak?: number;
  questoes_respondidas?: number;
  total_acertos?: number;
  taxa_acerto?: number;
  tempo_total_estudo?: number;
  sessao_expira_em?: string | null;
  materia_mais_estudada?: {
    nome: string | null;
    emoji: string | null;
    questoes: number;
  } | null;
}

interface AuthState {
  // State
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isLoading: false,
        }),

      setAccessToken: (token) =>
        set({ accessToken: token }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'batcaverna-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// ─── Helper: chamadas autenticadas à API ─────────────────────
// Várias telas disparam requisições em paralelo. Sem esta trava, um token
// expirado provocava N chamadas simultâneas a /api/auth/refresh — e as
// perdedoras da corrida recebiam "refresh token inválido" e deslogavam o
// usuário no meio do estudo.
let refreshEmAndamento: Promise<string | null> | null = null;

async function renovarToken(): Promise<string | null> {
  if (refreshEmAndamento) return refreshEmAndamento;

  refreshEmAndamento = (async () => {
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
    if (!refreshToken) return null;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        logout();
        return null;
      }

      const json = await res.json();
      const novoToken: string | undefined = json?.data?.access_token;
      if (!novoToken) {
        logout();
        return null;
      }

      setAccessToken(novoToken);
      return novoToken;
    } catch {
      // Falha de rede não deve deslogar: pode ser oscilação momentânea.
      return null;
    } finally {
      // Libera a trava no próximo tick, para que chamadas que chegaram
      // durante o refresh reaproveitem o resultado.
      setTimeout(() => {
        refreshEmAndamento = null;
      }, 0);
    }
  })();

  return refreshEmAndamento;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const enviar = (accessToken: string | null) => {
    const headers = new Headers(options.headers || {});
    // Só declara JSON quando há corpo — em GET/DELETE o header é ruído.
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    return fetch(url, { ...options, headers, credentials: 'same-origin' });
  };

  const response = await enviar(useAuthStore.getState().accessToken);
  if (response.status !== 401) return response;

  const novoToken = await renovarToken();
  if (!novoToken) return response;

  return enviar(novoToken);
}
