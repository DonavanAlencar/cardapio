const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Vendas do dia
router.get('/daily-sales', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) as dia, SUM(total_amount) as total_vendas, COUNT(*) as pedidos
       FROM orders
       WHERE DATE(created_at) = CURDATE() AND status = 'closed'
       GROUP BY dia`
    );
    res.json(rows[0] || { dia: new Date().toISOString().slice(0,10), total_vendas: 0, pedidos: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar vendas do dia.' });
  }
});

// Consumo de insumos
router.get('/ingredient-consumption', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.nome, SUM(oi.quantity * pi.quantidade) as total_consumido, i.unidade_medida
       FROM order_items oi
       JOIN produto_ingredientes pi ON oi.product_id = pi.product_id
       JOIN ingredientes i ON pi.ingrediente_id = i.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'closed' AND DATE(o.created_at) = CURDATE()
       GROUP BY i.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar consumo de insumos.' });
  }
});

// Alertas de estoque baixo
router.get('/low-stock', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nome, quantidade_estoque, quantidade_minima, unidade_medida
       FROM ingredientes
       WHERE quantidade_estoque <= quantidade_minima`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar alertas de estoque.' });
  }
});

module.exports = router;
