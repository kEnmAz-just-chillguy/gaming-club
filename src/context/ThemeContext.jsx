import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const darkVars = {
  '--bg-primary': '#0d0f1a',
  '--bg-secondary': '#111827',
  '--bg-card': '#1a1f2e',
  '--bg-card-hover': '#1f2640',
  '--sidebar-bg': '#0a0c16',
  '--text-primary': '#f1f5f9',
  '--text-secondary': '#94a3b8',
  '--text-muted': '#64748b',
  '--border': 'rgba(255,255,255,0.07)',
  '--border-accent': 'rgba(124,58,237,0.4)',
  '--shadow': '0 4px 24px rgba(0,0,0,0.4)',
};

const lightVars = {
  '--bg-primary': '#f0f2f8',
  '--bg-secondary': '#ffffff',
  '--bg-card': '#ffffff',
  '--bg-card-hover': '#f8f9fe',
  '--sidebar-bg': '#1e1b4b',
  '--text-primary': '#0f172a',
  '--text-secondary': '#475569',
  '--text-muted': '#94a3b8',
  '--border': 'rgba(0,0,0,0.08)',
  '--border-accent': 'rgba(124,58,237,0.35)',
  '--shadow': '0 4px 24px rgba(0,0,0,0.08)',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('gc-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const vars = isDark ? darkVars : lightVars;
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
    localStorage.setItem('gc-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
