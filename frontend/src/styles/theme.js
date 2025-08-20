import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7C3AED' },
    secondary: { main: '#06B6D4' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569' }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 }
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 12, paddingInline: 16, paddingBlock: 10 } }
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 6px 24px rgba(2, 6, 23, 0.08)' } }
    },
    MuiAppBar: { styleOverrides: { root: { background: '#0F172A' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } }
  }
});

export default theme;
