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
  FormControlLabel,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import api from '../../services/api';

const AdminMesas = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableForm, setTableForm] = useState({
    name: '',
    capacity: '',
    status: 'free',
    is_active: true,
    location: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Erro ao carregar mesas:', err);
      alert('Erro ao carregar mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setTableForm({
        name: table.name,
        capacity: table.capacity?.toString() || '',
        status: table.status || 'free',
        is_active: table.is_active,
        location: table.location || ''
      });
    } else {
      setEditingTable(null);
      setTableForm({
        name: '',
        capacity: '',
        status: 'free',
        is_active: true,
        location: ''
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTable(null);
    setTableForm({
      name: '',
      capacity: '',
      status: 'free',
      is_active: true,
      location: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!tableForm.name.trim()) {
      newErrors.name = 'Nome da mesa é obrigatório';
    }
    
    if (!tableForm.capacity || parseInt(tableForm.capacity) <= 0) {
      newErrors.capacity = 'Capacidade deve ser maior que zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const tableData = {
        ...tableForm,
        capacity: parseInt(tableForm.capacity)
      };
      
      if (editingTable) {
        await api.put(`/tables/${editingTable.id}`, tableData);
      } else {
        await api.post('/tables', tableData);
      }
      
      handleCloseModal();
      fetchTables();
    } catch (err) {
      console.error('Erro ao salvar mesa:', err);
      alert('Erro ao salvar mesa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Tem certeza que deseja excluir esta mesa?')) return;
    
    try {
      await api.delete(`/tables/${tableId}`);
      fetchTables();
    } catch (err) {
      console.error('Erro ao excluir mesa:', err);
      alert('Erro ao excluir mesa');
    }
  };

  const handleToggleActive = async (tableId, currentStatus) => {
    try {
      await api.patch(`/tables/${tableId}`, { is_active: !currentStatus });
      setTables(prev => prev.map(t => 
        t.id === tableId ? { ...t, is_active: !currentStatus } : t
      ));
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      alert('Erro ao alterar status da mesa');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free': return 'success';
      case 'occupied': return 'warning';
      case 'reserved': return 'info';
      case 'maintenance': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'free': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      case 'maintenance': return 'Manutenção';
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
          Gestão de Mesas
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
          >
            Tabela
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
          >
            Grade
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
          >
            Nova Mesa
          </Button>
        </Box>
      </Box>

      {viewMode === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Capacidade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Status Ativo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TableRestaurantIcon sx={{ color: 'primary.main' }} />
                      {table.name}
                    </Box>
                  </TableCell>
                  <TableCell>{table.capacity} pessoas</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(table.status)}
                      color={getStatusColor(table.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{table.location || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={table.is_active ? 'Ativa' : 'Inativa'}
                      color={table.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(table)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                      <Switch
                        checked={table.is_active}
                        onChange={() => handleToggleActive(table.id, table.is_active)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={3}>
          {tables.map((table) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={table.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: `2px solid`,
                  borderColor: getStatusColor(table.status) + '.main',
                  opacity: table.is_active ? 1 : 0.6
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <TableRestaurantIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" component="h3" gutterBottom>
                    Mesa {table.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Capacidade: {table.capacity} pessoas
                  </Typography>
                  
                  {table.location && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Local: {table.location}
                    </Typography>
                  )}
                  
                  <Chip
                    label={getStatusLabel(table.status)}
                    color={getStatusColor(table.status)}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(table)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTable(table.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Mesa */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nome da Mesa"
              value={tableForm.name}
              onChange={(e) => setTableForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
              placeholder="Ex: Mesa 1, Mesa VIP, etc."
            />
            
            <TextField
              label="Capacidade"
              type="number"
              value={tableForm.capacity}
              onChange={(e) => setTableForm(prev => ({ ...prev, capacity: e.target.value }))}
              error={!!errors.capacity}
              helperText={errors.capacity}
              fullWidth
              required
              placeholder="4"
            />
            
            <TextField
              label="Localização"
              value={tableForm.location}
              onChange={(e) => setTableForm(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
              placeholder="Ex: Terraço, Interior, Bar, etc."
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={tableForm.is_active}
                  onChange={(e) => setTableForm(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              }
              label="Mesa Ativa"
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

export default AdminMesas;
