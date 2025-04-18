import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ESGMetricsChart = ({ type, data, title }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  if (!data || !data.labels || !Array.isArray(data.datasets)) {
    return (
      <div style={{ color: '#888', padding: '16px', textAlign: 'center' }}>
        No data available for this chart.
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset) => ({
      ...dataset,
      borderColor: dataset.borderColor || 'rgb(75, 192, 192)',
      backgroundColor: dataset.backgroundColor || 'rgba(75, 192, 192, 0.5)',
    })),
  };

  return type === 'line' ? (
    <Line options={options} data={chartData} />
  ) : (
    <Bar options={options} data={chartData} />
  );
};

export const createGHGEmissionsData = (submissions) => {
  const labels = submissions.map((s) => new Date(s.created_at).toLocaleDateString());
  const scope1Data = submissions.map((s) => s.environmental_metrics.ghg_emissions.scope_1);
  const scope2Data = submissions.map((s) => s.environmental_metrics.ghg_emissions.scope_2);
  const scope3Data = submissions.map((s) => s.environmental_metrics.ghg_emissions.scope_3);

  return {
    labels,
    datasets: [
      {
        label: 'Scope 1',
        data: scope1Data,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Scope 2',
        data: scope2Data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Scope 3',
        data: scope3Data,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };
};

export const createEnergyConsumptionData = (submissions) => {
  const labels = submissions.map((s) => new Date(s.created_at).toLocaleDateString());
  const renewableData = submissions.map(
    (s) => s.environmental_metrics.energy_consumption.renewable
  );
  const nonRenewableData = submissions.map(
    (s) => s.environmental_metrics.energy_consumption.non_renewable
  );

  return {
    labels,
    datasets: [
      {
        label: 'Renewable Energy',
        data: renewableData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Non-Renewable Energy',
        data: nonRenewableData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
};

export const createSocialMetricsData = (submissions) => {
  const labels = submissions.map((s) => new Date(s.created_at).toLocaleDateString());
  const employeeData = submissions.map((s) => s.social_metrics.total_employees);
  const femalePercentData = submissions.map((s) => s.social_metrics.female_employees);
  const trainingHoursData = submissions.map((s) => s.social_metrics.training_hours);

  return {
    labels,
    datasets: [
      {
        label: 'Total Employees',
        data: employeeData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Female Employees (%)',
        data: femalePercentData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Training Hours per Employee',
        data: trainingHoursData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };
};

export default ESGMetricsChart;
