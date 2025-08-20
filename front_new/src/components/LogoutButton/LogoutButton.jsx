import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../hooks/useAuth';

const LogoutButton = ({ variant = 'icon', size = 'medium', color = 'inherit' }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  if (variant === 'icon') {
    return (
      <Tooltip title="Sair">
        <IconButton
          onClick={handleLogout}
          color={color}
          size={size}
          aria-label="Sair da aplicação"
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outlined"
      color={color}
      size={size}
      startIcon={<LogoutIcon />}
    >
      Sair
    </Button>
  );
};

export default LogoutButton;
