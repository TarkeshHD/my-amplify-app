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
import { Grid, Stack, Typography } from '@mui/material';

import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFTextField } from '../hook-form';

// ----------------------------------------------------------------------

ModuleTimeForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleTimeForm({ isEdit, currentModule, fieldDisabled = false }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleSchema = Yup.object().shape({
    goldTimeLimit: Yup.number().required('Gold Time Limit is required'),
    silverTimeLimit: Yup.number().required('Silver Time Limit is required'),
    bronzeTimeLimit: Yup.number().required('Bronze Time Limit is required'),
    mistakesAllowed: Yup.number().required('Mistakes Allowed is required'),
    note: Yup.string(),
  });

  let evaluationValues = undefined;
  if (currentModule?.evaluation) {
    evaluationValues = currentModule?.evaluation[0];
  }

  const defaultValues = useMemo(
    () => ({
      goldTimeLimit: evaluationValues?.goldTimeLimit || '',
      silverTimeLimit: evaluationValues?.silverTimeLimit || '',
      bronzeTimeLimit: evaluationValues?.bronzeTimeLimit || '',
      mistakesAllowed: evaluationValues?.mistakesAllowed,
      note: evaluationValues?.note || ' ',
    }),
    [currentModule],
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
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentModule) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentModule]);

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).map((key) => formData.append(key, values[key]));
      const response = await axios.post(`/module/time/update/${currentModule._id?.toString()}`, formData);
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
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="goldTimeLimit" type="number" label="Gold Time Limit" />
        </Grid>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="silverTimeLimit" type="number" label="Silver Time Limit" />
        </Grid>
        <Grid item xs={6}>
          <RHFTextField name="bronzeTimeLimit" type="number" label="Bronze Time Limit" />
        </Grid>
        <Grid item xs={6}>
          <RHFTextField name="mistakesAllowed" type="number" label="Mistakes Allowed" />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Notes
          </Typography>
          <RHFTextField
            rows={5}
            multiline
            name="note"
            label={fieldDisabled ? 'No notes added' : 'Any Note (OPTIONAL)'}
          />
        </Grid>
        {!fieldDisabled && ( // Render the button only if fieldDisabled is false
          <Grid item xs={12}>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? `Create ${data?.labels?.module?.singular || 'Module'}` : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Grid>
        )}
      </Grid>
    </FormProvider>
  );
}
