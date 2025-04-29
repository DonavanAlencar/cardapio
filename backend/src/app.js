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
//const debugStartup = require('debug')('app:startup');
//const debugDB      = require('debug')('app:db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/garcons', garconsRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/configuracoes', configRoutes);
app.use('/api/branches', branchesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// em vez de console.log ou sua função customizada:
//debugStartup(`Servidor rodando na porta ${PORT}`);