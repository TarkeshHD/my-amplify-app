import { Box, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFRadioGroup } from '../hook-form';

const QuestionCard = ({ question, options = [], correctValue }) => {
  const defaultValues = {
    choice: correctValue,
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

  return (
    <Paper variant="outlined">
      <Paper sx={{ backgroundColor: 'lightgray', padding: 2 }}>
        <Typography>{question}</Typography>
      </Paper>
      <Box sx={{ padding: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <RHFRadioGroup name="choice" correctValue={correctValue} options={options} row={false} />
        </FormProvider>
      </Box>
    </Paper>
  );
};

export default QuestionCard;
