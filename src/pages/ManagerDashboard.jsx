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
import { getESGSubmissions, reviewSubmission, getChartData, getGHGEmissionsByCompany } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [ghgEmissions, setGhgEmissions] = useState([]);
  const [selectedReviewTab, setSelectedReviewTab] = useState(0);

  useEffect(() => {
    if (user && user.company && user.company.id) {
      fetchGhgEmissions(user.company.id);
    }
  }, [user]);

  const fetchGhgEmissions = async (companyId) => {
    try {
      const response = await getGHGEmissionsByCompany(companyId);
      setGhgEmissions(response.data);
    } catch (error) {
      console.error('Error fetching GHG emissions:', error);
      setNotification({
        open: true,
        message: 'Error fetching GHG emissions',
        severity: 'error'
      });
    }
  };

  // Sample data - replace with actual data from API
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
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
      fetchChartData(selectedScope);
    }
  };

  const handleChartTypeChange = (scopeKey, newType) => {
    setChartType(prev => ({ ...prev, [scopeKey]: newType }));
  };

  

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchSubmissions();
    fetchChartData('scope1'); // Default to Scope 1 on load
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await getESGSubmissions();
      // Show only PENDING submissions
      const filtered = response.data.filter(
        submission => submission.status === 'PENDING'
      );
      setPendingSubmissions(filtered);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setNotification({
        open: true,
        message: 'Error fetching submissions',
        severity: 'error'
      });
    }
  };

  const fetchChartData = async (scope) => {
    try {
      const response = await getChartData({ scope });
      if (response.data) {
        setChartData(prev => ({ ...prev, [scope]: response.data }));
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
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, width: '100%' }}>
        <Paper sx={{ p: 3, borderRadius: 2, backgroundColor: '#FFFFFF', mb: 3 }}>
          <Typography component="h2" variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            Submission Review
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={selectedReviewTab} onChange={(e, v) => setSelectedReviewTab(v)} textColor="primary" indicatorColor="primary">
              <Tab label="ESG Submissions" />
              <Tab label="GHG Emissions Review" />
            </Tabs>
          </Box>

          {/* ESG Submissions Tab */}
          {selectedReviewTab === 0 && (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={selectedTab} onChange={handleTabChange} textColor="primary" indicatorColor="primary" >
                  {scopes.map((scope, idx) => (
                    <Tab key={scope.key} label={scope.label} />
                  ))}
                </Tabs>
              </Box>
              {scopes.map((scope, idx) => (
                selectedTab === idx && (
                  <Box key={scope.key}>
                    {/* GHG Emissions Chart for selected scope */}
                    {chartData[scope.key] && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" sx={{ color: '#388E3C', fontWeight: 500, mb: 1 }}>
                          {scope.label} GHG Emissions
                        </Typography>
                        <ESGMetricsChart
                          type={chartType[scope.key]}
                          data={chartData[scope.key]}
                          title={`${scope.label} GHG Emissions`}
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
                        {pendingSubmissions.filter(sub => (sub.scope === scope.key || sub.scopeType === scope.key)).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">No pending submissions for this scope.</TableCell>
                          </TableRow>
                        ) : (
                          pendingSubmissions.filter(sub => (sub.scope === scope.key || sub.scopeType === scope.key)).map((submission) => (
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
                                  onClick={() => handleApprove(submission.id)}
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
                                  onClick={() => handleDeny(submission.id)}
                                >
                                  Deny
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    {/* Chart Section for Approved Data */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" sx={{ color: '#388E3C', fontWeight: 'bold', mb: 1 }}>
                        {scope.label} Emissions Chart
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ mr: 2 }}>Chart Type:</Typography>
                        <select
                          value={chartType[scope.key]}
                          onChange={e => handleChartTypeChange(scope.key, e.target.value)}
                          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #9DC183', background: '#F6FFF6' }}
                        >
                          <option value="bar">Bar</option>
                          <option value="line">Line</option>
                          <option value="pie">Pie</option>
                        </select>
                      </Box>
                      <ESGMetricsChart
                        type={chartType[scope.key]}
                        data={chartData[scope.key]}
                        title={`${scope.label} GHG Emissions`}
                      />
                    </Box>
                  </Box>
                )
              ))}
            </>
          )}

          {/* GHG Emissions Review Tab */}
          {selectedReviewTab === 1 && (
  <Box>
    <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold', mb: 2 }}>
      GHG Emissions Records
    </Typography>
    <Table size="medium">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Date</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Scope</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Category</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Value</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Unit</TableCell>
          <TableCell sx={{ fontWeight: 'bold', color: '#33691E' }}>Time Frame</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {ghgEmissions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} align="center">No GHG emissions records found.</TableCell>
          </TableRow>
        ) : (
          ghgEmissions.map((emission) => (
            <TableRow key={emission.id}>
              <TableCell>{emission.startDate ? new Date(emission.startDate).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell>{emission.scope || emission.emissionScope || 'N/A'}</TableCell>
              <TableCell>{emission.category || emission.emissionCategory || 'N/A'}</TableCell>
              <TableCell>{emission.value ?? 'N/A'}</TableCell>
              <TableCell>{emission.unit || 'N/A'}</TableCell>
              <TableCell>{emission.timeFrame || 'N/A'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
    {/* Chart Section for GHG Emissions */}
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" sx={{ color: '#388E3C', fontWeight: 'bold', mb: 1 }}>
        GHG Emissions Chart
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ mr: 2 }}>Scope Filter:</Typography>
        <select
          value={selectedTab}
          onChange={e => setSelectedTab(Number(e.target.value))}
          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #9DC183', background: '#F6FFF6' }}
        >
          {scopes.map((scope, idx) => (
            <option key={scope.key} value={idx}>{scope.label}</option>
          ))}
        </select>
      </Box>
      <ESGMetricsChart
        type={chartType[scopes[selectedTab].key]}
        data={chartData[scopes[selectedTab].key]}
        title={`${scopes[selectedTab].label} GHG Emissions`}
      />
    </Box>
  </Box>
)}

          {scopes.map((scope, idx) => (
            selectedTab === idx && (
              <Box key={scope.key}>
                {/* GHG Emissions Chart for selected scope */}
                {chartData[scope.key] && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ color: '#388E3C', fontWeight: 500, mb: 1 }}>
                      {scope.label} GHG Emissions
                    </Typography>
                    <ESGMetricsChart
                      type={chartType[scope.key]}
                      data={chartData[scope.key]}
                      title={`${scope.label} GHG Emissions`}
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
                    {pendingSubmissions.filter(sub => (sub.scope === scope.key || sub.scopeType === scope.key)).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">No pending submissions for this scope.</TableCell>
                      </TableRow>
                    ) : (
                      pendingSubmissions.filter(sub => (sub.scope === scope.key || sub.scopeType === scope.key)).map((submission) => (
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
                              onClick={() => handleApprove(submission.id)}
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
                              onClick={() => handleDeny(submission.id)}
                            >
                              Deny
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {/* Chart Section for Approved Data */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" sx={{ color: '#388E3C', fontWeight: 'bold', mb: 1 }}>
                    {scope.label} Emissions Chart
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ mr: 2 }}>Chart Type:</Typography>
                    <select
                      value={chartType[scope.key]}
                      onChange={e => handleChartTypeChange(scope.key, e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #9DC183', background: '#F6FFF6' }}
                    >
                      <option value="bar">Bar</option>
                      <option value="line">Line</option>
                      <option value="pie">Pie</option>
                    </select>
                  </Box>
                  <ESGMetricsChart
                    type={chartType[scope.key]}
                    data={chartData[scope.key]}
                    title={`${scope.label} GHG Emissions`}
                  />
                </Box>
              </Box>
            )
          ))}
        </Paper>
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
};

export default ManagerDashboard;
