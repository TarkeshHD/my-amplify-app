import { Download } from '@mui/icons-material';
import { Box, Button, Container, DialogActions, IconButton, Stack, SvgIcon, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useConfig } from '../hooks/useConfig';
import { EvaluationsTable } from '../sections/evaluations/EvaluationsTable';
import axios from '../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { convertTimeToDescription, removeFromHistory } from '../utils/utils';

const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);
  const navigate = useNavigate();

  const { userIdParam } = useParams();

  const config = useConfig();
  const { data: configData } = config;

  const [userName, setUserName] = useState('');
  const [evaluationTime, setEvaluationTime] = useState('');

  const getEvaluations = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get(`/evaluation/user/${userIdParam}`);
      const trainingResponse = await axios.get(`/training/user/${userIdParam}`);
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...(response.data?.details ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      console.log('trainingResponse', trainingResponse);
      const sortedTrainingData = [...(trainingResponse.data?.trainings ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      console.log('sortedTrainingData', sortedTrainingData);
      setEvaluationTime(convertTimeToDescription(response?.data?.totalVrSessionTime));
      setUserName(response?.data?.user?.username);
      setData([...sortedData, ...sortedTrainingData]);
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

  const backToPrevPage = () => {
    const prevPage = removeFromHistory();
    navigate(prevPage);
  };

  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>User {configData?.labels?.evaluation?.singular || 'Evaluation'} | VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h5">{userName} VR History</Typography>
              {evaluationTime && (
                <Typography variant="body1" color="textSecondary">
                  Total VR Time: {evaluationTime}
                </Typography>
              )}
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
              <Button onClick={() => backToPrevPage()} variant="outlined">
                Back
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
