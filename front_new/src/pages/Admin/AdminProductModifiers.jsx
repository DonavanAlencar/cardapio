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
  IconButton,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../../services/api';

const AdminProductModifiers = () => {
  const [modifiers, setModifiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModifier, setEditingModifier] = useState(null);
  const [modifierForm, setModifierForm] = useState({
    name: '',
    price: '',
    product_id: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modifiersRes, productsRes] = await Promise.all([
        api.get('/product-modifiers'),
        api.get('/products')
      ]);
      
      setModifiers(modifiersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (modifier = null) => {
    if (modifier) {
      setEditingModifier(modifier);
      setModifierForm({
        name: modifier.name,
        price: modifier.price?.toString() || '',
        product_id: modifier.product_id || '',
        is_active: modifier.is_active
      });
    } else {
      setEditingModifier(null);
      setModifierForm({
        name: '',
        price: '',
        product_id: '',
        is_active: true
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingModifier(null);
    setModifierForm({
      name: '',
      price: '',
      product_id: '',
      is_active: true
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!modifierForm.name.trim()) {
      newErrors.name = 'Nome do modificador é obrigatório';
    }
    
    if (!modifierForm.price || parseFloat(modifierForm.price) < 0) {
      newErrors.price = 'Preço deve ser maior ou igual a zero';
    }
    
    if (!modifierForm.product_id) {
      newErrors.product_id = 'Produto é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const modifierData = {
        ...modifierForm,
        price: parseFloat(modifierForm.price)
      };
      
      if (editingModifier) {
        await api.put(`/product-modifiers/${editingModifier.id}`, modifierData);
      } else {
        await api.post('/product-modifiers', modifierData);
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar modificador:', err);
      alert('Erro ao salvar modificador');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModifier = async (modifierId) => {
    if (!confirm('Tem certeza que deseja excluir este modificador?')) return;
    
    try {
      await api.delete(`/product-modifiers/${modifierId}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir modificador:', err);
      alert('Erro ao excluir modificador');
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'N/A';
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
          Gestão de Modificadores de Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Modificador
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modifiers.map((modifier) => (
              <TableRow key={modifier.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SettingsIcon sx={{ color: 'primary.main' }} />
                    {modifier.name}
                  </Box>
                </TableCell>
                <TableCell>{getProductName(modifier.product_id)}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    R$ {modifier.price?.toFixed(2) || '0.00'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={modifier.is_active ? 'Ativo' : 'Inativo'}
                    color={modifier.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(modifier)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteModifier(modifier.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Modificador */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingModifier ? 'Editar Modificador' : 'Novo Modificador'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome do Modificador"
              value={modifierForm.name}
              onChange={(e) => setModifierForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              placeholder="Ex: Sem cebola, Bem passado, etc."
            />
            
            <FormControl fullWidth error={!!errors.product_id}>
              <InputLabel>Produto</InputLabel>
              <Select
                value={modifierForm.product_id}
                onChange={(e) => setModifierForm(prev => ({ ...prev, product_id: e.target.value }))}
                label="Produto"
                required
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Preço Adicional"
              type="number"
              value={modifierForm.price}
              onChange={(e) => setModifierForm(prev => ({ ...prev, price: e.target.value }))}
              error={!!errors.price}
              helperText={errors.price}
              fullWidth
              required
              InputProps={{
                startAdornment: <span>R$</span>
              }}
              placeholder="0.00"
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

export default AdminProductModifiers;
