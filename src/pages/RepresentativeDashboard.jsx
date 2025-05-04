import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button
} from '@mui/material';
import EnvironmentSubmissionForm from '../components/EnvironmentSubmissionForm';
import SocialSubmissionForm from '../components/SocialSubmissionForm';
import GovernanceSubmissionForm from '../components/GovernanceSubmissionForm';
import MetricsDashboard from '../components/MetricsDashboard';
import { getGHGEmissionsByCompany, getNotifications } from '../services/api';

const RepresentativeDashboard = ({ uploadView = false, historyView = false }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const [companyId, setCompanyId] = useState(null);
  const [mainTab, setMainTab] = useState(0);
  const [environmentTab, setEnvironmentTab] = useState(0);
  const [submissions, setSubmissions] = useState([]);

  // Function to fetch submission data
  const fetchSubmissions = async () => {
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
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };
  
  // Function to check for new notifications
  const checkForNotifications = async () => {
    try {
      console.log('Checking for new notifications...');
      const response = await getNotifications();
      
      // Check if there are any unread status update notifications
      const statusUpdates = response.data.filter(notification => 
        !notification.read && 
        (notification.type === 'GHG_STATUS_UPDATE' || 
         notification.type === 'SOCIAL_STATUS_UPDATE' || 
         notification.type === 'GOVERNANCE_STATUS_UPDATE')
      );
      
      if (statusUpdates.length > 0) {
        // If there are unread status updates, show a notification
        setSnackbar({
          open: true,
          message: 'You have new submission status updates! Check your notifications.',
          severity: 'info',
        });
      }
    } catch (error) {
      console.error('Error checking for notifications:', error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.company && user.company.id) {
      setCompanyId(user.company.id);
      // Set up polling for submission updates if we're in history view
      let submissionPolling;
      let notificationPolling;
      
      if (historyView) {
        // Initial fetch of submission history when component loads
        fetchSubmissions();
        
        // Poll for submission updates every 30 seconds
        submissionPolling = setInterval(() => {
          console.log('Refreshing submission history...');
          fetchSubmissions();
        }, 30000);
      }
      
      // Check for notifications when component mounts
      checkForNotifications();
      
      // Set up polling to check for new notifications every 15 seconds
      notificationPolling = setInterval(() => {
        checkForNotifications();
      }, 15000);
      
      return () => {
        if (submissionPolling) {
          clearInterval(submissionPolling);
        }
        if (notificationPolling) {
          clearInterval(notificationPolling);
        }
      };
    }
  }, [historyView]);

  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };
  
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
    
    setSnackbar({
      open: true,
      message: message,
      severity: 'success',
    });
    
    // Refresh submission history after successful submission
    if (historyView) {
      fetchSubmissions();
    }
    
    // Check for notifications after successful submission
    checkForNotifications();
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
    
    setSnackbar({
      open: true,
      message: `Error submitting ${categoryDisplay} data: ${error.message || 'Unknown error'}`,
      severity: 'error',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCSVUploadSuccess = (response) => {
    setSnackbar({
      open: true,
      message: `CSV data uploaded and processed successfully. ${response?.data?.recordsProcessed || 0} records submitted.`,
      severity: 'success',
    });
  };

  // Format emissions for display
  const formatEmissions = (value, unit) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Format the number with commas for thousands
    const formattedValue = new Intl.NumberFormat().format(value);
    
    // Add the unit if available
    return unit ? `${formattedValue} ${unit}` : formattedValue;
  };

  // Render the submission form
  const renderSubmissionForm = () => {
    return (
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2, 
        backgroundColor: '#FFFFFF', 
        width: '100%', 
        maxWidth: '1200px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        mx: 'auto'
      }}>
        <Typography component="h2" variant="h6" gutterBottom sx={{ color: '#0A3D0A', fontWeight: 'bold' }}>
          ESG Data Submission
        </Typography>
        
        <Tabs 
          value={environmentTab} 
          onChange={handleEnvironmentTabChange}
          sx={{ 
            mb: 3, 
            '& .MuiTabs-indicator': { backgroundColor: '#0A3D0A' },
            '& .Mui-selected': { color: '#0A3D0A', fontWeight: 'bold' }
          }}
        >
          <Tab label="Environment" sx={{ textTransform: 'none' }} />
          <Tab label="Social" sx={{ textTransform: 'none' }} />
          <Tab label="Governance" sx={{ textTransform: 'none' }} />
        </Tabs>
        
        {environmentTab === 0 && (
          <EnvironmentSubmissionForm 
            companyId={companyId}
            onSuccess={(response) => handleSubmissionSuccess(response, 'environment')}
            onError={(error) => handleSubmissionError(error, 'environment')}
          />
        )}
        
        {environmentTab === 1 && (
          <SocialSubmissionForm 
            onSuccess={(response) => handleSubmissionSuccess(response, 'social')}
            onError={(error) => handleSubmissionError(error, 'social')}
          />
        )}
        
        {environmentTab === 2 && (
          <GovernanceSubmissionForm 
            onSuccess={(response) => handleSubmissionSuccess(response, 'governance')}
            onError={(error) => handleSubmissionError(error, 'governance')}
          />
        )}
        
        {!companyId && (
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f5f5f5',
              borderRadius: 1
            }}
          >
            <Typography variant="h6" color="error">
              Error: Company information not found. Please contact support.
            </Typography>
          </Paper>
        )}
      </Paper>
    );
  };

  // Render submission history
  const renderSubmissionHistory = () => {
    return (
      <Paper sx={{ 
        p: 3, 
        borderRadius: 2, 
        backgroundColor: '#FFFFFF', 
        width: '100%', 
        maxWidth: '1200px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        mx: 'auto'
      }}>
        <Typography component="h2" variant="h6" gutterBottom sx={{ color: '#0A3D0A', fontWeight: 'bold', mb: 3 }}>
          Submission History
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#555', mb: 1 }}>
            View all your GHG emissions submissions across all scopes
          </Typography>
        </Box>
        
        <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', border: '1px solid #e0e0e0', mb: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Scope</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Date Range</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Emissions</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A', fontSize: '0.875rem' }}>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 2, color: '#9DC183' }} />
                    <Typography variant="body2" color="textSecondary" display="inline">
                      Loading submission history...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow 
                    key={submission.id} 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f0f7f0' },
                      backgroundColor: submission.id % 2 === 0 ? '#fafafa' : 'white',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Chip 
                        label={submission.scope?.replace('SCOPE_', 'Scope ').replace('SOLVENT', 'Solvent').replace('SINK', 'Sink') || 'Unknown'} 
                        size="small"
                        sx={{
                          backgroundColor: 
                            submission.scope === 'SCOPE_1' ? '#E8F5E9' :
                            submission.scope === 'SCOPE_2' ? '#E0F7FA' :
                            submission.scope === 'SCOPE_3' ? '#F1F8E9' :
                            submission.scope === 'SOLVENT' ? '#FFF8E1' :
                            submission.scope === 'SINK' ? '#E0F2F1' : '#EEEEEE',
                          color: 
                            submission.scope === 'SCOPE_1' ? '#2E7D32' :
                            submission.scope === 'SCOPE_2' ? '#0097A7' :
                            submission.scope === 'SCOPE_3' ? '#558B2F' :
                            submission.scope === 'SOLVENT' ? '#FF8F00' :
                            submission.scope === 'SINK' ? '#00897B' : '#757575',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {submission.emissionSource}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {submission.startDate && submission.endDate ? 
                        `${new Date(submission.startDate).toLocaleDateString()} - ${new Date(submission.endDate).toLocaleDateString()}` : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell sx={{ 
                      fontSize: '0.875rem', 
                      color: submission.totalEmissions < 0 ? '#2E7D32' : 'inherit',
                      fontWeight: submission.totalEmissions < 0 ? 500 : 400
                    }}>
                      {formatEmissions(submission.totalEmissions, submission.units)}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {submission.submissionDate ? 
                        new Date(submission.submissionDate).toLocaleDateString() : 
                        (submission.submittedDate ? 
                          new Date(submission.submittedDate).toLocaleDateString() : 
                          'Not available')
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={submission.status} 
                        size="small"
                        sx={{
                          backgroundColor: 
                            submission.status === 'PENDING' ? '#FFF3E0' :
                            submission.status === 'APPROVED' ? '#E8F5E9' :
                            submission.status === 'DENIED' ? '#FFEBEE' : '#EEEEEE',
                          color: 
                            submission.status === 'PENDING' ? '#E65100' :
                            submission.status === 'APPROVED' ? '#2E7D32' :
                            submission.status === 'DENIED' ? '#C62828' : '#757575',
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {submission.comments}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#0A3D0A', fontWeight: 'bold', mb: 1 }}>
            Understanding Your Submissions
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Scope 1:</strong> Direct emissions from owned or controlled sources
          </Typography>
          <Typography variant="body2" paragraph>
            • <strong>Scope 2:</strong> Indirect emissions from purchased electricity, steam, heating, and cooling
          </Typography>
        </Box>
      </Paper>
    );
  };

  // Render the dashboard view
  const renderDashboardView = () => {
    return (
      <Box>
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
            mb: 4
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#0A3D0A', fontWeight: 'bold' }}>
            Welcome to Your ESG Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            This dashboard provides an overview of your company's environmental, social, and governance metrics.
            Use the tabs below to submit new data or view your submission history.
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={mainTab} 
              onChange={handleMainTabChange}
              sx={{ 
                mb: 3, 
                '& .MuiTabs-indicator': { backgroundColor: '#0A3D0A' },
                '& .Mui-selected': { color: '#0A3D0A', fontWeight: 'bold' }
              }}
            >
              <Tab label="Submit New Data" sx={{ textTransform: 'none' }} />
              <Tab label="View History" sx={{ textTransform: 'none' }} />
              <Tab label="Metrics Dashboard" sx={{ textTransform: 'none' }} />
            </Tabs>
          </Box>
          
          {mainTab === 0 && renderSubmissionForm()}
          {mainTab === 1 && renderSubmissionHistory()}
          {mainTab === 2 && <MetricsDashboard />}
        </Paper>
      </Box>
    );
  };

  // Render the appropriate view based on props
  const renderContent = () => {
    if (uploadView) {
      return renderSubmissionForm();
    } else if (historyView) {
      return renderSubmissionHistory();
    } else {
      return renderDashboardView();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {renderContent()}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RepresentativeDashboard;
