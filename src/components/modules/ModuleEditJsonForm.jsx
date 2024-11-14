/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { Grid, Stack, Typography } from '@mui/material';

import { Box } from '@mui/system';
import { useConfig } from '../../hooks/useConfig';
import axios from '../../utils/axios';
import { FormProvider, RHFTextField } from '../hook-form';
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';

// ----------------------------------------------------------------------

ModuleEditJsonForm.propTypes = {
  isEdit: PropTypes.bool,
  currentModule: PropTypes.object,
};

export default function ModuleEditJsonForm({ isEdit, currentModule, fieldDisabled = false }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const NewModuleSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    thumbnail: Yup.mixed(),
    index: Yup.string().required('Index is required').trim(),
    evaluationJson: Yup.mixed(),
    trainingJson: Yup.mixed(),
  });

  const defaultValues = useMemo(
    () => ({
      description: currentModule?.description || '',
      name: currentModule?.name || '',
      index: currentModule?.index || '',
    }),
    [currentModule],
  );

  const methods = useForm({
    resolver: yupResolver(NewModuleSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentModule) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentModule]);

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

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).map((key) => formData.append(key, values[key]));
      await axios.post(`/module/json/update/${currentModule._id?.toString()}`, formData);
      await axios.post(`/module/questions/files/update/${currentModule._id?.toString()}`, formData);
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
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Display Name
          </Typography>
          <RHFTextField name="name" placeholder="" type="name" />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Index
          </Typography>
          <RHFTextField name="index" placeholder="" type="number" />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color={'text.secondary'} mb={1}>
            Description
          </Typography>
          <RHFTextField rows={5} multiline name="description" label="Description" />
        </Grid>

        <Grid item xs={6}>
          <Box mb={3}>
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

        <Grid item xs={12} lg={6}>
          <Box mb={3}>
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
        <Grid item xs={12} md={6}>
          <Box mb={5}>
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
