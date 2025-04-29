const express = require('express');
const pool    = require('../config/db');
const auth    = require('../middleware/authMiddleware');

const router = express.Router();
// Todas as operações de branches exigem usuário admin
router.use(auth('admin'));

/**
 * GET /api/branches
 * Lista todas as filiais
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, address, created_at, updated_at FROM branches'
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao listar branches:', err);
    res.status(500).json({ message: 'Erro interno ao listar filiais' });
  }
});

/**
 * GET /api/branches/:id
 * Obtém uma filial pelo ID
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, address, created_at, updated_at FROM branches WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Filial não encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`Erro ao buscar branch ${id}:`, err);
    res.status(500).json({ message: 'Erro interno ao buscar filial' });
  }
});

/**
 * POST /api/branches
 * Cria uma nova filial
 * Body: { name: string, address?: string }
 */
router.post('/', async (req, res) => {
  const { name, address } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Campo obrigatório: name' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO branches (name, address) VALUES (?, ?)',
      [name, address || null]
    );
    res.status(201).json({ id: result.insertId, name, address: address || null });
  } catch (err) {
    console.error('Erro ao criar branch:', err);
    res.status(500).json({ message: 'Erro interno ao criar filial' });
  }
});

/**
 * PUT /api/branches/:id
 * Atualiza dados de uma filial
 * Body: { name: string, address?: string }
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Campo obrigatório: name' });
  }
  try {
    const [result] = await pool.query(
      `UPDATE branches 
         SET name = ?, address = ?
       WHERE id = ?`,
      [name, address || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Filial não encontrada' });
    }
    res.json({ id, name, address: address || null });
  } catch (err) {
    console.error(`Erro ao atualizar branch ${id}:`, err);
    res.status(500).json({ message: 'Erro interno ao atualizar filial' });
  }
});

/**
 * DELETE /api/branches/:id
 * Remove uma filial
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM branches WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Filial não encontrada' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(`Erro ao deletar branch ${id}:`, err);
    res.status(500).json({ message: 'Erro interno ao deletar filial' });
  }
});

module.exports = router;
