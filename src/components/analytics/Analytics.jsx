import { EventAvailable, HourglassEmpty, StarBorder, TrendingUp, Extension } from '@mui/icons-material';
import { Alert, Button, Container, Unstable_Grid2 as Grid } from '@mui/material';

import { DashboardDiffCard } from '../../sections/dashboard/DashboardDiffCard';

import { DashboardBarChart } from '../../sections/dashboard/DashboardBarChart';

import { DashboardTasksProgress } from '../../sections/dashboard/DashboardTasksProgress';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import { DashboardPieChart } from '../../sections/dashboard/DashboardPieChart';
import axios from '../../utils/axios';
import { calculatePercentageChange, convertTimeToDescription } from '../../utils/utils';
import { DashboardRankingCard } from '../../sections/dashboard/DashboardRankingCard';
import { Box } from '@mui/system';
import { set } from 'lodash';

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
  const [timeSpentInModule, setTimeSpentInModule] = useState(0);
  const [lastMonthTimeSpentInModule, setLastMonthTimeSpentInModule] = useState(0);
  const [timeSpentInEvaluation, setTimeSpentInEvaluation] = useState(0);
  const [lastMonthTimeSpentInEvaluation, setLastMonthTimeSpentInEvaluation] = useState(0);
  const [averageModulesPerUser, setAverageModulesPerUser] = useState(0);
  const [lastMonthAverageModulesPerUser, setLastMonthAverageModulesPerUser] = useState(0);
  const [averageEvaluationsPerUser, setAverageEvaluationsPerUser] = useState(0);
  const [lastMonthAverageEvaluationsPerUser, setLastMonthAverageEvaluationsPerUser] = useState(0);
  const [top3Modules, setTop3Modules] = useState([]);
  const [top3Users, setTop3Users] = useState([]);

  const [domainName, setDomainName] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/analytic/all');

      const data = response.data;
      // Total User Analytics
      const totalUsers = data?.details?.userCount?.total;
      const lastMonthUserPercentage = calculatePercentageChange(data?.details?.userCount?.tillLastMonth, totalUsers);
      // Top 3 Users by Modules
      const top3Users = data?.details?.top3UsersByModules;
      // Time Spent In VR
      const totalVRSession = convertTimeToDescription(data?.details?.timeSpentInVR?.total, true);
      const lastMonthVRSessionPercentage = calculatePercentageChange(
        data?.details?.timeSpentInVR?.tillLastMonth,
        data?.details.timeSpentInVR?.total,
      );
      // Time Spent In Module
      const timeSpentInModule = data?.details?.timeSpentInModules?.total;
      const lastMonthTimeSpentInModule = calculatePercentageChange(
        data?.details?.timeSpentInModules?.tillLastMonth,
        timeSpentInModule,
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
      const averageModulesPerUser = data?.details?.avgAttemptedModules?.total;
      const lastMonthAverageModulesPerUser = calculatePercentageChange(
        data?.details?.avgAttemptedModules?.tillLastMonth,
        averageModulesPerUser,
      );
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

      setTotalUsers(totalUsers);
      setLastMonthUserPercentage(lastMonthUserPercentage);
      setTop3Modules(data?.details?.top3ModulesByAttendance);
      setTotalVRSession(totalVRSession);
      setLastMonthVRSessionPercentage(lastMonthVRSessionPercentage);
      setTimeSpentInModule(timeSpentInModule);
      setLastMonthTimeSpentInModule(lastMonthTimeSpentInModule);
      setTimeSpentInEvaluation(timeSpentInEvaluation);
      setLastMonthTimeSpentInEvaluation(lastMonthTimeSpentInEvaluation);
      setUsersEvaluated(usersEvaluated);
      setLastMonthUsersEvaluated(lastMonthUsersEvaluated);
      setAverageModulesPerUser(averageModulesPerUser);
      setLastMonthAverageModulesPerUser(lastMonthAverageModulesPerUser);
      setAverageEvaluationsPerUser(averageEvaluationsPerUser);
      setLastMonthAverageEvaluationsPerUser(lastMonthAverageEvaluationsPerUser);

      setPassPercentage(passPercentage);
      setMonthlyTotalEval(monthlyTotalEval);
      setMonthlyPassEval(monthlyPassEval);
      setDomainName(domainName);
      setDomainOrDeptVal([countArr, nameArr]);

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
      <h1>Analytics</h1>
      <Grid container spacing={3}>
        {domainName && (
          <Grid item lg={12} xs={12}>
            <Alert severity="info">
              The analytics shown are of <strong>{domainName}</strong> domain.
            </Alert>
          </Grid>
        )}

        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title={'Total ' + (data?.labels?.user?.plural || 'Users')}
            icon={<EventAvailable />}
            difference={lastMonthUserPercentage}
            positive={lastMonthUserPercentage > 0 ? true : false}
            sx={{ height: '100%' }}
            value={totalUsers}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title="Time Spent In VR"
            icon={<HourglassEmpty />}
            iconColor="error.main"
            difference={lastMonthVRSessionPercentage}
            positive={lastMonthVRSessionPercentage > 0 ? true : false}
            sx={{ height: '100%' }}
            value={totalVRSession}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardDiffCard
            title={(data?.labels?.user?.plural || 'Users') + ' Evaluated'}
            icon={<EventAvailable />}
            difference={lastMonthUsersEvaluated}
            positive={lastMonthUsersEvaluated > 0 ? true : false}
            sx={{ height: '100%' }}
            value={usersEvaluated}
          />
        </Grid>
        <Grid xs={12} sm={6} lg={3}>
          <DashboardTasksProgress
            title="Pass Percentage"
            icon={<TrendingUp />}
            sx={{ height: '100%' }}
            value={passPercentage}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3} mt={7}>
          <DashboardRankingCard
            title="Top 3 Users (Attempted modules)"
            items={top3Users.map((item) => {
              return { name: item.username, detail: `${item.sessionCount} modules` };
            })}
            Icon={<StarBorder />}
            iconColor="secondary.main"
            height="100px"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 2 }}
          >
            <DashboardDiffCard
              title="Time Spent In Module"
              value={convertTimeToDescription(timeSpentInModule, true)}
              difference={lastMonthTimeSpentInModule}
              positive={lastMonthTimeSpentInModule > 0 ? true : false}
            />
            <DashboardDiffCard
              title="Time Spent In Evaluation"
              value={convertTimeToDescription(timeSpentInEvaluation, true)}
              difference={lastMonthTimeSpentInEvaluation}
              positive={lastMonthTimeSpentInEvaluation > 0 ? true : false}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
            <DashboardDiffCard
              title={`Average ${data?.labels?.module?.plural ?? 'Modules'} per ${
                data?.labels?.user?.singular ?? 'User'
              }`}
              value={averageModulesPerUser}
              difference={lastMonthAverageModulesPerUser}
              positive={lastMonthAverageModulesPerUser > 0 ? true : false}
            />
            <DashboardDiffCard
              title={`Average ${data?.labels?.evaluation?.singular ?? 'Evaluation'} per ${
                data?.labels?.user?.singular ?? 'User'
              }`}
              value={averageEvaluationsPerUser}
              difference={lastMonthAverageEvaluationsPerUser}
              positive={lastMonthAverageEvaluationsPerUser > 0 ? true : false}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3} mt={7}>
          <DashboardRankingCard
            title="Top 3 Modules (Users Attempted)"
            items={top3Modules.map((item) => {
              return { name: item.moduleName, detail: `${item.sessionCount} sessions` };
            })}
            Icon={<Extension />}
          />
        </Grid>
        <Grid xs={12} lg={8}>
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
        <Grid xs={12} md={6} lg={4}>
          <DashboardPieChart
            title={`${
              auth?.user?.role === 'admin'
                ? data?.labels?.department?.singular || 'Department'
                : data?.labels?.domain?.singular || 'Domain'
            } ${data?.labels?.user?.plural || 'Users'}`}
            chartSeries={domainOrDeptVal[0]}
            labels={domainOrDeptVal[1]}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
