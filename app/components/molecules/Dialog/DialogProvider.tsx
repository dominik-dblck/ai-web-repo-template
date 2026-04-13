'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface DialogContextValue {
  dialogIsOpen: boolean;
  dialogChildren: ReactNode | null;
  setDialogChildrenAndOpen: (children: ReactNode) => void;
  setDialogChildren: (children: ReactNode) => void;
  closeDialog: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [dialogChildren, setDialogChildrenState] = useState<ReactNode | null>(
    null,
  );

  const setDialogChildrenAndOpen = useCallback((content: ReactNode) => {
    setDialogChildrenState(content);
    requestAnimationFrame(() => setDialogIsOpen(true));
  }, []);

  const setDialogChildren = useCallback((content: ReactNode) => {
    setDialogChildrenState(content);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogIsOpen(false);
    requestAnimationFrame(() => setDialogChildrenState(null));
  }, []);

  const value = useMemo(
    () => ({
      dialogIsOpen,
      dialogChildren,
      setDialogChildrenAndOpen,
      setDialogChildren,
      closeDialog,
    }),
    [
      dialogIsOpen,
      dialogChildren,
      setDialogChildrenAndOpen,
      setDialogChildren,
      closeDialog,
    ],
  );

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
};
