import { Alert, Box, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFRadioGroup } from '../hook-form';

const QuestionCard = ({
  question,
  options = [],
  showValues = false,
  correctValue,
  answeredValue,
  notEditable = false,
}) => {
  const defaultValues = {
    choice: showValues ? answeredValue : correctValue,
  };
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

  const onSubmit = async (values) => {
    try {
      // DO something
    } catch (error) {
      console.log('Error');
    }
  };

  const getSelectedColor = () => {
    if (showValues) {
      if (answeredValue === correctValue) {
        return 'success';
      }
      return 'error';
    }
    return 'success';
  };

  // Modify the options array to include the 'disabled' property
  const modifiedOptions = notEditable
    ? options.map((option) => ({
        ...option,
        disabled: true,
      }))
    : options;

  return (
    <Paper variant="outlined">
      <Paper sx={{ backgroundColor: 'lightgray', padding: 2 }}>
        <Typography>{question}</Typography>
      </Paper>
      <Box sx={{ padding: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <RHFRadioGroup
            name="choice"
            selectedValue={showValues ? answeredValue : correctValue}
            selectedColor={getSelectedColor()}
            options={modifiedOptions}
            row={false}
          />
        </FormProvider>
      </Box>
      {showValues && (
        <Box>
          {correctValue === answeredValue ? (
            <Alert severity="success">
              <span style={{ fontWeight: 'bold' }}> Right Answer </span>, Correct option is{' '}
              <span style={{ fontWeight: 'bold' }}>{correctValue}</span>
            </Alert>
          ) : (
            <Alert severity="error">
              <span style={{ fontWeight: 'bold' }}> Wrong Answer </span>, Correct option is{' '}
              <span style={{ fontWeight: 'bold' }}>{correctValue}</span>
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default QuestionCard;
