import React, { useCallback, useMemo, useEffect } from 'react';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../hooks/useConfig';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FormProvider, RHFRadioGroup, RHFTextField } from '../hook-form';
import { Grid, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import { LoadingButton } from '@mui/lab';
import { yupResolver } from '@hookform/resolvers/yup';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';
import axios from 'axios';

const SupportRequestForm = () => {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    email: Yup.string().required('Email is required'),
    attatchment: Yup.mixed(),
    type: Yup.string().required('Type is required'),
    priority: Yup.string().required('Priority is required'),
    subject: Yup.string().required('Subject is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewModuleSchema),
  });

  const typeOfRequest = [
    'Installation Setup',
    'Hardware Issues',
    'Bug Fixes',
    'Demo Support',
    'Server Hosting',
    'New Feature Request',
    'Misc',
  ];

  const priorityOfRequest = ['Low', 'Medium', 'High'];

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      console.log('data', data);

      Object.keys(values).map((key) => formData.append(key, values[key]));

      console.log('FormData', formData.values);

      const requestBody = {
        ticket: {
          anonymous_requester_email: formData.get('email'),
          project_name: data?.clientName,
          annonymous_requester_name: formData.get('name'),
          request_type: formData.get('type'),
          priority: formData.get('priority'),
          subject: formData.get('subject'),
          description: formData.get('description'),
          attatchment: formData.get('attatchment') || null,
        },
      };

      const bearerToken = import.meta.env.VITE_ZENDESK_TOKEN;
      const response = await axios.post(`${import.meta.env.VITE_ZENDESK_URL}`, requestBody, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('response', response);
      toast.success('Support Request Created Successfully!');
      navigate(0);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles, name) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          name,
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        );
      }
    },
    [setValue],
  );
  const handleRemove = useCallback(
    (name) => {
      setValue(name, null);
    },
    [setValue],
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="name" label="Full Name" />{' '}
        </Grid>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="email" label="Email" />{' '}
        </Grid>

        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Type Of Request
            </Typography>
            <RHFAutocomplete
              name="type"
              label=""
              placeholder="Select Type Of Request"
              options={[...typeOfRequest, 'None']}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option?.name || '';
              }}
              onChangeCustom={(value) => {
                setValue('type', value);
              }}
              renderOption={(props, option) => <li {...props}>{option}</li>}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          {' '}
          <RHFTextField name="subject" label="Subject" />{' '}
        </Grid>

        <Grid item xs={12}>
          <RHFTextField rows={5} multiline name="description" label="Description" />
        </Grid>
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Request Priority
            </Typography>
            <RHFAutocomplete
              name="priority"
              label=""
              placeholder="Select Priority Of Request"
              options={priorityOfRequest}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                return option?.name || '';
              }}
              onChangeCustom={(value) => {
                setValue('priority', value);
              }}
              renderOption={(props, option) => <li {...props}>{option}</li>}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Attatchments (Optional)
            </Typography>
            <RHFUploadSingleFile
              name="attachments"
              label="attatchments"
              onDrop={(v) => {
                handleDrop(v, 'attatchment');
              }}
              onRemove={() => {
                handleRemove('attatchment');
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Submit Request
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default SupportRequestForm;
