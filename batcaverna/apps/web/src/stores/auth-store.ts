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
  bio: string | null;
  role: 'user' | 'admin';
  xp_total: number;
  nivel_atual: number;
  streak_dias: number;
  maior_combo_pessoal: number;
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
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const state = useAuthStore.getState();
  let token = state.accessToken;

  const makeRequest = (accessToken: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers || {}),
      },
    });

  let response = await makeRequest(token);

  // Se 401, tentar refresh
  if (response.status === 401 && state.refreshToken) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: state.refreshToken }),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      const newToken = data.data.access_token;
      state.setAccessToken(newToken);
      // Retry com novo token
      response = await makeRequest(newToken);
    } else {
      // Refresh falhou → logout
      state.logout();
    }
  }

  return response;
}
