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
import { ModulesTable } from '../sections/modules/ModulesTable';
import QuestionsGrid from '../components/modules/QuestionsGrid';

const Page = () => {
  const [openModuleForm, setOpenModuleForm] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);

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

  useEffect(() => {
    getModules();
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

          <ModulesTable fetchingData={fetchingData} count={data.length} />

          {/* MODULE FORM */}
          <CustomDialog
            onClose={() => {
              setOpenModuleForm(false);
            }}
            open={openModuleForm}
            title={<Typography variant="h5">Add Module</Typography>}
          >
            <div>Add Form</div>
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
