import PropTypes from 'prop-types';

import { ArrowDownward, ArrowUpward, Info as InfoIcon } from '@mui/icons-material';
import { Avatar, Card, CardContent, Stack, SvgIcon, Typography, Tooltip } from '@mui/material';
import React from 'react';

export const DashboardDiffCard = (props) => {
  const { difference = null, positive, sx, value, title, icon, iconColor, info, toolTip } = props;

  let subtextTitle = 'h4';
  if (!icon) {
    subtextTitle = 'h6';
  }
  return (
    <Card sx={sx}>
      <Tooltip title={toolTip} arrow placement="top">
        <CardContent>
          <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography color="text.secondary" variant="overline">
                  {title}
                </Typography>
              </Stack>
              <Typography variant={subtextTitle}>{value}</Typography>
            </Stack>
            {icon && (
              <Avatar
                sx={{
                  backgroundColor: iconColor,
                  top: 8,
                  right: 8,
                  height: 48,
                  width: 48,
                }}
              >
                {icon}
              </Avatar>
            )}
          </Stack>
          {difference !== null && (
            <Stack alignItems="center" direction="row" spacing={2} sx={{ mt: 2 }}>
              <Stack alignItems="center" direction="row" spacing={0.5}>
                <SvgIcon color={positive ? 'success' : 'error'} fontSize="small">
                  {positive ? <ArrowUpward /> : <ArrowDownward />}
                </SvgIcon>
                <Typography color={positive ? 'success.main' : 'error.main'} variant="body2">
                  {difference}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          )}
          {info && (
            <Typography color="text.secondary" variant="caption">
              {info}
            </Typography>
          )}
        </CardContent>
      </Tooltip>
    </Card>
  );
};

DashboardDiffCard.propTypes = {
  difference: PropTypes.number, // difference can now be null or a number
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.element, // icon can now be null or an element
  iconColor: PropTypes.string,
};

DashboardDiffCard.defaultProps = {
  difference: null, // Default difference to null
  positive: false,
  sx: {},
  icon: null, // Default icon to null
  iconColor: 'success.main',
};
