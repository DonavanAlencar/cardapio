import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Skeleton
} from '@mui/material';
import {
  Visibility,
  TrendingUp,
  TrendingDown,
  Warning
} from '@mui/icons-material';

export default function StockItemsList({ 
  items, 
  pagination, 
  loading, 
  onPageChange, 
  onRowsPerPageChange,
  onViewItem 
}) {
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'baixo':
        return 'error';
      case 'ok':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status, saldo, minimo) => {
    if (status === 'baixo') {
      return saldo === 0 ? <Warning color="error" /> : <TrendingDown color="warning" />;
    }
    return <TrendingUp color="success" />;
  };

  const formatQuantity = (quantity, unit) => {
    if (quantity === 0) return '0';
    return `${quantity} ${unit}`;
  };

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell>Mínimo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((item) => (
                <TableRow key={item}>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={120} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nenhum item encontrado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tente ajustar os filtros ou adicionar novos itens ao estoque.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Unidade</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Localização</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Saldo Disponível</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mínimo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {item.sku}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {item.nome}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip 
                    label={item.categoria} 
                    size="small" 
                    variant="outlined"
                    color="primary"
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.unidade}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.localizacao}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: item.saldo_disponivel <= item.minimo ? 'error.main' : 'text.primary'
                    }}
                  >
                    {formatQuantity(item.saldo_disponivel, item.unidade)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatQuantity(item.minimo, item.unidade)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(item.status, item.saldo_disponivel, item.minimo)}
                    <Chip
                      label={item.status === 'baixo' ? 'Baixo' : 'OK'}
                      size="small"
                      color={getStatusColor(item.status)}
                      variant={item.status === 'baixo' ? 'filled' : 'outlined'}
                    />
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Tooltip title="Ver detalhes">
                    <IconButton
                      size="small"
                      onClick={() => onViewItem(item)}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page - 1}
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}
    </Paper>
  );
}
