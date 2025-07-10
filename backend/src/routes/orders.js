const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é garçom, admin ou gerente
const authorizeWaiterAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'waiter' && req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar pedidos.' });
  }
  next();
};

// Rota para listar todos os pedidos
router.get('/', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para buscar um pedido específico com seus itens
router.get('/:id', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    const order = orderRows[0];

    const [itemRows] = await pool.query(
      `SELECT oi.*, p.name as product_name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );
    order.items = itemRows;

    res.json(order);
  } catch (err) {
    console.error('Erro ao buscar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo pedido
router.post('/', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  const { customer_id, table_id, waiter_session_id, items } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      'INSERT INTO orders (customer_id, table_id, waiter_session_id) VALUES (?, ?, ?)',
      [customer_id || null, table_id || null, waiter_session_id || null]
    );
    const orderId = result.insertId;
    let totalAmount = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        const [productPriceRows] = await connection.query(
          'SELECT price FROM product_prices WHERE product_id = ? AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY start_date DESC LIMIT 1',
          [item.product_id]
        );
        const unitPrice = productPriceRows.length > 0 ? productPriceRows[0].price : 0;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        // Dedução de estoque
        const [ingredientsRows] = await connection.query(
          'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
          [item.product_id]
        );

        for (const ing of ingredientsRows) {
          const requiredQuantity = ing.quantidade * item.quantity;
          const [stockRows] = await connection.query(
            'SELECT quantidade_estoque FROM ingredientes WHERE id = ?',
            [ing.ingrediente_id]
          );
          if (stockRows.length === 0 || stockRows[0].quantidade_estoque < requiredQuantity) {
            throw new Error(`Estoque insuficiente para o ingrediente ${ing.ingrediente_id}`);
          }
          await connection.query(
            'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
            [requiredQuantity, ing.ingrediente_id]
          );
        }

        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, unitPrice, totalPrice]
        );
      }
    }

    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [totalAmount, orderId]);

    await connection.commit();
    res.status(201).json({ id: orderId, customer_id, table_id, waiter_session_id, total_amount: totalAmount, items });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para adicionar um item a um pedido existente
router.post('/:orderId/items', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  const { orderId } = req.params;
  const { product_id, quantity } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    let currentTotalAmount = orderRows[0].total_amount;

    const [productPriceRows] = await connection.query(
      'SELECT price FROM product_prices WHERE product_id = ? AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY start_date DESC LIMIT 1',
      [product_id]
    );
    const unitPrice = productPriceRows.length > 0 ? productPriceRows[0].price : 0;
    const totalPrice = unitPrice * quantity;

    const [result] = await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
      [orderId, product_id, quantity, unitPrice, totalPrice]
    );
    const newItemId = result.insertId;

    // Dedução de estoque para item adicionado
    const [ingredientsRows] = await connection.query(
      'SELECT ingrediente_id, quantidade FROM produto_ingredientes WHERE product_id = ?',
      [product_id]
    );

    for (const ing of ingredientsRows) {
      const requiredQuantity = ing.quantidade * quantity;
      const [stockRows] = await connection.query(
        'SELECT quantidade_estoque FROM ingredientes WHERE id = ?',
        [ing.ingrediente_id]
      );
      if (stockRows.length === 0 || stockRows[0].quantidade_estoque < requiredQuantity) {
        throw new Error(`Estoque insuficiente para o ingrediente ${ing.ingrediente_id}`);
      }
      await connection.query(
        'UPDATE ingredientes SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?',
        [requiredQuantity, ing.ingrediente_id]
      );
    }

    currentTotalAmount += totalPrice;
    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [currentTotalAmount, orderId]);

    await connection.commit();
    res.status(201).json({ id: newItemId, order_id: orderId, product_id, quantity, unit_price: unitPrice, total_price: totalPrice });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao adicionar item ao pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para atualizar um item de pedido
router.put('/:orderId/items/:itemId', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderItemRows] = await connection.query('SELECT * FROM order_items WHERE id = ? AND order_id = ?', [itemId, orderId]);
    if (orderItemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item de pedido não encontrado.' });
    }
    const oldOrderItem = orderItemRows[0];

    const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
    let currentTotalAmount = orderRows[0].total_amount;

    const newTotalPrice = oldOrderItem.unit_price * quantity;
    currentTotalAmount = currentTotalAmount - oldOrderItem.total_price + newTotalPrice;

    await connection.query(
      'UPDATE order_items SET quantity = ?, total_price = ? WHERE id = ?',
      [quantity, newTotalPrice, itemId]
    );
    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [currentTotalAmount, orderId]);

    await connection.commit();
    res.json({ id: itemId, order_id: orderId, product_id: oldOrderItem.product_id, quantity, unit_price: oldOrderItem.unit_price, total_price: newTotalPrice });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao atualizar item do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

// Rota para deletar um item de pedido
router.delete('/:orderId/items/:itemId', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  const { orderId, itemId } = req.params;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderItemRows] = await connection.query('SELECT total_price FROM order_items WHERE id = ? AND order_id = ?', [itemId, orderId]);
    if (orderItemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item de pedido não encontrado.' });
    }
    const itemTotalPrice = orderItemRows[0].total_price;

    await connection.query('DELETE FROM order_items WHERE id = ?', [itemId]);

    const [orderRows] = await connection.query('SELECT total_amount FROM orders WHERE id = ?', [orderId]);
    let currentTotalAmount = orderRows[0].total_amount;
    currentTotalAmount -= itemTotalPrice;
    await connection.query('UPDATE orders SET total_amount = ? WHERE id = ?', [currentTotalAmount, orderId]);

    await connection.commit();
    res.status(204).send();
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Erro ao deletar item do pedido:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
