import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { esgFormConfig } from '../config/esgFormConfig';

const ESGDataForm = ({ onSubmit, initialData = {}, company }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    company_name: company?.name || '',
  });
  const [errors, setErrors] = useState({});
  const [selectedIndustry, setSelectedIndustry] = useState(initialData.industry_type || '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Handle industry change
    if (name === 'industry_type') {
      setSelectedIndustry(value);
    }
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = esgFormConfig.fields.filter(field => field.required);
    
    requiredFields.forEach(field => {
      if (!formData[field.name]) {
        newErrors[field.name] = field.label + ' is required';
      }
    });

    // Validate number fields
    Object.entries(formData).forEach(([key, value]) => {
      const field = esgFormConfig.fields.find(f => f.name === key);
      if (field && field.type === 'number' && value !== '') {
        const numValue = Number(value);
        if (field.min !== undefined && numValue < field.min) {
          newErrors[key] = \`\${field.label} must be at least \${field.min}\`;
        }
        if (field.max !== undefined && numValue > field.max) {
          newErrors[key] = \`\${field.label} must be at most \${field.max}\`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to submit form. Please try again.'
        }));
      }
    }
  };

  const renderField = (field) => {
    const { type, label, name, required, unit, options, text, acceptedFormats } = field;

    switch (type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={label}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            required={required}
            error={!!errors[name]}
            helperText={errors[name]}
            disabled={name === 'company_name'} // Disable company name field
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={label}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            required={required}
            error={!!errors[name]}
            helperText={errors[name]}
            InputProps={unit ? {
              endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
            } : undefined}
          />
        );

      case 'date_range':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={formData[field.startName] || null}
                  onChange={(date) => handleDateChange(field.startName, date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: required,
                      error: !!errors[field.startName],
                      helperText: errors[field.startName]
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Date"
                  value={formData[field.endName] || null}
                  onChange={(date) => handleDateChange(field.endName, date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: required,
                      error: !!errors[field.endName],
                      helperText: errors[field.endName]
                    }
                  }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        );

      case 'dropdown':
        return (
          <FormControl fullWidth required={required} error={!!errors[name]}>
            <InputLabel>{label}</InputLabel>
            <Select
              name={name}
              value={formData[name] || ''}
              onChange={handleChange}
              label={label}
            >
              {options.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {errors[name] && (
              <Typography color="error" variant="caption">
                {errors[name]}
              </Typography>
            )}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={label}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            required={required}
            error={!!errors[name]}
            helperText={errors[name]}
          />
        );

      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                name={name}
                checked={!!formData[name]}
                onChange={handleChange}
                required={required}
              />
            }
            label={text}
          />
        );

      case 'file_upload':
        return (
          <TextField
            fullWidth
            type="file"
            label={label}
            name={name}
            onChange={handleFileChange}
            required={required}
            error={!!errors[name]}
            helperText={errors[name]}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              accept: acceptedFormats.join(',')
            }}
          />
        );

      default:
        return null;
    }
  };

  // Get conditional fields based on selected industry
  const getConditionalFields = () => {
    if (!selectedIndustry) return [];
    const section = esgFormConfig.conditional_sections.find(
      s => s.industry === selectedIndustry
    );
    return section ? section.fields : [];
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        {esgFormConfig.form_title}
      </Typography>
      
      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {esgFormConfig.fields.map((field, index) => (
            <Grid item xs={12} md={field.type === 'date_range' ? 12 : 6} key={index}>
              {renderField(field)}
            </Grid>
          ))}

          {/* Render conditional fields based on industry */}
          {selectedIndustry && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedIndustry}-Specific Information
                </Typography>
              </Grid>
              {getConditionalFields().map((field, index) => (
                <Grid item xs={12} md={6} key={'conditional-' + index}>
                  {renderField(field)}
                </Grid>
              ))}
            </>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Submit ESG Data
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ESGDataForm;
