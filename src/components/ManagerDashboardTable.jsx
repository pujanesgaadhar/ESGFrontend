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
    <Paper elevation={3} sx={{ 
      p: { xs: 2, sm: 3 }, 
      mb: { xs: 3, sm: 4 }, 
      width: '100%',
      maxWidth: { xs: '100%', sm: '100%', md: '1200px' },
      mx: 'auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: { xs: 1, sm: 2 },
      overflow: 'hidden' // Prevent content overflow on small screens
    }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: { xs: 2, sm: 3 }, 
          color: '#0A3D0A', 
          fontWeight: 'bold',
          fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.5rem' }
        }}
      >
        Pending {type.charAt(0).toUpperCase() + type.slice(1)} Submissions
      </Typography>
      
      <Tabs 
        value={selectedReviewTab} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ 
          mb: { xs: 2, sm: 3 },
          '& .MuiTab-root': { 
            fontWeight: 'bold',
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
            minWidth: { xs: 'auto', sm: 80 },
            p: { xs: '6px 8px', sm: '6px 16px' },
            whiteSpace: { xs: 'normal', sm: 'nowrap' }
          },
          '& .Mui-selected': { color: '#0A3D0A' },
          '& .MuiTabs-indicator': { backgroundColor: '#0A3D0A' },
          '& .MuiTabs-scrollButtons': {
            color: '#0A3D0A',
            '&.Mui-disabled': { opacity: 0.3 }
          }
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
      
      <Box sx={{ 
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#9DC183',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#0A3D0A',
        },
      }}>
        <Table size="small" sx={{
          minWidth: { xs: 650, sm: 800, md: 1000 },
          '& .MuiTableCell-root': {
            p: { xs: '8px 6px', sm: '16px 8px', md: '16px' },
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
          }
        }}>
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
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 0.5, sm: 1 },
                        '& .MuiButton-root': {
                          minWidth: { xs: '60px', sm: 'auto' },
                          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                          whiteSpace: 'nowrap',
                          textTransform: 'none',
                          fontWeight: 'medium'
                        }
                      }}>
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
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 0.5, sm: 1 },
                            mt: { xs: 0.5, sm: 0 }
                          }}>
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
                          </Box>
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
                  <Box sx={{ 
                    py: { xs: 3, sm: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#666',
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      No pending submissions found for this {type === 'environment' ? 'scope' : 'category'}.
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#888',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}
                    >
                      New submissions will appear here when representatives submit data.
                    </Typography>
                  </Box>
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
