import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

const AddUserDialog = ({ open, onClose, companies = [], onAddUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    company_id: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Create a copy of the form data
    const userData = { ...formData };
    
    // Submit the data
    onAddUser(userData).then(() => {
      // Only reset form after successful submission
      setFormData({
        name: '',
        email: '',
        password: '',
        role: '',
        company_id: '',
      });
    }).catch((error) => {
      // Log error but don't reset form on failure
      console.error('Error submitting user:', error);
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          name="name"
          label="Full Name"
          type="text"
          required
          fullWidth
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email Address"
          type="email"
          required
          fullWidth
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="password"
          label="Password"
          type="password"
          required
          fullWidth
          value={formData.password}
          onChange={handleChange}
        />
        <FormControl fullWidth margin="dense" required>
          <InputLabel>Role *</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            label="Role"
          >
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="representative">Representative</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Company</InputLabel>
          <Select
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            label="Company"
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserDialog;
