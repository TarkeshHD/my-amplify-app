import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Radio, RadioGroup, FormHelperText, FormControlLabel } from '@mui/material';

// ----------------------------------------------------------------------

RHFRadioGroup.propTypes = {
  name: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  getOptionLabel: PropTypes.arrayOf(PropTypes.string),
};

export default function RHFRadioGroup({ name, options, getOptionLabel, correctValue, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <RadioGroup {...field} row {...other}>
            {options.map((option, index) => (
              <FormControlLabel
                key={option?.label}
                value={option?.value}
                control={<Radio color={option?.value === correctValue ? 'success' : 'primary'} />}
                label={getOptionLabel?.length ? getOptionLabel[index] : option?.label}
                disabled={option?.disabled}
              />
            ))}
          </RadioGroup>

          {!!error && (
            <FormHelperText error sx={{ px: 2 }}>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}
