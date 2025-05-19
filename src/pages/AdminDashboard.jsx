import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Delete, 
  Add as AddIcon
} from '@mui/icons-material';

import AddUserDialog from '../components/AddUserDialog';
import AddCompanyDialog from '../components/AddCompanyDialog';
import AdminNavigation from '../components/AdminNavigation';
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
    
    // Add event listeners for dialog open events
    const handleOpenAddCompanyDialog = () => setAddCompanyDialogOpen(true);
    const handleOpenAddUserDialog = () => setAddUserDialogOpen(true);
    
    window.addEventListener('openAddCompanyDialog', handleOpenAddCompanyDialog);
    window.addEventListener('openAddUserDialog', handleOpenAddUserDialog);
    
    return () => {
      window.removeEventListener('openAddCompanyDialog', handleOpenAddCompanyDialog);
      window.removeEventListener('openAddUserDialog', handleOpenAddUserDialog);
    };
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
      {/* Navigation Bar */}
      <AdminNavigation />

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1,
        p: 3,
        width: '100%',
        marginTop: '64px', // Add top margin to account for AppBar height
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center' // Center content horizontally
      }}>
          {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              width: '100%', 
              maxWidth: '1200px' 
            }}
          >
            {error}
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError('');
                fetchCompanies();
                fetchUsers();
              }} 
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        {/* Tabs */}
        <Paper 
          sx={{ 
            width: '100%', 
            maxWidth: '1200px',
            mb: 3,
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              backgroundColor: '#f8f8f8',
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              '& .MuiTab-root': {
                fontWeight: 600,
                color: 'rgba(0, 0, 0, 0.7)',
                '&.Mui-selected': {
                  color: '#0A3D0A'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#0A3D0A'
              }
            }}
          >
            <Tab label="Companies" />
            <Tab label="Users" />
          </Tabs>
        </Paper>

        {/* Content Based on Selected Tab */}
        <Paper 
          sx={{ 
            p: 3, 
            width: '100%',
            maxWidth: '1200px', 
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            borderRadius: '8px'
          }}
        >
            {/* Companies Tab */}
            {activeTab === 0 && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#0A3D0A'
                    }}
                  >
                    Companies
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddCompanyDialogOpen(true)}
                    sx={{ 
                      backgroundColor: '#0A3D0A',
                      '&:hover': {
                        backgroundColor: '#9DC183'
                      }
                    }}
                  >
                    Add Company
                  </Button>
                </Box>

                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                  <Table 
                    size="small" 
                    sx={{ 
                      minWidth: { xs: 300, sm: 500, md: 650 },
                      width: '100%',
                      '& td, & th': { 
                        padding: { xs: 1, sm: 2 },
                        whiteSpace: 'nowrap'
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            minWidth: 200, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Company Name
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            minWidth: 100, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            minWidth: 100, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {companies.length > 0 ? (
                        companies.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
                              {company.name}
                            </TableCell>
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
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                No companies found
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setAddCompanyDialogOpen(true)}
                                sx={{ 
                                  mt: 1,
                                  backgroundColor: '#0A3D0A',
                                  '&:hover': {
                                    backgroundColor: '#9DC183'
                                  }
                                }}
                              >
                                Add Company
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 1 && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: '#0A3D0A'
                    }}
                  >
                    Users
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddUserDialogOpen(true)}
                    sx={{ 
                      backgroundColor: '#0A3D0A',
                      '&:hover': {
                        backgroundColor: '#9DC183'
                      }
                    }}
                  >
                    Add User
                  </Button>
                </Box>

                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                  <Table 
                    size="small" 
                    sx={{ 
                      minWidth: { xs: 300, sm: 500, md: 650 },
                      width: '100%',
                      '& td, & th': { 
                        padding: { xs: 1, sm: 2 },
                        whiteSpace: 'nowrap'
                      }
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            minWidth: 150, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            minWidth: 200, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell 
                          sx={{ 
                            minWidth: 100, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Role
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            minWidth: 100, 
                            fontWeight: 'bold', 
                            color: '#0A3D0A',
                            backgroundColor: 'rgba(10, 61, 10, 0.04)'
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
                              {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Box 
                                sx={{ 
                                  display: 'inline-block',
                                  px: 1.5, 
                                  py: 0.5, 
                                  borderRadius: 1, 
                                  bgcolor: 
                                    user.role === 'admin' ? 'error.light' : 
                                    user.role === 'manager' ? 'info.light' : 'success.light',
                                  color: 
                                    user.role === 'admin' ? 'error.dark' : 
                                    user.role === 'manager' ? 'info.dark' : 'success.dark',
                                  fontSize: '0.75rem',
                                  fontWeight: 'medium'
                                }}
                              >
                                {user.role}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteUser(user.id)}
                                sx={{ color: 'error.main', '&:hover': { color: 'error.dark' } }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                              <Typography variant="subtitle1" color="text.secondary">
                                No users found
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setAddUserDialogOpen(true)}
                                sx={{ 
                                  mt: 1,
                                  backgroundColor: '#0A3D0A',
                                  '&:hover': {
                                    backgroundColor: '#9DC183'
                                  }
                                }}
                              >
                                Add User
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </>
            )}
          </Paper>

          {/* Add User Dialog */}
          <AddUserDialog 
            open={addUserDialogOpen} 
            onClose={() => setAddUserDialogOpen(false)} 
            onAddUser={handleAddUser}
            companies={companies}
          />

        {/* Add Company Dialog */}
        <AddCompanyDialog 
          open={addCompanyDialogOpen} 
          onClose={() => setAddCompanyDialogOpen(false)} 
          onAddCompany={handleAddCompany}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
