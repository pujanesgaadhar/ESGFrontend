import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography,
  Card,
  CardContent,

  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';


const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Login form submitted with:', formData.email);
    
    try {
      console.log('Login.jsx: Attempting to login...');
      await login(formData.email, formData.password);
      console.log('Login.jsx: Login function completed without throwing error');
      
      // Check what's in localStorage to debug
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      console.log('Login.jsx: After login - User in localStorage:', storedUser ? JSON.parse(storedUser) : null);
      console.log('Login.jsx: After login - Token exists:', !!storedToken);
      
      // Force redirect if needed
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Login.jsx: User role from localStorage:', userData.role);
        if (userData.role.toLowerCase() === 'admin') {
          console.log('Login.jsx: Manually redirecting to admin dashboard');
          window.location.href = '/admin';
        } else if (userData.role.toLowerCase() === 'manager') {
          console.log('Login.jsx: Manually redirecting to manager dashboard');
          window.location.href = '/manager';
        } else if (userData.role.toLowerCase() === 'company') {
          console.log('Login.jsx: Manually redirecting to company dashboard');
          window.location.href = '/company';
        }
      }
    } catch (err) {
      console.error('Login.jsx: Login error:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card elevation={3} sx={{ width: '100%', mt: 3 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              ESG Framework Login
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>

            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;
