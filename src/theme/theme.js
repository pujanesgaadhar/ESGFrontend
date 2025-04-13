import { createTheme } from '@mui/material/styles';

// Define ESGAadhar theme colors based on the logo - soothing to the eye
const theme = createTheme({
  palette: {
    primary: {
      main: '#0A3D0A', // Dark forest green from logo
      light: '#2E7D32', // Lighter green for hover states
      dark: '#052505', // Darker green for pressed states
      contrastText: '#FFFFFF', // White text on primary color
    },
    secondary: {
      main: '#558B2F', // Olive green from logo
      light: '#7CB342',
      dark: '#33691E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#4CAF50', // Softer green for success
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#D7816A', // Softer terracotta for error/deny actions
      light: '#E0A79A',
      dark: '#BD5D4A',
    },
    warning: {
      main: '#F9A825', // Softer amber for warnings
      light: '#FFD54F',
      dark: '#F57F17',
    },
    info: {
      main: '#5C9EAD', // Teal blue for information
      light: '#81B9C3',
      dark: '#407D89',
    },
    background: {
      default: '#F8F9F6', // Very light sage
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E2D', // Softer dark green for primary text
      secondary: '#5F7161', // Muted sage for secondary text
      disabled: 'rgba(44, 62, 45, 0.38)',
    },
    divider: 'rgba(44, 62, 45, 0.12)',
    // Chart colors - soothing palette
    chart: {
      environmental: '#5F9EA0', // Cadet blue
      social: '#B08968', // Soft brown
      governance: '#7D9D7F', // Sage green
      environmentalLight: '#B4D6D9',
      socialLight: '#D9C4B1',
      governanceLight: '#B5C9B7',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontWeight: 600,
      color: '#2C3E2D',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 600,
      color: '#2C3E2D',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      color: '#2C3E2D',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      color: '#2C3E2D',
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      color: '#2C3E2D',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      color: '#2C3E2D',
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      color: '#2C3E2D',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      color: '#5F7161',
      letterSpacing: '0.01em',
    },
    body1: {
      color: '#2C3E2D',
      lineHeight: 1.6,
    },
    body2: {
      color: '#5F7161',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 8, // Slightly rounded corners
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A3D0A',
          color: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          height: 64,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          color: '#0A3D0A',
          borderRight: '1px solid rgba(10, 61, 10, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        containedPrimary: {
          backgroundColor: '#0A3D0A',
          '&:hover': {
            backgroundColor: '#0F4D0F',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
        containedSecondary: {
          backgroundColor: '#558B2F',
          '&:hover': {
            backgroundColor: '#33691E',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
        outlined: {
          borderColor: '#0A3D0A',
          color: '#0A3D0A',
          '&:hover': {
            backgroundColor: 'rgba(10, 61, 10, 0.04)',
          },
        },
        text: {
          color: '#0A3D0A',
          '&:hover': {
            backgroundColor: 'rgba(10, 61, 10, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(46, 125, 50, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            color: '#2C3E2D',
            fontWeight: 600,
            backgroundColor: 'rgba(95, 158, 173, 0.08)', // Very light teal
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(44, 62, 45, 0.08)',
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontSize: '0.875rem',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
