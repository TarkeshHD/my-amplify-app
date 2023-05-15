import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import { Button } from '@mui/material';
import { ThemeProvider } from '@emotion/react';

import { createTheme } from './theme';
import Router from './routes/Router';
import { AuthProvider } from './context/JWTContext';

function App() {
  const [count, setCount] = useState(0);
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default App;
