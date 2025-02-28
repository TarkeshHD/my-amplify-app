import { Add, CloseRounded, CheckCircle, Download, EventAvailable, PendingActions, People } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { isEqual, isEmpty } from 'lodash';
import { useConfig } from '../hooks/useConfig';
import axios from '../utils/axios';
import { TrainingsTable } from '../sections/trainings/TrainingsTable';
import { DashboardTasksProgress } from '../sections/dashboard/DashboardTasksProgress';
import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';
import { PremiumFeatureWrapper } from '../components/premium/PremiumFeatureWrapper';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);
  const [totalTrainings, setTotalTrainings] = useState(0);

  const config = useConfig();
  const { data: configData } = config;

  const [trainingAnalytics, setTrainingAnalytics] = useState({
    totalTrainings: 0,
    totalUserAttempts: 0,
    incompletionRate: 0,
    pendingTrainings: 0,
  });

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

  const handleRefresh = () => {
    getTrainings();
  };

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.training?.singular || 'Training'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">{configData?.labels?.training?.singular || 'Training'}</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                onClick={() => {
                  setExportBtnClicked(true);
                }}
                variant="outlined"
                startIcon={
                  <SvgIcon fontSize="small">
                    <Download />
                  </SvgIcon>
                }
              >
                Export
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
      </Container>
    </>
  );
};

export default Page;
