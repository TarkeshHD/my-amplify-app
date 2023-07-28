import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { Download, Upload, Add, CloseRounded } from '@mui/icons-material';
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

const Page = () => {
  const [openAdminForm, setOpenAdminForm] = useState(false);
  const [openSuperAdminForm, setOpenSuperAdminForm] = useState(false);
  const [openTraineeForm, setOpenTraineeForm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [domains, setDomains] = useState([]);
  const [departments, setDepartments] = useState([]);

  const getUsers = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/user/all');
      console.log(response.data);
      setData(response?.data?.details?.users);
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
      toast.error(error.message || 'Failed to fetch users');
      console.log(error);
    }
  };

  const getDepartments = async () => {
    try {
      const response = await axios.get('/department/all');

      setDepartments(response?.data?.details);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
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
    getUsers();
  }, []);

  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Users | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Users</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={
                  <SvgIcon fontSize="small">
                    <Upload />
                  </SvgIcon>
                }
              >
                Import
              </Button>
              <Button
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

          <UsersTable fetchingData={fetchingData} count={data.length} items={data} />

          {/* SUPER ADMIN FORM */}
          <CustomDialog
            onClose={() => {
              setOpenSuperAdminForm(false);
            }}
            open={openSuperAdminForm}
            title={<Typography variant="h5">Super Admin</Typography>}
          >
            <SuperAdminForm />
          </CustomDialog>

          {/* ADMIN FORM */}
          <CustomDialog
            onClose={() => {
              setOpenAdminForm(false);
            }}
            open={openAdminForm}
            title={<Typography variant="h5">Add Admin</Typography>}
          >
            <AdminForm domains={domains} />
          </CustomDialog>

          {/* TRAINEE FORM */}
          <CustomDialog
            onClose={() => {
              setOpenTraineeForm(false);
            }}
            open={openTraineeForm}
            title={<Typography variant="h5">Add Trainee</Typography>}
          >
            <TraineeForm domains={domains} departments={departments} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
