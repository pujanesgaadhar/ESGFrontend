import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getGHGEmissionsByCompany } from '../services/api';

// Import new dashboard components
import CompanyPerformanceMetrics from '../components/dashboard/CompanyPerformanceMetrics';
import EmissionsAnalysis from '../components/dashboard/EmissionsAnalysis';
import RegulatoryCompliancePanel from '../components/dashboard/RegulatoryCompliancePanel';
import ExecutiveSummary from '../components/dashboard/ExecutiveSummary';
import RepresentativeActivityMonitor from '../components/dashboard/RepresentativeActivityMonitor';

const EnhancedManagerDashboard = () => {
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // User and emissions data
  const { user } = useAuth();
  const [ghgEmissions, setGhgEmissions] = useState([]);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch emissions data on component mount and set up polling
  useEffect(() => {
    let polling;
    if (user && user.role && user.role.toLowerCase() === 'manager') {
      fetchGhgEmissions();
      polling = setInterval(() => fetchGhgEmissions(), 30000);
    }
    return () => polling && clearInterval(polling);
  }, [user]);

  // Fetch GHG emissions data from API
  const fetchGhgEmissions = async () => {
    try {
      const response = await getGHGEmissionsByCompany();
      setGhgEmissions(response.data);
    } catch (error) {
      console.error('Error fetching GHG emissions:', error);
      setNotification({
        open: true,
        message: 'Error fetching emissions data',
        severity: 'error'
      });
    }
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle closing the notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Main Tabs */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: '#f5f9f5',
          mb: 3,
          borderRadius: '4px 4px 0 0'
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 'medium',
              color: '#666',
              '&.Mui-selected': {
                color: '#0A3D0A',
                fontWeight: 'bold'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#0A3D0A'
            }
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Emissions Analysis" />
          <Tab label="Compliance" />
          <Tab label="Representative Activity" />
        </Tabs>
      </Paper>

      {/* Dashboard Tab */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0A3D0A' }}>
            Manager Dashboard
          </Typography>
          
          <ExecutiveSummary ghgEmissions={ghgEmissions} />
          <CompanyPerformanceMetrics ghgEmissions={ghgEmissions} />
        </Box>
      )}



      {/* Emissions Analysis Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0A3D0A' }}>
            Emissions Analysis
          </Typography>
          <EmissionsAnalysis ghgEmissions={ghgEmissions} />
        </Box>
      )}

      {/* Compliance Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0A3D0A' }}>
            Regulatory Compliance
          </Typography>
          <RegulatoryCompliancePanel />
        </Box>
      )}

      {/* Representative Activity Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#0A3D0A' }}>
            Representative Activity
          </Typography>
          <RepresentativeActivityMonitor />
        </Box>
      )}



      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedManagerDashboard;
