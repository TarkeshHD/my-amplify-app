import { CheckCircle, Download, EventAvailable, People, TrendingUp } from '@mui/icons-material';
import { Box, Button, CircularProgress, Container, Grid, Stack, SvgIcon, Typography, Skeleton } from '@mui/material';
import { isEmpty, isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { PremiumFeatureWrapper } from '../components/premium/PremiumFeatureWrapper';
import { useConfig } from '../hooks/useConfig';
import { DashboardDiffCard } from '../sections/dashboard/DashboardDiffCard';
import EvaluationsTable from '../sections/evaluations/EvaluationsTable';
import axios from '../utils/axios';
import { useSharedData } from '../hooks/useSharedData';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);
  const [evalautionAnalytics, setEvaluationAnalytics] = useState({
    totalAttempts: 0,
    totalEvaluations: 0,
    passedCount: 0,
    passPercentage: 0,
    incompletionRate: 0,
    uniqueUsers: 0,
  });

  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const config = useConfig();
  const { data: configData } = config;
  const { loading: sharedDataLoading } = useSharedData();

  const getEvaluations = async (params) => {
    try {
      setFetchingData(true);

      const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
      const storedPageSize = storedSizes?.evaluations || 10;

      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? storedPageSize,
        sort: !isEmpty(params?.sorting) ? JSON.stringify(params?.sorting) : JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters),
      };

      const response = await axios.get('/evaluation/all', { params: queryParams });

      setData(response?.data?.evaluations?.docs);
      setTotalEvaluations(response.data?.evaluations?.totalDocs);
      setEvaluationAnalytics(response?.data?.stats);
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
    getEvaluations();
  }, []);

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

  const handleRefresh = (tableState) => {
    getEvaluations(tableState);
  };

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.evaluation?.singular || 'Evaluation'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <PremiumFeatureWrapper sx={{ top: '70%' }} message="Upgrade to view evaluation insights">
          {sharedDataLoading ? (
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" spacing={4}>
                  <Skeleton variant="text" width={200} height={40} />
                  <Skeleton variant="rectangular" width={100} height={36} />
                </Stack>
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((item) => (
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
                  <Typography variant="h4">{configData?.labels?.evaluation?.singular || 'Evaluation'}</Typography>
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
                      positive={evalautionAnalytics?.totalEvaluations > 0}
                      value={evalautionAnalytics?.totalEvaluations || 0}
                      info="Total number of evaluation attempts"
                      titleFontSize={{ fontSize: '0.70rem' }}
                    />
                  </Grid>

                  {/* Completion Stats */}
                  <Grid item xs={12} sm={6} md={3}>
                    <DashboardDiffCard
                      title="Evaluations Completed"
                      icon={<CheckCircle />}
                      positive={evalautionAnalytics?.totalEvaluations - evalautionAnalytics?.pendingEvaluations > 0}
                      value={evalautionAnalytics?.totalEvaluations - evalautionAnalytics?.pendingEvaluations || 0}
                      info={`${Number(100 - evalautionAnalytics?.incompletionRate || 0).toFixed(2)}% completion rate`}
                    />
                  </Grid>

                  {/* Pass Rate Stats */}
                  <Grid item xs={12} sm={6} md={3}>
                    <DashboardDiffCard
                      title="Pass Rate"
                      icon={<TrendingUp />}
                      iconColor="success.main"
                      positive={evalautionAnalytics?.passPercentage > 75}
                      value={`${evalautionAnalytics?.passPercentage?.toFixed(2) || 0}%`}
                      info="Pass rate of completed evaluations"
                      secondaryInfo={`${evalautionAnalytics?.passedCount || 0} passed`}
                    />
                  </Grid>

                  {/* User Stats */}
                  <Grid item xs={12} sm={6} md={3}>
                    <DashboardDiffCard
                      title="Unique Users"
                      icon={<People />}
                      iconColor="primary.main"
                      positive={evalautionAnalytics?.uniqueUsers > 0}
                      value={evalautionAnalytics?.uniqueUsers || 0}
                      info="Number of unique participants"
                    />
                  </Grid>
                </Grid>
              </Box>
              <EvaluationsTable
                fetchingData={fetchingData}
                items={data}
                count={totalEvaluations}
                exportBtnClicked={exportBtnClicked}
                exportBtnFalse={exportBtnFalse}
                handleRefresh={handleRefresh}
                onUrlParamsChange={getEvaluations}
              />
            </Stack>
          )}
        </PremiumFeatureWrapper>
      </Container>
    </>
  );
};

export default Page;
