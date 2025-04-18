import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import GHGEmissionForm from '../components/GHGEmissionForm';

const RepresentativeDashboard = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('User data from localStorage:', user);
    if (user && user.company && user.company.id) {
      console.log('Setting company ID:', user.company.id);
      setCompanyId(user.company.id);
    } else {
      console.warn('No company information found in user data');
    }
  }, []);

  const handleSubmissionSuccess = () => {
    setSnackbar({
      open: true,
      message: 'Data submitted successfully.',
      severity: 'success',
    });
  };

  const handleSubmissionError = (error) => {
    setSnackbar({
      open: true,
      message: `Error submitting GHG data: ${error.message}`,
      severity: 'error',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, width: '100%' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {companyId ? (
            <GHGEmissionForm
              companyId={companyId}
              onSuccess={handleSubmissionSuccess}
              onError={handleSubmissionError}
            />
          ) : (
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Typography variant="h6" color="error">
                Error: Company information not found. Please contact support.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ backgroundColor: '#0A3D0A', color: '#fff' }}
        >
          Data submitted successfully.
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default RepresentativeDashboard;
