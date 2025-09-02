import React from 'react';
import { Chip } from '@mui/material';
import { 
  CheckCircle as AvailableIcon,
  Warning as LowStockIcon,
  Cancel as OutOfStockIcon
} from '@mui/icons-material';

/**
 * Componente Badge para mostrar status de estoque
 * Reutiliza o padrão de cores e estilos do projeto
 */
const StockBadge = ({ 
  stockStatus, 
  availableStock = 0, 
  minimumStock = 0,
  showQuantity = false,
  size = 'small',
  variant = 'outlined'
}) => {
  const getStockConfig = () => {
    if (stockStatus === 'out_of_stock' || availableStock <= 0) {
      return {
        label: 'Sem estoque',
        color: 'error',
        icon: <OutOfStockIcon fontSize="inherit" />,
        variant: 'filled'
      };
    }
    
    if (stockStatus === 'low_stock' || availableStock <= minimumStock) {
      return {
        label: showQuantity ? `Estoque baixo (${availableStock})` : 'Estoque baixo',
        color: 'warning',
        icon: <LowStockIcon fontSize="inherit" />,
        variant: 'filled'
      };
    }
    
    return {
      label: showQuantity ? `Disponível (${availableStock})` : 'Disponível',
      color: 'success',
      icon: <AvailableIcon fontSize="inherit" />,
      variant: 'outlined'
    };
  };

  const config = getStockConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      variant={config.variant}
      sx={{
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: '0.875rem'
        }
      }}
    />
  );
};

export default StockBadge;
