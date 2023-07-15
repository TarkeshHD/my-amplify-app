import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import { DashboardBudget } from '../sections/dashboard/DashboardBudget';

import { DashboardSales } from '../sections/dashboard/DashboardSales';

import { DashboardTasksProgress } from '../sections/dashboard/DashboardTasksProgress';
import { DashboardTotalCustomers } from '../sections/dashboard/DashboardTotalCustomers';
import { DashboardTotalProfit } from '../sections/dashboard/DashboardTotalProfit';
import { DashboardTraffic } from '../sections/dashboard/DashboardTraffic';

const now = new Date();

const Page = () => (
  <>
    <Helmet>
      <title>Dashboard | VRse Builder</title>
    </Helmet>

    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardBudget difference={12} positive sx={{ height: '100%' }} value="$24k" />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardTotalCustomers difference={16} positive={false} sx={{ height: '100%' }} value="1.6k" />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardTasksProgress sx={{ height: '100%' }} value={75.5} />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardTotalProfit sx={{ height: '100%' }} value="$15k" />
        </Grid>
        <Grid xs={12} lg={8}>
          <DashboardSales
            chartSeries={[
              {
                name: 'This year',
                data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20],
              },
              {
                name: 'Last year',
                data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13],
              },
            ]}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <DashboardTraffic
            chartSeries={[63, 15, 22]}
            labels={['Desktop', 'Tablet', 'Phone']}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    </Container>
  </>
);

export default Page;
