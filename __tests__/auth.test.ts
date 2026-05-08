import { describe, it, expect, vi, beforeAll } from 'vitest';

let capturedConfig: Record<string, unknown> | undefined;

vi.mock('next-auth', () => ({
  default: vi.fn((config: Record<string, unknown>) => {
    capturedConfig = config;
    return { handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() };
  }),
}));

vi.mock('next-auth/providers/google', () => ({
  default: vi.fn((opts: Record<string, unknown>) => ({
    id: 'google',
    ...opts,
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getConfig = () => capturedConfig as any;

describe('auth.ts callbacks', () => {
  beforeAll(async () => {
    await import('../auth');
  });

  describe('signIn callback', () => {
    it('rejects profile without email', () => {
      const config = getConfig();
      const result = config.callbacks.signIn({
        user: {},
        profile: {},
        account: { provider: 'google' },
      });
      expect(result).toBe(false);
    });

    it('rejects non-@deblock.com email', () => {
      const config = getConfig();
      const result = config.callbacks.signIn({
        user: {},
        profile: { email: 'someone@gmail.com' },
        account: { provider: 'google' },
      });
      expect(result).toBe(false);
    });

    it('rejects @deblock.com email not in allowlist', () => {
      const config = getConfig();
      const result = config.callbacks.signIn({
        user: {},
        profile: { email: 'unknown@deblock.com' },
        account: { provider: 'google' },
      });
      expect(result).toBe(false);
    });

    it('accepts allowed user', () => {
      const config = getConfig();
      const result = config.callbacks.signIn({
        user: {},
        profile: { email: 'dominik@deblock.com' },
        account: { provider: 'google' },
      });
      expect(result).toBe(true);
    });

    it('rejects when profile is undefined', () => {
      const config = getConfig();
      const result = config.callbacks.signIn({
        user: { email: 'dominik@deblock.com' },
        profile: undefined,
        account: { provider: 'google' },
      });
      expect(result).toBe(false);
    });
  });

  describe('jwt callback', () => {
    it('sets admin role for dominik', () => {
      const config = getConfig();
      const token = config.callbacks.jwt({
        token: {},
        profile: { email: 'dominik@deblock.com' },
      });
      expect(token.role).toBe('admin');
    });

    it('sets operator role for marcin', () => {
      const config = getConfig();
      const token = config.callbacks.jwt({
        token: {},
        profile: { email: 'marcin@deblock.com' },
      });
      expect(token.role).toBe('operator');
    });

    it('does not set role when profile absent', () => {
      const config = getConfig();
      const token = config.callbacks.jwt({
        token: {},
        profile: undefined,
      });
      expect(token.role).toBeUndefined();
    });

    it('preserves existing token role on subsequent requests', () => {
      const config = getConfig();
      const token = config.callbacks.jwt({
        token: { role: 'admin' },
        profile: undefined,
      });
      expect(token.role).toBe('admin');
    });
  });

  describe('session callback', () => {
    it('passes role from token to session', () => {
      const config = getConfig();
      const session = {
        user: { name: 'Test', email: 'test@deblock.com' },
        expires: '',
      };
      const result = config.callbacks.session({
        session,
        token: { role: 'operator' },
      });
      expect(result.user.role).toBe('operator');
    });

    it('sets maxAge on session', () => {
      const config = getConfig();
      const session = {
        user: { name: 'Test', email: 'test@deblock.com' },
        expires: '',
      };
      const result = config.callbacks.session({
        session,
        token: { role: 'admin' },
      });
      expect(result.maxAge).toBe(3600);
    });
  });

  describe('redirect callback', () => {
    it('allows same-origin redirect', () => {
      const config = getConfig();
      const result = config.callbacks.redirect({
        url: 'http://localhost:3000/dashboard',
        baseUrl: 'http://localhost:3000',
      });
      expect(result).toBe('http://localhost:3000/dashboard');
    });

    it('prevents open redirect', () => {
      const config = getConfig();
      const result = config.callbacks.redirect({
        url: 'https://evil.com',
        baseUrl: 'http://localhost:3000',
      });
      expect(result).toBe('http://localhost:3000');
    });
  });
});
