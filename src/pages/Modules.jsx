import { Add, Download, PeopleAlt, Upload } from '@mui/icons-material';
import { Alert, Box, Button, Container, Stack, SvgIcon, Tooltip, Typography, Skeleton } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import AssignModulesForm from '../components/modules/AssignModulesForm';
import ModuleForm from '../components/modules/ModuleForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { ModulesTable } from '../sections/modules/ModulesTable';
import axios from '../utils/axios';
import { useSharedData } from '../hooks/useSharedData';
import { PremiumFeatureWrapper } from '../components/premium/PremiumFeatureWrapper';

const Page = () => {
  const [openModuleForm, setOpenModuleForm] = useState(false);
  const [openAssignForm, setOpenAssignForm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const { domains, departments, loading: sharedDataLoading } = useSharedData();
  const [users, setUsers] = useState([]);
  const [totalModules, setTotalModules] = useState(0);

  // For Tabs in add modules popup
  const [selectedTabModuleForm, setSelectedTabModuleForm] = useState('one');
  const handleTabChange = (event, newValue) => {
    setSelectedTabModuleForm(newValue);
  };

  const { user } = useAuth();
  const config = useConfig();
  const { data: configData } = config;
  const isGuestUser = configData?.freeTrial && user?.role !== 'productAdmin';

  const getModules = async (params) => {
    if (isGuestUser) return;
    try {
      setFetchingData(true);
      const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
      const storedPageSize = storedSizes?.modules || 10;
      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? storedPageSize,
        sort: !isEmpty(params?.sorting) ? JSON.stringify(params?.sorting) : JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters),
      };

      const response = await axios.get('/module/all', { params: queryParams });
      // Sort the array in descending order by the "createdAt" property
      setData(response?.data?.modules?.docs);
      setTotalModules(response.data?.modules?.totalDocs);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const getUsers = async () => {
    if (isGuestUser) return;
    try {
      const response = await axios.get('/user/all');
      setUsers(response?.data?.users?.docs);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getModules();
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  const handleRowSelection = useCallback((rows) => {
    setSelectedRows(Object.keys(rows));
  }, []);

  const handleRefresh = (tableState) => {
    getModules(tableState);
  };

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
        <title>{configData?.labels?.module?.singular || 'Module'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <PremiumFeatureWrapper sx={{ top: '63%' }} message="Unlock AI JSON Uploads for Auto-Creating VR Stories">
          {sharedDataLoading ? (
            <Box sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" spacing={4}>
                  <Skeleton variant="text" width={200} height={40} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rectangular" width={180} height={36} />
                    <Skeleton variant="rectangular" width={140} height={36} />
                  </Stack>
                </Stack>
                <Skeleton
                  variant="rounded"
                  height={60}
                  sx={{
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                  }}
                />
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
                  <Typography variant="h4">{configData?.labels?.module?.plural || 'Modules'}</Typography>
                </Stack>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Tooltip
                    title={`Select rows to assign ${configData?.labels?.module?.plural?.toLowerCase() || 'modules'}`}
                  >
                    <span>
                      <Button
                        startIcon={
                          <SvgIcon fontSize="small">
                            <PeopleAlt />
                          </SvgIcon>
                        }
                        variant="contained"
                        onClick={() => {
                          setOpenAssignForm(true);
                        }}
                        disabled={selectedRows.length === 0}
                      >
                        Assign {configData?.labels?.module?.plural || 'Modules'}
                      </Button>
                    </span>
                  </Tooltip>

                  {user.role === 'productAdmin' && configData?.features?.studioConnect?.state !== 'on' && (
                    <Button
                      startIcon={
                        <SvgIcon fontSize="small">
                          <Add />
                        </SvgIcon>
                      }
                      variant="contained"
                      onClick={() => {
                        setOpenModuleForm(true);
                      }}
                    >
                      Add {configData?.labels?.module?.singular || 'Module'}
                    </Button>
                  )}
                </Stack>
              </Stack>

              <Alert severity="info">
                <Typography variant="subtitle2">
                  Select {configData?.labels?.module?.singular || 'Module'} to assign them to{' '}
                  {configData?.labels?.domain?.plural?.toLowerCase() || 'domains'} and{' '}
                  {configData?.labels?.department?.plural?.toLowerCase() || 'departments'}
                </Typography>
              </Alert>

              <ModulesTable
                handleRowSelection={handleRowSelection}
                items={data}
                fetchingData={fetchingData}
                count={totalModules}
                domains={domains}
                departments={departments}
                users={users}
                handleRefresh={handleRefresh}
                onUrlParamsChange={getModules}
                setOpenAssignForm={setOpenAssignForm}
              />

              {/* MODULE FORM */}
              <CustomDialog
                onClose={() => {
                  setOpenModuleForm(false);
                }}
                sx={{ minWidth: '40vw' }}
                open={openModuleForm}
                title={<Typography variant="h5">Add {configData?.labels?.module?.singular || 'Module'}</Typography>}
              >
                <ModuleForm />
              </CustomDialog>

              {/* ASSIGN MODULES FORM */}
              <CustomDialog
                onClose={() => {
                  setOpenAssignForm(false);
                }}
                open={openAssignForm}
                title={<Typography variant="h5">Assign {configData?.labels?.module?.singular || 'Module'}</Typography>}
              >
                <AssignModulesForm
                  selectedModules={selectedRows}
                  domains={domains}
                  departments={departments}
                  users={users}
                  handleRefresh={handleRefresh}
                  setOpenAssignForm={setOpenAssignForm}
                />
              </CustomDialog>
            </Stack>
          )}
        </PremiumFeatureWrapper>
      </Container>
    </>
  );
};

export default Page;
