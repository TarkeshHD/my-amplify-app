import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
// form
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Grid, Stack, Typography } from '@mui/material';

import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFRadioGroup, RHFTextField } from '../hook-form';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';

// ----------------------------------------------------------------------

ModuleForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleForm({ isEdit, currentModule }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    index: Yup.string().required('Index is required').trim(),
    thumbnail: Yup.mixed(),
    SOP: Yup.mixed(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentModule?.name || '',
      description: currentModule?.description || '',
      index: currentModule?.index || '',
      evaluationType: 'question',
      thumbnail: currentModule?.thumbnail, // Need to figure out prefilling when doing Edit Part
      SOP: currentModule?.SOP, // Need to figure out prefilling when doing Edit Part
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const response = await axios.post('/module/create', formData);
      toast.success(!isEdit ? 'Create success!' : 'Update success!');
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

  const radioOptions = [
    { label: 'MCQ', value: 'question' },
    { label: 'Time', value: 'time' },
    ...(data?.features?.questionActionEvaluation?.state === 'on'
      ? [{ label: 'Question And Action', value: 'questionAction' }]
      : []), // QuestionAction added using feature flag from backend
  ];

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="name" label="Display Name" />{' '}
        </Grid>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="index" type="number" label="Index" />{' '}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Mode
          </Typography>
          <RHFRadioGroup
            name="evaluationType"
            options={radioOptions}
            getOptionLabel={radioOptions.map((option) => option.label)}
          />
        </Grid>
        <Grid item xs={12}>
          <RHFTextField rows={5} multiline name="description" label="Description" />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Thumbnail
            </Typography>
            <RHFUploadSingleFile
              name="thumbnail"
              label="Thumbnail"
              onDrop={(v) => {
                handleDrop(v, 'thumbnail');
              }}
              onRemove={() => {
                handleRemove('thumbnail');
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              SOP
            </Typography>
            <RHFUploadSingleFile
              name="SOP"
              label="SOP"
              onDrop={(v) => {
                handleDrop(v, 'SOP');
              }}
              onRemove={() => {
                handleRemove('SOP');
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!isEdit ? `Create ${data?.labels?.module?.singular || 'Module'}` : 'Save Changes'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
