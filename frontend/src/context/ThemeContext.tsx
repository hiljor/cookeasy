'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'default' | 'midnight' | 'earthy' | 'ocean';

interface ThemeDefinition {
  id: Theme;
  name: string;
  color: string;
}

export const THEMES: ThemeDefinition[] = [
  { id: 'default', name: 'Default', color: '#f97316' },
  { id: 'midnight', name: 'Midnight', color: '#818cf8' },
  { id: 'earthy', name: 'Earthy', color: '#4d7c0f' },
  { id: 'ocean', name: 'Ocean', color: '#0d9488' },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && THEMES.find(t => t.id === savedTheme)) {
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
