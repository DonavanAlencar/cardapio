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
  Switch,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import api from '../../services/api';

const AdminIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    description: '',
    unit: '',
    current_stock: '',
    min_stock: '',
    cost_per_unit: '',
    supplier: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (err) {
      console.error('Erro ao carregar ingredientes:', err);
      alert('Erro ao carregar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (ingredient = null) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setIngredientForm({
        name: ingredient.name,
        description: ingredient.description || '',
        unit: ingredient.unit || '',
        current_stock: ingredient.current_stock?.toString() || '',
        min_stock: ingredient.min_stock?.toString() || '',
        cost_per_unit: ingredient.cost_per_unit?.toString() || '',
        supplier: ingredient.supplier || '',
        is_active: ingredient.is_active
      });
    } else {
      setEditingIngredient(null);
      setIngredientForm({
        name: '',
        description: '',
        unit: '',
        current_stock: '',
        min_stock: '',
        cost_per_unit: '',
        supplier: '',
        is_active: true
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingIngredient(null);
    setIngredientForm({
      name: '',
      description: '',
      unit: '',
      current_stock: '',
      min_stock: '',
      cost_per_unit: '',
      supplier: '',
      is_active: true
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!ingredientForm.name.trim()) {
      newErrors.name = 'Nome do ingrediente é obrigatório';
    }
    
    if (!ingredientForm.unit.trim()) {
      newErrors.unit = 'Unidade é obrigatória';
    }
    
    if (ingredientForm.current_stock && parseFloat(ingredientForm.current_stock) < 0) {
      newErrors.current_stock = 'Estoque atual não pode ser negativo';
    }
    
    if (ingredientForm.min_stock && parseFloat(ingredientForm.min_stock) < 0) {
      newErrors.min_stock = 'Estoque mínimo não pode ser negativo';
    }
    
    if (ingredientForm.cost_per_unit && parseFloat(ingredientForm.cost_per_unit) < 0) {
      newErrors.cost_per_unit = 'Custo por unidade não pode ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const ingredientData = {
        ...ingredientForm,
        current_stock: ingredientForm.current_stock ? parseFloat(ingredientForm.current_stock) : 0,
        min_stock: ingredientForm.min_stock ? parseFloat(ingredientForm.min_stock) : 0,
        cost_per_unit: ingredientForm.cost_per_unit ? parseFloat(ingredientForm.cost_per_unit) : 0
      };
      
      if (editingIngredient) {
        await api.put(`/ingredients/${editingIngredient.id}`, ingredientData);
      } else {
        await api.post('/ingredients', ingredientData);
      }
      
      handleCloseModal();
      fetchIngredients();
    } catch (err) {
      console.error('Erro ao salvar ingrediente:', err);
      alert('Erro ao salvar ingrediente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIngredient = async (ingredientId) => {
    if (!confirm('Tem certeza que deseja excluir este ingrediente?')) return;
    
    try {
      await api.delete(`/ingredients/${ingredientId}`);
      fetchIngredients();
    } catch (err) {
      console.error('Erro ao excluir ingrediente:', err);
      alert('Erro ao excluir ingrediente');
    }
  };

  const getStockStatus = (current, min) => {
    if (!current || !min) return 'normal';
    if (parseFloat(current) <= parseFloat(min)) return 'low';
    if (parseFloat(current) <= parseFloat(min) * 1.5) return 'warning';
    return 'normal';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'low': return 'error';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  const getStockStatusLabel = (status) => {
    switch (status) {
      case 'low': return 'Baixo';
      case 'warning': return 'Atenção';
      default: return 'Normal';
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
          Gestão de Ingredientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Ingrediente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell>Estoque Atual</TableCell>
              <TableCell>Estoque Mínimo</TableCell>
              <TableCell>Custo/Unidade</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((ingredient) => {
              const stockStatus = getStockStatus(ingredient.current_stock, ingredient.min_stock);
              return (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RestaurantIcon sx={{ color: 'primary.main' }} />
                      {ingredient.name}
                    </Box>
                  </TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {ingredient.current_stock || 0} {ingredient.unit}
                    </Typography>
                  </TableCell>
                  <TableCell>{ingredient.min_stock || 0} {ingredient.unit}</TableCell>
                  <TableCell>
                    {ingredient.cost_per_unit ? `R$ ${ingredient.cost_per_unit.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>{ingredient.supplier || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStockStatusLabel(stockStatus)}
                      color={getStockStatusColor(stockStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(ingredient)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteIngredient(ingredient.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Ingrediente */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome do Ingrediente"
              value={ingredientForm.name}
              onChange={(e) => setIngredientForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              placeholder="Ex: Farinha de Trigo, Tomate, etc."
            />
            
            <TextField
              label="Descrição"
              value={ingredientForm.description}
              onChange={(e) => setIngredientForm(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              placeholder="Descrição do ingrediente"
            />
            
            <Box display="flex" gap={2}>
              <TextField
                label="Unidade"
                value={ingredientForm.unit}
                onChange={(e) => setIngredientForm(prev => ({ ...prev, unit: e.target.value }))}
                error={!!errors.unit}
                helperText={errors.unit}
                fullWidth
                required
                placeholder="Ex: kg, g, l, ml, un"
              />
              
              <TextField
                label="Fornecedor"
                value={ingredientForm.supplier}
                onChange={(e) => setIngredientForm(prev => ({ ...prev, supplier: e.target.value }))}
                fullWidth
                placeholder="Nome do fornecedor"
              />
            </Box>
            
            <Box display="flex" gap={2}>
              <TextField
                label="Estoque Atual"
                type="number"
                value={ingredientForm.current_stock}
                onChange={(e) => setIngredientForm(prev => ({ ...prev, current_stock: e.target.value }))}
                error={!!errors.current_stock}
                helperText={errors.current_stock}
                fullWidth
                placeholder="0"
              />
              
              <TextField
                label="Estoque Mínimo"
                type="number"
                value={ingredientForm.min_stock}
                onChange={(e) => setIngredientForm(prev => ({ ...prev, min_stock: e.target.value }))}
                error={!!errors.min_stock}
                helperText={errors.min_stock}
                fullWidth
                placeholder="0"
              />
            </Box>
            
            <TextField
              label="Custo por Unidade"
              type="number"
              value={ingredientForm.cost_per_unit}
              onChange={(e) => setIngredientForm(prev => ({ ...prev, cost_per_unit: e.target.value }))}
              error={!!errors.cost_per_unit}
              helperText={errors.cost_per_unit}
              fullWidth
              InputProps={{
                startAdornment: <span>R$</span>
              }}
              placeholder="0.00"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={ingredientForm.is_active}
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Ingrediente Ativo"
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

export default AdminIngredients;
