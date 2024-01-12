import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Alert, Stack, Typography } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { FormProvider, RHFTextField } from '../hook-form';

const BasicLoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginSchema = Yup.object({
    username: Yup.string().max(255).required('Username is required'),
    password: Yup.string().max(255).required('Password is required'),
  });

  const methods = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    resolver: yupResolver(loginSchema),
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  const onSubmit = async (values, helpers) => {
    try {
      await login(values);

      navigate('/');
    } catch (err) {
      console.log('Inside on submit error', err);
      toast.error(err.message);
      setError('afterSubmit', err);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="username" label="Username" />
        <RHFTextField name="password" label="Password" type="password" />
      </Stack>
      {/* <FormHelperText sx={{ mt: 1 }}>Optionally you can skip.</FormHelperText> */}
      {!!errors.afterSubmit && (
        <Typography color="error" sx={{ mt: 3 }} variant="body2">
          {errors.afterSubmit.message || 'Something went wrong'}
        </Typography>
      )}
      <LoadingButton loading={isSubmitting} fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
        Continue
      </LoadingButton>

      <Alert color="primary" severity="info" sx={{ mt: 3 }}>
        <div>Not able to login? Send a mail @ autovrse.</div>
      </Alert>
    </FormProvider>
  );
};

export default BasicLoginForm;
