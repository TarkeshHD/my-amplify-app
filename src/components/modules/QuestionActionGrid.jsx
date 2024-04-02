import { Grid, Typography } from '@mui/material';
import React from 'react';
import { SeverityPill } from '../SeverityPill';
import QuestionCard from './QuestionCard';

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

const QuestionsActionGrid = ({ showValues = false, evalData, evaluation = EVAL_SAMPLE }) => {
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
          <Grid item xs={4} />
          <Grid item textAlign={'right'} xs={2}>
            <SeverityPill color={statusMap[evalData?.status]}>{evalData?.status}</SeverityPill>
            <Typography color={'text.disabled'} fontWeight={'bold'} variant="body2" display={'block'}>
              Score: {evalData?.score}
            </Typography>
          </Grid>
        </>
      )}
      {evaluation.map((v, i) => (
        <Grid key={i} item xs={6}>
          {v?.type === 'question' ? (
            <QuestionCard
              notEditable={true}
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
              timeRequired={v.timeRequired || 0}
              timeTaken={v.timeTaken || 0}
            />
          ) : (
            <QuestionCard
              notEditable={true}
              question={v.title || 'कौन सी क्रेन सुरक्षित है ? ट्रेडिशनल हायड्रा या फराना नई जनरेशन क्रेन ?'}
              options={[
                { label: v.descriptionSuccess || 'Success Description', value: 'success' },
                { label: v.descriptionFailure || 'Description For Failure', value: 'a' },
              ]}
              correctValue={'success'}
              answeredValue={v.answeredValue}
              showValues={showValues}
              action={true}
              descriptionSuccess={v.descriptionSuccess}
              timeRequired={20}
              timeTaken={10}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default QuestionsActionGrid;
