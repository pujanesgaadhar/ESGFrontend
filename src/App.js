import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EnhancedManagerDashboard from './pages/EnhancedManagerDashboard';
import RepresentativeDashboard from './pages/RepresentativeDashboard';

import Navigation from './components/Navigation.jsx';
import PermanentNavigation from './components/PermanentNavigation';
import PermanentNavigationRepresentative from './components/PermanentNavigationRepresentative';
import EmissionsChartDashboardWithZoom from './components/EmissionsChartDashboardWithZoom';
import LogoTest from './components/LogoTest';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logo-test" element={<LogoTest />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['admin', 'ADMIN']}>
                <>
                  <Navigation />
                  <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                    <AdminDashboard />
                  </Box>
                </>
              </ProtectedRoute>
            }
          />
          {/* Manager Routes with Permanent Navigation */}
          <Route
            path="/manager/*"
            element={
              <ProtectedRoute roles={['manager', 'MANAGER']}>
                <PermanentNavigation />
              </ProtectedRoute>
            }
          />
          
          {/* Enhanced Manager Dashboard - Overview */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={['manager', 'MANAGER']}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <PermanentNavigation />
                  <Box 
                    component="main" 
                    sx={{ 
                      flexGrow: 1, 
                      p: 3, 
                      width: 'calc(100% - 280px)', 
                      ml: '280px',
                      display: 'flex',
                      flexDirection: 'column',
                      pt: 10, // Increased padding top to prevent navbar overlap
                      mt: 0,
                      '& > *': {
                        maxWidth: '1200px',
                        width: '100%',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                      }
                    }}
                  >
                    <EnhancedManagerDashboard />
                  </Box>
                </Box>
              </ProtectedRoute>
            }
          />
        
        {/* Submission Review Section */}
        <Route
          path="/manager/submissions"
          element={
            <ProtectedRoute roles={['manager', 'MANAGER']}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <PermanentNavigation />
                <Box 
                  component="main" 
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: 'calc(100% - 280px)', 
                    ml: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 10, // Increased padding top to prevent navbar overlap
                    mt: 0,
                    '& > *': {
                      maxWidth: '1200px',
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: '1200px', mb: 4 }}>
                    <Typography variant="h4" sx={{ color: '#0A3D0A', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                      Submission Review
                    </Typography>
                  </Box>
                  <ManagerDashboard />
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />
        
        {/* GHG Emissions Dashboard Section */}
        <Route
          path="/manager/emissions-dashboard"
          element={
            <ProtectedRoute roles={['manager', 'MANAGER']}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <PermanentNavigation />
                <Box 
                  component="main" 
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: 'calc(100% - 280px)', 
                    ml: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 10, // Increased padding top to prevent navbar overlap
                    mt: 0,
                    '& > *': {
                      maxWidth: '1200px',
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: '1200px', mb: 4 }}>
                    <EmissionsChartDashboardWithZoom />
                  </Box>
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />
        {/* Representative Routes with Permanent Navigation */}
        <Route
          path="/representative/*"
          element={
            <ProtectedRoute roles={['representative', 'REPRESENTATIVE']}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <PermanentNavigationRepresentative />
              </Box>
            </ProtectedRoute>
          }
        />
        
        {/* Representative Dashboard */}
        <Route
          path="/representative"
          element={
            <ProtectedRoute roles={['representative', 'REPRESENTATIVE']}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <PermanentNavigationRepresentative />
                <Box 
                  component="main" 
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: 'calc(100% - 280px)', 
                    ml: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 10, // Increased padding top to prevent navbar overlap
                    mt: 0,
                    '& > *': {
                      maxWidth: '1200px',
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: '1200px', mb: 4 }}>
                    <Typography variant="h4" sx={{ color: '#0A3D0A', mb: 2, fontWeight: 'bold' }}>
                      Representative Dashboard
                    </Typography>
                  </Box>
                  <RepresentativeDashboard />
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />
        
        {/* Upload Emissions Data */}
        <Route
          path="/representative/upload"
          element={
            <ProtectedRoute roles={['representative', 'REPRESENTATIVE']}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <PermanentNavigationRepresentative />
                <Box 
                  component="main" 
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: 'calc(100% - 280px)', 
                    ml: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 10, // Increased padding top to prevent navbar overlap
                    mt: 0,
                    '& > *': {
                      maxWidth: '1200px',
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: '1200px', mb: 4 }}>
                    <Typography variant="h4" sx={{ color: '#0A3D0A', mb: 2, fontWeight: 'bold' }}>
                      Upload Emissions Data
                    </Typography>
                  </Box>
                  <RepresentativeDashboard uploadView={true} />
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />
        
        {/* Submission History */}
        <Route
          path="/representative/history"
          element={
            <ProtectedRoute roles={['representative', 'REPRESENTATIVE']}>
              <Box sx={{ display: 'flex', width: '100%' }}>
                <PermanentNavigationRepresentative />
                <Box 
                  component="main" 
                  sx={{ 
                    flexGrow: 1, 
                    p: 3, 
                    width: 'calc(100% - 280px)', 
                    ml: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 10, // Increased padding top to prevent navbar overlap
                    mt: 0,
                    '& > *': {
                      maxWidth: '1200px',
                      width: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: '1200px', mb: 4 }}>
                    <Typography variant="h4" sx={{ color: '#0A3D0A', mb: 2, fontWeight: 'bold' }}>
                      Submission History
                    </Typography>
                  </Box>
                  <RepresentativeDashboard historyView={true} />
                </Box>
              </Box>
            </ProtectedRoute>
          }
        />

        </Routes>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
