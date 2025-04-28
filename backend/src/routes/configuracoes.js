const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin'));

// Obter configuração de comissão
router.get('/comissao', async (req, res) => {
  const [[cfg]] = await pool.query('SELECT percentual_comissao FROM configuracoes LIMIT 1');
  res.json({ percentual: cfg.percentual_comissao });
});

// Atualizar comissão global
router.put('/comissao', async (req, res) => {
  const { percentual } = req.body;
  await pool.query('UPDATE configuracoes SET percentual_comissao = ? WHERE id = 1', [percentual]);
  res.json({ percentual });
});

module.exports = router;