'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();

  // Sync the class on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`
        relative inline-flex items-center justify-center
        w-10 h-10 rounded-xl
        glass-toggle-btn
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        group
        ${className}
      `}
    >
      {/* Glow ring on hover */}
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none theme-toggle-glow" />

      {/* Icons with rotate transition */}
      <span className="relative flex items-center justify-center w-5 h-5">
        {theme === 'dark' ? (
          <Sun className="h-[18px] w-[18px] text-amber-400 transition-transform duration-500 rotate-0 group-hover:rotate-90" />
        ) : (
          <Moon className="h-[18px] w-[18px] text-indigo-500 transition-transform duration-500 rotate-0 group-hover:-rotate-12" />
        )}
      </span>
    </button>
  );
}
