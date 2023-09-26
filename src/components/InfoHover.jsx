import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Fade, Typography } from '@mui/material';

const InfoHover = ({ title, disabled = false }) => {
  title = title === '' ? 'No users assigned' : title;

  return (
    <div>
      <Tooltip
        title={disabled ? '' : <Typography fontSize={14}>{title}</Typography>}
        placement="right-start"
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
      >
        <IconButton
          aria-label="delete"
          style={{
            padding: '10px',
            zIndex: disabled ? -10 : 1, // Conditionally set the z-index based on disabled prop
          }}
        >
          <InfoIcon style={{ fontSize: '18px' }} />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default InfoHover;
