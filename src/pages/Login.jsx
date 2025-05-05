import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography,
  Card,
  CardContent,
  Alert,
  Paper
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


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
      console.log(storedToken + "Pujan Patel")
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
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'transparent'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box 
              component="img"
              src={`${process.env.PUBLIC_URL}/images/ESG Aadhar logo dark.svg`}
              alt="ESGAadhar Logo"
              sx={{ 
                height: 100,
                mb: 2
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
            Empowering Sustainable Business
          </Typography>
        </Paper>

        <Card 
          elevation={3} 
          sx={{ 
            width: '100%', 
            mt: 2,
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
              <LockOutlinedIcon sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6">
                Sign In
              </Typography>
            </Box>
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
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  fontSize: '1rem',
                  py: 1.5
                }}
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
