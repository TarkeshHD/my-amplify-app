import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import QuestionCard from './QuestionCard';
import { SeverityPill } from '../SeverityPill';
import TimeCard from './TimeCard';
import moment from 'moment-timezone';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
};

const EVAL_SAMPLE = [
  { answer: 'a', answeredValue: 'b' },
  { answer: 'a', answeredValue: 'c' },
  { answer: 'd', answeredValue: 'd' },
  { answer: 'd', answeredValue: 'b' },
  { answer: 'b', answeredValue: 'b' },
  { answer: 'c', answeredValue: 'b' },
  { answer: 'c', answeredValue: 'c' },
  { answer: 'a', answeredValue: 'b' },
];

export const secondsToHHMMSS = (seconds) => {
  const duration = moment.duration(seconds, 'seconds');
  return moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
};

const TimeGrid = ({ showValues = false, evalData, evaluation = EVAL_SAMPLE }) => {
  return (
    <Grid container spacing={2}>
      {showValues && (
        <>
          <Grid item xs={6}>
            <Typography color={'text.disabled'} variant="caption" display={'block'}>
              {evalData?.username}
            </Typography>
            <Typography color={'text.disabled'} variant="caption">
              {evalData?.session}
            </Typography>
          </Grid>
          <Grid item xs={2} />
          <Grid item textAlign={'right'} xs={4}>
            <SeverityPill color={statusMap[evalData?.status]}>{evalData?.status}</SeverityPill>
            <Typography color={'text.disabled'} fontWeight={'bold'} variant="body2" display={'block'}>
              Score: {evalData?.score} | Time: {secondsToHHMMSS(evalData?.endTime - evalData?.startTime)}
            </Typography>
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <TimeCard tableData={evalData.mistakes} status={evalData.status} />
      </Grid>
    </Grid>
  );
};

export default TimeGrid;
