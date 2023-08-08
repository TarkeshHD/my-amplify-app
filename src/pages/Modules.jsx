import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Button,
  Container,
  DialogActions,
  IconButton,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { Download, Upload, Add, CloseRounded, PeopleAlt } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelection } from '../hooks/useSelection';
import { applyPagination } from '../utils/utils';
import { SearchBar } from '../components/SearchBar';
import { UsersTable } from '../sections/users/UsersTable';
import axios from '../utils/axios';
import { useAuth } from '../hooks/useAuth';
import CustomDialog from '../components/CustomDialog';
import AdminForm from '../components/users/AdminForm';
import TraineeForm from '../components/users/TraineeForm';
import SuperAdminForm from '../components/users/SuperAdminForm';
import { ModulesTable } from '../sections/modules/ModulesTable';
import QuestionsGrid from '../components/modules/QuestionsGrid';
import ModuleForm from '../components/modules/ModuleForm';
import AssignModulesForm from '../components/modules/AssignModulesForm';
import ModuleQuestionForm from '../components/modules/ModuleQuestionsForm';

const Page = () => {
  const [openModuleForm, setOpenModuleForm] = useState(false);
  const [openAssignForm, setOpenAssignForm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [domains, setDomains] = useState([]);
  const [departments, setDepartments] = useState([]);

  // For Tabs in add modules popup
  const [selectedTabModuleForm, setSelectedTabModuleForm] = useState('one');
  const handleTabChange = (event, newValue) => {
    setSelectedTabModuleForm(newValue);
  };

  const getModules = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/module/all');
      console.log(response.data);
      setData(response?.data?.details);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
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
      toast.error(error.message || 'Failed to fetch domains');
      console.log(error);
    }
  };

  const getDepartments = async () => {
    try {
      const response = await axios.get('/department/all');

      setDepartments(response?.data?.details);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch departments');
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

  const handleRowSelection = useCallback((rows) => {
    setSelectedRows(Object.keys(rows));
  }, []);

  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Modules | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Modules</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Tooltip title="Slect rows to assign modules">
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
                  Add Module
                </Button>
              )}
            </Stack>
          </Stack>

          <Alert severity="info">
            <Typography variant="subtitle2">Select modules to assign them to domains and departments</Typography>
          </Alert>

          <ModulesTable
            handleRowSelection={handleRowSelection}
            items={data}
            fetchingData={fetchingData}
            count={data.length}
            domains={domains}
            departments={departments}
          />

          {/* MODULE FORM */}
          <CustomDialog
            onClose={() => {
              setOpenModuleForm(false);
            }}
            sx={{ minWidth: '40vw' }}
            open={openModuleForm}
            title={<Typography variant="h5">Add Module</Typography>}
          >
            {/* <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 2 }}>
              <Tabs value={selectedTabModuleForm} onChange={handleTabChange} aria-label="tabs-modules">
                <Tab value="one" label="Basic" />
                <Tab value="two" label="Questions" />
              </Tabs>
            </Box>
            {(() => {
              switch (selectedTabModuleForm) {
                case 'one':
                  return <ModuleForm />;
                case 'two':
                  return <ModuleQuestionForm />;
                default:
                  return null;
              }
            })()} */}
            <ModuleForm />
          </CustomDialog>

          {/* ASSIGN MODULES FORM */}
          <CustomDialog
            onClose={() => {
              setOpenAssignForm(false);
            }}
            open={openAssignForm}
            title={<Typography variant="h5">Assign Module</Typography>}
          >
            <AssignModulesForm selectedModules={selectedRows} domains={domains} departments={departments} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
