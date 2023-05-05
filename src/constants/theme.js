import { createTheme } from '@mui/material';
import { styled } from '@mui/system';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#AD57FE',
    },
    secondary: {
      main: '#f5f5f5',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '&:not(:focus-visible)': {
            backgroundColor: 'transparent',
            '& input::-webkit-input-placeholder': {
              opacity: 1,
              color: 'rgba(255, 255, 255, 1)',
            },
            '& input::-moz-placeholder': {
              opacity: 1,
              color: 'rgba(0, 0, 0, 0.54)',
            },
            '& input:-ms-input-placeholder': {
              opacity: 1,
              color: 'rgba(0, 0, 0, 0.54)',
            },
            '& input::-ms-input-placeholder': {
              opacity: 1,
              color: 'rgba(0, 0, 0, 0.54)',
            },
            '& input::placeholder': {
              opacity: 1,
              color: 'rgba(0, 0, 0, 0.54)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: 80,
        },
      },
    },
  },
});
