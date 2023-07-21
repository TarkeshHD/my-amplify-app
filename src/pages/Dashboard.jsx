import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { AccountCircle, CurrencyRupee, EventAvailable, HourglassEmpty, TrendingUp } from '@mui/icons-material';

import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';

import { DashboardBarChart } from '../sections/dashboard/DashboardBarChart';

import { DashboardTasksProgress } from '../sections/dashboard/DashboardTasksProgress';

import { DashboardPieChart } from '../sections/dashboard/DashboardPieChart';

const now = new Date();

const Page = () => (
  <>
    <Helmet>
      <title>Dashboard | VRse Builder</title>
    </Helmet>

    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title="VR Sessions"
            icon={<EventAvailable />}
            difference={12}
            positive
            sx={{ height: '100%' }}
            value="1570"
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title="Training Hours"
            icon={<HourglassEmpty />}
            iconColor="error.main"
            difference={16}
            positive={false}
            sx={{ height: '100%' }}
            value="65h"
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardTasksProgress
            title="Evaluation Success"
            icon={<TrendingUp />}
            sx={{ height: '100%' }}
            value={75.5}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard title={'Active Users'} icon={<AccountCircle />} sx={{ height: '100%' }} value="78%" />
        </Grid>
        <Grid xs={12} lg={8}>
          <DashboardBarChart
            title="Monthly Sessions"
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
          <DashboardPieChart
            title={'Domain Users'}
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
