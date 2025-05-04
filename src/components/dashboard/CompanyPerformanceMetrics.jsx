import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';

const CompanyPerformanceMetrics = ({ ghgEmissions = [] }) => {
  // Calculate metrics from real emissions data
  const metrics = useMemo(() => {
    // Filter approved emissions only
    const approvedEmissions = ghgEmissions.filter(emission => emission.status === 'APPROVED');
    
    // Get current year and previous year
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Filter emissions by year
    const currentYearEmissions = approvedEmissions.filter(emission => {
      const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
      return emissionYear === currentYear;
    });
    
    const previousYearEmissions = approvedEmissions.filter(emission => {
      const emissionYear = emission.endDate ? new Date(emission.endDate).getFullYear() : null;
      return emissionYear === previousYear;
    });
    
    // Calculate total emissions for current and previous year
    const totalEmissions = currentYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
    const lastYearEmissions = previousYearEmissions.reduce((sum, e) => sum + (e.quantity || 0), 0);
    
    // Calculate year-over-year change percentage
    const yearOverYearChange = lastYearEmissions > 0 
      ? ((totalEmissions - lastYearEmissions) / lastYearEmissions) * 100 
      : 0;
    
    // Assume a reduction target of 30% from previous year
    const reductionTarget = lastYearEmissions * 0.7;
    
    // Calculate progress toward reduction target
    let progressToTarget = 0;
    if (lastYearEmissions > reductionTarget) {
      const totalReduction = lastYearEmissions - reductionTarget;
      const currentReduction = lastYearEmissions - totalEmissions;
      progressToTarget = Math.min(100, Math.max(0, (currentReduction / totalReduction) * 100));
    }
    
    return {
      totalEmissions,
      lastYearEmissions,
      reductionTarget,
      yearOverYearChange,
      progressToTarget
    };
  }, [ghgEmissions]);

  // Calculate year-over-year change
  const yearOverYearChange = metrics.yearOverYearChange;
  const isReduction = yearOverYearChange < 0;
  
  // Calculate progress toward reduction target
  const progressToTarget = metrics.progressToTarget;

  return (
    <Card sx={{ 
      mb: 4, 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: 2,
      overflow: 'visible'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EqualizerIcon sx={{ color: '#0A3D0A', mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
            Company Performance Metrics
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Total Emissions */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: '#f5f9f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                Total Emissions Across All Representatives
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                {metrics.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                Combined emissions from all scopes
              </Typography>
            </Box>
          </Grid>
          
          {/* Year-over-Year Change */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: '#f5f9f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                Year-over-Year Change
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isReduction ? (
                  <TrendingDownIcon sx={{ color: '#2E7D32', mr: 1 }} />
                ) : (
                  <TrendingUpIcon sx={{ color: '#d32f2f', mr: 1 }} />
                )}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: isReduction ? '#2E7D32' : '#d32f2f'
                  }}
                >
                  {isReduction ? yearOverYearChange * -1 : yearOverYearChange}%
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                {isReduction ? 'Reduction' : 'Increase'} compared to last year
              </Typography>
            </Box>
          </Grid>
          
          {/* Progress Toward Target */}
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, backgroundColor: '#f5f9f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                Progress Toward Reduction Target
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                {progressToTarget.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
              </Typography>
              <Box sx={{ mt: 1, mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progressToTarget} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progressToTarget > 75 ? '#2E7D32' : 
                                      progressToTarget > 50 ? '#9DC183' : 
                                      progressToTarget > 25 ? '#FB8C00' : '#d32f2f'
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Target: {metrics.reductionTarget.toLocaleString()} tCO₂e
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CompanyPerformanceMetrics;
