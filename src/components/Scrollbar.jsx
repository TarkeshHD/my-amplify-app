import SimpleBar from 'simplebar-react';
import { styled } from '@mui/material';

export const Scrollbar = styled(SimpleBar)(() => ({
  '& .simplebar-placeholder': { height: 'auto !important' },
}));
