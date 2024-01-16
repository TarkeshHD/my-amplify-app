import { FormControl } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

RHFTimerPicker.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  date: PropTypes.object,
};

export function RHFTimerPicker({ name, label, date = undefined, option, onChangeCustom, endTime = false, ...other }) {
  const { control } = useFormContext();
  let defaultTime = moment().set({ hour: 0, minute: 0, second: 0 });
  if (endTime) {
    defaultTime = moment().set({ hour: 23, minute: 59, second: 59 });
  }

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
              <TimePicker
                onChange={handleChange}
                name={name}
                value={option || defaultTime}
                labelId={`label-${name}`}
                id={`select-${name}`}
                {...other}
              />
            </LocalizationProvider>
          </FormControl>
        );
      }}
    />
  );
}
