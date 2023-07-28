import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { Download, Upload, Add, CloseRounded } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelection } from '../hooks/useSelection';
import { applyPagination } from '../utils/utils';
import { SearchBar } from '../components/SearchBar';
import axios from '../utils/axios';
import { useAuth } from '../hooks/useAuth';
import CustomDialog from '../components/CustomDialog';
import AdminForm from '../components/users/AdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { DepartmentsTable } from '../sections/departments/DepartmentsTable';
import DepartmentForm from '../components/departments/DepartmentForm';

const Page = () => {
  const [openDepartmentForm, setOpenDepartmentForm] = useState(false);

  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [domains, setDomains] = useState([]);

  const getDepartments = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/department/all');
      console.log(response.data);
      setData(response?.data?.details);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch departments');
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
      toast.error(error.message || 'Failed to fetch users');
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

  return (
    <>
      <Helmet>
        <title>Departments | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Departments</Typography>
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
                Add Department
              </Button>
            </Stack>
          </Stack>

          <DepartmentsTable count={data.length} items={data} fetchingData={fetchingData} />

          {/* ADD DOMAIN */}
          <CustomDialog
            onClose={() => {
              setOpenDepartmentForm(false);
            }}
            open={openDepartmentForm}
            title={<>Add Department</>}
          >
            <DepartmentForm domains={domains} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
