import PropTypes from 'prop-types';
import { Computer, DeviceHub, Phone } from '@mui/icons-material';
import { Box, Card, CardContent, CardHeader, Stack, SvgIcon, Typography, useTheme } from '@mui/material';
import { Chart } from '../../components/Chart';

const useChartOptions = (labels) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
    },
    colors: [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main],
    dataLabels: {
      enabled: false,
    },
    labels,
    legend: {
      show: true,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      active: {
        filter: {
          type: 'none',
        },
      },
      hover: {
        filter: {
          type: 'none',
        },
      },
    },
    stroke: {
      width: 0,
    },
    theme: {
      mode: theme.palette.mode,
    },
    tooltip: {
      fillSeriesColor: false,
    },
  };
};

const iconMap = {
  Desktop: (
    <SvgIcon>
      <Computer />
    </SvgIcon>
  ),
  Tablet: (
    <SvgIcon>
      <DeviceHub />
    </SvgIcon>
  ),
  Phone: (
    <SvgIcon>
      <Phone />
    </SvgIcon>
  ),
};

export const DashboardPieChart = (props) => {
  const { chartSeries, labels, sx, title = 'Title' } = props;
  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader title={title} />
      <CardContent>
        <Chart height={300} options={chartOptions} series={chartSeries} type="donut" width="100%" />
        {/* <Stack alignItems="center" direction="column" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
          {chartSeries.map((item, index) => {
            const label = labels[index];

            return (
              <Box
                key={label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {iconMap[label]}
                <Typography sx={{ marginRight: 1 }} variant="h6">
                  {label}
                </Typography>
                <Typography color="text.secondary" variant="subtitle2">
                  {item}%
                </Typography>
              </Box>
            );
          })}
        </Stack> */}
      </CardContent>
    </Card>
  );
};

DashboardPieChart.propTypes = {
  chartSeries: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  sx: PropTypes.object,
};
