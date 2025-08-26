const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const garconsRoutes = require('./routes/garcons');
const mesasRoutes = require('./routes/mesas');
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const configRoutes = require('./routes/configuracoes');
const branchesRoutes = require('./routes/branches');
const productCategoriesRoutes = require('./routes/productCategories');
const productsRoutes = require('./routes/products');
const productModifiersRoutes = require('./routes/productModifiers');
const ingredientsRoutes = require('./routes/ingredients');
const ordersRoutes = require('./routes/orders');
const tablesRoutes = require('./routes/tables');
const stockMovementsRoutes = require('./routes/stockMovements');
const paymentsRoutes = require('./routes/payments');
const paymentMethodsRoutes = require('./routes/paymentMethods');
const kitchenRoutes = require('./routes/kitchen');
const customersRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');
//const debugStartup = require('debug')('app:startup');
//const debugDB      = require('debug')('app:db');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Teste simples do dashboard
app.get('/api/dashboard-test', (req, res) => {
  res.json({ 
    message: 'Dashboard test endpoint funcionando!',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/health',
      '/api/dashboard-test',
      '/api/dashboard',
      '/api/dashboard/simple-test',
      '/api/dashboard/debug'
    ]
  });
});

// Endpoint de diagnóstico completo
app.get('/api/diagnostic', async (req, res) => {
  console.log('🔍 Executando diagnóstico completo do sistema...');
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'NÃO DEFINIDA',
      JWT_SECRET: process.env.JWT_SECRET ? '***' : 'NÃO DEFINIDA'
    },
    database: {
      status: 'testing...',
      connection: null,
      tables: null,
      error: null
    },
    services: {
      auth: 'available',
      cors: 'enabled',
      jsonParser: 'enabled'
    }
  };

  try {
    // Testa conexão com banco
    const pool = require('./config/db');
    const [result] = await pool.query('SELECT 1 as test');
    diagnostic.database.status = 'connected';
    diagnostic.database.connection = 'OK';
    
    // Lista tabelas disponíveis
    const [tables] = await pool.query('SHOW TABLES');
    diagnostic.database.tables = tables.map(t => Object.values(t)[0]);
    
  } catch (err) {
    diagnostic.database.status = 'error';
    diagnostic.database.error = err.message;
  }

  console.log('📊 Diagnóstico completo:', JSON.stringify(diagnostic, null, 2));
  res.json(diagnostic);
});

app.use('/api/auth', authRoutes);
app.use('/api/garcons', garconsRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/configuracoes', configRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/product-categories', productCategoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/product-modifiers', productModifiersRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// em vez de console.log ou sua função customizada:
//debugStartup(`Servidor rodando na porta ${PORT}`);