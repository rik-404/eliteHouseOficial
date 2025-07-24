'use client';

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { useEffect } from 'react';

// Componente interno para gerenciar o tema
function ThemeManager() {
  const { theme, setTheme } = useNextTheme();

  // Carregar tema salvo ao montar o componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, []);

  // Salvar tema sempre que mudar
  useEffect(() => {
    if (theme) {
      localStorage.setItem('admin-theme', theme);
    }
  }, [theme]);

  return null;
}

export function AdminThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="light"
      storageKey="admin-theme"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
      <ThemeManager />
    </NextThemesProvider>
  );
}
