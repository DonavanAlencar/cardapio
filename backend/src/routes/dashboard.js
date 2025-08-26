const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware de autenticação (reutilizando o existente)
const authenticateToken = require('../middleware/authMiddleware');

// Função helper para autenticação sem role específico
const requireAuth = authenticateToken();

// GET /api/dashboard/simple-test - Teste muito simples
router.get('/simple-test', async (req, res) => {
  try {
    console.log('🧪 Dashboard Simple Test - Iniciando...');
    
    // Teste 1: Conexão básica
    const [testResult] = await pool.query('SELECT 1 as test');
    console.log('✅ Teste básico OK:', testResult);
    
    // Teste 2: Verificar se as tabelas existem
    const [tables] = await pool.query('SHOW TABLES');
    console.log('📋 Tabelas encontradas:', tables.map(t => Object.values(t)[0]));
    
    // Teste 3: Contar registros básicos
    const [usersCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [tablesCount] = await pool.query('SELECT COUNT(*) as total FROM tables');
    const [ordersCount] = await pool.query('SELECT COUNT(*) as total FROM orders');
    
    res.json({
      message: 'Dashboard Simple Test - OK',
      database: 'Conectado',
      timestamp: new Date().toISOString(),
      tables: tables.map(t => Object.values(t)[0]),
      counts: {
        users: usersCount[0].total,
        tables: tablesCount[0].total,
        orders: ordersCount[0].total
      }
    });
    
  } catch (error) {
    console.error('❌ Dashboard Simple Test - Erro:', error);
    res.status(500).json({ 
      error: 'Erro no teste simples',
      details: error.message,
      stack: error.stack
    });
  }
});

// GET /api/dashboard/test - Endpoint de teste sem autenticação
router.get('/test', async (req, res) => {
  try {
    // Teste simples de conexão com banco
    const [result] = await pool.query('SELECT 1 as test');
    
    res.json({
      message: 'Dashboard API funcionando!',
      database: 'Conectado',
      timestamp: new Date().toISOString(),
      test: result[0]
    });
  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// GET /api/dashboard/debug - Endpoint de debug com dados básicos
router.get('/debug', async (req, res) => {
  try {
    console.log('Dashboard Debug - Iniciando...');
    
    // Teste 1: Conexão básica
    const [testResult] = await pool.query('SELECT 1 as test');
    console.log('Dashboard Debug - Teste básico:', testResult);
    
    // Teste 2: Contar usuários
    const [usersResult] = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log('Dashboard Debug - Total usuários:', usersResult);
    
    // Teste 3: Contar mesas
    const [tablesResult] = await pool.query('SELECT COUNT(*) as total FROM tables');
    console.log('Dashboard Debug - Total mesas:', tablesResult);
    
    // Teste 4: Contar pedidos
    const [ordersResult] = await pool.query('SELECT COUNT(*) as total FROM orders');
    console.log('Dashboard Debug - Total pedidos:', ordersResult);
    
    // Teste 5: Estrutura das tabelas
    const [tablesStructure] = await pool.query('DESCRIBE tables');
    console.log('Dashboard Debug - Estrutura tabela tables:', tablesStructure);
    
    res.json({
      message: 'Dashboard Debug - Dados básicos',
      database: 'Conectado',
      timestamp: new Date().toISOString(),
      tests: {
        basic: testResult[0],
        users: usersResult[0],
        tables: tablesResult[0],
        orders: ordersResult[0],
        tablesStructure: tablesStructure
      }
    });
  } catch (error) {
    console.error('Dashboard Debug - Erro:', error);
    res.status(500).json({ 
      error: 'Erro no debug',
      details: error.message,
      stack: error.stack
    });
  }
});

// GET /api/dashboard - Dados principais do dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Debug: Log do usuário
    console.log('Dashboard - User ID:', userId);
    console.log('Dashboard - User object:', req.user);
    
    // Buscar dados do usuário e filial
    const [userResult] = await pool.query(
      'SELECT u.username, e.full_name, b.name as branch_name FROM users u ' +
      'LEFT JOIN employees e ON u.id = e.user_id ' +
      'JOIN branches b ON u.branch_id = b.id ' +
      'WHERE u.id = ?',
      [userId]
    );

    console.log('Dashboard - User query result:', userResult);

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = userResult[0];

    // 1. Vendas de hoje
    const today = new Date().toISOString().split('T')[0];
    console.log('Dashboard - Data de hoje:', today);
    
    const [salesResult] = await pool.query(
      'SELECT COALESCE(SUM(o.total_amount), 0) as total_sales, COUNT(*) as total_orders ' +
      'FROM orders o ' +
      'WHERE DATE(o.created_at) = ? ' +
      'AND o.status IN ("closed", "served")',
      [today]
    );
    
    console.log('Dashboard - Vendas de hoje:', salesResult);

    // 2. Vendas de ontem para comparação
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [yesterdaySalesResult] = await pool.query(
      'SELECT COALESCE(SUM(o.total_amount), 0) as total_sales ' +
      'FROM orders o ' +
      'WHERE DATE(o.created_at) = ? ' +
      'AND o.status IN ("closed", "served")',
      [yesterday]
    );

    // 3. Status das mesas (incluindo reservas)
    const [tablesResult] = await pool.query(
      `SELECT 
        t.id, 
        t.table_number, 
        t.capacity, 
        t.status,
        COALESCE(o.id, 0) as has_order, 
        COALESCE(o.total_amount, 0) as order_total,
        COALESCE(r.id, 0) as has_reservation,
        COALESCE(r.reservation_time, '') as reservation_time,
        COALESCE(r.duration_minutes, 0) as duration_minutes,
        COALESCE(r.status, '') as reservation_status,
        COALESCE(c.full_name, '') as customer_name
      FROM tables t 
      LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ("open", "in_preparation", "ready")
      LEFT JOIN table_reservations r ON t.id = r.table_id AND r.status IN ("booked", "seated")
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY t.table_number`
    );

    // 4. Pedidos ativos
    const [activeOrdersResult] = await pool.query(
      'SELECT o.id, o.total_amount, o.status, o.created_at, ' +
      'COUNT(oi.id) as items_count, ' +
      't.table_number ' +
      'FROM orders o ' +
      'LEFT JOIN order_items oi ON o.id = oi.order_id ' +
      'LEFT JOIN tables t ON o.table_id = t.id ' +
      'WHERE o.status IN ("open", "in_preparation", "ready") ' +
      'GROUP BY o.id ' +
      'ORDER BY o.created_at DESC ' +
      'LIMIT 10'
    );

    // 5. Ticket médio
    const [avgTicketResult] = await pool.query(
      'SELECT COALESCE(AVG(o.total_amount), 0) as avg_ticket ' +
      'FROM orders o ' +
      'WHERE o.status IN ("closed", "served") ' +
      'AND DATE(o.created_at) = ?',
      [today]
    );

    // 6. Taxa de ocupação (mesas ocupadas vs total)
    const [occupancyResult] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN t.status = "occupied" THEN 1 END) as occupied_count,
        COUNT(CASE WHEN t.status = "available" THEN 1 END) as available_count,
        COUNT(CASE WHEN t.status = "reserved" THEN 1 END) as reserved_count,
        COUNT(*) as total_count
      FROM tables t`
    );

    // 7. Estoque com baixo nível
    const [lowStockResult] = await pool.query(
      'SELECT i.nome, i.quantidade_estoque, i.quantidade_minima ' +
      'FROM ingredientes i ' +
      'WHERE i.quantidade_estoque <= i.quantidade_minima ' +
      'AND i.ativo = 1 ' +
      'ORDER BY (i.quantidade_estoque / i.quantidade_minima) ASC ' +
      'LIMIT 5'
    );

    // Calcular variações percentuais
    const todaySales = parseFloat(salesResult[0].total_sales);
    const yesterdaySales = parseFloat(yesterdaySalesResult[0].total_sales);
    const salesChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0;

    const avgTicket = parseFloat(avgTicketResult[0].avg_ticket);
    const yesterdayAvgTicket = yesterdaySales > 0 ? yesterdaySales / (salesResult[0].total_orders || 1) : 0;
    const ticketChange = yesterdayAvgTicket > 0 ? ((avgTicket - yesterdayAvgTicket) / yesterdayAvgTicket) * 100 : 0;

    const occupancyRate = occupancyResult[0].total_count > 0 ? 
      (occupancyResult[0].occupied_count / occupancyResult[0].total_count) * 100 : 0;

    // Formatar dados para resposta
    const dashboardData = {
      user: {
        name: user.full_name || user.username,
        branch: user.branch_name
      },
      metrics: {
        salesToday: {
          value: todaySales.toFixed(2),
          change: salesChange.toFixed(1),
          changeType: salesChange >= 0 ? 'positive' : 'negative'
        },
        avgTicket: {
          value: avgTicket.toFixed(2),
          change: ticketChange.toFixed(1),
          changeType: ticketChange >= 0 ? 'positive' : 'negative'
        },
        occupancyRate: {
          value: occupancyRate.toFixed(1),
          progress: occupancyRate
        },
        activeOrders: {
          value: activeOrdersResult.length,
          details: `${activeOrdersResult.filter(o => o.status === 'open').length} pendentes, ${activeOrdersResult.filter(o => o.status === 'in_preparation').length} preparando`
        }
      },
      tables: tablesResult.map(table => ({
        id: table.id,
        number: table.table_number,
        capacity: table.capacity,
        status: table.status,
        hasOrder: table.has_order > 0,
        orderTotal: parseFloat(table.order_total).toFixed(2),
        hasReservation: table.has_reservation > 0,
        reservationTime: table.reservation_time,
        durationMinutes: table.duration_minutes,
        reservationStatus: table.reservation_status,
        customerName: table.customer_name
      })),
      recentOrders: activeOrdersResult.map(order => ({
        id: order.id,
        table: order.table_number || 'Delivery',
        items: order.items_count,
        total: parseFloat(order.total_amount).toFixed(2),
        status: order.status,
        createdAt: order.created_at
      })),
      lowStock: lowStockResult.map(item => ({
        name: item.nome,
        current: item.quantidade_estoque,
        minimum: item.quantidade_minima,
        percentage: ((item.quantidade_estoque / item.quantidade_minima) * 100).toFixed(1)
      })),
      summary: {
        totalTables: occupancyResult[0].total_count,
        occupiedTables: occupancyResult[0].occupied_count,
        reservedTables: occupancyResult[0].reserved_count,
        availableTables: occupancyResult[0].available_count,
        totalSales: todaySales.toFixed(2),
        totalOrders: salesResult[0].total_orders
      }
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/real-time - Dados em tempo real para atualizações
router.get('/real-time', requireAuth, async (req, res) => {
  try {
    
    // Status das mesas em tempo real (incluindo reservas)
    const [tablesResult] = await pool.query(
      `SELECT 
        t.id, 
        t.table_number, 
        t.status,
        COALESCE(o.id, 0) as has_order, 
        COALESCE(o.total_amount, 0) as order_total,
        COALESCE(r.id, 0) as has_reservation,
        COALESCE(r.reservation_time, '') as reservation_time,
        COALESCE(r.duration_minutes, 0) as duration_minutes,
        COALESCE(r.status, '') as reservation_status,
        COALESCE(c.full_name, '') as customer_name
      FROM tables t 
      LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ("open", "in_preparation", "ready")
      LEFT JOIN table_reservations r ON t.id = r.table_id AND r.status IN ("booked", "seated")
      LEFT JOIN customers c ON r.customer_id = c.id
      ORDER BY t.table_number`
    );

    // Pedidos ativos em tempo real
    const [activeOrdersResult] = await pool.query(
      'SELECT o.id, o.total_amount, o.status, o.created_at, ' +
      'COUNT(oi.id) as items_count, ' +
      't.table_number ' +
      'FROM orders o ' +
      'LEFT JOIN order_items oi ON o.id = oi.order_id ' +
      'LEFT JOIN tables t ON o.table_id = t.id ' +
      'WHERE o.status IN ("open", "in_preparation", "ready") ' +
      'GROUP BY o.id ' +
      'ORDER BY o.created_at DESC'
    );

    res.json({
      tables: tablesResult.map(table => ({
        id: table.id,
        number: table.table_number,
        status: table.status,
        hasOrder: table.has_order > 0,
        orderTotal: parseFloat(table.order_total).toFixed(2),
        hasReservation: table.has_reservation > 0,
        reservationTime: table.reservation_time,
        durationMinutes: table.duration_minutes,
        reservationStatus: table.reservation_status,
        customerName: table.customer_name
      })),
      activeOrders: activeOrdersResult.map(order => ({
        id: order.id,
        table: order.table_number || 'Delivery',
        items: order.items_count,
        total: parseFloat(order.total_amount).toFixed(2),
        status: order.status,
        createdAt: order.created_at
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar dados em tempo real:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
