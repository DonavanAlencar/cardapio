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
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Kitchen as KitchenIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import api from '../../services/api';
import webSocketService from '../../services/websocket';
import './Kitchen.css';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  useEffect(() => {
    fetchOrders();
    
    // Configurar WebSocket para atualizações em tempo real
    console.log('🔌 [Kitchen] Configurando WebSocket...');
    
    // Entrar na sala da cozinha
    webSocketService.emit('join:room', 'kitchen');
    
    // Escutar atualizações de pedidos
    const handleOrdersUpdate = (data) => {
      console.log('📡 [WebSocket] Atualização de pedidos recebida:', data);
      if (data.orders) {
        const kitchenOrders = data.orders.filter(order => 
          ['pending', 'preparing', 'ready'].includes(order.status)
        );
        setOrders(kitchenOrders);
      }
    };
    
    // Escutar mudanças de status
    const handleStatusChange = (data) => {
      console.log('📡 [WebSocket] Mudança de status recebida:', data);
      if (data.orderId && data.newStatus) {
        setOrders(prev => prev.map(order => 
          order.id === data.orderId ? { ...order, status: data.newStatus } : order
        ));
        
        // Mostrar notificação
        setSnackbarMessage(`Pedido #${data.orderId} mudou para ${data.newStatus}`);
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
      }
    };
    
    // Escutar novos pedidos
    const handleNewOrder = (data) => {
      console.log('📡 [WebSocket] Novo pedido recebido:', data);
      if (data.order && ['pending', 'preparing', 'ready'].includes(data.order.status)) {
        setOrders(prev => [data.order, ...prev]);
        
        // Mostrar notificação
        setSnackbarMessage(`Novo pedido #${data.order.id} recebido!`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    };
    
    // Registrar listeners
    webSocketService.on('orders:updated', handleOrdersUpdate);
    webSocketService.on('order:status_changed', handleStatusChange);
    webSocketService.on('order:created', handleNewOrder);
    
    // Cleanup function
    return () => {
      console.log('🧹 [Kitchen] Limpando WebSocket...');
      
      // Sair da sala
      webSocketService.emit('leave:room', 'kitchen');
      
      // Remover listeners
      webSocketService.off('orders:updated', handleOrdersUpdate);
      webSocketService.off('order:status_changed', handleStatusChange);
      webSocketService.off('order:created', handleNewOrder);
    };
  }, []); // Removido autoRefresh dependency

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      // Filtrar apenas pedidos relevantes para a cozinha
      const kitchenOrders = response.data.filter(order => 
        ['pending', 'preparing', 'ready'].includes(order.status)
      );
      setOrders(kitchenOrders);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Atualizar estado local
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Se o pedido foi marcado como pronto, remover da lista após 5 segundos
      if (newStatus === 'ready') {
        setTimeout(() => {
          setOrders(prev => prev.filter(order => order.id !== orderId));
        }, 5000);
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status do pedido');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      default: return status;
    }
  };

  const getPriorityColor = (order) => {
    const now = new Date();
    const orderTime = new Date(order.created_at);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes > 30) return 'error';
    if (diffMinutes > 15) return 'warning';
    return 'success';
  };

  const getTimeElapsed = (order) => {
    const now = new Date();
    const orderTime = new Date(order.created_at);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes === 1) return '1 min atrás';
    return `${diffMinutes} min atrás`;
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    // Prioridade por status
    const statusPriority = { pending: 3, preparing: 2, ready: 1 };
    const aPriority = statusPriority[a.status] || 0;
    const bPriority = statusPriority[b.status] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Se mesmo status, ordenar por tempo (mais antigo primeiro)
    return new Date(a.created_at) - new Date(b.created_at);
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <KitchenIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Cozinha
          </Typography>
        </Box>
        
        <Box display="flex" gap={2} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Atualização automática"
          />
          
          <Chip
            label={`${orders.length} pedidos`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
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
            label="Preparando"
            color={filterStatus === 'preparing' ? 'info' : 'default'}
            onClick={() => setFilterStatus('preparing')}
            clickable
          />
          <Chip
            label="Prontos"
            color={filterStatus === 'ready' ? 'success' : 'default'}
            onClick={() => setFilterStatus('ready')}
            clickable
          />
        </Box>
      </Paper>

      {/* Grid de Pedidos */}
      <Grid container spacing={3}>
        {sortedOrders.map((order) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
            <Card 
              sx={{ 
                border: `2px solid`,
                borderColor: getPriorityColor(order) + '.main',
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
                    <strong>Mesa:</strong> {order.table?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Cliente:</strong> {order.customer?.full_name || order.customer_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Itens:</strong> {order.items?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="primary" gutterBottom>
                    <strong>Total:</strong> R$ {order.total_amount?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <TimerIcon sx={{ fontSize: 16, color: getPriorityColor(order) + '.main' }} />
                  <Typography variant="caption" color={getPriorityColor(order) + '.main'}>
                    {getTimeElapsed(order)}
                  </Typography>
                </Box>
                
                {order.notes && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="caption">
                      <strong>Obs:</strong> {order.notes}
                    </Typography>
                  </Alert>
                )}
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
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    >
                      Iniciar
                    </Button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleStatusChange(order.id, 'ready')}
                    >
                      Pronto
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sortedOrders.length === 0 && (
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

      {/* Modal de Detalhes do Pedido */}
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
                    Mesa: {selectedOrder.table?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Cliente: {selectedOrder.customer?.full_name || selectedOrder.customer_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criado: {new Date(selectedOrder.created_at).toLocaleString()}
                  </Typography>
                </Box>
                
                <Chip
                  label={getStatusLabel(selectedOrder.status)}
                  color={getStatusColor(selectedOrder.status)}
                  size="large"
                />
              </Box>
              
              {selectedOrder.notes && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body1">
                    <strong>Observações:</strong> {selectedOrder.notes}
                  </Typography>
                </Alert>
              )}
              
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
                              R$ {item.total_price?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          item.modifiers?.length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              + {item.modifiers.map(m => m.name).join(', ')}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    {index < selectedOrder.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              <Box textAlign="right" mt={3}>
                <Typography variant="h5" color="primary">
                  Total: R$ {selectedOrder.total_amount?.toFixed(2) || '0.00'}
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
                handleStatusChange(selectedOrder.id, 'preparing');
                handleCloseOrderDetail();
              }}
            >
              Iniciar Preparo
            </Button>
          )}
          
          {selectedOrder?.status === 'preparing' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                handleStatusChange(selectedOrder.id, 'ready');
                handleCloseOrderDetail();
              }}
            >
              Marcar como Pronto
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Kitchen;
