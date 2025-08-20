import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#8b1538', contrastText: '#fefefe' },
    secondary: { main: '#d4af37', contrastText: '#2d1b1e' },
    background: { default: '#fefefe', paper: '#ffffff' },
    text: { primary: '#2d1b1e', secondary: '#6b5b5e' }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 700 },
    body1: { fontSize: '1rem' }
  },
  shape: { borderRadius: 12 },
  shadows: Array(25).fill('0px 2px 8px rgba(0,0,0,0.05)')
});

export default theme;
