// src/routes/payments.js

const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Só admins ou financeiro podem confirmar pagamentos
const authorizeFinance = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin' && role !== 'financeiro') {
    return res.status(403).json({ message: 'Acesso negado: permissão insuficiente.' });
  }
  next();
};

router.post(
  '/confirm',
  auth,
  authorizeFinance,
  async (req, res) => {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'orderId e amount são obrigatórios.' });
    }

    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // 1) Fecha o pedido
      const [upd] = await conn.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['closed', orderId]
      );

      if (upd.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({ message: 'Pedido não encontrado.' });
      }

      // 2) Registra o pagamento (supondo que exista tabela payments)
      await conn.query(
        'INSERT INTO payments (order_id, amount, paid_at) VALUES (?, ?, NOW())',
        [orderId, amount]
      );

      await conn.commit();
      return res.json({ message: 'Pagamento confirmado e pedido fechado.' });
    } catch (err) {
      if (conn) await conn.rollback();
      console.error('Erro no confirmamento de pagamento:', err);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
      if (conn) conn.release();
    }
  }
);

module.exports = router;
