import { createTheme } from '@mui/material/styles';

// ESG Framework Color Palette
export const ESG_COLORS = {
  // Navbar Colors
  navbar: {
    background: {
      white: '#FFFFFF', // Clean White (Minimalist, Corporate Look)
      green: '#F1FDF6', // Soft Green Tint (Branded Feel)
      gradient: 'linear-gradient(90deg, #A8E063, #56AB2F)', // Gradient Banner (Visually Rich)
    },
    text: {
      primary: '#212121', // Primary Text/Icon Color
      hover: '#388E3C', // Hover State
      active: '#4CAF50', // Active Link
    },
    border: '#E0E0E0', // Light gray bottom border
    dropdown: {
      background: '#FFFFFF', // Dropdown Background
      hoverItem: '#E8F5E9', // Hover/Focus Item Background
    },
  },
  // Primary Colors (Brand Identity)
  primary: {
    main: '#4CAF50', // Leaf Green
    dark: '#2E7D32', // Deep Green
    gradient: 'linear-gradient(90deg, #A8E063, #56AB2F)', // Eco Gradient
  },
  
  // Secondary Colors (Supportive Visuals)
  secondary: {
    blue: '#03A9F4', // Sky Blue
    brown: '#795548', // Earth Brown
    beige: '#EFE9DC', // Soil Beige
  },
  
  // Backgrounds & Surfaces
  background: {
    default: '#FFFFFF', // White
    paper: '#F5F5F5', // Light Gray
    border: '#E0E0E0', // Medium Gray
  },
  
  // Text Colors
  text: {
    primary: '#212121', // Dark Charcoal
    secondary: '#616161', // Slate Gray
    link: '#388E3C', // ESG Green
  },
  
  // Alerts & Status Colors
  status: {
    success: '#4CAF50', // Green
    warning: '#FFC107', // Amber
    error: '#F44336', // Red
    info: '#2196F3', // Light Blue
  },

  // Match the original structure expected by components
  environment: '#4CAF50', // Green
  social: '#03A9F4', // Blue
  governance: '#FFC107', // Yellow
  brand: {
    dark: '#2E7D32', // Deep Green (brand primary)
    light: '#A8E063' // Light Green (brand secondary)
  },
  
  // ESG Component Colors - New structure for future use
  esg: {
    environment: '#4CAF50', // Green
    social: '#03A9F4', // Blue
    governance: '#FFC107', // Yellow
  }
};

// Create a theme instance with the ESG color palette
const esgTheme = createTheme({
  palette: {
    primary: {
      main: ESG_COLORS.primary.main,
      dark: ESG_COLORS.primary.dark,
    },
    secondary: {
      main: ESG_COLORS.secondary.blue,
    },
    text: {
      primary: ESG_COLORS.text.primary,
      secondary: ESG_COLORS.text.secondary,
    },
    background: {
      default: ESG_COLORS.background.default,
      paper: ESG_COLORS.background.paper,
    },
    error: {
      main: ESG_COLORS.status.error,
    },
    warning: {
      main: ESG_COLORS.status.warning,
    },
    info: {
      main: ESG_COLORS.status.info,
    },
    success: {
      main: ESG_COLORS.status.success,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      color: ESG_COLORS.text.primary,
    },
    h2: {
      fontWeight: 500,
      color: ESG_COLORS.text.primary,
    },
    h3: {
      fontWeight: 500,
      color: ESG_COLORS.text.primary,
    },
    h4: {
      fontWeight: 500,
      color: ESG_COLORS.text.primary,
    },
    h5: {
      fontWeight: 500,
      color: ESG_COLORS.text.primary,
    },
    h6: {
      fontWeight: 500,
      color: ESG_COLORS.text.primary,
    },
    subtitle1: {
      color: ESG_COLORS.text.secondary,
    },
    subtitle2: {
      color: ESG_COLORS.text.secondary,
    },
    body1: {
      color: ESG_COLORS.text.primary,
    },
    body2: {
      color: ESG_COLORS.text.secondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        containedPrimary: {
          background: ESG_COLORS.primary.gradient,
          '&:hover': {
            background: ESG_COLORS.primary.gradient,
            filter: 'brightness(0.95)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
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
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: ESG_COLORS.background.border,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: ESG_COLORS.text.link,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
});

export default esgTheme;
