import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  SvgIcon,
  Button,
} from '@mui/material';
import { addToHistory, convertUnixToLocalTime, fetchScoresAndStatuses, removeFromHistory } from '../utils/utils';
import DefaultImage from '../assets/No_Image_Available.jpg';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axios';
import moment from 'moment-timezone';
import { useConfig } from '../hooks/useConfig';
const fillTraineesEval = async (trainees, config) => {
  // Fill trainee values evaluation with pending or not attempted or pass or fail
  const promises = trainees.map(async (trainee) => {
    const traineeValues = { ...trainee };
    const newEvaluations = await Promise.all(
      traineeValues.evaluation.map(async (evaluation, index) => {
        if (evaluation === null) {
          return 'Not Attempted';
        } else {
          const { status } = await fetchScoresAndStatuses(evaluation, config);
          return status;
        }
      }),
    );

    traineeValues.evaluation = [...newEvaluations];

    return traineeValues;
  });

  return Promise.all(promises);
};

const ModuleGrid = ({ modules }) => {
  if (!modules) return null;
  const isSingleElement = modules.length === 1;
  const cols = isSingleElement ? 1 : 2;
  return (
    <div
      style={{
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        boxShadow: 'none',
        paddingTop: '0px',
      }}
    >
      <Typography variant="h4" gutterBottom style={{ fontSize: '2rem', color: '#616161' }}>
        Modules:
      </Typography>
      <ImageList cols={cols} rowHeight={250} gap={50}>
        {modules.map((module) => (
          <ImageListItem key={module.name} style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img
              src={module.thumbnail || DefaultImage}
              alt={module.name}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <ImageListItemBar title={module.name} style={{ background: 'rgba(0, 0, 0, 0.5)', textAlign: 'center' }} />
          </ImageListItem>
        ))}
      </ImageList>
    </div>
  );
};

const SessionInfoGrid = ({ sessions }) => {
  // Convert unix time stamp to proper date using moment
  const startTime = convertUnixToLocalTime(sessions.startDate);
  const endTime = convertUnixToLocalTime(sessions.endDate);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center items vertically
        padding: '20px',
        marginBottom: '20px',
        boxShadow: 'none',
        marginTop: '0px',
        paddingTop: '0px',
      }}
    >
      <Typography variant="h4" gutterBottom style={{ fontSize: '2rem', color: '#616161' }}>
        Session {sessions.name}
      </Typography>
      <div cols={2} rowHeight={230} gap={16}>
        <div>
          <Typography variant="subtitle1" gutterBottom style={{ color: '#616161' }}>
            Venue: {sessions.venue} | Duration: {startTime} - {endTime}
          </Typography>
        </div>
      </div>
    </div>
  );
};

const TraineeList = ({ trainees, modules, config }) => {
  const navigate = useNavigate();
  if (!trainees || !modules) return null;
  const handleModuleClick = (trainee, module, index) => {
    addToHistory();
    navigate(`/evaluations/${trainee.id._id}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: 'none',
        marginTop: '0px',
      }}
    >
      <Typography variant="h4" gutterBottom style={{ fontSize: '2rem', color: '#616161' }}>
        Trainees
      </Typography>

      {trainees.map((trainee, traineeIndex) => (
        <div
          key={trainee.id._id}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            borderBottom: '1px solid #ccc',
          }}
        >
          <div
            style={{
              width: '300px',
              fontSize: '1.5rem',
              paddingRight: '20px',
              borderRight: '1px solid #ccc',
            }}
          >
            <Typography
              variant="subtitle1"
              style={{ fontSize: '1.3rem' }}
              onClick={() => handleModuleClick(trainee)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f0f0f0';
                e.target.style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.cursor = 'default';
              }}
            >
              {trainee.id.username}
            </Typography>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            {modules.map((module, index) => (
              <div
                key={module.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '55vw',
                  padding: '10px',
                  borderBottom: '1px solid #ccc',
                  backgroundColor: '#fff',
                }}
              >
                <Typography variant="subtitle1" style={{ marginRight: '10px', fontSize: '1.3rem' }}>
                  {module.name}
                </Typography>
                <Typography
                  variant="subtitle2"
                  style={{
                    color:
                      trainee.evaluation[index] === 'Pending'
                        ? 'orange'
                        : module.evaluation === 'Pass'
                        ? 'green'
                        : 'red',
                    fontSize: '1.3rem',
                  }}
                >
                  {trainee.evaluation[index]}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Page = () => {
  const config = useConfig();
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState(null);

  const navigate = useNavigate();

  const fetchSessionDetails = async () => {
    const response = await axios(`/cohort/session-details/${sessionId}`);
    const sessionDetails = response?.data?.details;
    const updatedTrainees = await fillTraineesEval(sessionDetails.users, config);

    setSessionDetail({ ...sessionDetails, users: updatedTrainees });
  };

  useEffect(() => {
    fetchSessionDetails();
  }, []);

  const backToPrevPage = () => {
    const prevPage = removeFromHistory();
    navigate(prevPage);
  };

  return (
    <>
      {sessionDetail ? (
        <Container maxWidth="xl">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => {
                backToPrevPage();
              }}
            >
              Back
            </Button>
          </div>
          {/* Module Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <SessionInfoGrid sessions={sessionDetail} />
            </Grid>
            <Grid item xs={12}>
              <ModuleGrid modules={sessionDetail.modules} />
            </Grid>
            <Grid item xs={12}>
              <TraineeList trainees={sessionDetail.users} modules={sessionDetail.modules} config={config} />
            </Grid>
          </Grid>
        </Container>
      ) : null}
    </>
  );
};

export default Page;
