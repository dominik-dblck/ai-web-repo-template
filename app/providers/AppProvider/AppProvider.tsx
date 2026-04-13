'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { NotificationProvider } from '@/app/providers/NotificationProvider';
import { DrawerProvider } from '@/app/components/molecules/Drawer';
import { Drawer } from '@/app/components/molecules/Drawer';
import { DialogProvider } from '@/app/components/molecules/Dialog';
import { Dialog } from '@/app/components/molecules/Dialog';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider>
      <ThemeProvider>
        <NotificationProvider>
          <DialogProvider>
            <DrawerProvider>
              {/* Add providers here as the app grows: */}
              {/* <AuthProvider> */}
              {children}
              <Drawer />
              <Dialog />
            </DrawerProvider>
          </DialogProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
