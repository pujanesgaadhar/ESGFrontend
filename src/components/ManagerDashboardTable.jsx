import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  Tabs,
  Tab
} from '@mui/material';

const ManagerDashboardTable = ({ 
  ghgEmissions = [], 
  socialMetrics = [], 
  governanceMetrics = [], 
  selectedReviewTab, 
  handleTabChange, 
  pendingCounts, 
  handleViewDetails, 
  handleApproveSubmission, 
  handleDenySubmission,
  type = 'environment' // Default to environment
}) => {
  // State to track highlighted submission from notification
  const [highlightedSubmissionId, setHighlightedSubmissionId] = React.useState(null);
  
  // Check localStorage for highlighted submission ID when component mounts
  React.useEffect(() => {
    const submissionId = localStorage.getItem('highlightSubmissionId');
    if (submissionId) {
      setHighlightedSubmissionId(submissionId);
      // Clear the localStorage item after retrieving it
      localStorage.removeItem('highlightSubmissionId');
    }
  }, []);
  
  // Function to get filtered data based on selected tab and type
  const getFilteredData = () => {
    if (type === 'environment') {
      // If All Submissions tab is selected (index 5)
      if (selectedReviewTab === 5) {
        // For All Submissions tab, return all emissions regardless of status
        return ghgEmissions;
      }
      
      const scopeMap = {
        0: 'SCOPE_1',
        1: 'SCOPE_2',
        2: 'SCOPE_3',
        3: 'SOLVENT',
        4: 'SINK'
      };
      
      // For specific scope tabs, only show PENDING submissions
      return ghgEmissions.filter(emission => {
        // Ensure scope is properly matched (case-insensitive)
        const emissionScope = emission.scope?.toUpperCase() || '';
        const targetScope = scopeMap[selectedReviewTab];
        
        return emissionScope === targetScope && emission.status === 'PENDING';
      });
    } 
    else if (type === 'social') {
      // If All Submissions tab is selected (index 3)
      if (selectedReviewTab === 3) {
        // For All Submissions tab, return all social metrics regardless of status
        return socialMetrics;
      }
      
      const categoryMap = {
        0: 'EMPLOYEE',
        1: 'COMMUNITY',
        2: 'SUPPLY_CHAIN'
      };
      
      // For specific category tabs, only show PENDING submissions
      return socialMetrics.filter(metric => {
        // Ensure category is properly matched (case-insensitive)
        const metricCategory = (metric.category || '').toUpperCase();
        const metricSubtype = (metric.subtype || '').toUpperCase();
        const targetCategory = categoryMap[selectedReviewTab];
        
        console.log('Filtering social metric:', { 
          id: metric.id,
          category: metricCategory, 
          subtype: metricSubtype, 
          targetCategory, 
          status: metric.status
        });
        
        // First try to match by category
        if (metricCategory === targetCategory && metric.status === 'PENDING') {
          return true;
        }
        
        // If category doesn't match, try to match by subtype
        if (metricSubtype === targetCategory && metric.status === 'PENDING') {
          return true;
        }
        
        // If neither matches, exclude this metric
        return false;
      });
    }
    else if (type === 'governance') {
      // If All Submissions tab is selected (index 3)
      if (selectedReviewTab === 3) {
        // For All Submissions tab, return all governance metrics regardless of status
        return governanceMetrics;
      }
      
      const categoryMap = {
        0: 'CORPORATE',
        1: 'ETHICS',
        2: 'RISK'
      };
      
      // For specific category tabs, only show PENDING submissions
      return governanceMetrics.filter(metric => {
        // Ensure category is properly matched (case-insensitive)
        const metricCategory = (metric.category || '').toUpperCase();
        const metricSubtype = (metric.subtype || '').toUpperCase();
        const targetCategory = categoryMap[selectedReviewTab];
        
        console.log('Filtering governance metric:', { 
          id: metric.id,
          category: metricCategory, 
          subtype: metricSubtype, 
          targetCategory, 
          status: metric.status
        });
        
        // First try to match by category
        if (metricCategory === targetCategory && metric.status === 'PENDING') {
          return true;
        }
        
        // If category doesn't match, try to match by subtype
        if (metricSubtype === targetCategory && metric.status === 'PENDING') {
          return true;
        }
        
        // If neither matches, exclude this metric
        return false;
      });
    }
    
    return [];
  };
  
  // Get tab labels and counts based on type
  const getTabsConfig = () => {
    if (type === 'environment') {
      return [
        { label: 'Scope 1', count: pendingCounts.scope1 },
        { label: 'Scope 2', count: pendingCounts.scope2 },
        { label: 'Scope 3', count: pendingCounts.scope3 },
        { label: 'Solvent', count: pendingCounts.solvent },
        { label: 'Sink', count: pendingCounts.sink },
        { label: 'All Submissions', count: 0 }
      ];
    } 
    else if (type === 'social') {
      return [
        { label: 'Employee Metrics', count: pendingCounts.employee },
        { label: 'Community Engagement', count: pendingCounts.community },
        { label: 'Supply Chain', count: pendingCounts.supplyChain },
        { label: 'All Submissions', count: 0 }
      ];
    }
    else if (type === 'governance') {
      return [
        { label: 'Corporate Governance', count: pendingCounts.corporate },
        { label: 'Ethics & Compliance', count: pendingCounts.ethics },
        { label: 'Risk Management', count: pendingCounts.risk },
        { label: 'All Submissions', count: 0 }
      ];
    }
    
    return [];
  };
  
  const tabsConfig = getTabsConfig();
  const filteredData = getFilteredData();

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#0A3D0A', fontWeight: 'bold' }}>
        Pending {type.charAt(0).toUpperCase() + type.slice(1)} Submissions
      </Typography>
      
      <Tabs 
        value={selectedReviewTab} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3,
          '& .MuiTab-root': { fontWeight: 'bold' },
          '& .Mui-selected': { color: '#0A3D0A' },
          '& .MuiTabs-indicator': { backgroundColor: '#0A3D0A' }
        }}
      >
        {tabsConfig.map((tab, index) => (
          <Tab 
            key={index}
            label={<Box sx={{ display: 'flex', alignItems: 'center' }}>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Box sx={{ 
                  ml: 1, 
                  bgcolor: '#0A3D0A', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: 20, 
                  height: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.75rem'
                }}>
                  {tab.count}
                </Box>
              )}
            </Box>} 
          />
        ))}
      </Tabs>
      
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Date</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Submitted By</TableCell>
              {type === 'environment' && (
                <>
                  <TableCell>Scope</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity (tCO₂e)</TableCell>
                </>
              )}
              {type === 'social' && (
                <>
                  <TableCell>Category</TableCell>
                  <TableCell>Metric</TableCell>
                  <TableCell>Value</TableCell>
                </>
              )}
              {type === 'governance' && (
                <>
                  <TableCell>Category</TableCell>
                  <TableCell>Metric</TableCell>
                  <TableCell>Value</TableCell>
                </>
              )}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isHighlighted = item.id.toString() === highlightedSubmissionId;
                return (
                  <TableRow 
                    key={item.id}
                    sx={{
                      backgroundColor: isHighlighted ? '#e6f7e6' : 'inherit',
                      '&:hover': { backgroundColor: '#f0f7f0' }
                    }}
                  >
                    <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{item.company?.name || 'N/A'}</TableCell>
                    <TableCell>{item.submittedBy?.name || 'N/A'}</TableCell>
                    
                    {type === 'environment' && (
                      <>
                        <TableCell>
                          <Chip 
                            label={item.scope.replace('_', ' ')} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#9DC183', 
                              color: '#0A3D0A',
                              fontWeight: 'bold'
                            }} 
                          />
                        </TableCell>
                        <TableCell>{item.category.replace('_', ' ')}</TableCell>
                        <TableCell>{item.quantity.toLocaleString()}</TableCell>
                      </>
                    )}
                    
                    {type === 'social' && (
                      <>
                        <TableCell>
                          <Chip 
                            label={item.category.replace('_', ' ')} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#9DC183', 
                              color: '#0A3D0A',
                              fontWeight: 'bold'
                            }} 
                          />
                        </TableCell>
                        <TableCell>{item.metricName}</TableCell>
                        <TableCell>{item.value}</TableCell>
                      </>
                    )}
                    
                    {type === 'governance' && (
                      <>
                        <TableCell>
                          <Chip 
                            label={item.category.replace('_', ' ')} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#9DC183', 
                              color: '#0A3D0A',
                              fontWeight: 'bold'
                            }} 
                          />
                        </TableCell>
                        <TableCell>{item.metricName}</TableCell>
                        <TableCell>{item.value}</TableCell>
                      </>
                    )}
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleViewDetails(item)}
                          sx={{ 
                            borderColor: '#0A3D0A', 
                            color: '#0A3D0A',
                            '&:hover': { borderColor: '#0A3D0A', backgroundColor: '#f0f7f0' }
                          }}
                        >
                          View
                        </Button>
                        {item.status === 'PENDING' && (
                          <>
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleApproveSubmission(item.id)}
                              sx={{ 
                                backgroundColor: '#0A3D0A', 
                                '&:hover': { backgroundColor: '#0A5D0A' }
                              }}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleDenySubmission(item.id)}
                              sx={{ 
                                borderColor: '#d32f2f', 
                                color: '#d32f2f',
                                '&:hover': { borderColor: '#d32f2f', backgroundColor: '#ffeaea' }
                              }}
                            >
                              Deny
                            </Button>
                          </>
                        )}
                        {item.status !== 'PENDING' && (
                          <Chip 
                            label={item.status} 
                            size="small" 
                            sx={{ 
                              backgroundColor: item.status === 'APPROVED' ? '#e6f7e6' : '#ffeaea',
                              color: item.status === 'APPROVED' ? '#0A3D0A' : '#d32f2f',
                              fontWeight: 'bold'
                            }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No pending submissions found for this {type === 'environment' ? 'scope' : 'category'}.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default ManagerDashboardTable;
