import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Grid,
  Divider,
  Fade,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { keyframes } from '@mui/system';
import { ESG_COLORS } from '../theme/esgTheme';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGHGEmissionsByCompany } from '../services/api';

// Import our new components
import ESGPerformanceMetrics from '../components/ESGPerformanceMetrics';
import SustainabilityTips from '../components/SustainabilityTips';

// Import form components
import EnvironmentSubmissionForm from '../components/EnvironmentSubmissionForm';
import SocialSubmissionForm from '../components/SocialSubmissionForm';
import GovernanceSubmissionForm from '../components/GovernanceSubmissionForm';

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RepresentativeDashboard = ({ uploadView = false, historyView = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [companyName, setCompanyName] = useState('');
  const [environmentTab, setEnvironmentTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);

  // Function to fetch submission data
  const fetchSubmissions = useCallback(async () => {
    try {
      console.log('Fetching GHG emissions for representative...');
      const response = await getGHGEmissionsByCompany();
      console.log('GHG emissions API response:', response);
      
      if (response && response.data) {
        console.log('Setting submissions with data:', response.data);
        setSubmissions(response.data);
      } else {
        console.warn('No data found in the response');
      }
    } catch (error) {
      console.error('Error fetching GHG emissions:', error);
      // Show more detailed error information
      const errorMessage = error.response ? 
        `Failed to load submission history: ${error.response.status} ${error.response.statusText}` : 
        'Failed to load submission history: Network error';
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  }, []);

  useEffect(() => {
    // Get user data from local storage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.company) {
      setCompanyName(user.company.name || 'Your Company');
      
      // If we're in history view, fetch the submissions
      if (historyView) {
        fetchSubmissions();
      }
      
      // Check for initialTab in location state (for direct navigation to specific form tab)
      if (uploadView && location.state?.initialTab !== undefined) {
        setEnvironmentTab(location.state.initialTab);
      }
    }
  }, [historyView, uploadView, location.state, fetchSubmissions]);

  const handleEnvironmentTabChange = (event, newValue) => {
    setEnvironmentTab(newValue);
  };

  const handleSubmissionSuccess = (response, category) => {
    // Determine the appropriate success message based on the category
    let message = '';
    
    if (category === 'environment') {
      message = 'Environmental data submitted successfully!';
    } else if (category === 'social') {
      message = 'Social metrics data submitted successfully!';
    } else if (category === 'governance') {
      message = 'Governance metrics data submitted successfully!';
    } else {
      message = 'ESG data submitted successfully!';
    }
    
    setNotification({
      open: true,
      message: message,
      severity: 'success'
    });
    
    // Refresh submission history after successful submission
    if (historyView) {
      fetchSubmissions();
    }
  };

  const handleSubmissionError = (error, category) => {
    // Determine the appropriate error message based on the category
    let categoryDisplay = 'ESG';
    
    if (category === 'environment') {
      categoryDisplay = 'Environmental';
    } else if (category === 'social') {
      categoryDisplay = 'Social';
    } else if (category === 'governance') {
      categoryDisplay = 'Governance';
    }
    
    setNotification({
      open: true,
      message: `Error submitting ${categoryDisplay} data: ${error.message || 'Unknown error'}`,
      severity: 'error'
    });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Navigation handlers removed as Quick Actions panel is no longer needed
  
  // Render the submission form
  const renderSubmissionForm = () => {
    return (
      <Box sx={{ 
        width: '100%',
        textAlign: 'left',
        animation: `${fadeIn} 0.5s ease-out`,
        m: 0,
        p: 0,
        '& .MuiFormControl-root': {
          width: '100%',
          mb: 2,
          ml: 0
        },
        '& .MuiInputBase-root': {
          width: '100%',
          ml: 0
        },
        '& .MuiGrid-root': {
          ml: 0,
          pl: 0
        },
        '& .MuiBox-root': {
          ml: 0
        }
      }}>
        <Typography component="h2" variant="h6" gutterBottom sx={{ 
          color: '#0A3D0A', 
          fontWeight: 'bold', 
          width: '100%',
          borderBottom: '2px solid #9DC183',
          paddingBottom: 1,
          marginBottom: 3
        }}>
          ESG Data Submission
        </Typography>
        
        <Tabs 
          value={environmentTab} 
          onChange={handleEnvironmentTabChange}
          variant="fullWidth"
          scrollButtons={false}
          sx={{ 
            mb: 3,
            width: '100%',
            ml: 0,
            pl: 0,
            '& .MuiTab-root': { 
              minHeight: 48,
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-2px)'
              },
              '&.Mui-selected': {
                color: environmentTab === 0 ? '#4CAF50' : 
                       environmentTab === 1 ? '#2196F3' : '#FFEB3B'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: environmentTab === 0 ? '#4CAF50' : 
                               environmentTab === 1 ? '#2196F3' : '#FFEB3B',
              height: '3px',
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="Environment" sx={{ textTransform: 'none' }} />
          <Tab label="Social" sx={{ textTransform: 'none' }} />
          <Tab label="Governance" sx={{ textTransform: 'none' }} />
        </Tabs>
        
        <Box sx={{ p: 0, m: 0, width: '100%' }}>
          {environmentTab === 0 && (
            <EnvironmentSubmissionForm 
              onSubmissionSuccess={(response) => handleSubmissionSuccess(response, 'environment')}
              onSubmissionError={(error) => handleSubmissionError(error, 'environment')}
              sx={{ ml: 0, pl: 0 }}
            />
          )}
          
          {environmentTab === 1 && (
            <SocialSubmissionForm 
              onSubmissionSuccess={(response) => handleSubmissionSuccess(response, 'social')}
              onSubmissionError={(error) => handleSubmissionError(error, 'social')}
              sx={{ ml: 0, pl: 0 }}
            />
          )}
          
          {environmentTab === 2 && (
            <GovernanceSubmissionForm 
              onSubmissionSuccess={(response) => handleSubmissionSuccess(response, 'governance')}
              onSubmissionError={(error) => handleSubmissionError(error, 'governance')}
              sx={{ ml: 0, pl: 0 }}
            />
          )}
        </Box>
      </Box>
    );
  };

  // Render the submission history
  const renderSubmissionHistory = () => {
    return (
      <Box sx={{ 
        width: '100%',
        animation: `${fadeIn} 0.5s ease-out`
      }}>
        <Typography component="h2" variant="h6" gutterBottom sx={{ 
          color: '#0A3D0A', 
          fontWeight: 'bold', 
          width: '100%',
          borderBottom: '2px solid #9DC183',
          paddingBottom: 1,
          marginBottom: 3
        }}>
          Submission History
        </Typography>
        
        {submissions.length > 0 ? (
          <TableContainer component={Paper} sx={{ 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(157, 193, 131, 0.1)' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id} sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                    '&:hover': { backgroundColor: 'rgba(157, 193, 131, 0.05)' },
                    transition: 'background-color 0.3s'
                  }}>
                    <TableCell>
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={submission.category || 'Environment'} 
                        size="small"
                        sx={{ 
                          backgroundColor: submission.category === 'SOCIAL' ? 'rgba(33, 150, 243, 0.1)' : 
                                         submission.category === 'GOVERNANCE' ? 'rgba(255, 235, 59, 0.2)' : 
                                         'rgba(76, 175, 80, 0.1)',
                          color: submission.category === 'SOCIAL' ? '#2196F3' : 
                                 submission.category === 'GOVERNANCE' ? '#FFEB3B' : 
                                 '#4CAF50',
                          fontWeight: 'medium'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={submission.status || 'Pending'} 
                        size="small"
                        sx={{ 
                          backgroundColor: submission.status === 'APPROVED' ? 'rgba(76, 175, 80, 0.1)' : 
                                         submission.status === 'REJECTED' ? 'rgba(244, 67, 54, 0.1)' : 
                                         'rgba(255, 152, 0, 0.1)',
                          color: submission.status === 'APPROVED' ? '#4CAF50' : 
                                 submission.status === 'REJECTED' ? '#F44336' : 
                                 '#FF9800',
                          fontWeight: 'medium'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ 
                          borderColor: '#0A3D0A',
                          color: '#0A3D0A',
                          '&:hover': {
                            borderColor: '#9DC183',
                            backgroundColor: 'rgba(157, 193, 131, 0.1)'
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(157, 193, 131, 0.05)',
            border: '1px dashed rgba(157, 193, 131, 0.5)'
          }}>
            <Typography variant="body1" color="textSecondary">
              No submission history found. Submit ESG data to see your history here.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ 
                mt: 2,
                backgroundColor: '#0A3D0A',
                '&:hover': {
                  backgroundColor: '#0A3D0A',
                  opacity: 0.9
                }
              }}
              onClick={() => navigate('/representative/upload')}
            >
              Submit New Data
            </Button>
          </Paper>
        )}
      </Box>
    );
  };

  // Render the appropriate content based on props
  const renderContent = () => {
    if (uploadView) {
      return renderSubmissionForm();
    } else if (historyView) {
      return renderSubmissionHistory();
    } else {
      // Main dashboard view with our three new components
      return (
        <Fade in={true} timeout={800}>
          <Box sx={{ width: '100%', maxWidth: '100%', px: 0 }}>
            {/* Welcome header */}
            <Box sx={{ mb: 4, textAlign: 'left', px: 2 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: ESG_COLORS.brand.dark,
                mb: 1
              }}>
                Welcome to ESGAadhar, {companyName}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                Your sustainability journey at a glance
              </Typography>
            </Box>
            
            {/* Main content grid - Full width layout */}
            <Grid container spacing={0} sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
              {/* ESG Performance Metrics - Full width on mobile, 2/3 width on desktop */}
              <Grid item xs={12} lg={8} sx={{ width: '100%', p: 0 }}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  animation: `${fadeIn} 0.5s ease-out`,
                  animationDelay: '0.2s',
                  animationFillMode: 'both',
                  height: '100%',
                  width: '100%',
                  m: 0
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    fontWeight: 'bold',
                    color: ESG_COLORS.brand.dark
                  }}>
                    ESG Performance Metrics
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  <ESGPerformanceMetrics />
                </Paper>
              </Grid>
              
              {/* Sustainability Tips - Now in right column on desktop */}
              <Grid item xs={12} lg={4} sx={{ width: '100%', p: 0 }}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  animation: `${fadeIn} 0.5s ease-out`,
                  animationDelay: '0.3s',
                  animationFillMode: 'both',
                  height: '100%',
                  width: '100%',
                  m: 0
                }}>
                  <SustainabilityTips />
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      );
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
      backgroundColor: '#f5f5f5',
      pt: 3,
      pl: 0, // Remove left padding to eliminate space between sidebar and content
      pr: 0, // Remove right padding to fill the entire width
      pb: 5,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden' // Prevent any potential overflow
    }}>
      {renderContent()}
      
      {/* Notification snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RepresentativeDashboard;
