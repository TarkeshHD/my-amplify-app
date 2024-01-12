import { styled } from '@mui/material';
import SimpleBar from 'simplebar-react';

export const Scrollbar = styled(SimpleBar)(() => ({
  '& .simplebar-placeholder': { height: 'auto !important' },
}));
