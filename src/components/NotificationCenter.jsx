import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../services/api';

// ESGAadhar green color scheme
const GREEN_DARK = '#0A3D0A';
const GREEN_LIGHT = '#9DC183';

/**
 * NotificationCenter component for displaying and managing user notifications
 * @param {Object} props - Component props
 * @param {Function} props.onNotificationUpdate - Callback when notifications are updated
 */
const NotificationCenter = ({ onNotificationUpdate }) => {
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
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        sx={{ 
          color: GREEN_DARK,
          '&:hover': { backgroundColor: 'rgba(10, 61, 10, 0.08)' }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
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
        PaperProps={{
          sx: { 
            width: 400, 
            maxHeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ p: 2, backgroundColor: GREEN_DARK, color: 'white' }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
            Notifications
          </Typography>
          <Typography variant="body2">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, backgroundColor: '#f5f5f5' }}>
          <Button 
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            sx={{ 
              color: GREEN_DARK,
              '&:hover': { backgroundColor: 'rgba(10, 61, 10, 0.08)' },
              '&.Mui-disabled': { color: 'rgba(10, 61, 10, 0.38)' }
            }}
          >
            Mark all as read
          </Button>
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress size={40} sx={{ color: GREEN_DARK }} />
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
                  borderLeft: notification.read ? 'none' : `4px solid ${GREEN_LIGHT}`,
                  backgroundColor: notification.read ? 'white' : '#f9fbf9'
                }}
              >
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Box>
                      {!notification.read && (
                        <IconButton 
                          edge="end" 
                          aria-label="mark as read"
                          onClick={() => handleMarkAsRead(notification.id)}
                          sx={{ mr: 1 }}
                        >
                          <MarkEmailReadIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ pr: 8 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getNotificationIcon(notification.type, notification.status)}
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'regular' : 'medium' }}>
                          {getNotificationTypeDisplay(notification.type)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
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

export default NotificationCenter;
