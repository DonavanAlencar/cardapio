const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth('admin'));

// Listar mesas (tables)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, branch_id, table_number, capacity, status, created_at, updated_at FROM tables');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar tables:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Criar mesa (table)
router.post('/', async (req, res) => {
  const { table_number, capacity, status, branch_id } = req.body;
  if (!table_number || !capacity || !branch_id) {
    return res.status(400).json({ message: 'table_number, capacity e branch_id são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tables (table_number, capacity, status, branch_id) VALUES (?, ?, ?, ?)',
      [table_number, capacity, status || 'available', branch_id]
    );
    res.status(201).json({ id: result.insertId, table_number, capacity, status: status || 'available', branch_id });
  } catch (err) {
    console.error('Erro ao criar table:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Atualizar mesa (table)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { table_number, capacity, status, branch_id } = req.body;
  if (!table_number || !capacity || !branch_id) {
    return res.status(400).json({ message: 'table_number, capacity e branch_id são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE tables SET table_number=?, capacity=?, status=?, branch_id=? WHERE id=?',
      [table_number, capacity, status, branch_id, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Table não encontrada.' });
    }
    res.json({ id, table_number, capacity, status, branch_id });
  } catch (err) {
    console.error('Erro ao atualizar table:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Deletar mesa (table)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tables WHERE id=?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Table não encontrada.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar table:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;