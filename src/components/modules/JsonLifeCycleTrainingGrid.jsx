import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Divider,
  Card,
  Chip,
  CardContent,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Stack,
  styled,
  SvgIcon,
  LinearProgress,
  Button,
  Tooltip
} from '@mui/material';

import moment from 'moment-timezone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import HighlightOffRounded from '@mui/icons-material/HighlightOffRounded';


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
import {
  AdminPanelSettingsRounded,
  ArrowForwardIos,
  CancelRounded,
  CheckCircleOutlineRounded,
  CheckCircleRounded,
  DoneAllRounded,
  ExitToAppRounded,
  PanToolRounded,
  PersonAddOutlined,
  SecurityOutlined,
  TaskAltRounded,
  ThumbDownAltOutlined,
  ThumbUpAltOutlined,
  TouchAppRounded,
} from '@mui/icons-material';

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
  console.log('Training Data', trainingData);
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
  const formatOnlyTime = (unixTime) => {
    if (!unixTime) return '-';
    const date = new Date(unixTime * 1000);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 👈 This is the key for 24-hour format
    });

  };
  if (trainingData?.trainingType !== 'jsonLifeCycle') return null;

  const renderAnswers = (answers) => {
    if (!answers || answers.length === 0) return <Typography variant="body2">No answers provided</Typography>;

    // Sort all answers by time to maintain chronological order
    const sortedAnswers = [...answers].sort((a, b) => a.time - b.time);
    const isMultiplayer = trainingData?.isMultiplayer || trainingData?.session?.isMultiplayer;
    const [showAllEvents, setShowAllEvents] = useState(false);

    // Create event icon and color mapping with modern icons
    const eventConfig = {
      onRight: {
        icon: <CheckCircleOutlineRounded />,
        color: "#4caf50",
        label: "Correct Answer"
      },
      onWrong: {
        icon: <HighlightOffRounded />,
        color: "#f44336",
        label: "Wrong Answer"
      },
      onRightTrigger: {
        icon: <ThumbUpAltOutlined />,
        color: "#4caf50",
        label: "Right Trigger"
      },
      onWrongTrigger: {
        icon: <ThumbDownAltOutlined />,
        color: "#ff9800",
        label: "Wrong Trigger"
      },
      joined: {
        icon: <PersonAddOutlined />,
        color: "#4caf50",
        label: "User Joined"
      },
      exited: {
        icon: <ExitToAppRounded />,
        color: "#f44336",
        label: "User Left"
      },
      onAdminChange: {
        icon: <SecurityOutlined />,
        color: "#9c27b0",
        label: "Admin Change"
      },
      onMomentComplete: {
        icon: <TaskAltRounded />,
        color: "#3f51b5",
        label: "Moment Completed"
      }
    };

    // Helper function to convert hex color to RGB array for shadow effects
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [117, 117, 117];
    };
     // Determine which answers to display
     const visibleAnswers = showAllEvents ? sortedAnswers : sortedAnswers.slice(0, 2);
     const showMoreButton = sortedAnswers.length > 2;
     
     // Determine if we should show the bottom white cap
     // We only show it if there are events to display
     const showBottomCap = visibleAnswers.length > 0;

    return (
      <Box sx={{ p: '24px 24px 24px 35px',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 .5px 0 rgba(0, 0, 0, 0.1)' }}>
        <Typography
          variant="h6"
          fontWeight={600}
          mb={2.5}
          sx={{
            color: '#1e293b',
            fontSize: '1.1rem',
            letterSpacing: '0.3px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Timeline of Events
        </Typography>

        {/* Timeline container */}
        <Box sx={{
          position: 'relative',
          ml: 2,
          pl: 4,
          borderLeft: '1px solid rgba(0,0,0,0.08)',
          ...(showBottomCap ? {
            '&::after': {
              content: '""',
              position: 'absolute',
              left: -1,
              bottom: 0,
              width: 1,
              height: 12,
    
            }
          } : {})
        }}>
          {sortedAnswers.slice(0, showAllEvents ? sortedAnswers.length : 2).map((event, index) => {
            const config = eventConfig[event.eventType];
            if (!config) return null; // Skip events without configuration

            // Format message based on event type
            let eventMessage = '';
            if (event.eventType === 'onAdminChange') {
              eventMessage = 'became admin';
            } else if (event.eventType === 'onMomentComplete') {
              eventMessage = 'Completed moment';
            } else if (event.eventType === 'joined') {
              eventMessage = 'joined';
            } else if (event.eventType === 'exited') {
              eventMessage = 'exited';
            } else {
              eventMessage = `${event.verb} ${event.object}`;
            }

            return (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  mb: 3,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(2px)'
                  },
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: -36,
                    top: 19,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: typeof config.color === 'string' ? config.color : '#757575',
                    boxShadow: `0 0 0 3px rgba(${typeof config.color === 'string' ?
                      hexToRgb(config.color).join(',') : '117,117,117'}, 0.15)`
                  }
                }}
              >
                {/* Time marker */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    position: 'absolute',
                    left: -105,
                    top: 15,
                    width: 64,
                    textAlign: 'right',
                    fontSize: '0.7rem',
                    letterSpacing: 0.2
                  }}
                >
                  {formatOnlyTime(event.time)}
                </Typography>

                {/* Event content */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(0,0,0,0.02)',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)'
                  }
                }}>
                  <SvgIcon
                    sx={{
                      color: config.color,
                      mt: 0.3,
                      flexShrink: 0,
                      fontSize: '1.1rem',
                      opacity: 0.85
                    }}
                  >
                    {config.icon}
                  </SvgIcon>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight="500"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.85rem',
                        mb: 0.5
                      }}
                    >
                      {config.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.8rem',
                        lineHeight: 1.4
                      }}
                    >
                      {isMultiplayer && event.userId && (
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: "500",
                            color: 'primary.main',
                            mr: 0.5
                          }}
                        >
                          {event.userId.name || 'User'}{' '}
                        </Typography>
                      )}
                      {eventMessage}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Show More Button */}
          {sortedAnswers.length > 2 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 1,
                mb: 2,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: -36,
                  top: '50%',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  transform: 'translateY(-50%)',
                  opacity: 0.6
                }
              }}
            >
              <Button
                size="small"
                variant="text"
                onClick={() => setShowAllEvents(!showAllEvents)}
                endIcon={showAllEvents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                {showAllEvents ? 'Show Less' : `Show ${sortedAnswers.length - 2} More Events`}
              </Button>
            </Box>
          )}
        </Box>
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
        <Card
          sx={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: '#ffffff'
          }}
        >
          {/* Header */}
          <Box sx={{
            p: 2.5,
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    fontSize: '1.3rem',
                    letterSpacing: '0.3px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {trainingData.trainingDumpJson?.moduleName}
                </Typography>

              </Grid>

              <Grid item>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {(() => {
                    const statusConfig = {
                      'completed': {
                        icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981', mr: 1 }} />,
                        color: '#10b981',
                        bgColor: '#ecfdf5',
                        border: '1px solid #d1fae5'
                      },
                      'ongoing': {
                        icon: <HourglassEmptyIcon sx={{ fontSize: 20, color: '#f59e0b', mr: 1 }} />,
                        color: '#f59e0b',
                        bgColor: '#fffbeb',
                        border: '1px solid #fef3c7'
                      },
                    };

                    const status = trainingData?.status || 'Not Started';
                    const config = statusConfig[status] || statusConfig['Not Started'];

                    return (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 2,
                          py: 1,
                          borderRadius: '8px',
                          backgroundColor: config.bgColor,
                          border: config.border
                        }}
                      >
                        {config.icon}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: config.color
                          }}
                        >
                          Status: {status}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Main content */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              {/* Key metrics in boxes */}
              <Grid item xs={12}>
                <Grid container spacing={3} justifyContent="center">


                  {/* Participants Box */}
                  {trainingData?.isMultiplayer && <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: '10px',
                        bgcolor: '#f8fafc',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <PeopleOutlineIcon sx={{ color: '#8b5cf6', fontSize: 22, mr: 1 }} />
                        <Typography variant="body2" color="#64748b" fontWeight={500}>
                          Participants
                        </Typography>
                      </Box>

                      <Typography variant="h4" fontWeight={700} sx={{ color: '#334155' }}>
                        {trainingData?.participants?.length || 0}
                      </Typography>

                      <Box sx={{ mt: 1.5, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 16, mr: 0.75 }} />
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {trainingData?.completedParticipants?.length || 0} completed
                          </Typography>
                        </Box>

                        {trainingData?.participants?.length > 0 && (
                          <LinearProgress
                            variant="determinate"
                            value={(trainingData?.completedParticipants?.length / trainingData?.participants?.length) * 100 || 0}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: 'rgba(226, 232, 240, 0.6)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#10b981'
                              }
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>}


                  {/* Time Box */}
                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: '10px',
                        bgcolor: '#f8fafc',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <AccessTimeIcon sx={{ color: '#0ea5e9', fontSize: 22, mr: 1 }} />
                        <Typography variant="body2" color="#64748b" fontWeight={500}>
                          Time Info
                        </Typography>
                      </Box>
                      {trainingData?.trainingDumpJson?.startTime && trainingData?.trainingDumpJson?.endTime ? (
                        (() => {
                          const endTime = trainingData?.trainingDumpJson?.endTime ? trainingData?.trainingDumpJson?.endTime : undefined;
                          const startTime = trainingData?.trainingDumpJson?.startTime;
                          const duration = endTime ? endTime - startTime : undefined;
                          const time = convertTimeToDescription(duration).replace('minutes', 'min')
                            .replace('minute', 'min')
                            .replace('seconds', 'sec')
                            .replace('second', 'sec');

                          return (
                            <Typography variant="h4" fontWeight={600} sx={{ color: '#334155' }}>
                              {duration > 0 ? time : '-'}
                            </Typography>
                          );
                        })()
                      ) : (
                        <Typography variant="h4" fontWeight={700} sx={{ color: '#334155' }}>
                          —
                        </Typography>
                      )}

                      <Box sx={{ mt: 1.5, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: { xs: 1, sm: 1.5 },
                            py: 0.75,
                            borderRadius: '6px',
                            bgcolor: '#e0f2fe',
                            whiteSpace: 'nowrap',
                            minWidth: { xs: '90%', sm: '70%' },
                            maxWidth: '100%'
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#0284c7',
                              fontWeight: 500,
                              fontSize: { xs: '0.6rem', sm: '0.65rem' }
                            }}
                          >
                            {formatTime(trainingData?.trainingDumpJson?.startTime)}
                          </Typography>

                          {trainingData?.trainingDumpJson?.endTime ? (
                            <>
                              <ArrowRightAltIcon sx={{ mx: { xs: 0.3, sm: 0.5 }, fontSize: { xs: 12, sm: 14 }, color: '#0284c7' }} />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#0284c7',
                                  fontWeight: 500,
                                  fontSize: { xs: '0.6rem', sm: '0.65rem' }
                                }}
                              >
                                {formatTime(trainingData?.trainingDumpJson?.endTime)}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <ArrowRightAltIcon sx={{ mx: { xs: 0.3, sm: 0.5 }, fontSize: { xs: 12, sm: 14 }, color: '#0284c7' }} />
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FiberManualRecordIcon sx={{ fontSize: { xs: 6, sm: 8 }, mr: 0.5, color: '#ef4444' }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#ef4444',
                                    fontWeight: 600,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                  }}
                                >
                                  now
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Participant Details Section */}
              {trainingData?.isMultiplayer && <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569', fontSize: '0.85rem' }}>
                  Participant Details
                </Typography>

                <Grid container spacing={2}>
                  {/* All Participants */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        All Participants ({trainingData?.participants?.length || 0})
                      </Typography>
                    </Box>

                    {trainingData?.participants && trainingData?.participants.length > 0 ? (
                      <Box sx={{ position: 'relative' }}>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'nowrap', overflowX: 'hidden' }}>
                          {trainingData.participants.slice(0, 3).map((name, index) => (
                            <Chip
                              key={index}
                              label={
                                name === trainingData.username
                                  ? `${name} (host)`
                                  : name
                              }
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 24,
                                borderRadius: '6px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          ))}
                          {trainingData?.participants?.length > 3 && (
                            <Tooltip
                              placement="right-end"
                              title={
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>All Participants</Typography>
                                  <Stack spacing={0.5} sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {trainingData?.participants.map((participant, idx) => (
                                      <Typography key={idx} sx={{ fontSize: '0.8rem' }}>
                                        {participant}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              }
                              arrow
                            >
                              <Chip
                                label={`+${trainingData.participants.length - 3}`}
                                size="small"
                                onClick={() => { }}
                                sx={{
                                  height: 24,
                                  borderRadius: '6px',
                                  backgroundColor: '#e2e8f0',
                                  fontWeight: 600,
                                  color: '#475569',
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  '& .MuiChip-label': {
                                    px: 1.5
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        No participants assigned
                      </Typography>
                    )}
                  </Grid>

                  {/* Completed Participants */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Completed ({trainingData?.completedParticipants?.length || 0} of {trainingData?.participants?.length || 0})
                      </Typography>
                    </Box>

                    {trainingData?.completedParticipants && trainingData.completedParticipants.length > 0 ? (
                      <Box sx={{ position: 'relative' }}>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'nowrap', overflowX: 'hidden' }}>
                          {trainingData.completedParticipants.slice(0, 3).map((participant, index) => (
                            <Chip
                              key={index}
                              label={participant}
                              size="small"
                              sx={{
                                height: 24,
                                borderRadius: '6px',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #dcfce7',
                                color: '#16a34a',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          ))}
                          {trainingData.completedParticipants.length > 3 && (
                            <Tooltip
                              title={
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Completed Participants</Typography>
                                  <Stack spacing={0.5} sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {trainingData.completedParticipants.map((participant, idx) => (
                                      <Typography key={idx} sx={{ fontSize: '0.8rem' }}>
                                        {participant}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              }
                              arrow
                            >
                              <Chip
                                label={`+${trainingData.completedParticipants.length - 3}`}
                                size="small"
                                onClick={() => { }}
                                sx={{
                                  height: 24,
                                  borderRadius: '6px',
                                  backgroundColor: '#dcfce7',
                                  color: '#16a34a',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  cursor: 'pointer',
                                  '& .MuiChip-label': {
                                    px: 1.5
                                  }
                                }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        No participants completed yet
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Grid>}

            </Grid>
          </Box>
        </Card>
      </Grid>

      {trainingData?.trainingDumpJson?.chapters?.map((chapter) => (
        <Grid item xs={12} key={chapter.chapterIndex}>
          <Accordion
            variant="outlined"
            expanded={expanded === chapter.chapterIndex}
            onChange={handleChange(chapter.chapterIndex)}
          >
       <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
  <Stack
    direction="row"
    justifyContent="space-between"
    alignItems="center"
    sx={{ width: '100%' }}
  >
    <Typography
      variant="h6"
      sx={{
        fontSize: '1.2rem',
        letterSpacing: '0.3px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {chapter.chapterName}
    </Typography>

    <Box sx={{ display: 'flex', alignItems: 'center' ,mr:1.5 ,px:1}}>
      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
      <Typography variant="body2">
        {chapter.totalTimeTaken ? convertTimeToDescription(chapter.totalTimeTaken) : '-'}
      </Typography>
    </Box>
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
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1">{moment.momentName}</Typography>

                            <Box display="flex" alignItems="center">
                              <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                              <Typography variant="body2">
                                {moment.totalTimeTaken ? `${convertTimeToDescription(moment.totalTimeTaken)} ` : '-'}
                              </Typography>
                            </Box>
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
