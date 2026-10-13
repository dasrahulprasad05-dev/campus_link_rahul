import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'campusgrid_theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(next);
      document.documentElement.setAttribute('data-theme', next);
    }
    set({ theme: next });
  },

  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
    set({ theme });
  },
}));
