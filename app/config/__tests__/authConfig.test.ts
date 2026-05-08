import { describe, it, expect } from 'vitest';
import { getUserRole, ALLOWED_USERS } from '../authConfig';

describe('authConfig', () => {
  describe('getUserRole', () => {
    it('returns admin for dominik@deblock.com', () => {
      expect(getUserRole('dominik@deblock.com')).toBe('admin');
    });

    it('returns operator for marcin@deblock.com', () => {
      expect(getUserRole('marcin@deblock.com')).toBe('operator');
    });

    it('returns operator for mario@deblock.com', () => {
      expect(getUserRole('mario@deblock.com')).toBe('operator');
    });

    it('returns operator for guilhem@deblock.com', () => {
      expect(getUserRole('guilhem@deblock.com')).toBe('operator');
    });

    it('returns null for unknown @deblock.com email', () => {
      expect(getUserRole('unknown@deblock.com')).toBeNull();
    });

    it('returns null for non-deblock email', () => {
      expect(getUserRole('someone@gmail.com')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getUserRole('')).toBeNull();
    });
  });

  describe('ALLOWED_USERS', () => {
    it('has expected number of users', () => {
      expect(ALLOWED_USERS.length).toBeGreaterThan(0);
    });

    it('every user has email and role', () => {
      for (const user of ALLOWED_USERS) {
        expect(user.email).toMatch(/@deblock\.com$/);
        expect(['viewer', 'operator', 'admin']).toContain(user.role);
      }
    });
  });
});
