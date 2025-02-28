import { FormatListBulleted, Info as InfoIcon } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, LinearProgress, Stack, SvgIcon, Typography, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';

export const DashboardTasksProgress = (props) => {
  const { value, sx, title, icon, info, iconColor = 'warning.main', toolTip } = props;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
          <Stack spacing={1}>
            {toolTip ? (
              <Tooltip title={toolTip} arrow placement="top">
                <Typography color="text.secondary" variant="overline" sx={{ cursor: 'help' }}>
                  {title}
                </Typography>
              </Tooltip>
            ) : (
              <Typography color="text.secondary" variant="overline">
                {title}
              </Typography>
            )}
            <Typography variant="h4">{value}%</Typography>
          </Stack>
        </Stack>
        <Box sx={{ mt: 3 }}>
          <LinearProgress value={value} variant="determinate" />
        </Box>
      </CardContent>
    </Card>
  );
};

DashboardTasksProgress.propTypes = {
  value: PropTypes.number.isRequired,
  sx: PropTypes.object,
};
