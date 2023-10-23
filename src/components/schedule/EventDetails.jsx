import { Box, Grid, List, ListItem, ListItemText, Paper, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import _ from 'lodash';
import moment from 'moment-timezone';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
};

const EventDetails = ({ showValues = true, events }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchedList, setSearchedList] = useState([]);
  const [noAttendees, setNoAttendees] = useState(false);

  // For time picker
  const timeOptions = { hour: 'numeric', minute: 'numeric' };

  const getAttendees = (attendeesList) => {
    const trueKeys = [];

    if (!attendeesList) return trueKeys;

    // Make an array of attendees name with true value
    for (const key in attendeesList) {
      if (attendeesList[key] === true) {
        trueKeys.push(key);
      }
    }

    return trueKeys;
  };

  useEffect(() => {
    const eventTitles = getAttendees(events?.attendees);

    if (eventTitles.length === 0) {
      // If at first render, no attendees, set noAttendees to true
      setNoAttendees(true);
    } else {
      setSearchedList(getAttendees(events?.attendees));
    }
  }, [events]);

  const handleDebounceSearch = (event) => {
    const eventTitles = getAttendees(events?.attendees);
    // Search for the query
    const queryList = eventTitles.filter((item) => item.toLowerCase().includes(event.target.value.toLowerCase()));

    setSearchedList(queryList);
  };

  const debounceSearch = useCallback(_.debounce(handleDebounceSearch, 250), [events]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    debounceSearch(event);
  };
  return (
    <Grid container spacing={2}>
      {showValues && (
        <>
          <Grid item xs={6}>
            <Typography variant="body1" fontWeight="600" mb={0.5}>
              {events?.title}
            </Typography>
            <Typography variant="body2" fontWeight="600" color={'text.secondary'}>
              {events?.venue}
            </Typography>
          </Grid>

          <Grid item textAlign={'right'} xs={6}>
            <Typography variant="body1" fontWeight="600" mb={0.5}>
              {events.start.toDateString()}
            </Typography>
            <Typography variant="body2" color={'text.secondary'} fontWeight="600">
              {events.start.toLocaleTimeString(undefined, timeOptions)} -{' '}
              {events.end.toLocaleTimeString(undefined, timeOptions)}
            </Typography>
          </Grid>
          <Grid item xs={12} mt={1}>
            <Typography variant="body1" fontWeight="600">
              Attendees
            </Typography>
            <Paper
              elevation={2}
              sx={{
                marginTop: '5px',
                paddingX: 2,
                paddingY: 2,
              }}
            >
              <TextField
                onChange={handleSearchChange}
                value={searchValue}
                name="search"
                label={'Search'}
                variant="filled"
                placeholder="Search"
                fullWidth
              />
              <List
                sx={{
                  marginTop: '10px',
                  marginBottom: '10px',
                  height: '260px',
                  overflow: 'auto',

                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    borderRadius: '10px',
                    backgroundColor: '#d4d4d4',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    borderRadius: '10px',
                    backgroundColor: '#6e6e6e',
                    height: '5px',
                  },
                }}
              >
                {noAttendees && (
                  <Typography variant="body2" fontWeight="600" color={'text.secondary'}>
                    No Attendees
                  </Typography>
                )}
                {!noAttendees &&
                  searchedList.map((item) => (
                    <ListItem key={item.id} button onClick={() => handleCheckboxChange(item)}>
                      <Box display={'flex'} justifyContent={'flexStart'} alignItems={'center'} width={'100%'}>
                        <ListItem>
                          <ListItemText primary={item} />
                        </ListItem>
                      </Box>
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default EventDetails;
