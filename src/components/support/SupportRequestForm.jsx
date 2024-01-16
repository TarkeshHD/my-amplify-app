import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Grid, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import axios from '../../utils/axios';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useConfig } from '../../hooks/useConfig';
import { FormProvider, RHFRadioGroup, RHFTextField } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';

const SupportRequestForm = () => {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    email: Yup.string()
      .test('email', 'Email is not valid', (value) => {
        const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)*(\.[a-zA-Z]{2,})$/;
        return emailRegex.test(value);
      })
      .required('Email is required'),
    attatchment: Yup.mixed(),
    type: Yup.string().required('Type is required'),
    priority: Yup.string().required('Priority is required'),
    subject: Yup.string().required('Subject is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewModuleSchema),
  });

  const typeOfRequestValue = {
    'Installation Setup': 'installation_setup',
    'Hardware Issues': 'hardware_issues',
    'Bug Fixes': 'bug_fixes',
    'Demo Support': 'demo_support',
    'Server Hosting': 'server_hosting',
    'New Feature Request': 'new_request',
    Misc: 'misc',
  };
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

      Object.keys(values).map((key) => formData.append(key, values[key]));

      const requestBody = {
        email: formData.get('email'),
        projectName: data?.clientName,
        name: formData.get('name'),
        type: typeOfRequestValue[formData.get('type')],
        priority: formData.get('priority'),
        subject: formData.get('subject'),
        description: formData.get('description'),
        attachment: formData.get('attachment') || null,
      };

      await axios.post('/support/send-ticket', requestBody);
      toast.success('Support Request Created Successfully!');
      setTimeout(() => {
        navigate(0);
      }, 700);
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
              options={[...Object.keys(typeOfRequestValue), 'None']}
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
