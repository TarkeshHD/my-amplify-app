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
import { DomainsTable } from '../sections/domains/DomainsTable';
import DomainForm from '../components/domains/DomainForm';

const useUserMemo = (page, rowsPerPage, data) =>
  useMemo(() => applyPagination(data, page, rowsPerPage), [page, rowsPerPage, data]);

const useUserIDsMemo = (users) => useMemo(() => users.map((user) => user._id), [users]);

const Page = () => {
  const [openDomainForm, setOpenDomainForm] = useState(false);

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
        <title>Domains | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Domains</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              {(user.role === 'superAdmin' || user.role === 'admin') && (
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <Add />
                    </SvgIcon>
                  }
                  variant="contained"
                  onClick={() => {
                    setOpenDomainForm(true);
                  }}
                >
                  Add Domain
                </Button>
              )}
            </Stack>
          </Stack>
          <SearchBar />

          <DomainsTable
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
          {/* ADD DOMAIN */}
          <CustomDialog
            onClose={() => {
              setOpenDomainForm(false);
            }}
            open={openDomainForm}
            title={<Typography variant="h5">Add Domain</Typography>}
          >
            <DomainForm />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
