import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { getMetricCategories } from '../services/api';

/**
 * A reusable component for selecting metric categories
 * @param {string} type - The type of metric (environment, social, governance)
 * @param {string} value - The currently selected category value
 * @param {function} onChange - Function to call when selection changes
 * @param {string} label - Label for the select input
 * @param {boolean} required - Whether the field is required
 */
const MetricCategorySelector = ({ 
  type, 
  value, 
  onChange, 
  label = "Category", 
  required = false 
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getMetricCategories(type);
        setCategories(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type]);

  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} sx={{ color: '#0A3D0A' }} />
        <Typography variant="body2">Loading categories...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <FormControl fullWidth required={required}>
      <InputLabel id={`${type}-category-label`}>{label}</InputLabel>
      <Select
        labelId={`${type}-category-label`}
        id={`${type}-category-select`}
        value={value || ''}
        label={label}
        onChange={handleChange}
        sx={{
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0A3D0A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0A3D0A',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#0A3D0A',
          },
        }}
      >
        {categories.map((category) => (
          <MenuItem key={category.categoryCode} value={category.categoryCode}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MetricCategorySelector;
