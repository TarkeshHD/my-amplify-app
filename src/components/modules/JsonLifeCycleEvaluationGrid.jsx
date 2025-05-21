import React, { useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  Card,
  CardContent,
  Accordion as MuiAccordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Stack,
  styled,
  SvgIcon,
  Button,
  LinearProgress,
  Tooltip,

} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlagIcon from '@mui/icons-material/Flag';
import GradeIcon from '@mui/icons-material/Grade';
import CheckIcon from '@mui/icons-material/Check';
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
import {
  ArrowForwardIos,
  CancelRounded,
  CheckCircleRounded,
  CheckCircleOutlineRounded,
  HighlightOffRounded,
  ThumbUpAltOutlined,
  ThumbDownAltOutlined,
  PersonAddOutlined,
  ExitToAppRounded, TaskAltRounded, SecurityOutlined,
  WorkspacePremium,
  TouchApp as TouchAppIcon,
  PanTool as PanToolIcon,
  DoneAll as DoneAllIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';

import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { SeverityPill } from '../SeverityPill';
import { convertTimeToDescription, convertUnixToLocalTime } from '../../utils/utils';
import { useConfig } from '../../hooks/useConfig';
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
const JsonLifeCycleEvaluationGrid = ({ evalData, showModule = false }) => {
  console.log('Evaluation Data', evalData);
  const { data: configData } = useConfig();
  const isFreeTrialUser = configData?.freeTrial;
  if (isFreeTrialUser) {
    evalData.evaluationDump.chapters = evalData?.evaluationDump?.chapters?.slice(0, 1);
  }
  const [expanded, setExpanded] = React.useState('panel1');
  const [successFormOpen, setSuccessFormOpen] = React.useState(false);

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

  // Function to check if momentName contains the word "Question"
  const isQuestionMoment = (moment) => moment?.momentName?.toLowerCase()?.includes('question');

  const renderQuestion = (moment) => {
    // Extract the part of the string that starts with "Question" and ends before "Right Options"
    const questionText = moment?.answers?.[0]?.object?.split('Right Options:')?.[0]?.replace('Question:', '')?.trim();

    return `${moment.momentName}: ${questionText || ''}`;
  };

  const renderAnswers = (answers) => {
    // Case: No answers
    if (!answers || answers.length === 0) return <Typography variant="body2">No answers provided</Typography>;

    // Sort all answers by time to maintain chronological order
    const sortedAnswers = [...answers].sort((a, b) => a.time - b.time);
    const isMultiplayer = evalData?.isMultiplayer || evalData?.session?.isMultiplayer;
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
    
    // Determine which answers to display
    const visibleAnswers = showAllEvents ? sortedAnswers : sortedAnswers.slice(0, 2);
    const showMoreButton = sortedAnswers.length > 2;
    
    // Determine if we should show the bottom white cap
    // We only show it if there are events to display
    const showBottomCap = visibleAnswers.length > 0;

    return (
      <Box
      sx={{
        p: '24px 24px 24px 35px',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 .5px 0 rgba(0, 0, 0, 0.1)',
      }}
      
      >
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
          // Only add the ::after pseudo-element if we have events to display
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
          {visibleAnswers.map((event, index) => {
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
          {showMoreButton && (
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
  // Helper function to convert hex to RGB
  const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace('#', '');

    // Convert 3-digit hex to 6-digits
    if (hex.length === 3) {
      hex = hex.split('').map(h => h + h).join('');
    }

    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
  };
  const renderQuestionAnswers = (answers) => {
    if (!answers || answers.length === 0) return <Typography variant="body2">No answers provided</Typography>;

    // Filter correct and wrong answers
    const onRightAnswers = answers.filter((ans) => ans.eventType === 'onRight');
    const onWrongAnswers = answers.filter((ans) => ans.eventType === 'onWrong');

    // If there is a wrong answer, we extract the "Right Options" from the "onWrong" answer
    const wrongAnswer = onWrongAnswers.length > 0 ? onWrongAnswers[0] : null;
    const correctOption = wrongAnswer?.object?.split('Right Options:')[1]?.split('Selected Options:')?.[0]?.trim();

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
                  {evalData?.evaluationDump?.moduleName}
                </Typography>

              </Grid>


              {!showModule && (
                <Grid item >
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                  }}>
                    {(() => {
                      const statusConfig = {
                        'Pass': {
                          icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981', mr: 1 }} />,
                          color: '#10b981',
                          bgColor: '#ecfdf5',
                          border: '1px solid #d1fae5'
                        },
                        'Fail': {
                          icon: <CancelIcon sx={{ fontSize: 20, color: '#ef4444', mr: 1 }} />,
                          color: '#ef4444',
                          bgColor: '#fef2f2',
                          border: '1px solid #fee2e2'
                        },
                        'Pending': {
                          icon: <HourglassEmptyIcon sx={{ fontSize: 20, color: '#f59e0b', mr: 1 }} />,
                          color: '#f59e0b',
                          bgColor: '#fffbeb',
                          border: '1px solid #fef3c7'
                        }
                      };

                      const status = evalData?.status || 'Pending';
                      const config = statusConfig[status] || statusConfig['Pending'];

                      return (
                        <>
                          {!evalData?.evaluationDump?.fromModule && (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 2,
                                py: 1,
                                borderRadius: '8px',
                                backgroundColor: config.bgColor,
                                border: config.border,
                              }}
                            >
                              {config.icon}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: config.color,
                                }}
                              >
                                Status: {status}
                              </Typography>
                            </Box>
                          )}
                        </>
                      );
                      
                    })()}
                  </Box>
                </Grid>
              )}




            </Grid>
          </Box>

          {/* Main content */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              {/* Key metrics in boxes like your example */}
              <Grid item xs={12}>
                <Grid container spacing={3} justifyContent="center">
                  {/* Score Box */}
                  {!showModule && (
                    <Grid item xs={12} sm={4}>
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
                          <AssessmentOutlinedIcon sx={{ color: '#6366f1', fontSize: 22, mr: 1 }} />
                          <Typography variant="body2" color="#64748b" fontWeight={500}>
                            {evalData?.evaluationDump?.fromModule ? "Total Score" : "Score"}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                          {evalData?.evaluationDump?.fromModule ? (
                            <Typography variant="h4" fontWeight={700} sx={{ color: '#334155' }}>
                              {evalData?.evaluationDump?.totalMark}
                            </Typography>
                          ) : (
                            <>
                              <Typography variant="h4" fontWeight={700} sx={{ color: '#334155' }}>
                                {evalData?.evaluationDump?.totalScored}
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#64748b', mx: 0.5 }}>
                                /
                              </Typography>
                              <Typography variant="body1" sx={{ color: '#64748b' }}>
                                {evalData?.evaluationDump?.totalMark}
                              </Typography>
                            </>
                          )}
                          
                        </Box>

                        <Box sx={{
                          mt: 1.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '6px',
                          bgcolor: '#e0e7ff',
                          fontSize: '0.75rem'
                        }}>
                          <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 600 }}>
                            Pass Mark: {evalData?.evaluationDump?.passMark}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {/* Participants Box */}
                  {evalData?.isMultiplayer && <Grid item xs={12} sm={!showModule ? 4 : 6}>
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
                        {evalData?.participants?.length || 0}
                      </Typography>

                      <Box sx={{ mt: 1.5, width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <CheckCircleOutlineIcon sx={{ color: '#10b981', fontSize: 16, mr: 0.75 }} />
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {evalData?.completedParticipants?.length || 0} completed
                          </Typography>
                        </Box>

                        {evalData?.participants?.length > 0 && (
                          <LinearProgress
                            variant="determinate"
                            value={(evalData.completedParticipants?.length / evalData.participants.length) * 100 || 0}
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
                  {evalData?.evaluationDump?.fromModule !== true &&  <Grid item xs={12} sm={!showModule ? 4 : 6}>
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

                      {/* Lobby Time - Big number like example */}
                      {evalData?.startTime && evalData?.endTime ? (
                        (() => {
                          const endTime = evalData?.endTime ? evalData?.endTime : undefined;
                          const startTime = evalData?.startTime;
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

                      {/* Period time in line with icon - Wider box without scrollbar */}
                      <Box sx={{ mt: 1.5, width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: { xs: 1, sm: 1.5 },  // Responsive padding
                            py: 0.75,
                            borderRadius: '6px',
                            bgcolor: '#e0f2fe',
                            whiteSpace: 'nowrap',
                            minWidth: { xs: '90%', sm: '70%' },  // Wider box on small screens
                            maxWidth: '100%'
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#0284c7',
                              fontWeight: 500,
                              fontSize: { xs: '0.6rem', sm: '0.65rem' }  // Slightly smaller font on xs screens if needed
                            }}
                          >
                            {formatTime(evalData?.startTime)}
                          </Typography>

                          {evalData?.endTime ? (
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
                                {formatTime(evalData.endTime)}
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
                  </Grid>}
                 
                </Grid>
              </Grid>

              {/* Additional information - Participants list */}
              {evalData?.isMultiplayer && <Grid item xs={12}>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569', fontSize: '0.85rem' }}>
                  Participant Details
                </Typography>

                <Grid container spacing={2}>
                  {/* All Participants */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        All Participants ({evalData?.participants?.length || 0})
                      </Typography>
                    </Box>

                    {evalData?.participants && evalData.participants.length > 0 ? (
                      <Box sx={{ position: 'relative' }}>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'nowrap', overflowX: 'hidden' }}>
                          {evalData.participants.slice(0, 3).map((participant, index) => (
                           <Chip
                           key={index}
                           label={
                             evalData.username === participant.name
                               ? `${participant.name} (host)`
                               : participant.name
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
                          {evalData.participants.length > 3 && (
                            <Tooltip
                              placement="right-end" // 👈 this positions it to the right
                              title={
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>All Participants</Typography>
                                  <Stack spacing={0.5} sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {name.map((participant, idx) => (
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
                                label={`+${name.length - 3}`}
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

                  {/* Completed */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Completed ({evalData?.completedParticipants?.length || 0} of {evalData?.participants?.length || 0})
                      </Typography>
                    </Box>

                    {evalData?.completedParticipants && evalData.completedParticipants.length > 0 ? (
                      <Box sx={{ position: 'relative' }}>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'nowrap', overflowX: 'hidden' }}>
                          {evalData.completedParticipants.slice(0, 3).map((participant, index) => (
                            <Chip
                              key={index}
                              label={participant.name}
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
                          {evalData.completedParticipants.length > 3 && (
                            <Tooltip
                              title={
                                <Box sx={{ p: 1 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Completed Participants</Typography>
                                  <Stack spacing={0.5} sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {evalData.completedParticipants.map((participant, idx) => (
                                      <Typography key={idx} sx={{ fontSize: '0.8rem' }}>
                                        {participant.name}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              }
                              arrow
                            >
                              <Chip
                                label={`+${evalData.completedParticipants.length - 3}`}
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
      {/* <Grid item my={3} xs={12}>
        <Divider />
      </Grid> */}

      {evalData?.evaluationDump?.chapters?.map((chapter) => (
        <Grid item xs={12} key={chapter.chapterIndex}>
          <Accordion
            variant="outlined"
            expanded={expanded === chapter.chapterIndex}
            onChange={handleChange(chapter.chapterIndex)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${chapter.chapterIndex}-content`}
              id={`panel-${chapter.chapterIndex}-header`}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
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

                {!showModule && !evalData?.evaluationDump?.fromModule && (
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GradeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {chapter.totalScored} / {chapter.totalMark}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2">
                        {chapter.totalTimeTaken ? convertTimeToDescription(chapter.totalTimeTaken) : '-'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {!showModule && evalData?.evaluationDump?.fromModule && (
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        Total Score: {chapter.totalMark}
                      </Typography>
                    </Box>
                   
                  </Box>
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
                              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '120px', flexShrink: 0 }}>
                                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                                <Typography variant="body2" noWrap>
                                  {moment.totalTimeTaken ? `${convertTimeToDescription(moment.totalTimeTaken)} ` : '-'}
                                </Typography>
                              </Box>


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

export default JsonLifeCycleEvaluationGrid;
