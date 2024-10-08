import React, { useEffect, useState } from 'react';
import HistoryIcon from '@mui/icons-material/History';
import { useConfig } from '../hooks/useConfig';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { Container, Stack } from '@mui/system';
import { Button, SvgIcon, Typography } from '@mui/material';

import { SessionTable } from '../sections/sessions/SessionTable';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);
  const [exportBtnClicked, setExportBtnClicked] = useState(false);

  const navigate = useNavigate();

  const config = useConfig();
  const { data: configData } = config;

  const getPastSession = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/cohort/past');
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
    getPastSession();
  }, []);

  // const { user } = useAuth();
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
        <title>Past Sessions | VRse Builder</title>
      </Helmet>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Past Sessions</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                onClick={() => {
                  navigate('/');
                }}
                variant="outlined"
                // startIcon={<SvgIcon fontSize="small">{/* <ArrowBackIosIcon /> */}</SvgIcon>}
              >
                Back to Sessions and Analytics
              </Button>
            </Stack>
          </Stack>

          <SessionTable
            fetchingData={fetchingData}
            items={data}
            count={data.length}
            exportBtnClicked={exportBtnClicked}
            exportBtnFalse={exportBtnFalse}
            sessionHeading="Past"
          />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
