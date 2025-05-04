import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Button
} from '@mui/material';
import MetricStatisticsCard from './MetricStatisticsCard';
import { 
  getGHGEmissionsByCompany, 
  getSocialMetricsByCompany, 
  getGovernanceMetricsByCompany,
  getMetricCategories
} from '../services/api';
import { useAuth } from '../context/AuthContext';

// ESGAadhar green color scheme
const GREEN_DARK = '#0A3D0A';
const GREEN_LIGHT = '#9DC183';

const MetricsDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    environment: [],
    social: [],
    governance: []
  });
  const [categories, setCategories] = useState({
    environment: [],
    social: [],
    governance: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all categories
        const envCategories = await getMetricCategories('environment');
        const socialCategories = await getMetricCategories('social');
        const govCategories = await getMetricCategories('governance');
        
        setCategories({
          environment: envCategories.data || [],
          social: socialCategories.data || [],
          governance: govCategories.data || []
        });
        
        // Fetch metrics data
        const [environmentData, socialData, governanceData] = await Promise.all([
          getGHGEmissionsByCompany(),
          getSocialMetricsByCompany(),
          getGovernanceMetricsByCompany()
        ]);
        
        setMetrics({
          environment: environmentData.data || [],
          social: socialData.data || [],
          governance: governanceData.data || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Process metrics data to get statistics for each category
  const getMetricStatistics = (metricType) => {
    const data = metrics[metricType] || [];
    const categoryList = categories[metricType] || [];
    
    // Group metrics by category
    const groupedMetrics = {};
    
    // Initialize groups for each category
    categoryList.forEach(category => {
      groupedMetrics[category.categoryCode] = {
        metrics: [],
        name: category.name,
        description: category.description
      };
    });
    
    // Group metrics
    data.forEach(metric => {
      const categoryCode = metric.category || metric.subtype;
      if (categoryCode && groupedMetrics[categoryCode]) {
        groupedMetrics[categoryCode].metrics.push(metric);
      }
    });
    
    // Calculate statistics for each category
    const statistics = [];
    
    Object.keys(groupedMetrics).forEach(categoryCode => {
      const group = groupedMetrics[categoryCode];
      const metrics = group.metrics;
      
      if (metrics.length > 0) {
        // Sort by date to get the most recent and previous values
        const sortedMetrics = [...metrics].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.submissionDate || a.startDate);
          const dateB = new Date(b.createdAt || b.submissionDate || b.startDate);
          return dateB - dateA;
        });
        
        const latestMetric = sortedMetrics[0];
        const previousMetric = sortedMetrics.length > 1 ? sortedMetrics[1] : null;
        
        statistics.push({
          title: group.name,
          category: metricType.toUpperCase(),
          categoryCode: categoryCode,
          value: latestMetric.value || latestMetric.totalEmissions || 0,
          previousValue: previousMetric ? (previousMetric.value || previousMetric.totalEmissions || 0) : 0,
          unit: latestMetric.unit || latestMetric.units || '',
          timeframe: `${new Date(latestMetric.startDate).toLocaleDateString()} - ${new Date(latestMetric.endDate).toLocaleDateString()}`,
          description: group.description
        });
      }
    });
    
    return statistics;
  };
  
  const renderMetricCards = () => {
    const metricTypes = ['environment', 'social', 'governance'];
    const currentMetricType = metricTypes[activeTab];
    const statistics = getMetricStatistics(currentMetricType);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: GREEN_DARK }} />
        </Box>
      );
    }
    
    if (statistics.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No {currentMetricType} metrics data available
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: GREEN_DARK,
              '&:hover': { backgroundColor: '#0D4D0D' }
            }}
            onClick={() => window.location.href = `/representative/submit/${currentMetricType}`}
          >
            Submit {currentMetricType} Data
          </Button>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        {statistics.map((stat, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <MetricStatisticsCard {...stat} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          border: `1px solid ${GREEN_LIGHT}`,
          backgroundColor: '#FAFFF9'
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 3, color: GREEN_DARK, fontWeight: 'medium' }}>
          ESG Metrics Dashboard
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            mb: 3, 
            '& .MuiTabs-indicator': { backgroundColor: GREEN_DARK },
            '& .Mui-selected': { color: GREEN_DARK, fontWeight: 'bold' }
          }}
        >
          <Tab label="Environment" sx={{ textTransform: 'none' }} />
          <Tab label="Social" sx={{ textTransform: 'none' }} />
          <Tab label="Governance" sx={{ textTransform: 'none' }} />
        </Tabs>
        
        {renderMetricCards()}
      </Paper>
    </Box>
  );
};

export default MetricsDashboard;
