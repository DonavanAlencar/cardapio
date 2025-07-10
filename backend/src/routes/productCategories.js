const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar categorias de produtos.' });
  }
  next();
};

// Rota para listar todas as categorias de produtos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_categories ORDER BY display_order, name');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar categorias de produtos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar uma nova categoria de produto (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, async (req, res) => {
  const { name, description, display_order } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO product_categories (name, description, display_order) VALUES (?, ?, ?)',
      [name, description, display_order || 0]
    );
    res.status(201).json({ id: result.insertId, name, description, display_order: display_order || 0 });
  } catch (err) {
    console.error('Erro ao criar categoria de produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar uma categoria de produto (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { name, description, display_order } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nome da categoria é obrigatório.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE product_categories SET name = ?, description = ?, display_order = ? WHERE id = ?',
      [name, description, display_order || 0, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    res.json({ id, name, description, display_order: display_order || 0 });
  } catch (err) {
    console.error('Erro ao atualizar categoria de produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para deletar uma categoria de produto (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM product_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Erro ao deletar categoria de produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
