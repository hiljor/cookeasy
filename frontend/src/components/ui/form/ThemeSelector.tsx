'use client';

import React from 'react';
import { useTheme, THEMES } from '@/context/ThemeContext';
import { useTranslations } from 'next-intl';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('Settings.themes');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {THEMES.map((t_info) => (
        <button
          key={t_info.id}
          type="button"
          onClick={() => setTheme(t_info.id)}
          className={`group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
            theme === t_info.id 
              ? 'border-primary ring-2 ring-primary/20' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          {/* Color Preview Stack */}
          <div className="flex h-12 w-full">
            <div 
              className="h-full w-1/3" 
              style={{ backgroundColor: t_info.color }} // Primary
            />
            <div 
              className="h-full w-1/3 border-x border-black/5" 
              style={{ backgroundColor: t_info.id === 'default' ? '#ffffff' : t_info.id === 'midnight' ? '#0f172a' : t_info.id === 'earthy' ? '#fdfaf6' : t_info.id === 'ocean' ? '#f0fdfa' : '#fef7f4' }} // BG
            />
             <div 
              className="h-full w-1/3" 
              style={{ backgroundColor: t_info.id === 'default' ? '#f9f9f9' : t_info.id === 'midnight' ? '#1e293b' : t_info.id === 'earthy' ? '#f5efe8' : t_info.id === 'ocean' ? '#ccfbf1' : '#fde8e0' }} // Card
            />
          </div>
          
          <div className="flex items-center justify-between bg-card p-3">
            <span className="text-xs font-semibold text-foreground truncate">
              {t(t_info.id)}
            </span>
            {theme === t_info.id && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
