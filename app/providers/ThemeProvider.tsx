'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { buildTheme } from '../styles/theme';

type ColorMode = 'light' | 'dark';

interface ColorModeContextValue {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const STORAGE_KEY = 'ai-repo-template-color-mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ColorMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
    }
    setMounted(true);
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [mode],
  );

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider>
      <ColorModeContext.Provider value={colorMode}>
        <MUIThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          {mounted ? children : null}
        </MUIThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
