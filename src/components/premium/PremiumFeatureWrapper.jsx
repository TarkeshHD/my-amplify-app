import { Box, Button, Typography } from '@mui/material';
import { WorkspacePremium } from '@mui/icons-material';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { useConfig } from '../../hooks/useConfig';
import { UpgradeModel } from './UpgradeModal';
import axios from '../../utils/axios';
import { useAuth } from '../../hooks/useAuth';

export const PremiumFeatureWrapper = ({
  children,
  message = 'Premium Feature',
  noLogo = false,
  subText,
  sx,
  hideUpgradeButton = false,
}) => {
  const [successFormOpen, setSuccessFormOpen] = useState(false);
  const config = useConfig();
  const { data } = config;
  const { user } = useAuth();
  const isFreeTrialUser = data?.freeTrial;

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
        toast.error('Failed to upgrade account.');
      }
    } catch (error) {
      toast.error('An error occurred while requesting for account upgrade.');
      console.error(error);
    }
  };

  console.log(data);

  if (!isFreeTrialUser || user?.role === 'productAdmin') {
    return <>{children}</>;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          filter: 'blur(6px)',
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 1,
          },
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          ...sx,
          position: 'absolute',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
        }}
        onClick={onClickUpgrade}
      >
        {!noLogo && <WorkspacePremium sx={{ color: '#6366f1', fontSize: 50 }} />}
        <Typography variant="subtitle1" color="#6366f1">
          {message}
        </Typography>

        <Typography variant="subtitle2" color={'#6366f1'}>
          {subText}
        </Typography>

        {!hideUpgradeButton && (
          <Button sx={{ background: '#303283', color: 'white', ':hover': { background: '#303283', color: 'white' } }}>
            Upgrade
          </Button>
        )}
      </Box>
      <UpgradeModel isModalOpen={successFormOpen} setModalOpen={setSuccessFormOpen} />
    </Box>
  );
};
