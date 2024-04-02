import { ThemeProvider } from '@emotion/react';
import { Button, CssBaseline } from '@mui/material';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer, toast } from 'react-toastify';

import reactLogo from './assets/react.svg';
import { AuthProvider } from './context/JWTContext';
import Router from './routes/Router';
import { createTheme } from './theme';

import './App.css';
import ConfigThemeWrapper from './components/ConfigThemeWrapper';
import { ConfigProvider } from './context/ConfigurationContext';
import { Auth0Provider } from '@auth0/auth0-react';
function App() {
  return (
    <HelmetProvider>
      <ConfigProvider>
        <ConfigThemeWrapper>
          <CssBaseline />
          <Auth0Provider
            domain={import.meta.env.VITE_SSO_OKTA_DOMAIN}
            clientId={import.meta.env.VITE_SSO_OKTA_CLIENT_ID}
            authorizationParams={{
              redirect_uri: `${import.meta.env.VITE_SSO_OKTA_REDIRECT_URI}`,
            }}
          >
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
          </Auth0Provider>
        </ConfigThemeWrapper>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;
