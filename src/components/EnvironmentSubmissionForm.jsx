import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import GHGEmissionForm from './GHGEmissionForm';
import CSVUploader from './CSVUploader';

const GREEN = '#0A3D0A';
// Removed unused variable LIGHT_GREEN

function a11yProps(index) {
  return {
    id: `env-tab-${index}`,
    'aria-controls': `env-tabpanel-${index}`,
  };
}

const EnvironmentSubmissionForm = ({ companyId, onSuccess, onError }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: '#f8f9fa',
          mb: 3
        }}
      >
        <Typography variant="h6" sx={{ color: GREEN, fontWeight: 'bold', mb: 2 }}>
          Environmental Performance Metrics
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            mb: 3, 
            width: '100%',
            '& .MuiTabs-indicator': { backgroundColor: GREEN },
            '& .Mui-selected': { color: GREEN, fontWeight: 'bold' },
            '& .MuiTabs-scrollButtons': {
              color: GREEN,
              '&.Mui-disabled': { opacity: 0.3 }
            }
          }}
        >
          <Tab label="Manual Entry" sx={{ textTransform: 'none' }} {...a11yProps(0)} />
          <Tab label="CSV Upload" sx={{ textTransform: 'none' }} {...a11yProps(1)} />
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />
        
        {activeTab === 0 && (
          <GHGEmissionForm
            companyId={companyId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
        
        {activeTab === 1 && (
          <CSVUploader
            companyId={companyId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
      </Paper>
    </Box>
  );
};

export default EnvironmentSubmissionForm;
