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
  
  // Function to format date strings consistently
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Function to format datetime strings
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: '#0A3D0A', fontWeight: 'bold' }}>Submission Details</DialogTitle>
      <DialogContent dividers>
        {/* Basic submission information */}
        <Grid container spacing={2}>
          <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Company:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.company?.name ?? 'N/A'}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Submitted By:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.submittedBy?.name ?? submission.submittedBy?.email ?? 'N/A'}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Submission Date:</Typography></Grid>
          <Grid item xs={6}><Typography>{formatDateTime(submission.submissionDate || submission.createdAt)}</Typography></Grid>

          <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Status:</Typography></Grid>
          <Grid item xs={6}><Typography>{submission.status ?? 'N/A'}</Typography></Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* GHG Emission Details - Only shown if scope is present */}
        {submission.scope && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0A3D0A', mt: 2 }}>GHG Emission Details</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Scope:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.scope}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Category:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.category}</Typography></Grid>
              
              {(submission.timeFrame || submission.time_frame) && (
                <>
                  <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Time Frame:</Typography></Grid>
                  <Grid item xs={6}><Typography>{submission.timeFrame || submission.time_frame}</Typography></Grid>
                </>
              )}

              <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Quantity:</Typography></Grid>
              <Grid item xs={6}><Typography>{submission.quantity} {submission.unit}</Typography></Grid>

              <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Reporting Period:</Typography></Grid>
              <Grid item xs={6}><Typography>{formatDate(submission.startDate || submission.start_date)} - {formatDate(submission.endDate || submission.end_date)}</Typography></Grid>
              
              {(submission.activity || submission.activityType) && (
                <>
                  <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Activity:</Typography></Grid>
                  <Grid item xs={6}><Typography>{submission.activity || submission.activityType}</Typography></Grid>
                </>
              )}
              
              {(submission.calculationMethod || submission.calculation_method) && (
                <>
                  <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Calculation Method:</Typography></Grid>
                  <Grid item xs={6}><Typography>{submission.calculationMethod || submission.calculation_method}</Typography></Grid>
                </>
              )}
              
              {(submission.emissionFactor || submission.emission_factor) && (
                <>
                  <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Emission Factor:</Typography></Grid>
                  <Grid item xs={6}><Typography>
                    {submission.emissionFactor || submission.emission_factor} 
                    {submission.emissionFactorUnit || submission.emission_factor_unit}
                  </Typography></Grid>
                </>
              )}
              
              {submission.source && (
                <>
                  <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Source:</Typography></Grid>
                  <Grid item xs={6}><Typography>{submission.source}</Typography></Grid>
                </>
              )}
              
              {submission.notes && (
                <>
                  <Grid item xs={6}><Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#33691E' }}>Notes:</Typography></Grid>
                  <Grid item xs={6}><Typography sx={{ whiteSpace: 'pre-line' }}>{submission.notes}</Typography></Grid>
                </>
              )}
            </Grid>
          </>
        )}
        
        {/* ESG Metrics - Only shown if they exist and aren't 'N/A' */}
        {submission.environmentalMetrics && submission.environmentalMetrics !== 'N/A' && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0A3D0A', mt: 2 }}>Environmental Metrics</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.environmentalMetrics}</Typography>
          </>
        )}
        
        {submission.socialMetrics && submission.socialMetrics !== 'N/A' && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0A3D0A', mt: 2 }}>Social Metrics</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.socialMetrics}</Typography>
          </>
        )}
        
        {submission.governanceMetrics && submission.governanceMetrics !== 'N/A' && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0A3D0A', mt: 2 }}>Governance Metrics</Typography>
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: 14 }}>{submission.governanceMetrics}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          variant="contained" 
          sx={{ 
            background: 'linear-gradient(45deg, #0A3D0A, #9DC183)',
            textTransform: 'none',
            '&:hover': { background: 'linear-gradient(45deg, #9DC183, #0A3D0A)' }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionDetailsDialog;
