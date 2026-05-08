'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { LoginFormGoogleIcon } from './components/LoginFormGoogleIcon';

interface LoginFormProps {
  signedOut?: boolean;
  error?: string | null;
  sessionExpired?: boolean;
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'AccessDenied':
      return 'Access denied. Only authorized @deblock.com users can sign in.';
    case 'Configuration':
      return 'SSO is not configured. Contact admin to set up Google OAuth.';
    case 'OAuthAccountNotLinked':
      return 'This email is already linked to another account.';
    default:
      return `Authentication error: ${error}. Please try again.`;
  }
}

export function LoginForm({
  signedOut,
  error,
  sessionExpired,
}: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSSO = () => {
    setLoading(true);
    const callbackUrl =
      typeof window !== 'undefined' ? window.location.href : '/';
    signIn('google', { callbackUrl });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 5,
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        borderRadius: 3,
      }}
    >
      <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
        AI Repo Template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
        Sign in to continue
      </Typography>

      {sessionExpired && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Session expired — please sign in again.
        </Alert>
      )}

      {signedOut && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have been signed out.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(error)}
        </Alert>
      )}

      <Button
        variant="contained"
        size="large"
        color="secondary"
        fullWidth
        disabled={loading}
        onClick={handleGoogleSSO}
        sx={{
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <>
            <LoginFormGoogleIcon />
            Sign in with Google
          </>
        )}
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 3, display: 'block' }}
      >
        Restricted to @deblock.com accounts
      </Typography>
    </Paper>
  );
}
