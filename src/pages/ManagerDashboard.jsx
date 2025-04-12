import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import ESGDataChart from '../components/ESGDataChart';
import { getESGSubmissions, reviewSubmission, getChartData } from '../services/api';

const ManagerDashboard = () => {
  // Sample data - replace with actual data from API
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Table columns configuration
  const tableColumns = [
    { id: 'company', label: 'Company' },
    { id: 'submittedBy', label: 'Submitted By' },
    { id: 'date', label: 'Date' },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status' },
    { id: 'actions', label: 'Actions' },
  ];

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchSubmissions();
    fetchChartData();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await getESGSubmissions();
      // Filter to show only pending submissions
      const pendingOnes = response.data.filter(submission => submission.status === 'PENDING');
      setPendingSubmissions(pendingOnes);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setNotification({
        open: true,
        message: 'Error fetching submissions',
        severity: 'error'
      });
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await getChartData();
      if (response.data) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setNotification({
        open: true,
        message: 'Error fetching chart data',
        severity: 'error'
      });
    }
  };

  const handleApprove = async (submissionId) => {
    try {
      await reviewSubmission(submissionId, { 
        status: 'APPROVED',
        reviewComments: 'Approved by manager'
      });
      // Update submissions list and refresh chart data
      await Promise.all([
        fetchSubmissions(),
        fetchChartData()
      ]);
      setNotification({
        open: true,
        message: 'Submission approved and data added to charts',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error approving submission:', error);
      setNotification({
        open: true,
        message: 'Error approving submission',
        severity: 'error'
      });
    }
  };

  const handleDeny = async (submissionId) => {
    try {
      await reviewSubmission(submissionId, { 
        status: 'DENIED',
        reviewComments: 'Denied by manager'
      });
      await fetchSubmissions(); // Refresh the submissions list
      setNotification({
        open: true,
        message: 'Submission denied',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error denying submission:', error);
      setNotification({
        open: true,
        message: 'Error denying submission',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Pending Approvals */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Pending Approvals
              </Typography>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Submitted By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.company?.name || 'N/A'}</TableCell>
                      <TableCell>{submission.submittedBy?.name || 'N/A'}</TableCell>
                      <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{submission.submissionType || 'ESG'}</TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status}
                          color={submission.status === 'PENDING' ? 'warning' : submission.status === 'APPROVED' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleApprove(submission.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleDeny(submission.id)}
                        >
                          Deny
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* ESG Performance Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                ESG Performance Overview
              </Typography>
              <ESGDataChart />
            </Paper>
          </Grid>
        </Grid>

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
    </Box>
  );
};

export default ManagerDashboard;
