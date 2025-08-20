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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../../services/api';

const AdminComissao = () => {
  const [commissions, setCommissions] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [commissionForm, setCommissionForm] = useState({
    waiter_id: '',
    order_id: '',
    amount: '',
    percentage: '',
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
      const [commissionsRes, waitersRes] = await Promise.all([
        api.get('/commissions'),
        api.get('/waiters')
      ]);
      
      setCommissions(commissionsRes.data);
      setWaiters(waitersRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (commission = null) => {
    if (commission) {
      setEditingCommission(commission);
      setCommissionForm({
        waiter_id: commission.waiter_id || '',
        order_id: commission.order_id || '',
        amount: commission.amount?.toString() || '',
        percentage: commission.percentage?.toString() || '',
        notes: commission.notes || ''
      });
    } else {
      setEditingCommission(null);
      setCommissionForm({
        waiter_id: '',
        order_id: '',
        amount: '',
        percentage: '',
        notes: ''
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCommission(null);
    setCommissionForm({
      waiter_id: '',
      order_id: '',
      amount: '',
      percentage: '',
      notes: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!commissionForm.waiter_id) {
      newErrors.waiter_id = 'Garçom é obrigatório';
    }
    
    if (!commissionForm.amount || parseFloat(commissionForm.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    if (commissionForm.percentage && parseFloat(commissionForm.percentage) < 0) {
      newErrors.percentage = 'Percentual deve ser maior ou igual a zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const commissionData = {
        ...commissionForm,
        amount: parseFloat(commissionForm.amount),
        percentage: commissionForm.percentage ? parseFloat(commissionForm.percentage) : 0
      };
      
      if (editingCommission) {
        await api.put(`/commissions/${editingCommission.id}`, commissionData);
      } else {
        await api.post('/commissions', commissionData);
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar comissão:', err);
      alert('Erro ao salvar comissão');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCommission = async (commissionId) => {
    if (!confirm('Tem certeza que deseja excluir esta comissão?')) return;
    
    try {
      await api.delete(`/commissions/${commissionId}`);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir comissão:', err);
      alert('Erro ao excluir comissão');
    }
  };

  const getWaiterName = (waiterId) => {
    const waiter = waiters.find(w => w.id === waiterId);
    return waiter ? waiter.full_name : 'N/A';
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
          Gestão de Comissões
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Nova Comissão
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Garçom</TableCell>
              <TableCell>Pedido</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Percentual</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {commissions.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AttachMoneyIcon sx={{ color: 'primary.main' }} />
                    {getWaiterName(commission.waiter_id)}
                  </Box>
                </TableCell>
                <TableCell>#{commission.order_id}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    R$ {commission.amount?.toFixed(2) || '0.00'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {commission.percentage ? `${commission.percentage}%` : '-'}
                </TableCell>
                <TableCell>
                  {new Date(commission.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {commission.notes || '-'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(commission)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCommission(commission.id)}
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

      {/* Modal de Comissão */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCommission ? 'Editar Comissão' : 'Nova Comissão'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <FormControl fullWidth error={!!errors.waiter_id}>
              <InputLabel>Garçom</InputLabel>
              <Select
                value={commissionForm.waiter_id}
                onChange={(e) => setCommissionForm(prev => ({ ...prev, waiter_id: e.target.value }))}
                label="Garçom"
                required
              >
                {waiters.map(waiter => (
                  <MenuItem key={waiter.id} value={waiter.id}>
                    {waiter.full_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="ID do Pedido"
              value={commissionForm.order_id}
              onChange={(e) => setCommissionForm(prev => ({ ...prev, order_id: e.target.value }))}
              fullWidth
              placeholder="123"
            />
            
            <TextField
              label="Valor da Comissão"
              type="number"
              value={commissionForm.amount}
              onChange={(e) => setCommissionForm(prev => ({ ...prev, amount: e.target.value }))}
              error={!!errors.amount}
              helperText={errors.amount}
              fullWidth
              required
              InputProps={{
                startAdornment: <span>R$</span>
              }}
            />
            
            <TextField
              label="Percentual (%)"
              type="number"
              value={commissionForm.percentage}
              onChange={(e) => setCommissionForm(prev => ({ ...prev, percentage: e.target.value }))}
              error={!!errors.percentage}
              helperText={errors.percentage}
              fullWidth
              placeholder="5.0"
            />
            
            <TextField
              label="Notas"
              value={commissionForm.notes}
              onChange={(e) => setCommissionForm(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={3}
              fullWidth
              placeholder="Observações sobre a comissão"
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

export default AdminComissao;
