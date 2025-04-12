import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import ESGDataForm from '../components/ESGDataForm';
import { useAuth } from '../context/AuthContext';
import { submitESGData } from '../services/api';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSubmit = async (formData) => {
    try {
      // Add user and company info to the form data
      const submissionData = {
        ...formData,
        user_id: user.id,
        company_id: user.company?.id,
        submission_date: new Date().toISOString()
      };

      // Submit the data
      await submitESGData(submissionData);

      // Show success message
      setNotification({
        open: true,
        message: 'ESG data submitted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting ESG data:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to submit ESG data. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Company Dashboard
        </Typography>
        
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Welcome, {user?.company?.name || 'Company Representative'}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <ESGDataForm 
            onSubmit={handleSubmit}
            company={user?.company}
          />
        </Box>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
    </Container>
  );
};

export default CompanyDashboard;
