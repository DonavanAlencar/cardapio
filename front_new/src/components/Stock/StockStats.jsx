import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip
} from '@mui/material';
import {
  Inventory,
  Warning,
  Error,
  CheckCircle,
  TrendingUp
} from '@mui/icons-material';

export default function StockStats({ stats, loading }) {
  if (loading) {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      ...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Carregando...
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.3 }}>
                    <Inventory />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      title: 'Total de Itens',
      value: stats.total_items || 0,
      icon: <Inventory color="primary" />,
      color: 'primary.main'
    },
    {
      title: 'Estoque Baixo',
      value: stats.low_stock || 0,
      icon: <Warning color="warning" />,
      color: 'warning.main'
    },
    {
      title: 'Sem Estoque',
      value: stats.out_of_stock || 0,
      icon: <Error color="error" />,
      color: 'error.main'
    },
    {
      title: 'Itens Ativos',
      value: stats.active_items || 0,
      icon: <CheckCircle color="success" />,
      color: 'success.main'
    }
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: item.color
                    }}
                  >
                    {item.value.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.title}
                  </Typography>
                </Box>
                <Box>
                  {item.icon}
                </Box>
              </Box>
              
              {item.title === 'Estoque Baixo' && stats.low_stock > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${stats.low_stock} itens precisam de atenção`}
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
              
              {item.title === 'Sem Estoque' && stats.out_of_stock > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${stats.out_of_stock} itens críticos`}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
