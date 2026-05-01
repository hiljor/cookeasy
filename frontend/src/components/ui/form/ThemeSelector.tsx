'use client';

import React from 'react';
import { useTheme, THEMES } from '@/context/ThemeContext';
import { Card, CardContent } from '../layout/Card';
import { Button } from './Button';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
            theme === t.id ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'
          } bg-[var(--color-card)] hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-6 h-6 rounded-full" 
              style={{ backgroundColor: t.color }} 
            />
            <span className="font-medium text-[var(--color-foreground)]">{t.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
};
