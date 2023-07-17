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

const useUserMemo = (page, rowsPerPage, data) =>
  useMemo(() => applyPagination(data, page, rowsPerPage), [page, rowsPerPage, data]);

const useUserIDsMemo = (users) => useMemo(() => users.map((user) => user._id), [users]);

const Page = () => {
  const [openAdminForm, setOpenAdminForm] = useState(false);
  const [openTraineeForm, setOpenTraineeForm] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState([]);
  const users = useUserMemo(page, rowsPerPage, data);
  const usersIds = useUserIDsMemo(users);
  const usersSelection = useSelection(usersIds);

  const getUsers = async () => {
    try {
      const response = await axios.get('/user/all');
      setData(response?.data?.details?.users);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users');
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(event.target.value);
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
              {user.role === 'superAdmin' && (
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
              {(user.role === 'superAdmin' || user.role === 'admin') && (
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
              )}
            </Stack>
          </Stack>
          <SearchBar />

          <UsersTable
            count={data.length}
            items={users}
            onDeselectAll={usersSelection.handleDeselectAll}
            onDeselectOne={usersSelection.handleDeselectOne}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSelectAll={usersSelection.handleSelectAll}
            onSelectOne={usersSelection.handleSelectOne}
            page={page}
            rowsPerPage={rowsPerPage}
            selected={usersSelection.selected}
          />
          {/* ADMIN FORM */}
          <CustomDialog
            onClose={() => {
              setOpenAdminForm(false);
            }}
            open={openAdminForm}
            title={<Typography variant="h5">Add User</Typography>}
          >
            <AdminForm />
          </CustomDialog>

          {/* TRAINEE FORM */}
          <CustomDialog
            onClose={() => {
              setOpenTraineeForm(false);
            }}
            open={openTraineeForm}
            title={<Typography variant="h5">Add User</Typography>}
          >
            <TraineeForm />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
