import { Pin, RiceBowl } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import moment from 'moment-timezone';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import { convertUnixToLocalTime } from '../../utils/utils';

export default function VRLoginOTP() {
  const [fetchingData, setFetchingData] = useState(false);
  const [otp, setOtp] = useState('XXXXXX');
  const [expiry, setExpiry] = useState('0');

  const getLoginOTP = async () => {
    try {
      setFetchingData(true);
      const response = await axios.get('/user/generate-otp/web');

      setOtp(response.data.details.otp);

      setExpiry(convertUnixToLocalTime(response.data.details.expiryTime));
    } catch (error) {
      toast.error(error.message || `Failed to fetch login OTP`);
      console.log(error);
    } finally {
      setFetchingData(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" spacing={4}>
          <Stack spacing={1}>
            <Typography variant="h5">VR Device Login</Typography>
          </Stack>
        </Stack>
        <Grid container spacing={3}>
          <Grid xs={12} sm={6} lg={3}>
            <Card>
              <CardContent>
                <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
                  <Stack width={'100%'} spacing={1}>
                    <Typography color="text.secondary" variant="overline">
                      Generate OTP
                    </Typography>
                    <Stack
                      width={'100%'}
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography variant={'h6'}>{otp}</Typography>

                      <LoadingButton startIcon={<Pin />} onClick={getLoginOTP} loading={fetchingData}>
                        Generate
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack alignItems="center" direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Typography color="text.secondary" variant="caption">
                    To login in your VR device generate login OTP. It will expire by {expiry}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
