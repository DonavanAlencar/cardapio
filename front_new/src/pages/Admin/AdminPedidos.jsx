import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import api from '../../services/api';

// Função utilitária para formatar valores monetários de forma segura
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

// Função utilitária para formatar data de forma segura
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
  } catch (error) {
    return 'N/A';
  }
};

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [pedidoForm, setPedidoForm] = useState({ 
    customer_id: '', 
    table_id: '', 
    waiter_session_id: '',
    status: 'pending',
    items: []
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Estados para o modal
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Estados para criação de cliente
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ full_name: '', email: '', phone: '' });
  
  // Estados para validação
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  useEffect(() => {
    const fetchPedidos = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        const response = await api.get('/orders');
        console.log('📊 Dados recebidos da API:', response.data);
        console.log('📊 Estrutura do primeiro pedido:', response.data[0]);
        setPedidos(response.data);
        setError(null); // Limpa erros anteriores
        setLastUpdate(new Date());
      } catch (err) {
        setError(err);
        console.error('Erro ao buscar pedidos:', err);
        console.error('Detalhes do erro:', err.response?.data);
        console.error('Status do erro:', err.response?.status);
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    // Primeira carga com loading
    fetchPedidos(true);
    
    // Atualizações automáticas sem loading (a cada 10 segundos)
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => fetchPedidos(false), 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Carregar dados para o modal
  const loadModalData = async () => {
    try {
      const [customersRes, tablesRes, categoriesRes, productsRes, modifiersRes] = await Promise.all([
        api.get('/customers'),
        api.get('/tables'),
        api.get('/product-categories'),
        api.get('/products'),
        api.get('/product-modifiers')
      ]);
      
      setCustomers(customersRes.data);
      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setModifiers(modifiersRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados do modal:', err);
      alert('Erro ao carregar dados necessários');
    }
  };

  const handleOpenModal = async (pedido = null) => {
    if (pedido) {
      setEditingPedido(pedido);
      setPedidoForm({
        customer_id: pedido.customer_id || '',
        table_id: pedido.table_id || '',
        waiter_session_id: pedido.waiter_session_id || '',
        status: pedido.status || 'pending',
        items: pedido.items || []
      });
    } else {
      setEditingPedido(null);
      setPedidoForm({
        customer_id: '',
        table_id: '',
        waiter_session_id: '',
        status: 'pending',
        items: []
      });
    }
    
    await loadModalData();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPedido(null);
    setPedidoForm({
      customer_id: '',
      table_id: '',
      waiter_session_id: '',
      status: 'pending',
      items: []
    });
    setErrors({});
    setSelectedCategory('');
    setFilteredProducts([]);
    setSelectedProduct(null);
    setSelectedModifiers([]);
    setQuantity(1);
    setTotalAmount(0);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      const filtered = products.filter(p => p.category_id === categoryId);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    setSelectedProduct(null);
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    setQuantity(1);
    calculateTotal();
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

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    
    let total = selectedProduct.price * quantity;
    selectedModifiers.forEach(modifier => {
      total += modifier.price * quantity;
    });
    
    setTotalAmount(total);
    return total;
  };

  const addItemToOrder = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: quantity,
      unit_price: selectedProduct.price,
      modifiers: selectedModifiers,
      total_price: totalAmount
    };
    
    setPedidoForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    // Reset form
    setSelectedProduct(null);
    setSelectedModifiers([]);
    setQuantity(1);
    setTotalAmount(0);
  };

  const removeItemFromOrder = (index) => {
    setPedidoForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (pedidoForm.items.length === 0) {
      alert('Adicione pelo menos um item ao pedido');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingPedido) {
        await api.put(`/orders/${editingPedido.id}`, pedidoForm);
      } else {
        await api.post('/orders', pedidoForm);
      }
      
      handleCloseModal();
      // Recarregar pedidos
      const response = await api.get('/orders');
      setPedidos(response.data);
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro ao salvar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (pedidoId, newStatus) => {
    try {
      await api.patch(`/orders/${pedidoId}/status`, { status: newStatus });
      
      // Atualizar estado local
      setPedidos(prev => prev.map(p => 
        p.id === pedidoId ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status do pedido');
    }
  };

  const handleDeletePedido = async (pedidoId) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    
    try {
      await api.delete(`/orders/${pedidoId}`);
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
      alert('Erro ao excluir pedido');
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    if (statusFilter && pedido.status !== statusFilter) return false;
    if (customerFilter && !pedido.customer?.full_name?.toLowerCase().includes(customerFilter.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status) => {
    // Deve retornar uma das cores suportadas pelo prop `color` do Chip
    // Valores válidos: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
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
        <Typography variant="h4" component="h1">
          Gestão de Pedidos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Pedido
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendente</MenuItem>
              <MenuItem value="preparing">Preparando</MenuItem>
              <MenuItem value="ready">Pronto</MenuItem>
              <MenuItem value="delivered">Entregue</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Buscar por cliente"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
            }
            label="Atualização automática"
          />
          
          {lastUpdate && (
            <Typography variant="body2" color="text.secondary">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Tabela de Pedidos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Mesa</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Itens</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell>{pedido.customer?.full_name || 'N/A'}</TableCell>
                <TableCell>{pedido.table?.name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(pedido.status)}
                    color={getStatusColor(pedido.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{pedido.items?.length || 0} itens</TableCell>
                <TableCell>R$ {formatCurrency(pedido.total_amount)}</TableCell>
                <TableCell>
                  {formatDate(pedido.created_at)}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      onClick={() => handleOpenModal(pedido)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeletePedido(pedido.id)}
                    >
                      Excluir
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Pedido */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPedido ? 'Editar Pedido' : 'Novo Pedido'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mb={3}>
            <FormControl fullWidth>
              <InputLabel>Cliente</InputLabel>
              <Select
                value={pedidoForm.customer_id}
                onChange={(e) => setPedidoForm(prev => ({ ...prev, customer_id: e.target.value }))}
                label="Cliente"
              >
                {customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Mesa</InputLabel>
              <Select
                value={pedidoForm.table_id}
                onChange={(e) => setPedidoForm(prev => ({ ...prev, table_id: e.target.value }))}
                label="Mesa"
              >
                {tables.map(table => (
                  <MenuItem key={table.id} value={table.id}>
                    {table.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={pedidoForm.status}
                onChange={(e) => setPedidoForm(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="preparing">Preparando</MenuItem>
                <MenuItem value="ready">Pronto</MenuItem>
                <MenuItem value="delivered">Entregue</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Seleção de Produtos */}
          <Typography variant="h6" gutterBottom>
            Adicionar Itens
          </Typography>
          
          <Box display="flex" gap={2} mb={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                label="Categoria"
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Autocomplete
              options={filteredProducts}
              getOptionLabel={(option) => option.name}
              value={selectedProduct}
              onChange={(_, newValue) => handleProductSelect(newValue)}
              renderInput={(params) => <TextField {...params} label="Produto" />}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              type="number"
              label="Quantidade"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              sx={{ width: 100 }}
            />
            
            <Button
              variant="contained"
              onClick={addItemToOrder}
              disabled={!selectedProduct || quantity <= 0}
            >
              Adicionar
            </Button>
          </Box>

          {/* Modificadores */}
          {selectedProduct && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Modificadores disponíveis:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {modifiers.filter(m => m.product_id === selectedProduct.id).map(modifier => (
                  <Chip
                    key={modifier.id}
                    label={`${modifier.name} (+R$ ${formatCurrency(modifier.price)})`}
                    onClick={() => handleModifierToggle(modifier)}
                    color={selectedModifiers.find(m => m.id === modifier.id) ? 'primary' : 'default'}
                    clickable
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Itens do Pedido */}
          <Typography variant="h6" gutterBottom>
            Itens do Pedido
          </Typography>
          
          {pedidoForm.items.map((item, index) => (
            <Box key={index} display="flex" justifyContent="space-between" alignItems="center" p={1} border={1} borderColor="grey.300" borderRadius={1} mb={1}>
              <Box>
                <Typography variant="subtitle2">
                  {item.product_name} x{item.quantity}
                </Typography>
                {item.modifiers.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    + {item.modifiers.map(m => m.name).join(', ')}
                  </Typography>
                )}
                <Typography variant="body2" color="primary">
                  R$ {formatCurrency(item.total_price)}
                </Typography>
              </Box>
              <IconButton
                color="error"
                onClick={() => removeItemFromOrder(index)}
              >
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}

          {pedidoForm.items.length > 0 && (
            <Box textAlign="right" mt={2}>
              <Typography variant="h6">
                Total: R$ {formatCurrency(pedidoForm.items.reduce((sum, item) => sum + (typeof item.total_price === 'number' ? item.total_price : 0), 0))}
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || pedidoForm.items.length === 0}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPedidos;
