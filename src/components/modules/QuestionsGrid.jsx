import { Grid } from '@mui/material';
import React from 'react';
import QuestionCard from './QuestionCard';

const QuestionsGrid = () => (
  <Grid container spacing={2}>
    {[1, 2, 3, 4, 5, 6, 7, 1, 3, 2].map((v, i) => (
      <Grid key={i} item xs={6}>
        <QuestionCard
          question={'कौन सी क्रेन सुरक्षित है ? ट्रेडिशनल हायड्रा या फराना नई जनरेशन क्रेन ?'}
          options={[
            { label: 'फराना नई जनरेशन क्रेन', value: 'a' },
            { label: 'ट्रेडिशनल हायड्रा', value: 'b' },
            { label: 'उपर में से कोई भी नहीं।', value: 'c' },
            { label: 'उपरोक्त सभी', value: 'd' },
          ]}
          correctValue={'a'}
        />
      </Grid>
    ))}
  </Grid>
);

export default QuestionsGrid;
