import { Download, EventAvailable, PendingActions, People, TrendingUp } from '@mui/icons-material';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { isEqual } from 'lodash';
import { useConfig } from '../hooks/useConfig';
import EvaluationsTable from '../sections/evaluations/EvaluationsTable';
import axios from '../utils/axios';
import { convertTimeToDescription, removeFromHistory } from '../utils/utils';
import { DashboardTasksProgress } from '../sections/dashboard/DashboardTasksProgress';
import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);
  const navigate = useNavigate();
  const [evalautionAnalytics, setEvaluationAnalytics] = useState({
    totalEvaluations: 0,
    passPercentage: 0,
    totalUserAttempts: 0,
    incompletionRate: 0,
  });

  const { userIdParam } = useParams();

  const config = useConfig();
  const { data: configData } = config;

  const [userName, setUserName] = useState('');
  const [evaluationTime, setEvaluationTime] = useState('');

  const getEvaluations = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get(`/evaluation/user/${userIdParam}`);
      const trainingResponse = await axios.get(`/training/user/${userIdParam}`);
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...(response.data?.details ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const sortedTrainingData = [...(trainingResponse.data?.trainings ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setEvaluationTime(
        response?.data?.totalVrSessionTime > 0
          ? convertTimeToDescription(response?.data?.totalVrSessionTime)
          : '0 Seconds',
      );
      setUserName(response?.data?.user?.username);
      setData([...sortedData, ...sortedTrainingData]);
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
    getEvaluations();
  }, []);

  const backToPrevPage = () => {
    const prevPage = removeFromHistory();
    navigate(prevPage);
  };

  const updateAnalytic = (analytics) => {
    setEvaluationAnalytics((prevState) => {
      if (!isEqual(analytics, prevState)) {
        // Update the state if they are different
        return { ...analytics };
      }
      // Return the previous state if nothing has changed
      return prevState;
    });
  };

  return (
    <>
      <Helmet>
        <title>User {configData?.labels?.evaluation?.singular || 'Evaluation'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h5">{userName} VR History</Typography>
              {evaluationTime && (
                <Typography variant="body1" color="textSecondary">
                  Total VR Time: {evaluationTime}
                </Typography>
              )}
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
              <Button onClick={() => backToPrevPage()} variant="outlined">
                Back
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
                positive={evalautionAnalytics?.totalEvaluations > 0}
                sx={{ height: '100%', width: 350 }}
                value={evalautionAnalytics?.totalEvaluations || 0}
                info={`Total number of evaluations done.`}
              />
              <DashboardTasksProgress
                title="Pass Percentage"
                icon={<TrendingUp />}
                iconColor={'success.main'}
                sx={{ height: '100%', width: 350 }}
                value={evalautionAnalytics?.passPercentage || 0}
              />
              <DashboardDiffCard
                title={`Total User Attempts`}
                icon={<People />}
                iconColor={'primary.main'}
                positive={evalautionAnalytics?.totalUserAttempts > 0}
                sx={{ height: '100%', width: 350 }}
                value={evalautionAnalytics?.totalUserAttempts || 0}
                info={`Total number of users who tried evaluations.`}
              />
              <DashboardTasksProgress
                title="Incomplete Evaluations"
                icon={<PendingActions />}
                sx={{ height: '100%', width: 350 }}
                value={evalautionAnalytics?.incompletionRate || 0}
              />
            </Stack>
          </Box>

          <EvaluationsTable
            fetchingData={fetchingData}
            items={data}
            count={data.length}
            exportBtnClicked={exportBtnClicked}
            exportBtnFalse={exportBtnFalse}
            updateAnalytic={updateAnalytic}
          />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
