const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou garçom
const authorizeAdminOrWaiter = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'waiter') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  next();
};

// Listar todos os clientes
router.get('/', auth(), authorizeAdminOrWaiter, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY full_name');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar clientes com autocomplete
router.get('/search', auth(), authorizeAdminOrWaiter, async (req, res) => {
  const { q } = req.query;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE full_name LIKE ? OR email LIKE ? ORDER BY full_name LIMIT 10',
      [`%${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Buscar cliente por ID
router.get('/:id', auth(), authorizeAdminOrWaiter, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar cliente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Criar novo cliente
router.post('/', auth(), authorizeAdminOrWaiter, async (req, res) => {
  const { full_name, email, phone } = req.body;
  
  if (!full_name) {
    return res.status(400).json({ message: 'Nome é obrigatório.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO customers (full_name, email, phone) VALUES (?, ?, ?)',
      [full_name, email || null, phone || null]
    );
    
    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(newCustomer[0]);
  } catch (err) {
    console.error('Erro ao criar cliente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Atualizar cliente
router.put('/:id', auth(), authorizeAdminOrWaiter, async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone } = req.body;
  
  if (!full_name) {
    return res.status(400).json({ message: 'Nome é obrigatório.' });
  }

  try {
    await pool.query(
      'UPDATE customers SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [full_name, email || null, phone || null, id]
    );
    
    const [updatedCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (updatedCustomer.length === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    
    res.json(updatedCustomer[0]);
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Deletar cliente
router.delete('/:id', auth(), authorizeAdminOrWaiter, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar cliente:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router; 