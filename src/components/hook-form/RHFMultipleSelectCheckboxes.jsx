import PropTypes from 'prop-types';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Chip } from '@mui/material';
import { Box } from '@mui/system';

RHFMultipleSelectCheckboxes.propTypes = {
  name: PropTypes.string,
};

export function RHFMultipleSelectCheckboxes({ onChangeCustom = undefined, name, options, label, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const handleChange = (event, value) => {
          onChangeCustom(value.props.value);
        };

        return (
          <FormControl sx={{ width: '100%' }}>
            <InputLabel id={`label-${name}`}>{label}</InputLabel>
            <Select
              labelId={`label-${name}`}
              id={`select-${name}`}
              multiple
              value={
                Object.entries(options)
                  .filter(([name, value]) => value === true)
                  .map(([name]) => name) || []
              }
              onChange={handleChange}
              renderInput={(params) => {}}
              renderValue={(selected) => (
                <div style={{ maxHeight: '38px', overflowY: 'auto' }}>
                  <style>
                    {/* For scrollbars */}
                    {`
         ::-webkit-scrollbar {
      width: 0.4em;
    }
            
    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: #888;
    }
    `}
                  </style>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                </div>
              )}
              onInputChange={(_, data) => {
                if (data) field.onChange(data);
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 300, overflow: 'auto' } } }}
              {...other}
            >
              {Object.keys(options).map((name) => (
                <MenuItem key={name} value={name}>
                  <Checkbox edge="start" checked={options[name]} disableRipple />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }}
    />
  );
}
