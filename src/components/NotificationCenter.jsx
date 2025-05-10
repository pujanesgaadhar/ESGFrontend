import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Popover,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Fade,
  Zoom,
  Tooltip
} from '@mui/material';
import { keyframes } from '@mui/system';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/api';

// Import ESG colors from theme
import { ESG_COLORS } from '../theme/esgTheme';

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

/**
 * NotificationCenter component for displaying and managing user notifications
 * @param {Object} props - Component props
 * @param {Function} props.onNotificationUpdate - Callback when notifications are updated
 */
const NotificationCenter = ({ onNotificationUpdate }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  // Fetch notifications on component mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Effect for badge animation when unread count changes
  useEffect(() => {
    if (unreadCount > 0) {
      const badge = document.querySelector('.MuiBadge-badge');
      if (badge) {
        badge.style.animation = `${pulse} 1s ease-in-out`;
        const animationEndHandler = () => {
          badge.style.animation = '';
        };
        badge.addEventListener('animationend', animationEndHandler);
        return () => {
          badge.removeEventListener('animationend', animationEndHandler);
        };
      }
    }
  }, [unreadCount]);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications();
      if (response && response.data) {
        setNotifications(response.data);
        // Count unread notifications
        const unread = response.data.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the notification popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the notification popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      // Notify parent component
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete a notification
  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      // Update the local state
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      setNotifications(updatedNotifications);
      // Update unread count
      const unread = updatedNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      // Notify parent component
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
      
      // Mark each notification as read
      for (const id of unreadIds) {
        await markNotificationAsRead(id);
      }
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      // Notify parent component
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification type display text
  const getNotificationTypeDisplay = (type) => {
    switch (type) {
      case 'GHG_STATUS_UPDATE':
        return 'GHG Emission Status Update';
      case 'SOCIAL_STATUS_UPDATE':
        return 'Social Metric Status Update';
      case 'GOVERNANCE_STATUS_UPDATE':
        return 'Governance Metric Status Update';
      case 'SUBMISSION_COMMENT':
        return 'New Comment';
      case 'SYSTEM_NOTIFICATION':
        return 'System Notification';
      default:
        return 'Notification';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type, status) => {
    if (status === 'APPROVED') {
      return <CheckCircleIcon sx={{ color: '#2E7D32' }} />;
    } else if (status === 'DENIED') {
      return <DeleteIcon sx={{ color: '#C62828' }} />;
    } else {
      return null;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          aria-describedby={id}
          onClick={handleClick}
          color="inherit"
          size="large"
          sx={{
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: unreadCount > 0 ? ESG_COLORS.social : 'grey.500',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            width: 350,
            maxHeight: 500,
            overflow: 'hidden',
            mt: 1,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            borderRadius: 2,
            border: `1px solid ${ESG_COLORS.brand.light}`,
            animation: `${fadeIn} 0.3s ease-out`
          }
        }}
      >
        <Box sx={{ p: 2, backgroundColor: ESG_COLORS.brand.dark, color: 'white' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
            Notifications
          </Typography>
          <Typography variant="body2">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: `linear-gradient(135deg, ${ESG_COLORS.brand.dark} 0%, #1a5e1a 100%)`,
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <NotificationsIcon fontSize="small" />
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Zoom in={true} timeout={400}>
              <Button
                startIcon={<MarkEmailReadIcon />}
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Mark all as read
              </Button>
            </Zoom>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress size={40} sx={{ color: ESG_COLORS.brand.dark }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <Paper 
                key={notification.id}
                elevation={0}
                sx={{ 
                  mb: 0.5,
                  borderLeft: notification.read ? 'none' : `4px solid ${getNotificationColor(notification)}`,
                  backgroundColor: notification.read ? 'white' : `rgba(${getNotificationColorRgb(notification)}, 0.08)`
                }}
              >
                <ListItem
                  key={notification.id}
                  onClick={() => {
                    // Handle redirection to submission review if submission ID exists
                    if (notification.submissionId && notification.type) {
                      // Store the submission ID in localStorage to highlight it on the dashboard
                      localStorage.setItem('highlightSubmissionId', notification.submissionId.toString());
                      
                      // Determine which main tab to select based on notification type
                      let mainTabIndex = 0; // Default to environment tab
                      if (notification.type.toLowerCase().includes('social')) {
                        mainTabIndex = 1;
                      } else if (notification.type.toLowerCase().includes('governance')) {
                        mainTabIndex = 2;
                      }
                      
                      // Store the main tab index to select
                      localStorage.setItem('selectedMainTab', mainTabIndex.toString());
                      
                      // Determine which sub-tab to select based on the submission type
                      let subTabIndex = 0; // Default to first tab
                      
                      if (notification.type.toLowerCase().includes('environment') || notification.type.toLowerCase().includes('ghg')) {
                        // For environment/GHG submissions
                        if (notification.message.toLowerCase().includes('scope 1')) {
                          subTabIndex = 0;
                        } else if (notification.message.toLowerCase().includes('scope 2')) {
                          subTabIndex = 1;
                        } else if (notification.message.toLowerCase().includes('scope 3')) {
                          subTabIndex = 2;
                        } else if (notification.message.toLowerCase().includes('solvent')) {
                          subTabIndex = 3;
                        } else if (notification.message.toLowerCase().includes('sink')) {
                          subTabIndex = 4;
                        }
                      } else if (notification.type.toLowerCase().includes('social')) {
                        // For social submissions
                        if (notification.message.toLowerCase().includes('employee')) {
                          subTabIndex = 0;
                        } else if (notification.message.toLowerCase().includes('community')) {
                          subTabIndex = 1;
                        } else if (notification.message.toLowerCase().includes('supply chain')) {
                          subTabIndex = 2;
                        }
                      } else if (notification.type.toLowerCase().includes('governance')) {
                        // For governance submissions
                        if (notification.message.toLowerCase().includes('corporate')) {
                          subTabIndex = 0;
                        } else if (notification.message.toLowerCase().includes('ethics')) {
                          subTabIndex = 1;
                        } else if (notification.message.toLowerCase().includes('risk')) {
                          subTabIndex = 2;
                        }
                      }
                      
                      // Store the sub-tab index to select
                      localStorage.setItem('selectedSubTab', subTabIndex.toString());
                      
                      // Mark notification as read if it's not already read
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                      
                      // Navigate to manager dashboard
                      navigate('/manager-dashboard');
                      
                      // Close the notification popover
                      handleClose();
                    }
                  }}
                  sx={{
                    cursor: notification.submissionId ? 'pointer' : 'default',
                    py: 1.5,
                    px: 2,
                    pr: 8, // Added from the second sx prop
                    borderLeft: notification.read ? 'none' : `4px solid ${getNotificationColor(notification)}`,
                    backgroundColor: notification.read ? 'transparent' : `rgba(${getNotificationColorRgb(notification)}, 0.08)`,
                    '&:hover': {
                      backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : `rgba(${getNotificationColorRgb(notification)}, 0.12)`
                    },
                    transition: 'all 0.2s ease',
                    animation: `${slideIn} 0.3s ease-out`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': notification.read ? {} : {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(90deg, rgba(${getNotificationColorRgb(notification)}, 0.05) 0%, rgba(${getNotificationColorRgb(notification)}, 0) 100%)`,
                      pointerEvents: 'none'
                    }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex' }}>
                      {!notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            edge="end"
                            aria-label="mark as read"
                            onClick={() => handleMarkAsRead(notification.id)}
                            size="small"
                            sx={{ 
                              mr: 0.5,
                              color: getNotificationColor(notification),
                              '&:hover': {
                                backgroundColor: `rgba(${getNotificationColorRgb(notification)}, 0.1)`
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete notification">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(notification.id)}
                          size="small"
                          sx={{ 
                            '&:hover': {
                              color: '#f44336',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getNotificationIcon(notification.type, notification.status)}
                        <Tooltip title={getNotificationTypeDisplay(notification.type)}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'bold', 
                              color: notification.read ? 'text.primary' : getNotificationColor(notification),
                              transition: 'color 0.2s ease'
                            }}
                          >
                            {notification.title}
                          </Typography>
                        </Tooltip>
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block' }}>
                        <Typography 
                          variant="body2" 
                          component="span" 
                          sx={{ 
                            display: 'block', 
                            color: 'text.primary', 
                            mb: 0.5,
                            fontWeight: notification.read ? 'normal' : 500
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          component="span" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 0.5 
                          }} 
                          color="text.secondary"
                        >
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: notification.read ? 'text.disabled' : getNotificationColor(notification),
                              transition: 'background-color 0.2s ease'
                            }} 
                          />
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </Paper>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

// Helper function to determine notification color based on content
const getNotificationColor = (notification) => {
  const title = notification.title?.toLowerCase() || '';
  const message = notification.message?.toLowerCase() || '';
  
  if (title.includes('environment') || message.includes('environment') || 
      title.includes('emission') || message.includes('emission') ||
      title.includes('ghg') || message.includes('ghg')) {
    return ESG_COLORS.environment;
  } else if (title.includes('social') || message.includes('social') ||
             title.includes('employee') || message.includes('employee') ||
             title.includes('community') || message.includes('community')) {
    return ESG_COLORS.social;
  } else if (title.includes('governance') || message.includes('governance') ||
             title.includes('compliance') || message.includes('compliance') ||
             title.includes('policy') || message.includes('policy')) {
    return ESG_COLORS.governance;
  }
  
  return ESG_COLORS.brand.dark; // Default color
};

// Helper function to convert hex to rgb for rgba usage
const getNotificationColorRgb = (notification) => {
  const color = getNotificationColor(notification);
  // Simple hex to rgb conversion
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

export default NotificationCenter;
