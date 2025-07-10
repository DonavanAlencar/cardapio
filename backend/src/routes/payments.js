const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é garçom, admin ou gerente
const authorizeWaiterAdminOrManager = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'waiter' && role !== 'admin' && role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar pagamentos.' });
  }
  next();
};

// Rota para registrar um novo pagamento e fechar o pedido
router.post('/', auth, authorizeWaiterAdminOrManager, async (req, res) => {
  const { order_id, payment_method_id, amount } = req.body;
  const operator_id = req.user.id;

  // Validações básicas
  if (!order_id || !payment_method_id || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'ID do pedido, método de pagamento e valor são obrigatórios e devem ser válidos.' });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    // 1. Registrar o pagamento
    const [paymentResult] = await conn.query(
      'INSERT INTO payments (order_id, payment_method_id, amount, paid_at, operator_id) VALUES (?, ?, ?, NOW(), ?)',
      [order_id, payment_method_id, amount, operator_id]
    );

    // 2. Fechar o pedido
    const [orderUpdateResult] = await conn.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['closed', order_id]
    );

    if (orderUpdateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Pedido não encontrado para fechamento.' });
    }

    await conn.commit();
    return res.status(201).json({
      id: paymentResult.insertId,
      order_id,
      payment_method_id,
      amount,
      operator_id
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Erro ao registrar pagamento e fechar pedido:', err);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
