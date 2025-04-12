import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { submitESGData } from '../services/api';
import { notificationEvents } from '../components/Navigation';

const RepresentativeDashboard = () => {
  const [formData, setFormData] = useState({
    environmentalScore: '',
    socialScore: '',
    governanceScore: '',
    submissionType: 'ESG',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert scores to numbers
      const submission = {
        ...formData,
        environmentalScore: parseFloat(formData.environmentalScore),
        socialScore: parseFloat(formData.socialScore),
        governanceScore: parseFloat(formData.governanceScore),
      };

      await submitESGData(submission);
      // Dispatch event to refresh notifications for managers
      window.dispatchEvent(notificationEvents.refresh);
      setSnackbar({
        open: true,
        message: 'ESG data submitted successfully!',
        severity: 'success',
      });

      // Reset form
      setFormData({
        environmentalScore: '',
        socialScore: '',
        governanceScore: '',
        submissionType: 'ESG',
      });
    } catch (error) {
      console.error('Error submitting ESG data:', error);
      setSnackbar({
        open: true,
        message: 'Error submitting ESG data',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* ESG Submission Form */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Submit ESG Data
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Environmental Score"
                      name="environmentalScore"
                      type="number"
                      value={formData.environmentalScore}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Social Score"
                      name="socialScore"
                      type="number"
                      value={formData.socialScore}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      required
                      fullWidth
                      label="Governance Score"
                      name="governanceScore"
                      type="number"
                      value={formData.governanceScore}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Submit ESG Data
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default RepresentativeDashboard;
