import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import RepresentativeDashboard from './pages/RepresentativeDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Navigation from './components/Navigation.jsx';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
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
        <Route
          path="/manager"
          element={
            <ProtectedRoute roles={['manager', 'MANAGER']}>
              <>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                  <ManagerDashboard />
                </Box>
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/representative"
          element={
            <ProtectedRoute roles={['representative', 'REPRESENTATIVE']}>
              <>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                  <RepresentativeDashboard />
                </Box>
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/company"
          element={
            <ProtectedRoute roles={['company', 'COMPANY']}>
              <>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
                  <CompanyDashboard />
                </Box>
              </>
            </ProtectedRoute>
          }
        />
        </Routes>
      </Box>
    </LocalizationProvider>
  );
}

export default App;
