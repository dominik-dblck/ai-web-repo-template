'use client';

import { createContext, ReactNode, useCallback, useContext, JSX } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import Alert, { AlertProps } from '@mui/material/Alert';
import { SxProps } from '@mui/material/styles';

interface NotificationMessage {
  id?: string;
  closeId?: string;
  message: ReactNode;
  severity: AlertProps['severity'];
  options?: {
    duration?: number;
    sx?: SxProps;
    icon?: JSX.Element;
    showCloseButton?: boolean;
  };
}

interface NotificationContextType {
  showNotification: (props: NotificationMessage) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

const InnerNotificationProvider = ({ children }: { children: ReactNode }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showNotification = useCallback(
    ({ id, message, severity, options = {}, closeId }: NotificationMessage) => {
      if (closeId) {
        closeSnackbar(closeId);
      }
      enqueueSnackbar(message, {
        key: id,
        variant: severity,
        autoHideDuration: options.duration || 3000,
        content: (key) => (
          <Alert
            ref={undefined}
            variant="filled"
            severity={severity}
            onClose={
              options.showCloseButton ? () => closeSnackbar(key) : undefined
            }
            sx={{ borderColor: 'transparent', ...options.sx }}
            icon={options.icon}
          >
            {message}
          </Alert>
        ),
      });
    },
    [enqueueSnackbar, closeSnackbar],
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <InnerNotificationProvider>{children}</InnerNotificationProvider>
    </SnackbarProvider>
  );
};
