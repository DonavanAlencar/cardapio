const express = require('express');
const router = express.Router();

// Rota simples para testar
router.get('/', (req, res) => {
  res.json({
    message: 'Endpoint de garçons funcionando!',
    timestamp: new Date().toISOString(),
    data: [
      {
        id: 1,
        full_name: 'Carlos Silva',
        status: 'ativo',
        turno: 'Integral',
        setor: 'Salão',
        orders_per_day: '18.5',
        sales_30d: 18500.00,
        avg_rating: 4.7
      },
      {
        id: 2,
        full_name: 'Maria Santos',
        status: 'ativo',
        turno: 'Tarde',
        setor: 'Salão',
        orders_per_day: '15.2',
        sales_30d: 11800.00,
        avg_rating: 4.5
      }
    ]
  });
});

// Rota de métricas simples
router.get('/metrics/overview', (req, res) => {
  res.json({
    total_ativos: 5,
    media_pedidos_dia: '6.6',
    maior_faturamento: {
      nome: 'Carlos Silva',
      valor: 18500.00
    }
  });
});

// Rota de detalhes simples
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id: parseInt(id),
    full_name: 'Carlos Silva',
    status: 'ativo',
    turno: 'Integral',
    setor: 'Salão',
    commission_rate: 3.0,
    metrics: {
      total_orders_30d: 1247,
      total_sales_30d: 89650.25,
      avg_ticket_30d: 71.89
    }
  });
});

module.exports = router;
