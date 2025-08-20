import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import api from '../../services/api';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({});
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Aqui você pode implementar as chamadas de API para relatórios
      // Por enquanto, vamos usar dados mockados
      setReports({
        totalSales: 12500.50,
        totalOrders: 156,
        averageOrderValue: 80.13,
        topProducts: ['Hambúrguer', 'Pizza', 'Sushi'],
        customerCount: 89
      });
    } catch (err) {
      console.error('Erro ao carregar relatórios:', err);
    } finally {
      setLoading(false);
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
      <Typography variant="h4" component="h1" gutterBottom>
        Relatórios Administrativos
      </Typography>

      {/* Filtros de Data */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Data Início"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Data Fim"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={fetchReports}>
              Atualizar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Cards de Métricas */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                R$ {reports.totalSales?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vendas Totais
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <BarChartIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                {reports.totalOrders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Pedidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                R$ {reports.averageOrderValue?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ticket Médio
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                {reports.customerCount || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes Atendidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Relatórios Detalhados */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Produtos Mais Vendidos
            </Typography>
            {reports.topProducts?.map((product, index) => (
              <Box key={index} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                <Typography variant="body2">
                  {index + 1}. {product}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.floor(Math.random() * 50) + 10} vendas
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumo do Período
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Período:</strong> {new Date(dateRange.start).toLocaleDateString()} a {new Date(dateRange.end).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Dias úteis:</strong> {Math.floor(Math.random() * 30) + 20} dias
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Média diária:</strong> R$ {((reports.totalSales || 0) / 30).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminReports;
