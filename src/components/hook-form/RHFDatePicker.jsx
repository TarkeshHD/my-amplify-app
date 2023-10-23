import PropTypes from 'prop-types';
import { FormControl, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import * as React from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { Controller, useFormContext } from 'react-hook-form';

RHFDatePicker.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
};

export function RHFDatePicker({ name, label, onChangeCustom, option, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (value) => {
          onChangeCustom(value);
        };
        return (
          <FormControl sx={{ width: '100%' }}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DatePicker
                name={name}
                labelId={`label-${name}`}
                onChange={handleChange}
                value={option}
                slotProps={{
                  textField: {
                    helperText: 'MM/DD/YYYY',
                  },
                }}
                {...other}
              />
            </LocalizationProvider>
          </FormControl>
        );
      }}
    />
  );
}
