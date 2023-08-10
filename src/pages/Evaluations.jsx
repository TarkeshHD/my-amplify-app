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
import { EvaluationsTable } from '../sections/evaluations/EvaluationsTable';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);

  const getEvaluations = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/evaluation/all');
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
    getEvaluations();
  }, []);

  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Evaluations | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Evaluations</Typography>
            </Stack>
          </Stack>

          <EvaluationsTable fetchingData={fetchingData} items={data} count={data.length} />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
