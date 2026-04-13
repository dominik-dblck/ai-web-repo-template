'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';
import { theme } from '@/app/styles/theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AppRouterCacheProvider>
      <MUIThemeProvider theme={theme} disableTransitionOnChange>
        <CssBaseline enableColorScheme />
        {children}
      </MUIThemeProvider>
    </AppRouterCacheProvider>
  );
};
