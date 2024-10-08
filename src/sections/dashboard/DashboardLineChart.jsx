import { Card, CardContent, CardHeader } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Chart } from '../../components/Chart';

// Function to configure chart options
const useLineChartOptions = (categories) => {
  const theme = useTheme();

  return {
    chart: {
      type: 'line',
      background: 'transparent',
      zoom: { enabled: false },
    },
    stroke: {
      curve: 'straight',
    },
    xaxis: {
      categories, // x-axis labels (departments)
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#FF5733', // Custom color 1
      '#33FF57', // Custom color 2
      '#3357FF', // Custom color 3
    ],
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: true,
      position: 'top',
    },
    grid: {
      borderColor: theme.palette.divider,
    },
    yaxis: {
      title: {
        text: 'Number of Users',
      },
    },
  };
};

// Line Chart Component
export const LineChart = ({ chartData, categories, title = 'Department Users by Chapter' }) => {
  const chartOptions = useLineChartOptions(categories);

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Chart options={chartOptions} series={chartData} type="line" height={350} />
      </CardContent>
    </Card>
  );
};
