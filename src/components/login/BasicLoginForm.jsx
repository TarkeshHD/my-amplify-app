import { useFormik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import { Alert, Button, FormHelperText, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const BasicLoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().email('Must be a valid email').max(255).required('Username is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await login(values.email, values.password);

        navigate('/');
      } catch (err) {
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });
  const { handleSubmit, isSubmitting } = formik;
  return (
    <form noValidate onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <TextField
          error={!!(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label="Username"
          name="username"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="email"
          value={formik.values.email}
        />
        <TextField
          error={!!(formik.touched.password && formik.errors.password)}
          fullWidth
          helperText={formik.touched.password && formik.errors.password}
          label="Password"
          name="password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          type="password"
          value={formik.values.password}
        />
      </Stack>
      {/* <FormHelperText sx={{ mt: 1 }}>Optionally you can skip.</FormHelperText> */}
      {formik.errors.submit && (
        <Typography color="error" sx={{ mt: 3 }} variant="body2">
          {formik.errors.submit}
        </Typography>
      )}
      <LoadingButton loading={isSubmitting} fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
        Continue
      </LoadingButton>

      <Alert color="primary" severity="info" sx={{ mt: 3 }}>
        <div>Not able to login? Send a mail @ autovrse.</div>
      </Alert>
    </form>
  );
};

export default BasicLoginForm;
