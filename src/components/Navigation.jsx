import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Drawer, 
  IconButton, 
  List, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Menu,
  MenuItem,
  Badge,
  Paper,
  Collapse,
  Divider,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/api';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearIcon from '@mui/icons-material/Clear';
// Removed unused DeleteOutlineIcon import

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  
  // Fetch notifications from backend API
  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Update locally as well for immediate UI feedback
      setNotifications(prev => 
        prev.map(n => n.id === id ? {...n, read: true} : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Clear/delete a notification
  const clearNotification = async (id, event) => {
    // Stop event propagation to prevent marking as read
    event.stopPropagation();
    
    try {
      await deleteNotification(id);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Load notifications when component mounts (only for non-admin users)
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== 'admin') {
      fetchNotifications();
    }
  }, [user]);

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

  const drawerWidth = 240;

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          left: 0,
        }}
      >
        <Toolbar sx={{ px: 0, width: '100%', display: 'flex', position: 'relative', height: 64 }}>
          {/* Left corner - Hamburger menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ ml: 0, position: 'absolute', left: 16 }}
          >
            <MenuIcon />
          </IconButton>
          
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
              src={`${process.env.PUBLIC_URL}/images/esg-aadhar-logo-main.svg`}
              alt="ESGAadhar Logo"
              sx={{ 
                height: 48,
                mr: 1,
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
          
          {/* Right corner - Profile icon */}
          <IconButton
            color="inherit"
            onClick={handleMenu}
            aria-controls="profile-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ position: 'absolute', right: 16 }}
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
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400, // Even wider drawer for better notification readability
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            marginTop: '64px', // Height of AppBar
          },
        }}
      >
        <List>
          <ListItemButton 
            onClick={() => navigate(getDashboardPath())}
            sx={{
              minHeight: 48,
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
              }}
            >
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary={`${user.role?.charAt(0).toUpperCase()}${user.role?.slice(1).toLowerCase()} Dashboard`}
              primaryTypographyProps={{
                sx: { fontWeight: 'medium' }
              }}
            />
          </ListItemButton>
          
          {user?.role !== 'admin' && (
            <ListItemButton 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              sx={{
                minHeight: 48,
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 3,
                }}
              >
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary="Notifications"
                primaryTypographyProps={{
                  sx: { fontWeight: 'medium' }
                }}
              />
            </ListItemButton>
          )}
          
          {/* Notifications Panel - Hidden for admin users */}
          {user?.role !== 'admin' && (
            <Collapse in={notificationsOpen} timeout="auto" unmountOnExit sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                Notifications
              </Typography>
              {notifications.length > 0 && (
                <Button 
                  size="small"
                  variant="text"
                  color="primary"
                  onClick={async () => {
                    try {
                      // Mark all as read and delete them
                      await Promise.all(notifications.map(async (n) => {
                        try {
                          if (!n.read) await markAsRead(n.id);
                          await deleteNotification(n.id);
                        } catch (err) {
                          console.error(`Error processing notification ${n.id}:`, err);
                        }
                      }));
                      // Clear all notifications from the panel
                      setNotifications([]);
                    } catch (error) {
                      console.error('Error processing notifications:', error);
                    }
                  }}
                  sx={{ mr: 1, fontSize: '0.75rem', textTransform: 'none' }}
                >
                  Mark all as read
                </Button>
              )}
            </Box>
            <Paper 
              elevation={3}
              sx={{ 
                mx: 0.5, 
                my: 0.5, 
                borderRadius: 2,
                backgroundColor: (theme) => theme.palette.background.paper,
                width: 'calc(100% - 1rem)',
                minWidth: 380,
                maxHeight: 'none',
                overflow: 'visible',
                boxShadow: (theme) => theme.shadows[2],
                '& .MuiListItemButton-root': {
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.action.hover,
                  },
                  position: 'relative'
                }
              }}
            >
              <List sx={{ py: 0 }}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <React.Fragment key={notification.id}>
                      <ListItemButton 
                        sx={{ 
                          px: 2.5, 
                          py: 2,
                          backgroundColor: notification.read ? 'transparent' : 'rgba(0, 200, 83, 0.08)',
                          borderLeft: notification.read ? 'none' : '4px solid #0A3D0A',
                          mb: 0.5
                        }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Box sx={{ display: 'flex', width: '100%', pr: 8, position: 'relative', overflowWrap: 'break-word' }}>
                          <ListItemText 
                            primary={
                              <Typography variant="subtitle2" component="div" sx={{ fontWeight: notification.read ? 'normal' : 'bold', color: '#0A3D0A' }}>
                                {notification.title}
                              </Typography>
                            }
                            secondary={
                              <Box component="span" sx={{ display: 'block' }}>
                                <Typography variant="body2" component="span" sx={{ my: 0.5, display: 'block', color: 'text.primary', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" component="span" sx={{ display: 'block' }} color="text.secondary">
                                  {new Date(notification.createdAt).toLocaleString(undefined, { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            }
                          />
                          <IconButton 
                            size="small" 
                            onClick={(e) => clearNotification(notification.id, e)}
                            sx={{ 
                              position: 'absolute',
                              right: 8,
                              top: 8,
                              color: 'grey.500',
                              '&:hover': { color: 'error.main' }
                            }}
                            title="Clear notification"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemButton>
                      <Divider component="li" sx={{ my: 0.5 }} />
                    </React.Fragment>
                  ))
                ) : (
                  <ListItemButton>
                    <ListItemText 
                      primary="No notifications"
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'textSecondary',
                        align: 'center'
                      }}
                    />
                  </ListItemButton>
                )}
              </List>
            </Paper>
            </Collapse>
          )}
        </List>
      </Drawer>
    </>
  );
};

export default Navigation;
