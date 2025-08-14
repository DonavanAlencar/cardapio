import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useEffect } from 'react';
import api from '../services/api';

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
      const [customersRes, tablesRes, categoriesRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/tables'),
        api.get('/product-categories'),
        api.get('/products')
      ]);
      
      setCustomers(customersRes.data);
      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados do modal:', err);
    }
  };

  const openAddModal = async () => {
    setEditingPedido(null);
    setPedidoForm({ 
      customer_id: '', 
      table_id: '', 
      waiter_session_id: '',
      items: []
    });
    setSelectedCategory('');
    setSelectedProduct(null);
    setSelectedModifiers([]);
    setQuantity(1);
    setTotalAmount(0);
    setModalOpen(true);
    await loadModalData();
  };

  const openEditModal = (pedido) => {
    setEditingPedido(pedido);
    setPedidoForm({
      customer_id: pedido.customer_id || '',
      table_id: pedido.table_id || '',
      waiter_session_id: pedido.waiter_session_id || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPedido(null);
    setPedidoForm({ customer_id: '', table_id: '', waiter_session_id: '', items: [] });
    setSelectedCategory('');
    setSelectedProduct(null);
    setSelectedModifiers([]);
    setQuantity(1);
    setErrors({});
    setIsSubmitting(false);
    setShowCustomerForm(false);
    setNewCustomer({ full_name: '', email: '', phone: '' });
  };

  const handlePedidoFormChange = (e) => {
    const { name, value } = e.target;
    setPedidoForm(prev => ({ ...prev, [name]: value }));
  };

  // Filtrar produtos por categoria
  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    if (categoryId) {
      const filtered = products.filter(p => p.category_id == categoryId && p.status === 'active');
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    setSelectedProduct(null);
  };

  // Carregar modificadores do produto
  const handleProductChange = async (product) => {
    setSelectedProduct(product);
    setSelectedModifiers([]);
    if (product) {
      try {
        const response = await api.get(`/product-modifiers?product_id=${product.id}`);
        setModifiers(response.data);
      } catch (err) {
        setModifiers([]);
      }
    } else {
      setModifiers([]);
    }
  };

  // Adicionar item ao pedido
  const addItemToOrder = () => {
    if (!selectedProduct) return;

    const item = {
      product_id: selectedProduct.id,
      quantity: quantity,
      modifier_ids: selectedModifiers,
      product_name: selectedProduct.name,
      unit_price: selectedProduct.price || 0,
      total_price: (selectedProduct.price || 0) * quantity
    };

    setPedidoForm(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    // Limpar seleções
    setSelectedProduct(null);
    setSelectedModifiers([]);
    setQuantity(1);
    setSelectedCategory('');
    setFilteredProducts([]);
  };

  // Remover item do pedido
  const removeItemFromOrder = (index) => {
    setPedidoForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calcular total do pedido
  const calculateTotal = () => {
    return pedidoForm.items.reduce((total, item) => total + item.total_price, 0);
  };

  // Filtrar pedidos
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesStatus = !statusFilter || pedido.status === statusFilter;
    const matchesCustomer = !customerFilter || 
      customers.find(c => c.id == pedido.customer_id)?.full_name.toLowerCase().includes(customerFilter.toLowerCase());
    return matchesStatus && matchesCustomer;
  });

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};
    
    if (!pedidoForm.customer_id) {
      newErrors.customer_id = 'Cliente é obrigatório';
    }
    
    if (!pedidoForm.table_id) {
      newErrors.table_id = 'Mesa é obrigatória';
    }
    
    if (pedidoForm.items.length === 0) {
      newErrors.items = 'Adicione pelo menos um item ao pedido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar status do pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      alert('Status atualizado com sucesso!');
      fetchPedidos(false);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Criar novo cliente
  const createCustomer = async () => {
    try {
      const response = await api.post('/customers', newCustomer);
      const createdCustomer = response.data;
      
      // Adicionar o novo cliente à lista
      setCustomers(prev => [...prev, createdCustomer]);
      
      // Selecionar o novo cliente automaticamente
      setPedidoForm(prev => ({ ...prev, customer_id: createdCustomer.id }));
      
      // Limpar formulário e fechar
      setNewCustomer({ full_name: '', email: '', phone: '' });
      setShowCustomerForm(false);
      
      alert('Cliente criado com sucesso!');
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      alert('Erro ao criar cliente: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmitPedido = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingPedido) {
        // Atualizar pedido (implementar se necessário)
        console.log('Atualizar pedido:', editingPedido.id);
      } else {
        // Adicionar novo pedido
        const orderData = {
          customer_id: pedidoForm.customer_id,
          table_id: pedidoForm.table_id,
          waiter_session_id: 1, // Temporário
          items: pedidoForm.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            modifiers: item.modifiers || []
          }))
        };
        
        await api.post('/orders', orderData);
        alert('Pedido criado com sucesso!');
      }
      closeModal();
      // Recarregar lista de pedidos
      fetchPedidos(false);
    } catch (err) {
      console.error('Erro ao salvar pedido:', err);
      alert('Erro ao salvar pedido: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Carregando pedidos...</p>;
  if (error) return <p>Erro ao carregar pedidos: {error.message}</p>;
  if (!pedidos.length) {
    console.log('Nenhum pedido encontrado. Estado pedidos:', pedidos);
    return <p>Nenhum pedido encontrado.</p>;
  }

  return (
    <Box className="container mx-auto p-4">
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Gerenciar Pedidos
      </Typography>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <Typography variant="h6" color="primary">Total de Pedidos</Typography>
          <Typography variant="h4" className="font-bold">{pedidos.length}</Typography>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border">
          <Typography variant="h6" color="warning.main">Pendentes</Typography>
          <Typography variant="h4" className="font-bold text-yellow-600">
            {pedidos.filter(p => p.status === 'pending').length}
          </Typography>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border">
          <Typography variant="h6" color="success.main">Prontos</Typography>
          <Typography variant="h4" className="font-bold text-green-600">
            {pedidos.filter(p => p.status === 'ready').length}
          </Typography>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border">
          <Typography variant="h6" color="secondary">Valor Total</Typography>
          <Typography variant="h4" className="font-bold text-purple-600">
            R$ {pedidos.reduce((total, p) => total + parseFloat(p.total_amount || 0), 0).toFixed(2)}
          </Typography>
        </div>
      </div>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Button variant="contained" color="primary" onClick={openAddModal}>
            Adicionar Pedido
          </Button>
          <div className="flex items-center gap-4">
            <Button 
              variant="outlined" 
              onClick={() => fetchPedidos(false)}
              disabled={loading}
            >
              Atualizar
            </Button>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              Auto-atualizar
            </label>
            {lastUpdate && (
              <span className="text-xs text-gray-500">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>
        </div>
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Filtrar por Cliente"
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            placeholder="Digite o nome do cliente..."
            size="small"
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Filtrar por Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filtrar por Status"
            >
              <MenuItem value="">Todos os Status</MenuItem>
              <MenuItem value="pending">Pendente</MenuItem>
              <MenuItem value="preparing">Em Preparo</MenuItem>
              <MenuItem value="ready">Pronto</MenuItem>
              <MenuItem value="delivered">Entregue</MenuItem>
              <MenuItem value="cancelled">Cancelado</MenuItem>
              <MenuItem value="closed">Fechado</MenuItem>
              <MenuItem value="open">Aberto</MenuItem>
            </Select>
          </FormControl>
          <div className="flex items-center gap-2">
            <Typography variant="body2" color="textSecondary">
              {filteredPedidos.length} de {pedidos.length} pedidos
            </Typography>
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>{editingPedido ? 'Editar Pedido' : 'Adicionar Pedido'}</DialogTitle>
        <form onSubmit={handleSubmitPedido}>
          <DialogContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Cliente */}
              <div>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => `${option.full_name}${option.email ? ` (${option.email})` : ''}`}
                  value={customers.find(c => c.id == pedidoForm.customer_id) || null}
                  onChange={(event, newValue) => {
                    setPedidoForm(prev => ({ ...prev, customer_id: newValue?.id || '' }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente"
                      placeholder="Selecione ou digite para buscar..."
                      error={!!errors.customer_id}
                      helperText={errors.customer_id}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <div>
                        <Typography variant="body1">{option.full_name}</Typography>
                        {option.email && (
                          <Typography variant="caption" color="textSecondary">
                            {option.email}
                          </Typography>
                        )}
                      </div>
                    </Box>
                  )}
                />
                <Button
                  size="small"
                  onClick={() => setShowCustomerForm(!showCustomerForm)}
                  className="mt-2"
                >
                  {showCustomerForm ? 'Cancelar' : '+ Novo Cliente'}
                </Button>
              </div>

              {/* Formulário de Novo Cliente */}
              {showCustomerForm && (
                <div className="col-span-2 p-4 border rounded bg-gray-50">
                  <Typography variant="subtitle1" className="mb-3">Novo Cliente</Typography>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <TextField
                      label="Nome Completo"
                      value={newCustomer.full_name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, full_name: e.target.value }))}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      fullWidth
                    />
                    <TextField
                      label="Telefone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      fullWidth
                    />
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="contained"
                      onClick={createCustomer}
                      disabled={!newCustomer.full_name}
                      size="small"
                    >
                      Criar Cliente
                    </Button>
                  </div>
                </div>
              )}

              {/* Mesa */}
              <FormControl fullWidth error={!!errors.table_id}>
                <InputLabel>Mesa</InputLabel>
                <Select
                  value={pedidoForm.table_id}
                  onChange={handlePedidoFormChange}
                  name="table_id"
                  label="Mesa"
                >
                  <MenuItem value="">
                    <em>Selecione uma mesa</em>
                  </MenuItem>
                  {tables.map((table) => (
                    <MenuItem key={table.id} value={table.id}>
                      {table.table_number} (Capacidade: {table.capacity})
                    </MenuItem>
                  ))}
                </Select>
                {errors.table_id && (
                  <FormHelperText>{errors.table_id}</FormHelperText>
                )}
              </FormControl>

              {/* Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={pedidoForm.status}
                  onChange={handlePedidoFormChange}
                  name="status"
                  label="Status"
                >
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="preparing">Em Preparo</MenuItem>
                  <MenuItem value="ready">Pronto</MenuItem>
                  <MenuItem value="delivered">Entregue</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Seleção de Produtos */}
            <Typography variant="h6" className="mb-4">Produtos do Pedido</Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Categoria */}
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Categoria"
                >
                  <MenuItem value="">
                    <em>Selecione uma categoria</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Produto */}
              <FormControl fullWidth>
                <InputLabel>Produto</InputLabel>
                <Select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = filteredProducts.find(p => p.id == e.target.value);
                    handleProductChange(product);
                  }}
                  label="Produto"
                  disabled={!selectedCategory}
                >
                  <MenuItem value="">
                    <em>Selecione um produto</em>
                  </MenuItem>
                  {filteredProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.price || 0}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Quantidade */}
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1 }}
                  sx={{ width: 80 }}
                />
                <IconButton 
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </div>

            {/* Modificadores */}
            {modifiers.length > 0 && (
              <div className="mb-4">
                <Typography variant="subtitle1" className="mb-2">Modificadores:</Typography>
                <div className="flex flex-wrap gap-2">
                  {modifiers.map((modifier) => (
                    <Chip
                      key={modifier.id}
                      label={`${modifier.nome} (${modifier.ajuste_preco >= 0 ? '+' : ''}R$ ${modifier.ajuste_preco})`}
                      onClick={() => {
                        setSelectedModifiers(prev => 
                          prev.includes(modifier.id)
                            ? prev.filter(id => id !== modifier.id)
                            : [...prev, modifier.id]
                        );
                      }}
                      color={selectedModifiers.includes(modifier.id) ? "primary" : "default"}
                      variant={selectedModifiers.includes(modifier.id) ? "filled" : "outlined"}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Botão Adicionar Item */}
            <Button
              variant="outlined"
              onClick={addItemToOrder}
              disabled={!selectedProduct}
              className="mb-4"
            >
              Adicionar ao Pedido
            </Button>

            {/* Lista de Itens do Pedido */}
            {pedidoForm.items.length > 0 && (
              <div className="mb-4">
                <Typography variant="subtitle1" className="mb-2">Itens do Pedido:</Typography>
                <div className="space-y-2">
                  {pedidoForm.items.map((item, index) => (
                    <Box key={index} className="flex justify-between items-center p-3 border rounded bg-gray-50">
                      <div className="flex-1">
                        <Typography variant="body1" className="font-medium">
                          {item.product_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Qtd: {item.quantity} x R$ {item.unit_price.toFixed(2)}
                        </Typography>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="mt-1">
                            <Typography variant="caption" color="textSecondary">
                              Modificadores: {item.modifiers.join(', ')}
                            </Typography>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Typography variant="body1" className="font-semibold text-green-600">
                          R$ {item.total_price.toFixed(2)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => removeItemFromOrder(index)}
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </div>
                    </Box>
                  ))}
                </div>
                
                {/* Total */}
                <Box className="mt-4 p-3 bg-gray-100 rounded">
                  <Typography variant="h6" align="right">
                    Total: R$ {calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              type="submit" 
              color="primary" 
              variant="contained" 
              disabled={pedidoForm.items.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (editingPedido ? 'Atualizar Pedido' : 'Criar Pedido')}
            </Button>
            <Button onClick={closeModal} color="secondary" variant="outlined" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Mesa
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 border-b border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pedido.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(() => {
                    const customer = customers.find(c => c.id == pedido.customer_id);
                    return customer ? customer.full_name : '-';
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {pedido.table_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  R$ {parseFloat(pedido.total_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    const statusConfig = {
                      'pending': { text: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
                      'preparing': { text: 'Em Preparo', color: 'bg-blue-100 text-blue-800' },
                      'ready': { text: 'Pronto', color: 'bg-green-100 text-green-800' },
                      'delivered': { text: 'Entregue', color: 'bg-gray-100 text-gray-800' },
                      'cancelled': { text: 'Cancelado', color: 'bg-red-100 text-red-800' },
                      'closed': { text: 'Fechado', color: 'bg-gray-100 text-gray-800' },
                      'open': { text: 'Aberto', color: 'bg-blue-100 text-blue-800' }
                    };
                    const config = statusConfig[pedido.status] || { text: pedido.status || '-', color: 'bg-gray-100 text-gray-800' };
                    return (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.color}`}>
                        {config.text}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(pedido.created_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => openEditModal(pedido)}
                    >
                      Editar
                    </Button>
                    {pedido.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => updateOrderStatus(pedido.id, 'preparing')}
                      >
                        Preparar
                      </Button>
                    )}
                    {pedido.status === 'preparing' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => updateOrderStatus(pedido.id, 'ready')}
                      >
                        Pronto
                      </Button>
                    )}
                    {pedido.status === 'ready' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => updateOrderStatus(pedido.id, 'delivered')}
                      >
                        Entregar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default AdminPedidos; 