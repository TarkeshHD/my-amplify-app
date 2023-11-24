import React from 'react';
import { Button } from '@mui/material';

const ExportButton = ({ onClick, variant, children }) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem 0.5rem',
        maxWidth: '120px',
        gap: '0.5rem',
        height: '120px',
        textAlign: 'center',
        borderStyle: 'dashed',
      }}
    >
      {children}
    </Button>
  );
};

export default ExportButton;
