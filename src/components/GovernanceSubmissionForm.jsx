import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  // Removed unused imports
  // MenuItem,
  // InputLabel,
  // FormControl,
  // Select,
  Divider,
  // Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { submitGovernanceData } from '../services/api';
import MetricCategorySelector from './MetricCategorySelector';
import { useAuth } from '../context/AuthContext';

const GREEN = '#0A3D0A';
// Removed unused variable LIGHT_GREEN

const GovernanceSubmissionForm = ({ onSuccess, onError }) => {
  // Using useAuth hook without destructuring
  useAuth();
  // Removed unused activeTab state
  // const [activeTab, setActiveTab] = useState('corporate');
  const [selectedCategory, setSelectedCategory] = useState('CORPORATE');
  
  // Form states
  const [formData, setFormData] = useState({
    category: '',
    metric: '',
    value: '',
    unit: '',
    startDate: null,
    endDate: null,
    description: '',
    policyExists: false,
    policyUrl: '',
    reviewFrequency: '',
    responsibleParty: '',
    documentationUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  // Removed unused handleTabChange function
  // Added comment to explain the removal
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
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
      // Convert value to number if it's numeric
      let numericValue = parseFloat(formData.value);
      if (isNaN(numericValue) && formData.value !== '') {
        throw new Error('Value must be a valid number');
      } else if (isNaN(numericValue) && formData.value === '') {
        numericValue = 0; // Default to 0 if empty
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
      
      console.log('Submitting governance data with category:', selectedCategory);
      
      // Submit data to API
      const response = await submitGovernanceData(submissionData);
      
      // Reset form
      setFormData({
        category: '',
        metric: '',
        value: '',
        unit: '',
        startDate: null,
        endDate: null,
        description: '',
        policyExists: false,
        policyUrl: '',
        reviewFrequency: '',
        responsibleParty: '',
        documentationUrl: ''
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error submitting governance data:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
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
          Governance Performance Metrics
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MetricCategorySelector 
                type="governance" 
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
                placeholder="e.g., %, count, ratio"
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
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.policyExists}
                    onChange={handleChange}
                    name="policyExists"
                    color="primary"
                    sx={{
                      color: GREEN,
                      '&.Mui-checked': {
                        color: GREEN,
                      },
                    }}
                  />
                }
                label="Formal policy exists for this area"
              />
            </Grid>
            
            {formData.policyExists && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="policyUrl"
                  name="policyUrl"
                  label="Policy URL/Reference"
                  value={formData.policyUrl}
                  onChange={handleChange}
                  placeholder="Link to or reference for the policy document"
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="reviewFrequency"
                name="reviewFrequency"
                label="Review Frequency"
                value={formData.reviewFrequency}
                onChange={handleChange}
                placeholder="e.g., Annual, Quarterly, Monthly"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="responsibleParty"
                name="responsibleParty"
                label="Responsible Party"
                value={formData.responsibleParty}
                onChange={handleChange}
                placeholder="e.g., Board, Audit Committee, Compliance Officer"
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
                {loading ? 'Submitting...' : 'Submit Governance Data'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default GovernanceSubmissionForm;
