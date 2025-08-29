import React, { useState, useEffect, useCallback } from 'react';
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
  CardContent,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  Pagination,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import waiterManagementService from '../../services/waiterManagementService';
import './GestaoGarcons.css';

const GestaoGarcons = () => {
  // Estados principais
  const [waiters, setWaiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    q: '',
    status: ['todos'],
    turno: ['todos'],
    setor: ['todos'],
    dataInicio: '',
    dataFim: ''
  });
  
  // Estados de paginação e ordenação
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [sort, setSort] = useState({ field: 'full_name', order: 'ASC' });
  
  // Estados de modais e drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [waiterMenuAnchor, setWaiterMenuAnchor] = useState(null);
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  
  // Estados de formulário
  const [waiterForm, setWaiterForm] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    branch_id: 1, // Assumindo branch padrão
    position: 'Garçom',
    turno: 'Integral',
    setor: 'Salão',
    commission_rate: 3.0,
    status: 'ativo'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados de notificações
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Carregar dados iniciais
  useEffect(() => {
    fetchData();
  }, [filters, pagination.page, pagination.pageSize, sort]);

  // Buscar dados
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar garçons e métricas em paralelo
      const [waitersData, metricsData] = await Promise.all([
        waiterManagementService.getWaiters({
          ...filters,
          page: pagination.page,
          pageSize: pagination.pageSize,
          sort: sort.field,
          sortOrder: sort.order
        }),
        waiterManagementService.getMetrics(filters)
      ]);
      
      setWaiters(waitersData.data || []);
      setPagination(waitersData.pagination || {});
      setMetrics(metricsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, sort]);

  // Aplicar filtros
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Aplicar ordenação
  const applySort = (field) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'ASC' ? 'DESC' : 'ASC'
    }));
  };

  // Abrir modal de garçom
  const handleOpenModal = (waiter = null) => {
    if (waiter) {
      setEditingWaiter(waiter);
      setWaiterForm({
        full_name: waiter.full_name || '',
        email: waiter.email || '',
        username: waiter.username || '',
        password: '',
        branch_id: waiter.branch_id || 1,
        position: waiter.position || 'Garçom',
        turno: waiter.turno || 'Integral',
        setor: waiter.setor || 'Salão',
        commission_rate: waiter.commission_rate || 0,
        status: waiter.status || 'ativo'
      });
    } else {
      setEditingWaiter(null);
      setWaiterForm({
        full_name: '',
        email: '',
        username: '',
        password: '',
        branch_id: 1,
        position: 'Garçom',
        turno: 'Integral',
        setor: 'Salão',
        commission_rate: 3.0,
        status: 'ativo'
      });
    }
    setErrors({});
    setModalOpen(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingWaiter(null);
    setWaiterForm({
      full_name: '',
      email: '',
      username: '',
      password: '',
      branch_id: 1,
      position: 'Garçom',
      turno: 'Integral',
      setor: 'Salão',
      commission_rate: 3.0,
      status: 'ativo'
    });
    setErrors({});
  };

  // Validar formulário
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
    
    if (!editingWaiter && !waiterForm.username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    }
    
    if (!editingWaiter && !waiterForm.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    if (waiterForm.commission_rate < 0) {
      newErrors.commission_rate = 'Taxa de comissão deve ser maior ou igual a zero';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Salvar garçom
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (editingWaiter) {
        await waiterManagementService.updateWaiter(editingWaiter.id, waiterForm);
        showSnackbar('Garçom atualizado com sucesso!', 'success');
      } else {
        await waiterManagementService.createWaiter(waiterForm);
        showSnackbar('Garçom criado com sucesso!', 'success');
      }
      
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error('Erro ao salvar garçom:', err);
      showSnackbar('Erro ao salvar garçom. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deletar garçom
  const handleDeleteWaiter = async (waiterId) => {
    if (!confirm('Tem certeza que deseja excluir este garçom?')) return;
    
    try {
      await waiterManagementService.deleteWaiter(waiterId);
      showSnackbar('Garçom excluído com sucesso!', 'success');
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir garçom:', err);
      showSnackbar('Erro ao excluir garçom. Tente novamente.', 'error');
    }
  };

  // Atualizar status
  const handleToggleStatus = async (waiterId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
      await waiterManagementService.updateWaiterStatus(waiterId, newStatus);
      showSnackbar(`Status alterado para ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      showSnackbar('Erro ao alterar status. Tente novamente.', 'error');
    }
  };

  // Exportar relatório
  const handleExport = async (format) => {
    try {
      await waiterManagementService.exportReport({
        format,
        ...filters
      });
      showSnackbar(`Relatório exportado em ${format.toUpperCase()}`, 'success');
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      showSnackbar('Erro ao exportar relatório. Tente novamente.', 'error');
    }
  };

  // Mostrar snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Abrir menu de ações do garçom
  const handleOpenWaiterMenu = (event, waiter) => {
    setWaiterMenuAnchor(event.currentTarget);
    setSelectedWaiter(waiter);
  };

  // Fechar menu de ações
  const handleCloseWaiterMenu = () => {
    setWaiterMenuAnchor(null);
    setSelectedWaiter(null);
  };

  // Renderizar chips de filtros rápidos
  const renderQuickFilters = () => {
    const filterOptions = waiterManagementService.getFilterOptions();
    
    return (
      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        <Chip
          label="Todos"
          color={filters.status.includes('todos') && filters.turno.includes('todos') && filters.setor.includes('todos') ? 'primary' : 'default'}
          onClick={() => applyFilters({
            ...filters,
            status: ['todos'],
            turno: ['todos'],
            setor: ['todos']
          })}
          variant={filters.status.includes('todos') && filters.turno.includes('todos') && filters.setor.includes('todos') ? 'filled' : 'outlined'}
        />
        <Chip
          label="Ativos"
          color={filters.status.includes('ativo') ? 'success' : 'default'}
          onClick={() => applyFilters({
            ...filters,
            status: ['ativo']
          })}
          variant={filters.status.includes('ativo') ? 'filled' : 'outlined'}
          icon={<PeopleIcon />}
        />
        <Chip
          label="Manhã"
          color={filters.turno.includes('Manhã') ? 'warning' : 'default'}
          onClick={() => applyFilters({
            ...filters,
            turno: ['Manhã']
          })}
          variant={filters.turno.includes('Manhã') ? 'filled' : 'outlined'}
          icon={<ScheduleIcon />}
        />
        <Chip
          label="Salão"
          color={filters.setor.includes('Salão') ? 'info' : 'default'}
          onClick={() => applyFilters({
            ...filters,
            setor: ['Salão']
          })}
          variant={filters.setor.includes('Salão') ? 'filled' : 'outlined'}
          icon={<LocationOnIcon />}
        />
      </Box>
    );
  };

  // Renderizar cards de KPIs
  const renderKPICards = () => {
    if (!metrics) return null;

    return (
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card className="kpi-card kpi-active">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {metrics.total_ativos}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    funcionários em atividade
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="kpi-card kpi-orders">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {metrics.media_pedidos_dia}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    por garçom
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="kpi-card kpi-revenue">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.primary" fontWeight="bold">
                    {metrics.maior_faturamento?.nome || 'N/A'}
                  </Typography>
                  <Typography variant="h5" color="error.main" fontWeight="bold">
                    R$ {metrics.maior_faturamento?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </Typography>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Renderizar tabela de garçons
  const renderWaitersTable = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (waiters.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Nenhum garçom encontrado com os filtros aplicados.
        </Alert>
      );
    }

    return (
      <>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Garçom</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Turno</TableCell>
                <TableCell>Setor</TableCell>
                <TableCell>Pedidos/Dia</TableCell>
                <TableCell>Vendas (30d)</TableCell>
                <TableCell>Avaliação</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waiters.map((waiter) => (
                <TableRow key={waiter.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {waiter.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {waiter.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {waiter.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {waiter.id}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={waiter.status}
                      color={waiter.status === 'ativo' ? 'success' : 'default'}
                      size="small"
                      icon={waiter.status === 'ativo' ? <PeopleIcon /> : undefined}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {waiter.turno}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={waiter.setor}
                      color="info"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {waiter.orders_per_day || '0.0'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      R$ {waiter.sales_30d?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2">
                        {waiter.avg_rating?.toFixed(1) || '0.0'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(waiter)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(waiter)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenWaiterMenu(e, waiter)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(e, page) => setPagination(prev => ({ ...prev, page }))}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
            Gestão de Garçons
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cadastro e controle de funcionários
          </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Exportar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}
          >
            Adicionar Garçom
          </Button>
        </Box>
      </Box>

      {/* Filtros rápidos */}
      {renderQuickFilters()}

      {/* Barra de busca e filtros */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <TextField
          placeholder="Pesquisar por nome ou ID do funcionário..."
          value={filters.q}
          onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {waiterManagementService.getFilterOptions().status.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={filters.status.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Turno</InputLabel>
          <Select
            multiple
            value={filters.turno}
            onChange={(e) => setFilters(prev => ({ ...prev, turno: e.target.value }))}
            input={<OutlinedInput label="Turno" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {waiterManagementService.getFilterOptions().turno.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={filters.turno.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Setor</InputLabel>
          <Select
            multiple
            value={filters.setor}
            onChange={(e) => setFilters(prev => ({ ...prev, setor: e.target.value }))}
            input={<OutlinedInput label="Setor" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {waiterManagementService.getFilterOptions().setor.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox checked={filters.setor.indexOf(option.value) > -1} />
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setAdvancedFiltersOpen(true)}
        >
          Filtros Avançados
        </Button>
      </Box>

      {/* Cards de KPIs */}
      {renderKPICards()}

      {/* Tabela de garçons */}
      {renderWaitersTable()}

      {/* Modal de garçom */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingWaiter ? 'Editar Garçom' : 'Adicionar Novo Garçom'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Preencha os dados do novo funcionário
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome Completo *"
                value={waiterForm.full_name}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, full_name: e.target.value }))}
                error={!!errors.full_name}
                helperText={errors.full_name}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="ID do Funcionário *"
                value={waiterForm.username}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, username: e.target.value }))}
                error={!!errors.username}
                helperText={errors.username}
                fullWidth
                required
                disabled={!!editingWaiter}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="E-mail *"
                type="email"
                value={waiterForm.email}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, email: e.target.value }))}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Telefone"
                value={waiterForm.phone || ''}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, phone: e.target.value }))}
                fullWidth
                placeholder="(11) 99999-9999"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Turno</InputLabel>
                <Select
                  value={waiterForm.turno}
                  onChange={(e) => setWaiterForm(prev => ({ ...prev, turno: e.target.value }))}
                  label="Turno"
                >
                  <MenuItem value="Integral">Integral (06:00 - 22:00)</MenuItem>
                  <MenuItem value="Manhã">Manhã (06:00 - 14:00)</MenuItem>
                  <MenuItem value="Tarde">Tarde (14:00 - 22:00)</MenuItem>
                  <MenuItem value="Noite">Noite (18:00 - 02:00)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Setor</InputLabel>
                <Select
                  value={waiterForm.setor}
                  onChange={(e) => setWaiterForm(prev => ({ ...prev, setor: e.target.value }))}
                  label="Setor"
                >
                  <MenuItem value="Salão">Salão</MenuItem>
                  <MenuItem value="Terraço">Terraço</MenuItem>
                  <MenuItem value="VIP">VIP</MenuItem>
                  <MenuItem value="Delivery">Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Taxa de Comissão (%)"
                type="number"
                value={waiterForm.commission_rate}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))}
                error={!!errors.commission_rate}
                helperText={errors.commission_rate}
                fullWidth
                placeholder="3.0"
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Meta de Vendas (R$)"
                type="number"
                value={waiterForm.salesGoal || ''}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, salesGoal: parseFloat(e.target.value) || 0 }))}
                fullWidth
                placeholder="12000"
                inputProps={{ step: 100, min: 0 }}
              />
            </Grid>
            
            {!editingWaiter && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Senha *"
                  type="password"
                  value={waiterForm.password}
                  onChange={(e) => setWaiterForm(prev => ({ ...prev, password: e.target.value }))}
                  error={!!errors.password}
                  helperText={errors.password}
                  fullWidth
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Endereço"
                value={waiterForm.address || ''}
                onChange={(e) => setWaiterForm(prev => ({ ...prev, address: e.target.value }))}
                fullWidth
                placeholder="Endereço completo"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{ backgroundColor: 'error.main', '&:hover': { backgroundColor: 'error.dark' } }}
          >
            {isSubmitting ? 'Salvando...' : (editingWaiter ? 'Atualizar Garçom' : 'Adicionar Garçom')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer de filtros avançados */}
      <Drawer
        anchor="right"
        open={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
      >
        <Box sx={{ width: 400, p: 3 }}>
          <Typography variant="h6" mb={3}>
            Filtros Avançados
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Data de Início"
              type="date"
              value={filters.dataInicio}
              onChange={(e) => setFilters(prev => ({ ...prev, dataInicio: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Data de Fim"
              type="date"
              value={filters.dataFim}
              onChange={(e) => setFilters(prev => ({ ...prev, dataFim: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <Button
              variant="contained"
              onClick={() => {
                applyFilters(filters);
                setAdvancedFiltersOpen(false);
              }}
            >
              Aplicar Filtros
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => {
                setFilters({
                  q: '',
                  status: ['todos'],
                  turno: ['todos'],
                  setor: ['todos'],
                  dataInicio: '',
                  dataFim: ''
                });
              }}
            >
              Limpar Filtros
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Menu de exportação */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          handleExport('csv');
          setExportMenuAnchor(null);
        }}>
          Exportar CSV
        </MenuItem>
        <MenuItem onClick={() => {
          handleExport('xlsx');
          setExportMenuAnchor(null);
        }}>
          Exportar XLSX
        </MenuItem>
        <MenuItem onClick={() => {
          handleExport('pdf');
          setExportMenuAnchor(null);
        }}>
          Exportar PDF
        </MenuItem>
      </Menu>

      {/* Menu de ações do garçom */}
      <Menu
        anchorEl={waiterMenuAnchor}
        open={Boolean(waiterMenuAnchor)}
        onClose={handleCloseWaiterMenu}
      >
        <MenuItem onClick={() => {
          handleToggleStatus(selectedWaiter?.id, selectedWaiter?.status);
          handleCloseWaiterMenu();
        }}>
          <ListItemIcon>
            <Switch size="small" checked={selectedWaiter?.status === 'ativo'} />
          </ListItemIcon>
          <ListItemText primary="Alterar Status" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          handleDeleteWaiter(selectedWaiter?.id);
          handleCloseWaiterMenu();
        }}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Excluir" />
        </MenuItem>
      </Menu>

      {/* Snackbar de notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestaoGarcons;
