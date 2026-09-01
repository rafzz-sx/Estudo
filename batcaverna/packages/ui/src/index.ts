// ============================================================
// @batcaverna/ui — Design Tokens
// Cores, tipografia, espaçamentos, sombras
// Compartilhados entre web (TailwindCSS) e mobile (NativeWind)
// ============================================================

// ─── Tipos Básicos ───────────────────────────────────────────
export type Forca = 'aeronautica' | 'marinha' | 'exercito' | 'enem';

// ─── Paleta de Cores ─────────────────────────────────────────

export const colors = {
  // Fundos base
  background: {
    primary: '#0B0B0F',
    secondary: '#121218',
    tertiary: '#1A1A24',
    card: '#16161E',
    elevated: '#1E1E28',
  },

  // Destaque primário — Amarelo-ouro oficial BatCaverna (#F5C518)
  primary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#F5C518',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Destaque secundário — Amarelo-ouro (holofote)
  secondary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#F5C518',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },

  // Textos
  text: {
    primary: '#F5F5F7',
    secondary: '#A1A1B5',
    muted: '#6B7280',
    disabled: '#4A4A5A',
    inverse: '#0B0B0F',
  },

  // Bordas e separadores
  border: {
    default: '#2A2A35',
    subtle: '#1F1F2B',
    strong: '#3A3A48',
    glow: '#7C3AED',
  },

  // Feedback
  success: {
    default: '#22C55E',
    light: '#4ADE80',
    dark: '#15803D',
  },
  error: {
    default: '#EF4444',
    light: '#F87171',
    dark: '#B91C1C',
  },
  warning: {
    default: '#F59E0B',
    light: '#FBBF24',
    dark: '#B45309',
  },
  info: {
    default: '#3B82F6',
    light: '#60A5FA',
    dark: '#1D4ED8',
  },

  // Ranking
  ranking: {
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// ─── Tipografia ──────────────────────────────────────────────

export const fonts = {
  heading: '"Chakra Petch", "Orbitron", sans-serif',
  body: '"Inter", "Sora", system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace',
} as const;

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem',  // 72px
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// ─── Espaçamentos ────────────────────────────────────────────

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ─── Bordas ──────────────────────────────────────────────────

export const borderRadius = {
  none: '0',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ─── Sombras e Glow ──────────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.3)',

  // Glow effects
  glowPrimary: '0 0 20px rgba(124, 58, 237, 0.4)',
  glowPrimaryStrong: '0 0 30px rgba(124, 58, 237, 0.6)',
  glowSecondary: '0 0 20px rgba(245, 197, 24, 0.4)',
  glowSecondaryStrong: '0 0 30px rgba(245, 197, 24, 0.6)',
  glowSuccess: '0 0 20px rgba(34, 197, 94, 0.4)',
  glowError: '0 0 20px rgba(239, 68, 68, 0.4)',

  // Card hover glow
  cardHover: '0 0 30px rgba(124, 58, 237, 0.3), 0 0 60px rgba(124, 58, 237, 0.1)',
} as const;

// ─── Animações ───────────────────────────────────────────────

export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    verySlow: '800ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
} as const;

// ─── Breakpoints ─────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ─── Z-Index ─────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
  tooltip: 60,
} as const;

// ─── Gamificação — Níveis e XP ───────────────────────────────

export const NIVEIS_GAMIFICACAO = [
  { nivel: 1, titulo: 'Recruta das Sombras', xp_min: 0 },
  { nivel: 2, titulo: 'Aprendiz da Caverna', xp_min: 150 },
  { nivel: 3, titulo: 'Vigia Noturno', xp_min: 400 },
  { nivel: 4, titulo: 'Rastreador de Pistas', xp_min: 750 },
  { nivel: 5, titulo: 'Predador da Noite', xp_min: 1200 },
  { nivel: 6, titulo: 'Estrategista Sombrio', xp_min: 1800 },
  { nivel: 7, titulo: 'Sombra de Gotham', xp_min: 2600 },
  { nivel: 8, titulo: 'Caçador de Questões', xp_min: 3600 },
  { nivel: 9, titulo: 'Guardião da Caverna', xp_min: 4900 },
  { nivel: 10, titulo: 'Lenda em Ascensão', xp_min: 6500 },
  { nivel: 11, titulo: 'O Implacável', xp_min: 8500 },
  { nivel: 12, titulo: 'Protetor Noturno', xp_min: 11000 },
  { nivel: 13, titulo: 'Lenda da Caverna', xp_min: 14000 },
  { nivel: 14, titulo: 'Cavaleiro de Gotham', xp_min: 18000 },
  { nivel: 15, titulo: 'Rei da Batcaverna', xp_min: 23000 },
] as const;

// ─── Concursos — Dados estáticos dos 9 concursos ────────────

export const CONCURSOS_DATA = [
  { sigla: 'EEAR', nome: 'Escola de Especialistas de Aeronáutica', forca: 'aeronautica' as Forca, frase: 'Soldado e Oficial · Português, Matemática e Inglês' },
  { sigla: 'ESA', nome: 'Escola de Sargentos das Armas', forca: 'exercito' as Forca, frase: 'Praças do Exército · Português, Matemática, História e Geografia' },
  { sigla: 'EAM', nome: 'Escola de Aprendizes-Marinheiros', forca: 'marinha' as Forca, frase: 'Praças da Marinha · Nível Fundamental/Médio' },
  { sigla: 'CN', nome: 'Colégio Naval', forca: 'marinha' as Forca, frase: '9º ano → Ensino Médio · Marinha do Brasil' },
  { sigla: 'EPCAR', nome: 'Escola Preparatória de Cadetes do Ar', forca: 'aeronautica' as Forca, frase: '9º ano → Ensino Médio · Força Aérea Brasileira' },
  { sigla: 'EsPCEx', nome: 'Escola Preparatória de Cadetes do Exército', forca: 'exercito' as Forca, frase: 'Oficial do Exército · Todas as disciplinas' },
  { sigla: 'EFOMM', nome: 'Escola de Formação de Oficiais da Marinha Mercante', forca: 'marinha' as Forca, frase: 'Oficial da Marinha Mercante · Banca própria' },
  { sigla: 'IME', nome: 'Instituto Militar de Engenharia', forca: 'exercito' as Forca, frase: 'Oficial de Engenharia · Nível avançado' },
  { sigla: 'ENEM', nome: 'Exame Nacional do Ensino Médio', forca: 'enem' as Forca, frase: '4 áreas + Redação · Questões contextualizadas' },
] as const;
