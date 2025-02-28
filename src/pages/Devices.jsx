import { Add, CloseRounded, Download } from '@mui/icons-material';
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
import { DevicesTable } from '../sections/devices/DevicesTable';
import { PremiumFeatureWrapper } from '../components/premium/PremiumFeatureWrapper';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);
  const [totalDocs, setTotalDocs] = useState(false);

  const config = useConfig();
  const { data: configData } = config;
  const { user } = useAuth();
  const isGuestUser = configData?.freeTrial && user?.role !== 'productAdmin';
  const getDevices = async (params) => {
    if (isGuestUser) return;
    try {
      setFetchingData(true);
      const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
      const storedPageSize = storedSizes?.devices || 10;

      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? storedPageSize,
        sort: JSON.stringify(params?.sorting) ?? JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters) ?? JSON.stringify({}),
      };

      const response = await axios.get('/device/all', { params: queryParams });

      setData(response?.data?.devices?.docs);
      setTotalDocs(response?.data?.devices?.totalDocs);
    } catch (error) {
      toast.error(error.message || `Failed to fetch devices'}`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const exportBtnFalse = () => {
    setExportBtnClicked(false);
  };

  useEffect(() => {
    getDevices();
  }, [isGuestUser]);

  if (user?.role === 'user') {
    // page not found
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h3">Page Not found</Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{'Device'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <PremiumFeatureWrapper sx={{ top: '68%' }} message="Upgrade to view device insights">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{'Device'}</Typography>
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

            <DevicesTable
              fetchingData={fetchingData}
              items={data}
              count={totalDocs}
              exportBtnClicked={exportBtnClicked}
              exportBtnFalse={exportBtnFalse}
              onUrlParamsChange={getDevices}
            />
          </Stack>
        </PremiumFeatureWrapper>
      </Container>
    </>
  );
};

export default Page;
