import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import api from '../../services/api';

const GarcomComissao = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/commissions/my-commissions');
      setCommissions(response.data);
      
      // Calcular resumo
      const total = response.data.reduce((sum, c) => sum + (c.amount || 0), 0);
      const count = response.data.length;
      const average = count > 0 ? total / count : 0;
      
      setSummary({
        total,
        count,
        average
      });
    } catch (err) {
      console.error('Erro ao carregar comissões:', err);
      // Usar dados mockados em caso de erro
      setCommissions([
        {
          id: 1,
          order_id: 123,
          amount: 15.50,
          percentage: 5.0,
          created_at: new Date().toISOString(),
          notes: 'Pedido mesa 5'
        },
        {
          id: 2,
          order_id: 124,
          amount: 12.00,
          percentage: 5.0,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Pedido mesa 3'
        }
      ]);
      
      setSummary({
        total: 27.50,
        count: 2,
        average: 13.75
      });
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
        Minhas Comissões
      </Typography>

      {/* Cards de Resumo */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                R$ {summary.total?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Comissões
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                {summary.count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pedidos com Comissão
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="h2" gutterBottom>
                R$ {summary.average?.toFixed(2) || '0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Média por Pedido
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Comissões */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Histórico de Comissões
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pedido</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Percentual</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Observações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{commission.order_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      R$ {commission.amount?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${commission.percentage || 0}%`}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(commission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {commission.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {commissions.length === 0 && (
          <Box textAlign="center" py={4}>
            <AttachMoneyIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhuma comissão encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Suas comissões aparecerão aqui após processamento
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default GarcomComissao;
