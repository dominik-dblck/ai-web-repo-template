import type { AllowedUser, UserRole } from '@/app/types/authTypes';

export const ALLOWED_USERS: readonly AllowedUser[] = [
  { email: 'dominik@deblock.com', role: 'admin' },
  { email: 'marcin@deblock.com', role: 'operator' },
  { email: 'mario@deblock.com', role: 'operator' },
  { email: 'guilhem@deblock.com', role: 'operator' },
  { email: 'matias@deblock.com', role: 'operator' },
  { email: 'marcin.blacharski@deblock.com', role: 'operator' },
  { email: 'sergio@deblock.com', role: 'operator' },
  { email: 'bart@deblock.com', role: 'operator' },
  { email: 'sipei@deblock.com', role: 'operator' },
  { email: 'elvis@deblock.com', role: 'operator' },
  { email: 'kamil@deblock.com', role: 'admin' },
] as const;

export function getUserRole(email: string): UserRole | null {
  const user = ALLOWED_USERS.find((u) => u.email === email);
  return user?.role ?? null;
}
