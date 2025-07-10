const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar mesas.' });
  }
  next();
};

// Rota para listar todas as mesas
router.get('/', auth, async (req, res) => {
  try {
    // Filtrar mesas pela branch_id do usuário logado
    const [rows] = await pool.query('SELECT * FROM tables WHERE branch_id = ? ORDER BY table_number', [req.user.branch_id]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar mesas:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar uma nova mesa (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, async (req, res) => {
  const { table_number, capacity, status } = req.body;
  const branch_id = req.user.branch_id; // Associar à branch do usuário logado

  if (!table_number || !capacity) {
    return res.status(400).json({ message: 'Número da mesa e capacidade são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tables (branch_id, table_number, capacity, status) VALUES (?, ?, ?, ?)',
      [branch_id, table_number, capacity, status || 'available']
    );
    res.status(201).json({ id: result.insertId, branch_id, table_number, capacity, status: status || 'available' });
  } catch (err) {
    console.error('Erro ao criar mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar uma mesa (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { table_number, capacity, status } = req.body;
  const branch_id = req.user.branch_id; // Garantir que a mesa pertence à branch do usuário

  if (!table_number || !capacity) {
    return res.status(400).json({ message: 'Número da mesa e capacidade são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE tables SET table_number = ?, capacity = ?, status = ? WHERE id = ? AND branch_id = ?',
      [table_number, capacity, status || 'available', id, branch_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mesa não encontrada ou não pertence à sua filial.' });
    }
    res.json({ id, branch_id, table_number, capacity, status: status || 'available' });
  } catch (err) {
    console.error('Erro ao atualizar mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para deletar uma mesa (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const branch_id = req.user.branch_id; // Garantir que a mesa pertence à branch do usuário

  try {
    const [result] = await pool.query('DELETE FROM tables WHERE id = ? AND branch_id = ?', [id, branch_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mesa não encontrada ou não pertence à sua filial.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Erro ao deletar mesa:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
