import { Grid, Typography, TextField } from '@mui/material';
import moment from 'moment-timezone';
import React from 'react';
import DeviceCard from './DeviceCard';
import { RHFTextField } from '../hook-form';

const statusMap = {
  Pending: 'warning',
  Pass: 'success',
  Fail: 'error',
};

const DeviceGrid = ({ evalData: devData }) => {
  const ipAddr = devData?.ipAddress?.length > 0 ? devData?.ipAddress[0]?.ip : 'N/A';
  const macAddr = devData?.macAddr || '';
  const uniqueDomainCount = devData?.uniqueDomainCount || 0;
  const uniqueUserCount = devData?.uniqueUserCount || 0;

  const textFieldStyles = {
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#000000', // Set text color to black for disabled input
    },
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          Device ID
        </Typography>
        <TextField value={devData?.deviceId} variant="outlined" fullWidth sx={textFieldStyles} />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          MAC Address
        </Typography>
        <TextField value={macAddr} variant="outlined" fullWidth sx={textFieldStyles} />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          Number of Domains Logged In
        </Typography>
        <TextField value={uniqueDomainCount} variant="outlined" fullWidth sx={textFieldStyles} />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          Number of Users Logged In
        </Typography>
        <TextField value={uniqueUserCount} variant="outlined" fullWidth sx={textFieldStyles} />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          Domain History
        </Typography>
        <DeviceCard tableData={devData?.domainsHistory} content={'Domain'} />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          User History
        </Typography>
        <DeviceCard tableData={devData?.usersHistory} content={'User'} />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle1" mb={1.5}>
          IP History
        </Typography>
        <DeviceCard tableData={devData?.ipAddress} content={'IP'} />
      </Grid>
    </Grid>
  );
};

export default DeviceGrid;
