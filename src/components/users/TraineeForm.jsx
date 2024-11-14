import PropTypes from 'prop-types';
import { useEffect, useMemo } from 'react';
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

TraineeForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default function TraineeForm({ isEdit, currentUser, domains = [], departments = [], handleClose }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;
  let traineeTypes = [];
  // add trainee types from config
  if (data?.features?.traineeType?.state === 'on') {
    traineeTypes = data?.features?.traineeType?.values;
  }

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    username: Yup.string().required('Employee Code is required'),
    // password: Yup.string().required('Password is required'),
    domain: Yup.string()
      .required(`${data?.labels?.domain?.singular || 'Domain'} is required`)
      .notOneOf(['None'], `Select one ${data?.labels?.domain?.singular || 'Domain'}`),
    domainId: Yup.string(),
    department: Yup.string()
      .required(`${data?.labels?.department?.singular || 'Department'} is required`)
      .notOneOf(['None'], `Select one ${data?.labels?.department?.singular || 'Department'}`),
    departmentId: Yup.string(),
    role: Yup.string().required(),
    traineeType: Yup.string().test('condition', 'Trainee Type is required', function (value) {
      if (data?.features?.traineeType?.state === 'on') {
        // Make the field required if traineeType is 'on'
        if (value === 'None') {
          return false; // Fail validation when traineeType is 'on' and value is 'None'
        }
        return true;
      }
      return true; // Allow any value when traineeType is not 'on'
    }),
  });

  const defaultValues = useMemo(
    () => ({
      username: currentUser?.username || '',
      name: currentUser?.name || '',
      // password: currentUser?.password || '',
      domain: currentUser?.domainId?.name || 'None',
      domainId: currentUser?.domainId?._id || 'None',
      department: currentUser?.departmentId?.name || 'None',
      departmentId: currentUser?.departmentId?._id || 'None',
      traineeType: currentUser?.traineeType || 'None',
      role: 'user',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser],
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
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
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = async (values) => {
    try {
      if (values.domainId === 'None') {
        delete values.domainId;
      }
      if (values.departmentId === 'None') {
        delete values.domainId;
      }
      if (data?.features?.traineeType?.state !== 'on') {
        delete values.traineeType;
      }
      if (!isEdit) {
        const response = await axios.post('/user/register', values);
      } else {
        await axios.post(`/user/update/${currentUser._id}`, values);
      }

      toast.success(!isEdit ? 'Create success!' : 'Update success!');
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
              <RHFTextField name="name" label="Display Name" />
              {/* <RHFTextField name="password" label="Password" /> */}

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

              <RHFAutocomplete
                name="department"
                label={data?.labels?.department?.singular || 'Department'}
                placeholder={data?.labels?.department?.singular || 'Department'}
                options={[...departments, 'None']}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  return option?.name || '';
                }}
                onChangeCustom={(value) => {
                  setValue('department', value?.name);
                  setValue('departmentId', value?._id);
                }}
                renderOption={(props, option) => <li {...props}>{option?.name}</li>}
              />

              {data?.features?.traineeType?.state === 'on' && (
                <RHFAutocomplete
                  name="traineeType"
                  label={data?.features?.traineeType?.label?.singular || 'Trainee Type'}
                  placeholder={data?.features?.traineeType?.label?.singular || 'Trainee Type'}
                  options={[...traineeTypes, 'None']}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') {
                      return option;
                    }
                    return option?.name || '';
                  }}
                  onChangeCustom={(value) => {
                    setValue('traineeType', value);
                  }}
                  renderOption={(props, option) => <li {...props}>{option?.name}</li>}
                />
              )}
              <RHFTextField name="username" label="Employee Code" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create ' + (data?.labels?.user?.singular || 'User') : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
