import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: { main: '#00A896' },
    secondary: { main: '#028090' },
    success: { main: '#02C39A' },
    warning: { main: '#F0A500' },
    error: { main: '#E63946' },
    background: { default: '#F7F9FC', paper: '#FFFFFF' },
    text: { primary: '#1A1A2E', secondary: '#6B7280' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.5rem', color: '#1A1A2E' },
    h6: { fontWeight: 600, fontSize: '1.1rem', color: '#1A1A2E' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
    caption: { fontSize: '0.7rem', color: '#6B7280' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)', borderRadius: 16, border: '1px solid #F0F0F0' }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10, padding: '8px 20px' }
      }
    },
  }
});
