import PropTypes from 'prop-types';

import { Avatar, Card, CardContent, Stack, SvgIcon, Typography } from '@mui/material';
import { ArrowDownward, ArrowUpward, CurrencyRupee } from '@mui/icons-material';

export const DashboardDiffCard = (props) => {
  const { difference, positive = false, sx, value, icon, title, iconColor = 'success.main' } = props;

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack alignItems="flex-start" direction="row" justifyContent="space-between" spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: iconColor,
              height: 56,
              width: 56,
            }}
          >
            <SvgIcon>{icon}</SvgIcon>
          </Avatar>
        </Stack>
        {difference && (
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
      </CardContent>
    </Card>
  );
};

DashboardDiffCard.prototypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired,
};
