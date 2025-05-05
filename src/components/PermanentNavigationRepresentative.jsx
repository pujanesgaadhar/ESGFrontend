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
  Badge,
  Divider,
  IconButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';

const PermanentNavigationRepresentative = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
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
  
  // State for notification menu
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationMenuOpen = Boolean(notificationAnchorEl);
  
  // Handle notification icon click
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  // Handle closing the notification menu
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Handle clicking on a notification item
  const handleNotificationItemClick = (notification) => {
    // Close the menu
    handleNotificationMenuClose();
    // Navigate or perform action based on notification type if needed
    console.log('Notification clicked:', notification);
  };
  
  // This function will be implemented in a future update
  // when we add the mark as read functionality to the UI
  
  
  // Delete a notification
  const handleDeleteNotification = async (notificationId, event) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering the parent MenuItem onClick
    }
    try {
      await deleteNotification(notificationId);
      // Update the notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // Create an array of promises for marking each notification as read
      const markPromises = notifications
        .filter(notification => !notification.read)
        .map(notification => markNotificationAsRead(notification.id));
      
      // Wait for all promises to resolve
      await Promise.all(markPromises);
      
      // Update the notifications list
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Load notifications when component mounts (only for non-admin users)
  useEffect(() => {
    if (user && user.role && user.role.toLowerCase() !== 'admin') {
      fetchNotifications();
      
      // Set up polling for notifications
      const interval = setInterval(fetchNotifications, 60000); // Poll every minute
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  // Handle profile menu open
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle profile menu close
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };
  
  // Dashboard path is handled directly in navigation items
  
  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const drawerWidth = 280;
  
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
              src={`${process.env.PUBLIC_URL}/images/ESG Aadhar logo dark.svg`}
              alt="ESGAadhar Logo"
              sx={{ 
                height: 48,
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            {/* Text element removed as requested */}
          </Box>
          
          {/* Right corner - Notifications and Profile */}
          <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center' }}>
            <IconButton 
              color="inherit" 
              sx={{ mr: 2 }} 
              onClick={handleNotificationClick}
              aria-controls={notificationMenuOpen ? 'notification-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={notificationMenuOpen ? 'true' : undefined}
            >
              <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              id="notification-menu"
              anchorEl={notificationAnchorEl}
              open={notificationMenuOpen}
              onClose={handleNotificationMenuClose}
              MenuListProps={{
                'aria-labelledby': 'notification-button',
              }}
              PaperProps={{
                sx: {
                  maxHeight: 'none',
                  width: '450px',
                  overflow: 'visible',
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid #f0f0f0',
                    whiteSpace: 'normal',
                    lineHeight: 1.5
                  }
                }
              }}
            >
              {/* Header with Mark All as Read button */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0A3D0A' }}>
                  Notifications
                </Typography>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Typography 
                    variant="body2" 
                    onClick={handleMarkAllAsRead}
                    sx={{ 
                      color: '#0A3D0A', 
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Mark all as read
                  </Typography>
                )}
              </Box>
              
              {notifications.length === 0 ? (
                <MenuItem disabled>
                  <Typography variant="body2">No notifications</Typography>
                </MenuItem>
              ) : (
                notifications.map(notification => (
                  <MenuItem 
                    key={notification.id} 
                    onClick={() => handleNotificationItemClick(notification)}
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : '#f0f7f0',
                      borderLeft: notification.read ? 'none' : '4px solid #9DC183',
                      '&:hover': {
                        backgroundColor: notification.read ? '#f5f5f5' : '#e0f0e0'
                      },
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', wordBreak: 'break-word', pr: 4 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notification.read ? 'normal' : 'bold',
                          color: '#0A3D0A'
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mb: 1, lineHeight: 1.4 }}>
                        {notification.message}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ alignSelf: 'flex-end', mt: 0.5 }}
                      >
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    {/* X button to delete notification */}
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      sx={{ 
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'rgba(0, 0, 0, 0.54)',
                        '&:hover': { color: '#0A3D0A' }
                      }}
                    >
                      <Box component="span" sx={{ fontSize: '16px', fontWeight: 'bold' }}>×</Box>
                    </IconButton>
                  </MenuItem>
                ))
              )}
            </Menu>
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
            onClick={() => navigate('/representative')}
            selected={isActive('/representative')}
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
                color: isActive('/representative') ? '#0A3D0A' : 'inherit',
              }}
            >
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Representative Dashboard"
              primaryTypographyProps={{
                sx: { 
                  fontWeight: isActive('/representative') ? 'bold' : 'medium',
                  color: isActive('/representative') ? '#0A3D0A' : 'inherit',
                  fontSize: '0.95rem',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }
              }}
            />
          </ListItemButton>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Upload Emissions */}
          <ListItemButton 
            onClick={() => navigate('/representative/upload')}
            selected={isActive('/representative/upload')}
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
                color: isActive('/representative/upload') ? '#0A3D0A' : 'inherit',
              }}
            >
              <UploadFileIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Upload Emissions Data"
              primaryTypographyProps={{
                sx: { 
                  fontWeight: isActive('/representative/upload') ? 'bold' : 'medium',
                  color: isActive('/representative/upload') ? '#0A3D0A' : 'inherit',
                  fontSize: '0.95rem',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }
              }}
            />
          </ListItemButton>
          
          {/* Submission History */}
          <ListItemButton 
            onClick={() => navigate('/representative/history')}
            selected={isActive('/representative/history')}
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
                color: isActive('/representative/history') ? '#0A3D0A' : 'inherit',
              }}
            >
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Submission History"
              primaryTypographyProps={{
                sx: { 
                  fontWeight: isActive('/representative/history') ? 'bold' : 'medium',
                  color: isActive('/representative/history') ? '#0A3D0A' : 'inherit',
                  fontSize: '0.95rem',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word'
                }
              }}
            />
          </ListItemButton>
        </List>
      </Drawer>
    </Box>
  );
};

export default PermanentNavigationRepresentative;
