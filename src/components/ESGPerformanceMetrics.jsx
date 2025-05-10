import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Fade,
  Tabs,
  Tab
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { ESG_COLORS } from '../theme/esgTheme';

const ESGPerformanceMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [environmentData, setEnvironmentData] = useState([]);
  const [socialData, setSocialData] = useState([]);
  const [governanceData, setGovernanceData] = useState([]);
  // Industry benchmarks are included directly in the chart data for simplicity

  useEffect(() => {
    // Simulate API call to fetch ESG performance data
    const fetchData = async () => {
      setLoading(true);
      // In a real implementation, this would be an API call
      setTimeout(() => {
        // Sample data - would come from API in real implementation
        setEnvironmentData([
          { month: 'Jan', emissions: 120, benchmark: 150 },
          { month: 'Feb', emissions: 115, benchmark: 150 },
          { month: 'Mar', emissions: 110, benchmark: 150 },
          { month: 'Apr', emissions: 105, benchmark: 150 },
          { month: 'May', emissions: 100, benchmark: 150 },
          { month: 'Jun', emissions: 95, benchmark: 150 },
        ]);
        
        setSocialData([
          { category: 'Diversity', value: 78, benchmark: 65 },
          { category: 'Training', value: 85, benchmark: 70 },
          { category: 'Safety', value: 92, benchmark: 80 },
          { category: 'Community', value: 68, benchmark: 60 },
        ]);
        
        setGovernanceData([
          { category: 'Board Diversity', value: 75, benchmark: 60 },
          { category: 'Ethics', value: 88, benchmark: 75 },
          { category: 'Transparency', value: 82, benchmark: 70 },
          { category: 'Risk Management', value: 79, benchmark: 65 },
        ]);
        
        // Industry benchmarks are included directly in the chart data
        
        setLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderEnvironmentMetrics = () => (
    <Card sx={{ 
      height: '100%', 
      width: '100%',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 0,
      border: `1px solid ${ESG_COLORS.environment}20`,
      m: 0
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: ESG_COLORS.environment, fontWeight: 'bold', mb: 2 }}>
          GHG Emissions Trend
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Your emissions are trending 33% below industry average
        </Typography>
        <Box sx={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={environmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="emissions" 
                stroke={ESG_COLORS.environment} 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name="Your Emissions"
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#999999" 
                strokeDasharray="5 5"
                name="Industry Benchmark" 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSocialMetrics = () => (
    <Card sx={{ 
      height: '100%', 
      width: '100%',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 0,
      border: `1px solid ${ESG_COLORS.social}20`,
      m: 0
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: ESG_COLORS.social, fontWeight: 'bold', mb: 2 }}>
          Social Performance
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Your social metrics are 15% above industry average
        </Typography>
        <Box sx={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={socialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="value" 
                fill={ESG_COLORS.social} 
                name="Your Performance" 
              />
              <Bar 
                dataKey="benchmark" 
                fill="#999999" 
                name="Industry Benchmark" 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const renderGovernanceMetrics = () => (
    <Card sx={{ 
      height: '100%', 
      width: '100%',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: 0,
      border: `1px solid ${ESG_COLORS.governance}20`,
      m: 0
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: ESG_COLORS.governance, fontWeight: 'bold', mb: 2 }}>
          Governance Performance
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Your governance metrics are 20% above industry average
        </Typography>
        <Box sx={{ height: 250, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={governanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="value" 
                fill={ESG_COLORS.governance} 
                name="Your Performance" 
              />
              <Bar 
                dataKey="benchmark" 
                fill="#999999" 
                name="Industry Benchmark" 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          mb: 3,
          width: '100%',
          '& .MuiTab-root': {
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            '&.Mui-selected': {
              color: activeTab === 0 ? ESG_COLORS.environment : 
                     activeTab === 1 ? ESG_COLORS.social : 
                     ESG_COLORS.governance
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: activeTab === 0 ? ESG_COLORS.environment : 
                             activeTab === 1 ? ESG_COLORS.social : 
                             ESG_COLORS.governance,
            height: '3px',
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Tab label="Environment" sx={{ textTransform: 'none' }} />
        <Tab label="Social" sx={{ textTransform: 'none' }} />
        <Tab label="Governance" sx={{ textTransform: 'none' }} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress sx={{ color: ESG_COLORS.brand.dark }} />
        </Box>
      ) : (
        <Fade in={!loading} timeout={800}>
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            {activeTab === 0 && renderEnvironmentMetrics()}
            {activeTab === 1 && renderSocialMetrics()}
            {activeTab === 2 && renderGovernanceMetrics()}
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ESGPerformanceMetrics;
