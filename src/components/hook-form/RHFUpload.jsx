import PropTypes from 'prop-types';
// form
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import { FormHelperText, Typography } from '@mui/material';
// type
import { UploadMultiFile, UploadSingleFile } from '../upload';

// ----------------------------------------------------------------------

RHFUploadSingleFile.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadSingleFile({ name, ...other }) {
  const { control } = useFormContext();

  const maxFileSize = 1024 * 1024 * 10; // 1MB

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value;
        const isFileTooLarge = field?.value?.size > maxFileSize;

        return (
          <>
            <UploadSingleFile
              accept="image/*,application/json"
              // can be json file also
              file={!isFileTooLarge && field.value}
              // error={checkError || isFileTooLarge}
              helperText={
                (checkError || isFileTooLarge) && (
                  <FormHelperText error sx={{ px: 2 }}>
                    {isFileTooLarge ? 'File size exceeds 10MB' : error?.message}
                  </FormHelperText>
                )
              }
              {...other}
            />
            <Typography variant="caption" color="textSecondary" sx={{ px: 2 }}>
              Max file size: 10MB
            </Typography>
          </>
        );
      }}
    />
  );
}

// ----------------------------------------------------------------------

RHFUploadMultiFile.propTypes = {
  name: PropTypes.string,
};

export function RHFUploadMultiFile({ name, ...other }) {
  const { control } = useFormContext();

  const maxFileSize = 1024 * 1024 * 10; // 10 MB in bytes

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && field.value?.length === 0;
        const isAnyFileTooLarge = field.value?.some((file) => file.size > maxFileSize);

        return (
          <>
            <UploadMultiFile
              accept="image/*,application/json"
              files={field.value}
              error={checkError || isAnyFileTooLarge}
              helperText={
                (checkError || isAnyFileTooLarge) && (
                  <FormHelperText error sx={{ px: 2 }}>
                    {isAnyFileTooLarge ? 'One or more files exceed the 10MB size limit' : error?.message}
                  </FormHelperText>
                )
              }
              {...other}
            />
            <Typography variant="caption" color="textSecondary" sx={{ px: 2 }}>
              Max file size: 10MB
            </Typography>
          </>
        );
      }}
    />
  );
}
