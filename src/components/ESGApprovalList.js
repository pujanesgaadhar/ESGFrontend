import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  // Chip, // Removed unused import
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getPendingSubmissions, reviewSubmission, deleteNotificationBySubmissionId, getSubmissionById } from '../services/api';

const ESGApprovalList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [viewSubmission, setViewSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const response = await getPendingSubmissions();
      setSubmissions(response.data);
    } catch (err) {
      setError('Failed to load submissions');
    }
  };
  
  // Load detailed submission data for viewing in the popup
  const loadSubmissionDetails = async (submissionId) => {
    try {
      setLoadingDetails(true);
      const response = await getSubmissionById(submissionId);
      setSubmissionDetails(response.data);
      setShowDetailsDialog(true);
    } catch (err) {
      setError('Failed to load submission details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleReview = async (status) => {
    try {
      // Update submission status
      await reviewSubmission(selectedSubmission.id, {
        status,
        comment: reviewComment
      });
      
      // Delete related notification automatically
      try {
        await deleteNotificationBySubmissionId(selectedSubmission.id);
        // No need to handle success explicitly as this is automatic cleanup
      } catch (notifErr) {
        console.warn('Could not delete notification, but submission was approved:', notifErr);
      }
      
      setSuccess(`Submission ${status} successfully`);
      setSelectedSubmission(null);
      setReviewComment('');
      loadSubmissions();
    } catch (err) {
      setError('Failed to update submission status');
    }
  };

  const formatMetricValue = (value, unit) => {
    return `${value} ${unit}`;
  };

  const renderMetricSection = (metrics, title) => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableBody>
              {Object.entries(metrics).map(([key, value]) => {
                if (key === 'unit') return null;
                return (
                  <TableRow key={key}>
                    <TableCell>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </TableCell>
                    <TableCell>
                      {formatMetricValue(value, metrics.unit)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>ESG Submissions Pending Review</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Submitted By</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>View Data</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.submittedBy?.name || 'Unknown'}</TableCell>
                    <TableCell>{submission.company?.name || 'Unknown'}</TableCell>
                    <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={() => loadSubmissionDetails(submission.id)}
                      >
                        View Data
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setViewSubmission(submission)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No submissions pending review</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for summary view */}
      <Dialog
        open={viewSubmission !== null}
        onClose={() => setViewSubmission(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>ESG Submission Summary</DialogTitle>
        <DialogContent>
          {viewSubmission && (
            <Box>
              <Typography variant="subtitle1">
                <strong>Submitted by:</strong> {viewSubmission.submittedBy?.name}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Company:</strong> {viewSubmission.company?.name}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Date:</strong> {new Date(viewSubmission.submittedAt).toLocaleString()}
              </Typography>
              
              {viewSubmission.environmentalMetrics && (
                renderMetricSection(viewSubmission.environmentalMetrics, 'Environmental Metrics')
              )}
              
              {viewSubmission.socialMetrics && (
                renderMetricSection(viewSubmission.socialMetrics, 'Social Metrics')
              )}
              
              {viewSubmission.governanceMetrics && (
                renderMetricSection(viewSubmission.governanceMetrics, 'Governance Metrics')
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewSubmission(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for detailed submission data */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#0A3D0A', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Detailed ESG Submission Data</Typography>
          <IconButton onClick={() => setShowDetailsDialog(false)} color="inherit" edge="end">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading submission data...</Typography>
            </Box>
          ) : submissionDetails ? (
            <Box>
              {/* Submission Metadata */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Submission Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Submitted By:</strong> {submissionDetails.submittedBy?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Company:</strong> {submissionDetails.company?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1">
                      <strong>Date:</strong> {new Date(submissionDetails.submittedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
  
              {/* Environmental Data Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  bgcolor: '#C8E6C9', 
                  color: '#0A3D0A', 
                  p: 1.5, 
                  borderRadius: 1, 
                  mb: 2, 
                  fontWeight: 'bold' 
                }}>
                  Environmental Data
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                        <TableCell><strong>Metric</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                        <TableCell><strong>Unit</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissionDetails.environmentalMetrics && Object.entries(submissionDetails.environmentalMetrics).map(([key, value]) => {
                        if (key === 'unit') return null;
                        const unit = submissionDetails.environmentalMetrics.unit || '';
                        return (
                          <TableRow key={`env-${key}`}>
                            <TableCell>{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                            <TableCell>{value}</TableCell>
                            <TableCell>{unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
  
              {/* Social Data Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  bgcolor: '#FFECB3', 
                  color: '#775500', 
                  p: 1.5, 
                  borderRadius: 1, 
                  mb: 2, 
                  fontWeight: 'bold' 
                }}>
                  Social Data
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                        <TableCell><strong>Metric</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                        <TableCell><strong>Unit</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissionDetails.socialMetrics && Object.entries(submissionDetails.socialMetrics).map(([key, value]) => {
                        if (key === 'unit') return null;
                        const unit = submissionDetails.socialMetrics.unit || '';
                        return (
                          <TableRow key={`soc-${key}`}>
                            <TableCell>{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                            <TableCell>{value}</TableCell>
                            <TableCell>{unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
  
              {/* Governance Data Section */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ 
                  bgcolor: '#BBDEFB', 
                  color: '#0D47A1', 
                  p: 1.5, 
                  borderRadius: 1, 
                  mb: 2, 
                  fontWeight: 'bold' 
                }}>
                  Governance Data
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f8f8' }}>
                        <TableCell><strong>Metric</strong></TableCell>
                        <TableCell><strong>Value</strong></TableCell>
                        <TableCell><strong>Unit</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissionDetails.governanceMetrics && Object.entries(submissionDetails.governanceMetrics).map(([key, value]) => {
                        if (key === 'unit') return null;
                        const unit = submissionDetails.governanceMetrics.unit || '';
                        return (
                          <TableRow key={`gov-${key}`}>
                            <TableCell>{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                            <TableCell>{value}</TableCell>
                            <TableCell>{unit}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography color="error">No submission data available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setShowDetailsDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review ESG Submission</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Submitted by {selectedSubmission.submittedBy?.name} on{' '}
                {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </Typography>

              {renderMetricSection(
                selectedSubmission.environmentalMetrics,
                'Environmental Metrics'
              )}
              {renderMetricSection(
                selectedSubmission.socialMetrics,
                'Social Metrics'
              )}
              {renderMetricSection(
                selectedSubmission.governanceMetrics,
                'Governance Metrics'
              )}

              <TextField
                fullWidth
                label="Review Comment"
                multiline
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSubmission(null)}>Cancel</Button>
          <Button
            onClick={() => handleReview('denied')}
            color="error"
            variant="contained"
          >
            Deny
          </Button>
          <Button
            onClick={() => handleReview('approved')}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ESGApprovalList;
