import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Close,
  Inventory,
  TrendingUp,
  TrendingDown,
  Warning,
  CalendarToday,
  LocationOn,
  Category
} from '@mui/icons-material';
import stockService from '../../services/stockService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stock-tabpanel-${index}`}
      aria-labelledby={`stock-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StockItemDetailModal({ open, onClose, itemId }) {
  const [activeTab, setActiveTab] = useState(0);
  const [item, setItem] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && itemId) {
      loadItemDetails();
    }
  }, [open, itemId]);

  const loadItemDetails = async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [itemData, movementsData] = await Promise.all([
        stockService.getStockItemById(itemId),
        stockService.listStockMovements({ itemId, limit: 50 })
      ]);
      
      setItem(itemData);
      setMovements(movementsData.movements || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes do item:', error);
      setError('Erro ao carregar detalhes do item');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'baixo':
        return 'error';
      case 'ok':
        return 'success';
      default:
        return 'default';
    }
  };

  const getMovementTypeColor = (tipo) => {
    switch (tipo) {
      case 'ENTRADA':
        return 'success';
      case 'SAIDA':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory color="primary" />
          <Typography variant="h6">
            {loading ? 'Carregando...' : item?.nome || 'Detalhes do Item'}
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          sx={{
            color: 'grey.500',
            '&:hover': { color: 'grey.700' }
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            </Grid>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : item ? (
          <>
            {/* Informações do Item */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informações Gerais
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Category color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Categoria:</strong> {item.categoria}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Localização:</strong> {item.localizacao}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday color="action" fontSize="small" />
                          <Typography variant="body2">
                            <strong>Criado em:</strong> {formatDate(item.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Status do Estoque
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Saldo Disponível:</Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: item.saldo_disponivel <= item.minimo ? 'error.main' : 'success.main'
                            }}
                          >
                            {item.saldo_disponivel} {item.unidade}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Estoque Mínimo:</Typography>
                          <Typography variant="body1">
                            {item.minimo} {item.unidade}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">Status:</Typography>
                          <Chip
                            label={item.status === 'baixo' ? 'Baixo' : 'OK'}
                            color={getStatusColor(item.status)}
                            icon={item.status === 'baixo' ? <Warning /> : <TrendingUp />}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Tabs para Detalhes e Movimentações */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Detalhes" />
                <Tab label={`Movimentações (${movements.length})`} />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <Typography variant="body2" color="text.secondary">
                Informações detalhadas sobre o item de estoque.
              </Typography>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {movements.length === 0 ? (
                <Alert severity="info">
                  Nenhuma movimentação encontrada para este item.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Data/Hora</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Quantidade</TableCell>
                        <TableCell>Motivo</TableCell>
                        <TableCell>Responsável</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(movement.data_hora)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={movement.tipo}
                              size="small"
                              color={getMovementTypeColor(movement.tipo)}
                              icon={movement.tipo === 'ENTRADA' ? <TrendingUp /> : <TrendingDown />}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {movement.quantidade}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {movement.motivo}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {movement.responsavel}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          </>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
