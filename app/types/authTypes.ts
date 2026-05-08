import type { DefaultSession } from 'next-auth';

export type UserRole = 'viewer' | 'operator' | 'admin';

export interface AllowedUser {
  readonly email: string;
  readonly role: UserRole;
}

declare module 'next-auth' {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession['user'];
    maxAge: number;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
  }
}
