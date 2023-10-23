import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Box,
  Button,
  Container,
  DialogActions,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material';

import { MyCalendar } from './MyCalendar';
import CustomDialog from '../components/CustomDialog';

import AddEventForm from '../components/schedule/AddEventForm';
import moment from 'moment-timezone';
import EventDetails from '../components/schedule/EventDetails';

// Fake events list
const myEventsList = [
  {
    start: moment('2023-10-07 10:00:00').toDate(),
    end: moment('2023-10-07 11:00:00').toDate(),
    title: 'My event',
    venue: 'Bangalore',
    attendees: {
      'John Doe': true,
      'Jane Doe': false,
      'John Smith': true,
      'Amanda Doe': true,
    },
  },
  {
    start: moment('2023-10-07 12:00:00').toDate(),
    end: moment('2023-10-07 13:00:00').toDate(),
    title: 'Second event',
    venue: 'Bangalore',
  },
  {
    start: moment('2023-10-17 10:00:00').toDate(),
    end: moment('2023-10-17 11:00:00').toDate(),
    title: 'Schedule event',
    venue: 'Mumbai',
    attendees: {
      'John Doe': true,
      'Jane Doe': false,
      'John Smith': true,
      'Amanda Doe': true,
    },
  },
  {
    start: moment('2023-10-18 10:00:00').toDate(),
    end: moment('2023-10-18 18:00:00').toDate(),
    title: 'Deadline',
    venue: 'Bangalore',
    attendees: {
      'John Doe': true,
      'Jane Doe': false,
      'John Smith': true,
      'Amanda Doe': true,
      'Ethan Hunt': true,
    },
  },
  {
    start: moment('2023-10-18 10:00:00').toDate(),
    end: moment('2023-10-18 18:00:00').toDate(),
    title: 'Deadline',
    venue: 'Mumbai',
    attendees: {
      'John Doe': true,
      'Jane Doe': false,
      'John Smith': true,
      'Amanda Doe': true,
      Mohan: true,
    },
  },
  {
    start: moment('2023-10-18 10:00:00').toDate(),
    end: moment('2023-10-18 18:00:00').toDate(),
    title: 'Deadline',
    venue: 'Bangalore',
    attendees: {
      'John Doe': true,
      'Jane Doe': false,
      'John Smith': true,
    },
  },
  {
    start: moment('2023-10-24 10:00:00').toDate(),
    end: moment('2023-10-24 14:00:00').toDate(),
    title: 'Houston Event',
    venue: 'Houston',
    attendees: {
      Anuj: true,
      Ashwin: true,
    },
  },
];

const Page = () => {
  const [openEventUpdate, setOpenEventUpdate] = useState(false);
  const [openEventDetails, setOpenEventDetails] = useState(false);
  const [eventLists, setEventLists] = useState(myEventsList);
  const [date, setDate] = useState(undefined);
  const [event, setEvent] = useState(undefined);

  const addNewEventList = (value) => {
    setEventLists((prev) => [...prev, value]);
  };

  const handleSlotSelect = (startDate) => {
    setOpenEventUpdate(true);
    setDate(moment(startDate));
  };

  const handleEventSelect = (event) => {
    setEvent(event);
    setOpenEventDetails(true);
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

          <Alert severity="info">
            <Typography variant="subtitle2">Click on a date to schedule a VR session</Typography>
          </Alert>

          <MyCalendar
            myEventsList={eventLists}
            handleSlotSelect={handleSlotSelect}
            handleEventSelect={handleEventSelect}
          />

          {/* ADD Event */}
          <CustomDialog
            onClose={() => {
              setOpenEventUpdate(false);
            }}
            open={openEventUpdate}
            title={<>Create Event </>}
          >
            <AddEventForm
              addNewEventList={addNewEventList}
              closeEventForm={() => setOpenEventUpdate(false)}
              defaultDate={date}
            />
          </CustomDialog>
          {/* Event Details */}
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
