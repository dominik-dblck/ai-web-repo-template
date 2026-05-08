'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSessionExpiry } from '@/app/hooks/useSessionExpiry';
import { LoginForm } from '@/app/components/organisms/LoginForm';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

function AuthGuard({ children }: { children: ReactNode }) {
  const { status: sessionStatus } = useSession();
  const { status, warningSecondsLeft, totalWarningSeconds } =
    useSessionExpiry();
  const wasAuthenticatedRef = useRef(false);
  const initializedRef = useRef(false);

  if (sessionStatus === 'authenticated') {
    wasAuthenticatedRef.current = true;
    initializedRef.current = true;
  }

  const signedOut =
    sessionStatus === 'unauthenticated' && wasAuthenticatedRef.current;

  const progress = warningSecondsLeft
    ? Math.min(100, (warningSecondsLeft / totalWarningSeconds) * 100)
    : 0;

  if (sessionStatus === 'loading' && !initializedRef.current) {
    return null;
  }

  if (sessionStatus === 'unauthenticated' || status === 'expired') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <LoginForm
          sessionExpired={status === 'expired'}
          signedOut={signedOut && status !== 'expired'}
        />
      </Box>
    );
  }

  return (
    <>
      {children}
      <Snackbar
        open={status === 'warning'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Box
          sx={{
            alignItems: 'center',
            minWidth: 320,
            borderRadius: 2,
            py: 1.5,
            px: 2.5,
            bgcolor: 'background.paper',
            boxShadow: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              width: '100%',
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Session expiring
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Move your mouse to stay signed in
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                ml: 'auto',
              }}
            >
              <CircularProgress
                variant="determinate"
                value={progress}
                size={40}
                thickness={3.5}
                sx={{ color: 'warning.main' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1,
                  }}
                >
                  {warningSecondsLeft ? formatTime(warningSecondsLeft) : ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Snackbar>
    </>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider refetchInterval={300} refetchOnWindowFocus>
      <AuthGuard>{children}</AuthGuard>
    </SessionProvider>
  );
}
