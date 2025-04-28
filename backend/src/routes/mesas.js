const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin'));

// Listar mesas
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT id, numero, status FROM mesas');
  res.json(rows);
});

// Criar mesa
router.post('/', async (req, res) => {
  const { numero } = req.body;
  const [result] = await pool.query('INSERT INTO mesas(numero, status) VALUES (?, "livre")', [numero]);
  res.status(201).json({ id: result.insertId, numero, status: 'livre' });
});

// Atualizar mesa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { numero, status } = req.body;
  await pool.query('UPDATE mesas SET numero=?, status=? WHERE id=?', [numero, status, id]);
  res.json({ id, numero, status });
});

// Deletar mesa
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM mesas WHERE id = ?', [id]);
  res.sendStatus(204);
});

module.exports = router;