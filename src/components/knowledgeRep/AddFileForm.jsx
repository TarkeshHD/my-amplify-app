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
import { RHFUploadSingleFile } from '../hook-form/RHFUpload';
import moment from 'moment-timezone';
import { formatBytes } from '../../utils/utils';

// ----------------------------------------------------------------------

AddFileForm.propTypes = {
  user: PropTypes.object,
};

export default function AddFileForm({ user, updateNewFile, setOpenFileUpload }) {
  const navigate = useNavigate();
  const config = useConfig();
  const { data } = config;

  const defaultValues = useMemo(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const methods = useForm({
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
    // Submitting a file.
    try {
      if (values.knowledgeRepFile === undefined) {
        // if submitted without selecting a file
        throw new Error('Please select a file');
      }

      // Convert file to the format required by the backend
      const newFile = {
        name: values.knowledgeRepFile.path,
        owner: user.name,
        modified: moment().unix(),
        size: formatBytes(values.knowledgeRepFile.size),

        type: 'File',
      };

      // Upload file to the backend | the data
      updateNewFile(newFile);

      // user.name
      //   Submit file

      toast.success('File Uploaded Successfully!');
      setOpenFileUpload(false);
      // navigate(0);
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
        <Grid item xs={12}>
          <Box>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)' },
              }}
            >
              <Typography variant="subtitle2" color={'text.disabled'}>
                Upload File
              </Typography>
              <RHFUploadSingleFile
                name={`knowledgeRepFile`}
                onDrop={(v) => {
                  handleDrop(v, `knowledgeRepFile`);
                }}
                onRemove={() => {
                  handleRemove(`knowledgeRepFile`);
                }}
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Add File
              </LoadingButton>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
