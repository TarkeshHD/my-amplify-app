import { Add, CloseRounded, Download } from '@mui/icons-material';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import CustomDialog from '../components/CustomDialog';
import { SearchBar } from '../components/SearchBar';
import QuestionsGrid from '../components/modules/QuestionsGrid';
import AdminForm from '../components/users/AdminForm';
import SuperAdminForm from '../components/users/SuperAdminForm';
import TraineeForm from '../components/users/TraineeForm';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { useSelection } from '../hooks/useSelection';
import { EvaluationsTable } from '../sections/evaluations/EvaluationsTable';
import { ModulesTable } from '../sections/modules/ModulesTable';
import { UsersTable } from '../sections/users/UsersTable';
import axios from '../utils/axios';
import { applyPagination } from '../utils/utils';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);

  const config = useConfig();
  const { data: configData } = config;

  const getEvaluations = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/evaluation/all');
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...response.data?.details].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setData(sortedData);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const exportBtnFalse = () => {
    setExportBtnClicked(false);
  };

  useEffect(() => {
    getEvaluations();
  }, []);

  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>{configData?.labels?.evaluation?.singular || 'Evaluation'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">{configData?.labels?.evaluation?.singular || 'Evaluation'}</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
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
            </Stack>
          </Stack>

          <EvaluationsTable
            fetchingData={fetchingData}
            items={data}
            count={data.length}
            exportBtnClicked={exportBtnClicked}
            exportBtnFalse={exportBtnFalse}
          />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
