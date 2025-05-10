import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  // Typography, // Removed unused import
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Assessment, BusinessCenter, AccountBalance } from '@mui/icons-material';
import SubmissionDetailsDialog from '../components/SubmissionDetailsDialog';
import ManagerDashboardTable from '../components/ManagerDashboardTable';
import { 
  getGHGEmissionsByCompany, 
  updateGHGEmissionStatus,
  getSocialMetricsByCompany,
  updateSocialMetricStatus,
  getGovernanceMetricsByCompany,
  updateGovernanceMetricStatus,
  getGHGEmissionsHistory,
  getSocialMetricsHistory,
  getGovernanceMetricsHistory
} from '../services/api';
import { useAuth } from '../context/AuthContext';
// Removed unused import ESG_COLORS

const ManagerDashboard = () => {
  // Dialog state for viewing submission details
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const { user } = useAuth();
  
  // Main category tabs state
  const [mainTab, setMainTab] = useState(0);
  
  // Data states
  const [ghgEmissions, setGhgEmissions] = useState([]);
  const [socialMetrics, setSocialMetrics] = useState([]);
  const [governanceMetrics, setGovernanceMetrics] = useState([]);
  
  // Removed unused history states
  // These states were not being used in the component
  
  // Tab states for each category
  const [selectedReviewTab, setSelectedReviewTab] = useState(0);
  const [selectedSocialTab, setSelectedSocialTab] = useState(0);
  const [selectedGovernanceTab, setSelectedGovernanceTab] = useState(0);

  // Pending counts
  const [pendingCounts, setPendingCounts] = useState({
    // Environment
    scope1: 0,
    scope2: 0,
    scope3: 0,
    solvent: 0,
    sink: 0,
    // Social
    employee: 0,
    community: 0,
    supplyChain: 0,
    // Governance
    corporate: 0,
    ethics: 0,
    risk: 0
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    let polling;
    if (user && user.role && user.role.toLowerCase() === 'manager') {
      fetchAllMetrics();
      polling = setInterval(() => fetchAllMetrics(), 30000);
    }
    return () => polling && clearInterval(polling);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Adding fetchAllMetrics as a dependency would cause infinite re-renders
  
  // Check localStorage for tab selection from notification click
  useEffect(() => {
    // Check if we have a main tab selection from notification
    const selectedMainTab = localStorage.getItem('selectedMainTab');
    if (selectedMainTab !== null) {
      setMainTab(parseInt(selectedMainTab));
      localStorage.removeItem('selectedMainTab');
    }
    
    // Check if we have a sub-tab selection from notification
    const selectedSubTab = localStorage.getItem('selectedSubTab');
    if (selectedSubTab !== null) {
      const subTabIndex = parseInt(selectedSubTab);
      
      // Set the appropriate sub-tab based on the main tab
      if (selectedMainTab === '0' || mainTab === 0) {
        setSelectedReviewTab(subTabIndex);
      } else if (selectedMainTab === '1' || mainTab === 1) {
        setSelectedSocialTab(subTabIndex);
      } else if (selectedMainTab === '2' || mainTab === 2) {
        setSelectedGovernanceTab(subTabIndex);
      }
      
      localStorage.removeItem('selectedSubTab');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Adding mainTab as a dependency would cause unnecessary re-renders
  
  const fetchAllMetrics = () => {
    fetchGhgEmissions();
    fetchSocialMetrics();
    fetchGovernanceMetrics();
    fetchAllHistory();
  };
  
  const fetchAllHistory = () => {
    fetchGhgEmissionsHistory();
    fetchSocialMetricsHistory();
    fetchGovernanceMetricsHistory();
  };

  const fetchGhgEmissions = async () => {
    try {
      const response = await getGHGEmissionsByCompany();
      setGhgEmissions(response.data);
      
      // Calculate pending counts for each scope
      const pendingByScope = {
        scope1: 0,
        scope2: 0,
        scope3: 0,
        solvent: 0,
        sink: 0
      };
      
      response.data.forEach(emission => {
        if (emission.status === 'PENDING') {
          if (emission.scope === 'SCOPE_1') pendingByScope.scope1++;
          else if (emission.scope === 'SCOPE_2') pendingByScope.scope2++;
          else if (emission.scope === 'SCOPE_3') pendingByScope.scope3++;
          else if (emission.scope === 'SOLVENT') pendingByScope.solvent++;
          else if (emission.scope === 'SINK') pendingByScope.sink++;
        }
      });
      
      setPendingCounts(prevCounts => ({
        ...prevCounts,
        ...pendingByScope
      }));
    } catch (error) {
      console.error('Error fetching GHG emissions:', error);
      setNotification({
        open: true,
        message: 'Error fetching GHG emissions',
        severity: 'error'
      });
    }
  };
  
  const fetchGhgEmissionsHistory = async () => {
    try {
      const response = await getGHGEmissionsHistory();
      // Merge with current emissions to ensure we have all data
      const combinedEmissions = [...ghgEmissions];
      
      // Add history items that aren't already in the emissions list
      response.data.forEach(historyItem => {
        if (!combinedEmissions.some(item => item.id === historyItem.id)) {
          combinedEmissions.push(historyItem);
        }
      });
      
      setGhgEmissions(combinedEmissions);
    } catch (error) {
      console.error('Error fetching GHG emissions history:', error);
      // Don't show notification for history errors to avoid overwhelming the user
    }
  };

  const fetchSocialMetrics = async () => {
    try {
      const response = await getSocialMetricsByCompany();
      console.log('Social metrics API response:', response.data);
      
      // Ensure consistent category/subtype values for each metric
      const processedMetrics = response.data.map(metric => {
        // Make a copy of the metric to avoid mutating the original
        const processedMetric = {...metric};
        
        // If category is missing but subtype is present, set category from subtype
        if (!processedMetric.category && processedMetric.subtype) {
          processedMetric.category = processedMetric.subtype;
          console.log(`Setting missing category from subtype for metric ID ${processedMetric.id}`);
        }
        
        // If subtype is missing but category is present, set subtype from category
        if (!processedMetric.subtype && processedMetric.category) {
          processedMetric.subtype = processedMetric.category;
          console.log(`Setting missing subtype from category for metric ID ${processedMetric.id}`);
        }
        
        return processedMetric;
      });
      
      setSocialMetrics(processedMetrics);
      
      // Calculate pending counts for social metrics
      const pendingBySocialCategory = {
        employee: 0,
        community: 0,
        supplyChain: 0
      };
      
      processedMetrics.forEach(metric => {
        console.log('Processing social metric:', {
          id: metric.id,
          category: metric.category,
          subtype: metric.subtype,
          status: metric.status,
          metric: metric.metric,
          value: metric.value
        });
        
        if (metric.status === 'PENDING') {
          // Check both category and subtype fields
          const category = (metric.category || '').toUpperCase();
          const subtype = (metric.subtype || '').toUpperCase();
          
          if (category === 'EMPLOYEE' || subtype === 'EMPLOYEE') {
            pendingBySocialCategory.employee++;
          } else if (category === 'COMMUNITY' || subtype === 'COMMUNITY') {
            pendingBySocialCategory.community++;
          } else if (category === 'SUPPLY_CHAIN' || subtype === 'SUPPLY_CHAIN') {
            pendingBySocialCategory.supplyChain++;
          }
        }
      });
      
      console.log('Updated pending counts:', pendingBySocialCategory);
      
      setPendingCounts(prevCounts => ({
        ...prevCounts,
        ...pendingBySocialCategory
      }));
    } catch (error) {
      console.error('Error fetching social metrics:', error);
      setNotification({
        open: true,
        message: 'Error fetching social metrics',
        severity: 'error'
      });
    }
  };
  
  const fetchSocialMetricsHistory = async () => {
    try {
      const response = await getSocialMetricsHistory();
      // Merge with current metrics to ensure we have all data
      const combinedMetrics = [...socialMetrics];
      
      // Add history items that aren't already in the metrics list
      response.data.forEach(historyItem => {
        if (!combinedMetrics.some(item => item.id === historyItem.id)) {
          combinedMetrics.push(historyItem);
        }
      });
      
      setSocialMetrics(combinedMetrics);
    } catch (error) {
      console.error('Error fetching social metrics history:', error);
      // Don't show notification for history errors to avoid overwhelming the user
    }
  };
  
  const fetchGovernanceMetrics = async () => {
    try {
      const response = await getGovernanceMetricsByCompany();
      console.log('Governance metrics API response:', response.data);
      
      // Ensure consistent category/subtype values for each metric
      const processedMetrics = response.data.map(metric => {
        // Make a copy of the metric to avoid mutating the original
        const processedMetric = {...metric};
        
        // If category is missing but subtype is present, set category from subtype
        if (!processedMetric.category && processedMetric.subtype) {
          processedMetric.category = processedMetric.subtype;
          console.log(`Setting missing category from subtype for metric ID ${processedMetric.id}`);
        }
        
        // If subtype is missing but category is present, set subtype from category
        if (!processedMetric.subtype && processedMetric.category) {
          processedMetric.subtype = processedMetric.category;
          console.log(`Setting missing subtype from category for metric ID ${processedMetric.id}`);
        }
        
        return processedMetric;
      });
      
      setGovernanceMetrics(processedMetrics);
      
      // Calculate pending counts for governance metrics
      const pendingByGovernanceCategory = {
        corporate: 0,
        ethics: 0,
        risk: 0
      };
      
      processedMetrics.forEach(metric => {
        console.log('Processing governance metric:', {
          id: metric.id,
          category: metric.category,
          subtype: metric.subtype,
          status: metric.status,
          metric: metric.metric,
          value: metric.value
        });
        
        if (metric.status === 'PENDING') {
          // Check both category and subtype fields
          const category = (metric.category || '').toUpperCase();
          const subtype = (metric.subtype || '').toUpperCase();
          
          if (category === 'CORPORATE' || subtype === 'CORPORATE') {
            pendingByGovernanceCategory.corporate++;
          } else if (category === 'ETHICS' || subtype === 'ETHICS') {
            pendingByGovernanceCategory.ethics++;
          } else if (category === 'RISK' || subtype === 'RISK') {
            pendingByGovernanceCategory.risk++;
          }
        }
      });
      
      setPendingCounts(prevCounts => ({
        ...prevCounts,
        ...pendingByGovernanceCategory
      }));
    } catch (error) {
      console.error('Error fetching governance metrics:', error);
      setNotification({
        open: true,
        message: 'Error fetching governance metrics',
        severity: 'error'
      });
    }
  };
  
  const fetchGovernanceMetricsHistory = async () => {
    try {
      const response = await getGovernanceMetricsHistory();
      // Merge with current metrics to ensure we have all data
      const combinedMetrics = [...governanceMetrics];
      
      // Add history items that aren't already in the metrics list
      response.data.forEach(historyItem => {
        if (!combinedMetrics.some(item => item.id === historyItem.id)) {
          combinedMetrics.push(historyItem);
        }
      });
      
      setGovernanceMetrics(combinedMetrics);
    } catch (error) {
      console.error('Error fetching governance metrics history:', error);
      // Don't show notification for history errors to avoid overwhelming the user
    }
  };

  // Filtering and sorting state
  const [filter] = useState({ scope: '', category: '', status: 'PENDING', date: '' });
  const [sort] = useState({ field: '', direction: 'asc' });

  useEffect(() => {
    let filtered = [...ghgEmissions];

    // Apply scope filter based on selected tab
    if (selectedReviewTab === 0) {
      filtered = filtered.filter(e => e.scope === 'SCOPE_1');
    } else if (selectedReviewTab === 1) {
      filtered = filtered.filter(e => e.scope === 'SCOPE_2');
    } else if (selectedReviewTab === 2) {
      filtered = filtered.filter(e => e.scope === 'SCOPE_3');
    } else if (selectedReviewTab === 3) {
      filtered = filtered.filter(e => e.scope === 'SOLVENT');
    } else if (selectedReviewTab === 4) {
      filtered = filtered.filter(e => e.scope === 'SINK');
    }
    
    // Apply other filters
    if (filter.scope) filtered = filtered.filter(e => e.scope === filter.scope);
    if (filter.category) filtered = filtered.filter(e => e.category === filter.category);
    if (filter.status) filtered = filtered.filter(e => (e.status || '').toLowerCase() === filter.status.toLowerCase());
    if (filter.date) filtered = filtered.filter(e => e.startDate && new Date(e.startDate).toLocaleDateString() === filter.date);
    
    // Apply sorting
    if (sort.field) {
      filtered.sort((a, b) => {
        if (!a[sort.field] || !b[sort.field]) return 0;
        if (sort.direction === 'asc') return a[sort.field] > b[sort.field] ? 1 : -1;
        else return a[sort.field] < b[sort.field] ? 1 : -1;
      });
    }
    
    // Pass filtered data directly to the table component instead of using state
  }, [ghgEmissions, filter, sort, selectedReviewTab]);

  // State for filtered emissions is handled in the useEffect above

  const handleApproveSubmission = async (id, type) => {
    try {
      if (type === 'environment') {
        await updateGHGEmissionStatus(id, 'APPROVED');
        fetchGhgEmissions(); // Refresh data after update
      } else if (type === 'social') {
        await updateSocialMetricStatus(id, 'APPROVED');
        fetchSocialMetrics(); // Refresh data after update
      } else if (type === 'governance') {
        await updateGovernanceMetricStatus(id, 'APPROVED');
        fetchGovernanceMetrics(); // Refresh data after update
      }
      
      setNotification({
        open: true,
        message: 'Submission approved successfully',
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

  const handleDenySubmission = async (id, type) => {
    try {
      if (type === 'environment') {
        await updateGHGEmissionStatus(id, 'DENIED');
        fetchGhgEmissions(); // Refresh data after update
      } else if (type === 'social') {
        await updateSocialMetricStatus(id, 'DENIED');
        fetchSocialMetrics(); // Refresh data after update
      } else if (type === 'governance') {
        await updateGovernanceMetricStatus(id, 'DENIED');
        fetchGovernanceMetrics(); // Refresh data after update
      }
      
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

  // Handler for main tab change
  const handleMainTabChange = (event, newValue) => {
    setMainTab(newValue);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Handler for viewing submission details
  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailsDialogOpen(true);
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      width: '100%'
    }}>
      {/* Main Category Tabs */}
      <Box sx={{ 
        width: '100%', 
        mb: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Tabs
          value={mainTab}
          onChange={handleMainTabChange}
          variant="fullWidth"
          scrollButtons={false}
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-2px)'
              },
              '&.Mui-selected': {
                color: mainTab === 0 ? '#4CAF50' : 
                       mainTab === 1 ? '#2196F3' : 
                       mainTab === 2 ? '#FFEB3B' : '#0A3D0A'
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: mainTab === 0 ? '#4CAF50' : 
                              mainTab === 1 ? '#2196F3' : 
                              mainTab === 2 ? '#FFEB3B' : '#0A3D0A',
              height: '3px',
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            label="Environment"
            icon={<Assessment sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
          <Tab 
            label="Social"
            icon={<BusinessCenter sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
          <Tab 
            label="Governance"
            icon={<AccountBalance sx={{ fontSize: 20 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        width: '100%',
        p: 3,
        transition: 'all 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'
      }}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2,
          minHeight: 'calc(100vh - 48px)',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Content Based on Selected Tab */}
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {mainTab === 0 && (
              <ManagerDashboardTable
                ghgEmissions={ghgEmissions}
                selectedReviewTab={selectedReviewTab}
                handleTabChange={(e, newValue) => setSelectedReviewTab(newValue)}
                pendingCounts={pendingCounts}
                handleViewDetails={handleViewDetails}
                handleApproveSubmission={(id) => handleApproveSubmission(id, 'environment')}
                handleDenySubmission={(id) => handleDenySubmission(id, 'environment')}
                type="environment"
              />
            )}
            {mainTab === 1 && (
              <ManagerDashboardTable
                socialMetrics={socialMetrics}
                selectedReviewTab={selectedSocialTab}
                handleTabChange={(e, newValue) => setSelectedSocialTab(newValue)}
                pendingCounts={pendingCounts}
                handleViewDetails={handleViewDetails}
                handleApproveSubmission={(id) => handleApproveSubmission(id, 'social')}
                handleDenySubmission={(id) => handleDenySubmission(id, 'social')}
                type="social"
              />
            )}
            {mainTab === 2 && (
              <ManagerDashboardTable
                governanceMetrics={governanceMetrics}
                selectedReviewTab={selectedGovernanceTab}
                handleTabChange={(e, newValue) => setSelectedGovernanceTab(newValue)}
                pendingCounts={pendingCounts}
                handleViewDetails={handleViewDetails}
                handleApproveSubmission={(id) => handleApproveSubmission(id, 'governance')}
                handleDenySubmission={(id) => handleDenySubmission(id, 'governance')}
                type="governance"
              />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogs and Notifications */}
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
    </Box>
  );
};

export default ManagerDashboard;