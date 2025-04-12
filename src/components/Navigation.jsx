import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(true);

  if (!user) return null; // Don't show navigation when not logged in

  const getDashboardPath = () => {
    switch(user.role?.toLowerCase()) {
      case 'admin': return '/admin';
      case 'manager': return '/manager';
      case 'representative': return '/representative';
      default: return '/';
    }
  };

  const drawerWidth = drawerOpen ? 240 : 72;

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ESG Framework
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
            backgroundColor: (theme) => theme.palette.grey[100],
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <List>
          <ListItemButton 
            onClick={() => navigate(getDashboardPath())}
            sx={{
              minHeight: 48,
              justifyContent: drawerOpen ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: drawerOpen ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary={`${user.role?.charAt(0).toUpperCase()}${user.role?.slice(1).toLowerCase()} Dashboard`}
              sx={{ 
                opacity: drawerOpen ? 1 : 0,
                display: drawerOpen ? 'block' : 'none'
              }}
            />
          </ListItemButton>
          <ListItemButton 
            onClick={logout}
            sx={{
              minHeight: 48,
              justifyContent: drawerOpen ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: drawerOpen ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              sx={{ 
                opacity: drawerOpen ? 1 : 0,
                display: drawerOpen ? 'block' : 'none'
              }}
            />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;
