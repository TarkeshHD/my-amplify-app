import { CheckCircle, Download, EventAvailable, People } from '@mui/icons-material';
import { Box, Button, CircularProgress, Container, Grid, Stack, SvgIcon, Typography, Skeleton } from '@mui/material';
import { isEmpty, isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useConfig } from '../hooks/useConfig';
import { useSharedData } from '../hooks/useSharedData';
import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';
import { TrainingsTable } from '../sections/trainings/TrainingsTable';
import axios from '../utils/axios';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);
  const [totalTrainings, setTotalTrainings] = useState(0);

  const config = useConfig();
  const { data: configData } = config;
  const { loading: sharedDataLoading } = useSharedData();

  const [trainingAnalytics, setTrainingAnalytics] = useState({
    totalTrainings: 0,
    totalUserAttempts: 0,
    incompletionRate: 0,
    pendingTrainings: 0,
  });
  const [isExporting, setIsExporting] = useState(false);

  const getTrainings = async (params) => {
    try {
      setFetchingData(true);
      const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
      const storedPageSize = storedSizes?.trainings || 10;
      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? storedPageSize,
        sort: !isEmpty(params?.sorting) ? JSON.stringify(params?.sorting) : JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters),
      };

      const response = await axios.get('/training/', { params: queryParams });
      console.log('response', response?.data);
      setData(response?.data?.trainings.docs);
      setTotalTrainings(response?.data?.trainings.totalDocs);
      setTrainingAnalytics(response?.data?.stats);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const exportBtnFalse = () => {
    setExportBtnClicked(false);
    setIsExporting(false);
  };

  useEffect(() => {
    getTrainings();
  }, []);

  const updateAnalytic = (analytics) => {
    setTrainingAnalytics((prevState) => {
      if (!isEqual(analytics, prevState)) {
        // Update the state if they are different
        return { ...analytics };
      }
      // Return the previous state if nothing has changed
      return prevState;
    });
  };

  const handleRefresh = (tableState) => {
    getTrainings(tableState);
  };

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.training?.singular || 'Training'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        {sharedDataLoading ? (
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" spacing={4}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="rectangular" width={100} height={36} />
              </Stack>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  {[1, 2, 3].map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item}>
                      <Skeleton
                        variant="rounded"
                        height={140}
                        sx={{
                          bgcolor: 'background.neutral',
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
              <Skeleton
                variant="rounded"
                height={400}
                sx={{
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                }}
              />
            </Stack>
          </Box>
        ) : (
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{configData?.labels?.training?.singular || 'Training'}</Typography>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Button
                  onClick={() => {
                    setExportBtnClicked(true);
                    setIsExporting(true);
                  }}
                  variant="outlined"
                  startIcon={
                    isExporting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SvgIcon fontSize="small">
                        <Download />
                      </SvgIcon>
                    )
                  }
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                {/* Volume Stats */}
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardDiffCard
                    title="Total Attempts"
                    icon={<EventAvailable />}
                    positive={trainingAnalytics?.totalTrainings > 0}
                    value={trainingAnalytics?.totalTrainings || 0}
                    info="Total number of training attempts"
                  />
                </Grid>

                {/* Completion Stats */}
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardDiffCard
                    title="Trainings Completed"
                    icon={<CheckCircle />}
                    positive={trainingAnalytics?.totalTrainings - trainingAnalytics?.pendingTrainings > 0}
                    value={trainingAnalytics?.totalTrainings - trainingAnalytics?.pendingTrainings || 0}
                    info={`${Number(100 - trainingAnalytics?.incompletionRate || 0).toFixed(2)}% completion rate`}
                  />
                </Grid>

                {/* User Stats */}
                <Grid item xs={12} sm={6} md={3}>
                  <DashboardDiffCard
                    title="Unique Users"
                    icon={<People />}
                    iconColor="primary.main"
                    positive={trainingAnalytics?.uniqueUsers > 0}
                    value={trainingAnalytics?.uniqueUsers || 0}
                    info="Number of unique participants"
                  />
                </Grid>
              </Grid>
            </Box>

            <TrainingsTable
              fetchingData={fetchingData}
              items={data}
              count={totalTrainings}
              exportBtnClicked={exportBtnClicked}
              exportBtnFalse={exportBtnFalse}
              handleRefresh={handleRefresh}
              onUrlParamsChange={getTrainings}
            />
          </Stack>
        )}
      </Container>
    </>
  );
};

export default Page;
