import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import { Button, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@emotion/react';

import { createTheme } from './theme';
import Router from './routes/Router';
import { AuthProvider } from './context/JWTContext';
import reactLogo from './assets/react.svg';

import './App.css';
import { ConfigProvider } from './context/ConfigurationContext';
import ConfigThemeWrapper from './components/ConfigThemeWrapper';

function App() {
  return (
    <HelmetProvider>
      <ConfigProvider>
        <ConfigThemeWrapper>
          <CssBaseline />
          <AuthProvider>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
              style={{ textAlign: 'start' }}
            />
            <Router />
          </AuthProvider>
        </ConfigThemeWrapper>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;
