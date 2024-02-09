import React, { useEffect, useState } from 'react';
import HistoryIcon from '@mui/icons-material/History';
import { useConfig } from '../../hooks/useConfig';
import { Add } from '@mui/icons-material';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { Container, Stack } from '@mui/system';
import { Button, SvgIcon, Typography } from '@mui/material';
import { EvaluationsTable } from '../../sections/evaluations/EvaluationsTable';
import { SessionTable } from '../../sections/sessions/SessionTable';
import { useNavigate } from 'react-router-dom';

const UpcomingSession = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);

  const navigate = useNavigate();

  const config = useConfig();
  const { data: configData } = config;

  const getUpcomingSession = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/cohort/upcoming');
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...(response.data?.details ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setData(sortedData);
    } catch (error) {
      toast.error(error.message || `Failed to fetch upcoming sessions`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const exportBtnFalse = () => {
    setExportBtnClicked(false);
  };

  useEffect(() => {
    getUpcomingSession();
  }, []);

  return (
    <>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Upcoming Sessions</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={() => {
                  navigate('/create-session');
                }}
                startIcon={
                  <SvgIcon fontSize="small">
                    <Add />
                  </SvgIcon>
                }
              >
                New Session
              </Button>
              <Button
                onClick={() => {
                  navigate('/past-session');
                }}
                variant="outlined"
                startIcon={
                  <SvgIcon fontSize="small">
                    <HistoryIcon />
                  </SvgIcon>
                }
              >
                Past Sessions
              </Button>
            </Stack>
          </Stack>

          <SessionTable
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

export default UpcomingSession;
