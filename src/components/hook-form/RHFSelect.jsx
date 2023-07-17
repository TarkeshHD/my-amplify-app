import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { TextField } from '@mui/material';

// ----------------------------------------------------------------------

RHFSelect.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string,
};

export default function RHFSelect({ name, children, native = true, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          select
          fullWidth
          SelectProps={{ native }}
          error={!!error}
          helperText={error?.message}
          {...other}
        >
          {children}
        </TextField>
      )}
    />
  );
}
