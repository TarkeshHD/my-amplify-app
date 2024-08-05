import { Add, CloseRounded, Download, Upload } from '@mui/icons-material';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import { SearchBar } from '../components/SearchBar';
import DepartmentForm from '../components/departments/DepartmentForm';
import AdminForm from '../components/users/AdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useSelection } from '../hooks/useSelection';
import { DepartmentsTable } from '../sections/departments/DepartmentsTable';
import axios from '../utils/axios';
import { applyPagination } from '../utils/utils';

const Page = () => {
  const [openDepartmentForm, setOpenDepartmentForm] = useState(false);

  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [domains, setDomains] = useState([]);

  const config = useConfig();
  const { data: configData } = config;

  const getDepartments = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/department/all');
      setData(response?.data?.details);
    } catch (error) {
      toast.error(
        error.message || `Failed to fetch ${data?.labels?.department?.plural?.toLowerCase() || 'departments'}`,
      );
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
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getDomains();
  }, []);
  useEffect(() => {
    getDepartments();
  }, []);

  const { user } = useAuth();

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
        <title>{configData?.labels?.department?.singular || 'Department'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">{configData?.labels?.department?.singular || 'Department'}</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                startIcon={
                  <SvgIcon fontSize="small">
                    <Add />
                  </SvgIcon>
                }
                variant="contained"
                onClick={() => {
                  setOpenDepartmentForm(true);
                }}
              >
                Add {configData?.labels?.department?.singular || 'Department'}
              </Button>
            </Stack>
          </Stack>

          <DepartmentsTable count={data.length} items={data} fetchingData={fetchingData} domains={domains} />

          {/* ADD DOMAIN */}
          <CustomDialog
            onClose={() => {
              setOpenDepartmentForm(false);
            }}
            open={openDepartmentForm}
            title={<>Add </>}
          >
            <DepartmentForm domains={domains} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
