import { styled } from '@mui/material/styles';
import { lazy } from 'react';

const ApexChart = lazy(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => null,
});

export const Chart = styled(ApexChart)``;
