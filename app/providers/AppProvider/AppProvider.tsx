'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@/app/providers/QueryClientProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { NotificationProvider } from '@/app/providers/NotificationProvider';
import { DrawerProvider } from '@/app/components/molecules/Drawer';
import { Drawer } from '@/app/components/molecules/Drawer';
import { DialogProvider } from '@/app/components/molecules/Dialog';
import { Dialog } from '@/app/components/molecules/Dialog';
import { AuthProvider } from '@/app/providers/AuthProvider';

export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider>
      <ThemeProvider>
        <NotificationProvider>
          <DialogProvider>
            <DrawerProvider>
              <AuthProvider>
                {children}
                <Drawer />
                <Dialog />
              </AuthProvider>
            </DrawerProvider>
          </DialogProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
