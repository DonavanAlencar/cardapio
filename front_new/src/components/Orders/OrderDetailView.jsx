import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import api from '../../services/api';

// Função utilitária para formatar valores monetários
const formatCurrency = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  }
  return '0.00';
};

// Função utilitária para formatar data
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('pt-BR');
  } catch (error) {
    return 'N/A';
  }
};

const OrderDetailView = ({ open, onClose, orderId, onOrderUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingNote, setAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/orders/${orderId}/detailed`);
      setOrder(response.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes do pedido:', err);
      setError('Erro ao carregar detalhes do pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await api.post(`/orders/${orderId}/notes`, {
        note: newNote.trim(),
        type: noteType
      });
      
      setNewNote('');
      setNoteType('general');
      setAddingNote(false);
      
      // Recarregar detalhes do pedido
      await fetchOrderDetails();
      
      // Notificar componente pai sobre a atualização
      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Erro ao adicionar observação:', err);
      alert('Erro ao adicionar observação');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'delivered': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getNoteTypeLabel = (type) => {
    switch (type) {
      case 'general': return 'Geral';
      case 'status_change': return 'Mudança de Status';
      case 'kitchen': return 'Cozinha';
      case 'waiter': return 'Garçom';
      case 'customer': return 'Cliente';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
          <Box mt={2} display="flex" justifyContent="center">
            <Button onClick={fetchOrderDetails} variant="contained">
              Tentar Novamente
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Detalhes do Pedido #{order.id}
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              label={getStatusLabel(order.status)} 
              color={getStatusColor(order.status)}
              variant="outlined"
            />
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box>
          {/* Informações Básicas */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Informações do Pedido</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Cliente:</strong> {order.customer_name || 'N/A'}
                </Typography>
                {order.customer_email && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {order.customer_email}
                  </Typography>
                )}
                {order.customer_phone && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Telefone:</strong> {order.customer_phone}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Mesa:</strong> {order.table_number || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Data:</strong> {formatDate(order.created_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total:</strong> R$ {formatCurrency(order.total_amount)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Observações */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Observações</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setAddingNote(!addingNote)}
                variant="outlined"
                size="small"
              >
                Adicionar Observação
              </Button>
            </Box>
            
            {addingNote && (
              <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Observação"
                      placeholder="Digite sua observação..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Tipo"
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      variant="outlined"
                    >
                      <option value="general">Geral</option>
                      <option value="kitchen">Cozinha</option>
                      <option value="waiter">Garçom</option>
                      <option value="customer">Cliente</option>
                    </TextField>
                  </Grid>
                </Grid>
                <Box mt={2} display="flex" gap={1}>
                  <Button
                    onClick={handleAddNote}
                    variant="contained"
                    size="small"
                    disabled={!newNote.trim()}
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      setAddingNote(false);
                      setNewNote('');
                      setNoteType('general');
                    }}
                    variant="outlined"
                    size="small"
                  >
                    Cancelar
                  </Button>
                </Box>
              </Box>
            )}

            {order.notes && order.notes.length > 0 ? (
              order.notes.map((note, index) => (
                <Box key={index} mb={1} p={1} bgcolor="grey.100" borderRadius={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <NoteIcon fontSize="small" color="action" />
                    <Chip
                      label={getNoteTypeLabel(note.type)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2">
                    {note.note}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Por: {note.created_by_name || 'Sistema'} em {formatDate(note.created_at)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                Nenhuma observação registrada
              </Typography>
            )}
          </Paper>

          {/* Itens do Pedido */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Itens do Pedido</Typography>
            {order.items && order.items.map((item, index) => (
              <Box key={index} p={2} border={1} borderColor="grey.300" borderRadius={1} mb={1}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.product_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categoria: {item.category_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantidade: {item.quantity} x R$ {formatCurrency(item.unit_price)}
                    </Typography>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Modificadores:</strong>
                        </Typography>
                        {item.modifiers.map((modifier, modIndex) => (
                          <Chip
                            key={modIndex}
                            label={`${modifier.nome} (${modifier.tipo})`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h6" color="primary">
                    R$ {formatCurrency(item.total_price)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Histórico de Status */}
          {order.status_history && order.status_history.length > 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Histórico de Status</Typography>
              {order.status_history.map((status, index) => (
                <Box key={index} p={1} mb={1}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {status.status}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enviado: {formatDate(status.sent_at)} | Criado: {formatDate(status.created_at)}
                  </Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailView;
