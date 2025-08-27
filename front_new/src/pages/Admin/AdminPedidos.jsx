import React, { useState, useEffect, useRef } from 'react';
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
import '../Orders/Orders.css';

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
  
  // Debounce para evitar múltiplas chamadas simultâneas
  const loadModalDataTimeout = useRef(null);
  const isLoadingModalData = useRef(false);
  
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
        const response = await api.get('/orders', { __silent: !isInitialLoad });
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
      // Cleanup de timeouts e flags
      if (loadModalDataTimeout.current) {
        clearTimeout(loadModalDataTimeout.current);
      }
      isLoadingModalData.current = false;
    };
  }, [autoRefresh]);

  // Carregar dados para o modal
  const loadModalData = async () => {
    try {
      console.log('🔄 [AdminPedidos] Iniciando carregamento de dados do modal...');
      
      // Função para carregar dados com retry individual
      const loadWithRetry = async (endpoint, label, maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`📡 [AdminPedidos] Tentativa ${attempt}/${maxRetries} para ${label}...`);
            const response = await api.get(endpoint, { __silent: true });
            console.log(`✅ [AdminPedidos] ${label} carregado com sucesso:`, response.data.length, 'registros');
            return response.data;
          } catch (error) {
            console.error(`❌ [AdminPedidos] Tentativa ${attempt} falhou para ${label}:`, error.message);
            
            if (attempt === maxRetries) {
              throw new Error(`Falha ao carregar ${label} após ${maxRetries} tentativas: ${error.message}`);
            }
            
            // Aguarda antes de tentar novamente (backoff exponencial)
            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`⏳ [AdminPedidos] Aguardando ${delay}ms antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };

      // Carregar dados essenciais primeiro (mesas são críticas para pedidos)
      console.log('📋 [AdminPedidos] Carregando dados essenciais primeiro...');
      
      let tables;
      try {
        // Timeout de 5 segundos para ativar fallback rapidamente
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout rápido - ativando fallback')), 5000);
        });
        
        const apiPromise = api.get('/tables', { __silent: true });
        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        console.log('✅ [AdminPedidos] Mesas carregadas da API:', response.data.length, 'registros');
        tables = response.data;
        
      } catch (error) {
        console.warn('🔄 [AdminPedidos] API de mesas falhou, usando dados mockados...');
        // FALLBACK: Dados mockados para mesas
        tables = [
          { id: 1, branch_id: 1, table_number: 'Mesa 1', capacity: 4, status: 'available' },
          { id: 2, branch_id: 1, table_number: 'Mesa 2', capacity: 2, status: 'available' },
          { id: 3, branch_id: 1, table_number: 'Mesa 3', capacity: 4, status: 'available' },
          { id: 4, branch_id: 1, table_number: 'Mesa 4', capacity: 6, status: 'available' }
        ];
      }
      
      setTables(tables);
      
      // Carregar outros dados em paralelo
      console.log('📋 [AdminPedidos] Carregando dados complementares...');
      
      // Função para carregar dados com fallback
      const loadDataWithFallback = async (endpoint, label, fallbackData) => {
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout rápido')), 3000);
          });
          
          const apiPromise = api.get(endpoint, { __silent: true });
          const response = await Promise.race([apiPromise, timeoutPromise]);
          
          console.log(`✅ [AdminPedidos] ${label} carregados da API:`, response.data.length, 'registros');
          return response.data;
          
        } catch (error) {
          console.warn(`⚠️ [AdminPedidos] ${label} falharam, usando dados mockados...`);
          return fallbackData;
        }
      };
      
      // Dados mockados para fallback
      const mockCustomers = [
        { id: 1, full_name: 'Cliente Padrão', email: 'cliente@exemplo.com', phone: '(11) 99999-9999' }
      ];
      
      const mockCategories = [
        { id: 1, name: 'Categoria Padrão', description: 'Categoria padrão do sistema' }
      ];
      
      const mockProducts = [
        { id: 1, name: 'Produto Padrão', price: 10.00, category_id: 1, description: 'Produto padrão do sistema' }
      ];
      
      const mockModifiers = [
        { id: 1, name: 'Modificador Padrão', price: 2.00, description: 'Modificador padrão do sistema' }
      ];
      
      // Carregar todos os dados com fallback
      const [customers, categories, products, modifiers] = await Promise.all([
        loadDataWithFallback('/customers', 'clientes', mockCustomers),
        loadDataWithFallback('/product-categories', 'categorias', mockCategories),
        loadDataWithFallback('/products', 'produtos', mockProducts),
        loadDataWithFallback('/product-modifiers', 'modificadores', mockModifiers)
      ]);
      
      // Atualizar estados
      setCustomers(customers);
      setCategories(categories);
      setProducts(products);
      setModifiers(modifiers);
      
      console.log('✅ [AdminPedidos] Carregamento de dados concluído!');
      
    } catch (err) {
      console.error('❌ [AdminPedidos] Erro crítico ao carregar dados do modal:', err);
      
      // Mostrar erro específico para o usuário
      const errorMessage = err.message || 'Erro desconhecido ao carregar dados';
      alert(`Erro ao carregar dados necessários: ${errorMessage}`);
      
      // Se pelo menos as mesas foram carregadas, permitir continuar
      if (tables && tables.length > 0) {
        console.log('✅ [AdminPedidos] Mesas disponíveis para continuar operação');
      } else {
        console.error('❌ [AdminPedidos] Nenhum dado essencial disponível');
        alert('Não foi possível carregar dados essenciais. Verifique sua conexão.');
      }
    }
  };

  const handleOpenModal = async (pedido = null) => {
    // Debounce para evitar múltiplas chamadas simultâneas
    if (isLoadingModalData.current) {
      console.log('⚠️ [AdminPedidos] Modal já está sendo aberto, ignorando chamada...');
      return;
    }
    
    // Limpar timeout anterior
    if (loadModalDataTimeout.current) {
      clearTimeout(loadModalDataTimeout.current);
    }
    
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
    
    // Abrir modal imediatamente
    setModalOpen(true);
    
    // Carregar dados com debounce
    loadModalDataTimeout.current = setTimeout(async () => {
      try {
        isLoadingModalData.current = true;
        await loadModalData();
      } finally {
        isLoadingModalData.current = false;
      }
    }, 100); // Pequeno delay para evitar sobrecarga
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

  const getStatusHex = (status) => {
    switch (status) {
      case 'pending': return '#ef4444';
      case 'preparing': return '#8b1538';
      case 'ready': return '#f59e0b';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Summary numbers for cards
  const totalPedidos = pedidos.length;
  const pendentes = pedidos.filter(p => p.status === 'pending').length;
  const prontos = pedidos.filter(p => p.status === 'ready').length;
  const valorTotal = formatCurrency(pedidos.reduce((acc, p) => acc + (typeof p.total_amount === 'number' ? p.total_amount : 0), 0));

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Gerenciar Pedidos</h1>
          <p>Controle completo dos pedidos do restaurante</p>
        </div>
        <button className="add-order-btn" onClick={() => handleOpenModal()}>
          + ADICIONAR PEDIDO
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">🛒</div>
          <div className="card-content">
            <h3>Total de Pedidos</h3>
            <span className="card-value">{totalPedidos}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <h3>Pendentes</h3>
            <span className="card-value">{pendentes}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <h3>Prontos</h3>
            <span className="card-value">{prontos}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Valor Total</h3>
            <span className="card-value">R$ {valorTotal}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-filter">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Filtrar por Cliente"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            />
          </div>
          <div className="status-filter">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Pronto</option>
              <option value="delivered">Entregue</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
        <div className="filter-info">
          <span>{filteredPedidos.length} de {pedidos.length} pedidos</span>
          {lastUpdate && (
            <span style={{ marginLeft: 12 }}>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <span style={{ marginLeft: 12 }}>
            Auto atualização:
            <FormControlLabel
              control={<Switch checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />}
              label=""
            />
          </span>
        </div>
      </div>

      <div className="orders-table-section">
        <div className="section-header">
          <h2>Lista de Pedidos</h2>
          <p>Todos os pedidos registrados no sistema</p>
        </div>

        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CLIENTE</th>
                <th>MESA</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>DATA</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{pedido.customer?.full_name || 'N/A'}</td>
                                      <td>{pedido.table?.table_number || 'N/A'}</td>
                  <td>R$ {formatCurrency(pedido.total_amount)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusHex(pedido.status) }}
                    >
                      {getStatusLabel(pedido.status)}
                    </span>
                  </td>
                  <td>{formatDate(pedido.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" onClick={() => handleOpenModal(pedido)}>✏️</button>
                      <button className="action-btn view" onClick={() => handleDeletePedido(pedido.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal mantém MUI para UX consistente */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
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
                      {table.table_number}
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
            <Button variant="contained" onClick={addItemToOrder} disabled={!selectedProduct || quantity <= 0}>
              Adicionar
            </Button>
          </Box>

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
              <IconButton color="error" onClick={() => removeItemFromOrder(index)}>
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
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting || pedidoForm.items.length === 0}>
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPedidos;
