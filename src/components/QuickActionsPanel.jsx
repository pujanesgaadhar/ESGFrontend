import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Badge,
  Chip,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { 
  Add as AddIcon,
  Refresh as RefreshIcon,
  Comment as CommentIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { ESG_COLORS } from '../theme/esgTheme';

const QuickActionsPanel = ({ onStartNewSubmission, onViewDrafts, onViewFeedback }) => {
  // These would typically come from API calls in a real implementation
  const draftCount = 2;
  const pendingFeedbackCount = 3;
  const lastSubmissionDate = "2025-05-05";
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const actionButtons = [
    {
      id: 'new-environment',
      label: 'New Environment Submission',
      icon: <AddIcon />,
      color: ESG_COLORS.environment,
      onClick: () => onStartNewSubmission && onStartNewSubmission('environment'),
      description: 'Submit new GHG emissions data'
    },
    {
      id: 'new-social',
      label: 'New Social Submission',
      icon: <AddIcon />,
      color: ESG_COLORS.social,
      onClick: () => onStartNewSubmission && onStartNewSubmission('social'),
      description: 'Submit new social metrics data'
    },
    {
      id: 'new-governance',
      label: 'New Governance Submission',
      icon: <AddIcon />,
      color: ESG_COLORS.governance,
      onClick: () => onStartNewSubmission && onStartNewSubmission('governance'),
      description: 'Submit new governance metrics data'
    },
    {
      id: 'view-drafts',
      label: 'Resume Draft Submissions',
      icon: <RefreshIcon />,
      color: draftCount > 0 ? ESG_COLORS.brand.dark : '#999',
      onClick: () => onViewDrafts && onViewDrafts(),
      description: `${draftCount} draft${draftCount !== 1 ? 's' : ''} saved`,
      badge: draftCount
    },
    {
      id: 'view-feedback',
      label: 'View Manager Feedback',
      icon: <CommentIcon />,
      color: pendingFeedbackCount > 0 ? '#FF9800' : '#999',
      onClick: () => onViewFeedback && onViewFeedback(),
      description: `${pendingFeedbackCount} item${pendingFeedbackCount !== 1 ? 's' : ''} need attention`,
      badge: pendingFeedbackCount
    },
    {
      id: 'upload-csv',
      label: 'Upload CSV Data',
      icon: <CloudUploadIcon />,
      color: ESG_COLORS.brand.dark,
      onClick: () => window.location.href = '/upload',
      description: 'Bulk upload using CSV templates'
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 0,
          backgroundColor: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${ESG_COLORS.brand.light}40`,
          width: '100%',
          m: 0
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: ESG_COLORS.brand.dark }}>
            Quick Actions
          </Typography>
          <Chip 
            label={`Last submission: ${formatDate(lastSubmissionDate)}`}
            size="small"
            sx={{ 
              backgroundColor: `${ESG_COLORS.brand.dark}15`,
              color: ESG_COLORS.brand.dark,
              fontWeight: 'medium'
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
          {actionButtons.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={action.id} sx={{ width: '100%' }}>
              <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card 
                  sx={{ 
                    height: '100%',
                    width: '100%',
                    borderRadius: 0,
                    transition: 'all 0.3s ease',
                    border: `1px solid ${action.color}30`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      borderColor: `${action.color}60`
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, height: '100%' }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 'bold', 
                            mb: 1,
                            color: action.color,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                            {action.badge ? (
                              <Badge badgeContent={action.badge} color="error">
                                {action.icon}
                              </Badge>
                            ) : action.icon}
                          </Box>
                          {action.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          {action.description}
                        </Typography>
                      </Box>
                      
                      <Button 
                        variant="outlined"
                        onClick={action.onClick}
                        fullWidth
                        sx={{ 
                          borderColor: action.color,
                          color: action.color,
                          '&:hover': {
                            backgroundColor: `${action.color}10`,
                            borderColor: action.color
                          },
                          textTransform: 'none'
                        }}
                      >
                        {action.badge ? 'View' : 'Start'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default QuickActionsPanel;
