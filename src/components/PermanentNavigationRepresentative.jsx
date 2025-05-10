import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography,
  Box, 
  Drawer, 
  List, 
  ListItem,
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Badge,
  Popover,
  Button
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
// Using direct image import instead of component
// Import ESG colors from theme
import { ESG_COLORS } from '../theme/esgTheme';

// Define animations
const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const PermanentNavigationRepresentative = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
  
  // Handle notification item click - simplified for the new UI
  const handleNotificationItemClick = (notification) => {
    // Mark notification as read if not already read
    if (!notification.read) {
      markNotificationAsRead(notification.id)
        .then(() => {
          // Update local state
          setNotifications(prev => 
            prev.map(n => 
              n.id === notification.id ? { ...n, read: true } : n
            )
          );
        })
        .catch(error => console.error('Error marking notification as read:', error));
    }
    
    // Close the notification menu
    handleNotificationMenuClose();
  };
  
  // Function to delete a notification
  const handleDeleteNotification = async (notificationId, event) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      console.log(`Notification ${notificationId} deleted successfully`);
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

  // Set drawer state based on screen size
  useEffect(() => {
    // Set initial drawer state based on screen size
    setDrawerOpen(!isMobile);
    
    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth < theme.breakpoints.values.md) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, theme.breakpoints.values.md]);

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
  
  const drawerWidth = 280; // Only using full drawer width in this component
  
  // Toggle drawer open/close
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          left: 0,
          background: ESG_COLORS.navbar.background.white,
          borderBottom: `1px solid ${ESG_COLORS.navbar.border}`,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          color: ESG_COLORS.navbar.text.primary
        }}
      >
        <Toolbar sx={{ px: 0, width: '100%', display: 'flex', position: 'relative', height: 64 }}>
          {/* Left corner - Hamburger menu */}
          <Tooltip title={drawerOpen ? "Close menu" : "Open menu"}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ 
                ml: 0, 
                position: 'absolute', 
                left: 16,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: ESG_COLORS.navbar.text.hover
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          
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
              src="/images/ESG Aadhar logo.svg"
              alt="ESGAadhar Logo"
              sx={{ 
                height: 48,
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.1))', // Lighter shadow for better visibility on light background
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
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
            <Popover
              id="notification-menu"
              anchorEl={notificationAnchorEl}
              open={notificationMenuOpen}
              onClose={handleNotificationMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 8,
                sx: {
                  width: '350px',
                  overflow: 'hidden',
                  mt: 1
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <div className="MuiBox-root" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontWeight: 'bold',
                    color: '#0A3D0A'
                  }}>
                    <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
                    Notifications
                  </Typography>
                  
                  {notifications.length > 0 && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => {
                        // Call API to clear all notifications
                        Promise.all(notifications.map(n => deleteNotification(n.id)))
                          .then(() => {
                            setNotifications([]);
                            handleNotificationMenuClose();
                          })
                          .catch(error => console.error('Error clearing notifications:', error));
                      }}
                      sx={{ 
                        fontSize: '0.75rem', 
                        py: 0.5, 
                        borderColor: '#0A3D0A',
                        color: '#0A3D0A',
                        '&:hover': {
                          backgroundColor: 'rgba(10, 61, 10, 0.04)',
                          borderColor: '#0A3D0A'
                        }
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </Box>
              
              <Divider />
              
              <Box sx={{ p: 2, maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                    No notifications
                  </Typography>
                ) : (
                  <List sx={{ p: 0 }}>
                    {notifications.map(notification => (
                      <ListItem 
                        key={notification.id}
                        onClick={() => handleNotificationItemClick(notification)}
                        sx={{
                          p: 1.5,
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: notification.read ? 'transparent' : '#f0f7f0',
                          '&:hover': {
                            backgroundColor: notification.read ? '#f5f5f5' : '#e0f0e0'
                          },
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: notification.read ? 'normal' : 'bold', pr: 4 }}>
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                                {new Date(notification.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
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
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Popover>
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
      
      {/* Fully Collapsible Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            borderRight: `1px solid ${ESG_COLORS.navbar.border}`,
            marginTop: '64px', // Height of AppBar
            height: 'calc(100% - 64px)',
            background: ESG_COLORS.navbar.dropdown.background,
            boxShadow: drawerOpen ? '4px 0 10px rgba(0,0,0,0.05)' : 'none',
            transition: theme.transitions.create(['width', 'margin', 'box-shadow'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 1 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%',
            animation: `${slideIn} 0.5s ease-out`
          }}>
            <Box sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              color: ESG_COLORS.navbar.text.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Representative Menu
            </Box>
          </Box>
        </Box>
        <Divider />
        <List>
          {/* Main Dashboard */}
          <ListItemButton 
            onClick={() => navigate('/representative')}
            selected={isActive('/representative')}
            sx={{
              minHeight: 48,
              px: 2.5,
              my: 0.5,
              borderRadius: '4px',
              mx: 1,
              transition: 'all 0.2s ease',
              animation: `${slideIn} 0.3s ease-out`,
              '&:hover': {
                backgroundColor: ESG_COLORS.navbar.dropdown.hoverItem,
                transform: 'translateX(4px)'
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderLeft: `4px solid ${ESG_COLORS.navbar.text.active}`,
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.25)',
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
              my: 0.5,
              borderRadius: '4px',
              mx: 1,
              transition: 'all 0.2s ease',
              animation: `${slideIn} 0.3s ease-out`,
              '&:hover': {
                backgroundColor: ESG_COLORS.navbar.dropdown.hoverItem,
                transform: 'translateX(4px)'
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderLeft: `4px solid ${ESG_COLORS.navbar.text.active}`,
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.25)',
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
              my: 0.5,
              borderRadius: '4px',
              mx: 1,
              transition: 'all 0.2s ease',
              animation: `${slideIn} 0.3s ease-out`,
              '&:hover': {
                backgroundColor: ESG_COLORS.navbar.dropdown.hoverItem,
                transform: 'translateX(4px)'
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderLeft: `4px solid ${ESG_COLORS.navbar.text.active}`,
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.25)',
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

      {/* Main content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 0, 
        mt: '64px',
        transition: theme.transitions.create(['margin', 'width', 'margin-left'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        width: isMobile ? '100%' : (drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%'),
        marginLeft: isMobile ? 0 : (drawerOpen ? `${drawerWidth}px` : 0),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
        {/* Children content will be rendered here */}
        {children}
      </Box>
    </Box>
  );
};

export default PermanentNavigationRepresentative;
