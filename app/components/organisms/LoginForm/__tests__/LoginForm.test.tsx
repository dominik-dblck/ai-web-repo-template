// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSignIn = vi.fn();
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock('@mui/material/Box', () => ({
  default: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="box" {...props}>
      {children as React.ReactNode}
    </div>
  ),
}));
vi.mock('@mui/material/Button', () => ({
  default: ({
    children,
    onClick,
    disabled,
    ...props
  }: Record<string, unknown>) => (
    <button
      data-testid="signin-button"
      onClick={onClick as () => void}
      disabled={disabled as boolean}
      {...props}
    >
      {children as React.ReactNode}
    </button>
  ),
}));
vi.mock('@mui/material/Typography', () => ({
  default: ({ children, ...props }: Record<string, unknown>) => (
    <span {...props}>{children as React.ReactNode}</span>
  ),
}));
vi.mock('@mui/material/Paper', () => ({
  default: ({ children, ...props }: Record<string, unknown>) => (
    <div data-testid="paper" {...props}>
      {children as React.ReactNode}
    </div>
  ),
}));
vi.mock('@mui/material/Alert', () => ({
  default: ({ children, severity, ...props }: Record<string, unknown>) => (
    <div data-testid={`alert-${severity}`} {...props}>
      {children as React.ReactNode}
    </div>
  ),
}));
vi.mock('@mui/material/CircularProgress', () => ({
  default: () => <span data-testid="loading">Loading...</span>,
}));
vi.mock('@mui/material/SvgIcon', () => ({
  default: ({ children, ...props }: Record<string, unknown>) => (
    <svg {...props}>{children as React.ReactNode}</svg>
  ),
}));

import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it('renders SSO button', () => {
    render(<LoginForm />);
    expect(screen.getByTestId('signin-button')).toBeDefined();
    expect(screen.getByText('Sign in with Google')).toBeDefined();
  });

  it('renders title and description', () => {
    render(<LoginForm />);
    expect(screen.getByText('AI Repo Template')).toBeDefined();
    expect(screen.getByText('Sign in to continue')).toBeDefined();
  });

  it('shows signed-out alert when signedOut=true', () => {
    render(<LoginForm signedOut />);
    expect(screen.getByTestId('alert-info')).toBeDefined();
    expect(screen.getByText('You have been signed out.')).toBeDefined();
  });

  it('does not show signed-out alert by default', () => {
    render(<LoginForm />);
    expect(screen.queryByTestId('alert-info')).toBeNull();
  });

  it('shows error alert when error is set', () => {
    render(<LoginForm error="AccessDenied" />);
    expect(screen.getByTestId('alert-error')).toBeDefined();
    expect(
      screen.getByText(
        'Access denied. Only authorized @deblock.com users can sign in.',
      ),
    ).toBeDefined();
  });

  it('shows session expired warning', () => {
    render(<LoginForm sessionExpired />);
    expect(screen.getByTestId('alert-warning')).toBeDefined();
    expect(
      screen.getByText('Session expired — please sign in again.'),
    ).toBeDefined();
  });

  it('calls signIn with google on button click', () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByTestId('signin-button'));
    expect(mockSignIn).toHaveBeenCalledWith('google', {
      callbackUrl: window.location.href,
    });
  });
});
