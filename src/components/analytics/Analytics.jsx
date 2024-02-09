import { EventAvailable, HourglassEmpty, TrendingUp } from '@mui/icons-material';
import { Alert, Button, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import { DashboardDiffCard } from '../../sections/dashboard/DashboardDiffCard';

import { DashboardBarChart } from '../../sections/dashboard/DashboardBarChart';

import { DashboardTasksProgress } from '../../sections/dashboard/DashboardTasksProgress';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useConfig } from '../../hooks/useConfig';
import { DashboardPieChart } from '../../sections/dashboard/DashboardPieChart';
import axios from '../../utils/axios';
import { calculatePercentageChange } from '../../utils/utils';

const now = new Date();

const Analytics = () => {
  const config = useConfig();
  const { data } = config;

  const auth = useAuth();

  const [totalUsers, setTotalUsers] = useState(0);
  const [lastMonthUserPercentage, setLastMonthUserPercentage] = useState(0);
  const [totalVRSession, setTotalVRSession] = useState('0h');
  const [lastMonthVRSessionPercentage, setLastMonthVRSessionPercentage] = useState(0);
  const [evalSession, setEvalSession] = useState(0);
  const [lastMonthEvalSessionPercentage, setLastMonthEvalSessionPercentage] = useState(0);
  const [passPercentage, setPassPercentage] = useState(0);
  const [monthlyTotalEval, setMonthlyTotalEval] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [monthlyPassEval, setMonthlyPassEval] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [domainOrDeptVal, setDomainOrDeptVal] = useState([[], []]);

  const [domainName, setDomainName] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get('/analytic/all');
      const data = response.data;
      // Total User Analytics
      const totalUsers = data?.details?.userCount?.total;
      const lastMonthUserPercentage = calculatePercentageChange(data?.details?.userCount?.tillLastMonth, totalUsers);
      // Total VR Session Analytics
      const totalVRSession = `${data?.details?.evalSessionTime?.total}h`;
      const lastMonthVRSessionPercentage = calculatePercentageChange(
        data?.details?.evalSessionTime?.tillLastMonth,
        data?.details?.evalSessionTime?.total,
      );
      // Evaluation Session Analytics
      const evalSession = data?.details?.evalSessionCount?.total;
      const lastMonthEvalSessionPercentage = calculatePercentageChange(
        data?.details?.evalSessionCount?.tillLastMonth,
        evalSession,
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
      setTotalVRSession(totalVRSession);
      setLastMonthVRSessionPercentage(lastMonthVRSessionPercentage);
      setEvalSession(evalSession);
      setLastMonthEvalSessionPercentage(lastMonthEvalSessionPercentage);
      setPassPercentage(passPercentage);
      setMonthlyTotalEval(monthlyTotalEval);
      setMonthlyPassEval(monthlyPassEval);
      setDomainName(domainName);
      setDomainOrDeptVal([countArr, nameArr]);
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
            title="VR Sessions"
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
            title={(data?.labels?.evaluation?.singular || 'Evaluation') + ' Sessions'}
            icon={<EventAvailable />}
            difference={lastMonthEvalSessionPercentage}
            positive={lastMonthEvalSessionPercentage > 0 ? true : false}
            sx={{ height: '100%' }}
            value={evalSession}
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
