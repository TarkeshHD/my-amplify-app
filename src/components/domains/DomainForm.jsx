import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';

import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../hook-form';
import RHFAutocomplete from '../hook-form/RHFAutocomplete';
import axios from '../../utils/axios';
import { useConfig } from '../../hooks/useConfig';

// ----------------------------------------------------------------------

DomainForm.propTypes = {
  isEdit: PropTypes.bool,
  currentDomain: PropTypes.object,
};

export default function DomainForm({ isEdit, currentDomain, domains = [] }) {
  const navigate = useNavigate();

  const config = useConfig();
  const { data } = config;

  const NewDomainSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    domainPassword: Yup.string().required('Password is required'),
    parentId: Yup.string(), // Required while creating subdomains
    parentDomain: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentDomain?.name || '',
      domainPassword: currentDomain?.domainPassword || '',
      parentId: currentDomain?.parentId || 'None',
      parentDomain: currentDomain?.parentId || 'None',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDomain],
  );

  const methods = useForm({
    resolver: yupResolver(NewDomainSchema),
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
    if (isEdit && currentDomain) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentDomain]);

  const onSubmit = async (values) => {
    try {
      if (values.parentId === 'None') {
        delete values.parentId;
      }
      const response = await axios.post('/domain/register', values);
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
              <RHFTextField name="name" label={`${data?.labels?.domain?.singular || 'Domain'} Name`} />

              <RHFTextField name="domainPassword" label={`${data?.labels?.domain?.singular || 'Domain'} Password`} />

              {/* List of all domains, disabled and prefilled for Admin */}
              <RHFAutocomplete
                name="parentDomain"
                label={'Parent ' + (data?.labels?.domain?.singular || 'Domain')}
                placeholder="Parent Domain"
                options={[...domains, 'None']}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  return option?.name || '';
                }}
                onChangeCustom={(value) => {
                  setValue('domainName', value);
                  setValue('parentId', value?._id);
                }}
                renderOption={(props, option) => <li {...props}>{option?.name}</li>}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? `Create ${data?.labels?.domain?.singular || 'Domain'}` : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
