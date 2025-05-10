import React, { useState, useEffect } from 'react';
import {
  Box,
  // Container, // Removed unused import
  // Grid, // Removed unused import
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Business, Group } from '@mui/icons-material';

import DeleteIcon from '@mui/icons-material/Delete';
import AddUserDialog from '../components/AddUserDialog';
import AddCompanyDialog from '../components/AddCompanyDialog';
import { getCompanies, addCompany, deleteCompany, getUsers, addUser, deleteUser } from '../services/api';

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addCompanyDialogOpen, setAddCompanyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchCompanies = async () => {
    try {
      const response = await getCompanies();
      if (response?.data) {
        setCompanies(response.data);
        setError('');
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanies([]); // Set empty array to avoid undefined errors
      // Only show error if it's a real API failure, not just empty data
      if (err.response?.status !== 404 && err.response?.status !== 204) {
        setError('Failed to fetch companies. Please try again later.');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      if (response?.data) {
        setUsers(response.data);
        setError('');
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]); // Set empty array to avoid undefined errors
      // Only show error if it's a real API failure, not just empty data
      if (err.response?.status !== 404 && err.response?.status !== 204) {
        setError('Failed to fetch users. Please try again later.');
      }
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchUsers();
  }, []);

  const handleAddCompany = async (companyData) => {
    console.log('AdminDashboard: Starting company addition:', companyData);
    try {
      console.log('AdminDashboard: Calling API to add company...');
      const response = await addCompany(companyData);
      console.log('AdminDashboard: Company added successfully:', response?.data);
      
      console.log('AdminDashboard: Refreshing companies list...');
      await fetchCompanies();
      
      setAddCompanyDialogOpen(false);
      setError(''); // Clear any existing errors
      console.log('AdminDashboard: Company addition completed successfully');
    } catch (err) {
      console.error('AdminDashboard: Error adding company:', {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      
      const errorMessage = err.response?.data?.message || 
        err.response?.data?.error || 
        err.message || 
        'Failed to add company. Please try again.';
      
      console.log('AdminDashboard: Setting error message:', errorMessage);
      setError(errorMessage);
      return Promise.reject(errorMessage); // Propagate error to dialog
    }
  };

  const handleAddUser = async (userData) => {
    try {
      console.log('Adding user:', userData);
      const response = await addUser(userData);
      console.log('User added successfully:', response);
      fetchUsers();
      setAddUserDialogOpen(false);
      setError('');
      return response; // Return the response for the promise chain
    } catch (err) {
      console.error('Error adding user:', err);
      const errorMessage = err.response?.data || err.message || 'Failed to add user';
      setError(`Failed to add user: ${errorMessage}`);
      throw err; // Re-throw the error for the promise chain
    }
  };

  const handleDeleteCompany = async (id) => {
    try {
      await deleteCompany(id);
      fetchCompanies();
    } catch (err) {
      setError('Failed to delete company');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Left Sidebar Navigation */}
      <Box sx={{
        width: 240,
        flexShrink: 0,
        backgroundColor: '#fff',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
        display: { xs: 'none', md: 'block' },
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        overflowY: 'auto'
      }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="h6" sx={{ color: '#0A3D0A', fontWeight: 600 }}>
            Admin Dashboard
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Tabs
            orientation="vertical"
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                justifyContent: 'flex-start',
                textAlign: 'left',
                pl: 3,
                '&.Mui-selected': {
                  color: '#0A3D0A',
                  backgroundColor: 'rgba(10, 61, 10, 0.04)'
                }
              }
            }}
          >
            <Tab 
              label="Companies" 
              icon={<Business sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
            <Tab 
              label="Users" 
              icon={<Group sx={{ fontSize: 20 }} />}
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        ml: { xs: 0, md: '240px' },
        p: 3,
        transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms'
      }}>
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2,
          minHeight: 'calc(100vh - 48px)',
          backgroundColor: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
              {error}
              <Button color="inherit" size="small" onClick={fetchCompanies} sx={{ ml: 2 }}>
                Retry
              </Button>
            </Alert>
          )}

          {/* Content Based on Selected Tab */}
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {activeTab === 0 && (
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Table size="small" sx={{ 
                  minWidth: { xs: 300, sm: 500, md: 650 },
                  width: '100%',
                  '& td, & th': { 
                    padding: { xs: 1, sm: 2 },
                    whiteSpace: 'nowrap'
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 200, fontWeight: 'bold', color: 'primary.main' }}>Company Name</TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 'bold', color: 'primary.main' }}>Status</TableCell>
                      <TableCell align="right" sx={{ minWidth: 100, fontWeight: 'bold', color: 'primary.main' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>{company.name}</TableCell>
                          <TableCell>
                            <Box 
                              sx={{ 
                                display: 'inline-block',
                                px: 1.5, 
                                py: 0.5, 
                                borderRadius: 1, 
                                bgcolor: company.status === 'active' ? 'success.light' : 'warning.light',
                                color: company.status === 'active' ? 'success.dark' : 'warning.dark',
                                fontSize: '0.75rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {company.status}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteCompany(company.id)}
                              sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" color="textSecondary">
                              {error ? 'Unable to load companies' : 'No companies found'}
                            </Typography>
                            {!error && (
                              <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => setAddCompanyDialogOpen(true)}
                                size="small"
                              >
                                Add Your First Company
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
            {activeTab === 1 && (
              <Box sx={{ overflowX: 'auto', width: '100%' }}>
                <Table size="small" sx={{ 
                  minWidth: { xs: 300, sm: 500, md: 650 },
                  width: '100%',
                  '& td, & th': { 
                    padding: { xs: 1, sm: 2 },
                    whiteSpace: 'nowrap'
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 150, fontWeight: 'bold', color: 'primary.main' }}>Name</TableCell>
                      <TableCell sx={{ minWidth: 200, fontWeight: 'bold', color: 'primary.main' }}>Email</TableCell>
                      <TableCell sx={{ minWidth: 100, fontWeight: 'bold', color: 'primary.main' }}>Role</TableCell>
                      <TableCell sx={{ minWidth: 150, fontWeight: 'bold', color: 'primary.main' }}>Company</TableCell>
                      <TableCell align="right" sx={{ minWidth: 100, fontWeight: 'bold', color: 'primary.main' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Box 
                              sx={{ 
                                display: 'inline-block',
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1, 
                                bgcolor: 
                                  user.role.toLowerCase() === 'admin' ? 'primary.light' : 
                                  user.role.toLowerCase() === 'manager' ? 'info.light' : 'secondary.light',
                                color: 
                                  user.role.toLowerCase() === 'admin' ? 'primary.dark' : 
                                  user.role.toLowerCase() === 'manager' ? 'info.dark' : 'secondary.dark',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'capitalize'
                              }}
                            >
                              {user.role.toLowerCase()}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ 
                            color: user.company_name ? 'text.primary' : 'text.secondary',
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}>
                            {user.company_name || 'N/A'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteUser(user.id)}
                              color="error"
                              sx={{ ml: 1 }}
                              disabled={user.role.toLowerCase() === 'admin'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" color="textSecondary">
                              No users found
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={() => setAddUserDialogOpen(true)}
                              size="small"
                            >
                              Add Your First User
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Existing Dialogs */}
      <AddCompanyDialog
        open={addCompanyDialogOpen}
        onClose={() => setAddCompanyDialogOpen(false)}
        onSubmit={handleAddCompany}
      />

      <AddUserDialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onSubmit={handleAddUser}
        companies={companies}
      />
    </Box>
  );
};

export default AdminDashboard;
