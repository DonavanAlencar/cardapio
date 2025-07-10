const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Middleware para verificar se o usuário é admin ou gerente
const authorizeAdminOrManager = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'gerente') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para gerenciar produtos.' });
  }
  next();
};

// Rota para listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.description,
         p.sku,
         p.status,
         p.category_id,
         pc.name as category_name,
         pp.price,
         pi.image_url
       FROM products p
       JOIN product_categories pc ON p.category_id = pc.id
       LEFT JOIN product_prices pp ON p.id = pp.product_id AND pp.end_date IS NULL OR pp.end_date >= CURDATE()
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
       ORDER BY p.name`
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para criar um novo produto (apenas admin/gerente)
router.post('/', auth, authorizeAdminOrManager, async (req, res) => {
  const { category_id, name, description, sku, status } = req.body;
  if (!category_id || !name) {
    return res.status(400).json({ message: 'ID da categoria e nome do produto são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO products (category_id, name, description, sku, status) VALUES (?, ?, ?, ?, ?)',
      [category_id, name, description, sku, status || 'active']
    );
    res.status(201).json({ id: result.insertId, category_id, name, description, sku, status: status || 'active' });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para atualizar um produto (apenas admin/gerente)
router.put('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  const { category_id, name, description, sku, status } = req.body;
  if (!category_id || !name) {
    return res.status(400).json({ message: 'ID da categoria e nome do produto são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE products SET category_id = ?, name = ?, description = ?, sku = ?, status = ? WHERE id = ?',
      [category_id, name, description, sku, status || 'active', id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json({ id, category_id, name, description, sku, status: status || 'active' });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// Rota para deletar um produto (apenas admin/gerente)
router.delete('/:id', auth, authorizeAdminOrManager, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
