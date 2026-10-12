import { create } from 'zustand';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  unreadCount: number;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  setUnreadCount: (count: number) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  getRole: () => UserRole;
}

const STORAGE_KEY_USER = 'campusgrid_user';
const STORAGE_KEY_TOKEN = 'campusgrid_token';

// Safely retrieve initial cached auth from localStorage
function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInitialToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  unreadCount: 0,

  setAuth: (user: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
    }
    set({ user, token });
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
    set({ user });
  },

  setUnreadCount: (unreadCount: number) => {
    set({ unreadCount });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem('campuslink_user');
        localStorage.removeItem('campuslink_token');
        sessionStorage.clear();
      } catch {
        // ignore
      }
      set({ user: null, token: null, unreadCount: 0 });
      window.location.href = '/login?logged_out=1';
    } else {
      set({ user: null, token: null, unreadCount: 0 });
    }
  },

  isAuthenticated: () => {
    return !!get().token;
  },

  getRole: () => {
    return get().user?.role || 'student';
  },
}));
