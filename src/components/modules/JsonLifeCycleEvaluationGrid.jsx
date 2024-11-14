import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Divider,
  Card,
  CardContent,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Stack,
  styled,
  SvgIcon,
} from '@mui/material';

import moment from 'moment-timezone';

import {
  Timeline,
  timelineClasses,
  TimelineConnector,
  TimelineContent,
  timelineContentClasses,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  timelineOppositeContentClasses,
  TimelineSeparator,
} from '@mui/lab';
import { ArrowForwardIos, CancelRounded, CheckCircleRounded } from '@mui/icons-material';

import { SeverityPill } from '../SeverityPill';
import { convertTimeToDescription, convertUnixToLocalTime } from '../../utils/utils';

const Accordion = styled((props) => <MuiAccordion disableGutters elevation={0} square {...props} />)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary expandIcon={<ArrowForwardIos sx={{ fontSize: '0.9rem' }} />} {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));
const JsonLifeCycleEvaluationGrid = ({ evalData, showModule = false }) => {
  console.log('evalData', evalData);
  const [expanded, setExpanded] = React.useState('panel1');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  // Why this is not in Utils?
  const formatTime = (unixTime) => {
    if (!unixTime) return '-';
    return convertUnixToLocalTime(unixTime);
  };
  // Function to check if momentName contains the word "Question"
  const isQuestionMoment = (moment) => moment?.momentName?.toLowerCase()?.includes('question');

  const renderQuestion = (moment) => {
    // Extract the part of the string that starts with "Question" and ends before "Right Options"
    const questionText = moment?.answers[0]?.object?.split('Right Options:')[0]?.replace('Question:', '')?.trim();

    return `${moment.momentName}: ${questionText || ''}`;
  };

  const renderAnswers = (answers) => {
    if (!answers || answers.length === 0) return <Typography variant="body2">No answers provided</Typography>;

    const onRightAnswers = answers.filter((ans) => ans.eventType === 'onRight');
    const onWrongAnswers = answers.filter((ans) => ans.eventType === 'onWrong');

    return (
      <Box m={4}>
        {onRightAnswers.length > 0 && (
          <Box>
            <Stack my={1} direction={'row'} alignItems={'center'} justifyContent={'start'} gap={2}>
              <SvgIcon color="success">
                <CheckCircleRounded />
              </SvgIcon>
              <Typography variant="subtitle1">Correct Answers:</Typography>
            </Stack>
            <Stack px={5}>
              {onRightAnswers.map((ans, index) => (
                <Typography key={index} variant="body2">
                  {ans.verb} {ans.object} at {formatTime(ans.time)}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
        {onWrongAnswers.length > 0 && (
          <Box>
            <Stack my={1} direction={'row'} alignItems={'center'} justifyContent={'start'} gap={2}>
              <SvgIcon color="error">
                <CancelRounded />
              </SvgIcon>
              <Typography variant="subtitle1">Wrong Answers:</Typography>
            </Stack>
            <Stack px={5}>
              {onWrongAnswers.map((ans, index) => (
                <Typography key={index} variant="body2">
                  {ans.verb} {ans.object} at {formatTime(ans.time)}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  };

  const renderQuestionAnswers = (answers) => {
    if (!answers || answers.length === 0) return <Typography variant="body2">No answers provided</Typography>;

    // Filter correct and wrong answers
    const onRightAnswers = answers.filter((ans) => ans.eventType === 'onRight');
    const onWrongAnswers = answers.filter((ans) => ans.eventType === 'onWrong');

    // If there is a wrong answer, we extract the "Right Options" from the "onWrong" answer
    const wrongAnswer = onWrongAnswers.length > 0 ? onWrongAnswers[0] : null;
    const correctOption = wrongAnswer?.object?.split('Right Options:')[1]?.split('Selected Options:')[0]?.trim();

    return (
      <Box m={4}>
        {onWrongAnswers.length > 0 && (
          <Box>
            {/* Render the wrong answer */}
            <Stack my={1} direction={'row'} alignItems={'center'} justifyContent={'start'} gap={2}>
              <SvgIcon color="error">
                <CancelRounded />
              </SvgIcon>
              <Typography variant="subtitle1">Wrong Answers:</Typography>
            </Stack>
            <Stack px={5}>
              {onWrongAnswers.map((answer, index) => (
                <Typography key={index} variant="body2" color="error">
                  Selected option: {answer?.object?.split('Selected Options:')[1]?.trim()} at {formatTime(answer.time)}
                </Typography>
              ))}
            </Stack>

            {/* Subtitle to tell the user what the correct option is */}
            {correctOption && (
              <Typography variant="subtitle2" mt={2}>
                The correct option was: {correctOption}
              </Typography>
            )}
          </Box>
        )}

        {/* If there are no wrong answers, render correct answers */}
        {onWrongAnswers.length === 0 && onRightAnswers.length > 0 && (
          <Box>
            <Stack my={1} direction={'row'} alignItems={'center'} justifyContent={'start'} gap={2}>
              <SvgIcon color="success">
                <CheckCircleRounded />
              </SvgIcon>
              <Typography variant="subtitle1">Correct Answers:</Typography>
            </Stack>
            <Stack px={5}>
              {onRightAnswers.map((answer, index) => (
                <Typography key={index} variant="body2">
                  Selected option: {answer?.object?.split('Selected Options:')[1]?.trim()} at {formatTime(answer.time)}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ borderColor: 'primary.main' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="subtitle1">{evalData?.evaluationDump?.moduleName}</Typography>
              </Grid>
              {!showModule && (
                <>
                  <Grid textAlign={'right'} item xs={4}>
                    <Typography variant="subtitle1">
                      <SeverityPill>{evalData?.status}</SeverityPill>
                    </Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography variant="body2">
                      Current Score: {evalData?.evaluationDump?.totalScored} / {evalData?.evaluationDump?.totalMark}
                    </Typography>
                  </Grid>
                </>
              )}

              <Grid item xs={3}>
                <Typography variant="body2">Passing Mark: {evalData?.evaluationDump?.passMark}</Typography>
              </Grid>
              {!showModule && (
                <Grid item textAlign={'right'} xs={6}>
                  <Typography color="gray" variant="caption">
                    {formatTime(evalData?.startTime)} - {evalData?.endTime ? formatTime(evalData.endTime) : 'Pending'}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item my={3} xs={12}>
        <Divider />
      </Grid>

      {evalData?.evaluationDump?.chapters?.map((chapter) => (
        <Grid item xs={12} key={chapter.chapterIndex}>
          <Accordion
            variant="outlined"
            expanded={expanded === chapter.chapterIndex}
            onChange={handleChange(chapter.chapterIndex)}
          >
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
              <Stack>
                <Typography variant="h6">{chapter.chapterName}</Typography>
                {!showModule && (
                  <>
                    <Typography variant="body2">
                      Total Score: {chapter.totalScored} / {chapter.totalMark}
                    </Typography>
                    <Typography variant="body2">
                      Total Time Taken:{' '}
                      {chapter.totalTimeTaken ? `${convertTimeToDescription(chapter.totalTimeTaken)} ` : '-'}
                    </Typography>
                  </>
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ display: 'flex', maxHeight: '50vh', overflowY: 'scroll' }}>
              <Box>
                <Timeline
                  sx={{
                    [`& .${timelineItemClasses.root}:before`]: {
                      flex: 0,
                      padding: 0,
                    },
                  }}
                >
                  {chapter?.moments?.map((moment) => (
                    <TimelineItem key={moment.momentIndex}>
                      <TimelineSeparator>
                        <TimelineDot color={!moment?.answers || moment?.answers.length === 0 ? 'grey' : 'primary'} />
                        <TimelineConnector
                          sx={{
                            backgroundColor:
                              !moment?.answers || moment?.answers.length === 0 ? 'primary.grey' : 'primary.main',
                          }}
                        />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Box>
                          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                            <Typography variant="subtitle1" sx={{ width: showModule ? '100%' : '70%' }}>
                              {isQuestionMoment(moment) ? renderQuestion(moment) : moment.momentName}
                            </Typography>
                            {!showModule && (
                              <Typography variant="body2">
                                Time Taken:{' '}
                                {moment.totalTimeTaken ? `${convertTimeToDescription(moment.totalTimeTaken)} ` : '-'}
                              </Typography>
                            )}
                          </Stack>
                          {!showModule && (
                            <Box my={2}>
                              <Typography variant="body2">Start Time: {formatTime(moment.startTime)}</Typography>
                              <Typography variant="body2">
                                Score: {moment.totalScored} / {moment.weightage}
                              </Typography>

                              {/* <Typography variant="body2">End Time: {formatTime(moment.endTime)}</Typography> */}

                              {isQuestionMoment(moment)
                                ? renderQuestionAnswers(moment.answers)
                                : renderAnswers(moment.answers)}
                            </Box>
                          )}
                        </Box>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>
      ))}
    </Grid>
  );
};

export default JsonLifeCycleEvaluationGrid;
