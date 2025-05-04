import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Grid
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

/**
 * A reusable component for displaying metric statistics
 * @param {string} title - The title of the metric
 * @param {string} category - The category of the metric
 * @param {number} value - The current value of the metric
 * @param {number} previousValue - The previous value of the metric for comparison
 * @param {string} unit - The unit of the metric
 * @param {string} timeframe - The timeframe of the metric (e.g., "Last 30 days")
 * @param {boolean} loading - Whether the data is loading
 * @param {string} description - Additional description for the metric
 */
const MetricStatisticsCard = ({
  title,
  category,
  value,
  previousValue,
  unit = '',
  timeframe = 'Last 30 days',
  loading = false,
  description = ''
}) => {
  // Calculate the percentage change
  const calculateChange = () => {
    if (previousValue === 0 || previousValue === null || previousValue === undefined) {
      return { percentage: 0, direction: 'flat' };
    }
    
    const change = ((value - previousValue) / Math.abs(previousValue)) * 100;
    
    let direction = 'flat';
    if (change > 0) {
      direction = 'up';
    } else if (change < 0) {
      direction = 'down';
    }
    
    return { percentage: Math.abs(change.toFixed(1)), direction };
  };
  
  const { percentage, direction } = calculateChange();
  
  // Determine if the trend is positive or negative based on the metric type
  // For emissions, a decrease is positive (green), for other metrics, an increase is positive
  const isPositiveTrend = (category === 'ENVIRONMENT' && direction === 'down') || 
                          (category !== 'ENVIRONMENT' && direction === 'up');
  
  const getTrendIcon = () => {
    if (direction === 'up') {
      return <TrendingUpIcon color={isPositiveTrend ? 'success' : 'error'} />;
    } else if (direction === 'down') {
      return <TrendingDownIcon color={isPositiveTrend ? 'success' : 'error'} />;
    } else {
      return <TrendingFlatIcon color="action" />;
    }
  };
  
  const getCategoryColor = () => {
    switch (category) {
      case 'ENVIRONMENT':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'SOCIAL':
        return { bg: '#e3f2fd', text: '#1565c0' };
      case 'GOVERNANCE':
        return { bg: '#fff8e1', text: '#f57f17' };
      default:
        return { bg: '#f5f5f5', text: '#757575' };
    }
  };
  
  const categoryColors = getCategoryColor();
  
  return (
    <Card 
      elevation={1}
      sx={{ 
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium', color: '#0A3D0A' }}>
            {title}
          </Typography>
          <Chip 
            label={category.charAt(0) + category.slice(1).toLowerCase()} 
            size="small"
            sx={{ 
              backgroundColor: categoryColors.bg,
              color: categoryColors.text,
              fontWeight: 'medium',
              fontSize: '0.75rem'
            }}
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={40} sx={{ color: '#0A3D0A' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                {value.toLocaleString()} {unit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {timeframe}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 1.5 }} />
            
            <Grid container spacing={1} alignItems="center">
              <Grid item>
                {getTrendIcon()}
              </Grid>
              <Grid item>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: direction === 'flat' ? 'text.secondary' : (isPositiveTrend ? 'success.main' : 'error.main')
                  }}
                >
                  {percentage}% {direction === 'up' ? 'increase' : direction === 'down' ? 'decrease' : 'no change'}
                </Typography>
              </Grid>
            </Grid>
            
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {description}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricStatisticsCard;
