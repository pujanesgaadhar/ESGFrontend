import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  List, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Menu,
  MenuItem,
  Divider,
  IconButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const PermanentNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Handle profile menu click
  const handleProfileMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle profile menu close
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Load notifications when component mounts and poll regularly (only for non-admin users)
  useEffect(() => {
    let notificationPolling;
    // Effect for any initialization needed
  }, [user]);

  useEffect(() => {
    // Any initialization code can go here
  }, []);

  if (!user) return null; // Don't show navigation when not logged in

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    switch(user.role?.toLowerCase()) {
      case 'admin': return '/admin';
      case 'manager': return '/manager';
      case 'representative': return '/representative';
      default: return '/';
    }
  };

  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawerWidth = 280;

  // Only show manager-specific navigation items for managers
  const isManager = user.role?.toLowerCase() === 'manager';

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          left: 0,
          backgroundColor: '#0A3D0A'
        }}
      >
        <Toolbar sx={{ px: 0, width: '100%', display: 'flex', position: 'relative', height: 64 }}>
          {/* Center - Logo and text */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center', 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
            <Box 
              component="img"
              src="/images/esgaadhar-round-logo.svg"
              alt="ESGAadhar Logo"
              sx={{ 
                height: 48,
                width: 48,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                color: '#FFFFFF',
                ml: 1,
              }}
            >
              ESGAadhar
            </Typography>
          </Box>
          
          {/* Right corner - Notifications and Profile */}
          <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center' }}>
            {user?.role !== 'admin' && (
              <>
                {/* Notification Center */}
                <NotificationCenter onNotificationUpdate={() => console.log('Notifications updated')} />
                
                {/* User Profile Icon */}
                <IconButton 
                  color="inherit" 
                  sx={{ mr: 2 }} 
                  onClick={handleProfileMenuClick}
                >
                  <PersonIcon />
                </IconButton>
              </>
            )}
            <IconButton
              color="inherit"
              onClick={handleMenu}
              aria-controls="profile-menu"
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <PersonIcon />
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            marginTop: '64px', // Height of AppBar
            height: 'calc(100% - 64px)',
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <List>
          {/* Main Dashboard */}
          <ListItemButton 
            onClick={() => navigate(getDashboardPath())}
            selected={isActive(getDashboardPath())}
            sx={{
              minHeight: 48,
              px: 2.5,
              '&.Mui-selected': {
                backgroundColor: '#e8f5e9',
                '&:hover': {
                  backgroundColor: '#c8e6c9',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                color: isActive(getDashboardPath()) ? '#0A3D0A' : 'inherit',
              }}
            >
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary={`${user.role?.charAt(0).toUpperCase()}${user.role?.slice(1).toLowerCase()} Dashboard`}
              primaryTypographyProps={{
                sx: { 
                  fontWeight: isActive(getDashboardPath()) ? 'bold' : 'medium',
                  color: isActive(getDashboardPath()) ? '#0A3D0A' : 'inherit',
                  fontSize: '0.95rem',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }
              }}
            />
          </ListItemButton>
          
          {/* Manager-specific navigation items */}
          {isManager && (
            <>
              <Divider sx={{ my: 1 }} />
              
              {/* Submission Review */}
              <ListItemButton 
                onClick={() => {
                  navigate('/manager/submissions');
                }}
                selected={isActive('/manager/submissions')}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: '#e8f5e9',
                    '&:hover': {
                      backgroundColor: '#c8e6c9',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    color: isActive('/manager/submissions') ? '#0A3D0A' : 'inherit',
                  }}
                >
                  <FactCheckIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Submission Review"
                  primaryTypographyProps={{
                    sx: { 
                      fontWeight: isActive('/manager/submissions') ? 'bold' : 'medium',
                      color: isActive('/manager/submissions') ? '#0A3D0A' : 'inherit',
                      fontSize: '0.95rem',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }
                  }}
                />
              </ListItemButton>
              
              {/* GHG Emissions Dashboard */}
              <ListItemButton 
                onClick={() => {
                  navigate('/manager/emissions-dashboard');
                }}
                selected={isActive('/manager/emissions-dashboard')}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: '#e8f5e9',
                    '&:hover': {
                      backgroundColor: '#c8e6c9',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 3,
                    color: isActive('/manager/emissions-dashboard') ? '#0A3D0A' : 'inherit',
                  }}
                >
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="GHG Emissions Dashboard"
                  primaryTypographyProps={{
                    sx: { 
                      fontWeight: isActive('/manager/emissions-dashboard') ? 'bold' : 'medium',
                      color: isActive('/manager/emissions-dashboard') ? '#0A3D0A' : 'inherit',
                      fontSize: '0.95rem',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }
                  }}
                />
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {/* This is where the page content will be rendered */}
      </Box>
    </Box>
  );
};

export default PermanentNavigation;
