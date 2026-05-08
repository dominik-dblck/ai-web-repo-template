// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SESSION_EXPIRY_CONSTANTS } from '../useSessionExpiry';

const mockUpdate = vi.fn();
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

import { useSessionExpiry } from '../useSessionExpiry';

const MAX_AGE = 600;

function makeSession(expiresInMs: number) {
  return {
    data: {
      expires: new Date(Date.now() + expiresInMs).toISOString(),
      maxAge: MAX_AGE,
    },
    status: 'authenticated' as const,
    update: mockUpdate,
  };
}

function makeWarningSession() {
  const expiresInMs = SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS - 1000;
  return makeSession(expiresInMs);
}

describe('useSessionExpiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: mockUpdate,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('stays active during loading status — no timers scheduled', () => {
    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.status).toBe('active');
    expect(result.current.warningSecondsLeft).toBeNull();

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });

    expect(result.current.status).toBe('active');
  });

  it('stays active when session expires far in the future', () => {
    const maxAgeMs = MAX_AGE * 1000;
    mockUseSession.mockReturnValue(makeSession(maxAgeMs));

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.status).toBe('active');
    expect(result.current.warningSecondsLeft).toBeNull();
  });

  it('returns warning immediately when session expires within WARNING_BEFORE_MS', () => {
    mockUseSession.mockReturnValue(makeWarningSession());

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.status).toBe('warning');
    expect(result.current.warningSecondsLeft).toBeGreaterThan(0);
    expect(result.current.totalWarningSeconds).toBe(
      SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS / 1000,
    );
  });

  it('returns expired when past expiry minus SKEW_MS', () => {
    const pastExpiry = SESSION_EXPIRY_CONSTANTS.SKEW_MS - 1000;
    mockUseSession.mockReturnValue(makeSession(pastExpiry));

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.status).toBe('expired');
    expect(result.current.warningSecondsLeft).toBeNull();
  });

  it('transitions from active to warning when warning timer fires', () => {
    const maxAgeMs = MAX_AGE * 1000;
    mockUseSession.mockReturnValue(makeSession(maxAgeMs));

    const { result } = renderHook(() => useSessionExpiry());
    expect(result.current.status).toBe('active');

    const warningDelay = maxAgeMs - SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS;
    act(() => {
      vi.advanceTimersByTime(warningDelay + 1);
    });

    expect(result.current.status).toBe('warning');
  });

  it('transitions from warning to expired when expiry timer fires', () => {
    mockUseSession.mockReturnValue(makeWarningSession());

    const { result } = renderHook(() => useSessionExpiry());
    expect(result.current.status).toBe('warning');

    const warningMs = SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS - 1000;
    const expiredDelay = warningMs - SESSION_EXPIRY_CONSTANTS.SKEW_MS;
    act(() => {
      vi.advanceTimersByTime(expiredDelay + 1);
    });

    expect(result.current.status).toBe('expired');
    expect(result.current.warningSecondsLeft).toBeNull();
  });

  it('sets expired on authenticated → unauthenticated transition', () => {
    mockUseSession.mockReturnValue(makeWarningSession());
    const { result, rerender } = renderHook(() => useSessionExpiry());
    expect(result.current.status).toBe('warning');

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });
    rerender();

    expect(result.current.status).toBe('expired');
  });

  it('resets on re-authentication', () => {
    mockUseSession.mockReturnValue(makeWarningSession());
    const { result, rerender } = renderHook(() => useSessionExpiry());

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });
    rerender();
    expect(result.current.status).toBe('expired');

    mockUseSession.mockReturnValue(makeWarningSession());
    rerender();
    expect(result.current.status).toBe('warning');
  });

  it('suppresses expiry when offline', () => {
    mockUseSession.mockReturnValue(makeWarningSession());

    const { result } = renderHook(() => useSessionExpiry());
    expect(result.current.status).toBe('warning');

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    const warningMs = SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS - 1000;
    act(() => {
      vi.advanceTimersByTime(warningMs);
    });

    expect(result.current.status).toBe('warning');
  });

  it('detects expiry on online event after being offline', () => {
    mockUseSession.mockReturnValue(makeWarningSession());

    const { result } = renderHook(() => useSessionExpiry());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    const warningMs = SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS - 1000;
    act(() => {
      vi.advanceTimersByTime(warningMs);
    });

    vi.setSystemTime(Date.now() + warningMs);

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.status).toBe('expired');
  });

  it('treats unparseable session.expires as expired', () => {
    mockUseSession.mockReturnValue({
      data: { expires: 'not-a-date', maxAge: MAX_AGE },
      status: 'authenticated',
      update: mockUpdate,
    });

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.status).toBe('expired');
  });

  it('catches expiry on focus after sleep', () => {
    mockUseSession.mockReturnValue(makeWarningSession());

    const { result } = renderHook(() => useSessionExpiry());

    const warningMs = SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS - 1000;
    vi.setSystemTime(Date.now() + warningMs);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(result.current.status).toBe('expired');
  });

  it('countdown decrements warningSecondsLeft every second', () => {
    mockUseSession.mockReturnValue(makeWarningSession());

    const { result } = renderHook(() => useSessionExpiry());

    expect(result.current.status).toBe('warning');
    const initial = result.current.warningSecondsLeft!;
    expect(initial).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.warningSecondsLeft).toBeLessThan(initial);
  });
});
