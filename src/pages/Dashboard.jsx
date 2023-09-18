import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { AccountCircle, CurrencyRupee, EventAvailable, HourglassEmpty, TrendingUp } from '@mui/icons-material';

import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';

import { DashboardBarChart } from '../sections/dashboard/DashboardBarChart';

import { DashboardTasksProgress } from '../sections/dashboard/DashboardTasksProgress';

import { DashboardPieChart } from '../sections/dashboard/DashboardPieChart';
import { useConfig } from '../hooks/useConfig';

const now = new Date();

const Page = () => {
  const config = useConfig();
  const { data } = config;
  return (
    <>
      <Helmet>
        <title>Dashboard | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} lg={3}>
            <DashboardDiffCard
              title={'Total ' + (data?.labels?.user?.plural || 'Users')}
              icon={<EventAvailable />}
              difference={12}
              positive
              sx={{ height: '100%' }}
              value="1570"
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <DashboardDiffCard
              title="VR Sessions"
              icon={<HourglassEmpty />}
              iconColor="error.main"
              difference={16}
              positive={false}
              sx={{ height: '100%' }}
              value="65h"
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <DashboardDiffCard
              title={(data?.labels?.evaluation?.singular || 'Evaluation') + ' Sessions'}
              icon={<EventAvailable />}
              difference={12}
              positive
              sx={{ height: '100%' }}
              value="158"
            />
          </Grid>
          <Grid xs={12} sm={6} lg={3}>
            <DashboardTasksProgress
              title="Pass Percentage"
              icon={<TrendingUp />}
              sx={{ height: '100%' }}
              value={75.5}
            />
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
              title={(data?.labels?.domain?.singular || 'Domain') + ' ' + (data?.labels?.user?.plural || 'Users')}
              chartSeries={[63, 15, 22]}
              labels={['Domain A', 'Domain B', 'Domain C']}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Page;
