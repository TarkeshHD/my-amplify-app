import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { Container, Stack } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AddSessionForm from '../components/schedule/AddSession';
import { useAuth } from '../hooks/useAuth';

export const convertResponseToSessionList = (response) => {
  return response.map((session) => {
    return {
      id: session._id,
      title: session.name,
      start: new Date(session.startDate * 1000), // Converting unix timestamp to date
      end: new Date(session.endDate * 1000),
      venue: session.venue,
      attendees: session.users.map((user) => user.name),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  });
};
const Page = () => {
  const [fetchingData, setFetchingData] = useState(false);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const getAllSession = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/cohort/all');
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...(response.data?.details ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const sessionLists = convertResponseToSessionList(sortedData);
      setData(sessionLists);
    } catch (error) {
      toast.error(error.message || `Failed to fetch upcoming sessions`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  const addNewEventList = async (newEvent) => {
    try {
      const response = await axios.post('/cohort/register', newEvent);
      toast.success('Create event success');
      navigate('/');
    } catch (error) {
      toast.error(error.message || `Failed to add new session`);
    }
  };

  useEffect(() => {
    getAllSession();
  }, []);
  const auth = useAuth();
  const { user } = auth;
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
        <title>Create Session | VRse Builder</title>
      </Helmet>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Create a Sessions</Typography>
            </Stack>
            <Stack alignItems="center" direction="row" spacing={1}>
              <Button
                onClick={() => {
                  navigate('/');
                }}
                variant="outlined"
              >
                Back to Sessions and Analytics
              </Button>
            </Stack>
          </Stack>
          <AddSessionForm myEventsList={data} addNewEventList={addNewEventList} closeEventForm={() => {}} />
        </Stack>
      </Container>
    </>
  );
};

export default Page;
