const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
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
const productImagesRoutes = require('./routes/productImages');
const ingredientsRoutes = require('./routes/ingredients');
const ordersRoutes = require('./routes/orders');
const tablesRoutes = require('./routes/tables');
const stockMovementsRoutes = require('./routes/stockMovements');
const paymentsRoutes = require('./routes/payments');
const paymentMethodsRoutes = require('./routes/paymentMethods');
const kitchenRoutes = require('./routes/kitchen');
const customersRoutes = require('./routes/customers');
const reservationsRoutes = require('./routes/reservations');
const dashboardRoutes = require('./routes/dashboard');
// const notificationsRoutes = require('./routes/notifications');
//const debugStartup = require('debug')('app:startup');
//const debugDB      = require('debug')('app:db');

// Criar servidor HTTP
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://food.546digitalservices.com"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware para limitar conexões simultâneas
const connectionLimiter = (req, res, next) => {
  // Contador simples de conexões ativas
  if (!req.app.locals.activeConnections) {
    req.app.locals.activeConnections = 0;
  }

  if (req.app.locals.activeConnections > 200) { // Aumentado para 200 conexões simultâneas
    console.warn('⚠️ [APP] Muitas conexões simultâneas, rejeitando requisição');
    return res.status(503).json({
      error: 'Servidor sobrecarregado',
      message: 'Muitas requisições simultâneas. Tente novamente em alguns segundos.'
    });
  }

  req.app.locals.activeConnections++;

  res.on('finish', () => {
    req.app.locals.activeConnections--;
  });

  next();
};

// Middleware de timeout global para evitar travamentos
const globalTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      console.error(`⏰ [APP] Timeout global de ${timeoutMs}ms excedido para ${req.method} ${req.url}`);
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: `Requisição excedeu o tempo limite de ${timeoutMs}ms`
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowList = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://food.546digitalservices.com'
    ];
    if (!origin || allowList.includes(origin)) {
      return callback(null, true);
    }
    // Em desenvolvimento, liberar demais origens
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pelo CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(globalTimeout(25000)); // Timeout global de 25s
app.use(connectionLimiter);

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Gerenciar conexões WebSocket
const connectedClients = new Map();
const clientRooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 [WebSocket] Cliente conectado: ${socket.id}`);

  // Armazenar informações do cliente
  connectedClients.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    userAgent: socket.handshake.headers['user-agent'],
    ip: socket.handshake.address
  });

  // Evento quando cliente está pronto
  socket.on('client:ready', (data) => {
    console.log(`✅ [WebSocket] Cliente pronto:`, data);

    // Atualizar informações do cliente
    const clientInfo = connectedClients.get(socket.id);
    if (clientInfo) {
      Object.assign(clientInfo, data);
    }
  });

  // Ping/Pong para verificar latência
  socket.on('ping', (data) => {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
      clientTimestamp: data.timestamp
    });
  });

  // Cliente quer entrar em uma sala (ex: dashboard, kitchen, etc.)
  socket.on('join:room', (roomName) => {
    console.log(`🚪 [WebSocket] Cliente ${socket.id} entrando na sala: ${roomName}`);

    socket.join(roomName);
    clientRooms.set(socket.id, roomName);

    // Confirmar entrada na sala
    socket.emit('room:joined', {
      room: roomName,
      timestamp: new Date().toISOString()
    });
  });

  // Cliente quer sair de uma sala
  socket.on('leave:room', (roomName) => {
    console.log(`🚪 [WebSocket] Cliente ${socket.id} saindo da sala: ${roomName}`);

    socket.leave(roomName);
    clientRooms.delete(socket.id);

    socket.emit('room:left', {
      room: roomName,
      timestamp: new Date().toISOString()
    });
  });

  // Desconexão do cliente
  socket.on('disconnect', (reason) => {
    console.log(`❌ [WebSocket] Cliente desconectado: ${socket.id}, motivo: ${reason}`);

    // Limpar dados do cliente
    connectedClients.delete(socket.id);
    clientRooms.delete(socket.id);
  });

  // Erro no socket
  socket.on('error', (error) => {
    console.error(`❌ [WebSocket] Erro no socket ${socket.id}:`, error);
  });
});

// Função para emitir eventos para salas específicas
const emitToRoom = (roomName, event, data) => {
  console.log(`📤 [WebSocket] Emitindo ${event} para sala: ${roomName}`);
  io.to(roomName).emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Função para emitir eventos para todos os clientes
const emitToAll = (event, data) => {
  console.log(`📤 [WebSocket] Emitindo ${event} para todos os clientes`);
  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

// Função para obter estatísticas dos clientes conectados
const getWebSocketStats = () => {
  return {
    totalClients: connectedClients.size,
    clients: Array.from(connectedClients.values()),
    rooms: Array.from(new Set(clientRooms.values())),
    timestamp: new Date().toISOString()
  };
};

// Disponibilizar funções WebSocket globalmente
app.locals.io = io;
app.locals.emitToRoom = emitToRoom;
app.locals.emitToAll = emitToAll;
app.locals.getWebSocketStats = getWebSocketStats;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    websocket: {
      connectedClients: connectedClients.size,
      rooms: Array.from(new Set(clientRooms.values()))
    }
  });
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
      jsonParser: 'enabled',
      websocket: 'enabled'
    },
    websocket: getWebSocketStats()
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
app.use('/api/product-images', productImagesRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/notifications', notificationsRoutes);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT} com WebSocket ativo`));

// em vez de console.log ou sua função customizada:
//debugStartup(`Servidor rodando na porta ${PORT}`);