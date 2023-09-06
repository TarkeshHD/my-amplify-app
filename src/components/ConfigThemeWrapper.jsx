import { ThemeProvider } from '@emotion/react';

import React, { useContext } from 'react';
import { ConfigContext } from '../context/ConfigurationContext';
import { useConfig } from '../hooks/useConfig';
import { createTheme } from '../theme';

const ConfigThemeWrapper = ({ children }) => {
  const theme = createTheme();
  const config = useConfig();
  const { data } = config;

  if (data?.clientName !== 'AutovrseTest') {
    theme.palette.primary = data?.theme?.palette?.primary;
  }

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ConfigThemeWrapper;
