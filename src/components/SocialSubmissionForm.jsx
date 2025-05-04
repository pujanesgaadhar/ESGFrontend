import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Divider,
  Chip
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { submitSocialData } from '../services/api';
import MetricCategorySelector from './MetricCategorySelector';
import { useAuth } from '../context/AuthContext';

const GREEN = '#0A3D0A';
const LIGHT_GREEN = '#9DC183';

// Social categories
const employeeCategories = [
  { label: 'Diversity & Inclusion', value: 'DIVERSITY_INCLUSION' },
  { label: 'Employee Wellbeing', value: 'EMPLOYEE_WELLBEING' },
  { label: 'Training & Development', value: 'TRAINING_DEVELOPMENT' },
  { label: 'Health & Safety', value: 'HEALTH_SAFETY' }
];

const communityCategories = [
  { label: 'Community Investment', value: 'COMMUNITY_INVESTMENT' },
  { label: 'Volunteering Programs', value: 'VOLUNTEERING' },
  { label: 'Social Impact Projects', value: 'SOCIAL_IMPACT' },
  { label: 'Philanthropy', value: 'PHILANTHROPY' }
];

const supplyChainCategories = [
  { label: 'Supplier Diversity', value: 'SUPPLIER_DIVERSITY' },
  { label: 'Fair Labor Practices', value: 'FAIR_LABOR' },
  { label: 'Human Rights', value: 'HUMAN_RIGHTS' },
  { label: 'Local Sourcing', value: 'LOCAL_SOURCING' }
];

const SocialSubmissionForm = ({ onSuccess, onError }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('employee');
  const [selectedCategory, setSelectedCategory] = useState('EMPLOYEE');
  
  // Form states
  const [formData, setFormData] = useState({
    // Employee metrics
    category: '',
    metric: '',
    value: '',
    unit: '',
    startDate: null,
    endDate: null,
    description: '',
    location: '',
    department: '',
    documentationUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update selected category based on tab
    setSelectedCategory(newValue.toUpperCase());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert value to number
      const numericValue = parseFloat(formData.value);
      if (isNaN(numericValue)) {
        throw new Error('Value must be a valid number');
      }
      
      // Prepare submission data
      const submissionData = {
        ...formData,
        value: numericValue,
        subtype: selectedCategory,
        // Make sure category is explicitly set to match the selected category
        category: selectedCategory,
        // Don't send companyId or submittedBy - the backend will handle this
        status: 'PENDING'
      };
      
      console.log('Submitting social data with category:', selectedCategory);
      
      // Submit data to API
      const response = await submitSocialData(submissionData);
      
      // Reset form
      setFormData({
        category: '',
        metric: '',
        value: '',
        unit: '',
        startDate: null,
        endDate: null,
        description: '',
        location: '',
        department: '',
        documentationUrl: ''
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error submitting social data:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get the appropriate categories based on active tab
  const getCategories = () => {
    switch (activeTab) {
      case 'employee':
        return employeeCategories;
      case 'community':
        return communityCategories;
      case 'supplyChain':
        return supplyChainCategories;
      default:
        return [];
    }
  };

  // Get the appropriate title based on active tab
  const getTabTitle = () => {
    switch (activeTab) {
      case 'employee':
        return 'Employee Metrics';
      case 'community':
        return 'Community Engagement';
      case 'supplyChain':
        return 'Supply Chain Responsibility';
      default:
        return '';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
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
          Social Performance Metrics
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Chip
            label="Employee Metrics"
            onClick={() => handleTabChange('employee')}
            sx={{
              mr: 1,
              backgroundColor: activeTab === 'employee' ? LIGHT_GREEN : '#e0e0e0',
              color: activeTab === 'employee' ? GREEN : 'text.primary',
              fontWeight: activeTab === 'employee' ? 'bold' : 'normal',
              '&:hover': {
                backgroundColor: activeTab === 'employee' ? LIGHT_GREEN : '#e0e0e0',
              }
            }}
          />
          <Chip
            label="Community Engagement"
            onClick={() => handleTabChange('community')}
            sx={{
              mr: 1,
              backgroundColor: activeTab === 'community' ? LIGHT_GREEN : '#e0e0e0',
              color: activeTab === 'community' ? GREEN : 'text.primary',
              fontWeight: activeTab === 'community' ? 'bold' : 'normal',
              '&:hover': {
                backgroundColor: activeTab === 'community' ? LIGHT_GREEN : '#e0e0e0',
              }
            }}
          />
          <Chip
            label="Supply Chain"
            onClick={() => handleTabChange('supplyChain')}
            sx={{
              backgroundColor: activeTab === 'supplyChain' ? LIGHT_GREEN : '#e0e0e0',
              color: activeTab === 'supplyChain' ? GREEN : 'text.primary',
              fontWeight: activeTab === 'supplyChain' ? 'bold' : 'normal',
              '&:hover': {
                backgroundColor: activeTab === 'supplyChain' ? LIGHT_GREEN : '#e0e0e0',
              }
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" sx={{ color: GREEN, fontWeight: 'medium', mb: 2 }}>
          {getTabTitle()}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MetricCategorySelector 
                type="social" 
                value={selectedCategory}
                onChange={setSelectedCategory}
                label="Category"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Metric"
                name="metric"
                value={formData.metric}
                onChange={handleChange}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#0A3D0A',
                    },
                    '&:hover fieldset': {
                      borderColor: '#0A3D0A',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0A3D0A',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="value"
                name="value"
                label="Value"
                type="number"
                value={formData.value}
                onChange={handleChange}
                inputProps={{ step: "any" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="unit"
                name="unit"
                label="Unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g., %, hours, people"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => handleDateChange('endDate', date)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  minDate={formData.startDate || undefined}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Headquarters, Factory Site"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="department"
                name="department"
                label="Department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., HR, Operations, CSR"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Provide context or additional information about this metric"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="documentationUrl"
                name="documentationUrl"
                label="Documentation URL"
                value={formData.documentationUrl}
                onChange={handleChange}
                placeholder="Link to supporting documentation (optional)"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: GREEN,
                  '&:hover': {
                    backgroundColor: '#072A07',
                  },
                  mt: 2
                }}
              >
                {loading ? 'Submitting...' : 'Submit Social Data'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SocialSubmissionForm;
