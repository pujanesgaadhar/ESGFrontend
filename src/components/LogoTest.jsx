import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';

const LogoTest = () => {
  // Force reload the page
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Paper sx={{ p: 3, m: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2, color: '#0A3D0A', fontWeight: 'bold' }}>
        Logo Test Component
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleReload} 
        sx={{ mb: 3, bgcolor: '#0A3D0A', '&:hover': { bgcolor: '#0A5D0A' } }}
      >
        Reload Page
      </Button>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            0. Fixed SVG version:
          </Typography>
          <Box 
            component="img"
            src="/images/esg-aadhar-fixed.svg"
            alt="Fixed ESGAadhar Logo"
            sx={{ height: 70, border: '1px solid #ccc' }}
          />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            1. Simple test logo:
          </Typography>
          <Box 
            component="img"
            src="/images/simple-logo.svg"
            alt="Simple Test Logo"
            sx={{ height: 70, border: '1px solid #ccc' }}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            2. Main logo with direct path:
          </Typography>
          <Box 
            component="img"
            src="/images/esg-aadhar-logo-main.svg"
            alt="ESGAadhar Logo"
            sx={{ height: 70, border: '1px solid #ccc' }}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            3. Main logo with PUBLIC_URL:
          </Typography>
          <Box 
            component="img"
            src={`${process.env.PUBLIC_URL}/images/esg-aadhar-logo-main.svg`}
            alt="ESGAadhar Logo"
            sx={{ height: 70, border: '1px solid #ccc' }}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            4. Original round logo for comparison:
          </Typography>
          <Box 
            component="img"
            src={`${process.env.PUBLIC_URL}/images/esgaadhar-round-logo.svg`}
            alt="ESGAadhar Round Logo"
            sx={{ height: 70, border: '1px solid #ccc' }}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            5. Main logo with absolute URL:
          </Typography>
          <Box 
            component="img"
            src="http://localhost:3000/images/esg-aadhar-logo-main.svg"
            alt="ESGAadhar Logo"
            sx={{ height: 70, border: '1px solid #ccc' }}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            6. Inline SVG (simple rectangle):
          </Typography>
          <svg width="200" height="70" viewBox="0 0 200 70" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="70" fill="#0A3D0A" />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#9DC183" fontSize="24" fontFamily="Arial, sans-serif">ESG Aadhar</text>
          </svg>
        </Box>
      </Box>
      
      <Typography variant="body2" sx={{ mt: 3, color: '#666' }}>
        Note: If logos aren't displaying, check the browser console for errors. SVG files might need to be properly formatted or have CORS headers set correctly.
      </Typography>
    </Paper>
  );
};

export default LogoTest;
