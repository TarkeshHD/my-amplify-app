import {
  Alert,
  Box,
  Button,
  Container,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import CustomDialog from '../components/CustomDialog';
import { MyCalendar } from './MyCalendar';

import moment from 'moment-timezone';
import AddSessionForm from '../components/schedule/AddSession';
import EventDetails from '../components/schedule/EventDetails';
import { convertResponseToSessionList } from './CreateSession';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { addToHistory } from '../utils/utils';
import { useNavigate } from 'react-router-dom';

const Page = () => {
  const [openEventUpdate, setOpenEventUpdate] = useState(false);
  const [openEventDetails, setOpenEventDetails] = useState(false);
  const [eventLists, setEventLists] = useState([]);
  const [date, setDate] = useState(undefined);
  const [event, setEvent] = useState(undefined);

  const navigate = useNavigate();

  const getAllEvents = async () => {
    try {
      const response = await axios.get('/cohort/all');
      // Sort the array in descending order by the "createdAt" property
      const sortedData = [...(response.data?.details ?? [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      const sessionLists = convertResponseToSessionList(sortedData);
      setEventLists(sessionLists);
    } catch (error) {
      toast.error(error.message || `Failed to fetch upcoming sessions`);
      console.log(error);
    }
  };

  useEffect(() => {
    getAllEvents();
  }, []);

  const handleEventSelect = (event) => {
    addToHistory();
    console.log(event);
    navigate(`/session-details/${event?.id}`);
  };
  return (
    <>
      <Helmet>
        <title>Schedule| VRse Builder</title>
      </Helmet>

      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Schedule</Typography>
            </Stack>
          </Stack>
          <Grid item lg={12} xs={12}>
            <Alert severity="info">
              Select the date to get the day's schedule. Click on the event to view details.
            </Alert>
          </Grid>
          <MyCalendar myEventsList={eventLists} handleEventSelect={handleEventSelect} />

          <CustomDialog
            sx={{ minWidth: '30vw' }}
            onClose={() => {
              setOpenEventDetails(false);
            }}
            open={openEventDetails}
            title={<>Event Details </>}
          >
            <EventDetails events={event} />
          </CustomDialog>
        </Stack>
      </Container>
    </>
  );
};

export default Page;
