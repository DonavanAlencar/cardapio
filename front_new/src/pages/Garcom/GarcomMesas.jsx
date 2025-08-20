import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import AddIcon from '@mui/icons-material/Add';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import api from '../../services/api';

const GarcomMesas = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: '',
    customer_phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
    // Atualização automática a cada 30 segundos
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Erro ao carregar mesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    if (table.status === 'occupied') {
      // Se a mesa está ocupada, navega para o pedido existente
      navigate(`/garcom/pedido/${table.current_order_id}`);
    } else {
      // Se a mesa está livre, abre modal para criar novo pedido
      setSelectedTable(table);
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTable(null);
    setNewOrderForm({
      customer_name: '',
      customer_phone: '',
      notes: ''
    });
  };

  const handleCreateOrder = async () => {
    if (!newOrderForm.customer_name.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        table_id: selectedTable.id,
        customer_name: newOrderForm.customer_name,
        customer_phone: newOrderForm.customer_phone,
        notes: newOrderForm.notes,
        status: 'pending',
        items: []
      };

      const response = await api.post('/orders', orderData);
      
      // Atualizar status da mesa
      await api.patch(`/tables/${selectedTable.id}`, { 
        status: 'occupied',
        current_order_id: response.data.id
      });

      handleCloseModal();
      fetchTables();
      
      // Navegar para o pedido criado
      navigate(`/garcom/pedido/${response.data.id}`);
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      alert('Erro ao criar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTableStatusColor = (status) => {
    switch (status) {
      case 'free': return 'success';
      case 'occupied': return 'warning';
      case 'reserved': return 'info';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  const getTableStatusLabel = (status) => {
    switch (status) {
      case 'free': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  const getTableIcon = (table) => {
    if (table.status === 'occupied') {
      return <RestaurantIcon sx={{ fontSize: 40, color: 'warning.main' }} />;
    }
    return <TableRestaurantIcon sx={{ fontSize: 40, color: 'success.main' }} />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestão de Mesas - Garçom
      </Typography>

      <Grid container spacing={3}>
        {tables.map((table) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleTableClick(table)}
            >
              <CardContent sx={{ textAlign: 'center', pb: 1 }}>
                {getTableIcon(table)}
                <Typography variant="h6" component="h2" sx={{ mt: 1 }}>
                  Mesa {table.name}
                </Typography>
                <Chip
                  label={getTableStatusLabel(table.status)}
                  color={getTableStatusColor(table.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
                
                {table.status === 'occupied' && table.current_order && (
                  <Box mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {table.current_order.customer_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Itens: {table.current_order.items?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      R$ {table.current_order.total_amount?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                <Button
                  size="small"
                  variant={table.status === 'occupied' ? 'outlined' : 'contained'}
                  startIcon={table.status === 'occupied' ? <RestaurantIcon /> : <AddIcon />}
                >
                  {table.status === 'occupied' ? 'Ver Pedido' : 'Novo Pedido'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal para criar novo pedido */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Novo Pedido - Mesa {selectedTable?.name}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome do Cliente"
              value={newOrderForm.customer_name}
              onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
              fullWidth
              required
            />
            
            <TextField
              label="Telefone do Cliente"
              value={newOrderForm.customer_phone}
              onChange={(e) => setNewOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
              fullWidth
              placeholder="(11) 99999-9999"
            />
            
            <TextField
              label="Observações"
              value={newOrderForm.notes}
              onChange={(e) => setNewOrderForm(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              placeholder="Ex: Sem cebola, bem passado, etc."
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            disabled={isSubmitting || !newOrderForm.customer_name.trim()}
          >
            {isSubmitting ? 'Criando...' : 'Criar Pedido'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GarcomMesas;
