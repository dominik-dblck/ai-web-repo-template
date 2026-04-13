import { ReactNode } from 'react';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  // Add auth guard here when AuthProvider is implemented
  // e.g., redirect to /login if not authenticated
  return <>{children}</>;
}
