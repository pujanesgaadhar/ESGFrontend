import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';

const AddCompanyDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async () => {
    console.log('Attempting to submit company:', formData);
    
    if (!formData.name.trim()) {
      console.log('Validation failed: Company name is empty');
      setError('Company name is required');
      return;
    }

    try {
      console.log('Submitting company data to parent component...');
      await onSubmit(formData);
      console.log('Company submitted successfully');
      
      // Only reset form if submission was successful
      setFormData({
        name: '',
        status: 'active',
      });
      setError('');
    } catch (err) {
      console.error('Error in AddCompanyDialog:', err);
      setError(typeof err === 'string' ? err : 'Failed to add company. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Company</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Company Name"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!formData.name.trim()}
        >
          Add Company
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCompanyDialog;
