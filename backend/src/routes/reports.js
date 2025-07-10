const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para acessar relatórios.' });
  }
  next();
};

// Relatório de Vendas do Dia
router.get('/daily-sales', auth, authorizeAdminOrManager, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         DATE(p.paid_at) as sale_date,
         pm.name as payment_method,
         SUM(p.amount) as total_amount
       FROM payments p
       JOIN payment_methods pm ON p.payment_method_id = pm.id
       WHERE DATE(p.paid_at) = CURDATE()
       GROUP BY DATE(p.paid_at), pm.name
       ORDER BY sale_date DESC, pm.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar relatório de vendas diárias:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Relatório de Consumo de Insumos (simplificado para MVP)
router.get('/ingredient-consumption', auth, authorizeAdminOrManager, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         i.nome as ingredient_name,
         i.unidade_medida,
         SUM(em.quantidade) as total_consumed
       FROM estoque_movimentos em
       JOIN ingredientes i ON em.ingrediente_id = i.id
       WHERE em.tipo_movimento = 'SAIDA' AND DATE(em.ocorrido_em) = CURDATE()
       GROUP BY i.nome, i.unidade_medida
       ORDER BY total_consumed DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar relatório de consumo de insumos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
