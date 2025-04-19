import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import ESGMetricsChart from '../components/ESGMetricsChart';
import SubmissionDetailsDialog from '../components/SubmissionDetailsDialog';
import { getGHGEmissionsByCompany } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  // Dialog state for viewing submission details
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { user } = useAuth();
  const [ghgEmissions, setGhgEmissions] = useState([]);
  const [selectedReviewTab, setSelectedReviewTab] = useState(0);

  useEffect(() => {
    let polling;
    if (user && user.role && user.role.toLowerCase() === 'manager') {
      fetchGhgEmissions();
      polling = setInterval(() => fetchGhgEmissions(), 30000);
    }
    return () => polling && clearInterval(polling);
  }, [user]);

  const fetchGhgEmissions = async () => {
    try {
      const response = await getGHGEmissionsByCompany();
      setGhgEmissions(response.data);
      setFilteredEmissions(response.data);
    } catch (error) {
      console.error('Error fetching GHG emissions:', error);
      setNotification({
        open: true,
        message: 'Error fetching GHG emissions',
        severity: 'error'
      });
    }
  };


  // Filtering and sorting state
  const [filter, setFilter] = useState({ scope: '', category: '', status: '', date: '' });
  const [sort, setSort] = useState({ field: '', direction: 'asc' });

  // Filtering logic
  useEffect(() => {
    let filtered = [...ghgEmissions];
    if (filter.scope) filtered = filtered.filter(e => e.scope === filter.scope);
    if (filter.category) filtered = filtered.filter(e => e.category === filter.category);
    if (filter.status) filtered = filtered.filter(e => (e.status || '').toLowerCase() === filter.status.toLowerCase());
    if (filter.date) filtered = filtered.filter(e => e.startDate && new Date(e.startDate).toLocaleDateString() === filter.date);
    if (sort.field) {
      filtered.sort((a, b) => {
        if (!a[sort.field] || !b[sort.field]) return 0;
        if (sort.direction === 'asc') return a[sort.field] > b[sort.field] ? 1 : -1;
        else return a[sort.field] < b[sort.field] ? 1 : -1;
      });
    }
    setFilteredEmissions(filtered);
  }, [ghgEmissions, filter, sort]);

  // Sample data - replace with actual data from API
  const [filteredEmissions, setFilteredEmissions] = useState([]);
  const [chartData, setChartData] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [chartType, setChartType] = useState({
    scope1: 'bar',
    scope2: 'bar',
    scope3: 'bar',
  });

  const scopes = [
    { key: 'scope1', label: 'Scope 1' },
    { key: 'scope2', label: 'Scope 2' },
    { key: 'scope3', label: 'Scope 3' },
  ];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const selectedScope = scopes[newValue].key;
    if (!chartData[selectedScope]) {
      
    }
  };

  const handleChartTypeChange = (scopeKey, newType) => {
    setChartType(prev => ({ ...prev, [scopeKey]: newType }));
  };


  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, width: '100%' }}>
        <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: '#FFFFFF', mb: 3 }}>
          <Typography component="h2" variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            Submission Review
          </Typography>
          
              {/* GHG Emissions Chart for the selected (or default) scope */}
{(() => {
  const defaultScope = 'SCOPE_1';
  const defaultScopeLabel = 'Scope 1';
  return (
    <Box>
      {chartData[defaultScope] && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ color: '#388E3C', fontWeight: 500, mb: 1 }}>
            {defaultScopeLabel} GHG Emissions
          </Typography>
          <ESGMetricsChart
            type={chartType[defaultScope]}
            data={chartData[defaultScope]}
            title={`${defaultScopeLabel} GHG Emissions`}
          />
        </Box>
      )}
      <Table size="medium">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Company</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Submitted By</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#33691E' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEmissions.filter(sub => (sub.scope === 'SCOPE_1' || sub.scopeType === 'SCOPE_1')).length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">No GHG emissions for Scope 1.</TableCell>
            </TableRow>
          ) : (
            filteredEmissions.filter(sub => (sub.scope === 'SCOPE_1' || sub.scopeType === 'SCOPE_1')).map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.company?.name || 'N/A'}</TableCell>
                <TableCell>{submission.submittedBy?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={submission.status}
                    color={submission.status === 'PENDING' ? 'warning' : submission.status === 'APPROVED' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      mr: 1,
                      borderColor: '#2E7D32',
                      color: '#2E7D32',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { background: '#E8F5E9', borderColor: '#388E3C' }
                    }}
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      mr: 1,
                      background: 'linear-gradient(45deg, #2E7D32, #558B2F)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #558B2F, #2E7D32)',
                      },
                      textTransform: 'none',
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(45deg, #795548, #8D6E63)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #8D6E63, #795548)',
                      },
                      textTransform: 'none',
                    }}
                  >
                    Deny
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
 })()}
 </Paper>
 <SubmissionDetailsDialog
   open={detailsDialogOpen}
   onClose={() => setDetailsDialogOpen(false)}
   submission={selectedSubmission}
 />
 <Snackbar
   open={notification.open}
   autoHideDuration={3000}
   onClose={handleCloseNotification}
   anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
 >
   <Alert
     onClose={handleCloseNotification}
     severity={notification.severity}
     variant="filled"
     sx={{ backgroundColor: notification.severity === 'success' ? '#0A3D0A' : '', color: notification.severity === 'success' ? '#fff' : '' }}
   >
     {notification.message}
   </Alert>
 </Snackbar>
</Container>
</Box>
);
}

export default ManagerDashboard;
