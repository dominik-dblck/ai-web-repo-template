'use client';

import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { getDesignTokens } from './themePrimitives';
import {
  inputsCustomizations,
  dataDisplayCustomizations,
  feedbackCustomizations,
  navigationCustomizations,
  surfacesCustomizations,
} from './customizations';

export function buildTheme(mode: 'light' | 'dark') {
  return responsiveFontSizes(
    createTheme({
      ...getDesignTokens(mode),
      components: {
        ...inputsCustomizations,
        ...dataDisplayCustomizations,
        ...feedbackCustomizations,
        ...navigationCustomizations,
        ...surfacesCustomizations,
      },
    }),
  );
}

const theme = buildTheme('light');
export default theme;
