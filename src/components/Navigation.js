import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  SwipeableDrawer,
  Card,
  CardContent,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { getNotifications } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Create an event emitter for notifications
export const notificationEvents = {
  refresh: new CustomEvent('refreshNotifications')
};

const drawerWidth = 240;

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Listen for refresh events
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('refreshNotifications', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        onClick: () => navigate('/dashboard'),
      },
      {
        text: 'Notifications',
        icon: <NotificationsIcon />,
        onClick: () => setNotificationsOpen(true),
      },
    ];

    if (user?.role === 'admin') {
      items.push(
        {
          text: 'Companies',
          icon: <BusinessIcon />,
          onClick: () => navigate('/companies'),
        },
        {
          text: 'Users',
          icon: <PeopleIcon />,
          onClick: () => navigate('/users'),
        }
      );
    }

    if (user?.role === 'manager') {
      items.push({
        text: 'Approvals',
        icon: <AssessmentIcon />,
        onClick: () => navigate('/approvals'),
      });
    }

    if (user?.role === 'representative') {
      items.push({
        text: 'Submit ESG Data',
        icon: <AssessmentIcon />,
        onClick: () => navigate('/submit'),
      });
    }

    return items;
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {getMenuItems().map((item) => (
          <ListItem button key={item.text} onClick={item.onClick}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box 
            component="img"
            src="/images/esgaadhar-logo.svg"
            alt="ESGAadhar Logo"
            sx={{ 
              height: 40,
              mr: 1,
            }}
          />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#FFFFFF' }}>
            ESGAadhar
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <IconButton
              size="large"
              color="inherit"
              sx={{ ml: 2 }}
            >
              <PersonIcon />
            </IconButton>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
      </Box>
      <SwipeableDrawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpen={() => setNotificationsOpen(true)}
      >
        <Box
          sx={{
            width: 300,
            p: 2,
            height: '100%',
            overflowY: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          {notifications.length === 0 ? (
            <Typography color="text.secondary">
              No notifications
            </Typography>
          ) : (
            notifications.map((notification) => (
              <Card key={notification.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1">
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {notification.message}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default Navigation;
