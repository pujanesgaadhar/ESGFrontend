import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend
);

const ESGDataChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await getChartData();
        const data = response.data;

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Environmental Score',
              data: data.environmentalScores,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
            {
              label: 'Social Score',
              data: data.socialScores,
              borderColor: 'rgb(255, 99, 132)',
              tension: 0.1,
            },
            {
              label: 'Governance Score',
              data: data.governanceScores,
              borderColor: 'rgb(153, 102, 255)',
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'ESG Scores Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        ESG Performance Trends
      </Typography>
      {chartData && <Line options={options} data={chartData} />}
    </Box>
  );
};

export default ESGDataChart;
