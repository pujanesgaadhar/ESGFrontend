import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Paper,
  Tabs,
  Tab,
  Fade,
  Zoom
  // Removed unused useTheme import
} from '@mui/material';
import { keyframes } from '@mui/system';
import { Assessment, Timeline, Gavel, Groups } from '@mui/icons-material';
import { getGHGEmissionsByCompany } from '../services/api';

// Import new dashboard components
import CompanyPerformanceMetrics from '../components/dashboard/CompanyPerformanceMetrics';
import EmissionsAnalysis from '../components/dashboard/EmissionsAnalysis';
import RegulatoryCompliancePanel from '../components/dashboard/RegulatoryCompliancePanel';
import ExecutiveSummary from '../components/dashboard/ExecutiveSummary';
import RepresentativeActivityMonitor from '../components/dashboard/RepresentativeActivityMonitor';

// Import ESG colors from theme
import { ESG_COLORS } from '../theme/esgTheme';

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const EnhancedManagerDashboard = () => {
  // Remove auth-related code and simplify state
  const [activeTab, setActiveTab] = useState(0);
  const [ghgEmissions, setGhgEmissions] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(true);
  // Removed unused theme variable

  useEffect(() => {
    fetchGhgEmissions();
    const polling = setInterval(() => fetchGhgEmissions(), 30000);
    return () => polling && clearInterval(polling);
  }, []);

  // Fetch GHG emissions data from API
  const fetchGhgEmissions = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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
      {/* Main Content with Horizontal Tabs */}
      <Box sx={{ 
        width: '100%',
        p: 3,
        transition: 'all 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'
      }}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Title and Horizontal Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Fade in={true} timeout={800}>
              <Typography variant="h5" sx={{ 
                color: ESG_COLORS.brand.dark, 
                fontWeight: 600, 
                mb: 2,
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40%',
                  height: '3px',
                  bottom: '-8px',
                  left: '0',
                  backgroundColor: ESG_COLORS.brand.light,
                  transition: 'width 0.3s ease-in-out'
                },
                '&:hover:after': {
                  width: '100%'
                }
              }}>
                Enhanced Dashboard
              </Typography>
            </Fade>
            
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    fontWeight: 600,
                  }
                },
                '& .MuiTabs-indicator': {
                  height: '3px',
                  borderRadius: '3px 3px 0 0',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <Tab 
                label="Dashboard" 
                icon={<Assessment sx={{ fontSize: 20 }} />}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': { color: ESG_COLORS.environment },
                }}
              />
              <Tab 
                label="Emissions Analysis" 
                icon={<Timeline sx={{ fontSize: 20 }} />}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': { color: ESG_COLORS.environment },
                }}
              />
              <Tab 
                label="Compliance" 
                icon={<Gavel sx={{ fontSize: 20 }} />}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': { color: ESG_COLORS.governance },
                }}
              />
              <Tab 
                label="Representative Activity" 
                icon={<Groups sx={{ fontSize: 20 }} />}
                iconPosition="start"
                sx={{
                  '&.Mui-selected': { color: ESG_COLORS.social },
                }}
              />
            </Tabs>
          </Box>
          
          {/* Content Based on Selected Tab */}
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px',
                animation: `${pulse} 1.5s infinite ease-in-out`
              }}>
                <Typography variant="h6" color="text.secondary">
                  Loading data...
                </Typography>
              </Box>
            ) : (
              <Fade in={!loading} timeout={500}>
                <Box sx={{ 
                  animation: `${fadeIn} 0.5s ease-out`,
                  '& > *': {
                    mb: 3,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                      transform: 'translateY(-4px)'
                    }
                  }
                }}>
                  {activeTab === 0 && (
                    <Box>
                      <Zoom in={activeTab === 0} timeout={500}>
                        <Box sx={{ mb: 3, borderLeft: `4px solid ${ESG_COLORS.environment}`, pl: 2 }}>
                          <ExecutiveSummary ghgEmissions={ghgEmissions} />
                        </Box>
                      </Zoom>
                      <Zoom in={activeTab === 0} timeout={700}>
                        <Box sx={{ borderLeft: `4px solid ${ESG_COLORS.environment}`, pl: 2 }}>
                          <CompanyPerformanceMetrics ghgEmissions={ghgEmissions} />
                        </Box>
                      </Zoom>
                    </Box>
                  )}
                  {activeTab === 1 && (
                    <Zoom in={activeTab === 1} timeout={500}>
                      <Box sx={{ borderLeft: `4px solid ${ESG_COLORS.environment}`, pl: 2 }}>
                        <EmissionsAnalysis ghgEmissions={ghgEmissions} />
                      </Box>
                    </Zoom>
                  )}
                  {activeTab === 2 && (
                    <Zoom in={activeTab === 2} timeout={500}>
                      <Box sx={{ borderLeft: `4px solid ${ESG_COLORS.governance}`, pl: 2 }}>
                        <RegulatoryCompliancePanel />
                      </Box>
                    </Zoom>
                  )}
                  {activeTab === 3 && (
                    <Zoom in={activeTab === 3} timeout={500}>
                      <Box sx={{ borderLeft: `4px solid ${ESG_COLORS.social}`, pl: 2 }}>
                        <RepresentativeActivityMonitor />
                      </Box>
                    </Zoom>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Fix Snackbar structure */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          sx={{ 
            width: '100%',
            animation: `${fadeIn} 0.3s ease-out`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedManagerDashboard;
