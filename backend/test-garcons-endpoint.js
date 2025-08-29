const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Rota de teste simples
app.get('/api/garcons', (req, res) => {
  res.json({
    message: 'Endpoint de garçons funcionando!',
    timestamp: new Date().toISOString(),
    data: [
      {
        id: 1,
        full_name: 'Carlos Silva',
        status: 'ativo',
        turno: 'Integral',
        setor: 'Salão'
      }
    ]
  });
});

// Rota de métricas
app.get('/api/garcons/metrics/overview', (req, res) => {
  res.json({
    total_ativos: 5,
    media_pedidos_dia: '6.6',
    maior_faturamento: {
      nome: 'Carlos Silva',
      valor: 18500.00
    }
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 Teste endpoint: http://localhost:${PORT}/api/garcons`);
  console.log(`📈 Teste métricas: http://localhost:${PORT}/api/garcons/metrics/overview`);
});
