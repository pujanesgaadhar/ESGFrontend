import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Divider, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RepresentativeActivityMonitor = () => {
  const [timeFrame, setTimeFrame] = useState('month');
  
  // Sample data - replace with actual API data
  const representativeData = [
    { 
      id: 1, 
      name: 'Rahul Sharma', 
      department: 'Manufacturing',
      submissions: {
        week: 2,
        month: 8,
        quarter: 24
      },
      dataQuality: 4.5,
      lastActive: '2025-04-22T10:30:00',
      trainingNeeds: ['Advanced Scope 3', 'Data Verification']
    },
    { 
      id: 2, 
      name: 'Priya Patel', 
      department: 'Logistics',
      submissions: {
        week: 1,
        month: 4,
        quarter: 12
      },
      dataQuality: 3.2,
      lastActive: '2025-04-21T15:45:00',
      trainingNeeds: ['Basic GHG Accounting', 'Emission Factors']
    },
    { 
      id: 3, 
      name: 'Vikram Singh', 
      department: 'Office Operations',
      submissions: {
        week: 3,
        month: 12,
        quarter: 32
      },
      dataQuality: 4.8,
      lastActive: '2025-04-23T09:15:00',
      trainingNeeds: []
    },
    { 
      id: 4, 
      name: 'Ananya Desai', 
      department: 'R&D',
      submissions: {
        week: 0,
        month: 2,
        quarter: 8
      },
      dataQuality: 2.5,
      lastActive: '2025-04-10T11:20:00',
      trainingNeeds: ['Basic GHG Accounting', 'Emission Factors', 'Data Collection']
    },
    { 
      id: 5, 
      name: 'Rajesh Kumar', 
      department: 'Warehouse',
      submissions: {
        week: 2,
        month: 7,
        quarter: 18
      },
      dataQuality: 3.8,
      lastActive: '2025-04-20T14:10:00',
      trainingNeeds: ['Data Verification']
    }
  ];
  
  // Calculate average submissions
  const calculateAverage = (timeframe) => {
    const total = representativeData.reduce((sum, rep) => sum + rep.submissions[timeframe], 0);
    return (total / representativeData.length).toFixed(1);
  };
  
  // Format date to relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };
  
  // Get activity status
  const getActivityStatus = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 2) return 'active';
    if (diffDays < 7) return 'moderate';
    return 'inactive';
  };
  
  // Sort representatives by submission count (highest first)
  const sortedRepresentatives = [...representativeData].sort(
    (a, b) => b.submissions[timeFrame] - a.submissions[timeFrame]
  );
  
  // Calculate total training needs
  const calculateTotalTrainingNeeds = () => {
    return representativeData.reduce((sum, rep) => sum + rep.trainingNeeds.length, 0);
  };

  return (
    <Card sx={{ 
      mb: 4, 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: 2
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ color: '#0A3D0A', mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
            Representative Activity Monitor
          </Typography>
          
          <Box sx={{ ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="time-frame-label">Time Frame</InputLabel>
              <Select
                labelId="time-frame-label"
                id="time-frame-select"
                value={timeFrame}
                label="Time Frame"
                onChange={(e) => setTimeFrame(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9DC183'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#0A3D0A'
                  }
                }}
              >
                <MenuItem value="week">Weekly</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="quarter">Quarterly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Submission Frequency */}
          <Grid item xs={12} lg={8}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
              Submission Frequency by Representative
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f9f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>Representative</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>Department</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      Submissions ({timeFrame})
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>Data Quality</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>Last Active</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>Training Needs</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRepresentatives.map((rep) => {
                    const activityStatus = getActivityStatus(rep.lastActive);
                    
                    return (
                      <TableRow key={rep.id} sx={{ 
                        '&:hover': { backgroundColor: '#f0f7f0' },
                        backgroundColor: rep.submissions[timeFrame] === 0 ? '#fff8e1' : 'inherit'
                      }}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                          {rep.name}
                        </TableCell>
                        <TableCell>{rep.department}</TableCell>
                        <TableCell align="center">
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'medium',
                              color: rep.submissions[timeFrame] === 0 ? '#d32f2f' : 'inherit'
                            }}
                          >
                            {rep.submissions[timeFrame]}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Rating 
                              value={rep.dataQuality} 
                              precision={0.5} 
                              size="small" 
                              readOnly 
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#0A3D0A',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Box 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                backgroundColor: 
                                  activityStatus === 'active' ? '#2E7D32' : 
                                  activityStatus === 'moderate' ? '#FB8C00' : 
                                  '#d32f2f',
                                mr: 1
                              }} 
                            />
                            <Typography variant="body2">
                              {formatRelativeTime(rep.lastActive)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          {rep.trainingNeeds.length > 0 ? (
                            <Tooltip 
                              title={
                                <React.Fragment>
                                  <Typography variant="subtitle2">Training Needs:</Typography>
                                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {rep.trainingNeeds.map((need, index) => (
                                      <li key={index}>{need}</li>
                                    ))}
                                  </ul>
                                </React.Fragment>
                              }
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <SchoolIcon sx={{ color: '#FB8C00', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                  {rep.trainingNeeds.length}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            <CheckCircleIcon sx={{ color: '#2E7D32', fontSize: 20 }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          {/* Activity Summary */}
          <Grid item xs={12} lg={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#0A3D0A' }}>
              Activity Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#f5f9f5', 
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                    Average Submissions per Representative
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                    {calculateAverage(timeFrame)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: '#666' }}>
                    {timeFrame === 'week' ? 'This week' : 
                     timeFrame === 'month' ? 'This month' : 'This quarter'}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#f5f9f5', 
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                    Data Quality Assessment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      {(representativeData.reduce((sum, rep) => sum + rep.dataQuality, 0) / representativeData.length).toFixed(1)}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                      / 5.0
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Rating 
                      value={(representativeData.reduce((sum, rep) => sum + rep.dataQuality, 0) / representativeData.length)} 
                      precision={0.1} 
                      size="small" 
                      readOnly 
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#0A3D0A',
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#f5f9f5', 
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                    Training & Guidance Needs
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: '#0A3D0A', mr: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                      {calculateTotalTrainingNeeds()}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                      identified needs
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                      Top Training Areas:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip 
                        size="small" 
                        label="Basic GHG Accounting" 
                        sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} 
                      />
                      <Chip 
                        size="small" 
                        label="Emission Factors" 
                        sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} 
                      />
                      <Chip 
                        size="small" 
                        label="Data Verification" 
                        sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }} 
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RepresentativeActivityMonitor;
