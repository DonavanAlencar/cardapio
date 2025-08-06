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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

// em vez de console.log ou sua função customizada:
//debugStartup(`Servidor rodando na porta ${PORT}`);