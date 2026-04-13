import { Theme, alpha, Components } from '@mui/material/styles';
import { gray, orange, red, green, brand } from '../themePrimitives';

type SeverityColor = {
  50: string;
  100: string;
  300: string;
  500: string;
  800: string;
  900: string;
};

const severityColors: Record<string, SeverityColor> = {
  warning: {
    50: orange[50],
    100: orange[100],
    300: orange[300],
    500: orange[500],
    800: orange[800],
    900: orange[900],
  },
  error: {
    50: red[50],
    100: red[100],
    300: red[300],
    500: red[500],
    800: red[800],
    900: red[900],
  },
  success: {
    50: green[50],
    100: green[100],
    300: green[300],
    500: green[500],
    800: green[800],
    900: green[900],
  },
  info: {
    50: brand[50],
    100: brand[100],
    300: brand[300],
    500: brand[500],
    800: brand[800],
    900: brand[900],
  },
};

const alertVariants = Object.entries(severityColors).flatMap(
  ([severity, c]) => [
    // Standard — light tinted background
    {
      props: { severity, variant: 'standard' as const },
      style: {
        backgroundColor: c[100],
        border: `1px solid ${alpha(c[300], 0.5)}`,
        '& .MuiAlert-icon': { color: c[500] },
      },
    },
    // Outlined — transparent background, colored border
    {
      props: { severity, variant: 'outlined' as const },
      style: {
        backgroundColor: 'transparent',
        border: `1px solid ${c[300]}`,
        '& .MuiAlert-icon': { color: c[500] },
      },
    },
    // Filled — solid colored background, white text
    {
      props: { severity, variant: 'filled' as const },
      style: {
        backgroundColor: c[500],
        color: '#fff',
        border: 'none',
        '& .MuiAlert-icon': { color: '#fff' },
      },
    },
  ],
);

export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        color: (theme.vars || theme).palette.text.primary,
        variants: [
          ...alertVariants,
          // Dark mode adjustments for standard variant
          ...Object.entries(severityColors).map(([severity, c]) => ({
            props: { severity, variant: 'standard' as const },
            style: theme.applyStyles('dark', {
              backgroundColor: `${alpha(c[900], 0.5)}`,
              border: `1px solid ${alpha(c[800], 0.5)}`,
            }),
          })),
          // Dark mode adjustments for outlined variant
          ...Object.entries(severityColors).map(([severity, c]) => ({
            props: { severity, variant: 'outlined' as const },
            style: theme.applyStyles('dark', {
              backgroundColor: 'transparent',
              border: `1px solid ${alpha(c[500], 0.5)}`,
            }),
          })),
          // Dark mode adjustments for filled variant
          ...Object.entries(severityColors).map(([severity, c]) => ({
            props: { severity, variant: 'filled' as const },
            style: theme.applyStyles('dark', {
              backgroundColor: c[800],
            }),
          })),
        ],
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: gray[200],
        ...theme.applyStyles('dark', {
          backgroundColor: gray[800],
        }),
      }),
    },
  },
};
