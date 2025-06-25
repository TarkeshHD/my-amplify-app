import { Add, Download, PeopleAlt, Upload } from '@mui/icons-material';
import { Box, Button, Container, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { isEmpty } from 'lodash';

import CustomDialog from '../components/CustomDialog';
import AdminForm from '../components/users/AdminForm';
import ImportUserDataForm from '../components/users/ImportUserDataForm';
import SuperAdminForm from '../components/users/SuperAdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useSharedData } from '../hooks/useSharedData';
import { UsersTable } from '../sections/users/UsersTable';
import axios from '../utils/axios';
import SuperAdminFormSso from '../components/users/SuperAdminFormSso';
import AdminFormSso from '../components/users/AdminFormSso';
import TraineeFormSso from '../components/users/TraineeFormSso';
import AssignUsersForm from '../components/users/AssignUsersForm';
import { PremiumFeatureWrapper } from '../components/premium/PremiumFeatureWrapper';

const Page = () => {
  const [openImportDataForm, setOpenImportDataForm] = useState(false);
  const [openAdminForm, setOpenAdminForm] = useState(false);
  const [openSuperAdminForm, setOpenSuperAdminForm] = useState(false);
  const [openTraineeForm, setOpenTraineeForm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [ssoOn, setSsoOn] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openAssignForm, setOpenAssignForm] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const { domains, departments, modules } = useSharedData();

  const config = useConfig();
  const { data: configData } = config;
  const { user } = useAuth();
  const isGuestUser = configData?.freeTrial && user?.role !== 'productAdmin';

  useEffect(() => {
    setSsoOn(
      config?.data?.features?.auth?.types?.[0] === 'SsoAuth' ||
        config?.data?.features?.auth?.types?.[0] === 'AzureAdAuth',
    );
  }, []);

  const getUsers = async (params) => {
    try {
      setFetchingData(true);
      const storedSizes = JSON.parse(localStorage.getItem('tablePageSize')) || {};
      const storedPageSize = storedSizes?.users || 10;
      const queryParams = {
        page: params?.pageIndex ?? 1,
        limit: params?.pageSize ?? storedPageSize,
        sort: !isEmpty(params?.sorting) ? JSON.stringify(params?.sorting) : JSON.stringify({ createdAt: -1 }),
        filters: JSON.stringify(params?.filters),
      };

      const response = await axios.get('/user/all', { params: queryParams });
      setData(response?.data?.users?.docs);
      setTotalUsers(response.data?.users?.totalDocs);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleRefresh = (tableState) => {
    getUsers(tableState);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const [exportBtnClicked, setExportBtnClicked] = useState(false);

  const exportBtnFalse = () => {
    setExportBtnClicked(false);
  };

  const handleRowSelection = useCallback((rows) => {
    setSelectedRows(rows);
  }, []);

  if (user?.role === 'user') {
    // page not found
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h3">Page Not found</Typography>
      </Box>
    );
  }

  const onCloseAdminForm = () => {
    setOpenAdminForm(false);
    handleRefresh();
  };

  const onCloseSuperAdminForm = () => {
    setOpenSuperAdminForm(false);
    handleRefresh();
  };

  const onCloseTraineeForm = () => {
    setOpenTraineeForm(false);
    handleRefresh();
  };

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.user?.singular || 'User'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <PremiumFeatureWrapper
          sx={{ top: '70%' }}
          message="Unlock the Full Potential of Your Team: Advanced User Management, Simplified"
        >
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{configData?.labels?.user?.singular || 'User'} </Typography>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={1}>
                <Tooltip
                  title={`Select rows of users to assign ${
                    configData?.labels?.module?.plural?.toLowerCase() || 'modules'
                  }`}
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
                      Assign Modules
                    </Button>
                  </span>
                </Tooltip>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpenImportDataForm(true);
                  }}
                  startIcon={
                    <SvgIcon fontSize="small">
                      <Upload />
                    </SvgIcon>
                  }
                >
                  Import
                </Button>
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

                {user.role !== 'admin' && (
                  <Button
                    startIcon={
                      <SvgIcon fontSize="small">
                        <Add />
                      </SvgIcon>
                    }
                    variant="contained"
                    onClick={() => {
                      setOpenSuperAdminForm(true);
                    }}
                  >
                    Add Super Admin
                  </Button>
                )}

                {user.role !== 'admin' && (
                  <Button
                    startIcon={
                      <SvgIcon fontSize="small">
                        <Add />
                      </SvgIcon>
                    }
                    variant="contained"
                    onClick={() => {
                      setOpenAdminForm(true);
                    }}
                  >
                    Add Admin
                  </Button>
                )}

                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <Add />
                    </SvgIcon>
                  }
                  variant="contained"
                  onClick={() => {
                    setOpenTraineeForm(true);
                  }}
                >
                  Add Trainee
                </Button>
              </Stack>
            </Stack>
            {/* <SearchBar /> */}

            <UsersTable
              fetchingData={fetchingData}
              count={totalUsers}
              items={data}
              exportBtnClicked={exportBtnClicked}
              exportBtnFalse={exportBtnFalse}
              domains={domains}
              departments={departments}
              handleRefresh={handleRefresh}
              onUrlParamsChange={getUsers}
              handleRowSelection={handleRowSelection}
            />

            {/* Import User Data form */}
            <CustomDialog
              onClose={() => {
                setOpenImportDataForm(false);
              }}
              minWidth="60vw"
              open={openImportDataForm}
              title={<Typography variant="h5">Import User Data</Typography>}
            >
              <ImportUserDataForm
                setOpenImportDataForm={setOpenImportDataForm}
                domains={domains}
                departments={departments}
              />
            </CustomDialog>

            {/* SUPER ADMIN FORM */}
            <CustomDialog
              onClose={() => {
                setOpenSuperAdminForm(false);
              }}
              open={openSuperAdminForm}
              title={<Typography variant="h5">Super Admin</Typography>}
            >
              {ssoOn === true ? <SuperAdminFormSso /> : <SuperAdminForm handleClose={onCloseSuperAdminForm} />}
            </CustomDialog>

            {/* ADMIN FORM */}
            <CustomDialog
              onClose={() => {
                setOpenAdminForm(false);
              }}
              open={openAdminForm}
              title={<Typography variant="h5">Add Admin</Typography>}
            >
              {ssoOn === true ? (
                <AdminFormSso domains={domains} />
              ) : (
                <AdminForm domains={domains} handleClose={onCloseAdminForm} />
              )}
            </CustomDialog>

            {/* TRAINEE FORM */}
            <CustomDialog
              onClose={() => {
                setOpenTraineeForm(false);
              }}
              open={openTraineeForm}
              title={<Typography variant="h5">Add Trainee</Typography>}
            >
              {ssoOn === true ? (
                <TraineeFormSso domains={domains} departments={departments} />
              ) : (
                <TraineeForm domains={domains} departments={departments} handleClose={onCloseTraineeForm} />
              )}
            </CustomDialog>

            {/* ASSIGN MODULES FORM */}
            <CustomDialog
              onClose={() => {
                setOpenAssignForm(false);
              }}
              open={openAssignForm}
              title={<Typography variant="h5">Assign {configData?.labels?.module?.singular || 'Module'}</Typography>}
            >
              <AssignUsersForm selectedUsers={selectedRows} closeAssignForm={() => setOpenAssignForm(false)} />
            </CustomDialog>
          </Stack>
        </PremiumFeatureWrapper>
        {/* <SearchBar /> */}
      </Container>
    </>
  );
};

export default Page;
