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
  Chip,
} from '@mui/material';
import { getPendingSubmissions, reviewSubmission } from '../services/api';

const ESGApprovalList = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
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

  const handleReview = async (status) => {
    try {
      await reviewSubmission(selectedSubmission.id, {
        status,
        comment: reviewComment
      });
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Pending ESG Submissions
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Company</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Reporting Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.company_name}</TableCell>
                  <TableCell>{submission.submitted_by_name}</TableCell>
                  <TableCell>
                    {new Date(submission.reporting_period).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.status}
                      color={
                        submission.status === 'pending'
                          ? 'warning'
                          : submission.status === 'approved'
                          ? 'success'
                          : 'error'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
                Submitted by {selectedSubmission.submitted_by_name} on{' '}
                {new Date(selectedSubmission.created_at).toLocaleString()}
              </Typography>

              {renderMetricSection(
                selectedSubmission.environmental_metrics,
                'Environmental Metrics'
              )}
              {renderMetricSection(
                selectedSubmission.social_metrics,
                'Social Metrics'
              )}
              {renderMetricSection(
                selectedSubmission.governance_metrics,
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
