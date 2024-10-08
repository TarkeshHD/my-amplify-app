import PropTypes from 'prop-types';

import { ArrowDropDown, ArrowRight } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, CardHeader, Divider, SvgIcon } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Chart } from '../../components/Chart';

const useChartOptions = (
  categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
) => {
  const theme = useTheme();

  return {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: true,
      },
    },
    colors: [theme.palette.info.dark, alpha(theme.palette.info.dark, 0.25)],
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
      type: 'solid',
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      show: false,
    },
    plotOptions: {
      bar: {
        columnWidth: '40px',
      },
    },
    stroke: {
      colors: ['transparent'],
      show: true,
      width: 2,
    },
    theme: {
      mode: theme.palette.mode,
    },
    xaxis: {
      axisBorder: {
        color: theme.palette.divider,
        show: true,
      },
      axisTicks: {
        color: theme.palette.divider,
        show: true,
      },
      categories,
      labels: {
        offsetY: 5,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => (value > 999 ? `${value}` : `${value}`),
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary,
        },
      },
    },
  };
};

export const DashboardBarChart = (props) => {
  const { chartSeries, sx, title = 'Title', categories } = props;
  const chartOptions = useChartOptions(categories);

  return (
    <Card sx={sx}>
      <CardHeader title={title} />
      <CardContent>
        <Chart height={350} options={chartOptions} series={chartSeries} type="bar" width="100%" />
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon fontSize="small">
              <ArrowRight />
            </SvgIcon>
          }
          size="small"
        >
          Overview
        </Button>
      </CardActions>
    </Card>
  );
};

DashboardBarChart.protoTypes = {
  chartSeries: PropTypes.array.isRequired,
  sx: PropTypes.object,
};
