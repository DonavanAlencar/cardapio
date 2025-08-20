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
import InventoryIcon from '@mui/icons-material/Inventory';
import api from '../../services/api';

const AdminStockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState(null);
  const [movementForm, setMovementForm] = useState({
    product_id: '',
    type: 'in',
    quantity: '',
    reason: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [movementsRes, productsRes] = await Promise.all([
        api.get('/stock-movements'),
        api.get('/products')
      ]);
      
      setMovements(movementsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (movement = null) => {
    if (movement) {
      setEditingMovement(movement);
      setMovementForm({
        product_id: movement.product_id || '',
        type: movement.type || 'in',
        quantity: movement.quantity?.toString() || '',
        reason: movement.reason || '',
        notes: movement.notes || ''
      });
    } else {
      setEditingMovement(null);
      setMovementForm({
        product_id: '',
        type: 'in',
        quantity: '',
        reason: '',
        notes: ''
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMovement(null);
    setMovementForm({
      product_id: '',
      type: 'in',
      quantity: '',
      reason: '',
      notes: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!movementForm.product_id) {
      newErrors.product_id = 'Produto é obrigatório';
    }
    
    if (!movementForm.quantity || parseFloat(movementForm.quantity) <= 0) {
      newErrors.quantity = 'Quantidade deve ser maior que zero';
    }
    
    if (!movementForm.reason.trim()) {
      newErrors.reason = 'Motivo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const movementData = {
        ...movementForm,
        quantity: parseFloat(movementForm.quantity)
      };
      
      if (editingMovement) {
        await api.put(`/stock-movements/${editingMovement.id}`, movementData);
      } else {
        await api.post('/stock-movements', movementData);
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar movimentação:', err);
      alert('Erro ao salvar movimentação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMovement = async (movementId) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return;
    
    try {
      await api.delete(`/stock-movements/${movementId}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir movimentação:', err);
      alert('Erro ao excluir movimentação');
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'N/A';
  };

  const getTypeColor = (type) => {
    return type === 'in' ? 'success' : 'error';
  };

  const getTypeLabel = (type) => {
    return type === 'in' ? 'Entrada' : 'Saída';
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
          Movimentações de Estoque
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Nova Movimentação
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <InventoryIcon sx={{ color: 'primary.main' }} />
                    {getProductName(movement.product_id)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTypeLabel(movement.type)}
                    color={getTypeColor(movement.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {movement.quantity}
                  </Typography>
                </TableCell>
                <TableCell>{movement.reason}</TableCell>
                <TableCell>
                  {new Date(movement.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{movement.notes || '-'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(movement)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMovement(movement.id)}
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

      {/* Modal de Movimentação */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingMovement ? 'Editar Movimentação' : 'Nova Movimentação'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth error={!!errors.product_id}>
              <InputLabel>Produto</InputLabel>
              <Select
                value={movementForm.product_id}
                onChange={(e) => setMovementForm(prev => ({ ...prev, product_id: e.target.value }))}
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
            
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={movementForm.type}
                onChange={(e) => setMovementForm(prev => ({ ...prev, type: e.target.value }))}
                label="Tipo"
              >
                <MenuItem value="in">Entrada</MenuItem>
                <MenuItem value="out">Saída</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Quantidade"
              type="number"
              value={movementForm.quantity}
              onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: e.target.value }))}
              error={!!errors.quantity}
              helperText={errors.quantity}
              fullWidth
              required
              placeholder="10"
            />
            
            <TextField
              label="Motivo"
              value={movementForm.reason}
              onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
              error={!!errors.reason}
              helperText={errors.reason}
              fullWidth
              required
              placeholder="Compra, Venda, Ajuste, etc."
            />
            
            <TextField
              label="Notas"
              value={movementForm.notes}
              onChange={(e) => setMovementForm(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              placeholder="Observações adicionais"
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

export default AdminStockMovements;
