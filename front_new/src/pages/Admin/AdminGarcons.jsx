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
import PersonIcon from '@mui/icons-material/Person';
import api from '../../services/api';

const AdminGarcons = () => {
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState(null);
  const [waiterForm, setWaiterForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    is_active: true,
    commission_rate: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    try {
      setLoading(true);
      const response = await api.get('/waiters');
      setWaiters(response.data);
    } catch (err) {
      console.error('Erro ao carregar garçons:', err);
      alert('Erro ao carregar garçons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (waiter = null) => {
    if (waiter) {
      setEditingWaiter(waiter);
      setWaiterForm({
        full_name: waiter.full_name,
        email: waiter.email,
        phone: waiter.phone || '',
        is_active: waiter.is_active,
        commission_rate: waiter.commission_rate?.toString() || ''
      });
    } else {
      setEditingWaiter(null);
      setWaiterForm({
        full_name: '',
        email: '',
        phone: '',
        is_active: true,
        commission_rate: ''
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingWaiter(null);
    setWaiterForm({
      full_name: '',
      email: '',
      phone: '',
      is_active: true,
      commission_rate: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!waiterForm.full_name.trim()) {
      newErrors.full_name = 'Nome é obrigatório';
    }
    
    if (!waiterForm.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!waiterForm.email.includes('@')) {
      newErrors.email = 'Email deve conter @';
    }
    
    if (waiterForm.commission_rate && parseFloat(waiterForm.commission_rate) < 0) {
      newErrors.commission_rate = 'Taxa de comissão deve ser maior ou igual a zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const waiterData = {
        ...waiterForm,
        commission_rate: waiterForm.commission_rate ? parseFloat(waiterForm.commission_rate) : 0
      };
      
      if (editingWaiter) {
        await api.put(`/waiters/${editingWaiter.id}`, waiterData);
      } else {
        await api.post('/waiters', waiterData);
      }
      
      handleCloseModal();
      fetchWaiters();
    } catch (err) {
      console.error('Erro ao salvar garçom:', err);
      alert('Erro ao salvar garçom');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWaiter = async (waiterId) => {
    if (!confirm('Tem certeza que deseja excluir este garçom?')) return;
    
    try {
      await api.delete(`/waiters/${waiterId}`);
      fetchWaiters();
    } catch (err) {
      console.error('Erro ao excluir garçom:', err);
      alert('Erro ao excluir garçom');
    }
  };

  const handleToggleActive = async (waiterId, currentStatus) => {
    try {
      await api.patch(`/waiters/${waiterId}`, { is_active: !currentStatus });
      setWaiters(prev => prev.map(w => 
        w.id === waiterId ? { ...w, is_active: !currentStatus } : w
      ));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status do garçom');
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
          Gestão de Garçons
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Garçom
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Taxa de Comissão</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {waiters.map((waiter) => (
              <TableRow key={waiter.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon sx={{ color: 'primary.main' }} />
                    {waiter.full_name}
                  </Box>
                </TableCell>
                <TableCell>{waiter.email}</TableCell>
                <TableCell>{waiter.phone || '-'}</TableCell>
                <TableCell>
                  {waiter.commission_rate ? `${waiter.commission_rate}%` : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={waiter.is_active ? 'Ativo' : 'Inativo'}
                    color={waiter.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(waiter)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteWaiter(waiter.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Switch
                      checked={waiter.is_active}
                      onChange={() => handleToggleActive(waiter.id, waiter.is_active)}
                      size="small"
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Garçom */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingWaiter ? 'Editar Garçom' : 'Novo Garçom'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome Completo"
              value={waiterForm.full_name}
              onChange={(e) => setWaiterForm(prev => ({ ...prev, full_name: e.target.value }))}
              error={!!errors.full_name}
              helperText={errors.full_name}
              fullWidth
              required
            />
            
            <TextField
              label="Email"
              type="email"
              value={waiterForm.email}
              onChange={(e) => setWaiterForm(prev => ({ ...prev, email: e.target.value }))}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
            />
            
            <TextField
              label="Telefone"
              value={waiterForm.phone}
              onChange={(e) => setWaiterForm(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
              placeholder="(11) 99999-9999"
            />
            
            <TextField
              label="Taxa de Comissão (%)"
              type="number"
              value={waiterForm.commission_rate}
              onChange={(e) => setWaiterForm(prev => ({ ...prev, commission_rate: e.target.value }))}
              error={!!errors.commission_rate}
              helperText={errors.commission_rate}
              fullWidth
              placeholder="5.0"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={waiterForm.is_active}
                  onChange={(e) => setWaiterForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Garçom Ativo"
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

export default AdminGarcons;
