'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) return <div className="p-2 rounded-xl bg-surface-2 border border-border-1 w-8 h-8" />;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-surface-2 border border-border-1 text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-all group flex items-center justify-center shadow-lg"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4">
        {/* Sun Icon (Visible in Light Mode) */}
        <Sun
          size={16}
          className={`absolute inset-0 transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 scale-100 opacity-100 text-accent-orange' : 'rotate-90 scale-0 opacity-0'}`}
        />
        {/* Moon Icon (Visible in Dark Mode) */}
        <Moon
          size={16}
          className={`absolute inset-0 transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100 text-accent-blue' : '-rotate-90 scale-0 opacity-0'}`}
        />
      </div>
    </button>
  );
}
