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

import axios from '../../utils/axios';
import { useConfig } from '../../hooks/useConfig';
import { toast } from 'react-toastify';
import { SeverityPill } from '../SeverityPill';
import { convertTimeToDescription, convertUnixToLocalTime } from '../../utils/utils';
import { PremiumFeatureAlert } from '../premium/PremiumFeatureAlert';
import { UpgradeModel } from '../premium/UpgradeModal';

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
const JsonLifeCycleTrainingGrid = ({ trainingData }) => {
  const [expanded, setExpanded] = React.useState('panel1');
  const [successFormOpen, setSuccessFormOpen] = React.useState(false);
  const { data: configData } = useConfig();

  const isFreeTrialUser = configData?.freeTrial;
  if (isFreeTrialUser) {
    trainingData.trainingDumpJson.chapters = trainingData?.trainingDumpJson?.chapters?.slice(0, 1);
  }

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  // Why this is not in Utils?
  const formatTime = (unixTime) => {
    if (!unixTime) return '-';
    return convertUnixToLocalTime(unixTime);
  };

  if (trainingData?.trainingType !== 'jsonLifeCycle') return null;

  const renderAnswers = (answers) => {
    if (!answers || answers.length === 0)
      return <Typography variant="body2">No reached at this moment yet.</Typography>;
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

  const onClickUpgrade = async () => {
    if (localStorage.getItem('hasRequestedAccountUpgrade') === 'true') {
      setSuccessFormOpen(true);
    }
    try {
      const response = await axios.post('/user/upgrade-account', {});
      if (response.data.success) {
        localStorage.setItem('hasRequestedAccountUpgrade', true);
        setSuccessFormOpen(true);
      } else {
        toast.error('Failed to request for account upgrade.');
      }
    } catch (error) {
      toast.error('An error occurred while requesting for account upgrade.');
      console.error(error);
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ borderColor: 'primary.main' }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="subtitle1">{trainingData.trainingDumpJson?.moduleName}</Typography>
              </Grid>

              <Grid textAlign={'right'} item xs={4}>
                <Typography variant="subtitle1">
                  <SeverityPill>{trainingData.status}</SeverityPill>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography color="gray" variant="caption">
                  {trainingData?.session}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item my={3} xs={12}>
        <Divider />
      </Grid>

      {trainingData?.trainingDumpJson?.chapters?.map((chapter) => (
        <Grid item xs={12} key={chapter.chapterIndex}>
          <Accordion
            variant="outlined"
            expanded={expanded === chapter.chapterIndex}
            onChange={handleChange(chapter.chapterIndex)}
          >
            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
              <Stack>
                <Typography variant="h6">{chapter.chapterName}</Typography>
                {/* <Typography variant="body2">
                  Total Score: {chapter.totalScored} / {chapter.totalMark}
                </Typography> */}
                <Typography variant="body2">
                  Total Time Taken:{' '}
                  {chapter.totalTimeTaken ? `${convertTimeToDescription(chapter.totalTimeTaken)} ` : '-'}
                </Typography>
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
                  {chapter.moments.map((moment) => (
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
                            <Typography variant="subtitle1">{moment.momentName}</Typography>
                            <Typography variant="body2">
                              Time Taken:{' '}
                              {moment.totalTimeTaken ? `${convertTimeToDescription(moment.totalTimeTaken)} ` : '-'}
                            </Typography>
                          </Stack>
                          <Box my={2}>
                            <Typography variant="body2">Start Time: {formatTime(moment.startTime)}</Typography>

                            {/* <Typography variant="body2">End Time: {formatTime(moment.endTime)}</Typography> */}

                            {renderAnswers(moment.answers)}
                          </Box>
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
      {isFreeTrialUser && (
        <PremiumFeatureAlert
          onClickUpgrade={onClickUpgrade}
          message="Upgrade to unlock more evaluation insights"
          sx={{ margin: 1 }}
        />
      )}
      <UpgradeModel isModalOpen={successFormOpen} setModalOpen={setSuccessFormOpen} />
    </Grid>
  );
};

export default JsonLifeCycleTrainingGrid;
