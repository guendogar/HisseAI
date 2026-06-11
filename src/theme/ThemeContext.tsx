import React, { createContext, useContext, useState, useCallback } from 'react';
import { Colors, ColorScheme } from './colors';
import { Spacing, BorderRadius, Shadows } from './spacing';
import { Typography, FontSizes, FontWeights } from './typography';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  colors: ColorScheme;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  typography: typeof Typography;
  fontSizes: typeof FontSizes;
  fontWeights: typeof FontWeights;
  mode: ThemeMode;
}

const buildTheme = (mode: ThemeMode): Theme => ({
  colors: Colors[mode],
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  typography: Typography,
  fontSizes: FontSizes,
  fontWeights: FontWeights,
  mode,
});

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme('dark'),
  mode: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleTheme = useCallback(() => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: buildTheme(mode), mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
export const useColors = (): ColorScheme => useContext(ThemeContext).theme.colors;
