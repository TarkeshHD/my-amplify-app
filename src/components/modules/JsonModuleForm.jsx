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
import { Box, CircularProgress, FormControl, FormLabel, Grid, Stack, Typography } from '@mui/material';

import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFRadioGroup, RHFTextField } from '../hook-form';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import { display } from '@mui/system';

export const JsonModuleForm = ({ isEdit, currentModule }) => {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    index: Yup.string().required('Index is required').trim(),
    thumbnail: Yup.mixed(),
    evaluationJson: Yup.mixed(),
    trainingJson: Yup.mixed(),
    SOP: Yup.mixed(),
    evaluationType: Yup.string().required('Evaluation Type is required'),
    gameMode: Yup.string().required('Game Mode is required'),
  });
  const defaultValues = useMemo(
    () => ({
      name: currentModule?.name || '',
      description: currentModule?.description || '',
      index: currentModule?.index || '',
      evaluationType: 'jsonLifeCycle',
      gameMode: currentModule?.gameMode || 'singleplayer',
      thumbnail: currentModule?.thumbnail,
      SOP: currentModule?.SOP,
      evaluationJson: currentModule?.evaluationJson,
      trainingJson: currentModule?.trainingJson,
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

      //   add evaluationType to formData
      //   formData.append('evaluationType', 'jsonLifeCycle');

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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="name" label="Display Name" />{' '}
          <RHFTextField name="evaluationType" value="jsonLifeCycle" sx={{ display: 'none' }} />
        </Grid>
        <Grid item xs={6}>
          {' '}
          <RHFTextField name="index" type="number" label="Index" />{' '}
        </Grid>

        <Grid item xs={12}>
          <RHFTextField rows={5} multiline name="description" label="Description" />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Module Mode</FormLabel>
            <RHFRadioGroup
              name="gameMode"
              options={[
                { label: 'Single Player', value: 'singleplayer' },
                { label: 'Multi Player', value: 'multiplayer' },
                { label: 'Hybrid (Both Modes)', value: 'hybridplayer' },
              ]}
              sx={{
                '& .MuiFormControlLabel-root': { mr: 4 },
              }}
            />
          </FormControl>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Select the game mode for this module. Hybrid mode supports both single and multiplayer functionality.
          </Typography>
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

        <Grid item xs={12} lg={6}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Evaluation JSON
            </Typography>
            <RHFUploadSingleFile
              name="evaluationJson"
              label="Evaluation Json"
              onDrop={(v) => {
                handleDrop(v, 'evaluationJson');
              }}
              onRemove={() => {
                handleRemove('evaluationJson');
              }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Box>
            <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
              Training JSON
            </Typography>
            <RHFUploadSingleFile
              name="trainingJson"
              label="Training JSON"
              onDrop={(v) => {
                handleDrop(v, 'trainingJson');
              }}
              onRemove={() => {
                handleRemove('trainingJson');
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
};
