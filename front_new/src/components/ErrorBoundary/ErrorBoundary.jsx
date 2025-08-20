import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log do erro para debugging
    console.error('🚨 Erro capturado pelo ErrorBoundary:', error);
    console.error('🚨 Stack trace:', errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 4,
            textAlign: 'center'
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h5" color="error" gutterBottom>
            Algo deu errado
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Ocorreu um erro inesperado ao renderizar esta página.
          </Typography>

          {this.state.error && (
            <Alert severity="error" sx={{ mb: 2, maxWidth: 600, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Detalhes do erro:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', overflow: 'auto' }}>
                {this.state.error.toString()}
              </Typography>
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={this.handleReload}
              color="primary"
            >
              Recarregar Página
            </Button>
            
            <Button
              variant="outlined"
              onClick={this.handleGoBack}
            >
              Voltar
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            Se o problema persistir, entre em contato com o suporte técnico.
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
