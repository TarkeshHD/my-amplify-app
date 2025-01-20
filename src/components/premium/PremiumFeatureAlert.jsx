import { Alert, Button } from '@mui/material';
import { WorkspacePremium } from '@mui/icons-material';

export const PremiumFeatureAlert = (props) => {
  console.log('hereeee');
  const { message, onClickUpgrade, sx } = props;
  return (
    <Alert
      severity="warning"
      icon={<WorkspacePremium fontSize="inherit" />}
      sx={{
        width: '100%',
        margin: 4,
        pb: 0,
        backgroundColor: '#8EC5FC',
        backgroundImage: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
        ...sx,
      }}
      variant="filled"
      action={
        <Button
          color="inherit"
          sx={{
            background: 'black',
            color: 'white',
            mr: 4,
            mb: 1,
            ':hover': { background: 'black', color: 'white' },
          }}
          size="small"
          onClick={onClickUpgrade}
        >
          UPGRADE
        </Button>
      }
    >
      {' '}
      {message}
    </Alert>
  );
};
