import { Box, Grid, Typography } from '@mui/material';
import React from 'react';
import QuestionCard from './QuestionCard';
import { SeverityPill } from '../SeverityPill';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
};

const QuestionsGrid = ({ showValues = false, evalData }) => {
  console.log('Eval data', evalData);
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
      {[
        { correctValue: 'a', answeredValue: 'b' },
        { correctValue: 'a', answeredValue: 'c' },
        { correctValue: 'd', answeredValue: 'd' },
        { correctValue: 'd', answeredValue: 'b' },
        { correctValue: 'b', answeredValue: 'b' },
        { correctValue: 'c', answeredValue: 'b' },
        { correctValue: 'c', answeredValue: 'c' },
        { correctValue: 'a', answeredValue: 'b' },
      ].map((v, i) => (
        <Grid key={i} item xs={6}>
          <QuestionCard
            question={'कौन सी क्रेन सुरक्षित है ? ट्रेडिशनल हायड्रा या फराना नई जनरेशन क्रेन ?'}
            options={[
              { label: 'फराना नई जनरेशन क्रेन', value: 'a' },
              { label: 'ट्रेडिशनल हायड्रा', value: 'b' },
              { label: 'उपर में से कोई भी नहीं।', value: 'c' },
              { label: 'उपरोक्त सभी', value: 'd' },
            ]}
            correctValue={v.correctValue}
            answeredValue={v.answeredValue}
            showValues={showValues}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default QuestionsGrid;
