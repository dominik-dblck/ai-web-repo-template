'use client';

import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export const QueryClientProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};
