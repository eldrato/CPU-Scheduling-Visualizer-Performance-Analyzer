import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'projector';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('cpu_visualizer_theme') as Theme;
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('cpu_visualizer_theme', theme);
    const root = document.documentElement;

    root.classList.remove('dark', 'projector-mode');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'projector') {
      root.classList.add('projector-mode');
    }
  }, [theme]);

  return { theme, setTheme };
}
