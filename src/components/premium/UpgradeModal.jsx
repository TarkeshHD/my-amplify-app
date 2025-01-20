import { Typography, Box } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import { useEffect } from 'react';

import CustomDialog from '../CustomDialog';

export const UpgradeModel = (props) => {
  const { isModalOpen, setModalOpen } = props;

  const dialogConfig = {
    newSubmission: {
      title: 'Upgrade Request Submitted',
      description:
        'Thank you for requesting an upgrade. Our support team will contact you via email with further details about your request. You will be redirected to our website shortly.',
      footer: 'Expect a response within 1-2 business days.',
    },
    existingSubmission: {
      title: 'Your upgrade request is in progress',
      description:
        'Your have already submitted an request and its currently in progress. You will be redirected to our website shortly.',
      footer: 'Expect a response within 1-2 business days.',
    },
  };

  const hasPreviousSubmission = localStorage.getItem('hasViewedUpgradeModel') === 'true';
  const modelConfig = hasPreviousSubmission ? dialogConfig?.existingSubmission : dialogConfig?.newSubmission;

  const closeUpgradeModel = () => {
    localStorage.setItem('hasViewedUpgradeModel', true);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const timer = setTimeout(() => {
      window.open('https://www.autovrse.com/', '_blank');
    }, 4000);

    return () => clearTimeout(timer);
  }, [isModalOpen]);

  return (
    <>
      <CustomDialog
        sx={{ minWidth: '40vw' }}
        onClose={() => setModalOpen(false)}
        open={Boolean(isModalOpen)}
        onTransitionExited={closeUpgradeModel}
        title={<Typography variant="h5">{modelConfig.title}</Typography>}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 80, pb: 2 }} />
        </Box>
        <Typography sx={{ textAlign: 'center', mb: 2 }}>{modelConfig.description}</Typography>

        <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
          {modelConfig.footer}
        </Typography>
      </CustomDialog>
    </>
  );
};
