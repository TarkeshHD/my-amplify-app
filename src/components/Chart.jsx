import { styled } from '@mui/material/styles';
import React, { lazy } from 'react';

const ApexChart = lazy(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => null,
});

export const Chart = styled(ApexChart)``;
