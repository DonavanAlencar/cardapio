import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Alert,
  Snackbar,
  Fab,
  Tooltip
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import StockFilters from '../../components/Stock/StockFilters';
import StockStats from '../../components/Stock/StockStats';
import StockItemsList from '../../components/Stock/StockItemsList';
import StockItemDetailModal from '../../components/Stock/StockItemDetailModal';
import stockService from '../../services/stockService';

export default function Stock() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    loadStockData();
  }, [filters, pagination.page, pagination.limit]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [itemsData, statsData] = await Promise.all([
        stockService.listStockItems({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        stockService.getStockStats()
      ]);

      setItems(itemsData.items || []);
      setPagination(prev => ({
        ...prev,
        total: itemsData.pagination?.total || 0,
        pages: itemsData.pagination?.pages || 0
      }));
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error);
      setError('Erro ao carregar dados do estoque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset para primeira página
  };

  const handleClearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (newLimit) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit, 
      page: 1 
    }));
  };

  const handleViewItem = (item) => {
    setSelectedItemId(item.id);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItemId(null);
  };

  const handleRefresh = () => {
    loadStockData();
  };

  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Controle de Estoque
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie o inventário, monitore níveis de estoque e acompanhe movimentações
        </Typography>
      </Box>

      {/* Estatísticas */}
      <StockStats stats={stats} loading={loading} />

      {/* Filtros */}
      <StockFilters
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Lista de Itens */}
      <StockItemsList
        items={items}
        pagination={pagination}
        loading={loading}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onViewItem={handleViewItem}
      />

      {/* Modal de Detalhes */}
      <StockItemDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        itemId={selectedItemId}
      />

      {/* Botão de Atualizar */}
      <Tooltip title="Atualizar dados">
        <Fab
          color="primary"
          size="medium"
          onClick={handleRefresh}
          disabled={loading}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <Refresh />
        </Fab>
      </Tooltip>

      {/* Snackbar de Erro */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
