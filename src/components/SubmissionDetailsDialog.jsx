import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Divider
} from '@mui/material';

const SubmissionDetailsDialog = ({ open, onClose, submission }) => {
  if (!submission) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Submission Details</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="subtitle2">Company:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.company?.name ?? 'N/A'}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2">Submitted By:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.submittedBy?.name ?? 'N/A'}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2">Submission Date:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'N/A'}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2">Status:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.status ?? 'N/A'}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2">Type:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.submissionType ?? 'ESG'}</Typography></Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        {/* Show submitted GHG data if present */}
        {submission.scope && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>GHG Emission Details</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}><Typography variant="subtitle2">Scope:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.scope}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Category:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.category}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Quantity:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.quantity}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Unit:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.unit}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Start Date:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.start_date ? new Date(submission.start_date).toLocaleDateString() : 'N/A'}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">End Date:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.end_date ? new Date(submission.end_date).toLocaleDateString() : 'N/A'}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Calculation Method:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.calculation_method}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Emission Factor:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.emission_factor}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Emission Factor Unit:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.emission_factor_unit}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Source:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.source}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2">Notes:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.notes}</Typography></Grid>
            </Grid>
          </>
        )}
        {submission.environmentalMetrics && submission.environmentalMetrics !== 'N/A' && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Environmental Metrics</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.environmentalMetrics}</Typography>
          </>
        )}
        {submission.socialMetrics && submission.socialMetrics !== 'N/A' && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Social Metrics</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.socialMetrics}</Typography>
          </>
        )}
        {submission.governanceMetrics && submission.governanceMetrics !== 'N/A' && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Governance Metrics</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.governanceMetrics}</Typography>
          </>
        )}
        {submission.reviewComments && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Review Comments</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.reviewComments}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionDetailsDialog;
