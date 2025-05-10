import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
// Removed unused ToggleButton and ToggleButtonGroup imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getChartData } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ESGDataChart = () => {
  const theme = useTheme();
  const [chartData, setChartData] = useState(null);
  // Removed unused state variables
  // const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [latestScores, setLatestScores] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await getChartData();
        const data = response.data;

        // Get the latest scores for pie chart
        if (data.environmentalScores.length > 0) {
          setLatestScores({
            environmental: data.environmentalScores[data.environmentalScores.length - 1],
            social: data.socialScores[data.socialScores.length - 1],
            governance: data.governanceScores[data.governanceScores.length - 1]
          });
        }

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Environmental Score',
              data: data.environmentalScores,
              borderColor: theme.palette.chart.environmental,
              backgroundColor: 'rgba(95, 158, 160, 0.1)',
              tension: 0.2,
              pointBackgroundColor: theme.palette.chart.environmental,
            },
            {
              label: 'Social Score',
              data: data.socialScores,
              borderColor: theme.palette.chart.social,
              backgroundColor: 'rgba(176, 137, 104, 0.1)',
              tension: 0.2,
              pointBackgroundColor: theme.palette.chart.social,
            },
            {
              label: 'Governance Score',
              data: data.governanceScores,
              borderColor: theme.palette.chart.governance,
              backgroundColor: 'rgba(125, 157, 127, 0.1)',
              tension: 0.2,
              pointBackgroundColor: theme.palette.chart.governance,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Adding theme.palette dependencies would cause unnecessary re-renders

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: 12
          },
          padding: 15
        }
      }
    }
  };

  const lineOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { 
        ...commonOptions.plugins.legend,
        position: 'top',
      },
      title: {
        display: true,
        text: 'ESG Scores Over Time',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
  };

  const pieOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { 
        ...commonOptions.plugins.legend,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Latest ESG Score Distribution',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
    },
  };

  const barOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: { 
        ...commonOptions.plugins.legend,
        position: 'top',
      },
      title: {
        display: true,
        text: 'ESG Score Comparison',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
  };

  const pieData = latestScores ? {
    labels: ['Environmental', 'Social', 'Governance'],
    datasets: [
      {
        data: [
          latestScores.environmental,
          latestScores.social,
          latestScores.governance,
        ],
        backgroundColor: [
          theme.palette.chart.environmentalLight,
          theme.palette.chart.socialLight,
          theme.palette.chart.governanceLight,
        ],
        borderColor: [
          theme.palette.chart.environmental,
          theme.palette.chart.social,
          theme.palette.chart.governance,
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const barData = chartData ? {
    labels: ['Environmental', 'Social', 'Governance'],
    datasets: [{
      label: 'Latest Scores',
      data: [
        chartData.datasets[0].data[chartData.datasets[0].data.length - 1],
        chartData.datasets[1].data[chartData.datasets[1].data.length - 1],
        chartData.datasets[2].data[chartData.datasets[2].data.length - 1],
      ],
      backgroundColor: [
        theme.palette.chart.environmental,
        theme.palette.chart.social,
        theme.palette.chart.governance,
      ],
      borderColor: [
        theme.palette.background.paper,
        theme.palette.background.paper,
        theme.palette.background.paper,
      ],
      borderWidth: 1,
    }],
  } : null;

  return (
    <Box sx={{ p: 3, backgroundColor: 'transparent' }}>
      <Typography 
        variant="h5" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1976d2'
        }}
      >
        ESG Performance Analytics
      </Typography>
      
      <Grid container spacing={3}>
        {/* Line Chart */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              height: 400,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {chartData && <Line options={lineOptions} data={chartData} />}
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              height: 400,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {pieData && <Pie options={pieOptions} data={pieData} />}
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              height: 400,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {barData && <Bar options={barOptions} data={barData} />}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ESGDataChart;
