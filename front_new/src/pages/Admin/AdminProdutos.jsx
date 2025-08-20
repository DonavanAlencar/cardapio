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
  IconButton,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../services/api';

const AdminProdutos = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_active: true,
    preparation_time: '',
    image_url: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/product-categories')
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category_id: product.category_id || '',
        is_active: product.is_active,
        preparation_time: product.preparation_time?.toString() || '',
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category_id: '',
        is_active: true,
        preparation_time: '',
        image_url: ''
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category_id: '',
      is_active: true,
      preparation_time: '',
      image_url: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!productForm.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }
    
    if (!productForm.category_id) {
      newErrors.category_id = 'Categoria é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        preparation_time: productForm.preparation_time ? parseInt(productForm.preparation_time) : null
      };
      
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, productData);
      } else {
        await api.post('/products', productData);
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
      await api.delete(`/products/${productId}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir produto');
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await api.patch(`/products/${productId}`, { is_active: !currentStatus });
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status do produto');
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
          Gestão de Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Produto
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Tempo de Preparo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                    )}
                    {product.name}
                  </Box>
                </TableCell>
                <TableCell>
                  {product.description || '-'}
                </TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.category_id)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  R$ {product.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  {product.preparation_time ? `${product.preparation_time} min` : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'Ativo' : 'Inativo'}
                    color={product.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(product)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Switch
                      checked={product.is_active}
                      onChange={() => handleToggleActive(product.id, product.is_active)}
                      size="small"
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Produto */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome do Produto"
              value={productForm.name}
              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />
            
            <TextField
              label="Descrição"
              value={productForm.description}
              onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            
            <Box display="flex" gap={2}>
              <TextField
                label="Preço"
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                error={!!errors.price}
                helperText={errors.price}
                fullWidth
                required
                InputProps={{
                  startAdornment: <span>R$</span>
                }}
              />
              
              <TextField
                label="Tempo de Preparo (min)"
                type="number"
                value={productForm.preparation_time}
                onChange={(e) => setProductForm(prev => ({ ...prev, preparation_time: e.target.value }))}
                fullWidth
              />
            </Box>
            
            <FormControl fullWidth error={!!errors.category_id}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={productForm.category_id}
                onChange={(e) => setProductForm(prev => ({ ...prev, category_id: e.target.value }))}
                label="Categoria"
                required
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category_id && (
                <FormHelperText>{errors.category_id}</FormHelperText>
              )}
            </FormControl>
            
            <TextField
              label="URL da Imagem"
              value={productForm.image_url}
              onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
              fullWidth
              placeholder="https://exemplo.com/imagem.jpg"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Produto Ativo"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProdutos;
