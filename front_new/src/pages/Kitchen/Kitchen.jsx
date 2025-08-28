import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Paper,
  TextField,
  Divider,
  Tabs,
  Tab,
  Fab,
  Zoom,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Restaurant as RestaurantIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import kitchenService from '../../services/kitchenService';
import webSocketService from '../../services/websocket';
import './Kitchen.css';

const Kitchen = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  
  // Estados para funcionalidades avançadas
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    branchId: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('priority');
  const [urgentOrders, setUrgentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setSnackbarMessage('Usuário não autenticado. Faça login para acessar a cozinha.');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    // Verificar se o usuário tem permissão para acessar a cozinha
    if (user && !['admin', 'cozinha', 'waiter'].includes(user.role)) {
      setLoading(false);
      setSnackbarMessage('Acesso negado. Você não tem permissão para acessar a cozinha.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Se estiver autenticado e com permissão, carregar dados
    fetchOrders();
    fetchStats();
    fetchUrgentOrders();
    fetchLowStockItems();
    
    // Configurar WebSocket
    console.log('🔌 [Kitchen] Configurando WebSocket...');
    webSocketService.emit('join:room', 'kitchen');
    
    // Event listeners
    const handleOrdersUpdate = (data) => {
      if (data.orders) {
        setOrders(data.orders);
      }
    };
    
    const handleStatusChange = (data) => {
      if (data.orderId && data.newStatus) {
        setOrders(prev => prev.map(order => 
          order.id === data.orderId ? { ...order, status: data.newStatus } : order
        ));
        setSnackbarMessage(`Pedido #${data.orderId} mudou para ${getStatusLabel(data.newStatus)}`);
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      }
    };
    
    const handleNewOrder = (data) => {
      if (data.order && ['pending', 'in_preparation', 'ready'].includes(data.order.status)) {
        setOrders(prev => [data.order, ...prev]);
        setSnackbarMessage(`Novo pedido #${data.order.id} recebido!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    };
    
    webSocketService.on('orders:updated', handleOrdersUpdate);
    webSocketService.on('order:status_changed', handleStatusChange);
    webSocketService.on('order:created', handleNewOrder);
    
    return () => {
      webSocketService.emit('leave:room', 'kitchen');
      webSocketService.off('orders:updated', handleOrdersUpdate);
      webSocketService.off('order:status_changed', handleStatusChange);
      webSocketService.off('order:created', handleNewOrder);
    };
  }, [isAuthenticated, user]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return;
    const interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated]);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await kitchenService.getKitchenOrders({
        status: filterStatus === 'all' ? undefined : filterStatus,
        ...filters
      });
      setOrders(response);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
      setSnackbarMessage('Erro ao carregar pedidos: ' + (err.response?.data?.message || err.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await kitchenService.getKitchenStats();
      setStats(response);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const fetchUrgentOrders = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await kitchenService.getUrgentOrders();
      setUrgentOrders(response);
    } catch (err) {
      console.error('Erro ao carregar pedidos urgentes:', err);
    }
  };

  const fetchLowStockItems = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await kitchenService.getLowStockIngredients();
      setLowStockItems(response);
    } catch (err) {
      console.error('Erro ao carregar itens com estoque baixo:', err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!isAuthenticated) return;
    
    try {
      await kitchenService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (newStatus === 'ready') {
        setTimeout(() => {
          setOrders(prev => prev.filter(order => order.id !== orderId));
        }, 5000);
      }

      setSnackbarMessage(`Status do pedido #${orderId} atualizado para ${getStatusLabel(newStatus)}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      setSnackbarMessage('Erro ao alterar status do pedido: ' + (err.response?.data?.message || err.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleMarkAsReady = async (orderId) => {
    if (!isAuthenticated) return;
    
    try {
      await kitchenService.markOrderAsReady(orderId);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: 'ready' } : order
      ));
      setSnackbarMessage(`Pedido #${orderId} marcado como pronto!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erro ao marcar pedido como pronto:', err);
      setSnackbarMessage('Erro ao marcar pedido como pronto: ' + (err.response?.data?.message || err.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    if (!isAuthenticated) return;
    
    try {
      await kitchenService.markOrderAsDelivered(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setSnackbarMessage(`Pedido #${orderId} marcado como entregue!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erro ao marcar pedido como entregue:', err);
      setSnackbarMessage('Erro ao marcar pedido como entregue: ' + (err.response?.data?.message || err.message));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_preparation': return 'info';
      case 'ready': return 'success';
      case 'served': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_preparation': return 'Em Preparo';
      case 'ready': return 'Pronto';
      case 'served': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPriorityColor = (order) => {
    if (!order.created_at) return 'default';
    
    const now = new Date();
    const orderTime = new Date(order.created_at);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes > 30) return 'error';
    if (diffMinutes > 15) return 'warning';
    return 'success';
  };

  const getTimeElapsed = (order) => {
    if (!order.created_at) return 'N/A';
    
    const now = new Date();
    const orderTime = new Date(order.created_at);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes === 1) return '1 min atrás';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1h atrás';
    return `${diffHours}h atrás`;
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    if (sortBy === 'priority') {
      const statusPriority = { pending: 3, in_preparation: 2, ready: 1 };
      const aPriority = statusPriority[a.status] || 0;
      const bPriority = statusPriority[b.status] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sortBy === 'time') {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }
    return 0;
  });

  const handleApplyFilters = () => {
    fetchOrders();
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      branchId: null
    });
    fetchOrders();
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  // Se não estiver autenticado, mostrar mensagem
  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="warning">
          Usuário não autenticado. Faça login para acessar a cozinha.
        </Alert>
      </Box>
    );
  }

  // Se não tiver permissão, mostrar mensagem
  if (user && !['admin', 'cozinha', 'waiter'].includes(user.role)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">
          Acesso negado. Você não tem permissão para acessar a cozinha.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <KitchenIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Painel da Cozinha
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Controle de produção em tempo real
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center">
          <Chip
            label={`${orders.length} pedidos`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Estatísticas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="warning.main">
                {stats.pending_orders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendentes
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="info.main">
                {stats.preparing_orders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Em Preparo
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="success.main">
                {stats.ready_orders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Prontos
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign="center">
              <Typography variant="h4" color="default">
                {stats.served_orders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entregues
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Chip
            label="Todos"
            color={filterStatus === 'all' ? 'primary' : 'default'}
            onClick={() => setFilterStatus('all')}
            clickable
          />
          <Chip
            label="Pendentes"
            color={filterStatus === 'pending' ? 'warning' : 'default'}
            onClick={() => setFilterStatus('pending')}
            clickable
          />
          <Chip
            label="Em Preparo"
            color={filterStatus === 'in_preparation' ? 'info' : 'default'}
            onClick={() => setFilterStatus('in_preparation')}
            clickable
          />
          <Chip
            label="Prontos"
            color={filterStatus === 'ready' ? 'success' : 'default'}
            onClick={() => setFilterStatus('ready')}
            clickable
          />
        </Box>

        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
          >
            Filtros Avançados
          </Button>

          <Button
            startIcon={<SortIcon />}
            onClick={() => setSortBy(sortBy === 'priority' ? 'time' : 'priority')}
            variant="outlined"
            size="small"
          >
            {sortBy === 'priority' ? 'Prioridade' : 'Tempo'}
          </Button>

          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchOrders}
            variant="outlined"
            size="small"
          >
            Atualizar
          </Button>
        </Box>

        {/* Filtros Avançados */}
        {showFilters && (
          <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Cliente, mesa ou produto..."
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Data Inicial (YYYY-MM-DD)"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  placeholder="2025-01-01"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Data Final (YYYY-MM-DD)"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  placeholder="2025-12-31"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    size="small"
                  >
                    Aplicar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    size="small"
                  >
                    Limpar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Pedidos" icon={<RestaurantIcon />} />
          <Tab label="Urgentes" icon={<WarningIcon />} />
          <Tab label="Estoque Baixo" icon={<InfoIcon />} />
        </Tabs>
      </Paper>

      {/* Conteúdo das Tabs */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {sortedOrders.map((order) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
              <Card 
                sx={{ 
                  border: `2px solid`,
                  borderColor: `${getPriorityColor(order)}.main`,
                  position: 'relative'
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="h2">
                      Pedido #{order.id}
                    </Typography>
                    <Chip
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Mesa:</strong> {order.table_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Cliente:</strong> {order.customer_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Itens:</strong> {order.total_items || 0}
                    </Typography>
                    <Typography variant="body2" color="primary" gutterBottom>
                      <strong>Total:</strong> R$ {typeof order.total_amount === 'number' ? order.total_amount.toFixed(2) : '0.00'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TimerIcon sx={{ fontSize: 16, color: `${getPriorityColor(order)}.main` }} />
                    <Typography variant="caption" color={`${getPriorityColor(order)}.main`}>
                      {getTimeElapsed(order)}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewOrder(order)}
                  >
                    Ver Detalhes
                  </Button>
                  
                  <Box display="flex" gap={1}>
                    {order.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        onClick={() => handleStatusChange(order.id, 'in_preparation')}
                      >
                        Iniciar
                      </Button>
                    )}
                    
                    {order.status === 'in_preparation' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleMarkAsReady(order.id)}
                      >
                        Pronto
                      </Button>
                    )}

                    {order.status === 'ready' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<LocalShippingIcon />}
                        onClick={() => handleMarkAsDelivered(order.id)}
                      >
                        Entregar
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Pedidos Urgentes ({urgentOrders.length})
          </Typography>
          {urgentOrders.map((order) => (
            <Card key={order.id} sx={{ mb: 2, border: '2px solid', borderColor: 'error.main' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      Pedido #{order.id} - {order.table_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {order.customer_name}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      Aguardando há {order.minutes_waiting} minutos
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleStatusChange(order.id, 'in_preparation')}
                  >
                    Iniciar Urgente
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Ingredientes com Estoque Baixo ({lowStockItems.length})
          </Typography>
          {lowStockItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2, border: '2px solid', borderColor: item.stock_level === 'CRÍTICO' ? 'error.main' : 'warning.main' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      {item.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estoque: {item.quantidade_estoque} {item.unidade_medida}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mínimo: {item.quantidade_minima} {item.unidade_medida}
                    </Typography>
                  </Box>
                  <Chip
                    label={item.stock_level}
                    color={item.stock_level === 'CRÍTICO' ? 'error' : 'warning'}
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {sortedOrders.length === 0 && activeTab === 0 && (
        <Box textAlign="center" py={8}>
          <KitchenIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum pedido para preparar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Todos os pedidos foram concluídos!
          </Typography>
        </Box>
      )}

      {/* Modal de Detalhes */}
      <Dialog
        open={orderDetailOpen}
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Pedido #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Mesa: {selectedOrder.table_name || 'N/A'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Cliente: {selectedOrder.customer_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criado: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                
                <Chip
                  label={getStatusLabel(selectedOrder.status)}
                  color={getStatusColor(selectedOrder.status)}
                  size="large"
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Itens do Pedido
              </Typography>
              
              <List>
                {selectedOrder.items?.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">
                              {item.product_name} x{item.quantity}
                            </Typography>
                            <Typography variant="body1" color="primary">
                              R$ {typeof item.total_price === 'number' ? item.total_price.toFixed(2) : '0.00'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          item.modifiers && (
                            <Typography variant="body2" color="text.secondary">
                              + {item.modifiers}
                            </Typography>
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={getStatusLabel(item.item_status)}
                          color={getStatusColor(item.item_status)}
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < selectedOrder.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              <Box textAlign="right" mt={3}>
                <Typography variant="h5" color="primary">
                  Total: R$ {typeof selectedOrder.total_amount === 'number' ? selectedOrder.total_amount.toFixed(2) : '0.00'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseOrderDetail}>Fechar</Button>
          
          {selectedOrder?.status === 'pending' && (
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                handleStatusChange(selectedOrder.id, 'in_preparation');
                handleCloseOrderDetail();
              }}
            >
              Iniciar Preparo
            </Button>
          )}
          
          {selectedOrder?.status === 'in_preparation' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                handleMarkAsReady(selectedOrder.id);
                handleCloseOrderDetail();
              }}
            >
              Marcar como Pronto
            </Button>
          )}

          {selectedOrder?.status === 'ready' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<LocalShippingIcon />}
              onClick={() => {
                handleMarkAsDelivered(selectedOrder.id);
                handleCloseOrderDetail();
              }}
            >
              Marcar como Entregue
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* FAB */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="Ações rápidas"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            fetchOrders();
            fetchStats();
          }}
        >
          <RefreshIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default Kitchen;
