import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import api from '../../services/api';

const GarcomPedido = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (pedidoId) {
      fetchOrder();
    }
    fetchProducts();
  }, [pedidoId]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${pedidoId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Erro ao carregar pedido:', err);
      alert('Erro ao carregar pedido');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes, modifiersRes] = await Promise.all([
        api.get('/products'),
        api.get('/product-categories'),
        api.get('/product-modifiers')
      ]);
      
      setProducts(productsRes.data.filter(p => p.is_active));
      setCategories(categoriesRes.data);
      setModifiers(modifiersRes.data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: quantity,
      unit_price: selectedProduct.price,
      modifiers: selectedModifiers,
      total_price: (selectedProduct.price + selectedModifiers.reduce((sum, m) => sum + m.price, 0)) * quantity
    };

    setOrder(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    // Reset form
    setSelectedProduct(null);
    setQuantity(1);
    setSelectedModifiers([]);
    setModalOpen(false);
  };

  const handleRemoveItem = (index) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveOrder = async () => {
    if (!order.items || order.items.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        ...order,
        total_amount: order.items.reduce((sum, item) => sum + item.total_price, 0)
      };

      await api.put(`/orders/${order.id}`, orderData);
      alert('Pedido salvo com sucesso!');
      navigate('/garcom/mesas');
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro ao salvar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModifierToggle = (modifier) => {
    setSelectedModifiers(prev => {
      const exists = prev.find(m => m.id === modifier.id);
      if (exists) {
        return prev.filter(m => m.id !== modifier.id);
      } else {
        return [...prev, modifier];
      }
    });
  };

  const getTotalAmount = () => {
    return order?.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Pedido não encontrado
        </Typography>
        <Button onClick={() => navigate('/garcom/mesas')}>
          Voltar para Mesas
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/garcom/mesas')}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Pedido #{order.id}
        </Typography>
        <Chip
          label={order.status === 'pending' ? 'Pendente' : 'Em Preparo'}
          color={order.status === 'pending' ? 'warning' : 'info'}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Informações do Pedido */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Pedido
            </Typography>
            
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>Mesa:</strong> {order.table?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Cliente:</strong> {order.customer?.full_name || order.customer_name || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Data:</strong> {new Date(order.created_at).toLocaleString()}
              </Typography>
            </Box>

            {order.notes && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Observações:</strong> {order.notes}
                </Typography>
              </Alert>
            )}

            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                fullWidth
              >
                Adicionar Item
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Itens do Pedido */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Itens do Pedido
            </Typography>

            {order.items && order.items.length > 0 ? (
              <List>
                {order.items.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1">
                              {item.product_name} x{item.quantity}
                            </Typography>
                            <Typography variant="body1" color="primary" fontWeight="bold">
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
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remover
                      </Button>
                    </ListItem>
                    {index < order.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <RestaurantIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Nenhum item no pedido
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clique em "Adicionar Item" para começar
                </Typography>
              </Box>
            )}

            {order.items && order.items.length > 0 && (
              <Box mt={3} textAlign="right">
                <Typography variant="h5" color="primary" gutterBottom>
                  Total: R$ {getTotalAmount().toFixed(2)}
                </Typography>
                
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveOrder}
                  disabled={isSubmitting}
                  size="large"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Pedido'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Modal para Adicionar Item */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Adicionar Item ao Pedido
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedProduct?.category_id || ''}
                onChange={(e) => {
                  setSelectedProduct(null);
                  setSelectedModifiers([]);
                }}
                label="Categoria"
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Produto</InputLabel>
              <Select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = products.find(p => p.id === e.target.value);
                  setSelectedProduct(product);
                  setSelectedModifiers([]);
                }}
                label="Produto"
              >
                {products
                  .filter(p => !selectedProduct?.category_id || p.category_id === selectedProduct.category_id)
                  .map(product => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toFixed(2)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedProduct && (
              <>
                <TextField
                  label="Quantidade"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  fullWidth
                  inputProps={{ min: 1 }}
                />

                {modifiers.filter(m => m.product_id === selectedProduct.id).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Modificadores disponíveis:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {modifiers.filter(m => m.product_id === selectedProduct.id).map(modifier => (
                        <Chip
                          key={modifier.id}
                          label={`${modifier.name} (+R$ ${modifier.price.toFixed(2)})`}
                          onClick={() => handleModifierToggle(modifier)}
                          color={selectedModifiers.find(m => m.id === modifier.id) ? 'primary' : 'default'}
                          clickable
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <Box p={2} bgcolor="grey.100" borderRadius={1}>
                  <Typography variant="body2">
                    <strong>Subtotal:</strong> R$ {((selectedProduct.price + selectedModifiers.reduce((sum, m) => sum + m.price, 0)) * quantity).toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={!selectedProduct || quantity <= 0}
          >
            Adicionar ao Pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GarcomPedido;
