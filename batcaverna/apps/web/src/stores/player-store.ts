import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Player de música global.
 *
 * O elemento <audio> vive num singleton fora do React, e não dentro de um
 * componente. É isso que permite ao aluno navegar entre dashboard, questões
 * e ranking sem a música parar a cada troca de página — se o <audio>
 * estivesse na árvore do React, ele seria desmontado e remontado.
 */

export interface Musica {
  id: string;
  titulo: string;
  artista: string | null;
  album: string | null;
  capa_url: string | null;
  audio_url: string;
  duracao_segundos: number;
  cor_primaria: string | null;
  cor_secundaria: string | null;
}

interface PlayerState {
  fila: Musica[];
  indice: number;
  tocando: boolean;
  posicao: number;
  duracao: number;
  volume: number;
  aleatorio: boolean;
  repetir: 'nao' | 'uma' | 'todas';
  expandido: boolean;
  // Cores extraídas da capa — alimentam o gradiente do Dynamic Island
  corPrimaria: string;
  corSecundaria: string;

  tocarFila: (musicas: Musica[], indiceInicial?: number) => void;
  alternarPlay: () => void;
  proxima: () => void;
  anterior: () => void;
  irPara: (segundos: number) => void;
  definirVolume: (v: number) => void;
  alternarAleatorio: () => void;
  alternarRepetir: () => void;
  definirExpandido: (v: boolean) => void;
  definirCores: (primaria: string, secundaria: string) => void;
  _sincronizar: (posicao: number, duracao: number) => void;
  _aoTerminar: () => void;
  fechar: () => void;
}

// ─── Elemento de áudio singleton ─────────────────────────────
let audio: HTMLAudioElement | null = null;

function obterAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (audio) return audio;

  audio = new Audio();
  audio.preload = 'metadata';

  audio.addEventListener('timeupdate', () => {
    usePlayerStore
      .getState()
      ._sincronizar(audio!.currentTime, audio!.duration || 0);
  });
  audio.addEventListener('loadedmetadata', () => {
    usePlayerStore
      .getState()
      ._sincronizar(audio!.currentTime, audio!.duration || 0);
  });
  audio.addEventListener('ended', () => {
    usePlayerStore.getState()._aoTerminar();
  });
  audio.addEventListener('error', () => {
    // Faixa quebrada não pode travar a fila: pula para a próxima.
    console.warn('Falha ao carregar a faixa; pulando.');
    usePlayerStore.getState().proxima();
  });

  return audio;
}

/** Integração com os controles de mídia do sistema (fone, tela de bloqueio). */
function atualizarMediaSession(musica: Musica) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: musica.titulo,
    artist: musica.artista ?? 'Desconhecido',
    album: musica.album ?? 'BatCaverna',
    artwork: musica.capa_url
      ? [{ src: musica.capa_url, sizes: '512x512', type: 'image/jpeg' }]
      : [],
  });

  const s = usePlayerStore.getState();
  navigator.mediaSession.setActionHandler('play', () => s.alternarPlay());
  navigator.mediaSession.setActionHandler('pause', () => s.alternarPlay());
  navigator.mediaSession.setActionHandler('nexttrack', () => s.proxima());
  navigator.mediaSession.setActionHandler('previoustrack', () => s.anterior());
}

function carregarEtocar(musica: Musica, volume: number) {
  const el = obterAudio();
  if (!el) return;
  el.src = musica.audio_url;
  el.volume = volume;
  el.play().catch(() => {
    // Autoplay bloqueado pelo navegador: fica pausado até o usuário clicar.
    usePlayerStore.setState({ tocando: false });
  });
  atualizarMediaSession(musica);
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      fila: [],
      indice: 0,
      tocando: false,
      posicao: 0,
      duracao: 0,
      volume: 0.8,
      aleatorio: false,
      repetir: 'nao',
      expandido: false,
      corPrimaria: '#F5C518',
      corSecundaria: '#0B0B0F',

      tocarFila: (musicas, indiceInicial = 0) => {
        if (!musicas.length) return;
        const musica = musicas[indiceInicial];
        set({
          fila: musicas,
          indice: indiceInicial,
          tocando: true,
          posicao: 0,
          corPrimaria: musica.cor_primaria ?? '#F5C518',
          corSecundaria: musica.cor_secundaria ?? '#0B0B0F',
        });
        carregarEtocar(musica, get().volume);
      },

      alternarPlay: () => {
        const el = obterAudio();
        if (!el || !get().fila.length) return;

        if (get().tocando) {
          el.pause();
          set({ tocando: false });
        } else {
          el.play().catch(() => undefined);
          set({ tocando: true });
        }
      },

      proxima: () => {
        const { fila, indice, aleatorio, repetir, volume } = get();
        if (!fila.length) return;

        let proximo: number;
        if (aleatorio && fila.length > 1) {
          // Sorteia diferente da atual, para não repetir a mesma faixa.
          do {
            proximo = Math.floor(Math.random() * fila.length);
          } while (proximo === indice);
        } else {
          proximo = indice + 1;
          if (proximo >= fila.length) {
            if (repetir !== 'todas') {
              set({ tocando: false });
              obterAudio()?.pause();
              return;
            }
            proximo = 0;
          }
        }

        const musica = fila[proximo];
        set({
          indice: proximo,
          tocando: true,
          posicao: 0,
          corPrimaria: musica.cor_primaria ?? '#F5C518',
          corSecundaria: musica.cor_secundaria ?? '#0B0B0F',
        });
        carregarEtocar(musica, volume);
      },

      anterior: () => {
        const { fila, indice, posicao, volume } = get();
        if (!fila.length) return;

        const el = obterAudio();
        // Convenção universal de player: nos primeiros 3 segundos, "anterior"
        // volta para a faixa de trás; depois, reinicia a atual.
        if (posicao > 3 && el) {
          el.currentTime = 0;
          set({ posicao: 0 });
          return;
        }

        const anterior = indice - 1 < 0 ? fila.length - 1 : indice - 1;
        const musica = fila[anterior];
        set({
          indice: anterior,
          tocando: true,
          posicao: 0,
          corPrimaria: musica.cor_primaria ?? '#F5C518',
          corSecundaria: musica.cor_secundaria ?? '#0B0B0F',
        });
        carregarEtocar(musica, volume);
      },

      irPara: (segundos) => {
        const el = obterAudio();
        if (!el) return;
        el.currentTime = segundos;
        set({ posicao: segundos });
      },

      definirVolume: (v) => {
        const el = obterAudio();
        if (el) el.volume = v;
        set({ volume: v });
      },

      alternarAleatorio: () => set((s) => ({ aleatorio: !s.aleatorio })),

      alternarRepetir: () =>
        set((s) => ({
          repetir:
            s.repetir === 'nao' ? 'todas' : s.repetir === 'todas' ? 'uma' : 'nao',
        })),

      definirExpandido: (v) => set({ expandido: v }),

      definirCores: (primaria, secundaria) =>
        set({ corPrimaria: primaria, corSecundaria: secundaria }),

      _sincronizar: (posicao, duracao) => set({ posicao, duracao }),

      _aoTerminar: () => {
        const { repetir, volume, fila, indice } = get();
        if (repetir === 'uma') {
          carregarEtocar(fila[indice], volume);
          return;
        }
        get().proxima();
      },

      fechar: () => {
        const el = obterAudio();
        if (el) {
          el.pause();
          el.src = '';
        }
        set({ fila: [], indice: 0, tocando: false, posicao: 0, duracao: 0 });
      },
    }),
    {
      name: 'batcaverna-player',
      // Só volume e preferências persistem. Retomar a fila sozinha ao abrir
      // a plataforma seria intrusivo.
      partialize: (state) => ({
        volume: state.volume,
        aleatorio: state.aleatorio,
        repetir: state.repetir,
      }),
    }
  )
);

/** Formata segundos como "3:42". */
export function formatarTempoMusica(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return '0:00';
  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
