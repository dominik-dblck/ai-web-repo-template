'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface DrawerContextValue {
  drawerIsOpen: boolean;
  drawerChildren: ReactNode | null;
  setDrawerChildrenAndOpen: (children: ReactNode) => void;
  setDrawerChildren: (children: ReactNode) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
};

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [drawerChildren, setDrawerChildrenState] = useState<ReactNode | null>(
    null,
  );

  const setDrawerChildrenAndOpen = useCallback((content: ReactNode) => {
    setDrawerChildrenState(content);
    requestAnimationFrame(() => setDrawerIsOpen(true));
  }, []);

  const setDrawerChildren = useCallback((content: ReactNode) => {
    setDrawerChildrenState(content);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerIsOpen(false);
    requestAnimationFrame(() => setDrawerChildrenState(null));
  }, []);

  const value = useMemo(
    () => ({
      drawerIsOpen,
      drawerChildren,
      setDrawerChildrenAndOpen,
      setDrawerChildren,
      closeDrawer,
    }),
    [
      drawerIsOpen,
      drawerChildren,
      setDrawerChildrenAndOpen,
      setDrawerChildren,
      closeDrawer,
    ],
  );

  return (
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
};
