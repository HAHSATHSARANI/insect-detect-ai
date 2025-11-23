// src/theme/theme.jsx
import { createTheme } from '@mui/material/styles';
import { blue, green, red, grey, amber } from '@mui/material/colors';

// Define custom color palette for charts (array for Recharts)
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B9D'];

// Define color constants for theme
export const COLOR_CONSTANTS = {
    primary: '#10b981',       // Exact green from landing page
    secondary: blue[500],
    error: red[600],
    warning: amber[500],
    background: grey[50],
    textPrimary: grey[900],
    textSecondary: grey[600],
};

// Create MUI theme using COLOR_CONSTANTS
export const theme = createTheme({
    palette: {
        primary: { main: COLOR_CONSTANTS.primary },
        secondary: { main: COLOR_CONSTANTS.secondary },
        error: { main: COLOR_CONSTANTS.error },
        warning: { main: COLOR_CONSTANTS.warning },
        background: { default: COLOR_CONSTANTS.background, paper: '#fff' },
        text: { primary: COLOR_CONSTANTS.textPrimary, secondary: COLOR_CONSTANTS.textSecondary },
    },
    typography: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 500 },
        body1: { fontWeight: 400 },
        body2: { fontWeight: 400 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});
