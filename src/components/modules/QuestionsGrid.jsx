import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import QuestionCard from './QuestionCard';
import { SeverityPill } from '../SeverityPill';

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

const QuestionsGrid = ({ showValues = false, evalData, evaluation = EVAL_SAMPLE }) => {
  console.log('Eval data', evaluation);
  return (
    <Grid container spacing={2}>
      {showValues && (
        <>
          <Grid item xs={6}>
            <Typography variant="body1"> {evalData?.username} </Typography>
            <Typography color={'text.disabled'} fontWeight={'bold'} variant="caption">
              {evalData?.session}{' '}
            </Typography>
          </Grid>
          <Grid item xs={5} />
          <Grid item textAlign={'right'} xs={1}>
            <SeverityPill color={statusMap[evalData?.status]}>{evalData?.status}</SeverityPill>
          </Grid>
        </>
      )}
      {evaluation.map((v, i) => (
        <Grid key={i} item xs={6}>
          <QuestionCard
            question={v.title || 'कौन सी क्रेन सुरक्षित है ? ट्रेडिशनल हायड्रा या फराना नई जनरेशन क्रेन ?'}
            options={[
              { label: v.options?.a || 'फराना नई जनरेशन क्रेन', value: 'a' },
              { label: v.options?.b || 'ट्रेडिशनल हायड्रा', value: 'b' },
              { label: v.options?.c || 'उपर में से कोई भी नहीं।', value: 'c' },
              { label: v.options?.d || 'उपरोक्त सभी', value: 'd' },
            ]}
            correctValue={v.answer}
            answeredValue={v.answeredValue}
            showValues={showValues}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default QuestionsGrid;
