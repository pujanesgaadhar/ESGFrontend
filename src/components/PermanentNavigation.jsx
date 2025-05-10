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
  Badge,
  Popover,
  Button,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { keyframes } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/api';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import NatureIcon from '@mui/icons-material/Nature';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
// Using direct image import instead of component

// Import ESG colors from theme
import { ESG_COLORS } from '../theme/esgTheme';

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const PermanentNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Handle profile menu click is handled by handleMenu below

  const drawerWidth = 280;
  
  // State for notifications
  const [notifications, setNotifications] = useState([]);
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
  
  // Handle notification item click
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
  
  // Fetch notifications from backend API
  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Load notifications when component mounts (only for non-admin users)
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== 'admin') {
      fetchNotifications();
      
      // Set up polling to check for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    // Any initialization code can go here
  }, []);
  
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
  
  // Toggle drawer function
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Only show manager-specific navigation items for managers
  const isManager = user.role?.toLowerCase() === 'manager';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
              aria-label="menu"
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
            <Zoom in={true} timeout={800}>
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
                    transform: 'scale(1.05)',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }
                }}
              />
            </Zoom>
            {/* Text element removed as requested */}
          </Box>
          
          {/* Right corner - Notifications and Profile */}
          <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center' }}>
            {user?.role !== 'admin' && (
              <>
                {/* Notification Icon */}
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
                
                {/* Notification Popover */}
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
      
      {/* Collapsible Drawer */}
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
            animation: `${fadeIn} 0.5s ease-out`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NatureIcon sx={{ color: ESG_COLORS.environment, mr: 1 }} />
              <PeopleIcon sx={{ color: ESG_COLORS.social, mr: 1 }} />
              <AccountBalanceIcon sx={{ color: ESG_COLORS.governance }} />
            </Box>
            <Box sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              color: ESG_COLORS.navbar.text.primary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ESG Menu
            </Box>
          </Box>
        </Box>
        <Divider />
        <List>
          {/* Main Dashboard */}
          <Fade in={true} timeout={300}>
            <ListItemButton 
              onClick={() => navigate(getDashboardPath())}
              selected={isActive(getDashboardPath())}
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
                  color: isActive(getDashboardPath()) ? ESG_COLORS.environment : 'inherit',
                  transition: 'color 0.2s ease'
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText 
                primary={`${user.role?.charAt(0).toUpperCase()}${user.role?.slice(1).toLowerCase()} Dashboard`}
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: isActive(getDashboardPath()) ? 'bold' : 'medium',
                    color: isActive(getDashboardPath()) ? ESG_COLORS.environment : 'inherit',
                    fontSize: '0.95rem',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    transition: 'color 0.2s ease'
                  }
                }}
              />
            </ListItemButton>
          </Fade>
          
          {/* Manager-specific navigation items */}
          {isManager && (
            <>
              <Divider sx={{ my: 1 }} />
              
              {/* Submission Review */}
              <Fade in={true} timeout={400}>
                <ListItemButton 
                  onClick={() => {
                    navigate('/manager/submissions');
                  }}
                  selected={isActive('/manager/submissions')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    my: 0.5,
                    borderRadius: '4px',
                    mx: 1,
                    transition: 'all 0.2s ease',
                    animation: `${slideIn} 0.4s ease-out`,
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)',
                      transform: 'translateX(4px)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(33, 150, 243, 0.15)',
                      borderLeft: `4px solid ${ESG_COLORS.social}`,
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.25)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      color: isActive('/manager/submissions') ? ESG_COLORS.social : 'inherit',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    <FactCheckIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Submission Review"
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: isActive('/manager/submissions') ? 'bold' : 'medium',
                        color: isActive('/manager/submissions') ? ESG_COLORS.social : 'inherit',
                        fontSize: '0.95rem',
                        transition: 'color 0.2s ease'
                      }
                    }}
                  />
                </ListItemButton>
              </Fade>
              
              {/* GHG Emissions Dashboard */}
              <Fade in={true} timeout={500}>
                <ListItemButton 
                  onClick={() => {
                    navigate('/manager/emissions-dashboard');
                  }}
                  selected={isActive('/manager/emissions-dashboard')}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    my: 0.5,
                    borderRadius: '4px',
                    mx: 1,
                    transition: 'all 0.2s ease',
                    animation: `${slideIn} 0.5s ease-out`,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 235, 59, 0.15)',
                      transform: 'translateX(4px)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255, 235, 59, 0.2)',
                      borderLeft: `4px solid ${ESG_COLORS.governance}`,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 235, 59, 0.3)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 3,
                      color: isActive('/manager/emissions-dashboard') ? ESG_COLORS.governance : 'inherit',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    <AssessmentIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="GHG Emissions Dashboard"
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: isActive('/manager/emissions-dashboard') ? 'bold' : 'medium',
                        color: isActive('/manager/emissions-dashboard') ? ESG_COLORS.governance : 'inherit',
                        fontSize: '0.95rem',
                        transition: 'color 0.2s ease'
                      }
                    }}
                  />
                </ListItemButton>
              </Fade>
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
