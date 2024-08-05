import React from 'react';
import { Grid, Typography, Box, Divider } from '@mui/material';
import moment from 'moment-timezone';
/*
    Just the representation and how to get the values. 
import { secondsToHHMMSS } from './TimeGrid';
    For converting seconds to meaningful hours, minutes format can use util function -> 
*/
const JsonLifeCycleEvaluationGrid = ({ evalData }) => {
  const tz = moment.tz.guess();

  const formatTime = (unixTime) => {
    if (!unixTime) return '-';
    return moment.unix(unixTime).tz(tz).format('DD/MM/YYYY, HH:mm:ss');
  };

  const renderAnswers = (answers) => {
    if (!answers || answers.length === 0) return <Typography variant="body2">No answers provided</Typography>;

    const onRightAnswers = answers.filter((ans) => ans.eventType === 'onRight');
    const onWrongAnswers = answers.filter((ans) => ans.eventType === 'onWrong');

    return (
      <Box ml={4}>
        {onRightAnswers.length > 0 && (
          <>
            <Typography variant="subtitle1">Correct Answers:</Typography>
            {onRightAnswers.map((ans, index) => (
              <Typography key={index} variant="body2">
                {ans.verb} {ans.object} at {formatTime(ans.time)}
              </Typography>
            ))}
          </>
        )}
        {onWrongAnswers.length > 0 && (
          <>
            <Typography variant="subtitle1">Wrong Answers:</Typography>
            {onWrongAnswers.map((ans, index) => (
              <Typography key={index} variant="body2">
                {ans.verb} {ans.object} at {formatTime(ans.time)}
              </Typography>
            ))}
          </>
        )}
      </Box>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Evaluation Details</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">
          <strong>Username:</strong> {evalData.username}
        </Typography>
        <Typography variant="body1">
          <strong>Module Name:</strong> {evalData.evaluationDump.moduleName}
        </Typography>
        <Typography variant="body1">
          <strong>Status:</strong> {evalData.status}
        </Typography>
        <Typography variant="body1">
          <strong>Start Time:</strong> {formatTime(evalData.startTime)}
        </Typography>
        <Typography variant="body1">
          <strong>End Time:</strong> {evalData.endTime ? formatTime(evalData.endTime) : 'Pending'}
        </Typography>
        <Typography variant="body1">
          <strong>Score:</strong> {evalData.evaluationDump.totalScored} / {evalData.evaluationDump.totalMark}
        </Typography>
        <Typography variant="body1">
          <strong>Pass Mark:</strong> {evalData.evaluationDump.passMark}
        </Typography>
      </Grid>
      {evalData.evaluationDump.chapters.map((chapter) => (
        <Grid item xs={12} key={chapter.chapterIndex}>
          <Box mt={2}>
            <Typography variant="h6">{chapter.chapterName}</Typography>
            <Typography variant="body2">
              Total Score: {chapter.totalScored} / {chapter.totalMark}
            </Typography>
            <Typography variant="body2">
              Total Time Taken: {chapter.totalTimeTaken ? `${chapter.totalTimeTaken} seconds` : '-'}
            </Typography>
            <Divider />
            {chapter.moments.map((moment) => (
              <Box key={moment.momentIndex} ml={2} mt={2}>
                <Typography variant="subtitle1">{moment.momentName}</Typography>
                <Typography variant="body2">
                  Score: {moment.totalScored} / {moment.weightage}
                </Typography>
                <Typography variant="body2">Start Time: {formatTime(moment.startTime)}</Typography>
                <Typography variant="body2">End Time: {formatTime(moment.endTime)}</Typography>
                <Typography variant="body2">
                  Time Taken: {moment.totalTimeTaken ? `${moment.totalTimeTaken} seconds` : '-'}
                </Typography>
                {renderAnswers(moment.answers)}
              </Box>
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default JsonLifeCycleEvaluationGrid;
