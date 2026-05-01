'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('default');

  // Sync theme when user logs in
  useEffect(() => {
    if (user) {
        // Fetch settings from API
        fetch('/api/auth/me') // Assuming settings are included or we have a specific endpoint
        .then(res => res.json())
        .then(data => {
            if (data.settings?.theme) {
                applyTheme(data.settings.theme as Theme);
            }
        }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && THEMES.find(t => t.id === savedTheme)) {
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    applyTheme(newTheme);
    
    // Sync to backend if logged in
    if (user) {
        try {
            await fetch('/api/auth/me/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme }),
            });
        } catch (error) {
            console.error('Failed to sync theme', error);
        }
    }
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
