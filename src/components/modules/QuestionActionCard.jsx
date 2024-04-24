import { Alert, Box, Paper, Typography } from '@mui/material';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FormProvider, RHFRadioGroup } from '../hook-form';

const QuestionActionCard = ({
  question,
  options = [],
  showValues = false,
  correctValue,
  answeredValue,
  notEditable = false,
  action = false,
  timeRequired = 0,
  descriptionSuccess = '',
  timeTaken = 0,
  weightage = 1,
  type,
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

  let correctValueToDisplay = correctValue;
  if (correctValue === 'success') {
    correctValueToDisplay = descriptionSuccess;
  }
  return (
    <Paper variant="outlined">
      <Paper sx={{ backgroundColor: 'lightgray', padding: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography>{question}</Typography>
        <Box>
          {timeRequired > 0 && (
            <>
              {timeTaken > 0 && (
                <Typography variant="body2">
                  Time Taken:
                  <span style={{ color: timeTaken > timeRequired ? 'red' : 'green' }}> {timeTaken} seconds</span>
                </Typography>
              )}
              <Typography color={''} variant="body2">
                Time Required: {timeRequired} seconds
              </Typography>
            </>
          )}
          {!answeredValue && <Typography variant="body2">Points : {weightage}</Typography>}
        </Box>
      </Paper>
      <Box sx={{ padding: 2 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <RHFRadioGroup
            name="choice"
            selectedValue={showValues ? answeredValue : correctValue}
            selectedColor={getSelectedColor()}
            options={options}
            row={false}
          />
        </FormProvider>
      </Box>
      {showValues && (
        <Box>
          {correctValue === answeredValue ? (
            <Alert severity="success">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>
                  {type === 'question' ? (
                    <>
                      <span style={{ fontWeight: 'bold' }}> Right Answer: </span>
                      <span style={{ fontWeight: 'bold' }}>{correctValueToDisplay}</span>
                    </>
                  ) : (
                    <span style={{ fontWeight: 'bold' }}> Right Action Performed </span>
                  )}
                </span>

                <span style={{ fontWeight: 'bold' }}> + {weightage} points </span>
              </Box>
            </Alert>
          ) : (
            <Alert severity="error">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <span>
                  {type === 'question' ? (
                    <span>
                      <span style={{ fontWeight: 'bold' }}> Wrong Answer </span>, Correct option is{' '}
                      <span style={{ fontWeight: 'bold' }}>{correctValueToDisplay}</span>
                    </span>
                  ) : (
                    <span style={{ fontWeight: 'bold' }}> Wrong Action Performed </span>
                  )}
                </span>
                <span style={{ fontWeight: 'bold' }}> + 0 points </span>
              </Box>
            </Alert>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default QuestionActionCard;
