import { createTheme } from '@mui/material';

// ---------------------------------------------------------------------------
// Paleta central do CondoPro: neutros (cinza/branco) + UMA cor de destaque.
// Antes: teal/roxo/amarelo competindo em cada card.
// Agora: um accent só (azul); verde/amarelo/vermelho ficam reservados
// para status (pago/pendente/atrasado), nunca decoração.
// ---------------------------------------------------------------------------
export const theme = createTheme({
  palette: {
    primary: { main: '#2563EB' },       // accent único do sistema
    secondary: { main: '#6B7280' },     // cinza médio, ações secundárias
    success: { main: '#16A34A' },
    warning: { main: '#D97706' },
    error: { main: '#DC2626' },
    background: { default: '#F9FAFB', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    divider: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.5rem', color: '#111827' },
    h6: { fontWeight: 600, fontSize: '1.1rem', color: '#111827' },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
    caption: { fontSize: '0.7rem', color: '#6B7280' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',            // antes tinha sombra; flat fica mais "profissional"
          borderRadius: 12,
          border: '1px solid #E5E7EB',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '8px 20px',
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
  },
});