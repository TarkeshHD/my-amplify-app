import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Stack } from '@mui/material';

import axios from '../../utils/axios';
import { FormProvider, RHFTextField } from '../hook-form';

// ----------------------------------------------------------------------

EditPasswordForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function EditPasswordForm({ user, handleClose, ...props }) {
  const navigate = useNavigate();

  const EditUserSchema = Yup.object().shape({
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = useMemo(
    () => ({
      password: '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const methods = useForm({
    resolver: yupResolver(EditUserSchema),
    defaultValues,
  });

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
      console.log('values', values);
      const response = await axios.post(`/user/update/${user._id}`, values);
      toast.success('Password updated successfully!');
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Something went wrong!');
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)' }, // Add sm: 'repeat(2, 1fr)'  for two Fields in line
              }}
            >
              <RHFTextField name="password" label="Password" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {'Save Changes'}
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
