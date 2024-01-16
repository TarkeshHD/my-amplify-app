import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFTextField } from '../hook-form';

import moment from 'moment-timezone';

import { RHFDatePicker } from '../hook-form/RHFDatePicker';
import { RHFMultipleSelectCheckboxes } from '../hook-form/RHFMultipleSelectCheckboxes.jsx';
import { RHFTimerPicker } from '../hook-form/RHFtimePicker';

// ----------------------------------------------------------------------

AddEventForm.propTypes = {
  user: PropTypes.object,
};

export default function AddEventForm({ addNewEventList, closeEventForm, defaultDate = undefined }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const [users, setUsers] = useState({});

  const getDefaultValues = (userValue) => {
    // Converting user values to name: false format
    const defaultObject = {};
    userValue.forEach((username) => {
      defaultObject[username] = false;
    });
    return defaultObject;
  };

  const getUsers = async () => {
    try {
      const response = await axios.get('/user/all');
      // Getting all the trainee users | role = user
      const traineeUser = response?.data?.details.users.filter((user) => user.role === 'user').map((user) => user.name);
      const userObj = getDefaultValues(traineeUser);
      setUsers(userObj);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const NewModuleSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    venue: Yup.string().required('Venue is required'),
  });

  const defaultValues = useMemo(
    () => ({
      attendees: users || None,
      startTime: moment().set({ hour: 0, minute: 0, second: 0 }),
      endTime: moment().set({ hour: 23, minute: 59, second: 59 }),
      date: defaultDate || moment(),
      title: '',
      venue: '',
    }),
    [],
  );

  const methods = useForm({
    resolver: yupResolver(NewModuleSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();

      Object.keys(values).map((key) => formData.append(key, values[key]));
      // Error handling for start time and end time
      if (formData.get('startTime') > formData.get('endTime')) {
        toast.error('Start time cannot be after end time');
        return;
      }

      const startTime = moment(formData.get('startTime')).format('HH:mm:ss');
      const endTime = moment(formData.get('endTime')).format('HH:mm:ss');
      const sendDate = moment(formData.get('date')).format('YYYY-MM-DD');

      addNewEventList({
        start: moment(`${sendDate} ${startTime}`).toDate(),
        end: moment(`${sendDate} ${endTime}`).toDate(),
        attendees: users,
        title: formData.get('title'),
        venue: formData.get('venue'),
      });
      toast.success('Create event success');
      closeEventForm();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="title" label="Event Title" />{' '}
        </Grid>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="venue" label="Venue Name" />{' '}
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ mb: 1 }} variant="subtitle2" color={'text.disabled'}>
            Add Attendees
          </Typography>
          <RHFMultipleSelectCheckboxes
            name="attendees"
            label="Attendee"
            onChangeCustom={(value) => {
              const oldValues = getValues('attendees');
              // Adding the new value to the old values, by inverting true/false
              setValue('attendees', { ...oldValues, [value]: !oldValues[value] });
              setUsers((prevState) => ({ ...prevState, [value]: !prevState[value] }));
            }}
            options={{ ...users }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography sx={{ mb: 1 }} variant="subtitle2" color={'text.disabled'}>
            Select the date and time for the event
          </Typography>
          <RHFDatePicker
            name={'date'}
            label={''}
            onChangeCustom={(value) => {
              setValue('date', value);
            }}
            option={getValues('date')}
          />
        </Grid>
        <Grid item xs={6}>
          <RHFTimerPicker
            onChangeCustom={(value) => {
              setValue('startTime', value);
            }}
            name={'startTime'}
            option={getValues('startTime')}
            label={''}
          />
        </Grid>
        <Grid item xs={6}>
          <RHFTimerPicker
            onChangeCustom={(value) => {
              setValue('endTime', value);
            }}
            name={'endTime'}
            label={''}
            option={getValues('endTime')}
            endTime
          />
        </Grid>

        <Grid item xs={12}>
          <Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Add Event
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
