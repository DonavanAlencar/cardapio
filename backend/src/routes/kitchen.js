const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário tem acesso à cozinha
const authorizeKitchenAccess = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'cozinha' && req.user.role !== 'waiter') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para acessar a cozinha.' });
  }
  next();
};

// Listar todos os pedidos da cozinha com filtros
router.get('/orders', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const {
      status,
      branch_id,
      date_from,
      date_to,
      search,
      limit = 100
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (branch_id) {
      whereClause += ' AND t.branch_id = ?';
      params.push(branch_id);
    } else if (req.user.branch_id) {
      whereClause += ' AND t.branch_id = ?';
      params.push(req.user.branch_id);
    }

    if (date_from) {
      whereClause += ' AND o.created_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND o.created_at <= ?';
      params.push(date_to);
    }

    if (search) {
      whereClause += ' AND (c.full_name LIKE ? OR t.table_number LIKE ? OR p.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        c.id as customer_id,
        c.full_name as customer_name,
        c.phone as customer_phone,
        t.id as table_id,
        t.table_number as table_name,
        t.capacity as table_capacity,
        t.branch_id,
        b.name as branch_name,
        COUNT(oi.id) as total_items,
        SUM(CASE WHEN oi.status = 'pending' THEN 1 ELSE 0 END) as pending_items,
        SUM(CASE WHEN oi.status = 'in_preparation' THEN 1 ELSE 0 END) as preparing_items,
        SUM(CASE WHEN oi.status = 'ready' THEN 1 ELSE 0 END) as ready_items,
        SUM(CASE WHEN oi.status = 'served' THEN 1 ELSE 0 END) as served_items
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN tables t ON t.id = o.table_id
       LEFT JOIN branches b ON b.id = t.branch_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${whereClause}
       GROUP BY o.id
       ORDER BY 
        CASE o.status
          WHEN 'pending' THEN 1
          WHEN 'in_preparation' THEN 2
          WHEN 'ready' THEN 3
          WHEN 'served' THEN 4
          ELSE 5
        END,
        o.created_at ASC
       LIMIT ?`,
      [...params, parseInt(limit)]
    );

    // Buscar itens para cada pedido
    for (let order of orders) {
      const [items] = await pool.query(
        `SELECT 
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
          oi.status as item_status,
          oi.created_at,
          p.name as product_name,
          p.description as product_description,
          pc.name as category_name,
          GROUP_CONCAT(
            CONCAT(pm.nome, ' (', pm.tipo, ')') 
            SEPARATOR ', '
          ) as modifiers
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         LEFT JOIN product_categories pc ON pc.id = p.category_id
         LEFT JOIN order_item_modifiers oim ON oim.order_item_id = oi.id
         LEFT JOIN produto_modificadores pm ON pm.id = oim.modifier_id
         WHERE oi.order_id = ?
         GROUP BY oi.id
         ORDER BY oi.created_at ASC`,
        [order.id]
      );

      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar pedidos da cozinha:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar pedidos por status específico
router.get('/orders/status/:status', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'in_preparation', 'ready', 'served', 'closed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        c.full_name as customer_name,
        t.table_number as table_name,
        COUNT(oi.id) as total_items
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN tables t ON t.id = o.table_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.status = ? AND t.branch_id = ?
       GROUP BY o.id
       ORDER BY o.created_at ASC`,
      [status, req.user.branch_id]
    );

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar pedidos por status:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar pedidos urgentes
router.get('/orders/urgent', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const branchId = req.user.branch_id;

    // Pedidos pendentes há mais de 30 minutos
    const [urgentOrders] = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        c.full_name as customer_name,
        t.table_number as table_name,
        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_waiting
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE o.status IN ('pending', 'in_preparation')
         AND t.branch_id = ?
         AND o.created_at <= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       ORDER BY o.created_at ASC`,
      [branchId]
    );

    res.json(urgentOrders);
  } catch (err) {
    console.error('Erro ao buscar pedidos urgentes:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar detalhes de um pedido específico
router.get('/orders/:id', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar dados do pedido
    const [orderRows] = await pool.query(
      `SELECT 
        o.*,
        c.full_name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        t.table_number as table_name,
        t.capacity as table_capacity,
        b.name as branch_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN tables t ON t.id = o.table_id
       LEFT JOIN branches b ON b.id = t.branch_id
       WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    const order = orderRows[0];

    // Buscar itens do pedido
    const [items] = await pool.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.description as product_description,
        pc.name as category_name,
        GROUP_CONCAT(
          CONCAT(pm.nome, ' (', pm.tipo, ')') 
          SEPARATOR ', '
        ) as modifiers
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN product_categories pc ON pc.id = p.category_id
       LEFT JOIN order_item_modifiers oim ON oim.order_item_id = oi.id
       LEFT JOIN produto_modificadores pm ON pm.id = oim.modifier_id
       WHERE oi.order_id = ?
       GROUP BY oi.id
       ORDER BY oi.created_at ASC`,
      [id]
    );

    order.items = items;

    // Buscar kitchen ticket se existir
    const [tickets] = await pool.query(
      `SELECT 
        kt.*,
        GROUP_CONCAT(
          CONCAT(kti.preparation_status, ':', kti.prepared_at)
          SEPARATOR ', '
        ) as item_statuses
       FROM kitchen_tickets kt
       LEFT JOIN kitchen_ticket_items kti ON kti.kitchen_ticket_id = kt.id
       WHERE kt.order_id = ?
       GROUP BY kt.id`,
      [id]
    );

    order.kitchen_tickets = tickets;

    res.json(order);
  } catch (err) {
    console.error('Erro ao buscar detalhes do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Atualizar status de um pedido
router.patch('/orders/:id/status', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'in_preparation', 'ready', 'served', 'closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    // Atualizar status do pedido
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    // Se o status for 'ready', atualizar todos os itens para 'ready'
    if (status === 'ready') {
      await pool.query(
        'UPDATE order_items SET status = ? WHERE order_id = ?',
        ['ready', id]
      );
    }

    // Se o status for 'served', atualizar todos os itens para 'served'
    if (status === 'served') {
      await pool.query(
        'UPDATE order_items SET status = ? WHERE order_id = ?',
        ['served', id]
      );
    }

    // Adicionar observações se fornecidas
    if (notes) {
      await pool.query(
        'INSERT INTO order_notes (order_id, notes, created_by) VALUES (?, ?, ?)',
        [id, notes, req.user.id]
      );
    }

    // Emitir evento WebSocket para atualização em tempo real
    if (req.app.locals.emitToRoom) {
      req.app.locals.emitToRoom('kitchen', 'order:status_changed', {
        orderId: id,
        newStatus: status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Status do pedido atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Atualizar status de um item específico
router.patch('/orders/:orderId/items/:itemId/status', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_preparation', 'ready', 'served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    // Atualizar status do item
    await pool.query(
      'UPDATE order_items SET status = ?, updated_at = NOW() WHERE id = ? AND order_id = ?',
      [status, itemId, orderId]
    );

    // Verificar se todos os itens estão prontos para atualizar o status do pedido
    const [itemStatuses] = await pool.query(
      'SELECT status FROM order_items WHERE order_id = ?',
      [orderId]
    );

    const allReady = itemStatuses.every(item => item.status === 'ready');
    const allServed = itemStatuses.every(item => item.status === 'served');

    if (allReady) {
      await pool.query(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        ['ready', orderId]
      );
    } else if (allServed) {
      await pool.query(
        'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
        ['served', orderId]
      );
    }

    // Emitir evento WebSocket
    if (req.app.locals.emitToRoom) {
      req.app.locals.emitToRoom('kitchen', 'item:status_changed', {
        orderId,
        itemId,
        newStatus: status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Status do item atualizado com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar status do item:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Marcar pedido como pronto
router.patch('/orders/:id/ready', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;

    // Atualizar status do pedido e todos os itens
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['ready', id]
    );

    await pool.query(
      'UPDATE order_items SET status = ?, updated_at = NOW() WHERE order_id = ?',
      ['ready', id]
    );

    // Emitir evento WebSocket
    if (req.app.locals.emitToRoom) {
      req.app.locals.emitToRoom('kitchen', 'order:ready', {
        orderId: id,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Pedido marcado como pronto.' });
  } catch (err) {
    console.error('Erro ao marcar pedido como pronto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Marcar pedido como entregue
router.patch('/orders/:id/delivered', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;

    // Atualizar status do pedido e todos os itens
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['served', id]
    );

    await pool.query(
      'UPDATE order_items SET status = ?, updated_at = NOW() WHERE order_id = ?',
      ['served', id]
    );

    // Emitir evento WebSocket
    if (req.app.locals.emitToRoom) {
      req.app.locals.emitToRoom('kitchen', 'order:delivered', {
        orderId: id,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Pedido marcado como entregue.' });
  } catch (err) {
    console.error('Erro ao marcar pedido como entregue:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Adicionar observações ao pedido
router.post('/orders/:id/notes', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim() === '') {
      return res.status(400).json({ message: 'Observações são obrigatórias.' });
    }

    // Verificar se a tabela order_notes existe, se não, criar
    const [tableExists] = await pool.query(
      "SHOW TABLES LIKE 'order_notes'"
    );

    if (tableExists.length === 0) {
      await pool.query(`
        CREATE TABLE order_notes (
          id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
          order_id BIGINT UNSIGNED NOT NULL,
          notes TEXT NOT NULL,
          created_by BIGINT UNSIGNED NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY fk_order_notes_order (order_id),
          CONSTRAINT fk_order_notes_order FOREIGN KEY (order_id) REFERENCES orders (id)
        )
      `);
    }

    // Inserir observação
    await pool.query(
      'INSERT INTO order_notes (order_id, notes, created_by) VALUES (?, ?, ?)',
      [id, notes.trim(), req.user.id]
    );

    res.json({ message: 'Observação adicionada com sucesso.' });
  } catch (err) {
    console.error('Erro ao adicionar observação:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar estatísticas da cozinha
router.get('/stats', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { branch_id } = req.query;
    const branchId = branch_id || req.user.branch_id;

    const [stats] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.status = 'in_preparation' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN o.status = 'ready' THEN 1 END) as ready_orders,
        COUNT(CASE WHEN o.status = 'served' THEN 1 END) as served_orders,
        COUNT(CASE WHEN o.status = 'closed' THEN 1 END) as closed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders,
        AVG(CASE WHEN o.status IN ('ready', 'served') THEN TIMESTAMPDIFF(MINUTE, o.created_at, o.updated_at) END) as avg_preparation_time,
        SUM(CASE WHEN o.status IN ('pending', 'in_preparation') THEN o.total_amount END) as pending_amount
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE t.branch_id = ? AND o.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      [branchId]
    );

    res.json(stats[0]);
  } catch (err) {
    console.error('Erro ao buscar estatísticas da cozinha:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar histórico de pedidos
router.get('/orders/history', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      status,
      branch_id,
      limit = 50
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date_from) {
      whereClause += ' AND o.created_at >= ?';
      params.push(date_from);
    }

    if (date_to) {
      whereClause += ' AND o.created_at <= ?';
      params.push(date_to);
    }

    if (status) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (branch_id) {
      whereClause += ' AND t.branch_id = ?';
      params.push(branch_id);
    } else if (req.user.branch_id) {
      whereClause += ' AND t.branch_id = ?';
      params.push(req.user.branch_id);
    }

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at,
        c.full_name as customer_name,
        t.table_number as table_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       LEFT JOIN tables t ON t.id = o.table_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar histórico de pedidos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar pedidos por mesa
router.get('/orders/table/:tableId', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { tableId } = req.params;
    const branchId = req.user.branch_id;

    // Verificar se a mesa pertence à filial do usuário
    const [tableCheck] = await pool.query(
      'SELECT branch_id FROM tables WHERE id = ?',
      [tableId]
    );

    if (tableCheck.length === 0) {
      return res.status(404).json({ message: 'Mesa não encontrada.' });
    }

    if (tableCheck[0].branch_id !== branchId) {
      return res.status(403).json({ message: 'Acesso negado a esta mesa.' });
    }

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        c.full_name as customer_name
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.table_id = ? AND o.status IN ('pending', 'in_preparation', 'ready')
       ORDER BY o.created_at DESC`,
      [tableId]
    );

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar pedidos da mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar pedidos por cliente
router.get('/orders/customer/:customerId', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { customerId } = req.params;
    const branchId = req.user.branch_id;

    const [orders] = await pool.query(
      `SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.created_at,
        t.table_number as table_name
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       WHERE o.customer_id = ? AND t.branch_id = ? AND o.status IN ('pending', 'in_preparation', 'ready')
       ORDER BY o.created_at DESC`,
      [customerId, branchId]
    );

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar pedidos do cliente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Cancelar pedido
router.patch('/orders/:id/cancel', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Motivo do cancelamento é obrigatório.' });
    }

    // Atualizar status do pedido
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', id]
    );

    // Atualizar status dos itens
    await pool.query(
      'UPDATE order_items SET status = ?, updated_at = NOW() WHERE order_id = ?',
      ['cancelled', id]
    );

    // Adicionar observação sobre o cancelamento
    try {
      await pool.query(
        'INSERT INTO order_notes (order_id, notes, created_by) VALUES (?, ?, ?)',
        [id, `Pedido cancelado: ${reason}`, req.user.id]
      );
    } catch (noteErr) {
      console.warn('Não foi possível adicionar nota de cancelamento:', noteErr);
    }

    // Emitir evento WebSocket
    if (req.app.locals.emitToRoom) {
      req.app.locals.emitToRoom('kitchen', 'order:cancelled', {
        orderId: id,
        reason,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Pedido cancelado com sucesso.' });
  } catch (err) {
    console.error('Erro ao cancelar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Reativar pedido cancelado
router.patch('/orders/:id/reactivate', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o pedido está cancelado
    const [orderCheck] = await pool.query(
      'SELECT status FROM orders WHERE id = ?',
      [id]
    );

    if (orderCheck.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }

    if (orderCheck[0].status !== 'cancelled') {
      return res.status(400).json({ message: 'Apenas pedidos cancelados podem ser reativados.' });
    }

    // Reativar pedido
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['pending', id]
    );

    // Reativar itens
    await pool.query(
      'UPDATE order_items SET status = ?, updated_at = NOW() WHERE order_id = ?',
      ['pending', id]
    );

    // Adicionar observação sobre a reativação
    try {
      await pool.query(
        'INSERT INTO order_notes (order_id, notes, created_by) VALUES (?, ?, ?)',
        [id, 'Pedido reativado', req.user.id]
      );
    } catch (noteErr) {
      console.warn('Não foi possível adicionar nota de reativação:', noteErr);
    }

    // Emitir evento WebSocket
    if (req.app.locals.emitToRoom) {
      req.app.locals.emitToRoom('kitchen', 'order:reactivated', {
        orderId: id,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ message: 'Pedido reativado com sucesso.' });
  } catch (err) {
    console.error('Erro ao reativar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar produtos com estoque baixo
router.get('/stock/low', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        pc.name as category_name,
        i.nome as ingredient_name,
        i.quantidade_estoque,
        i.quantidade_minima,
        CASE 
          WHEN i.quantidade_estoque <= i.quantidade_minima THEN 'CRÍTICO'
          WHEN i.quantidade_estoque <= (i.quantidade_minima * 1.5) THEN 'BAIXO'
          ELSE 'NORMAL'
        END as stock_level
       FROM products p
       JOIN product_categories pc ON pc.id = p.category_id
       JOIN produto_ingredientes pi ON pi.product_id = p.id
       JOIN ingredientes i ON i.id = pi.ingrediente_id
       WHERE i.quantidade_estoque <= (i.quantidade_minima * 1.5)
       ORDER BY 
        CASE 
          WHEN i.quantidade_estoque <= i.quantidade_minima THEN 1
          ELSE 2
        END,
        i.quantidade_estoque ASC`
    );

    res.json(products);
  } catch (err) {
    console.error('Erro ao buscar produtos com estoque baixo:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar ingredientes com estoque baixo
router.get('/ingredients/low-stock', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    const [ingredients] = await pool.query(
      `SELECT 
        id,
        nome,
        unidade_medida,
        quantidade_estoque,
        quantidade_minima,
        CASE 
          WHEN quantidade_estoque <= quantidade_minima THEN 'CRÍTICO'
          WHEN quantidade_estoque <= (quantidade_minima * 1.5) THEN 'BAIXO'
          ELSE 'NORMAL'
        END as stock_level
       FROM ingredientes
       WHERE quantidade_estoque <= (quantidade_minima * 1.5)
       ORDER BY 
        CASE 
          WHEN quantidade_estoque <= quantidade_minima THEN 1
          ELSE 2
        END,
        quantidade_estoque ASC`
    );

    res.json(ingredients);
  } catch (err) {
    console.error('Erro ao buscar ingredientes com estoque baixo:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Listar tickets e itens por status (para cozinha e garçom) - Mantido para compatibilidade
router.get('/tickets', auth(), authorizeKitchenAccess, async (req, res) => {
  try {
    // Tickets com itens e status
    const [tickets] = await pool.query(
      `SELECT kt.id as ticket_id, kt.order_id, kt.status as ticket_status, kt.sent_at,
              kti.id as ticket_item_id, kti.order_item_id, kti.preparation_status, kti.prepared_at,
              oi.product_id, oi.quantity, p.name as product_name
       FROM kitchen_tickets kt
       JOIN kitchen_ticket_items kti ON kti.kitchen_ticket_id = kt.id
       JOIN order_items oi ON kti.order_item_id = oi.id
       JOIN products p ON oi.product_id = p.id
       ORDER BY kt.sent_at DESC, kti.id`);
    res.json(tickets);
  } catch (err) {
    console.error('Erro ao buscar kitchen tickets:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Atualizar status do item (pendente → preparo → pronto → entregue) - Mantido para compatibilidade
router.put('/tickets/:ticketId/items/:itemId/status', auth(), authorizeKitchenAccess, async (req, res) => {
  const { ticketId, itemId } = req.params;
  const { preparation_status } = req.body; // 'pending', 'preparing', 'done', 'served'
  if (!['pending', 'preparing', 'done', 'served'].includes(preparation_status)) {
    return res.status(400).json({ message: 'Status inválido.' });
  }
  try {
    await pool.query(
      'UPDATE kitchen_ticket_items SET preparation_status = ?, prepared_at = IF(? = "done", NOW(), prepared_at) WHERE id = ? AND kitchen_ticket_id = ?',
      [preparation_status, preparation_status, itemId, ticketId]
    );
    res.json({ message: 'Status atualizado.' });
  } catch (err) {
    console.error('Erro ao atualizar status do item:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Contar pedidos pendentes para badge da cozinha
router.get('/pending-count', auth(), async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT COUNT(DISTINCT kt.order_id) as count
      FROM kitchen_tickets kt
      JOIN kitchen_ticket_items kti ON kti.kitchen_ticket_id = kt.id
      WHERE kti.preparation_status IN ('pending', 'preparing')
      AND kt.status IN ('pending', 'in_progress')
    `);
    
    res.json({ count: result[0].count });
  } catch (err) {
    console.error('Erro ao contar pedidos pendentes da cozinha:', err);
    res.status(500).json({ message: 'Erro interno ao contar pedidos pendentes' });
  }
});

module.exports = router; 