import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
  Legend
} from 'chart.js';
import { getGHGEmissionsByCompany } from '../services/api';

// Register Chart.js components
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

const EmissionsChartDashboard = () => {
  const [emissions, setEmissions] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [selectedScope, setSelectedScope] = useState('all');
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart colors for different scopes
  const chartColors = {
    SCOPE_1: 'rgba(75, 192, 192, 0.6)',
    SCOPE_2: 'rgba(255, 159, 64, 0.6)',
    SCOPE_3: 'rgba(153, 102, 255, 0.6)',
    SOLVENT: 'rgba(255, 99, 132, 0.6)',
    SINK: 'rgba(54, 162, 235, 0.6)'
  };

  const borderColors = {
    SCOPE_1: 'rgba(75, 192, 192, 1)',
    SCOPE_2: 'rgba(255, 159, 64, 1)',
    SCOPE_3: 'rgba(153, 102, 255, 1)',
    SOLVENT: 'rgba(255, 99, 132, 1)',
    SINK: 'rgba(54, 162, 235, 1)'
  };

  useEffect(() => {
    fetchEmissionsData();
  }, []);

  const fetchEmissionsData = async () => {
    try {
      setLoading(true);
      const response = await getGHGEmissionsByCompany();
      // Filter only approved emissions
      const approvedEmissions = response.data.filter(emission => emission.status === 'APPROVED');
      setEmissions(approvedEmissions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching emissions data:', err);
      setError('Failed to load emissions data');
      setLoading(false);
    }
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const handleScopeChange = (event) => {
    setSelectedScope(event.target.value);
  };

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
  };

  // Filter emissions based on selected scope
  const getFilteredEmissions = () => {
    if (selectedScope === 'all') {
      return emissions;
    }
    return emissions.filter(emission => emission.scope === selectedScope);
  };

  // Group emissions by month or quarter
  const groupEmissionsByTime = (filteredEmissions) => {
    const groupedData = {};
    
    filteredEmissions.forEach(emission => {
      let timeKey;
      
      if (timeFrame === 'monthly') {
        // Format: YYYY-MM
        const date = new Date(emission.startDate);
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (timeFrame === 'quarterly') {
        // Format: YYYY-QX
        const date = new Date(emission.startDate);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        timeKey = `${date.getFullYear()}-Q${quarter}`;
      } else {
        // Format: YYYY
        const date = new Date(emission.startDate);
        timeKey = `${date.getFullYear()}`;
      }
      
      if (!groupedData[timeKey]) {
        groupedData[timeKey] = {
          SCOPE_1: 0,
          SCOPE_2: 0,
          SCOPE_3: 0,
          SOLVENT: 0,
          SINK: 0
        };
      }
      
      // Calculate CO2e based on quantity and emission factor
      const co2e = emission.quantity * (emission.emissionFactor || 1);
      groupedData[timeKey][emission.scope] += co2e;
    });
    
    return groupedData;
  };

  // Prepare data for charts
  const prepareChartData = () => {
    const filteredEmissions = getFilteredEmissions();
    const groupedData = groupEmissionsByTime(filteredEmissions);
    
    // Sort time periods chronologically
    const sortedLabels = Object.keys(groupedData).sort();
    
    if (chartType === 'pie') {
      // For pie chart, aggregate total emissions by scope
      const scopeTotals = {
        SCOPE_1: 0,
        SCOPE_2: 0,
        SCOPE_3: 0,
        SOLVENT: 0,
        SINK: 0
      };
      
      Object.values(groupedData).forEach(periodData => {
        Object.keys(periodData).forEach(scope => {
          scopeTotals[scope] += periodData[scope];
        });
      });
      
      const scopes = Object.keys(scopeTotals).filter(scope => scopeTotals[scope] !== 0);
      
      return {
        labels: scopes.map(scope => {
          switch(scope) {
            case 'SCOPE_1': return 'Scope 1';
            case 'SCOPE_2': return 'Scope 2';
            case 'SCOPE_3': return 'Scope 3';
            case 'SOLVENT': return 'Solvent';
            case 'SINK': return 'Sink';
            default: return scope;
          }
        }),
        datasets: [
          {
            data: scopes.map(scope => scopeTotals[scope]),
            backgroundColor: scopes.map(scope => chartColors[scope]),
            borderColor: scopes.map(scope => borderColors[scope]),
            borderWidth: 1,
          },
        ],
      };
    } else {
      // For line and bar charts
      const datasets = [];
      
      if (selectedScope === 'all') {
        // Create a dataset for each scope
        const scopes = ['SCOPE_1', 'SCOPE_2', 'SCOPE_3', 'SOLVENT', 'SINK'];
        
        scopes.forEach(scope => {
          // Check if there's any data for this scope
          const hasData = sortedLabels.some(label => groupedData[label][scope] > 0);
          
          if (hasData) {
            datasets.push({
              label: scope === 'SCOPE_1' ? 'Scope 1' : 
                     scope === 'SCOPE_2' ? 'Scope 2' : 
                     scope === 'SCOPE_3' ? 'Scope 3' : 
                     scope === 'SOLVENT' ? 'Solvent' : 'Sink',
              data: sortedLabels.map(label => groupedData[label][scope]),
              backgroundColor: chartColors[scope],
              borderColor: borderColors[scope],
              borderWidth: 1,
              tension: 0.1
            });
          }
        });
      } else {
        // Only one dataset for the selected scope
        datasets.push({
          label: selectedScope === 'SCOPE_1' ? 'Scope 1' : 
                 selectedScope === 'SCOPE_2' ? 'Scope 2' : 
                 selectedScope === 'SCOPE_3' ? 'Scope 3' : 
                 selectedScope === 'SOLVENT' ? 'Solvent' : 'Sink',
          data: sortedLabels.map(label => groupedData[label][selectedScope]),
          backgroundColor: chartColors[selectedScope],
          borderColor: borderColors[selectedScope],
          borderWidth: 1,
          tension: 0.1
        });
      }
      
      return {
        labels: sortedLabels,
        datasets
      };
    }
  };

  // Chart options
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `GHG Emissions ${selectedScope === 'all' ? 'by Scope' : `for ${selectedScope.replace('_', ' ')}`}`,
          font: {
            size: 16,
            weight: 'bold',
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#0A3D0A'
        },
      },
    };

    if (chartType !== 'pie') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO2e (kg)',
              font: {
                weight: 'bold'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: timeFrame === 'monthly' ? 'Month' : timeFrame === 'quarterly' ? 'Quarter' : 'Year',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      };
    }

    return baseOptions;
  };

  // Render the appropriate chart based on chartType
  const renderChart = () => {
    if (loading) {
      return <Typography>Loading chart data...</Typography>;
    }

    if (error) {
      return <Typography color="error">{error}</Typography>;
    }

    if (emissions.length === 0) {
      return <Typography>No approved emissions data available.</Typography>;
    }

    const chartData = prepareChartData();
    const chartOptions = getChartOptions();

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: '#FFFFFF' }}>
      <Typography component="h2" variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
        GHG Emissions Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="scope-select-label">Scope</InputLabel>
            <Select
              labelId="scope-select-label"
              value={selectedScope}
              label="Scope"
              onChange={handleScopeChange}
            >
              <MenuItem value="all">All Scopes</MenuItem>
              <MenuItem value="SCOPE_1">Scope 1</MenuItem>
              <MenuItem value="SCOPE_2">Scope 2</MenuItem>
              <MenuItem value="SCOPE_3">Scope 3</MenuItem>
              <MenuItem value="SOLVENT">Solvent</MenuItem>
              <MenuItem value="SINK">Sink</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="time-frame-select-label">Time Frame</InputLabel>
            <Select
              labelId="time-frame-select-label"
              value={timeFrame}
              label="Time Frame"
              onChange={handleTimeFrameChange}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography sx={{ mr: 2 }}>Chart Type:</Typography>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="chart type"
              size="small"
            >
              <ToggleButton value="line" aria-label="line chart">
                Line
              </ToggleButton>
              <ToggleButton value="bar" aria-label="bar chart">
                Bar
              </ToggleButton>
              <ToggleButton value="pie" aria-label="pie chart">
                Pie
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ height: 400, position: 'relative' }}>
        {renderChart()}
      </Box>
    </Paper>
  );
};

export default EmissionsChartDashboard;
