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
import { Box, Card, CardContent, CardHeader, Grid, IconButton, Stack, Typography } from '@mui/material';

import { useConfig } from '../../hooks/useConfig.js';
import axios from '../../utils/axios.js';
import { FormProvider, RHFTextField } from '../hook-form/index.jsx';

import moment from 'moment-timezone';

import { RHFDatePicker } from '../hook-form/RHFDatePicker.jsx';
import { RHFMultipleSelectCheckboxes } from '../hook-form/RHFMultipleSelectCheckboxes.jsx';
import { RHFTimerPicker } from '../hook-form/RHFtimePicker.jsx';
import { Collapse } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { MyCalendar } from '../../pages/MyCalendar.jsx';
import { addToHistory } from '../../utils/utils.js';

// ----------------------------------------------------------------------

AddSessionForm.propTypes = {
  user: PropTypes.object,
};

export default function AddSessionForm({ myEventsList, addNewEventList, closeEventForm, defaultDate = undefined }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const [users, setUsers] = useState({});
  const [modules, setModules] = useState([]);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [sessionLists, setSessionLists] = useState(myEventsList);
  const [userNameAndId, setUserNameAndId] = useState([]);
  const [modulesIdAndName, setModulesIdAndName] = useState([]);

  useEffect(() => {
    setSessionLists(myEventsList);
  }, [myEventsList]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getDefaultValues = (values) => {
    // Converting user values to name: false format
    const defaultObject = {};
    values.forEach((value) => {
      defaultObject[value] = false;
    });
    return defaultObject;
  };

  const getUsers = async () => {
    try {
      const response = await axios.get('/user/all');
      // Getting all the trainee users | role = user
      const traineeUser = response?.data?.details.users.map((user) => user.username);
      const traineeUsersIdAndName = response?.data?.details.users.map((user) => ({
        id: user._id,
        name: user.username,
      }));

      setUserNameAndId(traineeUsersIdAndName);

      const userObj = getDefaultValues(traineeUser);
      setUsers(userObj);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.user?.plural?.toLowerCase() || 'users'}`);
      console.log(error);
    }
  };

  const getModules = async () => {
    try {
      const response = await axios.get('/module/all');
      const modulesObj = getDefaultValues(response?.data?.details?.map((module) => module.name));
      const modulesIdAndName = response?.data?.details?.map((module) => ({
        id: module.id,
        name: module.name,
      }));

      setModulesIdAndName(modulesIdAndName);

      setModules(modulesObj);
    } catch (error) {
      toast.error(error.message || `Failed to fetch ${data?.labels?.module?.plural?.toLowerCase() || 'modules'}`);
      console.log(error);
    }
  };

  useEffect(() => {
    getUsers();
    getModules();
  }, []);

  const NewModuleSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    venue: Yup.string().required('Venue is required'),
  });

  const defaultValues = useMemo(
    () => ({
      attendees: users || None,
      modules: modules || None,
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

      const startDate = moment(
        `${formData.get('date')} ${formData.get('startTime')} `,
        'ddd MMM DD YYYY HH:mm:ss Z',
      ).unix();
      const endDate = moment(
        `${formData.get('date')} ${formData.get('endTime')} `,
        'ddd MMM DD YYYY HH:mm:ss Z',
      ).unix();

      const userIds = userNameAndId.filter((user) => users[user.name] === true).map((user) => user.id);
      const moduleIds = modulesIdAndName.filter((module) => modules[module.name] === true).map((module) => module.id);

      addNewEventList({
        startDate,
        endDate,
        userIds,
        moduleIds,
        name: formData.get('title'),
        venue: formData.get('venue'),
      });

      closeEventForm();
    } catch (error) {
      console.error(error);
      // toast.error(error.message || 'Something went wrong!');
    }
  };

  const handleEventSelect = (event) => {
    addToHistory();
    navigate(`/session-details/${event?.id}`);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="title" label="Session Title" />{' '}
        </Grid>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="venue" label="Venue Name" />{' '}
        </Grid>
        <Grid item xs={12}>
          <Typography sx={{ mb: 1 }} variant="subtitle2" color={'text.disabled'}>
            Add Training Modules
          </Typography>
          <RHFMultipleSelectCheckboxes
            name="modules"
            label="Modules"
            onChangeCustom={(value) => {
              const oldValues = getValues('modules');
              // Adding the new value to the old values, by inverting true/false
              setValue('modules', { ...oldValues, [value]: !oldValues[value] });
              setModules((prevState) => ({ ...prevState, [value]: !prevState[value] }));
            }}
            options={{ ...modules }}
          />
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
            Select the date and time for the session
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
          <Card>
            <CardHeader
              title="My Schedule"
              action={
                <IconButton onClick={handleToggleCollapse}>{isCollapsed ? <ExpandMore /> : <ExpandLess />}</IconButton>
              }
            />
            <Collapse in={!isCollapsed}>
              <CardContent>
                {/* <Typography variant="body1"></Typography> */}
                <MyCalendar
                  myEventsList={sessionLists}
                  handleSlotSelect={() => {}}
                  handleEventSelect={handleEventSelect}
                />
              </CardContent>
            </Collapse>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Create
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
