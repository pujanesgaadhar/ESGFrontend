import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Divider } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { motion } from 'framer-motion';
import { keyframes } from '@mui/system';

const glowKeyframes = keyframes`
  0% { box-shadow: 0 0 5px rgba(157, 193, 131, 0.3); }
  50% { box-shadow: 0 0 20px rgba(157, 193, 131, 0.5); }
  100% { box-shadow: 0 0 5px rgba(157, 193, 131, 0.3); }
`;

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const metricBoxAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    transition: { duration: 0.2 }
  }
};

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardAnimation}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ 
        mb: 4, 
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        overflow: 'visible',
        border: '1px solid rgba(157, 193, 131, 0.2)',
        animation: `${glowKeyframes} 3s infinite`,
        transition: 'all 0.3s ease'
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
              <motion.div
                variants={metricBoxAnimation}
                whileHover="hover"
                initial="hidden"
                animate="visible"
              >
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, rgba(245, 249, 245, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(157, 193, 131, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #9DC183 0%, #0A3D0A 100%)',
                    borderRadius: '2px 2px 0 0'
                  }
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                    Total Emissions Across All Representatives
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#0A3D0A',
                    mb: 'auto' // Push to top
                  }}>
                    {metrics.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
                    Combined emissions from all scopes
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Year-over-Year Change */}
            <Grid item xs={12} md={4}>
              <motion.div
                variants={metricBoxAnimation}
                whileHover="hover"
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
              >
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, rgba(245, 249, 245, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(157, 193, 131, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: isReduction ? 
                      'linear-gradient(90deg, #81C784 0%, #2E7D32 100%)' : 
                      'linear-gradient(90deg, #EF5350 0%, #C62828 100%)',
                    borderRadius: '2px 2px 0 0'
                  }
                }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                    Year-over-Year Change
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 'auto' // Push to top
                  }}>
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
                  <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
                    {isReduction ? 'Reduction' : 'Increase'} compared to last year
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
            
            {/* Progress Toward Target */}
            <Grid item xs={12} md={4}>
              <motion.div
                variants={metricBoxAnimation}
                whileHover="hover"
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
              >
                <Box sx={{ 
                  p: 3, 
                  background: 'linear-gradient(135deg, rgba(245, 249, 245, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%)',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '180px',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(157, 193, 131, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, 
                      ${progressToTarget > 75 ? '#2E7D32' : 
                        progressToTarget > 50 ? '#9DC183' : 
                        progressToTarget > 25 ? '#FB8C00' : '#d32f2f'} 0%, 
                      ${progressToTarget > 75 ? '#81C784' : 
                        progressToTarget > 50 ? '#C5E1A5' : 
                        progressToTarget > 25 ? '#FFB74D' : '#EF5350'} 100%)`,
                    borderRadius: '2px 2px 0 0'
                  }
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    mb: 2, 
                    color: '#555',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}>
                    Progress Toward Reduction Target
                  </Typography>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  >
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      color: '#0A3D0A',
                      mb: 2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {progressToTarget.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
                    </Typography>
                  </motion.div>
                  
                  <Box sx={{ mt: 'auto', mb: 2 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 1 }}
                    >
                      <LinearProgress 
                        variant="determinate" 
                        value={progressToTarget} 
                        sx={{ 
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'rgba(224, 224, 224, 0.6)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: `linear-gradient(90deg, 
                              ${progressToTarget > 75 ? '#2E7D32' : 
                                progressToTarget > 50 ? '#9DC183' : 
                                progressToTarget > 25 ? '#FB8C00' : '#d32f2f'} 0%, 
                              ${progressToTarget > 75 ? '#81C784' : 
                                progressToTarget > 50 ? '#C5E1A5' : 
                                progressToTarget > 25 ? '#FFB74D' : '#EF5350'} 100%)`,
                            transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
                          }
                        }}
                      />
                    </motion.div>
                  </Box>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#666',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    Target: {metrics.reductionTarget.toLocaleString()} tCO₂e
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CompanyPerformanceMetrics;
