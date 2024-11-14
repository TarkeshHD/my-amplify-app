import {
  EventAvailable,
  HourglassEmpty,
  StarBorder,
  TrendingUp,
  Extension,
  PendingActions,
  People,
  HowToReg,
  DeviceHub,
  Devices,
} from '@mui/icons-material';
import { Alert, Button, Container, Unstable_Grid2 as Grid } from '@mui/material';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Box, height } from '@mui/system';
import { set } from 'lodash';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { DashboardDiffCard } from '../../sections/dashboard/DashboardDiffCard';

import { DashboardBarChart } from '../../sections/dashboard/DashboardBarChart';

import { DashboardTasksProgress } from '../../sections/dashboard/DashboardTasksProgress';

import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import { DashboardPieChart } from '../../sections/dashboard/DashboardPieChart';
import axios from '../../utils/axios';
import { calculatePercentageChange, convertTimeToDescription } from '../../utils/utils';
import { DashboardRankingCard } from '../../sections/dashboard/DashboardRankingCard';
import { DashboardTable } from '../../sections/dashboard/DashboardTable';
import ReportPDF from './ReportPDF';

const now = new Date();

const Analytics = () => {
  const config = useConfig();
  const { data } = config;

  const auth = useAuth();

  const [totalUsers, setTotalUsers] = useState(0);
  const [lastMonthUserPercentage, setLastMonthUserPercentage] = useState(0);
  const [totalVRSession, setTotalVRSession] = useState('0h');
  const [lastMonthVRSessionPercentage, setLastMonthVRSessionPercentage] = useState(0);
  const [passPercentage, setPassPercentage] = useState(0);
  const [monthlyTotalEval, setMonthlyTotalEval] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [monthlyPassEval, setMonthlyPassEval] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [domainOrDeptVal, setDomainOrDeptVal] = useState([[], []]);

  const [usersEvaluated, setUsersEvaluated] = useState(0);
  const [lastMonthUsersEvaluated, setLastMonthUsersEvaluated] = useState(0);
  const [evaluationCountValue, setEvaluationCount] = useState(0);
  const [lastMonthEvaluationCount, setLastMonthEvaluationCount] = useState(0);
  const [domainCount, setDomainCount] = useState(0);
  const [lastMonthTimeSpentInEvaluation, setLastMonthTimeSpentInEvaluation] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [lastMonthDeviceCount, setLastMonthDeviceCount] = useState(0);
  const [incompletionPercentage, setIncompletionPercentage] = useState(0);
  const [lastMonthAverageEvaluationsPerUser, setLastMonthAverageEvaluationsPerUser] = useState(0);
  const [top3Modules, setTop3Modules] = useState([]);
  const [top3Users, setTop3Users] = useState([]);
  const [top5FailureMoments, setTop5FailureMoments] = useState([]);
  const [totalVRSessionInMilliseconds, setTotalVRSessionInMilliseconds] = useState(0);

  const [domainName, setDomainName] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/analytic/all');

      const { data } = response;
      // Total User Analytics
      const totalUsers = data?.details?.userCount?.total;
      const lastMonthUserPercentage = calculatePercentageChange(data?.details?.userCount?.tillLastMonth, totalUsers);
      // Top 3 Users by Modules
      const top3Users = data?.details?.top3UsersByModules;
      // Time Spent In VR
      const totalVRSession = convertTimeToDescription(data?.details?.timeSpentInVR?.total, true);
      const totalVRSessionInMilliseconds = data?.details?.timeSpentInVR?.total;
      const lastMonthVRSessionPercentage = calculatePercentageChange(
        data?.details?.timeSpentInVR?.tillLastMonth,
        data?.details.timeSpentInVR?.total,
      );
      // Evaluation Count
      const evaluationCount = data?.details?.evaluationCount?.total;
      const lastMonthEvaluationCount = calculatePercentageChange(
        data?.details?.evaluationCount?.tillLastMonth,
        evaluationCount,
      );
      // Time Spent In Evaluation
      const timeSpentInEvaluation = data?.details?.timeSpentInEvaluations?.total;
      const lastMonthTimeSpentInEvaluation = calculatePercentageChange(
        data?.details?.timeSpentInEvaluations?.tillLastMonth,
        timeSpentInEvaluation,
      );
      // Users Evaluated
      const usersEvaluated = data?.details?.usersEvaluated?.total;
      const lastMonthUsersEvaluated = calculatePercentageChange(
        data?.details?.usersEvaluated?.tillLastMonth,
        usersEvaluated,
      );
      // Average Modules Per User
      const deviceCount = data?.details?.deviceCount?.total;
      const lastMonthDeviceCount = calculatePercentageChange(data?.details?.deviceCount?.tillLastMonth, deviceCount);
      // Average Evaluations Per User
      const averageEvaluationsPerUser = data?.details?.avgAttemptedEvaluations?.total;
      const lastMonthAverageEvaluationsPerUser = calculatePercentageChange(
        data?.details?.avgAttemptedEvaluations?.tillLastMonth,
        averageEvaluationsPerUser,
      );

      // Pass Percentage Analytics
      const passPercentage = data?.details?.passPercentage?.value;
      // Monthly Evaluation Analytics
      const monthlyTotalEval = data?.details?.monthlyEvals?.monthlyResults;
      const monthlyPassEval = data?.details?.monthlyEvals?.passUserResults;

      // Failure moment list
      const top5FailureMoments = data?.details?.momentFailureList?.value;

      let countArr = [];
      let nameArr = [];
      let domainName = false;

      if (auth?.user?.role === 'admin') {
        // setting domain name
        const domainResponse = await axios.get(`/domain/${auth?.user?.domainId}`);
        domainName = domainResponse?.data?.details?.name;
        // Department Analytics
        countArr = data?.details?.departmentCount?.map((item) => item.count);
        nameArr = data?.details?.departmentCount?.map((item) => item.departmentName);
      } else {
        // Domain Analytics
        countArr = data?.details?.domainCount?.map((item) => item.count);
        nameArr = data?.details?.domainCount?.map((item) => item.domainName);
      }

      // Check if json is on then only ad dthis value

      setTotalUsers(totalUsers);
      setLastMonthUserPercentage(lastMonthUserPercentage);
      setTop3Modules(data?.details?.top3ModulesByAttendance);
      setTotalVRSession(totalVRSession);
      setTotalVRSessionInMilliseconds(totalVRSessionInMilliseconds);
      setLastMonthVRSessionPercentage(lastMonthVRSessionPercentage);
      setEvaluationCount(evaluationCount);
      setLastMonthEvaluationCount(lastMonthEvaluationCount);
      setDomainCount(nameArr?.length);
      setLastMonthTimeSpentInEvaluation(lastMonthTimeSpentInEvaluation);
      setUsersEvaluated(usersEvaluated);
      setLastMonthUsersEvaluated(lastMonthUsersEvaluated);
      setDeviceCount(deviceCount);
      setLastMonthDeviceCount(lastMonthDeviceCount);
      setIncompletionPercentage(data?.details?.incompletionPercentage?.value);
      setLastMonthAverageEvaluationsPerUser(lastMonthAverageEvaluationsPerUser);

      setPassPercentage(passPercentage);
      setMonthlyTotalEval(monthlyTotalEval);
      setMonthlyPassEval(monthlyPassEval);
      setDomainName(domainName);
      setDomainOrDeptVal([countArr, nameArr]);
      setTop5FailureMoments(top5FailureMoments);

      setTop3Users(data?.details?.top3UsersByModules);
    } catch (error) {
      toast.error(`Fetch analytics! ${error.message}`);
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="xl">
      <Box sx={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
        <h1>Analytics</h1>
        <PDFDownloadLink
          document={
            <ReportPDF
              totalUsers={totalUsers}
              totalVRSessionInMilliseconds={totalVRSessionInMilliseconds}
              incompletionPercentage={incompletionPercentage}
              passPercentage={passPercentage}
              moments={top5FailureMoments.slice(0, 2)}
              deviceCount={deviceCount}
            />
          }
          fileName="autovrse_training_report.pdf"
        >
          {({ loading }) => (loading ? 'Loading document...' : <Button variant="contained">Generate report</Button>)}
        </PDFDownloadLink>
      </Box>
      <Grid container spacing={2}>
        {domainName && (
          <Grid item lg={12} xs={12}>
            <Alert severity="info">
              The analytics shown are of <strong>{domainName}</strong> domain.
            </Alert>
          </Grid>
        )}

        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title={`Total ${data?.labels?.user?.plural || 'Users'}`}
            icon={<People />}
            difference={lastMonthUserPercentage}
            positive={lastMonthUserPercentage > 0}
            sx={{ height: '100%' }}
            value={totalUsers}
            iconColor="primary.main"
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title="Time Spent In VR"
            icon={<HourglassEmpty />}
            iconColor="secondary.main"
            difference={lastMonthVRSessionPercentage}
            positive={lastMonthVRSessionPercentage > 0}
            sx={{ height: '100%' }}
            value={totalVRSession}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title={`${data?.labels?.user?.plural || 'Users'} Evaluated`}
            icon={<EventAvailable />}
            difference={lastMonthUsersEvaluated}
            positive={lastMonthUsersEvaluated > 0}
            sx={{ height: '100%' }}
            value={usersEvaluated}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardTasksProgress
            title="Passed Evaluations"
            icon={<TrendingUp />}
            iconColor={'success.main'}
            sx={{ height: '100%' }}
            value={passPercentage}
          />
        </Grid>

        <Grid gridRow={'span 2'} xs={12} md={8} lg={9}>
          <DashboardTable moments={top5FailureMoments} iconColor="primary.main" />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: '', gap: 2 }}>
            <DashboardTasksProgress
              title={`Incomplete Evaluations`}
              value={incompletionPercentage}
              icon={<PendingActions />}
            />
            <DashboardDiffCard
              title="Total Evaluation"
              value={evaluationCountValue}
              difference={lastMonthEvaluationCount}
              positive={lastMonthEvaluationCount > 0}
              icon={<HowToReg />}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <DashboardPieChart
              title={`${
                auth?.user?.role === 'admin'
                  ? data?.labels?.department?.singular || 'Department'
                  : data?.labels?.domain?.singular || 'Domain'
              } ${data?.labels?.user?.plural || 'Users'}`}
              chartSeries={domainOrDeptVal[0]}
              labels={domainOrDeptVal[1]}
            />
            <DashboardDiffCard
              title={`Total Number Of Device`}
              icon={<Devices />}
              iconColor={'primary.main'}
              value={deviceCount}
              difference={lastMonthDeviceCount}
              positive={lastMonthDeviceCount > 0}
            />

            <DashboardDiffCard
              title={`Total Number Of ${auth?.user?.role === 'admin' ? 'Department' : 'Domain'}`}
              value={domainCount}
              icon={<DeviceHub />}
              difference={0}
              positive={lastMonthTimeSpentInEvaluation < 0}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={9}>
          <DashboardBarChart
            title="Monthly Evaluation Sessions"
            chartSeries={[
              {
                name: 'Total Evaluations',
                data: monthlyTotalEval,
              },
              {
                name: 'Passed Evaluations',
                data: monthlyPassEval,
              },
            ]}
            sx={{ height: '100%' }}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
