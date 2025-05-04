import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Chip
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import EventIcon from '@mui/icons-material/Event';
import ArticleIcon from '@mui/icons-material/Article';

const RegulatoryCompliancePanel = () => {
  // Sample data - replace with actual API data
  const complianceFrameworks = [
    { 
      id: 1, 
      name: 'GHG Protocol', 
      status: 'compliant', 
      lastUpdated: '2025-03-15', 
      completeness: 100 
    },
    { 
      id: 2, 
      name: 'TCFD Reporting', 
      status: 'partial', 
      lastUpdated: '2025-02-28', 
      completeness: 75 
    },
    { 
      id: 3, 
      name: 'CDP Disclosure', 
      status: 'pending', 
      lastUpdated: '2025-01-10', 
      completeness: 40 
    },
    { 
      id: 4, 
      name: 'SBTi Targets', 
      status: 'non-compliant', 
      lastUpdated: '2024-12-05', 
      completeness: 25 
    }
  ];
  
  const upcomingDeadlines = [
    { 
      id: 1, 
      framework: 'CDP Disclosure', 
      deadline: '2025-05-15', 
      daysRemaining: 22, 
      status: 'at-risk' 
    },
    { 
      id: 2, 
      framework: 'TCFD Report', 
      deadline: '2025-06-30', 
      daysRemaining: 68, 
      status: 'on-track' 
    },
    { 
      id: 3, 
      framework: 'GHG Protocol Verification', 
      deadline: '2025-07-15', 
      daysRemaining: 83, 
      status: 'on-track' 
    }
  ];
  
  const documentationStatus = [
    { id: 1, document: 'Emissions Calculation Methodology', status: 'complete', lastUpdated: '2025-03-10' },
    { id: 2, document: 'Scope 3 Emissions Inventory', status: 'in-progress', lastUpdated: '2025-04-05' },
    { id: 3, document: 'Climate Risk Assessment', status: 'incomplete', lastUpdated: '2024-11-20' },
    { id: 4, document: 'Reduction Target Documentation', status: 'complete', lastUpdated: '2025-02-15' }
  ];
  
  // Helper function to render status chip
  const renderStatusChip = (status) => {
    switch(status) {
      case 'compliant':
      case 'complete':
      case 'on-track':
        return (
          <Chip 
            size="small" 
            icon={<CheckCircleIcon />} 
            label={status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            sx={{ 
              backgroundColor: '#E8F5E9', 
              color: '#2E7D32',
              '& .MuiChip-icon': { color: '#2E7D32' }
            }} 
          />
        );
      case 'partial':
      case 'in-progress':
      case 'at-risk':
        return (
          <Chip 
            size="small" 
            icon={<WarningIcon />} 
            label={status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            sx={{ 
              backgroundColor: '#FFF8E1', 
              color: '#F57C00',
              '& .MuiChip-icon': { color: '#F57C00' }
            }} 
          />
        );
      case 'non-compliant':
      case 'incomplete':
      case 'pending':
        return (
          <Chip 
            size="small" 
            icon={<ErrorIcon />} 
            label={status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
            sx={{ 
              backgroundColor: '#FFEBEE', 
              color: '#C62828',
              '& .MuiChip-icon': { color: '#C62828' }
            }} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ 
      mb: 4, 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: 2
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GavelIcon sx={{ color: '#0A3D0A', mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
            Regulatory Compliance Panel
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Compliance Status */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
              Compliance Status
            </Typography>
            <List sx={{ 
              bgcolor: '#f5f9f5', 
              borderRadius: 1,
              p: 0,
              '& .MuiListItem-root': {
                borderBottom: '1px solid #e0e0e0',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}>
              {complianceFrameworks.map((framework) => (
                <ListItem key={framework.id} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={framework.name}
                    secondary={`Last updated: ${new Date(framework.lastUpdated).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Box sx={{ ml: 2, minWidth: 100 }}>
                    {renderStatusChip(framework.status)}
                  </Box>
                  <Box sx={{ ml: 2, width: 60 }}>
                    <Typography variant="body2" sx={{ textAlign: 'right', mb: 0.5 }}>
                      {framework.completeness}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={framework.completeness} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 
                            framework.completeness > 75 ? '#2E7D32' : 
                            framework.completeness > 50 ? '#9DC183' : 
                            framework.completeness > 25 ? '#FB8C00' : '#d32f2f'
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Upcoming Deadlines */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
              Upcoming Regulatory Deadlines
            </Typography>
            <List sx={{ 
              bgcolor: '#f5f9f5', 
              borderRadius: 1,
              p: 0,
              '& .MuiListItem-root': {
                borderBottom: '1px solid #e0e0e0',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}>
              {upcomingDeadlines.map((deadline) => (
                <ListItem key={deadline.id} sx={{ py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <EventIcon sx={{ color: deadline.daysRemaining < 30 ? '#d32f2f' : '#0A3D0A' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={deadline.framework}
                    secondary={`Due: ${new Date(deadline.deadline).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Box sx={{ ml: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: deadline.daysRemaining < 30 ? 'bold' : 'normal',
                        color: deadline.daysRemaining < 30 ? '#d32f2f' : 'inherit'
                      }}
                    >
                      {deadline.daysRemaining} days left
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {renderStatusChip(deadline.status)}
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Documentation Completeness */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
              Documentation Completeness
            </Typography>
            <List sx={{ 
              bgcolor: '#f5f9f5', 
              borderRadius: 1,
              p: 0,
              '& .MuiListItem-root': {
                borderBottom: '1px solid #e0e0e0',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }
            }}>
              {documentationStatus.map((doc) => (
                <ListItem key={doc.id} sx={{ py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <ArticleIcon sx={{ color: '#0A3D0A' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.document}
                    secondary={`Updated: ${new Date(doc.lastUpdated).toLocaleDateString()}`}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <Box sx={{ ml: 1 }}>
                    {renderStatusChip(doc.status)}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RegulatoryCompliancePanel;
