const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Rota para listar todos os métodos de pagamento
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_methods ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar métodos de pagamento:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
