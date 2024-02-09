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
import { Box, Grid, Stack } from '@mui/material';

import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFTextField } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';

// ----------------------------------------------------------------------

DepartmentForm.propTypes = {
  isEdit: PropTypes.bool,
  currentDepartment: PropTypes.object,
};

export default function DepartmentForm({ isEdit, currentDepartment, domains = [] }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewDepartmentSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    domainId: Yup.string(),
    domain: Yup.string()
      .required(`${data?.labels?.domain?.singular || 'Domain'} is required`)
      .notOneOf(['None'], `Select one ${data?.labels?.domain?.singular || 'Domain'}`),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentDepartment?.name || '',
      domainId: currentDepartment?.domainId?._id || 'None',
      domain: currentDepartment?.domainId?.name || 'None',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDepartment],
  );

  const methods = useForm({
    resolver: yupResolver(NewDepartmentSchema),
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

  useEffect(() => {
    if (isEdit && currentDepartment) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentDepartment]);

  const onSubmit = async (values) => {
    try {
      if (values.domainId === 'None') {
        delete values.domainId;
      }
      if (!isEdit) {
        const response = await axios.post('/department/register', values);
      } else {
        await axios.post(`/department/update/${currentDepartment._id}`, values);
      }

      toast.success(!isEdit ? 'Create success!' : 'Update success!');
      navigate(0);
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
              <RHFTextField name="name" label={(data?.labels?.department?.singular || 'Department') + ' Name'} />

              {/* List of all domains, disabled and prefilled for Admin */}
              <RHFAutocomplete
                name="domain"
                label={data?.labels?.domain?.singular || 'Domain'}
                placeholder={data?.labels?.domain?.singular || 'Domain'}
                options={[...domains, 'None']}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  return option?.name || '';
                }}
                onChangeCustom={(value) => {
                  setValue('domain', value?.name);
                  setValue('domainId', value?._id);
                }}
                renderOption={(props, option) => <li {...props}>{option?.name}</li>}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? `Create ${data?.labels?.department?.singular || 'Department'}` : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
