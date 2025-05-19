import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Menu,
  MenuItem,
  ListItemIcon, 
  ListItemText,
  Drawer,
  List,
  ListItemButton,
  Collapse,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
// Import ESG colors from theme
import { ESG_COLORS } from '../theme/esgTheme';

const AdminNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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

  return (
    <>
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
          {/* Left - Empty space */}
          <Box sx={{ width: 48 }} />
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
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* No Sidebar */}
      <Toolbar /> {/* Empty toolbar to push content below the AppBar */}
    </>
  );
};

export default AdminNavigation;
