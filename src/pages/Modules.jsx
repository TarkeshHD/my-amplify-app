import { Add, Download, PeopleAlt, Upload } from '@mui/icons-material';
import { Alert, Box, Button, Container, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import AssignModulesForm from '../components/modules/AssignModulesForm';
import ModuleForm from '../components/modules/ModuleForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { ModulesTable } from '../sections/modules/ModulesTable';
import axios from '../utils/axios';

const Page = () => {
  const [openModuleForm, setOpenModuleForm] = useState(false);
  const [openAssignForm, setOpenAssignForm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [domains, setDomains] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  // For Tabs in add modules popup
  const [selectedTabModuleForm, setSelectedTabModuleForm] = useState('one');
  const handleTabChange = (event, newValue) => {
    setSelectedTabModuleForm(newValue);
  };

  const getModules = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/module/all');
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

  const getDomains = async () => {
    try {
      const response = await axios.get('/domain/all');

      setDomains(response?.data?.details);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.domain?.plural.toLowerCase() || 'domains'}`);
      console.log(error);
    }
  };

  const getDepartments = async () => {
    try {
      const response = await axios.get('/department/all');

      setDepartments(response?.data?.details);
    } catch (error) {
      toast.error(
        error.message || `Failed to fetch ${data?.labels?.department?.plural.toLowerCase() || 'departments'}`,
      );
      console.log(error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get('/user/all');
      setUsers(response?.data?.details.users);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getDepartments();
  }, []);

  useEffect(() => {
    getDomains();
  }, []);

  useEffect(() => {
    getModules();
  }, []);

  useEffect(() => {
    getUsers();
  }, []);

  const handleRowSelection = useCallback((rows) => {
    setSelectedRows(Object.keys(rows));
  }, []);

  const handleRefresh = () => {
    getModules();
  };

  const { user } = useAuth();
  const config = useConfig();
  const { data: configData } = config;

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

              {user.role === 'productAdmin' && (
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
            count={data.length}
            domains={domains}
            departments={departments}
            users={users}
            handleRefresh={handleRefresh}
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
            />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
