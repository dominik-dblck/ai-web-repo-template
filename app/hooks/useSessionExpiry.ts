'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

type SessionExpiryStatus = 'active' | 'warning' | 'expired';

interface SessionExpiryState {
  readonly status: SessionExpiryStatus;
  readonly warningSecondsLeft: number | null;
  readonly totalWarningSeconds: number;
}

export const SESSION_EXPIRY_CONSTANTS = {
  WARNING_BEFORE_MS: 30_000,
  SKEW_MS: 5_000,
  COUNTDOWN_INTERVAL_MS: 1_000,
  ACTIVITY_DEBOUNCE_MS: 60_000,
} as const;

function parseExpiresMs(expires: string | undefined): number | null {
  if (!expires) return null;
  const ms = new Date(expires).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function computeSecondsLeft(expiresMs: number | null): number | null {
  if (expiresMs == null) return null;
  const remaining = Math.max(0, Math.ceil((expiresMs - Date.now()) / 1000));
  return remaining > 0 ? remaining : null;
}

export function useSessionExpiry(): SessionExpiryState {
  const { data: session, status: sessionStatus, update } = useSession();

  const totalWarningSeconds = SESSION_EXPIRY_CONSTANTS.WARNING_BEFORE_MS / 1000;

  const [state, setState] = useState<SessionExpiryState>({
    status: 'active',
    warningSecondsLeft: null,
    totalWarningSeconds,
  });

  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiredTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const expiresRef = useRef<number | null>(null);
  const isOfflineRef = useRef(false);
  const prevSessionStatusRef = useRef<
    'loading' | 'authenticated' | 'unauthenticated' | null
  >(null);
  const wasAuthenticatedRef = useRef(false);
  const lastActivityRefreshRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (warningTimeoutRef.current != null) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (expiredTimeoutRef.current != null) {
      clearTimeout(expiredTimeoutRef.current);
      expiredTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current != null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownIntervalRef.current != null) {
      clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = setInterval(() => {
      const secs = computeSecondsLeft(expiresRef.current);
      if (secs == null || secs <= 0) {
        if (countdownIntervalRef.current != null) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        return;
      }
      setState((prev) => ({
        ...prev,
        status: 'warning',
        warningSecondsLeft: Math.min(secs, totalWarningSeconds),
      }));
    }, SESSION_EXPIRY_CONSTANTS.COUNTDOWN_INTERVAL_MS);
  }, [totalWarningSeconds]);

  const checkAndSetStatus = useCallback(() => {
    const expiresMs = expiresRef.current;
    if (expiresMs == null) return;
    if (isOfflineRef.current) return;

    const now = Date.now();
    const { SKEW_MS, WARNING_BEFORE_MS } = SESSION_EXPIRY_CONSTANTS;

    if (now >= expiresMs - SKEW_MS) {
      clearAllTimers();
      setState((prev) => ({
        ...prev,
        status: 'expired',
        warningSecondsLeft: null,
      }));
      return;
    }

    if (now >= expiresMs - WARNING_BEFORE_MS) {
      const secs = computeSecondsLeft(expiresMs);
      setState((prev) => ({
        ...prev,
        status: 'warning',
        warningSecondsLeft: secs ? Math.min(secs, totalWarningSeconds) : null,
      }));
      startCountdown();
    }
  }, [clearAllTimers, startCountdown, totalWarningSeconds]);

  const scheduleTimers = useCallback(
    (expiresMs: number) => {
      clearAllTimers();
      expiresRef.current = expiresMs;

      const now = Date.now();
      const { SKEW_MS, WARNING_BEFORE_MS } = SESSION_EXPIRY_CONSTANTS;

      const expiredDelay = expiresMs - SKEW_MS - now;
      const warningDelay = expiresMs - WARNING_BEFORE_MS - now;

      if (expiredDelay <= 0) {
        if (!isOfflineRef.current) {
          setState((prev) => ({
            ...prev,
            status: 'expired',
            warningSecondsLeft: null,
          }));
        }
        return;
      }

      if (warningDelay <= 0) {
        if (!isOfflineRef.current) {
          const secs = computeSecondsLeft(expiresMs);
          setState((prev) => ({
            ...prev,
            status: 'warning',
            warningSecondsLeft: secs
              ? Math.min(secs, totalWarningSeconds)
              : null,
          }));
          startCountdown();
        }
      } else {
        setState((prev) => ({
          ...prev,
          status: 'active',
          warningSecondsLeft: null,
        }));

        warningTimeoutRef.current = setTimeout(() => {
          warningTimeoutRef.current = null;
          if (isOfflineRef.current) return;
          const secs = computeSecondsLeft(expiresMs);
          setState((prev) => ({
            ...prev,
            status: 'warning',
            warningSecondsLeft: secs
              ? Math.min(secs, totalWarningSeconds)
              : null,
          }));
          startCountdown();
        }, warningDelay);
      }

      expiredTimeoutRef.current = setTimeout(() => {
        expiredTimeoutRef.current = null;
        if (isOfflineRef.current) return;
        clearAllTimers();
        setState((prev) => ({
          ...prev,
          status: 'expired',
          warningSecondsLeft: null,
        }));
      }, expiredDelay);
    },
    [clearAllTimers, startCountdown, totalWarningSeconds],
  );

  const autoExtend = useCallback(() => {
    const now = Date.now();
    if (
      now - lastActivityRefreshRef.current <
      SESSION_EXPIRY_CONSTANTS.ACTIVITY_DEBOUNCE_MS
    ) {
      return;
    }
    lastActivityRefreshRef.current = now;
    update();
  }, [update]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;

    const events = [
      'click',
      'keydown',
      'scroll',
      'touchstart',
      'mousemove',
    ] as const;
    events.forEach((e) =>
      window.addEventListener(e, autoExtend, { passive: true }),
    );

    return () => {
      events.forEach((e) => window.removeEventListener(e, autoExtend));
    };
  }, [sessionStatus, autoExtend]);

  useEffect(() => {
    const prev = prevSessionStatusRef.current;
    prevSessionStatusRef.current = sessionStatus;

    if (sessionStatus === 'authenticated') {
      wasAuthenticatedRef.current = true;

      const expiresMs = parseExpiresMs(session?.expires);
      if (expiresMs == null) {
        setState((prev) => ({
          ...prev,
          status: 'expired',
          warningSecondsLeft: null,
        }));
        return;
      }

      scheduleTimers(expiresMs);
    }

    if (
      sessionStatus === 'unauthenticated' &&
      prev === 'authenticated' &&
      wasAuthenticatedRef.current
    ) {
      clearAllTimers();
      expiresRef.current = null;
      setState((prev) => ({
        ...prev,
        status: 'expired',
        warningSecondsLeft: null,
      }));
    }
  }, [sessionStatus, session?.expires, scheduleTimers, clearAllTimers]);

  useEffect(() => {
    if (sessionStatus !== 'authenticated') return;

    const onWakeUp = () => checkAndSetStatus();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') checkAndSetStatus();
    };

    window.addEventListener('focus', onWakeUp);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onWakeUp);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [sessionStatus, checkAndSetStatus]);

  useEffect(() => {
    const onOffline = () => {
      isOfflineRef.current = true;
    };
    const onOnline = () => {
      isOfflineRef.current = false;
      checkAndSetStatus();
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [checkAndSetStatus]);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return state;
}
