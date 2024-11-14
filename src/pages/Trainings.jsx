import { Add, CloseRounded, Download, EventAvailable, PendingActions, People } from '@mui/icons-material';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import { SearchBar } from '../components/SearchBar';
import QuestionsGrid from '../components/modules/QuestionsGrid';
import AdminForm from '../components/users/AdminForm';
import SuperAdminForm from '../components/users/SuperAdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useSelection } from '../hooks/useSelection';
import { ModulesTable } from '../sections/modules/ModulesTable';
import { UsersTable } from '../sections/users/UsersTable';
import axios from '../utils/axios';
import { TrainingsTable } from '../sections/trainings/TrainingsTable';
import { isEqual } from 'lodash';
import { DashboardTasksProgress } from '../sections/dashboard/DashboardTasksProgress';
import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);

  const config = useConfig();
  const { data: configData } = config;

  const [trainingAnalytics, setTrainingAnalytics] = useState({
    totalTrainings: 0,
    totalUserAttempts: 0,
    incompletionRate: 0,
  });

  const getTrainings = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/training/');
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...(response.data?.details ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setData(sortedData);
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

          <Box
            sx={{
              width: '100%',
              overflowX: { xs: 'auto', md: 'visible' },
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            <Stack
              direction="row"
              spacing={4}
              sx={{
                pb: { xs: 2, md: 0 },
                width: { xs: 'max-content', md: '100%' },
              }}
            >
              <DashboardDiffCard
                title={`Total Evaluations Done`}
                icon={<EventAvailable />}
                positive={trainingAnalytics?.totalEvaluations > 0}
                sx={{ height: '100%', width: 350 }}
                value={trainingAnalytics?.totalEvaluations || 0}
                info={`Total number of trainings done.`}
              />
              <DashboardDiffCard
                title={`Total User Attempts`}
                icon={<People />}
                iconColor={'primary.main'}
                positive={trainingAnalytics?.totalUserAttempts > 0}
                sx={{ height: '100%', width: 350 }}
                value={trainingAnalytics?.totalUserAttempts || 0}
                info={`Total number of users who tried trainings.`}
              />
              <DashboardTasksProgress
                title="Incomplete Trainings"
                icon={<PendingActions />}
                sx={{ height: '100%', width: 350 }}
                value={trainingAnalytics?.incompletionRate || 0}
              />
            </Stack>
          </Box>

          <TrainingsTable
            fetchingData={fetchingData}
            items={data}
            count={data.length}
            exportBtnClicked={exportBtnClicked}
            exportBtnFalse={exportBtnFalse}
            updateAnalytic={updateAnalytic}
            handleRefresh={handleRefresh}
          />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
