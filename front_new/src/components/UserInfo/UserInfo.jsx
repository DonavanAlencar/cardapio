import React from 'react';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../hooks/useAuth';

const UserInfo = ({ showAvatar = true, showRole = true, variant = 'default' }) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'waiter':
        return 'primary';
      case 'cozinha':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'waiter':
        return 'Garçom';
      case 'cozinha':
        return 'Cozinha';
      default:
        return role;
    }
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showAvatar && (
          <Avatar sx={{ width: 32, height: 32 }}>
            <PersonIcon />
          </Avatar>
        )}
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {user.name || user.email}
          </Typography>
          {showRole && (
            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role)}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {showAvatar && (
        <Avatar sx={{ width: 40, height: 40 }}>
          <PersonIcon />
        </Avatar>
      )}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          {user.name || user.email}
        </Typography>
        {showRole && (
          <Chip
            label={getRoleLabel(user.role)}
            color={getRoleColor(user.role)}
            size="small"
          />
        )}
      </Box>
    </Box>
  );
};

export default UserInfo;
